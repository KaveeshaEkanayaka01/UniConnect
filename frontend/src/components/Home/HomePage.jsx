import React from 'react'
import Header from '../Home/Header'
import HeroSection from '../Home/HeroSection'
import IntroSection from '../Home/IntroSection'
import './HomePage.css'
import Footer from '../Home/Footer'

const HomePage = () => {
  return (
    <main className='home-page'>
      <section className='home-hero-shell'>
        <Header />
        <HeroSection />
      </section>
      <IntroSection />
      <Footer/>
    </main>
  )
}

export default HomePage
