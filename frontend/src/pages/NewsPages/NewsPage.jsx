import React, { useEffect, useState } from 'react';
import { getAllNews, deleteNews, createNews, updateNews } from '../../api/newsApi.js';
import toast from 'react-hot-toast';
import NewsList from '../../components/NewsComponents/NewsList.jsx';
import NewsForm from '../../components/NewsComponents/NewsForm.jsx';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
  { icon: "🏠", label: "Dashboard",       path: "/admindashboard" },
  { icon: "📰", label: "Manage News",     path: "/Managenews",    active: true },
  { icon: "🚀", label: "Manage Projects", path: "/UploadProject" },
];

const NewsPage = () => {
  const [newsList, setNewsList]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('list'); // 'list' or 'form'
  const [editingNews, setEditingNews] = useState(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await getAllNews();
      setNewsList(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleEdit = (news) => {
    setEditingNews(news);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news article? This action cannot be undone.')) {
      try {
        await deleteNews(id);
        toast.success('Article deleted');
        fetchNews();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingNews) {
        await updateNews(editingNews._id, formData);
        toast.success('Article updated successfully');
      } else {
        await createNews(formData);
        toast.success('Article published successfully');
      }
      setView('list');
      setEditingNews(null);
      fetchNews();
    } catch (error) {
      console.error("Submit error", error);
      toast.error('Failed to save article');
    }
  };

  const handleCancel = () => {
    setView('list');
    setEditingNews(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-64 min-h-screen border-r border-slate-200 bg-white flex flex-col shadow-sm flex-shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center pulse-glow">
              <span className="text-white font-black text-sm">Uni</span>
            </div>
            <div>
              <div className="text-slate-800 font-bold text-base">Uni Connect</div>
              <div className="text-slate-400 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`sidebar-link ${item.active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => navigate("/")} className="sidebar-link w-full text-rose-500 hover:text-rose-600">
            <span className="text-lg">🚪</span>
            <span className="text-sm">Exit to Site</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">📰 News Management</h1>
            <p className="text-slate-400 text-sm">Create, Update, and broadcast club news</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {view === 'list' ? (
            <>
              {/* ── ACTIONS BAR ── */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manage News</h2>
              <p className="text-slate-500 text-sm mt-1">Create, edit, and oversee club announcements and updates.</p>
            </div>
            <button 
              onClick={() => { setEditingNews(null); setView('form'); }} 
              className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-lg group-hover:rotate-90 transition-transform duration-300">＋</span>
              Create News
            </button>
          </div>

          {/* ── STATS OVERVIEW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">📰</div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total News</p>
                <p className="text-2xl font-black text-slate-800">{newsList.length}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">⚡</div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">System Status</p>
                <p className="text-sm font-bold text-slate-800">Active</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">📅</div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Last Update</p>
                <p className="text-sm font-bold text-slate-800">
                  {newsList.length > 0 && newsList[0].publishedDate 
                    ? new Date(newsList[0].publishedDate).toLocaleDateString() 
                    : "No Data"}
                </p>
              </div>
            </div>
          </div>

          {/* ── LIST CONTAINER ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span>📑</span> News List
              </h3>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                {newsList.length} Entries
              </span>
            </div>
            <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Content...</p>
              </div>
            ) : newsList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 grayscale opacity-30">📰</div>
                <p className="text-slate-500 font-medium">No articles found.</p>
                <button onClick={() => navigate('/Managenews/new')} className="text-indigo-600 text-sm font-bold mt-2 hover:underline">Create your first article</button>
              </div>
            ) : (
              <div className="grid gap-4">
                <NewsList
                  newsList={newsList}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isAdminView={true}
                />
              </div>
            )}
            </div>
          </div>
            </>
          ) : (
            /* ── FORM PANEL (Full Width) ── */
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handleCancel} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{editingNews ? "Edit Article" : "New News"}</h2>
                  <p className="text-slate-500 text-xs">Fill in the details below to broadcast.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8">
                <NewsForm 
                  onSubmit={handleFormSubmit}
                  editingNews={editingNews}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NewsPage;
