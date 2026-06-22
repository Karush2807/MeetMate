const GREETINGS = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
]

export function getConversationalReply(userInput: string): string {
  const input = userInput.toLowerCase()

  if (GREETINGS.some((greeting) => input.includes(greeting))) {
    return "Hello! How can I help you schedule meetings today?"
  }

  if (input.includes("thank")) {
    return "You're welcome! Is there anything else you need help with?"
  }

  if (input.includes("bye") || input.includes("goodbye")) {
    return "Goodbye! Feel free to come back when you need to schedule another meeting."
  }

  if (input.includes("what can you do") || input.includes("help me")) {
    return "I can help you schedule meetings by understanding natural language requests. Just tell me who you want to meet with, when, and for how long. I'll create a Google Meet link and send calendar invites to all participants. I can also save new contacts for future meetings."
  }

  if (
    !input.includes("meet") &&
    !input.includes("schedule") &&
    !input.includes("appointment") &&
    !input.includes("call") &&
    !input.includes("with")
  ) {
    return "I'm your meeting scheduling assistant. I can help you set up meetings with Google Meet. Please let me know who you'd like to meet with and when."
  }

  return "I'm not sure I understand. Could you please provide details about when you'd like to schedule a meeting and with whom?"
}

export function isMeetingRequest(input: string): boolean {
  const lower = input.toLowerCase()
  return (
    lower.includes("meet") ||
    lower.includes("schedule") ||
    lower.includes("appointment") ||
    (lower.includes("with") && lower.includes("at"))
  )
}

export function wantsToProceed(input: string): boolean {
  const lower = input.toLowerCase()
  return (
    lower.includes("proceed") ||
    lower.includes("original") ||
    lower.includes("anyway") ||
    lower.includes("yes")
  )
}

export function wantsToReschedule(input: string): boolean {
  const lower = input.toLowerCase()
  return lower.includes("reschedule") || lower.includes("different time")
}

export const isValidEmail = (value: string): boolean =>
  /\S+@\S+\.\S+/.test(value)
