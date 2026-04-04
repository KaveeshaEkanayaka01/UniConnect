import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaPlus, FaUserPlus, FaCog, FaChartBar, FaList, FaUser, FaUserShield } from 'react-icons/fa';

const Navbar = ({ userRole, toggleRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggleRole = () => {
    toggleRole();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 UniConnect Events
      </Link>

      <ul className="navbar-links">
        {userRole === 'student' && (
          <>
            <li>
              <Link to="/all-events" className={location.pathname === '/all-events' || location.pathname === '/' ? 'active' : ''}>
                <FaList /> All Events
              </Link>
            </li>
            <li>
              <Link to="/calendar" className={location.pathname === '/calendar' ? 'active' : ''}>
                <FaCalendarAlt /> Calendar
              </Link>
            </li>
            <li>
              <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                <FaUserPlus /> Register
              </Link>
            </li>
          </>
        )}

        {userRole === 'clubadmin' && (
          <>
            <li>
              <Link to="/dashboard" className={location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}>
                <FaChartBar /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/calendar" className={location.pathname === '/calendar' ? 'active' : ''}>
                <FaCalendarAlt /> Calendar
              </Link>
            </li>
            <li>
              <Link to="/create-event" className={location.pathname === '/create-event' ? 'active' : ''}>
                <FaPlus /> Create Event
              </Link>
            </li>
            <li>
              <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                <FaUserPlus /> Registrations
              </Link>
            </li>
            <li>
              <Link to="/manage-events" className={location.pathname === '/manage-events' ? 'active' : ''}>
                <FaCog /> Manage Events
              </Link>
            </li>
          </>
        )}
      </ul>

      <button className="role-toggle-btn" onClick={handleToggleRole}>
        {userRole === 'student' ? (
          <><FaUser /> Student</>
        ) : (
          <><FaUserShield /> Club Admin</>
        )}
      </button>
    </nav>
  );
};

export default Navbar;