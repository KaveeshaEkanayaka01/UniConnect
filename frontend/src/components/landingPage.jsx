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
      className="min-h-screen text-[#f3f5f9] overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(14, 18, 29, 0.78), rgba(14, 18, 29, 0.58)), url(${campusBackground})`,
      }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#ffffff] via-[#9eb1d7] to-[#2b4f93]" />

      <nav className="sticky top-0 z-40 bg-[#0f141f]/72 backdrop-blur-md border-b border-[#9eb1d7]/35">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-14 w-14 rounded-full bg-white/95 p-1 ring-1 ring-[#9eb1d7]/50 shadow-md">
              <img
                src={appLogo}
                alt="UniConnect Logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div>
              <span className="text-xl font-black text-[#f7f8fb] block">
                UniConnect
              </span>
              <span className="text-[10px] font-bold text-[#9eb1d7] uppercase">
                Student Network Portal
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-[#d8dce6] hover:text-[#8eb0ea] font-semibold text-sm"
            >
              Features
            </a>
            <a
              href="#faculties"
              className="text-[#d8dce6] hover:text-[#8eb0ea] font-semibold text-sm"
            >
              Faculties
            </a>
            <a
              href="#communities"
              className="text-[#d8dce6] hover:text-[#8eb0ea] font-semibold text-sm"
            >
              Communities
            </a>
            <Link
              to="/news-only"
              className="text-[#d8dce6] hover:text-[#8eb0ea] font-semibold text-sm"
            >
              News
            </Link>
            <Link
              to="/project-feed"
              className="text-[#d8dce6] hover:text-[#8eb0ea] font-semibold text-sm"
            >
              Projects
            </Link>
            <Link
              to="/analysis"
              className="text-[#d8dce6] hover:text-[#8eb0ea] font-semibold text-sm"
            >
              Analytics
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-[#e4e8f1] hover:text-[#8eb0ea] font-bold text-sm px-4 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#2f5ea8] text-[#f8fbff] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#3a6dbc] transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

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
              Manage clubs, explore campus news, showcase projects, and view club
              event analytics through one modern student platform.
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

            <div className="grid grid-cols-3 gap-3 pt-4">
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

          <div className="rounded-2xl border border-[#9eb1d7]/40 bg-[#111827]/80 shadow-xl p-6 space-y-4">
            <p className="text-xs uppercase text-[#9eb1d7] font-bold">
              Campus Pulse
            </p>

            <div className="space-y-3">
              <Link
                to="/news-only"
                className="block p-4 border border-[#9eb1d7]/25 rounded-lg bg-[#0d1424]/55 hover:border-[#8eb0ea]/60 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#f3f6fb]">Campus News Hub</p>
                    <p className="text-xs text-[#bcc6d8]">
                      Read the latest announcements and updates
                    </p>
                  </div>
                  <Newspaper className="text-[#9eb1d7]" size={20} />
                </div>
              </Link>

              <Link
                to="/project-feed"
                className="block p-4 border border-[#9eb1d7]/25 rounded-lg bg-[#0d1424]/55 hover:border-[#8eb0ea]/60 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#f3f6fb]">Student Projects</p>
                    <p className="text-xs text-[#bcc6d8]">
                      Discover creative and technical project work
                    </p>
                  </div>
                  <FolderOpen className="text-[#9eb1d7]" size={20} />
                </div>
              </Link>

              <Link
                to="/analysis"
                className="block p-4 border border-[#9eb1d7]/25 rounded-lg bg-[#0d1424]/55 hover:border-[#8eb0ea]/60 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#f3f6fb]">
                      Club Event Analytics
                    </p>
                    <p className="text-xs text-[#bcc6d8]">
                      View engagement, participation, and event insights
                    </p>
                  </div>
                  <BarChart3 className="text-[#9eb1d7]" size={20} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-[#f2f6ff] border-y border-[#cddbf3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs text-[#2f5ea8] font-bold uppercase">
              Core Platform
            </p>
            <h2 className="text-3xl font-black mt-2 text-[#1b2230]">
              Everything You Need
            </h2>
            <p className="text-sm text-[#5a6475] mt-3 max-w-2xl mx-auto">
              UniConnect brings together student life, university updates,
              project showcases, and analytics in a single connected platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {featureCards.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="bg-[#ffffff] border border-[#d1def5] p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="h-12 w-12 rounded-xl bg-[#eaf1ff] flex items-center justify-center mb-4">
                  <Icon className="text-[#2f5ea8]" size={22} />
                </div>
                <h3 className="font-black text-lg text-[#1b2230]">{title}</h3>
                <p className="text-sm text-[#4b5568] mt-2">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faculties" className="py-20 bg-[#eef4ff]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs text-[#2f5ea8] font-bold uppercase">
              Faculties
            </p>
            <h2 className="text-3xl font-black mt-2 text-[#1b2230]">
              Built For Every Faculty
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {facultyCards.map((faculty) => (
              <div
                key={faculty.title}
                className="rounded-2xl bg-white border border-[#d7e2f6] p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="text-[#2f5ea8]" size={22} />
                  <h3 className="font-black text-[#1b2230] text-lg">
                    {faculty.title}
                  </h3>
                </div>
                <p className="text-sm text-[#516072]">{faculty.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="communities" className="py-20 bg-[#ffffff] border-y border-[#dbe6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs text-[#2f5ea8] font-bold uppercase">
              Community
            </p>
            <h2 className="text-3xl font-black mt-2 text-[#1b2230]">
              Explore Connected Communities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {communityCards.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#d8e3f7] bg-[#f8fbff] p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-black text-[#1b2230] text-lg">{item.title}</h3>
                <p className="text-sm text-[#516072] mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f7faff]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs text-[#2f5ea8] font-bold uppercase">
              Quick Access
            </p>
            <h2 className="text-3xl font-black mt-2 text-[#1b2230]">
              Discover More In UniConnect
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/news-only"
              className="group rounded-2xl bg-white border border-[#d7e2f6] p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#eaf1ff] flex items-center justify-center mb-4">
                <Newspaper className="text-[#2f5ea8]" size={24} />
              </div>
              <h3 className="text-xl font-black text-[#1b2230]">NewsOnlyPage</h3>
              <p className="text-sm text-[#516072] mt-2">
                Browse announcements, featured stories, university updates, and
                important campus information.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-[#2f5ea8] font-bold text-sm group-hover:gap-3 transition-all">
                Open News <ArrowRight size={16} />
              </div>
            </Link>

            <Link
              to="/project-feed"
              className="group rounded-2xl bg-white border border-[#d7e2f6] p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#efe9ff] flex items-center justify-center mb-4">
                <FolderOpen className="text-[#5b3fb4]" size={24} />
              </div>
              <h3 className="text-xl font-black text-[#1b2230]">ProjectFeed</h3>
              <p className="text-sm text-[#516072] mt-2">
                Explore student innovations, research ideas, software builds, and
                faculty-backed project showcases.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-[#5b3fb4] font-bold text-sm group-hover:gap-3 transition-all">
                Open Projects <ArrowRight size={16} />
              </div>
            </Link>

            <Link
              to="/analysis"
              className="group rounded-2xl bg-white border border-[#d7e2f6] p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#e8f7f3] flex items-center justify-center mb-4">
                <BarChart3 className="text-[#0f8b72]" size={24} />
              </div>
              <h3 className="text-xl font-black text-[#1b2230]">
                ClubEventAnalysis
              </h3>
              <p className="text-sm text-[#516072] mt-2">
                View analytics on club participation, event reach, engagement
                trends, and performance insights.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-[#0f8b72] font-bold text-sm group-hover:gap-3 transition-all">
                Open Analytics <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-xl bg-[#101623] text-[#f3f6fb] border border-[#9eb1d7]/30 p-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black">Start your journey today</h3>
              <p className="text-sm mt-2 text-[#ced6e6]">
                Join UniConnect and explore clubs, projects, news, and analytics.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="bg-[#2f5ea8] text-[#f8fbff] px-6 py-3 rounded-lg font-bold hover:bg-[#3a6dbc] transition"
              >
                Get Started
              </Link>
              <Link
                to="/news-only"
                className="border border-[#9eb1d7]/40 text-[#f8fbff] px-6 py-3 rounded-lg font-bold hover:bg-white/5 transition"
              >
                Explore News
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#9eb1d7]/25 bg-[#0f141f] py-6 text-center text-[#d0d9eb] text-sm">
        UniConnect Student Platform
      </footer>
    </div>
  );
};

export default LandingPage;