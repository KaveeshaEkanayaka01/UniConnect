import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserPlus, FaUsers, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaTicketAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EventRegistration = ({ userRole }) => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [slotInfo, setSlotInfo] = useState(null);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [waitlistStudents, setWaitlistStudents] = useState([]);
  const [formData, setFormData] = useState({ studentName: '', studentEmail: '', contactNumber: '', specialRequests: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => {
    if (selectedEventId) { fetchEventDetails(); fetchSlotInfo(); fetchRegistrations(); }
    else { setSelectedEvent(null); setSlotInfo(null); setRegisteredStudents([]); setWaitlistStudents([]); }
  }, [selectedEventId]);

  const fetchEvents = async () => { try { const res = await axios.get(`${API_URL}/api/events`); setEvents(res.data.filter(e => new Date(e.registrationDeadline) >= new Date())); } catch { toast.error('Failed to load events'); } };
  const fetchEventDetails = async () => { try { const res = await axios.get(`${API_URL}/api/events/${selectedEventId}`); setSelectedEvent(res.data); } catch { toast.error('Failed to load event details'); } };
  const fetchSlotInfo = async () => { try { const res = await axios.get(`${API_URL}/api/registrations/slots/${selectedEventId}`); setSlotInfo(res.data); } catch { console.error('Failed to fetch slot info'); } };
  const fetchRegistrations = async () => { try { const res = await axios.get(`${API_URL}/api/registrations/event/${selectedEventId}`); setRegisteredStudents(res.data.registered); setWaitlistStudents(res.data.waitlist); } catch { console.error('Failed to fetch registrations'); } };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber') { const n = value.replace(/[^0-9]/g, ''); if (n.length <= 10) setFormData(prev => ({ ...prev, [name]: n })); return; }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId) { toast.error('Please select an event'); return; }
    if (formData.contactNumber.length !== 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/registrations`, { eventId: selectedEventId, ...formData });
      toast.success(res.data.message);
      setFormData({ studentName: '', studentEmail: '', contactNumber: '', specialRequests: '' });
      fetchSlotInfo(); fetchRegistrations();
    } catch (error) { toast.error(error.response?.data?.message || 'Registration failed'); } finally { setLoading(false); }
  };

  const handleRemoveRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to remove this registration?')) return;
    try {
      const res = await axios.delete(`${API_URL}/api/registrations/${registrationId}`);
      toast.success(res.data.message);
      if (res.data.promotedStudent) toast.info(`${res.data.promotedStudent} has been promoted from the waitlist!`);
      fetchSlotInfo(); fetchRegistrations();
    } catch { toast.error('Failed to remove registration'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📝 {userRole === 'clubadmin' ? 'Event Registrations' : 'Student Event Registration'}</h1>
        <p>{userRole === 'clubadmin' ? 'View and manage event registrations' : 'Select an event and register'}</p>
      </div>
      <div className="registration-container">
        <div className="registration-form-section">
          <h2 style={{ marginBottom: '20px', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}><FaTicketAlt style={{ marginRight: '8px' }} />{userRole === 'clubadmin' ? 'Event Selection' : 'Registration Form'}</h2>
          <div className="form-group">
            <label>Select Event <span className="required">*</span></label>
            <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} required>
              <option value="">-- Select an Event --</option>
              {events.map(event => (<option key={event._id} value={event._id}>{event.eventTitle} - {new Date(event.eventDate).toLocaleDateString()}</option>))}
            </select>
          </div>
          {selectedEvent && slotInfo && (
            <div className="event-details-card">
              <h3>{selectedEvent.eventTitle}</h3>
              <div className="event-detail-row"><FaCalendarAlt color="#3b82f6" /><span>{new Date(selectedEvent.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
              <div className="event-detail-row"><FaClock color="#3b82f6" /><span>{selectedEvent.startTime} - {selectedEvent.endTime}</span></div>
              <div className="event-detail-row"><FaMapMarkerAlt color="#3b82f6" /><span>{selectedEvent.venue}</span></div>
              <div className="slots-info">
                <span className={`slot-badge ${slotInfo.remainingSlots > 0 ? 'slot-available' : 'slot-full'}`}>{slotInfo.remainingSlots > 0 ? `${slotInfo.remainingSlots} slots remaining` : 'Event Full'}</span>
                <span className="slot-badge slot-waitlist-count">{slotInfo.registeredCount}/{slotInfo.totalCapacity} registered</span>
                {slotInfo.waitlistCount > 0 && <span className="slot-badge slot-waitlist-count">{slotInfo.waitlistCount} in waitlist</span>}
              </div>
            </div>
          )}
          {selectedEventId && (
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Student Name <span className="required">*</span></label><input type="text" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Enter full name" required /></div>
              <div className="form-group"><label>Student Email <span className="required">*</span></label><input type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange} placeholder="Enter email address" required /></div>
              <div className="form-group">
                <label>Contact Number <span className="required">*</span></label>
                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Enter 10-digit contact number" required maxLength="10" />
                {formData.contactNumber.length > 0 && formData.contactNumber.length < 10 && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>⚠️ Phone number must be 10 digits</p>}
                <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '3px' }}>{formData.contactNumber.length}/10 digits</p>
              </div>
              <div className="form-group"><label>Special Requests</label><textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} placeholder="Any dietary requirements, accessibility needs, etc." rows="3" /></div>
              <button type="submit" className="btn btn-success" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}><FaUserPlus /> {loading ? 'Registering...' : 'Register for Event'}</button>
            </form>
          )}
        </div>
        <div className="registration-lists-section">
          <div className="registration-list">
            <h3 className="registered-title"><FaUsers /> Registered Students ({registeredStudents.length})</h3>
            {registeredStudents.length === 0 ? (<div className="empty-state" style={{ padding: '25px' }}><p>No students registered yet</p></div>) : (
              registeredStudents.map((reg, i) => (
                <div key={reg._id} className="student-item">
                  <div className="student-info"><h4>{i + 1}. {reg.studentName}</h4><p>{reg.studentEmail} | {reg.contactNumber}</p></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="status-badge status-registered">Registered</span>
                    {userRole === 'clubadmin' && <button className="remove-btn" onClick={() => handleRemoveRegistration(reg._id)} title="Remove registration"><FaTrash /></button>}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="registration-list">
            <h3 className="waitlist-title"><FaClock /> Waiting List ({waitlistStudents.length})</h3>
            {waitlistStudents.length === 0 ? (<div className="empty-state" style={{ padding: '25px' }}><p>No students in waitlist</p></div>) : (
              waitlistStudents.map((reg, i) => (
                <div key={reg._id} className="student-item">
                  <div className="student-info"><h4>{i + 1}. {reg.studentName}</h4><p>{reg.studentEmail} | {reg.contactNumber}</p></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="status-badge status-waitlist">Waitlist #{i + 1}</span>
                    {userRole === 'clubadmin' && <button className="remove-btn" onClick={() => handleRemoveRegistration(reg._id)} title="Remove from waitlist"><FaTrash /></button>}
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

export default EventRegistration;