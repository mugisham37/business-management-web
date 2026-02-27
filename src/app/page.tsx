import React from 'react'
import Hero from '../components/hero'
import Overview from '../components/overview'
import Bento from '../components/bento'
import Feature from '../components/feature'
import Metrics from '../components/metrics'
import Hightlight from '../components/hightlight'
import Pricing from '../components/pricing'
import Benefits from '../components/benefits'
import Testimonials from '../components/testimonials'

import Faq from '../components/faq'

const page = () => {
  return (
    <div>
      <Hero />
      <Overview />
      <Bento />
      <Feature />
      <Metrics />
      <Hightlight />
      <Pricing />
      <Benefits />
      <Testimonials />
      <Faq />
    </div>
  )
}

export default page