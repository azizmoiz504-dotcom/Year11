/** Film grain + vignette layered over everything. Purely decorative. */
export function Atmosphere() {
  return (
    <div aria-hidden="true">
      <div className="vignette" />
      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        <div className="grain" />
      </div>
    </div>
  )
}
