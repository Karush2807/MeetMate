"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

const pricingPlans = {
  monthly: [
    {
      name: "Free",
      description: "Essential features for individuals and small teams",
      price: "$0",
      features: [
        "Up to 5 meetings per month",
        "Basic scheduling",
        "Simple meeting notes",
        "Email notifications",
        "1 calendar integration",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Advanced features for growing teams",
      price: "$19",
      features: [
        "Unlimited meetings",
        "Advanced scheduling",
        "AI-generated meeting briefs",
        "Automated MoM generation",
        "Task tracking",
        "Multiple calendar integrations",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Custom AI training",
        "Advanced analytics",
        "SSO & advanced security",
        "API access",
        "Dedicated account manager",
        "SLA guarantees",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ],
  yearly: [
    {
      name: "Free",
      description: "Essential features for individuals and small teams",
      price: "$0",
      features: [
        "Up to 5 meetings per month",
        "Basic scheduling",
        "Simple meeting notes",
        "Email notifications",
        "1 calendar integration",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Advanced features for growing teams",
      price: "$15",
      period: "per month, billed annually",
      features: [
        "Unlimited meetings",
        "Advanced scheduling",
        "AI-generated meeting briefs",
        "Automated MoM generation",
        "Task tracking",
        "Multiple calendar integrations",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Custom AI training",
        "Advanced analytics",
        "SSO & advanced security",
        "API access",
        "Dedicated account manager",
        "SLA guarantees",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ],
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that's right for you and start streamlining your meetings today.
          </p>
        </div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Tabs defaultValue="monthly" className="mx-auto max-w-5xl">
            <div className="mb-8 flex justify-center">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly (20% off)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="monthly" className="grid gap-8 md:grid-cols-3">
              {pricingPlans.monthly.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </TabsContent>
            <TabsContent value="yearly" className="grid gap-8 md:grid-cols-3">
              {pricingPlans.yearly.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}

function PricingCard({ plan }) {
  return (
    <Card className={`flex h-full flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}>
      {plan.popular && (
        <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.period && <span className="text-sm text-muted-foreground"> {plan.period}</span>}
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  )
}
