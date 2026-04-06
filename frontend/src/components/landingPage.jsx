import React from "react";
import { Link } from "react-router-dom";
import campusBackground from "../../images/SLIIT-malabe.jpg";
import appLogo from "../../images/uniconnect.png";

const LandingPage = () => {
  return (
    <div
      className="min-h-screen text-[#f3f5f9] overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(14, 18, 29, 0.72), rgba(14, 18, 29, 0.52)), url(${campusBackground})`,
      }}
    >

      {/* Top line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#ffffff] via-[#9eb1d7] to-[#2b4f93]" />


      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-8">

            <div className="inline-flex items-center gap-2 rounded-full border border-[#9eb1d7]/50 bg-[#0f141f]/65 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#9eb1d7] animate-pulse" />
              <span className="text-xs uppercase font-bold text-[#9eb1d7]">
                Official Campus Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-snug text-[#f9fbff]">
              Your University Journey,
              <span className="block text-[#9eb1d7] font-extrabold mt-1">
                Powered In One Place
              </span>
            </h1>

            <p className="text-lg text-[#d9dfec] max-w-xl">
              Manage clubs, showcase skills, earn badges, and connect with mentors through a single platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl bg-[#2f5ea8] text-[#f8fbff] font-bold text-center hover:bg-[#3a6dbc]"
              >
                Join UniConnect
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl border border-[#9eb1d7]/55 text-[#edf0f7] font-bold text-center hover:border-[#8eb0ea] hover:text-[#8eb0ea]"
              >
                Continue as Student
              </Link>
            </div>

            {/* Stats */}
            <div id="community" className="grid grid-cols-3 gap-3 pt-4">
              <div className="rounded-xl border border-[#9eb1d7]/35 bg-[#111827]/72 shadow-sm p-4">
                <p className="text-2xl font-black text-[#9eb1d7]">5k+</p>
                <p className="text-xs text-[#b6bece] font-bold mt-1">Students</p>
              </div>
              <div className="rounded-xl border border-[#ffffff]/30 bg-[#111827]/72 shadow-sm p-4">
                <p className="text-2xl font-black text-[#f4f6fb]">120+</p>
                <p className="text-xs text-[#b6bece] font-bold mt-1">Mentors</p>
              </div>
              <div className="rounded-xl border border-[#9eb1d7]/35 bg-[#111827]/72 shadow-sm p-4">
                <p className="text-2xl font-black text-[#9db4dd]">40+</p>
                <p className="text-xs text-[#b6bece] font-bold mt-1">Clubs</p>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="rounded-2xl border border-[#9eb1d7]/40 bg-[#111827]/80 shadow-xl p-6 space-y-4">
            <p className="text-xs uppercase text-[#9eb1d7] font-bold">Campus Pulse</p>

            <div className="space-y-3">
              <div className="p-3 border border-[#9eb1d7]/25 rounded-lg bg-[#0d1424]/55">
                <p className="font-bold text-[#f3f6fb]">AI & Robotics Club Meetup</p>
                <p className="text-xs text-[#bcc6d8]">Today, 6:30 PM</p>
              </div>

              <div className="p-3 border border-[#9eb1d7]/25 rounded-lg bg-[#0d1424]/55">
                <p className="font-bold text-[#f3f6fb]">Mentorship Requests</p>
                <p className="text-xs text-[#bcc6d8]">18 new this week</p>
              </div>

              <div className="p-3 border border-[#9eb1d7]/25 rounded-lg bg-[#0d1424]/55">
                <p className="font-bold text-[#f3f6fb]">New Badge Drop</p>
                <p className="text-xs text-[#bcc6d8]">Community Builder badge</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[#f2f6ff] border-y border-[#cddbf3]">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-12">
            <p className="text-xs text-[#2f5ea8] font-bold uppercase">Core Platform</p>
            <h2 className="text-3xl font-black mt-2 text-[#1b2230]">Everything You Need</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {["Club Management", "Mentor Matching", "Skill Tracking", "Badge Portfolio"].map((title) => (
              <div key={title} className="bg-[#ffffff] border border-[#d1def5] p-5 rounded-xl shadow hover:shadow-lg transition">
                <h3 className="font-black text-lg text-[#1b2230]">{title}</h3>
                <p className="text-sm text-[#4b5568] mt-2">
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
          <div className="rounded-xl bg-[#101623] text-[#f3f6fb] border border-[#9eb1d7]/30 p-10 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black">Start your journey today</h3>
              <p className="text-sm mt-2 text-[#ced6e6]">Join UniConnect now</p>
            </div>
            <Link to="/register" className="bg-[#2f5ea8] text-[#f8fbff] px-6 py-3 rounded-lg font-bold hover:bg-[#3a6dbc] transition">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#9eb1d7]/25 bg-[#0f141f] py-6 text-center text-[#d0d9eb] text-sm">
        UniConnect Student Platform
      </footer>
    </div>
  );
};

export default LandingPage;