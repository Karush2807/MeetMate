import { DemoSection } from "@/components/demo-section"

export default function DemoPage() {
  return (
    <div className="container">
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-black font-semibold p-1 text-center  shadow-md z-50 flex items-center justify-center">
        <span>
          <span className="font-bold">Beta Testing:</span> This application is in development and may contain bugs. 
          If you encounter any errors, please contact our developers at <a href="mailto:dev@example.com" className="underline font-bold hover:text-green-100">unit13.2025@gmail.com</a>
        </span>
      </div>
      <div className="pt-16">
        <DemoSection />
      </div>
    </div>
  )
}
