import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Bell,
  Lightbulb,
  BarChart3,
  FileText,
  Users,
  Settings,
  Zap,
  Gauge,
  UserCheck,
  AlertTriangle,
  Thermometer,
  Activity,
  ChevronDown,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formattedRole =
    userRole === 'admin' ? 'Facility Administrator' : 'Staff Member';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1727] text-slate-300 flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out shrink-0 h-full ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">CampusTwin</h1>
                <p className="text-blue-400 font-semibold text-sm">EnergyMind</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              <button
                onClick={() => setActiveNav && setActiveNav('Dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer ${
                  activeNav === 'Dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveNav && setActiveNav('Building')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer ${
                  activeNav === 'Building'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5" />
                Building
              </button>
              <button
                onClick={() => setActiveNav && setActiveNav('Alerts')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  Alerts
                </div>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  6
                </span>
              </button>
              <button
                onClick={() => setActiveNav && setActiveNav('Recommendations')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
              >
                <Lightbulb className="w-5 h-5" />
                Recommendations
              </button>
              <button
                onClick={() => setActiveNav && setActiveNav('Analytics')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
              <button
                onClick={() => setActiveNav && setActiveNav('Reports')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                Reports
              </button>
              <button
                onClick={() => setActiveNav && setActiveNav('Users')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
              >
                <Users className="w-5 h-5" />
                Users
              </button>
              <button
                onClick={() => setActiveNav && setActiveNav('Settings')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm shrink-0">
                {getInitials(userName)}
              </div>
              <div className="truncate">
                <p className="text-white text-sm font-semibold leading-tight truncate">
                  {userName}
                </p>
                <p className="text-slate-400 text-xs truncate">{formattedRole}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <span>CampusTwin</span>
              <span>/</span>
              <span className="text-slate-900 font-semibold">{activeNav}</span>
            </div>
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

            <span className="hidden md:inline text-xs text-slate-400 font-medium">
              Updated {currentTime || 'just now'}
            </span>

            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Campus Overview</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Monitor occupancy, energy and indoor environmental conditions.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none hover:border-slate-400 shadow-sm cursor-pointer"
                >
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-sm transition cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Generate report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Building status</h2>
                  <button
                    onClick={() => setActiveNav && setActiveNav('Building')}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    View twin
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-6">Live operational snapshot</p>

                <div className="space-y-4">
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

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">Recent alerts</h2>
                  <button className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700">
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
                        <td className="py-4 px-2 text-slate-800 font-medium truncate">High CO₂</td>
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

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Latest recommendations</h2>
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
                    SVH • Room 207 • 0 occupants • HVAC 3.8 kW
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
                    Engineering • Room 405 • CO₂ 1,284 ppm
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-amber-800 font-medium block">
                    Estimated avoidable waste
                  </span>
                  <span className="text-xl font-bold text-amber-950">18.6 kWh</span>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md self-start sm:self-auto">
                  Based on 3 events
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}