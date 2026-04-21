import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className='home-footer' aria-label='Site footer'>
      <div className='footer-grid'>
        <section className='footer-column'>
          <h3>Quick links</h3>
          <div className='footer-divider' />
          <nav className='footer-links' aria-label='Quick links'>
            <a href='#'>Clubs of the month</a>
            <a href='#'>Saved clubs</a>
            <a href='#'>Your event journey</a>
            <a href='#'>Our purpose</a>
            <a href='#'>Join our community</a>
            <a href='#'>Start a club</a>
          </nav>
        </section>

        <section className='footer-column'>
          <h3>Get in touch</h3>
          <div className='footer-divider' />
          <p className='footer-heading'>SAY HELLO</p>
          <p className='footer-phone'>+94 11 555 2233</p>
          <address>
            UniConnect Student Hub<br />
            Student Services Center<br />
            kandy Road<br />
            malabe<br />
            Sri Lanka
          </address>
        </section>

        <section className='footer-column'>
          <h3>Stay up to date</h3>
          <div className='footer-subscribe'>
            <input type='email' placeholder='Email address..' aria-label='Email address' />
            <button type='button' aria-label='Subscribe'>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M9 6l6 6-6 6' />
              </svg>
            </button>
          </div>

          <label className='footer-consent'>
            <input type='checkbox' />
            <span>
              I confirm I have read and understood the <a href='#'>Privacy Policy</a> &amp; <a href='#'>Cookie Policy</a>, and I agree to the <a href='#'>Terms</a>.
            </span>
          </label>

          <div className='footer-socials' aria-label='Social links'>
            <a href='#' aria-label='Facebook'>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M13.5 8H15V5h-1.5A4.5 4.5 0 0 0 9 9.5V12H7v3h2v4h3v-4h2.3l.7-3H12V9.5A1.5 1.5 0 0 1 13.5 8z' />
              </svg>
            </a>
            <a href='#' aria-label='Instagram'>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <rect x='4' y='4' width='16' height='16' rx='5' />
                <circle cx='12' cy='12' r='3.2' />
                <circle cx='17.2' cy='6.8' r='1' />
              </svg>
            </a>
            <a href='#' aria-label='TikTok'>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M14 5v9.2a2.7 2.7 0 1 1-2-2.6V9.2a5.5 5.5 0 0 0-1 .1 5 5 0 1 0 5 5V9.8a7.7 7.7 0 0 0 4 1.2V8a4.8 4.8 0 0 1-4-3z' />
              </svg>
            </a>
            <a href='#' aria-label='YouTube'>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <rect x='3' y='7' width='18' height='10' rx='3' />
                <path d='M11 10l4 2-4 2z' />
              </svg>
            </a>
          </div>
        </section>
      </div>
    </footer>
  )
}

export default Footer
