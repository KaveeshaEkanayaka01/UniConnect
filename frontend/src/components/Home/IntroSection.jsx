import React, { useEffect, useRef, useState } from 'react'
import heroImage from '../../../images/hero1.jpg'
import './IntroSection.css'

const IntroSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`intro-section ${isVisible ? 'is-visible' : ''}`}
      aria-label='Introducing UniConnect'
    >
      <div className='intro-grid'>
        <article className='intro-media'>
          <img src={heroImage} alt='Students engaging in a campus activity' />
          <div className='intro-media-badge'>
            <span>INTRODUCING</span>
            <strong>UNICONNECT</strong>
          </div>
        </article>

        <article className='intro-copy'>
          <p className='intro-kicker'>INTRODUCING UNICONNECT</p>
          <p>
            UniConnect makes student life easier by putting clubs, societies, and events in one place so you can find your people faster.
          </p>
          <p>
            Whether you are a fresher or final-year student, discover opportunities that match your interests and build your profile with real experiences.
          </p>

          <h2>What is included?</h2>
          <ul>
            <li>
              <strong>Club Discovery</strong> - Browse and join clubs by category, from coding and media to sports and volunteering.
            </li>
            <li>
              <strong>Event Hub</strong> - Track upcoming workshops, competitions, and networking sessions in one calendar.
            </li>
            <li>
              <strong>Skills & Badges</strong> - Record your participation, earn badges, and showcase your growth.
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}

export default IntroSection
