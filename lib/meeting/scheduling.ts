import { addHours, format, setMinutes } from "date-fns"
import type { MeetingDetails } from "./types"

export function getDefaultMeetingTime(): string {
  const nextHour = addHours(new Date(), 1)
  return format(setMinutes(nextHour, 0), "h:mm a")
}

export function validateMeetingTime(proposedTime: Date): {
  isValid: boolean
  message: string
} {
  if (proposedTime < new Date()) {
    return {
      isValid: false,
      message: `The proposed meeting time (${format(
        proposedTime,
        "h:mm a"
      )}) has already passed. Please choose a future time.`,
    }
  }
  return { isValid: true, message: "" }
}

export function formatSuggestedTimes(times: Date[]): string {
  if (times.length === 0) return "No alternative times available today."
  return times.map((time) => format(time, "h:mm a")).join(", ")
}

export function getMeetingStartEnd(details: MeetingDetails): {
  startDateTime: Date
  endDateTime: Date
} {
  const timeComponents = details.time.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i)
  let hours = parseInt(timeComponents?.[1] || "9")
  const minutes = parseInt(timeComponents?.[2] || "0")
  const period = timeComponents?.[3]?.toLowerCase()
  if (period === "pm" && hours < 12) hours += 12
  else if (period === "am" && hours === 12) hours = 0

  const startDateTime = new Date(details.date)
  startDateTime.setHours(hours, minutes, 0, 0)
  const endDateTime = new Date(startDateTime)
  endDateTime.setMinutes(endDateTime.getMinutes() + (details.duration || 30))

  return { startDateTime, endDateTime }
}
