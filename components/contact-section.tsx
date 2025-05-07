"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useInView } from "framer-motion";
import {
  Send,
  Mail,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Heart,
} from "lucide-react";
import { SocialIcon } from "./helperfunction/SocialIcon";

export function ContactSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef(null);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setIsSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setIsSubmitted(false);
    }, 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const linkVariants = {
    initial: { color: "rgb(156 163 175)" },
    hover: {
      color: "rgb(124 58 237)",
      x: 5,
      transition: { duration: 0.2 },
    },
  };

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 bg-black/90 overflow-hidden min-h-screen flex flex-col justify-between "
    >
      {/* <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" /> */}
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="container relative z-10 flex-1">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 mb-6">
              <Mail className="mr-2 h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-500">
                Join Our Community
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Stay in the Loop
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest updates, exclusive
              tips, and early access to new features.
            </p>
          </motion.div>

          <motion.div
            ref={formRef}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="relative mx-auto max-w-md"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black/60 border border-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-medium text-white mb-4">
                  Newsletter Subscription
                </h3>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="youremail@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10 focus:border-purple-500 focus:ring-purple-500/20"
                    aria-label="Email address"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300"
                >
                  {isSubmitted ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Subscribed!
                    </motion.span>
                  ) : (
                    <motion.span className="flex items-center">
                      Subscribe <Send className="ml-2 h-4 w-4" />
                    </motion.span>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates.
                </p>
              </form>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-24 grid gap-x-8 gap-y-12 md:grid-cols-3"
          >
            <motion.div variants={itemVariants} className="group">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Resources</h3>
              <ul className="space-y-3">
                {[
                  "Documentation",
                  "API Reference",
                  "Tutorials",
                  "Community Forum",
                ].map((item, index) => (
                  <li key={index}>
                    <motion.a
                      href="#"
                      className="flex items-center text-gray-400 group-hover:text-purple-400 transition-colors"
                      variants={linkVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      <ArrowRight className="mr-2 h-3 w-0 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all duration-300" />
                      {item}
                      <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="group">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-building"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M12 6h.01" />
                  <path d="M12 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 10h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 10h.01" />
                  <path d="M8 14h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Company</h3>
              <ul className="space-y-3">
                {["About Us", "Careers", "Blog", "Press Kit", "Contact"].map(
                  (item, index) => (
                    <li key={index}>
                      <motion.a
                        href="#"
                        className="flex items-center text-gray-400 group-hover:text-blue-400 transition-colors"
                        variants={linkVariants}
                        initial="initial"
                        whileHover="hover"
                      >
                        <ArrowRight className="mr-2 h-3 w-0 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all duration-300" />
                        {item}
                        <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.a>
                    </li>
                  )
                )}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="group">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Legal</h3>
              <ul className="space-y-3">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "GDPR Compliance",
                  "Security",
                ].map((item, index) => (
                  <li key={index}>
                    <motion.a
                      href="#"
                      className="flex items-center text-gray-400 group-hover:text-pink-400 transition-colors"
                      variants={linkVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      <ArrowRight className="mr-2 h-3 w-0 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all duration-300" />
                      {item}
                      <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        transition={{ duration: 0.5, delay: 0.6 }}
        viewport={{ once: true }} className="absolute border-t pt-8 border-white/10 mt-16 bottom-4 left-1/2 transform -translate-x-1/2 max-w-4xl">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} MeetMate . All rights reserved.
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-4 text-sm text-white font-semibold flex items-center justify-center"
        >
          Made with ❤️ by TEAM UNIT13
        </motion.p>
      </motion.div>
    </section>
  );
}
