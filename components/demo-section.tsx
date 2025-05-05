"use client"
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
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="demo">
              <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 p-0">
                <TabsTrigger value="demo" className="rounded-none border-r px-6 py-3 data-[state=active]:bg-background">
                  Live Demo
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-none px-6 py-3 data-[state=active]:bg-background">
                  Code Example
                </TabsTrigger>
              </TabsList>
              <TabsContent value="demo" className="p-6">
                <MeetingScheduler />
              </TabsContent>
              <TabsContent value="code" className="p-6">
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
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
        <Accordion type="multiple" defaultValue={["usage", "installation"]}>
          <AccordionItem value="usage">
            <AccordionTrigger>Usage Instructions</AccordionTrigger>
            <AccordionContent>
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
          <AccordionItem value="installation">
            <AccordionTrigger>Installation</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm">
                <p>Install the package using npm, yarn, or pnpm:</p>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3">npm install ai-meeting-scheduler</pre>
                <p>Configure with your API keys:</p>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3">
                  {`// .env
OPENAI_API_KEY=your_openai_key
GOOGLE_CALENDAR_API_KEY=your_google_key
ZOOM_API_KEY=your_zoom_key`}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="customization">
            <AccordionTrigger>Customization</AccordionTrigger>
            <AccordionContent>
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
      </div>
    </div>
  )
}
