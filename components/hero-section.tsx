"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [showResponse, setShowResponse] = useState(false)
  const fullText = "Schedule a meeting with Arush at 5pm tomorrow."
  const responseText = "✓ Meeting with Arush scheduled for tomorrow at 5:00 PM. Calendar invite sent."

  useEffect(() => {
    setMounted(true)
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setShowResponse(true)
        }, 500)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/80" />
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Schedule Meetings in Plain English.
          </motion.h1>
          <motion.p
            className="mt-6 text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            AI-powered React component that automates scheduling, briefs, MoM, and follow-up.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button asChild size="lg">
              <Link href="/demo">
                Try Live Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Github className="mr-2 h-4 w-4" /> View on GitHub
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-lg border bg-card p-4 shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-muted-foreground">AI Meeting Scheduler</div>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="flex items-start">
              <span className="mr-2 text-green-500 dark:text-green-400">$</span>
              <span>{typedText}</span>
              <span
                className={cn("ml-0.5 inline-block h-4 w-2 animate-blink bg-primary", {
                  "opacity-0": typedText === fullText,
                })}
              ></span>
            </div>
            {showResponse && <div className="mt-4 text-muted-foreground">{responseText}</div>}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
