import { addDays, isValid, parse } from "date-fns"
import { getDefaultMeetingTime } from "./scheduling"
import type { MeetingDetails } from "./types"

const SYSTEM_PROMPT = (defaultTime: string) =>
  `You are a meeting scheduling assistant. Extract the following information from the user's message:
1. Meeting title (default to "Meeting" if not specified)
2. Date (default to today if not specified)
3. Time (default to "${defaultTime}" if not specified)
4. Duration in minutes (default to 30 if not specified, if user mentions hours, convert to minutes)
5. Participants (array of names, can be empty)

Pay special attention to duration - if user mentions "2 hour meeting", the duration should be 120 minutes.

Format your response as a valid JSON object with these keys: title, date, time, duration, participants.
For date, use YYYY-MM-DD format or special values like "today" or "tomorrow".
For time, use 12-hour format with AM/PM.
For duration, use minutes as a number.
For participants, return an array of strings with names.`

function resolveDate(value?: string): Date {
  if (!value) return new Date()
  const lower = value.toLowerCase()
  if (lower === "tomorrow") return addDays(new Date(), 1)
  if (lower === "today") return new Date()
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

export async function processNaturalLanguage(
  text: string
): Promise<MeetingDetails | null> {
  const defaultTime = getDefaultMeetingTime()

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PPLX_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT(defaultTime) },
          { role: "user", content: text },
        ],
      }),
    })

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) return fallbackProcessNaturalLanguage(text)

    const parsed = JSON.parse(content)
    return {
      title: parsed.title || "Meeting",
      date: resolveDate(parsed.date),
      time: parsed.time || defaultTime,
      duration: parsed.duration || 30,
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
    }
  } catch (error) {
    console.error("Error using Perplexity API:", error)
    return fallbackProcessNaturalLanguage(text)
  }
}

export function fallbackProcessNaturalLanguage(
  text: string
): MeetingDetails | null {
  const lower = text.toLowerCase()

  let meetingDate = new Date()
  if (lower.includes("tomorrow")) {
    meetingDate = addDays(new Date(), 1)
  } else if (lower.includes("today")) {
    meetingDate = new Date()
  } else {
    const dateMatch = text.match(/on\s+([A-Za-z]+\s+\d+)/i)
    if (dateMatch) {
      const parsedDate = parse(dateMatch[1], "MMMM d", new Date())
      if (isValid(parsedDate)) meetingDate = parsedDate
    }
  }

  let meetingTime = getDefaultMeetingTime()
  const timeMatch = text.match(/at\s+(\d+(?::\d+)?\s*(?:am|pm)?)/i)
  if (timeMatch) {
    meetingTime = timeMatch[1]
  } else if (lower.includes("5pm") || lower.includes("5 pm")) {
    meetingTime = "5:00 PM"
  }

  let duration = 30
  const hourMatch = text.match(/(\d+)\s*(?:hour|hr)/i)
  if (hourMatch) {
    duration = parseInt(hourMatch[1]) * 60
  } else {
    const minuteMatch = text.match(/for\s+(\d+)\s*(?:min|minute|minutes)/i)
    if (minuteMatch) duration = parseInt(minuteMatch[1])
  }

  const participants: string[] = []
  const withMatch = text.match(/with\s+([A-Za-z\s,]+)(?:\s+to|\s+about|\s+at|$)/i)
  if (withMatch) {
    participants.push(
      ...withMatch[1]
        .split(/,|\sand\s/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    )
  }

  let title = "Meeting"
  if (lower.includes("about") || lower.includes("to discuss")) {
    const purposeMatch = text.match(/(?:about|to discuss)\s+([^,\.]+)/i)
    if (purposeMatch) title = `Meeting about ${purposeMatch[1].trim()}`
  } else if (participants.length > 0) {
    title = `Meeting with ${participants.join(", ")}`
  }

  return { title, date: meetingDate, time: meetingTime, duration, participants }
}
