import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 text-foreground",
        className
      )}
      aria-label="MeetMate home"
    >
      <span className="text-[1.05rem] font-semibold tracking-tight">
        MeetMate<span className="text-primary">.</span>
      </span>
    </Link>
  )
}
