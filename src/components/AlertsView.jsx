import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  ChevronDown,
  AlertTriangle,
  Search,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AlertsView({ userName = 'User' }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All severities');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [currentTime24, setCurrentTime24] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const loadAlertsData = useCallback(async () => {
    try {
      setErrorMessage('');
      const { data: alertRows, error: alertError } = await supabase
        .from('alerts')
        .select('id, room_id, alert_type, severity, message, status, created_at')
        .order('created_at', { ascending: false });

      if (alertError) throw alertError;

      const roomIds = [...new Set((alertRows || []).map((item) => item.room_id).filter(Boolean))];
      if (roomIds.length === 0) {
        setAlerts([]);
        return;
      }

      const { data: roomRows, error: roomError } = await supabase
        .from('Rooms')
        .select('id, room_no, floor_id')
        .in('id', roomIds);
      if (roomError) throw roomError;

      const floorIds = [...new Set((roomRows || []).map((item) => item.floor_id).filter(Boolean))];
      const { data: floorRows, error: floorError } = floorIds.length
        ? await supabase.from('Floors').select('id, building_id').in('id', floorIds)
        : { data: [], error: null };
      if (floorError) throw floorError;

      const buildingIds = [...new Set((floorRows || []).map((item) => item.building_id).filter(Boolean))];
      const { data: buildingRows, error: buildingError } = buildingIds.length
        ? await supabase.from('buildings').select('id, name, code').in('id', buildingIds)
        : { data: [], error: null };
      if (buildingError) throw buildingError;

      const roomMap = new Map((roomRows || []).map((item) => [item.id, item]));
      const floorMap = new Map((floorRows || []).map((item) => [item.id, item]));
      const buildingMap = new Map((buildingRows || []).map((item) => [item.id, item]));

      const mappedAlerts = (alertRows || []).map((item) => {
        const room = roomMap.get(item.room_id);
        const floor = room ? floorMap.get(room.floor_id) : null;
        const building = floor ? buildingMap.get(floor.building_id) : null;
        const code = building?.code || '';
        const buildingLabel =
          code === 'SVH' ? 'SVH' :
          code === 'ENG' ? 'Engineering Block' :
          code === 'LAW' ? 'Law Block' :
          building?.name || 'Main Campus';

        return {
          ...item,
          code: `ALT-${String(item.id).padStart(4, '0')}`,
          buildingName: buildingLabel,
          roomName: room?.room_no ? `Room ${room.room_no}` : `Room #${item.room_id}`,
          severityLabel: (item.severity || 'low').charAt(0).toUpperCase() + (item.severity || 'low').slice(1),
          statusLabel: (item.status || 'active').charAt(0).toUpperCase() + (item.status || 'active').slice(1),
        };
      });

      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setErrorMessage(error.message || 'Unable to load alerts from Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime24(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    loadAlertsData();

    const channel = supabase
      .channel('alerts-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, loadAlertsData)
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [loadAlertsData]);

  const handleResolveAlert = async (alertId) => {
    try {
      setUpdatingId(alertId);
      setNotice('');
      setErrorMessage('');

      const { error } = await supabase.rpc('set_alert_status', {
        p_alert_id: alertId,
        p_new_status: 'resolved',
      });

      if (error) throw error;
      setNotice(`Alert ALT-${String(alertId).padStart(4, '0')} marked as resolved.`);
      await loadAlertsData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      setErrorMessage(error.message || 'Could not resolve alert. Check Staff permissions.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      alert.code.toLowerCase().includes(search) ||
      alert.buildingName.toLowerCase().includes(search) ||
      alert.roomName.toLowerCase().includes(search) ||
      (alert.alert_type || '').toLowerCase().includes(search) ||
      (alert.message || '').toLowerCase().includes(search);

    const matchesSeverity =
      severityFilter === 'All severities' || alert.severityLabel === severityFilter;
    const matchesStatus =
      statusFilter === 'All statuses' || alert.statusLabel === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const activeCount = alerts.filter((item) => item.status === 'active').length;
  const highCount = alerts.filter(
    (item) => item.status === 'active' && item.severity === 'high'
  ).length;
  const resolvedCount = alerts.filter((item) => item.status === 'resolved').length;

  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Alerts</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 outline-none shadow-sm cursor-pointer"
            >
              <option value="All severities">All severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <span className="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Updated {currentTime24 || '00:00:00'}
          </span>

          <button className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 relative cursor-pointer">
            <Bell className="w-4 h-4" />
            {activeCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />}
          </button>

          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200 uppercase">
            {getInitials(userName)}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
            IILM UNIVERSITY • GREATER NOIDA
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Campus Anomaly Alerts
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time HVAC, occupancy, and environmental safety exception logs.
          </p>
        </div>

        <button
          onClick={loadAlertsData}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          Refresh alerts
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Active Alerts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">High Severity Active</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{highCount}</p>
          </div>
          <div className="p-3 bg-red-100 text-red-700 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Resolved Alerts</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by alert code, building, room, or alert type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All severities">All severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All statuses">All statuses</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50/70 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">CODE</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">ALERT</th>
                <th className="py-3 px-4">SEVERITY</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                    Fetching live alerts from Supabase...
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No alerts matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">{alert.code}</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{alert.buildingName}</p>
                      <p className="text-[11px] text-slate-400">{alert.roomName}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{alert.alert_type}</p>
                      <p className="text-[11px] text-slate-400 max-w-xs whitespace-normal">{alert.message}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        alert.severity === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : alert.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.severityLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        alert.status === 'active'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {alert.statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(alert.created_at).toLocaleString([], {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {alert.status === 'active' ? (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={updatingId === alert.id}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs cursor-pointer disabled:opacity-50"
                        >
                          {updatingId === alert.id ? 'Updating...' : 'Resolve'}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
