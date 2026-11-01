import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Users,
  Building2,
  AlertTriangle,
  Bell,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';

const RAW_ANALYTICS_DATA = {
  SVH: {
    'Ground Floor': {
      'Room 001': {
        'Last 24 Hours': [
          { time: '00:00', energy: 80, occupancy: 0, temp: 21, co2: 410 },
          { time: '04:00', energy: 65, occupancy: 0, temp: 20.5, co2: 400 },
          { time: '08:00', energy: 150, occupancy: 12, temp: 22, co2: 520 },
          { time: '12:00', energy: 240, occupancy: 28, temp: 23.5, co2: 780 },
          { time: '16:00', energy: 210, occupancy: 22, temp: 23, co2: 690 },
          { time: '20:00', energy: 130, occupancy: 8, temp: 22, co2: 510 },
          { time: 'Now', energy: 180, occupancy: 14, temp: 22.5, co2: 580 },
        ],
      },
    },
    'Second Floor': {
      'Room 207': {
        'Last 24 Hours': [
          { time: '00:00', energy: 110, occupancy: 0, temp: 22.5, co2: 420 },
          { time: '04:00', energy: 85, occupancy: 0, temp: 22, co2: 410 },
          { time: '08:00', energy: 195, occupancy: 18, temp: 23, co2: 650 },
          { time: '12:00', energy: 285, occupancy: 38, temp: 24.5, co2: 920 },
          { time: '16:00', energy: 255, occupancy: 32, temp: 24, co2: 840 },
          { time: '20:00', energy: 154, occupancy: 24, temp: 23, co2: 610 },
          { time: 'Now', energy: 280, occupancy: 36, temp: 23.8, co2: 890 },
        ],
      },
    },
  },
};

export default function AnalyticsView({ userName = 'User' }) {
  const [selectedBuilding, setSelectedBuilding] = useState('All buildings');
  const [selectedFloor, setSelectedFloor] = useState('All floors');
  const [selectedRoom, setSelectedRoom] = useState('All rooms');
  const [timeRange, setTimeRange] = useState('Last 24 Hours');

  // Chart Customization Drawer States
  const [showMainChartControls, setShowMainChartControls] = useState(false);
  const [showOccupancyOverlay, setShowOccupancyOverlay] = useState(true);
  const [chartMetricMode, setChartMetricMode] = useState('energy'); // 'energy' | 'co2' | 'temp'

  // Dynamic User Initials Helper
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // 24-Hour Live Clock
  const [currentTime24, setCurrentTime24] = useState('');

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

  const currentChartData = useMemo(() => {
    return RAW_ANALYTICS_DATA.SVH['Second Floor']['Room 207']['Last 24 Hours'];
  }, []);

  const peakConsumption = useMemo(() => {
    return Math.max(...currentChartData.map((d) => d.energy));
  }, [currentChartData]);

  // Scaled SVG Path Calculations
  const svgWidth = 830;
  const svgHeight = 180;
  const maxVal = Math.max(...currentChartData.map((d) => d[chartMetricMode] || d.energy)) * 1.15 || 300;

  const pointsFormatted = currentChartData.map((pt, idx) => {
    const x = 50 + (idx * (svgWidth - 100)) / (currentChartData.length - 1 || 1);
    const val = pt[chartMetricMode] || pt.energy;
    const y = svgHeight - (val / maxVal) * (svgHeight - 40) + 20;
    return { ...pt, x, y, val };
  });

  const svgPath = pointsFormatted.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Analytics</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBuilding === 'All buildings' ? 'SVH' : selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="appearance-none bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 outline-none shadow-sm cursor-pointer"
          >
            <option value="SVH">SVH</option>
            <option value="Engineering">Engineering</option>
            <option value="Law">Law</option>
          </select>

          <span className="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Updated {currentTime24 || '00:00:00'}
          </span>

          <button className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 relative cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>

          {/* Dynamic Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200 uppercase">
            {getInitials(userName)}
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
          IILM UNIVERSITY • GREATER NOIDA
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Energy &amp; Occupancy Analytics
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Explore historical patterns, utilization and environmental quality.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Peak consumption</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {peakConsumption} <span className="text-xs font-normal text-slate-500">kW</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Peak time: 12:35</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Average occupancy</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              61 <span className="text-xs font-normal text-slate-500">%</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Across selected period</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Most utilized</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">SVH 207</p>
            <p className="text-[11px] text-slate-400 mt-1">86% utilization</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Potential waste</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              18.6 <span className="text-xs font-normal text-slate-500">kWh</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">3 rooms identified</p>
          </div>
        </div>
      </div>

      {/* Main Energy Consumption Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {chartMetricMode === 'energy' && 'Energy consumption over time'}
              {chartMetricMode === 'co2' && 'CO₂ concentration trend'}
              {chartMetricMode === 'temp' && 'Temperature variations'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{timeRange}</p>
          </div>

          <button
            onClick={() => setShowMainChartControls(!showMainChartControls)}
            className={`p-2 border rounded-xl transition cursor-pointer ${
              showMainChartControls
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Interactive SVG Chart */}
        <div className="relative w-full h-64 pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 900 240">
            <line x1="50" y1="30" x2="880" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="50" y1="90" x2="880" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="50" y1="150" x2="880" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="50" y1="210" x2="880" y2="210" stroke="#cbd5e1" strokeWidth="1.5" />

            <path d={svgPath} fill="none" stroke="#2563eb" strokeWidth="2.5" />

            {pointsFormatted.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />
                <text x={pt.x} y="232" fontSize="11" fill="#64748b" textAnchor="middle">
                  {pt.time}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}