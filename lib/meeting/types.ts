export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface MeetingDetails {
  title: string
  date: Date
  time: string
  duration?: number
  participants: string[]
  emails?: (string | null)[]
  meetingLink?: string
  documentRequestSent?: boolean
  missingEmailIndex?: number
}
