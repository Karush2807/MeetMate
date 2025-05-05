import { DemoSection } from "@/components/demo-section"

export default function DemoPage() {
  return (
    <div className="container py-10 md:py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">Interactive Demo</h1>
      <p className="mb-10 text-muted-foreground md:text-lg">
        Try out the AI Meeting Scheduler component below to see how it works in real-time.
      </p>
      <DemoSection />
    </div>
  )
}
