"use client"

import { Calendar, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ParticipantSelector from "@/components/ParticipantSelector"
import { useMeetingScheduler } from "@/hooks/use-meeting-scheduler"
import { ChatMessage } from "./chat-message"
import { ChatComposer } from "./chat-composer"

export function MeetingScheduler() {
  const {
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
  } = useMeetingScheduler()

  return (
    <>
      <Card className="flex h-[520px] flex-col overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-secondary/30 px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </span>
            AI Meeting Scheduler
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-secondary/60 px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="border-t border-border bg-secondary/30 p-3">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onSelectParticipants={() => setIsParticipantSelectorOpen(true)}
            disabled={isLoading}
          />
        </CardFooter>
      </Card>

      <ParticipantSelector
        isOpen={isParticipantSelectorOpen}
        onClose={() => setIsParticipantSelectorOpen(false)}
        onSelectParticipants={handleParticipantSelect}
        initialSelectedParticipants={selectedParticipants}
      />
    </>
  )
}
