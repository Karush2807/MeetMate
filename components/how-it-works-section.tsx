"use client"

import { motion } from "framer-motion"
import { steps } from "@/lib/site-data"
import { SectionHeading } from "@/components/section-heading"

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-border bg-secondary/30 py-24 md:py-32"
    >
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps. Zero back-and-forth."
          description="No forms, no toggling between tabs. You write one sentence — MeetMate does the choreography."
        />

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              <div className="flex items-center gap-4">
                <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border bg-card text-primary shadow-soft">
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="font-serif text-4xl italic text-muted-foreground/40">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-2xl tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
