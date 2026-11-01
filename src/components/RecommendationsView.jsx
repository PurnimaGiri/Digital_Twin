import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Bell,
  Search,
  Filter,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

const RECOMMENDATIONS_DATA = [
  {
    id: 'REC-328',
    title: 'Review HVAC operation in unoccupied room',
    building: 'SVH',
    room: 'Room 207',
    priority: 'High',
    metric: '0 occupants · HVAC 3.8 kW',
    action: 'Inspect room and switch HVAC off if operationally appropriate.',
    status: 'Active',
    category: 'HVAC',
    savingsKwh: 18.6,
  },
  {
    id: 'REC-327',
    title: 'Inspect ventilation performance',
    building: 'Engineering',
    room: 'Room 405',
    priority: 'Medium',
    metric: 'CO₂ 1,284 ppm',
    action: 'Review ventilation and follow facility procedures.',
    status: 'Active',
    category: 'Ventilation',
    savingsKwh: 8.4,
  },
  {
    id: 'REC-324',
    title: 'Check after-hours lighting requirement',
    building: 'Law',
    room: 'Room 204',
    priority: 'Low',
    metric: 'Lighting ON · 0 occupants',
    action: 'Confirm whether lighting is required.',
    status: 'Active',
    category: 'Lighting',
    savingsKwh: 3.2,
  },
  {
    id: 'REC-328B',
    title: 'Review HVAC operation in unoccupied room',
    building: 'Engineering',
    room: 'Room 304',
    priority: 'High',
    metric: '0 occupants · HVAC 3.8 kW',
    action: 'Inspect room and switch HVAC off if operationally appropriate.',
    status: 'Active',
    category: 'HVAC',
    savingsKwh: 12.6,
  },
];

export default function RecommendationsView({ userName = 'User' }) {
  const [currentTime24, setCurrentTime24] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('All buildings');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Advanced Filters State
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minSavings, setMinSavings] = useState(0);

  // Dynamic User Initials Helper
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // 24-Hour Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime24(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const resetAllFilters = () => {
    setSearchTerm('');
    setBuildingFilter('All buildings');
    setStatusFilter('All statuses');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setMinSavings(0);
  };

  const filteredRecommendations = RECOMMENDATIONS_DATA.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding =
      buildingFilter === 'All buildings' || item.building === buildingFilter;

    const matchesStatus =
      statusFilter === 'All statuses' || item.status === statusFilter;

    const matchesPriority =
      priorityFilter === 'All' || item.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === 'All' || item.category === categoryFilter;

    const matchesSavings = item.savingsKwh >= minSavings;

    return (
      matchesSearch &&
      matchesBuilding &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesSavings
    );
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Low</span>;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Recommendations</span>
        </div>

        <div className="flex items-center gap-3">
          <select className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none shadow-sm cursor-pointer">
            <option value="SVH">SVH</option>
            <option value="Engineering">Engineering Block</option>
            <option value="Law">Law Block</option>
          </select>

          <span className="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Updated {currentTime24 || '00:00:00'}
          </span>

          <button className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
          </button>

          {/* Dynamic Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200 uppercase">
            {getInitials(userName)}
          </div>
        </div>
      </div>

      {/* Main Page Title */}
      <div>
        <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
          IILM UNIVERSITY • GREATER NOIDA
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Energy Recommendations
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Evidence-based actions for more efficient campus operations.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">New recommendations</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
            <p className="text-[11px] text-slate-400 mt-1">Since last review</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">High priority</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">2</p>
            <p className="text-[11px] text-slate-400 mt-1">Needs attention</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Potential savings</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              42.8 <span className="text-xs font-normal text-slate-500">kWh</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Estimated from valid events</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">21</p>
            <p className="text-[11px] text-slate-400 mt-1">This month</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recommendations..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-sm"
            >
              <option value="All buildings">All buildings</option>
              <option value="SVH">SVH</option>
              <option value="Engineering">Engineering</option>
              <option value="Law">Law</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-sm"
            >
              <option value="All statuses">All statuses</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`flex items-center gap-2 border rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer shadow-sm shrink-0 ${
              showMoreFilters || priorityFilter !== 'All' || categoryFilter !== 'All' || minSavings > 0
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            More filters
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showMoreFilters && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Advanced Filters</h3>
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority Level</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
              >
                <option value="All">All Categories</option>
                <option value="HVAC">HVAC</option>
                <option value="Ventilation">Ventilation</option>
                <option value="Lighting">Lighting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Min. Potential Savings ({minSavings} kWh)
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="2"
                value={minSavings}
                onChange={(e) => setMinSavings(Number(e.target.value))}
                className="w-full cursor-pointer accent-blue-600 mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Lightbulb className="w-4 h-4" />
                </div>
                {getPriorityBadge(rec.priority)}
              </div>

              <div>
                <span className="text-xs font-bold text-blue-600">{rec.id}</span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 leading-snug">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {rec.building} · {rec.room}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[11px] font-semibold text-blue-600 mb-0.5">Supporting metric</p>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{rec.metric}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Suggested action</p>
                <p className="text-xs text-slate-500 leading-relaxed">{rec.action}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono">
                Generated today · {currentTime24 || '00:00:00'}
              </span>
              <button className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                View evidence
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}