import { trustedBy } from "@/lib/site-data"

export function TrustMarquee() {
  const items = [...trustedBy, ...trustedBy]

  return (
    <div className="border-y border-border bg-card/40">
      <div className="container py-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by teams that hate scheduling
        </p>
        <div className="mask-fade-x mt-5 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-12">
            {items.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="select-none whitespace-nowrap font-serif text-2xl italic text-muted-foreground/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
