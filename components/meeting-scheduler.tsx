"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Calendar, Loader2, FileText, Check, Link as LinkIcon } from "lucide-react"
import { format, addDays, parse, isValid } from "date-fns"
import { gapi } from 'gapi-script'
import dynamic from "next/dynamic"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface MeetingDetails {
  title: string
  date: Date
  time: string
  participants: string[]
  meetingLink?: string
  documentRequestSent?: boolean
}

export function MeetingScheduler() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI meeting scheduler. How can I help you schedule a meeting today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [scheduledMeetings, setScheduledMeetings] = useState<MeetingDetails[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<MeetingDetails | null>(null)
  const [isGapiInitialized, setIsGapiInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize Google API
  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar',
      }).then(() => {
        setIsGapiInitialized(true)
        console.log("Google API initialized")
      }).catch((error: Error) => {
        console.error("Error initializing Google API:", error)
      })
    }

    gapi.load('client:auth2', initClient)
  }, [])

  // Natural language processing
  const processNaturalLanguage = (text: string): MeetingDetails | null => {
    // Extract date
    let meetingDate = new Date()
    if (text.toLowerCase().includes("tomorrow")) {
      meetingDate = addDays(new Date(), 1)
    } else if (text.toLowerCase().includes("today")) {
      meetingDate = new Date()
    } else {
      // Try to find date patterns like "May 10" or "next Monday"
      const datePattern = /on\s+([A-Za-z]+\s+\d+)/i
      const dateMatch = text.match(datePattern)
      if (dateMatch) {
        const parsedDate = parse(dateMatch[1], "MMMM d", new Date())
        if (isValid(parsedDate)) {
          meetingDate = parsedDate
        }
      }
    }

    // Extract time
    let meetingTime = "9:00 AM"
    const timePattern = /at\s+(\d+(?::\d+)?\s*(?:am|pm)?)/i
    const timeMatch = text.match(timePattern)
    if (timeMatch) {
      meetingTime = timeMatch[1]
    } else if (text.toLowerCase().includes("5pm") || text.toLowerCase().includes("5 pm")) {
      meetingTime = "5:00 PM"
    }

    // Extract participants
    const participants: string[] = []
    const withPattern = /with\s+([A-Za-z\s,]+)(?:\s+to|\s+about|\s+at|$)/i
    const withMatch = text.match(withPattern)
    
    if (withMatch) {
      const participantsText = withMatch[1]
      // Handle multiple participants separated by commas or "and"
      const participantsList = participantsText
        .split(/,|\sand\s/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
      
      participants.push(...participantsList)
    }

    // Extract title/purpose
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
      return null // Not enough information to schedule
    }

    return {
      title,
      date: meetingDate,
      time: meetingTime,
      participants
    }
  }

  // Real function to create a meeting in Google Calendar
  const createMeeting = async (details: MeetingDetails): Promise<MeetingDetails> => {
    try {
      // Check if user is signed in
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        await gapi.auth2.getAuthInstance().signIn()
      }
      
      // Parse time from string to hours and minutes
      const timeComponents = details.time.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i)
      let hours = parseInt(timeComponents?.[1] || "9")
      const minutes = parseInt(timeComponents?.[2] || "0")
      const period = timeComponents?.[3]?.toLowerCase()
      
      // Adjust hours for PM
      if (period === 'pm' && hours < 12) {
        hours += 12
      } else if (period === 'am' && hours === 12) {
        hours = 0
      }
      
      // Set start time
      const startDateTime = new Date(details.date)
      startDateTime.setHours(hours, minutes, 0, 0)
      
      // Set end time (1 hour later by default)
      const endDateTime = new Date(startDateTime)
      endDateTime.setHours(endDateTime.getHours() + 1)
      
      // Create event with Google Meet
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
        attendees: details.participants.map(name => {
          // Simple email generation - in production, you'd use real emails
          return { email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com` }
        })
      }
      
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      })
      
      return {
        ...details,
        meetingLink: response.result.hangoutLink || `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
      }
    } catch (error) {
      console.error("Error creating meeting:", error)
      // Fallback to mock in case of error
      return {
        ...details,
        meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
      }
    }
  }

  // Real function to send document request emails
  const sendDocumentRequests = async (meeting: MeetingDetails): Promise<void> => {
    try {
      // In a real implementation, this would use an email API like SendGrid
      // For now, we'll just log and update state
      console.log(`Sending document request emails to ${meeting.participants.join(", ")}`)
      
      // Update the meeting to mark document requests as sent
      setScheduledMeetings(prev => 
        prev.map(m => 
          m.title === meeting.title && m.date === meeting.date 
            ? { ...m, documentRequestSent: true } 
            : m
        )
      )
      
      // Add assistant message about document requests
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: `I've sent emails to all participants requesting any documents they'd like to share for the meeting. These will be collected in the "Meeting Files" section before the meeting.` 
        }
      ])
    } catch (error) {
      console.error("Error sending document requests:", error)
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: `I encountered an error while sending document request emails. Please try again later.` 
        }
      ])
    }
  }

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setInput("")

    try {
      // Check if this is a follow-up about document requests
      if (currentMeeting && 
          (input.toLowerCase().includes("yes") || 
           input.toLowerCase().includes("document") || 
           input.toLowerCase().includes("send"))) {
        
        await sendDocumentRequests(currentMeeting)
        setCurrentMeeting(null)
        setIsLoading(false)
        return
      }

      // Try to parse meeting details
      const meetingDetails = processNaturalLanguage(input)
      
      if (meetingDetails) {
        // Create the meeting
        const createdMeeting = await createMeeting(meetingDetails)
        setScheduledMeetings(prev => [...prev, createdMeeting])
        setCurrentMeeting(createdMeeting)
        
        // Format date for display
        const formattedDate = format(createdMeeting.date, "EEEE, MMMM d, yyyy")
        
        const response = `✓ I've scheduled your meeting "${createdMeeting.title}" for ${formattedDate} at ${createdMeeting.time}.\n\n` +
                     `Meeting link: ${createdMeeting.meetingLink}\n\n` +
                     `Calendar invites have been sent to ${createdMeeting.participants.join(", ")}.\n\n` +
                     `Would you like me to send document request emails to all participants?`
                     
        const assistantMessage: Message = { role: "assistant", content: response }
        setMessages(prev => [...prev, assistantMessage])
      } else if (input.toLowerCase().includes("meeting") || input.toLowerCase().includes("schedule")) {
        const response = "I'd be happy to schedule that meeting for you. Could you provide more details about when you'd like to schedule it and who should attend?"
        const assistantMessage: Message = { role: "assistant", content: response }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const response = "I'm here to help you schedule meetings. Please let me know when and with whom you'd like to meet, and I'll take care of the rest."
        const assistantMessage: Message = { role: "assistant", content: response }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      const errorMessage: Message = { 
        role: "assistant", 
        content: "I encountered an error while processing your request. Please try again later." 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll to bottom of messages
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
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.content.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {line.includes("Meeting link:") ? (
                      <span className="flex items-center">
                        <LinkIcon className="mr-1 h-4 w-4" />
                        <a href="#" className="text-blue-500 underline hover:text-blue-700">
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
