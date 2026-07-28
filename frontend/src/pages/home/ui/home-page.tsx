import { HomeCta } from '@/widgets/home-cta'
import { HomeFeatures } from '@/widgets/home-features'
import { HomeHero } from '@/widgets/home-hero'

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeHero />
      <HomeFeatures />
      <HomeCta />
    </div>
  )
}
