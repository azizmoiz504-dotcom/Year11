import { Header } from '../components/Header'
import { Ending } from '../sections/Ending'
import { Hero } from '../sections/Hero'
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
        <StudentGrid />
        <Universities />
        <ReelsTeaser />
        <Ending />
      </main>
    </>
  )
}
