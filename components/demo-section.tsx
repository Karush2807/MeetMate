'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import dynamic from "next/dynamic"

// Import the component with SSR disabled
const MeetingScheduler = dynamic(
  () => import("@/components/meeting-scheduler").then((mod) => mod.MeetingScheduler),
  { ssr: false }
)

export function DemoSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const elementPosition = document.getElementById('demo-section')?.offsetTop || 0
      
      if (scrollPosition > elementPosition) {
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="demo-section" className="py-20">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">Experience the Power of AI Scheduling</h2>
          <p className="mt-4 text-gray-400">Try our interactive demo and see how easy it is to schedule meetings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-gray-800 bg-gray-900/60 backdrop-blur-md">
              <CardContent className="p-0">
                <Tabs defaultValue="demo">
                  <TabsList className="w-full justify-start rounded-none border-b border-gray-800 bg-gray-900/80 p-0">
                    <TabsTrigger 
                      value="demo" 
                      className="rounded-none border-r border-gray-800 px-6 py-3 text-gray-400 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                    >
                      Live Demo
                    </TabsTrigger>
                    <TabsTrigger 
                      value="code" 
                      className="rounded-none px-6 py-3 text-gray-400 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                    >
                      Code Example
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="demo" className="p-6">
                    <MeetingScheduler />
                  </TabsContent>
                  <TabsContent value="code" className="p-6">
                    <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 text-sm text-gray-300">
                      {`import { MeetingScheduler } from "ai-meeting-scheduler";

// Basic usage
export default function App() {
  return (
    <MeetingScheduler 
      apiKey={process.env.OPENAI_API_KEY}
      calendarIntegrations={["google", "outlook"]}
      onSchedule={(meeting) => {
        console.log("Meeting scheduled:", meeting);
      }}
    />
  );
}`}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-gray-800 bg-gray-900/60 backdrop-blur-md">
              <CardContent className="p-4">
                <Accordion type="multiple" defaultValue={["usage", "installation"]}>
                  <AccordionItem value="usage" className="border-gray-800">
                    <AccordionTrigger className="text-white hover:text-white hover:no-underline">Usage Instructions</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      <div className="space-y-4 text-sm">
                        <p>Type your meeting request in natural language. For example:</p>
                        <ul className="list-inside list-disc space-y-2 pl-4">
                          <li>Schedule a meeting with John tomorrow at 2pm</li>
                          <li>Set up a weekly team sync every Monday at 10am</li>
                          <li>Find a 30-minute slot with Sarah this week</li>
                        </ul>
                        <p>
                          The AI will understand your request, check calendars for availability, and schedule the meeting
                          automatically.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="installation" className="border-gray-800">
                    <AccordionTrigger className="text-white hover:text-white hover:no-underline">Installation</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      <div className="space-y-4 text-sm">
                        <p>Configure with your API keys:</p>
                        <pre className="overflow-x-auto rounded-lg bg-gray-950 p-3 text-gray-300">
                          {`// .env
PPLX_API_KEY=your_PPLX_key
GOOGLE_CALENDAR_API_KEY=your_google_key
ZOOM_API_KEY=your_zoom_key`}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="customization" className="border-gray-800">
                    <AccordionTrigger className="text-white hover:text-white hover:no-underline">Customization</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      <div className="space-y-4 text-sm">
                        <p>The component accepts the following props for customization:</p>
                        <ul className="list-inside list-disc space-y-2 pl-4">
                          <li>
                            <strong>theme</strong>: 'light' | 'dark' | 'system'
                          </li>
                          <li>
                            <strong>calendarIntegrations</strong>: Array of integrations
                          </li>
                          <li>
                            <strong>defaultDuration</strong>: Default meeting duration in minutes
                          </li>
                          <li>
                            <strong>language</strong>: Preferred language for AI responses
                          </li>
                          <li>
                            <strong>customPrompt</strong>: Custom system prompt for the AI
                          </li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
