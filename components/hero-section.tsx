"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spotlight } from "./ui/spotlight-new";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const fullText =
    "Schedule a meeting with Team UNIT13 at 5pm tomorrow about the product discussion.";
  const responseText =
    "✓ Meeting with UNIT13 scheduled for tomorrow at 5:00 PM. Calendar invite sent. Added agenda: Product roadmap discussion.";

  useEffect(() => {
    setMounted(true);
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowCursor(false);
          setTimeout(() => {
            setShowResponse(true);
          }, 300);
        }, 200);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden py-24 md:py-36 bg-black">
      <Spotlight />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-block rounded-full bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <span className="mr-2 inline-block">✨</span> Introducing Meeting AI
          </motion.div>

          <motion.h1
            className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Schedule Meetings in Plain English
          </motion.h1>

          <motion.p
            className="mt-6 text-xl font-serif text-muted-foreground md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Transform how you manage meetings with our AI-powered scheduler that
            handles everything from calendar invites to follow-ups — all through
            natural language.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 rounded-full px-6 text-base"
            >
              <Link href="/demo">
                Try Live Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 gap-2 rounded-full px-6 text-base"
            >
              <Github className="h-4 w-4" />
              <Link href="https://github.com/Karush2807/MeetMate">
                Star on Github
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mx-auto mt-20 max-w-2xl overflow-hidden rounded-xl border bg-card/80 p-1 shadow-xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="flex items-center gap-2 border-b bg-muted/50 p-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className=" flex items-center text-xs font-medium text-muted-foreground">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              AI Meeting Scheduler
            </div>
          </div>

          <div className="space-y-4 p-5 font-mono text-sm">
            <div className="flex items-start">
              <motion.span
                className="mr-2 text-green-500 dark:text-green-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                $
              </motion.span>
              <span>{typedText}</span>
              {showCursor && (
                <motion.span
                  className="ml-0.5 inline-block h-4 w-2 bg-primary"
                  animate={{ opacity: [0, 1] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 0.8,
                  }}
                ></motion.span>
              )}
            </div>

            <AnimatePresence>
              {showResponse && (
                <motion.div
                  className="rounded-lg bg-primary/5 p-3 text-muted-foreground"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-start">
                    <Sparkles className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>{responseText}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 flex max-w-md justify-center gap-8 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
        >
          <div className="flex items-center">
            <div className="mr-2 h-1 w-1 rounded-full bg-primary"></div>
            <span>Natural language input</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-1 w-1 rounded-full bg-primary"></div>
            <span>Calendar integration</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-1 w-1 rounded-full bg-primary"></div>
            <span>Smart follow-ups</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
