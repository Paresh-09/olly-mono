import React from 'react'
import Hero from '../_components/mobile-hero'
import WatchDemoMobile from '../_components/watch-demo'
import MobileReviews from '../_components/mobile-reviews'
import MobileFeatures from '../_components/mobile-features'
import MobileFlower from '../_components/mobile-flower'
import MobileFAQ from '../_components/mobile-faq'
import AppLinks from '../_components/app-links'

const MobileLanding = () => {
  return (
    <main>
      <section className="min-h-screen">
        <Hero title='Amplify your Social Presence in Days.' subtitle='AI Powered Assistant, on your mobile.' />
      </section>
      
      <section className="bg-white py-24 sm:py-40">
        <WatchDemoMobile />
      </section>

      <section className="bg-white py-2 sm:py-2">
        <MobileReviews />
      </section>

      <section className="bg-white py-2 sm:py-2">
        <MobileFlower />
      </section>

      <section className="bg-white py-8 sm:py-8">
        <MobileFeatures />
      </section>

      <section className="bg-white py-8 sm:py-8">
        <MobileFAQ />
      </section>

      <section className="bg-white py-8 sm:py-8">
        <AppLinks />
      </section>

    </main>
  )
}

export default MobileLanding
