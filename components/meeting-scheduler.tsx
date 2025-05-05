"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Calendar, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      let response = ""

      if (input.toLowerCase().includes("meeting") || input.toLowerCase().includes("schedule")) {
        if (input.toLowerCase().includes("tomorrow") || input.toLowerCase().includes("5pm")) {
          response =
            "✓ I've scheduled your meeting for tomorrow at 5:00 PM. Calendar invites have been sent to all participants. Would you like me to prepare a brief agenda for this meeting?"
        } else if (input.toLowerCase().includes("weekly") || input.toLowerCase().includes("team")) {
          response =
            "✓ I've set up a recurring weekly team meeting every Monday at 10:00 AM. All team members have been invited. Would you like me to add any specific agenda items?"
        } else {
          response =
            "I'd be happy to schedule that meeting for you. Could you provide more details about when you'd like to schedule it and who should attend?"
        }
      } else {
        response =
          "I'm here to help you schedule meetings. Please let me know when and with whom you'd like to meet, and I'll take care of the rest."
      }

      const assistantMessage: Message = { role: "assistant", content: response }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
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
                {message.content}
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
