"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Calendar, FileText, CheckSquare, BarChart } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "Natural-Language Scheduling",
    description:
      "Simply type what you want in plain English. Our AI understands context, preferences, and constraints.",
    icon: Calendar,
  },
  {
    title: "Smart Pre-Meeting Briefs",
    description: "Automatically generate meeting briefs with relevant context, previous discussions, and key points.",
    icon: FileText,
  },
  {
    title: "Automated MoM Generation",
    description: "AI-powered minutes of meeting creation that captures key decisions, action items, and insights.",
    icon: MessageSquare,
  },
  {
    title: "Outcome & Task Tracking",
    description: "Track meeting outcomes and automatically assign tasks to team members with deadlines.",
    icon: CheckSquare,
  },
  {
    title: "Analytics Dashboard",
    description: "Gain insights into meeting productivity, participation, and follow-through on action items.",
    icon: BarChart,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Powerful Features</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to streamline your meeting workflow from scheduling to follow-up.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-all duration-200 hover:shadow-lg">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
