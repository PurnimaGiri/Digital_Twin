import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bell,
  ChevronDown,
  Eye,
  Download,
  Printer,
} from 'lucide-react';

// Comprehensive Detailed Dataset for Export
const DETAILED_REPORT_DATA = [
  {
    building: 'SVH Building',
    floor: 'Second Floor',
    room: 'Room 207 (Classroom)',
    occupants: 0,
    capacity: 40,
    powerKw: 3.8,
    tempC: 22.5,
    co2Ppm: 420,
    status: 'Unoccupied HVAC Waste',
    efficiency: '62%',
    action: 'Inspect room and turn off HVAC unit immediately',
  },
  {
    building: 'Engineering Block',
    floor: 'Third Floor',
    room: 'Room 405 (Lecture Hall)',
    occupants: 38,
    capacity: 40,
    powerKw: 8.4,
    tempC: 25.2,
    co2Ppm: 1284,
    status: 'High CO₂ Concentration',
    efficiency: '74%',
    action: 'Increase fresh air ventilation damper to 40%',
  },
  {
    building: 'Law Building',
    floor: 'First Floor',
    room: 'Room 204 (Faculty Office)',
    occupants: 0,
    capacity: 30,
    powerKw: 1.2,
    tempC: 21.5,
    co2Ppm: 400,
    status: 'After-hours Lighting ON',
    efficiency: '80%',
    action: 'Reconfigure motion occupancy sensors after 18:00',
  },
  {
    building: 'SVH Building',
    floor: 'First Floor',
    room: 'Room 101 (Auditorium)',
    occupants: 75,
    capacity: 100,
    powerKw: 12.1,
    tempC: 23.1,
    co2Ppm: 720,
    status: 'Optimal Performance',
    efficiency: '96%',
    action: 'None (Operating within target parameter setpoints)',
  },
  {
    building: 'SVH Building',
    floor: 'Second Floor',
    room: 'Room 208 (Lab)',
    occupants: 28,
    capacity: 30,
    powerKw: 5.2,
    tempC: 23.8,
    co2Ppm: 680,
    status: 'Optimal Performance',
    efficiency: '94%',
    action: 'None (Operating within target parameter setpoints)',
  },
  {
    building: 'Engineering Block',
    floor: 'Ground Floor',
    room: 'Room 001 (Reception)',
    occupants: 14,
    capacity: 30,
    powerKw: 4.0,
    tempC: 22.0,
    co2Ppm: 450,
    status: 'Optimal Performance',
    efficiency: '98%',
    action: 'None (Base baseline load normal)',
  },
];

export default function ReportsView({ userName = 'User' }) {
  const [reportType, setReportType] = useState('Daily Energy Report');
  const [building, setBuilding] = useState('All buildings');
  const [dateRange, setDateRange] = useState('2026-05-18');
  const [grouping, setGrouping] = useState('Hourly');
  const [isPreviewed, setIsPreviewed] = useState(false);
  const [currentTime24, setCurrentTime24] = useState('');

  // 24-Hour Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime24(
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setIsPreviewed(true);
  };

  // Safe Dynamic PDF Export Function
  const exportPDF = async () => {
    try {
      // Dynamic imports prevent build/bundling errors
      const jsPDFModule = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');

      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape format for detailed multi-column width
      const todayStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      // 1. Header Banner
      doc.setFillColor(11, 23, 39); // Navy / Slate-900
      doc.rect(0, 0, 297, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('CampusTwin EnergyMind — Detailed Telemetry & Performance Audit Report', 14, 12);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('IILM UNIVERSITY • SCHOOL OF COMPUTER SCIENCE AND ENGINEERING', 14, 20);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Generated: ${todayStr} ${currentTime24 || ''}`, 283, 20, { align: 'right' });

      // 2. Report Meta Block
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${reportType} (${building})`, 14, 35);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Date Period: ${dateRange}   |   Grouping: ${grouping}   |   Facility Admin: ${userName}`,
        14,
        41
      );

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 45, 283, 45);

      // 3. Overview Metrics Summary Cards
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 49, 62, 16, 'F');
      doc.rect(82, 49, 62, 16, 'F');
      doc.rect(150, 49, 62, 16, 'F');
      doc.rect(218, 49, 65, 16, 'F');

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Total Power Load', 18, 54);
      doc.text('Average Occupancy', 86, 54);
      doc.text('Active Anomalies', 154, 54);
      doc.text('Campus Efficiency Score', 222, 54);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('34.7 kW / 1,842.6 kWh', 18, 61);
      doc.text('155 / 270 occupants (57%)', 86, 61);
      doc.setTextColor(220, 38, 38);
      doc.text('3 Identified Issues', 154, 61);
      doc.setTextColor(16, 185, 129);
      doc.text('92 / 100 (Optimal)', 222, 61);

      // 4. Detailed Telemetry Table
      const headers = [
        [
          'Building Block',
          'Floor Level',
          'Room Name & Type',
          'Occupants',
          'Power (kW)',
          'Temp (°C)',
          'CO₂ (PPM)',
          'Operating Status',
          'Efficiency',
          'Recommended Action Plan',
        ],
      ];

      const rows = DETAILED_REPORT_DATA.map((row) => [
        row.building,
        row.floor,
        row.room,
        `${row.occupants} / ${row.capacity}`,
        `${row.powerKw} kW`,
        `${row.tempC} °C`,
        `${row.co2Ppm} ppm`,
        row.status,
        row.efficiency,
        row.action,
      ]);

      autoTable(doc, {
        startY: 70,
        head: headers,
        body: rows,
        theme: 'grid',
        headStyles: {
          fillColor: [11, 23, 39],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [51, 65, 85],
        },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 22 },
          2: { cellWidth: 38 },
          3: { cellWidth: 22 },
          4: { cellWidth: 20 },
          5: { cellWidth: 18 },
          6: { cellWidth: 20 },
          7: { cellWidth: 36 },
          8: { cellWidth: 18 },
          9: { cellWidth: 47 },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14 },
      });

      // Save PDF Document directly to browser downloads
      doc.save(`${reportType.replace(/\s+/g, '_')}_${dateRange}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback print mode if browser blocks binary stream
      window.print();
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Reports</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 outline-none shadow-sm cursor-pointer">
              <option value="SVH">SVH</option>
              <option value="Engineering">Engineering Block</option>
              <option value="Law">Law Block</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <span className="text-xs text-slate-600 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Updated {currentTime24 || '00:00:00'}
          </span>

          <button className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
          </button>

          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200 uppercase">
            {getInitials(userName)}
          </div>
        </div>
      </div>

      {/* Page Subtitle */}
      <div>
        <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
          IILM UNIVERSITY • GREATER NOIDA
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Building Performance Reports
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Generate clear summaries and full telemetry audits of campus building operations.
        </p>
      </div>

      {/* Main Form & Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Configure report</h2>
            <p className="text-xs text-slate-400 mt-1">Select scope and reporting period.</p>
          </div>

          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Report type
              </label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
                >
                  <option value="Daily Energy Report">Daily Energy Report</option>
                  <option value="Weekly Summary Report">Weekly Summary Report</option>
                  <option value="Monthly Environmental Audit">Monthly Environmental Audit</option>
                  <option value="Occupancy vs Power Correlation">Occupancy vs Power Correlation</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Building</label>
              <div className="relative">
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
                >
                  <option value="All buildings">All buildings</option>
                  <option value="SVH">SVH</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Law">Law</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date range</label>
              <input
                type="date"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Grouping</label>
              <div className="relative">
                <select
                  value={grouping}
                  onChange={(e) => setGrouping(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Eye className="w-4 h-4" />
              Preview report
            </button>
          </form>
        </div>

        {/* Right Preview Box */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 min-h-[460px]">
          {!isPreviewed ? (
            <div className="h-full min-h-[380px] flex flex-col justify-center items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Your report preview will appear here</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Configure scope options on the left and click Preview Report.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {building} • {grouping} BREAKDOWN
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{reportType}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Date Period: {dateRange}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={exportPDF}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm shadow-blue-500/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500">Total Energy Load</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">1,842.6 kWh</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500">Average Occupancy</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">57% (155 occupants)</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500">Efficiency Score</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">92 / 100</p>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3">BUILDING & ROOM</th>
                        <th className="py-3 px-3 text-center">OCCUPANTS</th>
                        <th className="py-3 px-3 text-center">POWER LOAD</th>
                        <th className="py-3 px-3 text-center">TEMP (°C)</th>
                        <th className="py-3 px-3 text-center">CO₂ (PPM)</th>
                        <th className="py-3 px-3">STATUS & ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {DETAILED_REPORT_DATA.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{item.room}</p>
                            <p className="text-[11px] text-slate-400">{item.building} · {item.floor}</p>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            {item.occupants} <span className="text-slate-400 font-normal">/ {item.capacity}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold">{item.powerKw} kW</td>
                          <td className="py-3 px-3 text-center font-semibold">{item.tempC} °C</td>
                          <td className="py-3 px-3 text-center font-semibold">{item.co2Ppm} ppm</td>
                          <td className="py-3 px-3">
                            <span
                              className={`font-bold block text-[11px] ${
                                item.status.includes('Waste') || item.status.includes('Lighting')
                                  ? 'text-amber-600'
                                  : item.status.includes('High')
                                  ? 'text-red-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {item.status}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{item.action}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}