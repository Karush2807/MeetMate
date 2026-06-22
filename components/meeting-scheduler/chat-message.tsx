import { Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/meeting/types"

const MEETING_LINK_PREFIX = "Meeting link: "

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-bl-sm border border-border bg-secondary/60 text-foreground"
        )}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line.includes(MEETING_LINK_PREFIX) ? (
              <span className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href={line.replace(MEETING_LINK_PREFIX, "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-primary underline underline-offset-2"
                >
                  {line.replace(MEETING_LINK_PREFIX, "")}
                </a>
              </span>
            ) : (
              line
            )}
          </p>
        ))}
      </div>
    </div>
  )
}
