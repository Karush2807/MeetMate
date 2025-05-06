"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Calendar, Loader2, Link as LinkIcon } from "lucide-react"
import { format, addDays, parse, isValid } from "date-fns"
import Groq from "groq-sdk"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface MeetingDetails {
  title: string
  date: Date
  time: string
  participants: string[]
  emails?: (string | null)[]
  meetingLink?: string
  documentRequestSent?: boolean
  missingEmailIndex?: number // Track which participant needs an email
}

export function MeetingScheduler() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm here to help you schedule meetings. Please let me know when and with whom you'd like to meet, and I'll take care of the rest.",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [scheduledMeetings, setScheduledMeetings] = useState<MeetingDetails[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<MeetingDetails | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Initialize Groq client
  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    // Note: In a browser environment, you might need to use:
    dangerouslyAllowBrowser: true,
  })

  // --- Google API Initialization ---
  useEffect(() => {
    const loadGapi = async () => {
      if (typeof window !== "undefined") {
        try {
          const { gapi } = await import('gapi-script')
          const initClient = () => {
            gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
                'https://www.googleapis.com/discovery/v1/apis/people/v1/rest'
              ],
              scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly',
            }).then(() => {
              console.log("Google API client initialized!")
            }).catch((error: Error) => {
              console.error("Error initializing Google API:", error)
            })
          }
          gapi.load('client:auth2', initClient)
        } catch (error) {
          console.error("Error loading gapi:", error)
        }
      }
    }
    loadGapi()
  }, [])

  // --- Utility: Ensure Auth2 Instance ---
  const getAuthInstance = async () => {
    const { gapi } = await import('gapi-script')
    let authInstance = gapi.auth2 && gapi.auth2.getAuthInstance ? gapi.auth2.getAuthInstance() : null
    console.log("getAuthInstance: current value:", authInstance)
    if (!authInstance) {
      console.log("Auth instance not found, initializing auth2...")
      await new Promise<void>((resolve) => {
        gapi.load('auth2', () => {
          gapi.auth2.init({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly',
          }).then(() => {
            console.log("auth2 initialized!")
            resolve()
          })
        })
      })
      authInstance = gapi.auth2.getAuthInstance()
      console.log("Auth instance after init:", authInstance)
    }
    return authInstance
  }

  // --- Create Google Contact ---
  const createGoogleContact = async (name: string, email: string): Promise<boolean> => {
    try {
      const { gapi } = await import('gapi-script')
      const authInstance = await getAuthInstance()
      if (authInstance && !authInstance.isSignedIn.get()) {
        await authInstance.signIn()
      }
      console.log(`Creating Google contact for ${name} with email ${email}...`)
      
      const response = await gapi.client.people.people.createContact({
        resource: {
          names: [{ givenName: name }],
          emailAddresses: [{ value: email }]
        }
      })
      
      console.log("Created Google contact:", response)
      return true
    } catch (error) {
      console.error("Error creating Google contact:", error)
      return false
    }
  }

  // --- NLP: Parse Meeting Request using Groq ---
  const processNaturalLanguage = async (text: string): Promise<MeetingDetails | null> => {
    try {
      console.log("Processing input with Groq:", text)
      
      // Use Groq API to parse the meeting request
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that helps parse meeting requests. Extract the meeting details including title, date, time, and participants from the user's message. Respond in JSON format with keys: title, date, time, participants (array)."
          },
          {
            role: "user",
            content: text
          }
        ],
        model: "llama3-8b-8192",
        response_format: { type: "json_object" }
      })
      
      const responseContent = chatCompletion.choices[0]?.message?.content || ""
      console.log("Groq response:", responseContent)
      
      try {
        const parsedResponse = JSON.parse(responseContent)
        
        // Fallback to basic parsing if Groq doesn't return expected format
        if (!parsedResponse.participants || !Array.isArray(parsedResponse.participants)) {
          return fallbackProcessNaturalLanguage(text)
        }
        
        // Convert date string to Date object
        let meetingDate = new Date()
        if (parsedResponse.date) {
          if (parsedResponse.date.toLowerCase() === "tomorrow") {
            meetingDate = addDays(new Date(), 1)
          } else if (parsedResponse.date.toLowerCase() === "today") {
            meetingDate = new Date()
          } else {
            try {
              meetingDate = new Date(parsedResponse.date)
              if (isNaN(meetingDate.getTime())) {
                meetingDate = new Date()
              }
            } catch (e) {
              meetingDate = new Date()
            }
          }
        }
        
        return {
          title: parsedResponse.title || "Meeting",
          date: meetingDate,
          time: parsedResponse.time || "9:00 AM",
          participants: parsedResponse.participants
        }
      } catch (e) {
        console.error("Error parsing Groq response:", e)
        return fallbackProcessNaturalLanguage(text)
      }
    } catch (error) {
      console.error("Error using Groq API:", error)
      return fallbackProcessNaturalLanguage(text)
    }
  }
  
  // Fallback to basic regex parsing if Groq API fails
  const fallbackProcessNaturalLanguage = (text: string): MeetingDetails | null => {
    console.log("Using fallback parsing for:", text)
    let meetingDate = new Date()
    if (text.toLowerCase().includes("tomorrow")) {
      meetingDate = addDays(new Date(), 1)
    } else if (text.toLowerCase().includes("today")) {
      meetingDate = new Date()
    } else {
      const datePattern = /on\s+([A-Za-z]+\s+\d+)/i
      const dateMatch = text.match(datePattern)
      if (dateMatch) {
        const parsedDate = parse(dateMatch[1], "MMMM d", new Date())
        if (isValid(parsedDate)) {
          meetingDate = parsedDate
        }
      }
    }

    let meetingTime = "9:00 AM"
    const timePattern = /at\s+(\d+(?::\d+)?\s*(?:am|pm)?)/i
    const timeMatch = text.match(timePattern)
    if (timeMatch) {
      meetingTime = timeMatch[1]
    } else if (text.toLowerCase().includes("5pm") || text.toLowerCase().includes("5 pm")) {
      meetingTime = "5:00 PM"
    }

    const participants: string[] = []
    const withPattern = /with\s+([A-Za-z\s,]+)(?:\s+to|\s+about|\s+at|$)/i
    const withMatch = text.match(withPattern)
    if (withMatch) {
      const participantsText = withMatch[1]
      const participantsList = participantsText
        .split(/,|\sand\s/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
      participants.push(...participantsList)
    }

    let title = "Meeting"
    if (text.toLowerCase().includes("about") || text.toLowerCase().includes("to discuss")) {
      const purposePattern = /(?:about|to discuss)\s+([^,\.]+)/i
      const purposeMatch = text.match(purposePattern)
      if (purposeMatch) {
        title = `Meeting about ${purposeMatch[1].trim()}`
      }
    } else if (participants.length > 0) {
      title = `Meeting with ${participants.join(", ")}`
    }

    if (!participants.length && !title.includes("with")) {
      console.log("Not enough info to schedule (no participants/title):", text)
      return null
    }

    console.log("Parsed meeting details:", { title, meetingDate, meetingTime, participants })
    return {
      title,
      date: meetingDate,
      time: meetingTime,
      participants
    }
  }

  // --- Contact Resolution ---
  const resolveContactEmail = async (name: string): Promise<string | null> => {
    try {
      const { gapi } = await import('gapi-script')
      const authInstance = await getAuthInstance()
      if (authInstance && !authInstance.isSignedIn.get()) {
        await authInstance.signIn()
      }
      console.log("Searching contacts for:", name)
      const response = await gapi.client.people.people.searchContacts({
        query: name,
        readMask: 'names,emailAddresses'
      })
      console.log("Contact search response:", response)
      const results = response.result.results || []
      if (results.length > 0 && results[0].person?.emailAddresses?.length > 0) {
        const foundEmail = results[0].person.emailAddresses[0].value || null
        console.log(`Found email for ${name}: ${foundEmail}`)
        return foundEmail
      }
      console.log(`No contact found for ${name}`)
      return null
    } catch (error) {
      console.error("Error resolving contact:", error)
      return null
    }
  }

  // --- Meeting Scheduling ---
  const createMeeting = async (details: MeetingDetails): Promise<MeetingDetails | null> => {
    try {
      const { gapi } = await import('gapi-script')
      const authInstance = await getAuthInstance()
      if (authInstance && !authInstance.isSignedIn.get()) {
        console.log("Signing in user for calendar event...")
        await authInstance.signIn()
      }
      console.log("Resolving attendee emails...")

      // If emails already exist on details (user provided), use them
      let emails = details.emails
      let missingEmailIndex = -1

      if (!emails) {
        emails = await Promise.all(
          details.participants.map(async (name) => await resolveContactEmail(name))
        )
        missingEmailIndex = emails.findIndex(email => !email)
      }

      // If any email is missing, prompt the user
      if (missingEmailIndex !== -1) {
        const missingName = details.participants[missingEmailIndex]
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't find an email address for "${missingName}". Please enter their email address to continue:`
          }
        ])
        setCurrentMeeting({
          ...details,
          emails,
          missingEmailIndex
        })
        setIsLoading(false)
        return null // Early exit
      }

      // Log each email being invited
      emails.forEach((email, idx) => {
        console.log(`Sending invite to: ${email} (Name: ${details.participants[idx]})`)
      })

      // Build attendees array for Google API
      const resolvedAttendees = details.participants.map((name, idx) => ({
        email: emails![idx]!,
        displayName: name
      }))
      console.log("Resolved attendees:", resolvedAttendees)

      const timeComponents = details.time.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i)
      let hours = parseInt(timeComponents?.[1] || "9")
      const minutes = parseInt(timeComponents?.[2] || "0")
      const period = timeComponents?.[3]?.toLowerCase()
      if (period === 'pm' && hours < 12) hours += 12
      else if (period === 'am' && hours === 12) hours = 0
      const startDateTime = new Date(details.date)
      startDateTime.setHours(hours, minutes, 0, 0)
      const endDateTime = new Date(startDateTime)
      endDateTime.setHours(endDateTime.getHours() + 1)
      console.log("Creating calendar event:", { startDateTime, endDateTime })

      const event = {
        summary: details.title,
        description: 'Meeting scheduled via MeetMate',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        conferenceData: {
          createRequest: {
            requestId: `meetmate-${Date.now()}`
          }
        },
        attendees: resolvedAttendees
      }
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      })
      console.log("Calendar event response:", response)
      return {
        ...details,
        emails,
        meetingLink: response.result.hangoutLink || `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
      }
    } catch (error) {
      console.error("Error creating meeting:", error)
      return null
    }
  }

  // --- Document Request (Mock) ---
  const sendDocumentRequests = async (meeting: MeetingDetails): Promise<void> => {
    try {
      setScheduledMeetings(prev =>
        prev.map(m =>
          m.title === meeting.title && m.date === meeting.date
            ? { ...m, documentRequestSent: true }
            : m
        )
      )
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I've sent emails to all participants requesting any documents they'd like to share for the meeting. These will be collected in the "Meeting Files" section before the meeting.`
        }
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I encountered an error while sending document request emails. Please try again later.`
        }
      ])
    }
  }

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: "user", content: input }])
    setIsLoading(true)
    setInput("")

    try {
      // If we're waiting for a missing email, use this input as the email for the missing participant
      if (
        currentMeeting &&
        typeof currentMeeting.missingEmailIndex === "number" &&
        currentMeeting.missingEmailIndex !== -1
      ) {
        const emails = currentMeeting.emails ? [...currentMeeting.emails] : []
        const emailInput = input.trim()
        const missingIndex = currentMeeting.missingEmailIndex
        const participantName = currentMeeting.participants[missingIndex]
        
        // Validate email format
        if (!/\S+@\S+\.\S+/.test(emailInput)) {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `That doesn't look like a valid email. Please enter a valid email address:`
            }
          ])
          setIsLoading(false)
          return
        }
        
        // Save the email
        emails[missingIndex] = emailInput
        
        // Create contact in Google Contacts
        const contactCreated = await createGoogleContact(participantName, emailInput)
        
        if (contactCreated) {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `I've added ${participantName} (${emailInput}) to your contacts for future meetings.`
            }
          ])
        }
        
        // Try to create the meeting again with the provided email
        const meetingWithEmail: MeetingDetails = {
          ...currentMeeting,
          emails,
          missingEmailIndex: -1
        }
        setCurrentMeeting(meetingWithEmail)
        const createdMeeting = await createMeeting(meetingWithEmail)
        if (createdMeeting) {
          setScheduledMeetings(prev => [...prev, createdMeeting])
          setCurrentMeeting(null)
          const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy")
          const response = `✓ I've scheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
            `Meeting link: ${createdMeeting.meetingLink}\n\n` +
            `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
            `Would you like me to send document request emails to all participants?`
          setMessages(prev => [...prev, { role: "assistant", content: response }])
        }
        setIsLoading(false)
        setInput("")
        return
      }

      // Document request follow-up
      if (currentMeeting &&
        (input.toLowerCase().includes("yes") ||
          input.toLowerCase().includes("document") ||
          input.toLowerCase().includes("send"))) {
        await sendDocumentRequests(currentMeeting)
        setCurrentMeeting(null)
        setIsLoading(false)
        return
      }
      
      // Normal flow: parse and create meeting
      const meetingDetails = await processNaturalLanguage(input)
      if (meetingDetails) {
        console.log("About to create meeting with details:", meetingDetails)
        const createdMeeting = await createMeeting(meetingDetails)
        if (createdMeeting) {
          setScheduledMeetings(prev => [...prev, createdMeeting])
          setCurrentMeeting(createdMeeting)
          const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy")
          const response = `✓ I've scheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
            `Meeting link: ${createdMeeting.meetingLink}\n\n` +
            `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
            `Would you like me to send document request emails to all participants?`
          setMessages(prev => [...prev, { role: "assistant", content: response }])
        }
      } else if (input.toLowerCase().includes("meeting") || input.toLowerCase().includes("schedule")) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I'd be happy to schedule that meeting for you. Could you provide more details about when you'd like to schedule it and who should attend?"
        }])
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I'm here to help you schedule meetings. Please let me know when and with whom you'd like to meet, and I'll take care of the rest."
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered an error while processing your request. Please try again later."
      }])
      console.error("Error in handleSubmit:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <Card className="flex h-[500px] flex-col">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          AI Meeting Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
              >
                {message.content.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {line.includes("Meeting link:") ? (
                      <span className="flex items-center">
                        <LinkIcon className="mr-1 h-4 w-4" />
                        <a href={line.replace("Meeting link: ", "")} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">
                          {line.replace("Meeting link: ", "")}
                        </a>
                      </span>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] items-center rounded-lg bg-muted px-4 py-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Type your meeting request..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
