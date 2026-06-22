import Link from "next/link"
import { Logo } from "@/components/logo"
import { SocialIcon } from "@/components/helperfunction/SocialIcon"
import { footerColumns } from "@/lib/site-data"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Schedule meetings in plain English. The calm way to run a
              calendar.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MeetMate. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <span className="text-primary">❤</span> by TEAM UNIT13
          </p>
        </div>
      </div>
    </footer>
  )
}
