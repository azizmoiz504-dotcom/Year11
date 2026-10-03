/** Placeholder for a classmate who isn't in students.json yet (only used without a backend). */
export function OpenSpot() {
  return (
    <li className="list-none text-center" aria-hidden="true">
      <div className="flex aspect-[4/5] w-full items-center justify-center border-2 border-dashed border-line text-sm text-muted">Coming soon</div>
      <p className="mt-3 text-[13px] font-semibold tracking-[0.06em] text-muted/70 uppercase">Your name here</p>
    </li>
  )
}
