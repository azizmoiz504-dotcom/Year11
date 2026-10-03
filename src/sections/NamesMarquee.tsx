import { students } from '../lib/students'

/** A slow ribbon of every name, like end credits rolling sideways. */
export function NamesMarquee() {
  const names = students.map((s) => s.name)
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16">
      {names.map((n, i) => (
        <li key={n + i} className="flex items-center gap-10 whitespace-nowrap sm:gap-16">
          <span className={i % 2 ? 'italic text-muted' : ''}>{n}</span>
          <span aria-hidden="true" className="text-[0.4em] text-accent">✦</span>
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label="Everyone in the class" className="overflow-hidden border-y border-line py-6 font-serif text-4xl font-light sm:py-8 sm:text-6xl">
      <div className="marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  )
}
