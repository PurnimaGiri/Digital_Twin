import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  Zap,
  Gauge,
  UserCheck,
  AlertTriangle,
  Thermometer,
  Activity,
  ChevronDown,
  ArrowUpRight,
  LogOut,
  Building2,
  FileText,
  Lightbulb,
} from 'lucide-react';

import {
  fetchPeriodMetrics,
  fetchActiveAlerts,
  fetchRecommendations,
} from '../lib/dashboardData';

import { supabase } from '../lib/supabase';

export default function EnergyMindDashboard({
  userName = 'User',
  userRole = 'staff',
  userEmail = '',
  onSignOut,
  activeNav = 'Dashboard',
  setActiveNav,
  selectedBuilding = 'All',
  setSelectedBuilding,
}) {
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const timeRangeRef = useRef('Last 24 hours');
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalPowerKw: '0.0',
    estimatedDailyEnergyKwh: '0',
    totalOccupants: 0,
    activeRooms: 0,
    avgTemp: '0.0',
    activeAlertsCount: 0,
    totalRooms: 0,
    roomsReporting: 0,
    telemetryCoverage: 0,
    buildingSnapshots: [],
  });

  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // References for request locking & fallback timers
  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const fallbackPollTimerRef = useRef(null);

  // Synchronize timeRangeRef with timeRange state
  useEffect(() => {
    timeRangeRef.current = timeRange;
  }, [timeRange]);

  // Clock updating standard time format
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch alert counts via RPC / direct query
  useEffect(() => {
    let mounted = true;

    const fetchAlertCount = async () => {
      const { count, error } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) {
        console.error('Dashboard alert count error:', error);
        return;
      }

      if (mounted) {
        const activeCount = count || 0;
        setActiveAlertCount(activeCount);
        setMetrics((previous) => ({ ...previous, activeAlertsCount: activeCount }));
      }
    };

    fetchAlertCount();

    const channel = supabase
      .channel('dashboard-alert-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        fetchAlertCount
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Core metrics loading function
  const loadMetrics = useCallback(async (period = timeRangeRef.current) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);

      const periodHours = {
        'Last 24 hours': 24,
        'Last 7 days': 168,
        'Last 30 days': 720,
      };

      const hours = periodHours[period] || 24;
      const data = await fetchPeriodMetrics(hours);

      if (data) {
        setMetrics({
          ...data,
          totalPowerKw: Number(data.totalPowerKw || 0).toFixed(1),
          estimatedDailyEnergyKwh: Number(
            data.estimatedEnergyKwh || 0
          ).toFixed(1),
          totalOccupants: Number(data.totalOccupants || 0),
          activeRooms: Number(data.activeRooms || 0),
          avgTemp: Number(data.avgTemp || 0).toFixed(1),
          activeAlertsCount: Number(data.activeAlertsCount || 0),
          totalRooms: Number(data.totalRooms || 0),
          roomsReporting: Number(data.roomsReporting || 0),
          telemetryCoverage: Number(data.telemetryCoverage || 0),
          buildingSnapshots: (data.buildingSnapshots || []).map(
            (building) => ({
              ...building,
              totalRooms: Number(building.totalRooms || 0),
              powerKw: Number(building.powerKw || 0).toFixed(1),
            })
          ),
        });
      }
    } catch (error) {
      console.error('Dashboard metrics error:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Operational lists loading
  const loadOperationalLists = useCallback(async () => {
    try {
      const [latestAlerts, latestRecommendations] = await Promise.all([
        fetchActiveAlerts(),
        fetchRecommendations(),
      ]);

      setAlerts(latestAlerts);
      setRecommendations(latestRecommendations);
    } catch (error) {
      console.error('Operational data error:', error);
    }
  }, []);

  // Unified Refresh Function
  const triggerRefresh = useCallback(() => {
    loadMetrics(timeRangeRef.current);
    loadOperationalLists();
  }, [loadMetrics, loadOperationalLists]);

  // Setup Realtime Subscription and Polling Fallback
  useEffect(() => {
    // Initial fetch
    triggerRefresh();

    // Helper to restart 30-second polling timer
    const resetFallbackPolling = () => {
      if (fallbackPollTimerRef.current) {
        clearInterval(fallbackPollTimerRef.current);
      }
      fallbackPollTimerRef.current = setInterval(() => {
        triggerRefresh();
      }, 30000);
    };

    resetFallbackPolling();

    // Setup Supabase Realtime channel for INSERT events on telemetry_readings
    const channel = supabase
      .channel('public:telemetry_readings_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry_readings',
        },
        () => {
          // Clear any existing debounce timer to avoid overlapping requests
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // Debounce execution by 1000ms
          debounceTimerRef.current = setTimeout(() => {
            triggerRefresh();
            resetFallbackPolling(); // Reset 30s timer on live data receipt
          }, 1000);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('Realtime subscription issue:', err.message);
        }
      });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (fallbackPollTimerRef.current) {
        clearInterval(fallbackPollTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [triggerRefresh]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleGenerateReport = async () => {
    try {
      const jsPDFModule = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');

      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF('p', 'mm', 'a4');

      const todayStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      doc.setFillColor(11, 23, 39);
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('CampusTwin EnergyMind', 14, 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('IILM UNIVERSITY • GREATER NOIDA', 14, 21);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Generated: ${todayStr} ${currentTime}`, 196, 21, { align: 'right' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Dashboard Summary', 14, 38);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Building filter: ${selectedBuilding} | Period: ${timeRange} | User: ${userName} (${userRole.toUpperCase()})`,
        14,
        44
      );

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 48, 196, 48);

      doc.setFillColor(248, 250, 252);
      doc.rect(14, 52, 56, 18, 'F');
      doc.rect(77, 52, 56, 18, 'F');
      doc.rect(140, 52, 56, 18, 'F');

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Estimated Energy (${timeRange})`, 18, 57);
      doc.text('Average Power Load', 81, 57);
      doc.text('Average Occupancy', 144, 57);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);

      doc.text(`${metrics.estimatedDailyEnergyKwh} kWh`, 18, 65);
      doc.text(`${metrics.totalPowerKw} kW`, 81, 65);
      doc.text(`${metrics.totalOccupants} occupants`, 144, 65);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. Building Snapshots', 14, 78);

      const buildingHeaders = [[
        'Building Name',
        'Occupancy Rate',
        'Power Consumption',
        'Rooms Reporting',
      ]];

      const reportBuildings =
        selectedBuilding === 'All'
          ? metrics.buildingSnapshots
          : metrics.buildingSnapshots.filter(
              (building) => building.code === selectedBuilding
            );

      const buildingRows = reportBuildings.map((building) => [
        building.name,
        `${building.occupancyPct}% occupied`,
        `${building.powerKw} kW`,
        building.totalRooms > 0
          ? `${building.roomsReporting}/${building.totalRooms}`
          : `${building.roomsReporting} reporting`,
      ]);

      if (!buildingRows.length) {
        buildingRows.push(['—', '—', '—', 'No data']);
      }

      autoTable(doc, {
        startY: 82,
        head: buildingHeaders,
        body: buildingRows,
        theme: 'grid',
        headStyles: {
          fillColor: [11, 23, 39],
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14 },
      });

      let currentY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Recent Campus Alerts', 14, currentY);

      const alertHeaders = [[
        'Alert Code',
        'Location',
        'Type / Anomaly',
        'Severity',
        'Status',
      ]];

      const alertRows = alerts.map((alert) => {
        const buildingName = alert.rooms?.floors?.buildings?.name || 'Campus';
        const floorName = alert.rooms?.floors?.name || 'Floor';
        const roomName = alert.rooms?.room_number || '—';

        return [
          `ALT-${String(alert.id).padStart(4, '0')}`,
          `${buildingName} · ${floorName} / ${roomName}`,
          alert.message || alert.alert_type || 'Campus alert',
          alert.severity || '—',
          alert.status || '—',
        ];
      });

      if (!alertRows.length) {
        alertRows.push(['—', '—', 'No current alerts', '—', '—']);
      }

      autoTable(doc, {
        startY: currentY + 4,
        head: alertHeaders,
        body: alertRows,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: {
          fillColor: [254, 242, 242],
        },
        margin: { left: 14, right: 14 },
      });

      doc.save(
        `Dashboard_Report_${selectedBuilding}_${todayStr.replace(/\s+/g, '_')}.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const visibleBuildings =
    selectedBuilding === 'All'
      ? metrics.buildingSnapshots
      : metrics.buildingSnapshots.filter(
          (building) => building.code === selectedBuilding
        );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{activeNav}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <select
              value={selectedBuilding}
              onChange={(event) => {
                if (typeof setSelectedBuilding === 'function') {
                  setSelectedBuilding(event.target.value);
                }
              }}
              className="appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All buildings</option>
              <option value="SVH">SVH</option>
              <option value="ENG">Engineering Block</option>
              <option value="LAW">Law Block</option>
            </select>

            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          <span className="hidden md:inline text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Updated {currentTime || '00:00:00'}
          </span>

          <button
            onClick={() => setActiveNav && setActiveNav('Alerts')}
            title={`${activeAlertCount} active alerts`}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeAlertCount > 99 ? '99+' : activeAlertCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs uppercase">
                {getInitials(userName)}
              </div>

              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                  {userName}
                </p>
                <p className="text-slate-400 text-[10px] mt-0.5 truncate max-w-[120px]">
                  {userEmail}
                </p>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
              IILM UNIVERSITY • GREATER NOIDA
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Campus Overview
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Campus-wide live KPIs across all 3 buildings, with a building-wise performance breakdown.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(event) => {
                  const selectedPeriod = event.target.value;
                  setTimeRange(selectedPeriod);
                  loadMetrics(selectedPeriod);
                }}
                className="appearance-none bg-white border border-slate-300 rounded-xl px-3.5 pr-8 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none hover:border-slate-400 cursor-pointer shadow-sm"
              >
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>

              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-xl px-3.5 py-2 shadow-sm transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Generate report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Estimated energy</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.estimatedDailyEnergyKwh}{' '}
                <span className="text-xs font-normal text-slate-500">kWh</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                <span>Estimated energy for {timeRange.toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Average power load</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.totalPowerKw}{' '}
                <span className="text-xs font-normal text-slate-500">kW</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Average combined power load</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Average occupancy</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.totalOccupants}{' '}
                <span className="text-xs font-normal text-slate-500">occupants</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{metrics.activeRooms} rooms active</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Active alerts</span>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{activeAlertCount}</div>
              <p className="text-xs text-slate-500 mt-1">Open campus alerts</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Avg. temperature</span>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.avgTemp}{' '}
                <span className="text-xs font-normal text-slate-500">°C</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Campus average</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Period coverage</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.telemetryCoverage}{' '}
                <span className="text-xs font-normal text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {metrics.roomsReporting} of {metrics.totalRooms} rooms reporting
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Building status
                </h2>
                <button
                  onClick={() => setActiveNav && setActiveNav('Building')}
                  className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View twin snapshot
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Building-wise average occupancy and power load for the selected period
              </p>

              <div className="space-y-4">
                {visibleBuildings.map((building) => (
                  <div
                    key={building.code}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{building.name}</p>
                        <p className="text-xs text-slate-500">{building.occupancyPct}% occupied</p>
                        <p className="text-[11px] text-slate-400">
                          {building.totalRooms > 0
                            ? `${building.roomsReporting}/${building.totalRooms} rooms reporting`
                            : `${building.roomsReporting} rooms reported`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {building.powerKw} kW
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                ))}

                {!isLoading && visibleBuildings.length === 0 && (
                  <p className="text-sm text-slate-500 py-4">
                    No building telemetry is available yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Recent alerts
                </h2>
                <button
                  onClick={() => setActiveNav && setActiveNav('Alerts')}
                  className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View all
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-5">Latest campus anomalies</p>

              <div className="w-full overflow-hidden">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                      <th className="py-2.5 px-2 rounded-l-md font-semibold w-[20%]">ALERT</th>
                      <th className="py-2.5 px-2 font-semibold w-[25%]">BUILDING / ROOM</th>
                      <th className="py-2.5 px-2 font-semibold w-[25%]">TYPE</th>
                      <th className="py-2.5 px-1 font-semibold text-center w-[15%]">SEVERITY</th>
                      <th className="py-2.5 px-1 rounded-r-md font-semibold text-center w-[15%]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {alerts.length ? (
                      alerts.slice(0, 4).map((alert) => {
                        const buildingName = alert.rooms?.floors?.buildings?.name || 'Campus';
                        const floorName = alert.rooms?.floors?.name || '—';
                        const roomName = alert.rooms?.room_number || '—';
                        const severity = String(alert.severity || 'info').toLowerCase();
                        const severityClass =
                          severity === 'critical' || severity === 'high'
                            ? 'bg-red-50 text-red-600'
                            : severity === 'medium'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-blue-50 text-blue-600';

                        return (
                          <tr key={alert.id}>
                            <td className="py-4 px-2 font-bold text-slate-900 truncate">
                              ALT-{String(alert.id).padStart(4, '0')}
                            </td>
                            <td className="py-4 px-2 truncate">
                              <p className="font-medium text-slate-900 truncate">{buildingName}</p>
                              <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                                {floorName} / {roomName}
                              </p>
                            </td>
                            <td className="py-4 px-2 text-slate-800 font-medium truncate">
                              {alert.message || alert.alert_type}
                            </td>
                            <td className="py-4 px-1 text-center">
                              <span className={`inline-block ${severityClass} px-2 py-1 rounded-full font-bold text-[11px] w-full text-center truncate`}>
                                {alert.severity || 'Info'}
                              </span>
                            </td>
                            <td className="py-4 px-1 text-center">
                              <span className="inline-block bg-slate-100/80 text-slate-700 px-2 py-1 rounded-full font-medium text-[11px] w-full text-center truncate">
                                {alert.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-400">
                          No active alerts.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Latest recommendations
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Human decision support · Supabase records
          </p>

          <div className="space-y-4">
            {recommendations.length ? (
              recommendations.slice(0, 5).map((recommendation) => {
                const buildingName = recommendation.rooms?.floors?.buildings?.name || 'Campus';
                const roomName = recommendation.rooms?.room_number || 'Campus-wide';
                const floorName = recommendation.rooms?.floors?.name;

                return (
                  <div
                    key={recommendation.id}
                    className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {recommendation.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {recommendation.description || 'No additional details provided.'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {buildingName}
                        {floorName ? ` · ${floorName}` : ''}
                        {roomName !== 'Campus-wide' ? ` · Room ${roomName}` : ''}
                        {' · '}
                        {recommendation.priority || 'Normal'} priority
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 py-4">
                No recommendations have been generated yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}