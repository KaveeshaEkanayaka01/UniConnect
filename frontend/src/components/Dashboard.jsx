import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaUsers, FaClock, FaCheckCircle, FaHourglassHalf, FaMapMarkerAlt, FaArrowRight, FaPlus } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, pastEvents: 0, totalRegistrations: 0, totalWaitlist: 0, totalCapacity: 0 });
  const [eventStats, setEventStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const eventsRes = await axios.get(`${API_URL}/api/events`);
      const allEvents = eventsRes.data;
      const now = new Date();
      const upcoming = allEvents.filter(e => new Date(e.eventDate) >= now);
      const past = allEvents.filter(e => new Date(e.eventDate) < now);
      let totalReg = 0, totalWait = 0, totalCap = 0;
      const evtStats = [];

      for (const event of allEvents) {
        try {
          const regRes = await axios.get(`${API_URL}/api/registrations/slots/${event._id}`);
          totalReg += regRes.data.registeredCount; totalWait += regRes.data.waitlistCount; totalCap += regRes.data.totalCapacity;
          evtStats.push({ ...event, registeredCount: regRes.data.registeredCount, waitlistCount: regRes.data.waitlistCount, remainingSlots: regRes.data.remainingSlots, totalCapacity: regRes.data.totalCapacity, fillPercentage: Math.round((regRes.data.registeredCount / regRes.data.totalCapacity) * 100) });
        } catch { evtStats.push({ ...event, registeredCount: 0, waitlistCount: 0, remainingSlots: event.studentCapacity, totalCapacity: event.studentCapacity, fillPercentage: 0 }); }
      }
      setStats({ totalEvents: allEvents.length, upcomingEvents: upcoming.length, pastEvents: past.length, totalRegistrations: totalReg, totalWaitlist: totalWait, totalCapacity: totalCap });
      setEventStats(evtStats.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)));
    } catch { toast.error('Failed to load dashboard data'); } finally { setLoading(false); }
  };

  const getCategoryColor = (category) => {
    switch (category) { case 'Social Event': return '#38b2ac'; case 'Workshop': return '#ed8936'; case 'Competition': return '#e53e3e'; case 'Club Meeting': return '#9f7aea'; default: return '#667eea'; }
  };

  if (loading) return (<div className="loading"><div className="spinner"></div><p>Loading dashboard...</p></div>);

  return (
    <div>
      <div className="page-header"><h1>📊 Event Dashboard</h1><p>Overview of all events and registrations</p></div>
      <div className="dashboard-stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #667eea' }}><div className="stat-icon" style={{ backgroundColor: '#ebf4ff', color: '#667eea' }}><FaCalendarAlt /></div><div className="stat-info"><h3>{stats.totalEvents}</h3><p>Total Events</p></div></div>
        <div className="stat-card" style={{ borderTop: '4px solid #38a169' }}><div className="stat-icon" style={{ backgroundColor: '#f0fff4', color: '#38a169' }}><FaCheckCircle /></div><div className="stat-info"><h3>{stats.upcomingEvents}</h3><p>Upcoming Events</p></div></div>
        <div className="stat-card" style={{ borderTop: '4px solid #4299e1' }}><div className="stat-icon" style={{ backgroundColor: '#ebf8ff', color: '#4299e1' }}><FaUsers /></div><div className="stat-info"><h3>{stats.totalRegistrations}</h3><p>Total Registrations</p></div></div>
        <div className="stat-card" style={{ borderTop: '4px solid #ed8936' }}><div className="stat-icon" style={{ backgroundColor: '#fffaf0', color: '#ed8936' }}><FaHourglassHalf /></div><div className="stat-info"><h3>{stats.totalWaitlist}</h3><p>In Waitlist</p></div></div>
        <div className="stat-card" style={{ borderTop: '4px solid #9f7aea' }}><div className="stat-icon" style={{ backgroundColor: '#faf5ff', color: '#9f7aea' }}><FaClock /></div><div className="stat-info"><h3>{stats.pastEvents}</h3><p>Past Events</p></div></div>
        <div className="stat-card" style={{ borderTop: '4px solid #e53e3e' }}><div className="stat-icon" style={{ backgroundColor: '#fff5f5', color: '#e53e3e' }}><FaUsers /></div><div className="stat-info"><h3>{stats.totalCapacity}</h3><p>Total Capacity</p></div></div>
      </div>
      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => navigate('/create-event')}><FaPlus /> Create New Event</button>
        <button className="btn btn-success" onClick={() => navigate('/manage-events')}><FaCalendarAlt /> Manage Events</button>
        <button className="btn btn-warning" onClick={() => navigate('/register')}><FaUsers /> View Registrations</button>
      </div>
      <div className="dashboard-table-container">
        <h3 style={{ marginBottom: '20px' }}>All Events Overview</h3>
        {eventStats.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📭</div><h3>No events created yet</h3><button className="btn btn-primary" onClick={() => navigate('/create-event')} style={{ marginTop: '15px' }}><FaPlus /> Create First Event</button></div>
        ) : (
          <div className="dashboard-events-list">
            {eventStats.map(event => {
              const isPast = new Date(event.eventDate) < new Date();
              return (
                <div key={event._id} className={`dashboard-event-row ${isPast ? 'past-event' : ''}`} onClick={() => navigate(`/event/${event._id}`)}>
                  <div className="event-row-color" style={{ backgroundColor: getCategoryColor(event.eventCategory) }}></div>
                  <div className="event-row-info">
                    <h4>{event.eventTitle}</h4>
                    <div className="event-row-meta">
                      <span><FaCalendarAlt /> {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span><FaClock /> {event.startTime} - {event.endTime}</span>
                      <span><FaMapMarkerAlt /> {event.venue}</span>
                    </div>
                  </div>
                  <span className="event-row-category" style={{ backgroundColor: getCategoryColor(event.eventCategory) }}>{event.eventCategory === 'Other' ? event.customCategory : event.eventCategory}</span>
                  <div className="event-row-progress">
                    <div className="progress-label"><span>{event.registeredCount}/{event.totalCapacity}</span><span>{event.fillPercentage}%</span></div>
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${event.fillPercentage}%`, backgroundColor: event.fillPercentage >= 100 ? '#e53e3e' : event.fillPercentage >= 70 ? '#ed8936' : '#38a169' }}></div></div>
                    {event.waitlistCount > 0 && <span className="waitlist-mini-badge">{event.waitlistCount} waitlisted</span>}
                  </div>
                  <div className="event-row-status">{isPast ? <span className="status-tag past">Completed</span> : event.fillPercentage >= 100 ? <span className="status-tag full">Full</span> : <span className="status-tag open">Open</span>}</div>
                  <FaArrowRight className="event-row-arrow" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;