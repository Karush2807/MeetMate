"use client"

import { motion } from "framer-motion"
import { features } from "@/lib/site-data"
import { SectionHeading } from "@/components/section-heading"

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Capabilities"
          title="Your entire meeting workflow, handled"
          description="Everything from the first request to the final follow-up — quietly automated, so the work happens between the meetings, not in them."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative bg-card p-8 transition-colors hover:bg-secondary/40 md:p-10"
            >
              <span className="font-mono text-xs text-muted-foreground/70">
                0{i + 1}
              </span>
              <span className="mt-5 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:-translate-y-0.5">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-serif text-2xl tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              <span className="mt-6 block h-px w-0 bg-primary transition-all duration-500 group-hover:w-16" />
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex justify-center"
        >
          <p className="rounded-full border border-border bg-card px-5 py-2.5 text-sm text-muted-foreground shadow-soft">
            <span className="font-semibold text-foreground">99.9% accuracy</span>{" "}
            in meeting transcription and summarization
          </p>
        </motion.div>
      </div>
    </section>
  )
}
