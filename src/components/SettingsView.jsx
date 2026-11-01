import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  ChevronDown,
  Save,
  Sliders,
  Shield,
  Database,
  SlidersHorizontal,
  RefreshCw,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function SettingsView({ userName = 'User' }) {
  const [activeTab, setActiveTab] = useState('general');
  const [currentTime24, setCurrentTime24] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings Form State
  const [generalConfig, setGeneralConfig] = useState({
    campusName: 'IILM University Greater Noida',
    defaultBuilding: 'SVH',
    refreshRate: '30',
    timeFormat: '24-hour (HH:mm:ss)',
  });

  const [alertThresholds, setAlertThresholds] = useState({
    co2Warning: '1000',
    co2Critical: '1200',
    tempMin: '20.0',
    tempMax: '26.0',
    hvacIdleWasteTimeout: '15',
    emailAlertsEnabled: true,
  });

  const [dbConfig, setDbConfig] = useState({
    supabaseUrl: 'https://xyzuniversity.supabase.co',
    telemetryRetentionDays: '90',
    autoBackup: true,
  });

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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate API / Supabase save delay
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Settings</span>
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

      {/* Title & Save Button Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
            IILM UNIVERSITY • GREATER NOIDA
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            System Settings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Configure telemetry polling thresholds, environmental alerts, and global operational parameters.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-sm shadow-blue-500/20 disabled:opacity-60 self-start sm:self-auto"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved successfully!' : 'Save changes'}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          General System Config
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'alerts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Alert & Thresholds
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Database className="w-4 h-4" />
          Supabase & Retention
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security & Access Policies
        </button>
      </div>

      {/* Content Form Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            Configuration parameters updated dynamically.
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* TAB 1: GENERAL SYSTEM CONFIG */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">General Campus Parameters</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set baseline campus naming and view defaults across all sub-modules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    University / Campus Naming
                  </label>
                  <input
                    type="text"
                    value={generalConfig.campusName}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, campusName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Default Building Scope on Login
                  </label>
                  <div className="relative">
                    <select
                      value={generalConfig.defaultBuilding}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, defaultBuilding: e.target.value })}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer"
                    >
                      <option value="SVH">SVH (Main Building)</option>
                      <option value="Engineering">Engineering Block</option>
                      <option value="Law">Law Block</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Telemetry Refresh Frequency (Seconds)
                  </label>
                  <select
                    value={generalConfig.refreshRate}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, refreshRate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition"
                  >
                    <option value="10">10 Seconds (High Load)</option>
                    <option value="30">30 Seconds (Standard Balanced)</option>
                    <option value="60">60 Seconds (Low Bandwidth)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Clock & Display Format
                  </label>
                  <input
                    type="text"
                    disabled
                    value={generalConfig.timeFormat}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALERTS & THRESHOLDS */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Environmental Anomaly Thresholds</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define automated warning levels for occupancy, temperature, and indoor CO₂ monitoring.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    CO₂ Warning Threshold (PPM)
                  </label>
                  <input
                    type="number"
                    value={alertThresholds.co2Warning}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, co2Warning: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Standard comfort limit: 1,000 PPM</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    CO₂ Critical Emergency Threshold (PPM)
                  </label>
                  <input
                    type="number"
                    value={alertThresholds.co2Critical}
                    onChange={(e) => setAlertThresholds({ ...alertThresholds, co2Critical: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Idle Room HVAC Waste Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    value={alertThresholds.hvacIdleWasteTimeout}
                    onChange={(e) =>
                      setAlertThresholds({ ...alertThresholds, hvacIdleWasteTimeout: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Triggers ALT-1048 alert if 0 occupants detected</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Automated Email Notifications</p>
                    <p className="text-[11px] text-slate-400">Send critical alert summaries to facility admins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertThresholds.emailAlertsEnabled}
                    onChange={(e) =>
                      setAlertThresholds({ ...alertThresholds, emailAlertsEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE & RETENTION */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Database & Data Persistence</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage Supabase PostgreSQL telemetry sync and audit log retention schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Connected Supabase Endpoint
                  </label>
                  <input
                    type="text"
                    disabled
                    value={dbConfig.supabaseUrl}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-medium text-slate-600 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Historical Telemetry Retention (Days)
                  </label>
                  <select
                    value={dbConfig.telemetryRetentionDays}
                    onChange={(e) => setDbConfig({ ...dbConfig, telemetryRetentionDays: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition"
                  >
                    <option value="30">30 Days (Compact)</option>
                    <option value="90">90 Days (Recommended)</option>
                    <option value="365">365 Days (Full Academic Year)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ACCESS POLICIES */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Security & Role Policies</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review authentication enforcement rules and role-based access control (RBAC).
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">University Email OTP Auth Required</p>
                    <p className="text-[11px] text-slate-400">Strictly restrict logins to approved university email accounts</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                    ENFORCED
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Role-Based Access Control (RBAC)</p>
                    <p className="text-[11px] text-slate-400">Differentiate Facility Administrator vs Operations Staff capabilities</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}