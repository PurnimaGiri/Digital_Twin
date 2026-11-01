import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Clock,
} from 'lucide-react';

const ALERTS_DATA = [
  {
    id: 'ALT-1048',
    title: 'HVAC operating in empty room',
    building: 'SVH',
    floor: 'Second Floor',
    room: 'Room 207',
    severity: 'Critical',
    type: 'HVAC Waste',
    timeAgo: '12 mins ago',
    status: 'Active',
    metric: '0 occupants · 3.8 kW load',
  },
  {
    id: 'ALT-1047',
    title: 'High CO₂ concentration level',
    building: 'Engineering',
    floor: 'Third Floor',
    room: 'Room 405',
    severity: 'High',
    type: 'Air Quality',
    timeAgo: '28 mins ago',
    status: 'Active',
    metric: 'CO₂ at 1,284 ppm',
  },
  {
    id: 'ALT-1044',
    title: 'Lighting ON after operational hours',
    building: 'Law',
    floor: 'First Floor',
    room: 'Room 204',
    severity: 'Medium',
    type: 'Lighting Waste',
    timeAgo: '1 hr ago',
    status: 'Acknowledged',
    metric: '0 occupants · Lighting 1.2 kW',
  },
  {
    id: 'ALT-1041',
    title: 'Unusual peak power consumption spike',
    building: 'SVH',
    floor: 'Ground Floor',
    room: 'Main Server Room',
    severity: 'Critical',
    type: 'Power Spike',
    timeAgo: '2 hrs ago',
    status: 'Active',
    metric: 'Current load 45.2 kW',
  },
  {
    id: 'ALT-1039',
    title: 'Temperature above comfort setpoint',
    building: 'Engineering',
    floor: 'Second Floor',
    room: 'Lab 208',
    severity: 'Low',
    type: 'Temperature',
    timeAgo: '3 hrs ago',
    status: 'Resolved',
    metric: 'Temp 26.8 °C',
  },
];

export default function AlertsView({ userName = 'User' }) {
  const [currentTime24, setCurrentTime24] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('All buildings');
  const [severityFilter, setSeverityFilter] = useState('All severities');
  const [alertsList, setAlertsList] = useState(ALERTS_DATA);

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

  const handleStatusChange = (alertId, newStatus) => {
    setAlertsList((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, status: newStatus } : item))
    );
  };

  const filteredAlerts = alertsList.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding =
      buildingFilter === 'All buildings' || item.building === buildingFilter;

    const matchesSeverity =
      severityFilter === 'All severities' || item.severity === severityFilter;

    return matchesSearch && matchesBuilding && matchesSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Critical</span>;
      case 'High':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Medium</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Alerts</span>
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

      <div>
        <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
          IILM UNIVERSITY • GREATER NOIDA
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Campus Anomaly Alerts
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Real-time incident feed for HVAC, electrical, and environmental exceptions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts by room, code or type..."
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
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-sm"
            >
              <option value="All severities">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">ALERT CODE</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">TELEMETRY METRIC</th>
                <th className="py-3 px-4 text-center">SEVERITY</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-bold text-blue-600">{alert.id}</td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">{alert.building}</p>
                    <p className="text-[11px] text-slate-400">{alert.floor} · {alert.room}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-slate-900">{alert.title}</p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {alert.timeAgo}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-800">{alert.metric}</td>
                  <td className="py-4 px-4 text-center">{getSeverityBadge(alert.severity)}</td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        alert.status === 'Active'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : alert.status === 'Acknowledged'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {alert.status === 'Active' && (
                      <button
                        onClick={() => handleStatusChange(alert.id, 'Acknowledged')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status === 'Acknowledged' && (
                      <button
                        onClick={() => handleStatusChange(alert.id, 'Resolved')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                    {alert.status === 'Resolved' && (
                      <span className="text-slate-400 text-[11px] font-medium italic">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}