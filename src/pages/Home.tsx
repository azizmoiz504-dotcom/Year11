import { Header } from '../components/Header'
import { Ending } from '../sections/Ending'
import { Hero } from '../sections/Hero'
import { NamesMarquee } from '../sections/NamesMarquee'
import { Superlatives } from '../sections/Superlatives'
import { Timeline } from '../sections/Timeline'
import { ReelsTeaser } from '../sections/ReelsTeaser'
import { StudentGrid } from '../sections/StudentGrid'
import { Universities } from '../sections/Universities'

export function Home({ hidden }: { hidden?: boolean }) {
  return (
    <>
      <Header />
      {/* `inert` keeps keyboard focus inside an open profile / reels overlay. */}
      <main inert={hidden || undefined}>
        <Hero />
        <NamesMarquee />
        <StudentGrid />
        <Timeline />
        <Superlatives />
        <Universities />
        <ReelsTeaser />
        <Ending />
      </main>
    </>
  )
}
