import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, User, Zap, Trophy, Users,
  ChevronLeft, ChevronRight, LogOut, ShieldCheck, Settings
} from 'lucide-react';
import SidebarLink from './Sidebar';
import Header from './Header';

const Layout = ( ) => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      return {};
    }

  })();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState('online');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280 && isSidebarOpen) setIsSidebarOpen(false);
      if (window.innerWidth >= 1280 && !isSidebarOpen) setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const navigation = [
    { section: 'Overview', items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/skills', label: 'Skills', icon: Zap },
      { to: '/badges', label: 'Badges', icon: Trophy },
    ]},
    { section: 'Network', items: [
       
      { to: '/my-clubs', label: 'My Clubs', icon: ShieldCheck }
    ]},
    { section: 'Configure', items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ]},
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r transition-all ${isSidebarOpen ? 'w-72' : 'w-24'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b">
          <span className="font-black text-xl text-indigo-600">UniConnect</span>
        </div>

        <nav className="p-4 space-y-6">
          {navigation.map(section => (
            <div key={section.section} className="space-y-1">
              {section.items.map(item => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={location.pathname === item.to}
                  collapsed={!isSidebarOpen}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-bold"
          >
            <LogOut size={18} /> {isSidebarOpen && 'Logout'}
            
             
          </button>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute -right-4 top-24 w-8 h-8 bg-white border rounded-full items-center justify-center shadow"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Header
          onToggleSidebar={() => setIsMobileMenuOpen((v) => !v)}
          userName={storedUser.fullName || storedUser.name}
          avatar={storedUser.avatar}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
