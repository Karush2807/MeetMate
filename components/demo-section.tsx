"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const MeetingScheduler = dynamic(
  () =>
    import("@/components/meeting-scheduler").then((mod) => mod.MeetingScheduler),
  { ssr: false }
)

const codeExample = `import { MeetingScheduler } from "ai-meeting-scheduler";

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
}`

const envExample = `# .env
PPLX_API_KEY=your_PPLX_key
GOOGLE_CALENDAR_API_KEY=your_google_key
ZOOM_API_KEY=your_zoom_key`

export function DemoSection() {
  return (
    <section id="demo-section" className="py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <span className="h-px w-6 bg-primary" />
            Live demo
          </span>
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl text-balance">
            Try scheduling something
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Type a request in plain English and watch MeetMate turn it into a
            real meeting.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-soft">
              <CardContent className="p-0">
                <Tabs defaultValue="demo">
                  <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                    <TabsTrigger
                      value="demo"
                      className="rounded-none border-b-2 border-transparent px-5 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                      Live demo
                    </TabsTrigger>
                    <TabsTrigger
                      value="code"
                      className="rounded-none border-b-2 border-transparent px-5 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                      Code example
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="demo" className="p-5">
                    <MeetingScheduler />
                  </TabsContent>
                  <TabsContent value="code" className="p-5">
                    <pre className="overflow-x-auto rounded-xl border border-border bg-secondary/40 p-4 font-mono text-sm text-foreground">
                      {codeExample}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit shadow-soft">
            <CardContent className="p-4">
              <Accordion type="multiple" defaultValue={["usage", "installation"]}>
                <AccordionItem value="usage" className="border-border">
                  <AccordionTrigger className="hover:no-underline">
                    Usage instructions
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <div className="space-y-3 text-sm">
                      <p>Type your meeting request in natural language:</p>
                      <ul className="list-inside list-disc space-y-2">
                        <li>Schedule a meeting with John tomorrow at 2pm</li>
                        <li>Set up a weekly team sync every Monday at 10am</li>
                        <li>Find a 30-minute slot with Sarah this week</li>
                      </ul>
                      <p>
                        MeetMate understands the request, checks availability,
                        and schedules it automatically.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
