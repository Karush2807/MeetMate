import { getMeetingStartEnd } from "./scheduling"
import type { MeetingDetails } from "./types"

const SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly"

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  "https://www.googleapis.com/discovery/v1/apis/people/v1/rest",
]

const PEOPLE_DISCOVERY =
  "https://www.googleapis.com/discovery/v1/apis/people/v1/rest"

async function loadGapi() {
  const { gapi } = await import("gapi-script")
  return gapi
}

export async function initGoogleApi(): Promise<void> {
  if (typeof window === "undefined") return
  const gapi = await loadGapi()
  gapi.load("client:auth2", () => {
    gapi.client
      .init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .catch((error: Error) => {
        console.error("Error initializing Google API:", error)
      })
  })
}

export async function getAuthInstance() {
  const gapi = await loadGapi()
  let authInstance =
    gapi.auth2 && gapi.auth2.getAuthInstance ? gapi.auth2.getAuthInstance() : null

  if (!authInstance) {
    await new Promise<void>((resolve) => {
      gapi.load("auth2", () => {
        gapi.auth2
          .init({ client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, scope: SCOPES })
          .then(() => resolve())
          .catch((error: unknown) => {
            console.error("Error initializing auth2:", error)
            resolve()
          })
      })
    })
    authInstance = gapi.auth2.getAuthInstance()
  }
  return authInstance
}

async function ensureSignedIn() {
  const authInstance = await getAuthInstance()
  if (authInstance && !authInstance.isSignedIn.get()) {
    await authInstance.signIn()
  }
  return authInstance
}

export async function createGoogleContact(
  name: string,
  email: string
): Promise<boolean> {
  try {
    const gapi = await loadGapi()
    const authInstance = await getAuthInstance()
    if (!authInstance) return false
    if (!authInstance.isSignedIn.get()) await authInstance.signIn()

    if (!gapi.client.people) {
      await gapi.client.load(PEOPLE_DISCOVERY)
      if (!gapi.client.people) return false
    }

    const nameParts = name.trim().split(/\s+/)
    const givenName = nameParts[0] || name
    const familyName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    const response = await gapi.client.people.people.createContact({
      personFields: "names,emailAddresses",
      resource: {
        names: [{ givenName, familyName }],
        emailAddresses: [{ value: email }],
        memberships: [
          {
            contactGroupMembership: {
              contactGroupResourceName: "contactGroups/myContacts",
            },
          },
        ],
      },
    })

    return response.status === 200
  } catch (error) {
    console.error("Error creating Google contact:", error)
    return false
  }
}

export async function resolveContactEmail(name: string): Promise<string | null> {
  try {
    const gapi = await loadGapi()
    await ensureSignedIn()
    if (!gapi.client.people) return null

    try {
      await gapi.client.people.people.searchContacts({
        query: "",
        readMask: "names,emailAddresses",
      })
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (warmupErr) {
      console.warn("Warmup search request failed, continuing anyway:", warmupErr)
    }

    const response = await gapi.client.people.people.searchContacts({
      query: name,
      readMask: "names,emailAddresses",
    })
    const results = response.result.results || []
    if (results.length > 0 && results[0].person?.emailAddresses?.length > 0) {
      return results[0].person.emailAddresses[0].value || null
    }
    return null
  } catch (error) {
    console.error("Error resolving contact:", error)
    return null
  }
}

export async function checkForOverlaps(
  startDateTime: Date,
  endDateTime: Date
): Promise<{ hasOverlap: boolean; availableTimes: Date[] }> {
  try {
    const gapi = await loadGapi()
    await ensureSignedIn()

    const timeMin = new Date(startDateTime)
    timeMin.setHours(0, 0, 0, 0)
    const timeMax = new Date(startDateTime)
    timeMax.setHours(23, 59, 59, 999)

    const response = await gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    })

    const events = response.result.items || []
    let hasOverlap = false
    for (const event of events) {
      const eventStart = new Date(event.start.dateTime || event.start.date)
      const eventEnd = new Date(event.end.dateTime || event.end.date)
      if (startDateTime < eventEnd && endDateTime > eventStart) {
        hasOverlap = true
        break
      }
    }

    const availableTimes: Date[] = []
    if (hasOverlap) {
      const businessStart = new Date(startDateTime)
      businessStart.setHours(9, 0, 0, 0)
      const now = new Date()
      const checkTime = now > businessStart ? now : businessStart
      const endOfDay = new Date(startDateTime)
      endOfDay.setHours(18, 0, 0, 0)
      const meetingDuration =
        (endDateTime.getTime() - startDateTime.getTime()) / 60000

      while (checkTime < endOfDay) {
        const potentialEndTime = new Date(checkTime)
        potentialEndTime.setMinutes(potentialEndTime.getMinutes() + meetingDuration)

        let isAvailable = true
        for (const event of events) {
          const eventStart = new Date(event.start.dateTime || event.start.date)
          const eventEnd = new Date(event.end.dateTime || event.end.date)
          if (checkTime < eventEnd && potentialEndTime > eventStart) {
            isAvailable = false
            checkTime.setTime(eventEnd.getTime())
            break
          }
        }

        if (isAvailable) {
          availableTimes.push(new Date(checkTime))
          if (availableTimes.length >= 3) break
          checkTime.setMinutes(checkTime.getMinutes() + 30)
        }
      }
    }

    return { hasOverlap, availableTimes }
  } catch (error) {
    console.error("Error checking for meeting overlaps:", error)
    return { hasOverlap: false, availableTimes: [] }
  }
}

export async function insertCalendarEvent(
  details: MeetingDetails,
  emails: (string | null)[]
): Promise<string> {
  const gapi = await loadGapi()
  await ensureSignedIn()

  const { startDateTime, endDateTime } = getMeetingStartEnd(details)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const event = {
    summary: details.title,
    description: "Meeting scheduled via MeetMate",
    start: { dateTime: startDateTime.toISOString(), timeZone },
    end: { dateTime: endDateTime.toISOString(), timeZone },
    conferenceData: {
      createRequest: { requestId: `meetmate-${Date.now()}` },
    },
    attendees: details.participants.map((name, idx) => ({
      email: emails[idx]!,
      displayName: name,
    })),
  }

  const response = await gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: "all",
  })

  return (
    response.result.hangoutLink ||
    `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
  )
}
