import React from 'react'
import logo from '../../../images/uniconnect.png'
import './Header.css'

const Header = () => {
  return (
    <nav className='site-nav'>
      <a href='/' className='nav-brand' aria-label='UniConnect home'>
        <img src={logo} alt='UniConnect logo' />
      </a>

      <div className='nav-menu'>
        <a href='#'>Home</a>
        <a href='#'>Clubs & Societies</a>
        <a href='#'>Events</a>
        <a href='#'>FAQ</a>
        <a href='#'>Contact Us</a>
      </div>

      <div className='nav-actions'>
        <a className='nav-button' href='/dashboard'>
          User Dashboard
        </a>

        <button type='button' className='nav-icon-btn' aria-label='Favorites'>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M12 21s-6.7-4.35-9.2-8.03A5.5 5.5 0 0 1 12 6.2a5.5 5.5 0 0 1 9.2 6.77C18.7 16.65 12 21 12 21z' />
          </svg>
        </button>

        <button type='button' className='nav-icon-btn' aria-label='Open menu'>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M4 7h16M4 12h16M4 17h16' />
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default Header
