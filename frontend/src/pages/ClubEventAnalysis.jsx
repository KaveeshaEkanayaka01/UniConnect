import React, { useMemo, useState, useEffect } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
import { FiDownload } from 'react-icons/fi';
const formatNumber = (n) => Intl.NumberFormat().format(n);

const generateDummy = (rangeDays = 30) => {
  const scale = Math.max(1, Math.round(rangeDays / 30));
  const clubs = ['LEO Club', 'Rotract Club', 'IEEE', 'ISEC', 'MS Club'];
  const members = [120, 85, 60, 150, 70].map(v => v * scale);
  const bar = {
    labels: clubs,
    datasets: [
      { label: 'Members', data: members, backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6 },
    ],
  };
  const pie = {
    labels: ['Workshops', 'Seminars', 'Competitions', 'Club Activities'],
    datasets: [{ data: [50,20,10,5].map(v => Math.round(v * (1 + scale/10))), backgroundColor: ['#6366f1', '#06b6d4', '#f97316', '#ef4444'] }],
  };
  const line = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
    datasets: [{ label: 'Member Growth', data: [50,72,95,110,140,165,190].map(v => v * scale), borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.12)', tension: 0.35, fill: true, pointRadius: 3 }],
  };
  const doughnut = {
    labels: ['Posts','Likes','Comments','Event RSVPs'],
    datasets: [{ data: [300,450,120,80].map(v => v * scale), backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'] }],
  };
  return { bar, pie, line, doughnut };
}

const downloadCSV = (rows, filename = 'export.csv') => {
  // rows: array of arrays
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};

const ClubEventAnalysis = () => {
  const [rangePreset, setRangePreset] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState(30);
  const [dataSet, setDataSet] = useState(generateDummy(30));
  const [selectedClub, setSelectedClub] = useState('All');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setDataSet(generateDummy(rangeDays));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [rangeDays]);

  const kpis = useMemo(() => {
    const totalMembers = (dataSet.bar && dataSet.bar.datasets && dataSet.bar.datasets[0].data || []).reduce((a,b)=>a+b,0);
    const totalEngagement = (dataSet.doughnut && dataSet.doughnut.datasets && dataSet.doughnut.datasets[0].data || []).reduce((a,b)=>a+b,0);
    const clubs = (dataSet.bar && dataSet.bar.labels || []).length;
    const avgPerClub = Math.round(totalMembers / Math.max(1, clubs));
    return { totalMembers, totalEngagement, clubs, avgPerClub };
  }, [dataSet]);

  const filteredBar = useMemo(() => {
    const labels = (dataSet.bar && dataSet.bar.labels) || [];
    const base = (dataSet.bar && dataSet.bar.datasets && dataSet.bar.datasets[0].data) || [];
    if (selectedClub === 'All') return dataSet.bar;
    const idx = labels.indexOf(selectedClub);
    const newData = base.map((v,i) => (i === idx ? v : Math.round(v * 0.28)));
    const bg = labels.map((_,i) => (i===idx ? 'rgba(99,102,241,0.95)' : 'rgba(203,213,225,0.45)'));
    return { labels, datasets: [{ ...dataSet.bar.datasets[0], data: newData, backgroundColor: bg }] };
  }, [dataSet, selectedClub]);

  return (
    <div className="min-h-screen pb-16 bg-slate-50">
      <div className="relative py-12 px-4 text-center overflow-hidden border-b border-slate-200 bg-white">
        <div className="relative z-10">
         
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-2">📊 Club & Event  <span className="gradient-text">Analysis </span></h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Visual insights about club membership, activity, and engagement.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600 font-medium">Range:</label>
            <div className="inline-flex items-center gap-2">
              <button onClick={() => { setRangePreset('7d'); setRangeDays(7); }} className={`px-3 py-2 rounded-md text-sm ${rangePreset==='7d'?'bg-indigo-600 text-white':'bg-white text-slate-600 border border-slate-200'}`}>7d</button>
              <button onClick={() => { setRangePreset('30d'); setRangeDays(30); }} className={`px-3 py-2 rounded-md text-sm ${rangePreset==='30d'?'bg-indigo-600 text-white':'bg-white text-slate-600 border border-slate-200'}`}>30d</button>
              <button onClick={() => { setRangePreset('90d'); setRangeDays(90); }} className={`px-3 py-2 rounded-md text-sm ${rangePreset==='90d'?'bg-indigo-600 text-white':'bg-white text-slate-600 border border-slate-200'}`}>90d</button>
            </div>

            <div className="ml-4">
              <label className="text-sm text-slate-600 mr-2">Club:</label>
              <select value={selectedClub} onChange={(e)=>setSelectedClub(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md bg-white text-sm">
                <option value={'All'}>All</option>
                {(dataSet.barData || []).map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => { const rows = [[ 'name', 'members' ], ...(dataSet.barData || []).map(d => [d.name, d.members])]; downloadCSV(rows, 'members_per_club.csv'); }} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold inline-flex items-center gap-2"><FiDownload /> Export</button>
            <button onClick={() => { setRangePreset('30d'); setRangeDays(30); setSelectedClub('All'); }} className="px-3 py-2 rounded-md bg-white text-slate-600 text-sm border border-slate-200">Reset</button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 bg-white border border-slate-100">
            <div className="text-slate-400 text-sm">Total Members</div>
            <div className="text-2xl font-bold text-slate-800">{formatNumber(kpis.totalMembers)}</div>
          </div>
          <div className="glass-card p-4 bg-white border border-slate-100">
            <div className="text-slate-400 text-sm">Total Engagement</div>
            <div className="text-2xl font-bold text-slate-800">{formatNumber(kpis.totalEngagement)}</div>
          </div>
          <div className="glass-card p-4 bg-white border border-slate-100">
            <div className="text-slate-400 text-sm">Clubs</div>
            <div className="text-2xl font-bold text-slate-800">{kpis.clubs}</div>
          </div>
          <div className="glass-card p-4 bg-white border border-slate-100">
            <div className="text-slate-400 text-sm">Avg / Club</div>
            <div className="text-2xl font-bold text-slate-800">{formatNumber(kpis.avgPerClub)}</div>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 bg-white shadow-sm border border-slate-100 h-[420px]">
            <h3 className="text-slate-800 font-semibold mb-3 flex items-center justify-between">Members per Club <span className="text-xs text-slate-400">Range: {rangeDays} days</span></h3>
            <div className="h-[320px]">{loading ? <div className="h-full flex items-center justify-center text-slate-400">Loading...</div> : <Bar data={filteredBar} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />}</div>
            <div className="mt-3 flex justify-end">
              <button onClick={() => {
                const rows = [[ 'name', 'members' ], ...filteredBar.map(d => [d.name, d.members])];
                downloadCSV(rows, 'members_per_club_filtered.csv');
              }} className="text-sm text-slate-500 hover:text-slate-700">Download CSV</button>
            </div>
          </div>

          <div className="glass-card p-6 bg-white shadow-sm border border-slate-100 h-[420px]">
            <h3 className="text-slate-800 font-semibold mb-3 flex items-center justify-between">Club Popularity <span className="text-xs text-slate-400">Breakdown</span></h3>
            <div className="h-[320px]">{loading ? <div className="h-full animate-pulse bg-slate-100" /> : <Pie data={dataSet.pie} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} />}</div>
            <div className="mt-3 flex justify-end"><button onClick={() => { const rows = [[ 'name', 'value' ], ...(dataSet.pie.labels || []).map((lbl,i)=>[lbl, (dataSet.pie.datasets && dataSet.pie.datasets[0].data[i])||0])]; downloadCSV(rows, 'club_popularity.csv'); }} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-2"><FiDownload /> CSV</button></div>
          </div>

          <div className="glass-card p-6 bg-white shadow-sm border border-slate-100 h-[420px]">
            <h3 className="text-slate-800 font-semibold mb-3">Member Growth</h3>
            <div className="h-[320px]">{loading ? <div className="h-full animate-pulse bg-slate-100" /> : <Line data={dataSet.line} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />}</div>
            <div className="mt-3 flex justify-end"><button onClick={() => { const rows = [[ 'month', 'value' ], ...(dataSet.line.labels || []).map((m,i)=>[m, (dataSet.line.datasets && dataSet.line.datasets[0].data[i])||0])]; downloadCSV(rows, 'member_growth.csv'); }} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-2"><FiDownload /> CSV</button></div>
          </div>

          <div className="glass-card p-6 bg-white shadow-sm border border-slate-100 h-[420px]">
            <h3 className="text-slate-800 font-semibold mb-3">Engagement Breakdown</h3>
            <div className="h-[320px]">{loading ? <div className="h-full animate-pulse bg-slate-100" /> : <Doughnut data={dataSet.doughnut} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} />}</div>
            <div className="mt-3 flex justify-end"><button onClick={() => { const rows = [[ 'name', 'value' ], ...(dataSet.doughnut.labels || []).map((lbl,i)=>[lbl, (dataSet.doughnut.datasets && dataSet.doughnut.datasets[0].data[i])||0])]; downloadCSV(rows, 'engagement.csv'); }} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-2"><FiDownload /> CSV</button></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubEventAnalysis;
