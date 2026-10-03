import { config } from '../config'
import { VideoPlayer } from './VideoPlayer'

/** "In 10 years": one vertical reel for the whole class, on a navy band. */
export function TenYearsVideo() {
  const v = config.videos.tenYears
  if (!v) return null
  return (
    <section id="ten-years" className="scroll-mt-14 bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 md:grid-cols-[1fr_20rem] md:gap-20">
        <div>
          <h2 className="font-serif text-5xl leading-[0.95] font-light sm:text-7xl">
            In 10 years<span className="text-sky">…</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cream/75">
            Where we said we'd be. Watch it now, then watch it again in 2037 and see who was right.
          </p>
        </div>
        <VideoPlayer
          src={v.src}
          poster={v.poster}
          label="In 10 years class reel"
          buttonClassName="bg-blue"
          className="mx-auto aspect-[9/16] w-full max-w-[20rem] rounded-3xl shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/10"
        />
      </div>
    </section>
  )
}

/** The signature video, on a blue band. */
export function SignatureVideo() {
  const v = config.videos.signature
  if (!v) return null
  return (
    <section id="signatures" className="scroll-mt-14 bg-blue text-white">
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="text-[11px] font-medium tracking-[0.35em] text-white/80 uppercase">Signed, sealed</p>
        <h2 className="mt-4 font-serif text-5xl leading-[0.95] font-light sm:text-7xl">Signatures</h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/85">Every name, in our own handwriting.</p>
        <VideoPlayer
          src={v.src}
          poster={v.poster}
          label="Signature video"
          buttonClassName="bg-navy"
          className="mt-12 aspect-video w-full rounded-3xl shadow-[0_30px_60px_-20px_rgb(0_0_0/0.5)]"
        />
      </div>
    </section>
  )
}
