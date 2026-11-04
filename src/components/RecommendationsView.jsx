import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, AlertTriangle, Zap, CheckCircle2, Bell, Search, Filter, ChevronDown, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RecommendationsView({ userName = 'User' }) {
  const [currentTime24, setCurrentTime24] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('All buildings');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const fetchRecommendations = useCallback(async () => {
    try {
      setErrorMessage('');
      const { data: recs, error: recError } = await supabase.from('recommendations')
        .select('id, room_id, title, description, recommendation_type, priority, status, created_at')
        .order('created_at', { ascending: false });
      if (recError) throw recError;
      const roomIds = [...new Set((recs || []).map(r => r.room_id).filter(Boolean))];
      if (!roomIds.length) { setRecommendations([]); return; }

      const { data: rooms, error: roomError } = await supabase.from('Rooms')
        .select('id, room_no, floor_id').in('id', roomIds);
      if (roomError) throw roomError;
      const floorIds = [...new Set((rooms || []).map(r => r.floor_id).filter(Boolean))];
      const { data: floors, error: floorError } = floorIds.length
        ? await supabase.from('Floors').select('id, building_id').in('id', floorIds)
        : { data: [], error: null };
      if (floorError) throw floorError;
      const buildingIds = [...new Set((floors || []).map(f => f.building_id).filter(Boolean))];
      const { data: buildings, error: buildingError } = buildingIds.length
        ? await supabase.from('buildings').select('id, name, code').in('id', buildingIds)
        : { data: [], error: null };
      if (buildingError) throw buildingError;

      const roomMap = new Map((rooms || []).map(r => [r.id, r]));
      const floorMap = new Map((floors || []).map(f => [f.id, f]));
      const buildingMap = new Map((buildings || []).map(b => [b.id, b]));
      const labels = { occupancy: 'Occupancy', energy: 'Energy', temperature: 'Temperature', ventilation: 'Ventilation' };
      setRecommendations((recs || []).map(r => {
        const room = roomMap.get(r.room_id);
        const floor = room && floorMap.get(room.floor_id);
        const building = floor && buildingMap.get(floor.building_id);
        const code = building?.code;
        return {
          databaseId: r.id,
          id: `REC-${r.id}`,
          title: r.title || 'Untitled recommendation',
          building: code === 'SVH' ? 'SVH' : code === 'ENG' ? 'Engineering' : code === 'LAW' ? 'Law' : building?.name || 'Unknown building',
          room: room?.room_no ? `Room ${room.room_no}` : 'Room unavailable',
          priority: (r.priority || 'low').charAt(0).toUpperCase() + (r.priority || 'low').slice(1),
          category: labels[r.recommendation_type] || r.recommendation_type || 'Other',
          metric: `Generated from live ${labels[r.recommendation_type] || 'telemetry'} data`,
          action: r.description || 'Review this recommendation and take appropriate action.',
          status: r.status,
          createdAt: r.created_at,
        };
      }));
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setErrorMessage(error.message || 'Unable to load recommendations.');
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    const tick = () => setCurrentTime24(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const timer = setInterval(tick, 1000);
    fetchRecommendations();
    const channel = supabase.channel('recommendations-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recommendations' }, fetchRecommendations)
      .subscribe();
    return () => { clearInterval(timer); supabase.removeChannel(channel); };
  }, [fetchRecommendations]);

  const handleStatusChange = async (rec, newStatus) => {
    try {
      setUpdatingId(rec.databaseId); setNotice(''); setErrorMessage('');
      const { error } = await supabase.rpc('set_recommendation_status', {
        p_recommendation_id: rec.databaseId, p_new_status: newStatus,
      });
      if (error) throw error;
      setNotice(`${rec.id} marked as ${newStatus}.`);
      await fetchRecommendations();
    } catch (error) {
      console.error('Recommendation update failed:', error);
      setErrorMessage(error.message || 'Could not update recommendation. Check the database approval function.');
    } finally { setUpdatingId(null); }
  };

  const resetFilters = () => { setSearchTerm(''); setBuildingFilter('All buildings'); setStatusFilter('All statuses'); setPriorityFilter('All'); setCategoryFilter('All'); };
  const filtered = recommendations.filter(r => {
    const term = searchTerm.toLowerCase();
    return (!term || [r.id, r.title, r.building, r.room].some(v => v.toLowerCase().includes(term))) &&
      (buildingFilter === 'All buildings' || r.building === buildingFilter) &&
      (statusFilter === 'All statuses' || r.status === statusFilter) &&
      (priorityFilter === 'All' || r.priority === priorityFilter) &&
      (categoryFilter === 'All' || r.category === categoryFilter);
  });
  const pending = recommendations.filter(r => r.status === 'pending').length;
  const highPending = recommendations.filter(r => r.status === 'pending' && r.priority === 'High').length;
  const resolved = recommendations.filter(
  (item) => item.status === 'completed'
).length;
  const initials = userName?.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const priorityBadge = p => <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p === 'High' ? 'bg-amber-100 text-amber-800' : p === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{p}</span>;
  const statusBadge = s => <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${s === 'pending' ? 'bg-amber-100 text-amber-800' : s === 'accepted' ? 'bg-blue-100 text-blue-700' : s === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{s}</span>;
  const approvedCount = recommendations.filter(
  (item) => item.status === 'accepted'
).length;
  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium"><span>CampusTwin</span><span>/</span><span className="text-slate-900 font-bold">Recommendations</span></div>
        <div className="flex items-center gap-3">
          <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)} className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none shadow-sm cursor-pointer">
            <option>All buildings</option><option value="SVH">SVH</option><option value="Engineering">Engineering Block</option><option value="Law">Law Block</option>
          </select>
          <span className="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">Updated {currentTime24 || '00:00:00'}</span>
          <button className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 relative"><Bell className="w-4 h-4" /></button>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200">{initials}</div>
        </div>
      </div>

      <div><p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">IILM UNIVERSITY • GREATER NOIDA</p><h1 className="text-2xl sm:text-3xl font-bold">Energy Recommendations</h1><p className="text-slate-500 text-xs sm:text-sm mt-1">Evidence-based actions for more efficient campus operations.</p></div>
      {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{errorMessage}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">{notice}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Lightbulb className="w-5 h-5" /></div><div><p className="text-xs font-semibold text-slate-500">Pending recommendations</p><p className="text-2xl font-bold mt-1">{pending}</p><p className="text-[11px] text-slate-400 mt-1">Awaiting Staff review</p></div></div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
    <CheckCircle2 className="w-5 h-5" />
  </div>
  <div>
    <p className="text-xs font-semibold text-slate-500">Approved</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">
      {approvedCount}
    </p>
    <p className="text-[11px] text-slate-400 mt-1">Accepted by Staff</p>
  </div>
</div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4"><div className="p-3 bg-red-50 text-red-500 rounded-xl"><AlertTriangle className="w-5 h-5" /></div><div><p className="text-xs font-semibold text-slate-500">High priority pending</p><p className="text-2xl font-bold mt-1">{highPending}</p><p className="text-[11px] text-slate-400 mt-1">Needs attention</p></div></div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Zap className="w-5 h-5" /></div><div><p className="text-xs font-semibold text-slate-500">Potential savings</p><p className="text-2xl font-bold text-slate-900 mt-1">
  {recommendations.length}
</p><p className="text-[11px] text-slate-400 mt-1">Not estimated from current telemetry</p></div></div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div><div><p className="text-xs font-semibold text-slate-500">Resolved</p><p className="text-2xl font-bold mt-1">{resolved}</p><p className="text-[11px] text-slate-400 mt-1">Dismissed or completed</p></div></div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full md:w-80"><Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search recommendations..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-500 shadow-sm" /></div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative"><select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-sm"><option>All buildings</option><option value="SVH">SVH</option><option value="Engineering">Engineering</option><option value="Law">Law</option></select><ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" /></div>
          <div className="relative"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-sm"><option>All statuses</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="dismissed">Dismissed</option><option value="completed">Completed</option></select><ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" /></div>
          <button onClick={() => setShowMoreFilters(!showMoreFilters)} className={`flex items-center gap-2 border rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm ${showMoreFilters || priorityFilter !== 'All' || categoryFilter !== 'All' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-700 border-slate-200'}`}><Filter className="w-3.5 h-3.5" />More filters</button>
        </div>
      </div>

      {showMoreFilters && <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><h3 className="font-bold text-sm">Advanced Filters</h3><button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold text-slate-500"><RotateCcw className="w-3.5 h-3.5" />Reset filters</button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority Level</label><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option value="All">All Priorities</option><option>High</option><option>Medium</option><option>Low</option></select></div><div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option value="All">All Categories</option><option>Occupancy</option><option>Energy</option><option>Temperature</option><option>Ventilation</option></select></div></div></div>}

      {isLoading ? <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">Loading live recommendations...</div> : filtered.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">No recommendations match your filters.</div> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(rec => <div key={rec.databaseId} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 transition"><div className="space-y-3"><div className="flex items-center justify-between"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Lightbulb className="w-4 h-4" /></div><div className="flex items-center gap-2">{priorityBadge(rec.priority)}{statusBadge(rec.status)}</div></div><div><span className="text-xs font-bold text-blue-600">{rec.id}</span><h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 leading-snug">{rec.title}</h3><p className="text-xs text-slate-500 font-medium mt-1">{rec.building} · {rec.room}</p></div><div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><p className="text-[11px] font-semibold text-blue-600 mb-0.5">Supporting metric</p><p className="font-bold text-slate-900 text-xs sm:text-sm">{rec.metric}</p></div><div><p className="text-xs font-bold text-slate-700 mb-1">Suggested action</p><p className="text-xs text-slate-500 leading-relaxed">{rec.action}</p></div></div>
          <div className="pt-3 border-t border-slate-100 space-y-3"><div className="flex items-center justify-between text-[11px]"><span className="text-slate-400 font-mono">{rec.createdAt ? new Date(rec.createdAt).toLocaleString() : 'Recently generated'}</span><span className="text-slate-500">{rec.category}</span></div>
            {rec.status === 'pending' && <div className="flex gap-2"><button onClick={() => handleStatusChange(rec, 'accepted')} disabled={updatingId === rec.databaseId} className="flex-1 rounded-lg bg-blue-600 text-white py-2 text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">{updatingId === rec.databaseId ? 'Updating...' : 'Approve'}</button><button onClick={() => handleStatusChange(rec, 'dismissed')} disabled={updatingId === rec.databaseId} className="flex-1 rounded-lg border border-slate-200 text-slate-600 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">Dismiss</button></div>}
            {rec.status === 'accepted' && <button onClick={() => handleStatusChange(rec, 'completed')} disabled={updatingId === rec.databaseId} className="w-full rounded-lg bg-emerald-600 text-white py-2 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50">{updatingId === rec.databaseId ? 'Updating...' : 'Mark as completed'}</button>}
          </div></div>)}</div>}
    </div>
  );
}
