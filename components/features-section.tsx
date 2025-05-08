"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, FileText, CheckSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Natural-Language Scheduling",
    description:
      "Simply type what you want in plain English. Our AI understands context, preferences, and constraints.",
    icon: Calendar,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Smart Pre-Meeting Briefs",
    description: "Automatically generate meeting briefs with relevant context, previous discussions, and key points.",
    icon: FileText,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Automated MoM Generation",
    description: "AI-powered minutes of meeting creation that captures key decisions, action items, and insights.",
    icon: MessageSquare,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Outcome & Task Tracking",
    description: "Track meeting outcomes and automatically assign tasks to team members with deadlines.",
    icon: CheckSquare,
    color: "bg-primary/10 text-primary",
  },
];

export function FeaturesSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="features" className="relative py-24 md:py-36 bg-black overflow-hidden">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-1.5 mb-6"
          >
            <Zap className="mr-2 h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Capabilities</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl"
          >
            Streamline Your Entire Meeting Workflow
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Everything you need to transform your meeting experience from scheduling to follow-up,
            powered by advanced AI technology.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group"
            >
              <Card className="h-full border border-white/10 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <CardHeader>
                  <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center", feature.color)}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="mt-4 text-xl text-foreground group-hover:text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground group-hover:text-foreground/80">
                    {feature.description}
                  </CardDescription>
                  
                  <div className="mt-4 h-1 w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full opacity-0 group-hover:opacity-100" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3">
            <span className="text-sm font-medium text-foreground">
              <span className="text-primary">99.9% accuracy</span> in meeting transcription and summarization
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
