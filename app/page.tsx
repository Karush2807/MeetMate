import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { ContactSection } from "@/components/contact-section"

export default function Home() {
  return (
    <div className="relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <HeroSection />
      <FeaturesSection />
      {/* <PricingSection /> */}
      <ContactSection />
    </div>
  )
}
