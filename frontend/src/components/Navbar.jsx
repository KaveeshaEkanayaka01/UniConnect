import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-medium transition-all duration-200 group ${isActive ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center pulse-glow">
              <span className="text-white font-black text-sm">Uni</span>
            </div>
            <span className="text-slate-800 font-bold text-lg tracking-tight">
              Uni <span className="gradient-text">Connect</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={linkClass} end>
              Home
              <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300 w-0 group-hover:w-full" />
            </NavLink>
            <NavLink to="/News-only" className={linkClass}>
              News
              <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300 w-0 group-hover:w-full" />
            </NavLink>
            <NavLink to="/ProjectFeed" className={linkClass}>
              Projects
              <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300 w-0 group-hover:w-full" />
            </NavLink>
            <NavLink to="/analysis" className={linkClass}>
              Club&Event Analysis
              <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300 w-0 group-hover:w-full" />
            </NavLink>
          </div>

          {/* Admin Button + Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admindashboard")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white glow-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Admin
            </button>

            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-1 fade-in-up">
            {[
              { to: "/", label: "Home" },
              { to: "/News-only", label: "News" },
              { to: "/ProjectFeed", label: "Projects" },
              { to: "/analysis", label: "Club&Event Analysis" },
              { to: "/admindashboard", label: "Admin Dashboard" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
