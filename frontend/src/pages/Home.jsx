import { useNavigate } from "react-router-dom";

const stats = [
  { label: "News Published", value: "124+", icon: "📰", bg: "bg-indigo-50",  icon_bg: "bg-indigo-100"  },
  { label: "Projects Shared", value: "56+",  icon: "🚀", bg: "bg-sky-50",    icon_bg: "bg-sky-100"    },
  { label: "Active Members",  value: "320+", icon: "👥", bg: "bg-purple-50", icon_bg: "bg-purple-100" },
  { label: "Events Held",     value: "18+",  icon: "🎯", bg: "bg-rose-50",   icon_bg: "bg-rose-100"   },
];

const features = [
  {
    icon: "📰", title: "Latest News",
    desc: "Stay updated with the latest technology news, club announcements, and industry trends curated by our team.",
    link: "/News-only", label: "Read News",
    color: "from-indigo-500 to-purple-600", light: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: "🚀", title: "Project Showcase",
    desc: "Explore innovative projects from our members. Like, comment, and get inspired by outstanding work.",
    link: "/ProjectFeed", label: "View Projects",
    color: "from-sky-500 to-cyan-600", light: "bg-sky-50 text-sky-600",
  },
  {
    icon: "🔧", title: "Admin Dashboard",
    desc: "Manage news, projects, and members from a powerful, centralized admin panel with full CRUD control.",
    link: "/admindashboard", label: "Open Dashboard",
    color: "from-rose-500 to-pink-600", light: "bg-rose-50 text-rose-600",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center text-center px-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50">
        {/* soft orbs */}
        <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            UNI Connect — Welcome
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
            Connect With{" "}
            <span className="gradient-text">Me</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your hub for technology news, student projects, event announcements,
            and everything happening in the IT club community.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/ProjectFeed")}
              className="glow-btn px-8 py-3.5 rounded-xl font-semibold text-base"
            >
              🚀 Explore Projects
            </button>
            <button
              onClick={() => navigate("/News-only")}
              className="px-8 py-3.5 rounded-xl text-slate-700 font-semibold text-base border border-slate-300 bg-white hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
            >
              📰 Read Latest News
            </button>
          </div>

          {/* Tech tags */}
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {["uni", "news", "analysis", "projectfeed", "clubs", "events"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-xs animate-bounce">
          <span>Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className={`glass-card p-6 text-center hover:scale-105 transition-transform duration-300 ${s.bg}`} style={{background: undefined}}>
              <div className={`w-12 h-12 rounded-xl ${s.icon_bg} flex items-center justify-center text-2xl mx-auto mb-3`}>
                {s.icon}
              </div>
              <div className="text-3xl font-extrabold gradient-text mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need, <span className="gradient-text">All in One Place</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From reading news to showcasing your projects — ITPM Pro has every tool your club needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card p-8 group hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => navigate(f.link)}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.color}`} />
                <div className={`w-12 h-12 rounded-xl ${f.light} flex items-center justify-center text-2xl mb-5 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{f.desc}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                  {f.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-12 text-center shadow-xl shadow-indigo-200">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Share Your Project?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
            Upload your project and let hundreds of fellow club members discover, like, and provide feedback on your work.
          </p>
          <button
            onClick={() => navigate("/UploadProject")}
            className="px-10 py-4 rounded-xl bg-white text-indigo-600 font-bold text-base hover:bg-indigo-50 transition shadow-lg"
          >
            🚀 Upload Project Now
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white py-8 px-4 text-center text-slate-400 text-sm">
        <p>© 2026 ITPM Pro — IT Project Management Club. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
