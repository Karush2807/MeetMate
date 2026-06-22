import {
  Calendar,
  FileText,
  MessageSquare,
  CheckSquare,
  PencilLine,
  CalendarPlus,
  BellRing,
  type LucideIcon,
} from "lucide-react"

export type NavLink = { label: string; href: string }

export const navLinks: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Demo", href: "/demo" },
]

export type Feature = {
  title: string
  description: string
  icon: LucideIcon
}

export const features: Feature[] = [
  {
    title: "Natural-language scheduling",
    description:
      "Type what you want in plain English. MeetMate reads context, preferences, and constraints — then books it.",
    icon: Calendar,
  },
  {
    title: "Smart pre-meeting briefs",
    description:
      "Walk in prepared. Briefs are generated automatically with relevant context, prior discussions, and key points.",
    icon: FileText,
  },
  {
    title: "Automated minutes",
    description:
      "Capture decisions, action items, and insights without lifting a finger — accurate minutes, every time.",
    icon: MessageSquare,
  },
  {
    title: "Outcome & task tracking",
    description:
      "Turn talk into follow-through. Track outcomes and assign tasks with deadlines to the right people.",
    icon: CheckSquare,
  },
]

export type Step = {
  number: string
  title: string
  description: string
  icon: LucideIcon
}

export const steps: Step[] = [
  {
    number: "01",
    title: "Describe it",
    description:
      'Write a sentence like “Meet the design team Thursday at 3 for 45 minutes.”',
    icon: PencilLine,
  },
  {
    number: "02",
    title: "We arrange it",
    description:
      "MeetMate resolves contacts, checks calendars for conflicts, and creates the Google Meet link.",
    icon: CalendarPlus,
  },
  {
    number: "03",
    title: "Everyone's notified",
    description:
      "Invites go out, briefs are attached, and reminders keep the room on track.",
    icon: BellRing,
  },
]

export type FooterColumn = { title: string; links: string[] }

export const footerColumns: FooterColumn[] = [
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Tutorials", "Community Forum"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Press Kit", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
  },
]

export const trustedBy: string[] = [
  "UNIT13",
  "Northwind",
  "Lumen",
  "Atlas",
  "Forge",
  "Vertex",
  "Cobalt",
]
