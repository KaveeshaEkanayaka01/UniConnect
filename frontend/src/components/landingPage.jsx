
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Banner / SLIIT Identity Strip */}
      <div className="bg-[#004a99] h-1 w-full"></div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#004a99] rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            S
          </div>
          <div>
            <span className="text-2xl font-extrabold text-[#004a99] block leading-none">SLIIT</span>
            <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">UniClub Portal</span>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-600 hover:text-[#004a99] font-semibold text-sm transition-colors">Faculties</a>
          <a href="#" className="text-gray-600 hover:text-[#004a99] font-semibold text-sm transition-colors">Clubs Directory</a>
          <a href="#" className="text-gray-600 hover:text-[#004a99] font-semibold text-sm transition-colors">Events</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-[#004a99] font-bold text-sm px-4 py-2 transition-colors">Login</Link>
          <Link to="/register" className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-50 rounded-full opacity-50 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center relative z-10">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Official Student Management Portal</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1]">
              Elevate Your <span className="text-[#004a99]">SLIIT</span> <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004a99] to-blue-500 italic">Experience.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              The centralized hub for SLIIT students to manage club memberships, track professional skills, earn university badges, and find expert mentors.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Link to="/register" className="bg-[#004a99] text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-blue-900 transition-all transform hover:scale-105 shadow-2xl shadow-blue-200">
                Join the Portal
              </Link>
              <button className="bg-white border-2 border-gray-200 text-gray-700 px-10 py-4 rounded-2xl text-lg font-bold hover:border-orange-500 hover:text-orange-500 transition-all group">
                Explore Clubs <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </button>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-6 pt-10 border-t border-gray-100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <img key={i} src={`https://picsum.photos/60/60?random=${i + 40}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" alt="student" />
                ))}
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-gray-900 leading-none">5,000+</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Active SLIIT Students</p>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 mt-20 lg:mt-0 relative">
            <div className="relative z-10 p-4">
              <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 opacity-10"></div>
              <img 
                src="./images/SLIIT.jpg" 
                className="relative z-20 rounded-[2.5rem] shadow-2xl border-8 border-white object-cover aspect-[4/3]" 
                alt="SLIIT Students" 
              />
              {/* Floating Badge Card */}
              <div className="absolute -bottom-10 -left-10 z-30 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 animate-bounce transition-all hover:animate-none">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <p className="text-sm font-black text-gray-900">New Badge Earned!</p>
                    <p className="text-xs font-bold text-orange-500">IEEE Member 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* University Stats Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-4xl font-black text-[#004a99] mb-2">40+</div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Clubs</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-4xl font-black text-orange-500 mb-2">120+</div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Certified Mentors</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-4xl font-black text-green-500 mb-2">3k+</div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Skills Tracked</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-4xl font-black text-purple-500 mb-2">15k+</div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Badges Issued</p>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Empowering Every Faculty</h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">UniClub provides specialized tools and event management for all SLIIT faculties.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Computing', 'Business', 'Engineering', 'Humanities'].map((faculty) => (
            <div key={faculty} className="group p-8 bg-white rounded-3xl border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mb-6 group-hover:bg-[#004a99] group-hover:text-white transition-colors">
                {faculty === 'Computing' ? '💻' : faculty === 'Business' ? '📊' : faculty === 'Engineering' ? '⚙️' : '📚'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Faculty of {faculty}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Access dedicated clubs and specialized mentorship programs for {faculty} students.</p>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-block">Learn More →</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#004a99] text-xl font-bold">S</div>
              <span className="text-2xl font-black tracking-tight">SLIIT UniClub</span>
            </div>
            <p className="text-gray-400 max-w-md font-medium leading-relaxed">
              Official student club and event management system of the Sri Lanka Institute of Information Technology (SLIIT). Empowering the next generation of leaders through technology and collaboration.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Campus Map</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Academic Calendar</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Student Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Contact Us</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li className="flex items-center space-x-2"><span>📍</span> <span>Malabe, Sri Lanka</span></li>
              <li className="flex items-center space-x-2"><span>📞</span> <span>+94 11 754 4801</span></li>
              <li className="flex items-center space-x-2"><span>✉️</span> <span>info@sliit.lk</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
          &copy; 2024 SLIIT Student Management System. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
