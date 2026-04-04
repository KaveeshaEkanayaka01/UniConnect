import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaEye, FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTime, setFilterTime] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => { try { const res = await axios.get(`${API_URL}/api/events`); setEvents(res.data); } catch { toast.error('Failed to load events'); } finally { setLoading(false); } };

  const getCategoryColor = (cat) => { switch (cat) { case 'Social Event': return '#38b2ac'; case 'Workshop': return '#ed8936'; case 'Competition': return '#e53e3e'; case 'Club Meeting': return '#9f7aea'; default: return '#667eea'; } };

  const filteredEvents = events
    .filter(e => {
      const s = e.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) || e.organisingClubName.toLowerCase().includes(searchTerm.toLowerCase()) || e.venue.toLowerCase().includes(searchTerm.toLowerCase());
      const c = !filterCategory || e.eventCategory === filterCategory;
      const now = new Date(); const ed = new Date(e.eventDate);
      let t = true; if (filterTime === 'upcoming') t = ed >= now; if (filterTime === 'past') t = ed < now;
      return s && c && t;
    })
    .sort((a, b) => { const now = new Date(); const aP = new Date(a.eventDate) < now; const bP = new Date(b.eventDate) < now; if (aP && !bP) return 1; if (!aP && bP) return -1; if (!aP && !bP) return new Date(a.eventDate) - new Date(b.eventDate); return new Date(b.eventDate) - new Date(a.eventDate); });

  const now = new Date();
  const upcomingCount = filteredEvents.filter(e => new Date(e.eventDate) >= now).length;
  const pastCount = filteredEvents.filter(e => new Date(e.eventDate) < now).length;

  if (loading) return (<div className="loading"><div className="spinner"></div><p>Loading events...</p></div>);

  return (
    <div>
      <div className="page-header"><h1>🎉 All Events</h1><p>Browse and discover events</p></div>
      <div className="student-events-filters">
        <div className="search-box"><FaSearch className="search-icon" /><input type="text" placeholder="Search events, clubs, venues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option><option value="Social Event">Social Event</option><option value="Workshop">Workshop</option><option value="Competition">Competition</option><option value="Club Meeting">Club Meeting</option><option value="Other">Other</option>
        </select>
        <div className="time-filter-btns">
          <button className={`time-btn ${filterTime === 'all' ? 'active' : ''}`} onClick={() => setFilterTime('all')}>All</button>
          <button className={`time-btn ${filterTime === 'upcoming' ? 'active' : ''}`} onClick={() => setFilterTime('upcoming')}>Upcoming</button>
          <button className={`time-btn ${filterTime === 'past' ? 'active' : ''}`} onClick={() => setFilterTime('past')}>Past</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</p>
        {filterTime === 'all' && <div style={{ display: 'flex', gap: '10px' }}><span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', background: '#dcfce7', color: '#166534' }}>{upcomingCount} Upcoming</span><span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#64748b' }}>{pastCount} Ended</span></div>}
      </div>
      {filteredEvents.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔍</div><h3>No events found</h3><p>Try changing your search or filters</p></div>
      ) : (
        <>
          {filteredEvents.filter(e => new Date(e.eventDate) >= now).length > 0 && filterTime !== 'past' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-green 2s infinite' }}></span>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Upcoming Events</h2>
              </div>
              <div className="events-grid">
                {filteredEvents.filter(e => new Date(e.eventDate) >= now).map(event => {
                  const isDeadlinePassed = new Date(event.registrationDeadline) < now;
                  return (
                    <div key={event._id} className="event-card">
                      {event.eventPoster ? <img src={`${API_URL}${event.eventPoster}`} alt={event.eventTitle} className="event-card-poster" /> : <div className="event-card-no-poster" style={{ background: `linear-gradient(135deg, ${getCategoryColor(event.eventCategory)} 0%, ${getCategoryColor(event.eventCategory)}cc 100%)` }}>🎉</div>}
                      <div className="event-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span className="event-card-category" style={{ backgroundColor: `${getCategoryColor(event.eventCategory)}20`, color: getCategoryColor(event.eventCategory), margin: 0 }}>{event.eventCategory === 'Other' ? event.customCategory : event.eventCategory}</span>
                          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: isDeadlinePassed ? '#fef2f2' : '#dcfce7', color: isDeadlinePassed ? '#991b1b' : '#166534' }}>{isDeadlinePassed ? 'Reg. Closed' : 'Open'}</span>
                        </div>
                        <h3>{event.eventTitle}</h3>
                        <div className="event-card-info"><FaCalendarAlt color={getCategoryColor(event.eventCategory)} />{new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="event-card-info"><FaClock color={getCategoryColor(event.eventCategory)} />{event.startTime} - {event.endTime}</div>
                        <div className="event-card-info"><FaMapMarkerAlt color={getCategoryColor(event.eventCategory)} />{event.venue}</div>
                        <div className="event-card-info"><FaUsers color={getCategoryColor(event.eventCategory)} />{event.registeredCount || 0} / {event.studentCapacity} registered</div>
                        <div className="event-card-info" style={{ fontSize: '13px', color: '#a0aec0' }}>By: {event.organisingClubName}</div>
                        <div className="event-card-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/event/${event._id}`)}><FaEye /> View Details</button>
                          {!isDeadlinePassed && <button className="btn btn-success btn-sm" onClick={() => navigate('/register')}>Register</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {filteredEvents.filter(e => new Date(e.eventDate) < now).length > 0 && filterTime !== 'upcoming' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '40px', marginBottom: '18px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }}></span>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#64748b' }}>Ended Events</h2>
              </div>
              <div className="events-grid">
                {filteredEvents.filter(e => new Date(e.eventDate) < now).map(event => (
                  <div key={event._id} className="event-card past-event-card">
                    {event.eventPoster ? <img src={`${API_URL}${event.eventPoster}`} alt={event.eventTitle} className="event-card-poster" /> : <div className="event-card-no-poster" style={{ background: `linear-gradient(135deg, ${getCategoryColor(event.eventCategory)} 0%, ${getCategoryColor(event.eventCategory)}cc 100%)` }}>🎉</div>}
                    <div className="past-overlay">Event Ended</div>
                    <div className="event-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="event-card-category" style={{ backgroundColor: `${getCategoryColor(event.eventCategory)}20`, color: getCategoryColor(event.eventCategory), margin: 0 }}>{event.eventCategory === 'Other' ? event.customCategory : event.eventCategory}</span>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#f1f5f9', color: '#64748b' }}>Ended</span>
                      </div>
                      <h3>{event.eventTitle}</h3>
                      <div className="event-card-info"><FaCalendarAlt color="#94a3b8" />{new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="event-card-info"><FaClock color="#94a3b8" />{event.startTime} - {event.endTime}</div>
                      <div className="event-card-info"><FaMapMarkerAlt color="#94a3b8" />{event.venue}</div>
                      <div className="event-card-info"><FaUsers color="#94a3b8" />{event.registeredCount || 0} / {event.studentCapacity} registered</div>
                      <div className="event-card-info" style={{ fontSize: '13px', color: '#a0aec0' }}>By: {event.organisingClubName}</div>
                      <div className="event-card-actions"><button className="btn btn-primary btn-sm" onClick={() => navigate(`/event/${event._id}`)}><FaEye /> View Details</button></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StudentEvents;