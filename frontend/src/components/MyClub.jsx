
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from './Auth/axios';
import { 
  Search, 
  Users, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  MoreVertical,
  Filter,
  Globe,
  Lock,
  Zap
} from 'lucide-react';

const normalizeClub = (club, index) => ({
  id: String(club?._id || club?.id || `club-${index}`),
  name: club?.name || 'Unnamed Club',
  category: club?.category || 'General',
  members: Number.isFinite(Number(club?.members)) ? Number(club.members) : 0,
  image: club?.image || '',
  description: club?.description || 'No description available yet.',
  isPrivate: Boolean(club?.isPrivate),
  role: ['President', 'Member', 'Admin'].includes(club?.role) ? club.role : 'Member',
  tags: Array.isArray(club?.tags) ? club.tags : [],
  unreadMessages: Number.isFinite(Number(club?.unreadMessages)) ? Number(club.unreadMessages) : 0,
  upcomingEvent: typeof club?.upcomingEvent === 'string' ? club.upcomingEvent : '',
});

const MyClubs  = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my');
  const [myClubs, setMyClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedClubs = async () => {
      try {
        const { data } = await API.get('/student/dashboard');
        const joinedClubs = Array.isArray(data?.profile?.joinedClubs)
          ? data.profile.joinedClubs
          : [];
        setMyClubs(joinedClubs.map(normalizeClub));
      } catch (error) {
        setMyClubs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJoinedClubs();
  }, []);

  const filteredMyClubs = myClubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">My Clubs</h1>
          <p className="mt-2 text-slate-500 max-w-lg">
            View your memberships and discover new communities on campus.
          </p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('my')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Memberships
          </button>
          <button 
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'discover' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Discover
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clubs, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="wait">
        {activeTab === 'my' ? (
          <motion.div 
            key="my-clubs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {isLoading && (
              <div className="md:col-span-2 xl:col-span-3 bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-500 font-semibold">
                Loading your clubs...
              </div>
            )}
            {!isLoading && filteredMyClubs.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 bg-white rounded-3xl border border-slate-100 p-8 text-center">
                <h3 className="text-xl font-black text-slate-900 mb-2">No joined clubs yet</h3>
                <p className="text-sm text-slate-500">Switch to Discover to find clubs and join communities.</p>
              </div>
            )}
            {filteredMyClubs.map((club) => (
              <div key={club.id} className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden flex flex-col">
                {/* Club Image/Header */}
                <div className="relative h-48 overflow-hidden">
                  {club.image ? (
                    <img 
                      src={club.image} 
                      alt={club.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-500 text-sm font-bold">No club image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                      {club.category}
                    </span>
                    {club.isPrivate && (
                      <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full text-white">
                        <Lock size={12} />
                      </div>
                    )}
                  </div>

                  <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-indigo-600">
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Club Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{club.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <Users size={12} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">+{club.members.toLocaleString()} members</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      club.role === 'President' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      club.role === 'Admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      'bg-slate-50 text-slate-500 border border-slate-100'
                    }`}>
                      {club.role}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                    {club.description}
                  </p>

                  {club.upcomingEvent && (
                    <div className="mb-6 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                        <Calendar size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider leading-none mb-0.5">Upcoming</p>
                        <p className="text-xs font-bold text-indigo-900 truncate">{club.upcomingEvent}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer relative">
                        <MessageSquare size={18} />
                        {club.unreadMessages && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                            {club.unreadMessages}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                        <Globe size={18} />
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-indigo-600 font-black text-sm group/btn">
                      Enter Club
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="discover-clubs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Zap size={12} className="fill-current" />
                Discover Clubs
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No club suggestions available</h3>
              <p className="text-sm text-slate-500">Sample clubs and sample images were removed. Real discover data can be connected later.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyClubs;
