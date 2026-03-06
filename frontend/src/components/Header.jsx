import React from 'react';
import { Search, Bell, Menu, ChevronDown, Sparkles, Command } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ onToggleSidebar, userName, avatar, pageTitle, onLogout }) => {
  const location = useLocation();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      return {};
    }
  })();
  const displayName = userName || storedUser.fullName || storedUser.name || 'User';
  

  const resolvedTitle = pageTitle || (location.pathname === '/dashboard'
    ? 'Dashboard'
    : location.pathname
        .replace('/', '')
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '));

  return (
    <header className="sticky top-0 z-40 h-20 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10">
      {/* Left */}
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 -ml-2 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md lg:hidden text-slate-500 transition-all active:scale-95"
        >
          <Menu size={20} />

        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600/60 uppercase tracking-widest">
            <Sparkles size={10} />
            <span>Workspace</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
            {resolvedTitle}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-xl mx-12">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-11 pr-16 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-200 transition-all outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-50 group-focus-within:opacity-100 transition">
            <span className="flex items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Command size={10} />
              K
            </span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        

        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        {/* Notification */}
        <button className="relative p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 ring-2 ring-white rounded-full"></span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition"
          >
            Logout
          </button>
        )}

        {/* Profile */}
        <button className="flex items-center gap-3 p-1.5 pl-1.5 pr-3 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-sm transition group">
          <div className="relative">
            <img
              src={avatar || "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"}
              alt="Avatar"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-indigo-100 transition"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-lg"></div>
          </div>

          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{displayName}</p>
            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-tight mt-0.5">
              Online
            </p>
          </div>

          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition ml-1" />
        </button>
      </div>
    </header>
  );
};

export default Header;
