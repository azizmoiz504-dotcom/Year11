import { backendEnabled } from '../lib/backend'

/** A card for a classmate who hasn't added themselves yet. */
export function OpenSpot({ onAdd }: { onAdd: () => void }) {
  const box = 'flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-line text-muted'
  return (
    <li className="list-none text-center">
      {backendEnabled ? (
        <button type="button" onClick={onAdd} className={`${box} transition-colors hover:border-accent hover:text-accent`}>
          <span className="grid size-11 place-items-center rounded-full bg-line text-2xl leading-none">+</span>
          <span className="text-sm font-medium">Add yourself</span>
        </button>
      ) : (
        <div className={box}>
          <span className="text-sm">Coming soon</span>
        </div>
      )}
      <p className="mt-3 text-[13px] font-semibold tracking-[0.06em] text-muted/70 uppercase">Your name here</p>
    </li>
  )
}
