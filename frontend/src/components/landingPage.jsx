import React from "react";
import { Link } from "react-router-dom";
import campusBackground from "../../images/SLIIT-malabe.jpg";
import appLogo from "../../images/uniconnect.png";
import {
  Newspaper,
  FolderOpen,
  BarChart3,
  Users,
  GraduationCap,
  Building2,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const LandingPage = () => {
  const featureCards = [
    {
      title: "Club Management",
      description:
        "Create, manage, and grow student clubs with approvals, memberships, and activities in one place.",
      icon: Building2,
    },
    {
      title: "Mentor Matching",
      description:
        "Connect students with mentors and guide them through academic and career growth.",
      icon: Users,
    },
    {
      title: "Skill Tracking",
      description:
        "Showcase student talents, achievements, certifications, and progress across campus life.",
      icon: Sparkles,
    },
    {
      title: "Badge Portfolio",
      description:
        "Recognize student involvement with verified badges, awards, and accomplishment records.",
      icon: Award,
    },
  ];

  const facultyCards = [
    {
      title: "Computing",
      text: "Technology, software, AI, cybersecurity, and innovation-driven learning communities.",
    },
    {
      title: "Engineering",
      text: "Hands-on projects, robotics, sustainable systems, and technical problem solving.",
    },
    {
      title: "Business",
      text: "Entrepreneurship, leadership, finance, marketing, and collaborative ventures.",
    },
    {
      title: "Humanities & Design",
      text: "Creative communities, communication, media, arts, and social impact initiatives.",
    },
  ];

  const communityCards = [
    {
      title: "Student Clubs",
      text: "Join academic, social, creative, and leadership clubs to expand your network.",
    },
    {
      title: "Project Teams",
      text: "Collaborate on real university and community projects with peers from many faculties.",
    },
    {
      title: "Campus News",
      text: "Stay informed with announcements, highlights, event updates, and success stories.",
    },
    {
      title: "Event Insights",
      text: "Track club event performance and see analytics that help communities grow smarter.",
    },
  ];

  return (
  <div
    className="min-h-screen text-white overflow-x-hidden bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `linear-gradient(rgba(11,30,138,0.85), rgba(11,30,138,0.65)), url(${campusBackground})`,
    }}
  >
    {/* Top bar */}
    <div className="h-1 w-full bg-gradient-to-r from-[#0B1E8A] via-[#2F4FE3] to-[#F36C21]" />

    {/* Navbar */}
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0B1E8A]/90 backdrop-blur-md border-b border-[#F36C21]/40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-14 w-14 rounded-full bg-white p-1 shadow-md">
            <img src={appLogo} className="h-full w-full rounded-full object-cover" />
          </div>
          <div>
            <span className="text-xl font-black text-white block">UniConnect</span>
            <span className="text-[10px] font-bold text-[#F36C21] uppercase">
              Student Network Portal
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-[#F36C21] font-semibold text-sm">
            Features
          </a>
          <a href="#communities" className="hover:text-[#F36C21] font-semibold text-sm">
            Communities
          </a>
        </div>

        {/* Auth */}
        <div className="flex items-center space-x-3">
          <Link to="/login" className="hover:text-[#F36C21] font-bold text-sm px-4 py-2">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-[#F36C21] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-600 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-8">
          <h1 className="text-5xl font-black leading-snug">
            Your University Journey,
            <span className="block text-[#F36C21] mt-2">
              Powered In One Place
            </span>
          </h1>

          <p className="text-lg text-gray-200 max-w-xl">
            Manage clubs, explore campus news, showcase projects, and view analytics
            through one modern student platform.
          </p>

          <div className="flex gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-[#F36C21] font-bold hover:bg-orange-600"
            >
              Join UniConnect
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border border-white/40 font-bold hover:border-[#F36C21] hover:text-[#F36C21]"
            >
              Continue as Student
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 space-y-4 border border-white/20">
          
          <p className="text-xs uppercase text-[#F36C21] font-bold">
            Campus Pulse
          </p>

          <Link
            to="/news-only"
            className="block p-4 rounded-lg bg-[#0B1E8A]/60 hover:bg-[#0B1E8A]/80 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Campus News Hub</p>
                <p className="text-xs text-gray-300">Latest announcements</p>
              </div>
              <Newspaper className="text-[#F36C21]" />
            </div>
          </Link>

          <Link
            to="/project-feed"
            className="block p-4 rounded-lg bg-[#0B1E8A]/60 hover:bg-[#0B1E8A]/80 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Student Projects</p>
                <p className="text-xs text-gray-300">Explore work</p>
              </div>
              <FolderOpen className="text-[#F36C21]" />
            </div>
          </Link>

          <Link
            to="/analysis"
            className="block p-4 rounded-lg bg-[#0B1E8A]/60 hover:bg-[#0B1E8A]/80 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Event Analytics</p>
                <p className="text-xs text-gray-300">Insights & trends</p>
              </div>
              <BarChart3 className="text-[#F36C21]" />
            </div>
          </Link>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="features" className="py-20 bg-white text-[#0B1E8A]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black">Everything You Need</h2>

        <div className="grid md:grid-cols-4 gap-5 mt-10">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="bg-white border border-[#0B1E8A]/10 p-5 rounded-xl shadow hover:shadow-lg"
            >
              <div className="h-12 w-12 bg-[#0B1E8A]/10 flex items-center justify-center rounded-xl mb-4">
                <Icon className="text-[#0B1E8A]" />
              </div>
              <h3 className="font-black">{title}</h3>
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#0B1E8A] text-white p-10 rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">Start your journey today</h3>
            <p className="text-sm mt-2 text-gray-200">
              Join UniConnect and explore everything.
            </p>
          </div>
          <Link
            to="/register"
            className="bg-[#F36C21] px-6 py-3 rounded-lg font-bold hover:bg-orange-600"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-[#0B1E8A] text-center py-6 text-sm text-gray-300">
      UniConnect Student Platform
    </footer>
  </div>
);
};

export default LandingPage;