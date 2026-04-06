import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { icon: "🏠", label: "Dashboard",       path: "/admin-dashboard" },
  { icon: "📰", label: "Manage News",     path: "/manage-news" },
  { icon: "🚀", label: "Manage Projects", path: "/upload-project" },
];

const statCards = [
  { icon: "📰", label: "Total News",      value: "24", trend: "+3 this week",  color: "from-indigo-500 to-purple-500", bg: "bg-indigo-50", iconBg: "bg-indigo-100 text-indigo-600" },
  { icon: "🚀", label: "Total Projects",  value: "12", trend: "+1 this week",  color: "from-sky-500 to-cyan-500",      bg: "bg-sky-50",    iconBg: "bg-sky-100 text-sky-600"       },
  { icon: "👥", label: "Total Members",   value: "5",  trend: "Active admins", color: "from-emerald-500 to-teal-500",  bg: "bg-emerald-50",iconBg: "bg-emerald-100 text-emerald-600"},
  { icon: "📅", label: "Upcoming Events", value: "3",  trend: "This month",    color: "from-rose-500 to-pink-500",     bg: "bg-rose-50",   iconBg: "bg-rose-100 text-rose-600"     },
];

const quickActions = [
  { icon: "✏️", label: "Add News",    path: "/manage-news/new",    color: "from-indigo-500 to-purple-600" },
  { icon: "📤", label: "Add Project", path: "/upload-project",      color: "from-sky-500 to-cyan-600"      },
];

const recentActivities = [
  { action: "New news article published",  time: "2 min ago",   icon: "📰", bg: "bg-indigo-100" },
  { action: "Project upvoted by a member", time: "15 min ago",  icon: "👍", bg: "bg-sky-100"    },
  { action: "New member registered",       time: "1 hour ago",  icon: "👤", bg: "bg-purple-100" },
  { action: "Event announcement added",    time: "3 hours ago", icon: "🎯", bg: "bg-rose-100"   },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc" }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-64 min-h-screen border-r border-slate-200 bg-white flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center pulse-glow">
              <span className="text-white font-black text-sm">Uni</span>
            </div>
            <div>
              <div className="text-slate-800 font-bold text-base">Uni Connect</div>
              <div className="text-slate-400 text-sm">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest px-3 mb-3">Navigation</p>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className="sidebar-link"
              onClick={() => navigate(item.path)}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => navigate("/")}
            className="sidebar-link w-full text-rose-400 hover:text-rose-600"
          >
            <span className="text-lg">🚪</span>
            <span>Exit to Site</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, Admin 👋</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">

          {/* Stat Cards */}
          <section>
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {statCards.map((card) => (
                <div key={card.label} className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                  <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center text-xl mb-4`}>
                    {card.icon}
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 mb-1">{card.value}</div>
                  <div className="text-slate-500 text-sm mb-1">{card.label}</div>
                  <div className="text-emerald-500 text-xs font-medium">{card.trend}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions + Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">

            <div className="glass-card p-6">
              <h3 className="text-slate-800 font-semibold text-base mb-5">⚡ Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium text-sm hover:opacity-90 hover:scale-[1.01] transition-all shadow-md`}
                  >
                    <span className="text-xl">{action.icon}</span>
                    {action.label}
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                ))}
                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <span className="text-xl">🌐</span>
                  View Live Site
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-slate-800 font-semibold text-base mb-5">🕑 Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center text-base flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm">{item.action}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manage Content */}
          <div className="glass-card p-6">
            <h3 className="text-slate-800 font-semibold text-base mb-5">📂 Manage Content</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/manage-news")}
                className="flex items-center justify-between p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📰</span>
                  <div className="text-left">
                    <p className="text-slate-800 font-medium text-sm">News Management</p>
                    <p className="text-slate-400 text-xs">Create, edit, delete articles</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/upload-project")}
                className="flex items-center justify-between p-5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <div className="text-left">
                    <p className="text-slate-800 font-medium text-sm">Project Management</p>
                    <p className="text-slate-400 text-xs">Upload and manage projects</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
