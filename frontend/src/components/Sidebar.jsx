import React from 'react';
import { Link } from 'react-router-dom';

const SidebarLink = ({ to, label, icon: Icon, active, collapsed }) => {
  return (
    <Link
      to={to}
      className={`
        group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40
        ${active 
          ? 'bg-white text-indigo-700 shadow-xl shadow-indigo-500/10 border border-white/20 translate-x-1' 
          : 'text-indigo-100 hover:bg-indigo-600 hover:text-white hover:shadow-sm hover:translate-x-1 border border-transparent'
        }
      `}
    >
      {/* Icon */}
      <div className={`
        relative flex items-center justify-center transition-all duration-300
        ${active 
          ? 'scale-110 text-indigo-600' 
          : 'group-hover:scale-110 group-hover:text-indigo-500'
        }
      `}>
        <div className={`
          absolute inset-0 rounded-xl blur-md opacity-0 transition
          ${active ? 'opacity-30 bg-indigo-500' : 'group-hover:opacity-20 bg-indigo-400'}
        `}></div>

        <Icon size={20} strokeWidth={active ? 2.5 : 2} className="relative z-10" />
      </div>

      {/* Label */}
      {!collapsed && (
        <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${active ? 'text-indigo-900' : ''}`}>
          {label}
        </span>
      )}

      {/* Active dot when collapsed */}
      {active && collapsed && (
        <span className="absolute right-2 w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-300 animate-pulse"></span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-xl opacity-0 invisible -translate-x-2 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap z-[100] pointer-events-none shadow-xl border border-white/10 uppercase tracking-widest">
          {label}
        </div>
      )}

      {/* Active Indicator Bar */}
      {active && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.6)]" />
      )}
    </Link>
  );
};

export default SidebarLink;
