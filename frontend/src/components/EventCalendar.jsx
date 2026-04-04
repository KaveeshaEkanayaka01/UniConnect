import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const res = await axios.get(`${API_URL}/api/events`); setEvents(res.data); }
    catch { toast.error('Failed to load events'); } finally { setLoading(false); }
  };

  const getCategoryColor = (cat) => { switch (cat) { case 'Social Event': return '#38b2ac'; case 'Workshop': return '#ed8936'; case 'Competition': return '#e53e3e'; case 'Club Meeting': return '#9f7aea'; default: return '#667eea'; } };
  const getCategoryBgColor = (cat) => { switch (cat) { case 'Social Event': return '#e6fffa'; case 'Workshop': return '#fffaf0'; case 'Competition': return '#fff5f5'; case 'Club Meeting': return '#faf5ff'; default: return '#ebf4ff'; } };

  const getMonthName = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => { const ed = new Date(event.eventDate); return `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}-${String(ed.getDate()).padStart(2, '0')}` === dateStr; });
  };

  const isToday = (day) => { const t = new Date(); return day === t.getDate() && currentDate.getMonth() === t.getMonth() && currentDate.getFullYear() === t.getFullYear(); };

  const getMonthEvents = () => events.filter(e => { const d = new Date(e.eventDate); return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear(); }).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const buildCalendar = () => {
    const days = [];
    for (let i = 0; i < getFirstDayOfMonth(currentDate); i++) days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    for (let day = 1; day <= getDaysInMonth(currentDate); day++) {
      const dayEvents = getEventsForDate(day);
      const todayClass = isToday(day) ? 'today' : '';
      days.push(
        <div key={day} className={`calendar-day ${todayClass} ${dayEvents.length > 0 ? 'has-events' : ''}`}>
          <span className={`day-number ${todayClass}`}>{day}</span>
          <div className="day-events">
            {dayEvents.map(event => (
              <div key={event._id} className="calendar-event-dot" onClick={() => navigate(`/event/${event._id}`)}
                style={{ backgroundColor: getCategoryColor(event.eventCategory), borderLeft: `4px solid ${getCategoryColor(event.eventCategory)}` }}
                title={`${event.eventTitle} | ${event.startTime} - ${event.endTime} | ${event.venue}`}>
                <span className="event-dot-text">{event.eventTitle}</span>
                <span className="event-dot-time">{event.startTime}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  if (loading) return (<div className="loading"><div className="spinner"></div><p>Loading calendar...</p></div>);
  const monthEvents = getMonthEvents();

  return (
    <div>
      <div className="page-header"><h1>Event Calendar</h1><p>Click on an event to view details</p></div>
      <div className="calendar-legend">
        {[{ label: 'Social Event', color: '#38b2ac' }, { label: 'Workshop', color: '#ed8936' }, { label: 'Competition', color: '#e53e3e' }, { label: 'Club Meeting', color: '#9f7aea' }, { label: 'Other', color: '#667eea' }].map(item => (
          <div key={item.label} className="legend-item"><div className="legend-color" style={{ backgroundColor: item.color }}></div><span>{item.label}</span></div>
        ))}
      </div>
      <div className="calendar-layout">
        <div className="custom-calendar-container">
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={goToPreviousMonth}><FaChevronLeft /></button>
            <h2 className="calendar-month-title">{getMonthName(currentDate)}</h2>
            <button className="calendar-nav-btn" onClick={goToNextMonth}><FaChevronRight /></button>
          </div>
          <div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (<div key={d} className="calendar-weekday">{d}</div>))}</div>
          <div className="calendar-grid">{buildCalendar()}</div>
        </div>
        <div className="month-events-sidebar">
          <div className="sidebar-header"><h3>Events in {currentDate.toLocaleDateString('en-US', { month: 'long' })}</h3><span className="event-count-badge">{monthEvents.length} events</span></div>
          <div className="sidebar-events-list">
            {monthEvents.length === 0 ? (<div className="no-events-sidebar"><div className="no-events-icon">📅</div><p>No events this month</p></div>) : (
              monthEvents.map(event => (
                <div key={event._id} className="sidebar-event-item" onClick={() => navigate(`/event/${event._id}`)}
                  style={{ borderLeft: `5px solid ${getCategoryColor(event.eventCategory)}`, backgroundColor: getCategoryBgColor(event.eventCategory) }}>
                  <div className="sidebar-event-date-box" style={{ backgroundColor: getCategoryColor(event.eventCategory) }}>
                    <span className="sidebar-event-day">{new Date(event.eventDate).getDate()}</span>
                    <span className="sidebar-event-weekday">{new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                  <div className="sidebar-event-info">
                    <h4>{event.eventTitle}</h4>
                    <p className="sidebar-event-time">🕐 {event.startTime} - {event.endTime}</p>
                    <p className="sidebar-event-venue">📍 {event.venue}</p>
                    <span className="sidebar-event-category" style={{ backgroundColor: getCategoryColor(event.eventCategory), color: 'white' }}>{event.eventCategory === 'Other' ? event.customCategory : event.eventCategory}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;