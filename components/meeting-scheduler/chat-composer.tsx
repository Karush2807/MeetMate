"use client"

import type React from "react"
import { Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onSelectParticipants: () => void
  disabled: boolean
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onSelectParticipants,
  disabled,
}: ChatComposerProps) {
  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      <Input
        placeholder="Type your meeting request…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 rounded-full bg-card"
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="rounded-full"
        onClick={onSelectParticipants}
        disabled={disabled}
        title="Select participants"
      >
        <Users className="h-4 w-4" />
      </Button>
      <Button
        type="submit"
        size="icon"
        className="rounded-full"
        disabled={disabled || !value.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
