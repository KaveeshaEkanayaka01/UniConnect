import React, { useEffect, useState } from 'react'
import heroImageOne from '../../../images/hero1.jpg'
import heroImageTwo from '../../../images/SLIIT-malabe.jpg'
import heroImageThree from '../../../images/hero3.jpg'
import './HeroSection.css'

const HeroSection = () => {
  const heroImages = [heroImageOne, heroImageTwo, heroImageThree]
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length)
    }, 4500)

    return () => clearInterval(intervalId)
  }, [heroImages.length])

  return (
    <header className='hero-section'>
      <div className='hero-slides' aria-hidden='true'>
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`hero-slide ${index === activeSlide ? 'is-active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>
      <div className='hero-overlay' />

      <section className='hero-content'>
        <p className='hero-kicker'>UNI CONNECT COMMUNITY</p>
        <h1>Discover clubs, spark ideas, and build your campus journey.</h1>
        <p className='hero-sub'>
          Explore student societies, workshops, hackathons, and social events happening across your university.
        </p>

        <form className='hero-search' onSubmit={(e) => e.preventDefault()}>
          <input
            type='text'
            placeholder='Search clubs, events, or interests...'
            aria-label='Search clubs and events'
          />
          <button type='submit'>Find Opportunities</button>
        </form>

        <div className='hero-chips'>
          <a href='#'>Tech Clubs</a>
          <a href='#'>Sports</a>
          <a href='#'>Cultural Societies</a>
          <a href='#'>Upcoming Events</a>
        </div>
      </section>
    </header>
  )
}

export default HeroSection
