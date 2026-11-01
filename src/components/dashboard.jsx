import React, { useState, useEffect } from 'react';
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

export default function EnergyMindDashboard({
  userName = 'User',
  userRole = 'staff',
  userEmail = '',
  onSignOut,
  activeNav = 'Dashboard',
  setActiveNav,
}) {
  const [selectedBuilding, setSelectedBuilding] = useState('SVH');
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [currentTime, setCurrentTime] = useState('');

  // 24-Hour Live Clock updating dynamically
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

  // Helper function for user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate Report Button Handler
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

      // 1. Header Banner
      doc.setFillColor(11, 23, 39); // Slate-900 / Navy
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

      // 2. Report Overview Meta
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Dashboard Overview Report', 14, 38);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Selected Building: ${selectedBuilding}   |   Period: ${timeRange}   |   User: ${userName} (${userRole.toUpperCase()})`,
        14,
        44
      );

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 48, 196, 48);

      // 3. Live Dashboard Metric Summary Cards
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 52, 56, 18, 'F');
      doc.rect(77, 52, 56, 18, 'F');
      doc.rect(140, 52, 56, 18, 'F');

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Total Energy', 18, 57);
      doc.text('Current Power Load', 81, 57);
      doc.text('Average Occupancy', 144, 57);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('4,286 kWh (+6.2%)', 18, 65);
      doc.text('292.4 kW', 81, 65);
      doc.text('68% (184 rooms)', 144, 65);

      // 4. Building Snapshot Table
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. Live Building Twin Snapshots', 14, 78);

      const buildingHeaders = [['Building Name', 'Occupancy Rate', 'Power Consumption', 'Operating Status']];
      const buildingRows = [
        ['SVH Building', '72% occupied', '128 kW', 'Optimal / Connected'],
        ['Engineering Block', '64% occupied', '97 kW', 'Optimal / Connected'],
        ['Law Building', '48% occupied', '67 kW', 'Optimal / Connected'],
      ];

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

      // 5. Recent Alerts Table
      let currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Recent Campus Anomaly Alerts', 14, currentY);

      const alertHeaders = [['Alert Code', 'Location', 'Type / Anomaly', 'Severity', 'Status']];
      const alertRows = [
        ['ALT-1048', 'SVH · Second / 207', 'HVAC in empty room', 'Critical', 'Active'],
        ['ALT-1047', 'Engineering · Third / 405', 'High CO₂ concentration', 'High', 'Active'],
        ['ALT-1044', 'Law · First / 204', 'Lighting after hours', 'Medium', 'Acknowledged'],
      ];

      autoTable(doc, {
        startY: currentY + 4,
        head: alertHeaders,
        body: alertRows,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 38, 38], // Red accent header
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

      // 6. Latest Recommendations Section
      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('3. Energy Optimization Recommendations', 14, currentY);

      const recHeaders = [['Target Location', 'Suggested Action Plan', 'Supporting Metric', 'Est. Waste']];
      const recRows = [
        ['SVH · Room 207', 'Review HVAC operation in unoccupied room', '0 occupants · HVAC 3.8 kW', '18.6 kWh'],
        ['Engineering · Room 405', 'Inspect ventilation performance', 'CO₂ at 1,284 ppm', 'Based on 3 events'],
      ];

      autoTable(doc, {
        startY: currentY + 4,
        head: recHeaders,
        body: recRows,
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235], // Blue header
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
        },
        margin: { left: 14, right: 14 },
      });

      // 7. Footer
      currentY = doc.lastAutoTable.finalY + 12;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY, 196, currentY);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `CampusTwin EnergyMind • Real-Time Dashboard Summary • Exported by ${userName}`,
        105,
        currentY + 6,
        { align: 'center' }
      );

      // Save PDF file
      doc.save(`Dashboard_Report_${selectedBuilding}_${todayStr.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      if (typeof setActiveNav === 'function') {
        setActiveNav('Reports');
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
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
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="SVH">SVH</option>
              <option value="Engineering">Engineering</option>
              <option value="Law">Law</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          <span className="hidden md:inline text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2 py-1 rounded border border-slate-200">
            Updated {currentTime || '00:00:00'}
          </span>

          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5" />
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

      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
              IILM UNIVERSITY • GREATER NOIDA
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Campus Overview
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Monitor occupancy, energy and indoor environmental conditions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-white border border-slate-300 rounded-xl px-3.5 pr-8 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none hover:border-slate-400 cursor-pointer shadow-sm"
              >
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Active Working Generate Report Button */}
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-xl px-3.5 py-2 shadow-sm transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Generate report</span>
            </button>
          </div>
        </div>

        {/* 6 Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Total Energy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Total energy</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                4,286 <span className="text-xs font-normal text-slate-500">kWh</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                <span>6.2% vs prior period</span>
              </div>
            </div>
          </div>

          {/* Card 2: Current Power Load */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Current power load</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                292.4 <span className="text-xs font-normal text-slate-500">kW</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Within expected range</p>
            </div>
          </div>

          {/* Card 3: Average Occupancy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Average occupancy</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                68 <span className="text-xs font-normal text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">184 rooms active</p>
            </div>
          </div>

          {/* Card 4: Active Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Active alerts</span>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">6</div>
              <p className="text-xs text-slate-500 mt-1">1 requires attention</p>
            </div>
          </div>

          {/* Card 5: Avg. Temperature */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">Avg. temperature</span>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                23.8 <span className="text-xs font-normal text-slate-500">°C</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Comfortable range</p>
            </div>
          </div>

          {/* Card 6: System Health */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">System health</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                98.7 <span className="text-xs font-normal text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">3 sources connected</p>
            </div>
          </div>
        </div>

        {/* Building Status & Recent Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Building Status Section */}
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
              <p className="text-xs text-slate-500 mb-6">Live operational occupied</p>

              <div className="space-y-4">
                {/* Building SVH */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">SVH</p>
                      <p className="text-xs text-slate-500">72% occupied</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">128 kW</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Building Engineering */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Engineering</p>
                      <p className="text-xs text-slate-500">64% occupied</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">97 kW</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Building Law */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Law</p>
                      <p className="text-xs text-slate-500">48% occupied</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">67 kW</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts Section */}
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
                    <tr>
                      <td className="py-4 px-2 font-bold text-slate-900 truncate">ALT-1048</td>
                      <td className="py-4 px-2 truncate">
                        <p className="font-medium text-slate-900 truncate">SVH</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">Second / 207</p>
                      </td>
                      <td className="py-4 px-2 text-slate-800 font-medium truncate">HVAC in empty room</td>
                      <td className="py-4 px-1 text-center">
                        <span className="inline-block bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold text-[11px] w-full text-center truncate">
                          Critical
                        </span>
                      </td>
                      <td className="py-4 px-1 text-center">
                        <span className="inline-block bg-slate-100/80 text-slate-700 px-2 py-1 rounded-full font-medium text-[11px] w-full text-center truncate">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-2 font-bold text-slate-900 truncate">ALT-1047</td>
                      <td className="py-4 px-2 truncate">
                        <p className="font-medium text-slate-900 truncate">Engineering</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">Third / 405</p>
                      </td>
                      <td className="py-4 px-2 text-slate-800 font-medium truncate">High CO2</td>
                      <td className="py-4 px-1 text-center">
                        <span className="inline-block bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-bold text-[11px] w-full text-center truncate">
                          High
                        </span>
                      </td>
                      <td className="py-4 px-1 text-center">
                        <span className="inline-block bg-slate-100/80 text-slate-700 px-2 py-1 rounded-full font-medium text-[11px] w-full text-center truncate">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-2 font-bold text-slate-900 truncate">ALT-1044</td>
                      <td className="py-4 px-2 truncate">
                        <p className="font-medium text-slate-900 truncate">Law</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">First / 204</p>
                      </td>
                      <td className="py-4 px-2 text-slate-800 font-medium truncate">Lighting after hours</td>
                      <td className="py-4 px-1 text-center">
                        <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold text-[11px] w-full text-center truncate">
                          Medium
                        </span>
                      </td>
                      <td className="py-4 px-1 text-center">
                        <span className="inline-block bg-slate-100/80 text-slate-700 px-2 py-1 rounded-full font-medium text-[11px] w-full text-center truncate">
                          Acknowledged
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Recommendations Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Latest recommendations
          </h2>
          <p className="text-xs text-slate-500 mb-6">Human decision support</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Review HVAC operation in unoccupied room
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  SVH · Room 207 · 0 occupants · HVAC 3.8 kW
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Inspect ventilation performance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Engineering · Room 405 · CO₂ 1,284 ppm
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-amber-800 font-medium block">
                  Estimated avoidable waste
                </span>
                <span className="text-xl font-bold text-amber-950">
                  18.6 <span className="text-xs font-normal">kWh</span>
                </span>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md self-start sm:self-auto">
                Based on 3 events
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}