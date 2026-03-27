import React from "react";
import { Link } from "react-router-dom";
import campusBackground from "../../images/SLIIT-malabe.jpg";

const LandingPage = () => {
  return (
    <div
      className="min-h-screen text-gray-900 overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25)), url(${campusBackground})`,
      }}
    >

      {/* Top line */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-black" />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div>
              <img src="../../images/uniconnect.png" alt="UniConnect Logo" className="h-20 w-26 rounded-full" />
            </div>
            <div>
              <span className="text-xl font-black text-black block">UniConnect</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase ">
                Student Network Portal
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 font-semibold text-sm">Features</a>
            <a href="#faculties" className="text-gray-600 hover:text-blue-600 font-semibold text-sm">Faculties</a>
            <a href="#community" className="text-gray-600 hover:text-blue-600 font-semibold text-sm">Community</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-bold text-sm px-4 py-2">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-8">

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs uppercase font-bold text-blue-600">
                Official Campus Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-snug">
              Your University Journey,
              <span className="block text-blue-800 font-extrabold mt-1">
                Powered In One Place
              </span>
            </h1>

            <p className="text-lg text-orange-600 max-w-xl">
              Manage clubs, showcase skills, earn badges, and connect with mentors through a single platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl bg-blue-800 text-white font-bold text-center hover:bg-blue-700"
              >
                Join UniConnect
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl border border-gray-300 text-gray-800 font-bold text-center hover:border-blue-500 hover:text-blue-600"
              >
                Continue as Student
              </Link>
            </div>

            {/* Stats */}
            <div id="community" className="grid grid-cols-3 gap-3 pt-4">
              <div className="rounded-xl border bg-white shadow-sm p-4">
                <p className="text-2xl font-black text-blue-600">5k+</p>
                <p className="text-xs text-gray-500 font-bold mt-1">Students</p>
              </div>
              <div className="rounded-xl border bg-white shadow-sm p-4">
                <p className="text-2xl font-black text-black">120+</p>
                <p className="text-xs text-gray-500 font-bold mt-1">Mentors</p>
              </div>
              <div className="rounded-xl border bg-white shadow-sm p-4">
                <p className="text-2xl font-black text-blue-500">40+</p>
                <p className="text-xs text-gray-500 font-bold mt-1">Clubs</p>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="rounded-2xl border bg-white shadow-xl p-6 space-y-4">
            <p className="text-xs uppercase text-gray-500 font-bold">Campus Pulse</p>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-bold">AI & Robotics Club Meetup</p>
                <p className="text-xs text-gray-500">Today, 6:30 PM</p>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="font-bold">Mentorship Requests</p>
                <p className="text-xs text-gray-500">18 new this week</p>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="font-bold">New Badge Drop</p>
                <p className="text-xs text-gray-500">Community Builder badge</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-12">
            <p className="text-xs text-blue-600 font-bold uppercase">Core Platform</p>
            <h2 className="text-3xl font-black mt-2">Everything You Need</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {["Club Management", "Mentor Matching", "Skill Tracking", "Badge Portfolio"].map((title) => (
              <div key={title} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
                <h3 className="font-black text-lg">{title}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Professional tools to enhance your campus experience.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-xl bg-blue-600 text-white p-10 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black">Start your journey today</h3>
              <p className="text-sm mt-2 opacity-90">Join UniConnect now</p>
            </div>
            <Link to="/register" className="bg-white text-blue-800 px-6 py-3 rounded-lg font-bold">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-gray-500 text-sm">
        UniConnect Student Platform
      </footer>
    </div>
  );
};

export default LandingPage;