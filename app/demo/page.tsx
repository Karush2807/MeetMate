import { DemoSection } from "@/components/demo-section"

export default function DemoPage() {
  return (
    <div className="border-b border-border bg-primary/10">
      <p className="container py-2 text-center text-sm text-foreground">
        <span className="font-semibold text-primary">Beta:</span> this app is in
        active development and may contain bugs. Found one?{" "}
        <a
          href="mailto:unit13.2025@gmail.com"
          className="font-medium underline underline-offset-2 hover:text-primary"
        >
          unit13.2025@gmail.com
        </a>
      </p>
      <div className="bg-background">
        <DemoSection />
      </div>
    </div>
  )
}
