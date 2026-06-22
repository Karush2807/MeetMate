"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setEmail("")
      setSubmitted(false)
    }, 3000)
  }

  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 shadow-lift sm:px-12"
        >
          <div className="absolute inset-0 -z-10 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              Join the community
            </span>
            <h2 className="mt-6 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl text-balance">
              Stay in the loop
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Product updates, scheduling tips, and early access to new features.
              No noise — unsubscribe anytime.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="h-12 rounded-full pl-9"
                />
              </div>
              <Button type="submit" className="h-12 rounded-full px-6">
                {submitted ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Subscribed
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">
              By subscribing you agree to our Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
