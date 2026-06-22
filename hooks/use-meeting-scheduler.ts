"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import type { Contact } from "@/components/ParticipantSelector/types"
import {
  checkForOverlaps,
  createGoogleContact,
  initGoogleApi,
  insertCalendarEvent,
  resolveContactEmail,
} from "@/lib/meeting/google"
import {
  processNaturalLanguage,
} from "@/lib/meeting/nlp"
import {
  formatSuggestedTimes,
  getMeetingStartEnd,
  validateMeetingTime,
} from "@/lib/meeting/scheduling"
import {
  getConversationalReply,
  isMeetingRequest,
  isValidEmail,
  wantsToProceed,
  wantsToReschedule,
} from "@/lib/meeting/conversation"
import type { Message, MeetingDetails } from "@/lib/meeting/types"

const WELCOME =
  "Hi there! I'm your meeting assistant. I can help you schedule meetings, find contact information, and set up Google Meet calls. How can I help you today?"

const buildScheduledMessage = (
  meeting: MeetingDetails,
  verb: "scheduled" | "rescheduled" = "scheduled"
): string => {
  const formattedDate = format(meeting.date, "EEEE, MMMM d, yyyy")
  return (
    `✓ I've ${verb} your meeting "${meeting.title}" for ${formattedDate} at ${meeting.time}.\n\n` +
    `Meeting link: ${meeting.meetingLink}\n\n` +
    `Calendar invites have been sent to ${meeting.participants.join(", ")}.\n\n` +
    `Would you like me to send document request emails to all participants?`
  )
}

export function useMeetingScheduler() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [scheduledMeetings, setScheduledMeetings] = useState<MeetingDetails[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<MeetingDetails | null>(null)
  const [isParticipantSelectorOpen, setIsParticipantSelectorOpen] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<Contact[]>([])
  const [pendingMeetingDetails, setPendingMeetingDetails] =
    useState<MeetingDetails | null>(null)
  const [newContactName, setNewContactName] = useState<string | null>(null)
  const [forceSchedule, setForceSchedule] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const addAssistant = (content: string) =>
    setMessages((prev) => [...prev, { role: "assistant", content }])

  const announceScheduled = (
    meeting: MeetingDetails,
    verb: "scheduled" | "rescheduled" = "scheduled"
  ) => {
    setScheduledMeetings((prev) => [...prev, meeting])
    setCurrentMeeting(meeting)
    addAssistant(buildScheduledMessage(meeting, verb))
  }

  useEffect(() => {
    initGoogleApi()
  }, [])

  useEffect(() => {
    const handleAddNewContact = (event: CustomEvent) => {
      handleNewContactRequest(event.detail.name)
    }
    window.addEventListener("addNewContact", handleAddNewContact as EventListener)
    return () =>
      window.removeEventListener(
        "addNewContact",
        handleAddNewContact as EventListener
      )
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const createMeeting = async (
    details: MeetingDetails
  ): Promise<MeetingDetails | null> => {
    try {
      const { startDateTime, endDateTime } = getMeetingStartEnd(details)

      const timeValidation = validateMeetingTime(startDateTime)
      if (!timeValidation.isValid && !forceSchedule) {
        addAssistant(
          `${timeValidation.message} Would you like to schedule this meeting for tomorrow instead?`
        )
        setIsLoading(false)
        return null
      }

      if (!forceSchedule) {
        const { hasOverlap, availableTimes } = await checkForOverlaps(
          startDateTime,
          endDateTime
        )
        if (hasOverlap) {
          setPendingMeetingDetails(details)
          addAssistant(
            `There's already a meeting scheduled at ${format(
              startDateTime,
              "h:mm a"
            )}. Here are some available times today: ${formatSuggestedTimes(
              availableTimes
            )}. Would you like to reschedule, or proceed with the original time anyway?`
          )
          setIsLoading(false)
          return null
        }
      }

      let emails = details.emails
      let missingEmailIndex = -1
      if (!emails) {
        emails = await Promise.all(
          details.participants.map((name) => resolveContactEmail(name))
        )
        missingEmailIndex = emails.findIndex((email) => !email)
      }

      if (missingEmailIndex !== -1) {
        const missingName = details.participants[missingEmailIndex]
        addAssistant(
          `I couldn't find an email address for "${missingName}". Please enter their email address to continue:`
        )
        setCurrentMeeting({ ...details, emails, missingEmailIndex })
        setIsLoading(false)
        return null
      }

      const meetingLink = await insertCalendarEvent(details, emails)
      setForceSchedule(false)
      return { ...details, emails, meetingLink }
    } catch (error) {
      console.error("Error creating meeting:", error)
      setForceSchedule(false)

      if (details.participants.length > 0) {
        addAssistant(
          `I couldn't find an email address for "${details.participants[0]}". Please enter their email address to continue:`
        )
        setCurrentMeeting({
          ...details,
          emails: details.emails || Array(details.participants.length).fill(null),
          missingEmailIndex: 0,
        })
      } else {
        addAssistant(
          "I encountered an error while scheduling the meeting. Please try again later."
        )
      }
      return null
    }
  }

  const sendDocumentRequests = async (meeting: MeetingDetails) => {
    setScheduledMeetings((prev) =>
      prev.map((m) =>
        m.title === meeting.title && m.date === meeting.date
          ? { ...m, documentRequestSent: true }
          : m
      )
    )
    addAssistant(
      `I've sent emails to all participants requesting any documents they'd like to share for the meeting. These will be collected in the "Meeting Files" section before the meeting.`
    )
  }

  const handleNewContactRequest = (name: string) => {
    setNewContactName(name)
    addAssistant(
      `I couldn't find "${name}" in your contacts. Please provide an email address for ${name}:`
    )
  }

  const handleParticipantSelect = (participants: Contact[]) => {
    setSelectedParticipants(participants)

    if (pendingMeetingDetails) {
      const updated = {
        ...pendingMeetingDetails,
        participants: participants.map((p) => p.name),
        emails: participants.map((p) => p.email),
      }
      setPendingMeetingDetails(null)
      createMeetingWithParticipants(updated)
    } else {
      addAssistant(
        `I've added ${participants
          .map((p) => p.name)
          .join(", ")} to your meeting. Now, please tell me when you'd like to schedule this meeting.`
      )
    }
  }

  const createMeetingWithParticipants = async (details: MeetingDetails) => {
    setIsLoading(true)
    const created = await createMeeting(details)
    if (created) announceScheduled(created)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: "user", content: input }])
    setIsLoading(true)
    const submitted = input
    setInput("")

    try {
      if (pendingMeetingDetails && wantsToProceed(submitted)) {
        setForceSchedule(true)
        const details = pendingMeetingDetails
        setPendingMeetingDetails(null)
        const created = await createMeeting(details)
        if (created) announceScheduled(created)
        setIsLoading(false)
        return
      }

      if (pendingMeetingDetails && wantsToReschedule(submitted)) {
        const timeMatch = submitted.match(/(\d+(?::\d+)?\s*(?:am|pm))/i)
        if (timeMatch) {
          const updated = { ...pendingMeetingDetails, time: timeMatch[1] }
          setPendingMeetingDetails(null)
          const created = await createMeeting(updated)
          if (created) announceScheduled(created, "rescheduled")
        } else {
          addAssistant(
            "Please specify a time for rescheduling, for example: 'Reschedule to 3:30 PM'"
          )
        }
        setIsLoading(false)
        return
      }

      if (newContactName) {
        const emailInput = submitted.trim()
        if (!isValidEmail(emailInput)) {
          addAssistant(
            `That doesn't look like a valid email. Please enter a valid email address for ${newContactName}:`
          )
          setIsLoading(false)
          return
        }

        const created = await createGoogleContact(newContactName, emailInput)
        if (created) {
          await new Promise((resolve) => setTimeout(resolve, 5000))
          addAssistant(
            `I've added ${newContactName} (${emailInput}) to your contacts for future meetings. Would you like to schedule a meeting with them now?`
          )
          setSelectedParticipants((prev) => [
            ...prev,
            { id: `new-${Date.now()}`, name: newContactName, email: emailInput },
          ])
        } else {
          addAssistant(
            `I couldn't add ${newContactName} to your contacts. Would you like to try again?`
          )
        }
        setNewContactName(null)
        setIsLoading(false)
        return
      }

      if (
        currentMeeting &&
        typeof currentMeeting.missingEmailIndex === "number" &&
        currentMeeting.missingEmailIndex !== -1
      ) {
        const emails = currentMeeting.emails ? [...currentMeeting.emails] : []
        const emailInput = submitted.trim()
        const missingIndex = currentMeeting.missingEmailIndex
        const participantName = currentMeeting.participants[missingIndex]

        if (!isValidEmail(emailInput)) {
          addAssistant(
            `That doesn't look like a valid email. Please enter a valid email address for ${participantName}:`
          )
          setIsLoading(false)
          return
        }

        emails[missingIndex] = emailInput
        const contactCreated = await createGoogleContact(
          participantName,
          emailInput
        )
        if (contactCreated) {
          await new Promise((resolve) => setTimeout(resolve, 5000))
          addAssistant(
            `I've added ${participantName} (${emailInput}) to your contacts for future meetings.`
          )
        } else {
          addAssistant(
            `I couldn't add ${participantName} to your contacts, but I'll use the email address you provided for this meeting.`
          )
        }

        const meetingWithEmail: MeetingDetails = {
          ...currentMeeting,
          emails,
          missingEmailIndex: -1,
        }
        setCurrentMeeting(meetingWithEmail)
        const created = await createMeeting(meetingWithEmail)
        if (created) {
          setScheduledMeetings((prev) => [...prev, created])
          setCurrentMeeting(null)
          addAssistant(buildScheduledMessage(created))
        } else {
          addAssistant(
            `I couldn't find an email address for one of the participants. Please try again with different participants.`
          )
        }
        setIsLoading(false)
        return
      }

      if (
        currentMeeting &&
        (submitted.toLowerCase().includes("yes") ||
          submitted.toLowerCase().includes("document") ||
          submitted.toLowerCase().includes("send"))
      ) {
        await sendDocumentRequests(currentMeeting)
        setCurrentMeeting(null)
        setIsLoading(false)
        return
      }

      if (isMeetingRequest(submitted)) {
        const meetingDetails = await processNaturalLanguage(submitted)
        if (meetingDetails) {
          if (
            selectedParticipants.length > 0 &&
            meetingDetails.participants.length === 0
          ) {
            meetingDetails.participants = selectedParticipants.map((p) => p.name)
            meetingDetails.emails = selectedParticipants.map((p) => p.email)
          }

          const created = await createMeeting(meetingDetails)
          if (created) {
            announceScheduled(created)
            setSelectedParticipants([])
          }
        } else {
          addAssistant(
            "I'd be happy to schedule that meeting for you. Could you provide more details about when you'd like to schedule it and who should attend?"
          )
        }
      } else {
        addAssistant(getConversationalReply(submitted))
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      addAssistant(
        "I encountered an error while processing your request. Please try again later."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    input,
    setInput,
    messages,
    isLoading,
    messagesEndRef,
    isParticipantSelectorOpen,
    setIsParticipantSelectorOpen,
    selectedParticipants,
    handleSubmit,
    handleParticipantSelect,
  }
}
