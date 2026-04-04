import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar.jsx';
import CreateEvent from './components/CreateEvent.jsx';
import EventCalendar from './components/EventCalendar.jsx';
import EventRegistration from './components/EventRegistration.jsx';
import ManageEvents from './components/ManageEvents.jsx';
import EventDetails from './components/EventDetails.jsx';
import Dashboard from './components/Dashboard.jsx';
import StudentEvents from './components/StudentEvents.jsx';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState('student');

  const toggleRole = () => {
    setUserRole(prev => prev === 'student' ? 'clubadmin' : 'student');
  };

  return (
    <Router>
      <div className="App">
        <Navbar userRole={userRole} toggleRole={toggleRole} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              userRole === 'student' ? <StudentEvents /> : <Dashboard />
            } />
            <Route path="/calendar" element={<EventCalendar />} />
            <Route path="/register" element={<EventRegistration userRole={userRole} />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/all-events" element={<StudentEvents />} />
            <Route path="/dashboard" element={
              userRole === 'clubadmin' ? <Dashboard /> :
                <div className="access-denied">
                  <div className="access-denied-icon">🔒</div>
                  <h2>Access Denied</h2>
                  <p>Only Club Admins can view the dashboard</p>
                </div>
            } />
            <Route path="/create-event" element={
              userRole === 'clubadmin' ? <CreateEvent /> :
                <div className="access-denied">
                  <div className="access-denied-icon">🔒</div>
                  <h2>Access Denied</h2>
                  <p>Only Club Admins can create events</p>
                </div>
            } />
            <Route path="/edit-event/:id" element={
              userRole === 'clubadmin' ? <CreateEvent /> :
                <div className="access-denied">
                  <div className="access-denied-icon">🔒</div>
                  <h2>Access Denied</h2>
                  <p>Only Club Admins can edit events</p>
                </div>
            } />
            <Route path="/manage-events" element={
              userRole === 'clubadmin' ? <ManageEvents /> :
                <div className="access-denied">
                  <div className="access-denied-icon">🔒</div>
                  <h2>Access Denied</h2>
                  <p>Only Club Admins can manage events</p>
                </div>
            } />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;