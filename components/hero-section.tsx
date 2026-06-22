"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Calendar, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrustMarquee } from "@/components/trust-marquee"

const PROMPT =
  "Schedule a meeting with Team UNIT13 at 5pm tomorrow about the product roadmap."
const REPLY =
  "Meeting with UNIT13 booked for tomorrow at 5:00 PM. Calendar invite sent · agenda attached."

const bullets = [
  "Natural language input",
  "Calendar integration",
  "Smart follow-ups",
]

export function HeroSection() {
  const [typed, setTyped] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [showReply, setShowReply] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < PROMPT.length) {
        setTyped(PROMPT.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setShowCursor(false)
          setTimeout(() => setShowReply(true), 250)
        }, 250)
      }
    }, 38)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

      <div className="container grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-soft"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            New · your AI meeting copilot
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-serif text-5xl font-medium leading-[1.02] tracking-tight text-foreground sm:text-6xl md:text-7xl text-balance"
          >
            Schedule meetings in{" "}
            <span className="italic text-primary">plain English.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            From calendar invites to follow-ups — just write a sentence and let
            MeetMate handle the rest, the way you'd ask a brilliant assistant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
              <Link href="/demo">
                Try the live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-6 text-base"
            >
              <Link href="/#how-it-works">See how it works</Link>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                {b}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -right-3 -top-3 h-20 w-20 rounded-2xl border border-border bg-secondary/60 animate-float-slow" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">AI Meeting Scheduler</span>
              <span className="ml-auto flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
              </span>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {typed}
                  {showCursor && (
                    <span className="ml-0.5 inline-block h-4 w-[2px] -translate-y-[1px] bg-primary-foreground animate-blink" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showReply && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex justify-start"
                  >
                    <div className="flex max-w-[88%] items-start gap-2.5 rounded-2xl rounded-bl-sm border border-border bg-secondary/60 px-4 py-3 text-sm">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground">{REPLY}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {showReply && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {["Tomorrow · 5:00 PM", "UNIT13", "Google Meet"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
