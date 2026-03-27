import React from 'react';
import { Search, Bell, Menu, ChevronDown, Sparkles, Command, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const generateAvatarUrl = (fullName) => {
  const encodedName = encodeURIComponent(fullName);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&bold=true&size=256`;
};

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
  const avatarUrl = avatar || generateAvatarUrl(displayName);
  

  const resolvedTitle = pageTitle || (location.pathname === '/dashboard'
    ? 'Dashboard'
    : location.pathname
        .replace('/', '')
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '));

  return (
    <header className="sticky top-0 z-40 h-20 backdrop-blur-xl bg-white/80 border-b
     border-slate-200/60 flex items-center justify-between px-6 lg:px-10">
      {/* Left */}
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 -ml-2 rounded-xl bg-white border border-slate-100 shadow-sm 
          hover:shadow-md lg:hidden text-slate-500 transition-all active:scale-95"
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

       
      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        

        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

         

        {onLogout && (
          <button
            onClick={onLogout}
            className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition"
          >
            Logout
          </button>
        )}

        {/* Profile Avatar & Username */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-sm transition group">
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-indigo-100 transition"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&bold=true`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-lg"></div>
          </div>

          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{displayName}</p>
            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-tight mt-0.5">
              Online
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
