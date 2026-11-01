import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  ShieldCheck,
  BarChart3,
  Eye,
  Plus,
  Search,
  ChevronDown,
  SlidersHorizontal,
  Bell,
  X,
  UserPlus,
  Edit2,
  Trash2,
} from 'lucide-react';

const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Arjun Kumar',
    email: 'admin@campustwin.demo',
    role: 'Facility Administrator',
    status: 'Active',
    lastLogin: 'Today, 11:38 AM',
    building: 'SVH',
  },
  {
    id: 'usr-2',
    name: 'Meera Sharma',
    email: 'meera@campustwin.demo',
    role: 'Energy Manager',
    status: 'Active',
    lastLogin: 'Yesterday, 4:12 PM',
    building: 'Engineering',
  },
  {
    id: 'usr-3',
    name: 'Rohan Verma',
    email: 'rohan@campustwin.demo',
    role: 'Operations Staff',
    status: 'Active',
    lastLogin: 'May 16, 9:06 AM',
    building: 'Law',
  },
  {
    id: 'usr-4',
    name: 'Priya Singh',
    email: 'priya@campustwin.demo',
    role: 'Read-only User',
    status: 'Pending',
    lastLogin: 'Never',
    building: 'SVH',
  },
  {
    id: 'usr-5',
    name: 'Amit Patel',
    email: 'amit@campustwin.demo',
    role: 'Operations Staff',
    status: 'Inactive',
    lastLogin: 'Apr 28, 2:15 PM',
    building: 'Engineering',
  },
];

export default function UsersView({ userName = 'User' }) {
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('All buildings');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [currentTime24, setCurrentTime24] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Operations Staff',
    building: 'SVH',
    status: 'Active',
  });

  // 24-Hour Clock
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

  // Filtered Users
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding =
      buildingFilter === 'All buildings' || user.building === buildingFilter;
    const matchesStatus =
      statusFilter === 'All statuses' || user.status === statusFilter;
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  // Add / Edit Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Operations Staff',
      building: 'SVH',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      building: user.building,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
      );
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        ...formData,
        lastLogin: 'Just now',
      };
      setUsersList((prev) => [newUser, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-slate-50 text-slate-900 overflow-y-auto h-full space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>CampusTwin</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Users</span>
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

      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
            IILM UNIVERSITY • GREATER NOIDA
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage authorized access to CampusTwin EnergyMind.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-sm shadow-blue-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add user
        </button>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total users</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
            <p className="text-xs text-slate-400 mt-0.5">21 active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Administrators */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Administrators</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
            <p className="text-xs text-slate-400 mt-0.5">Full access</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Energy Managers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Energy managers</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">5</p>
            <p className="text-xs text-slate-400 mt-0.5">Analytics access</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* Read-only users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Read-only users</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">9</p>
            <p className="text-xs text-slate-400 mt-0.5">Faculty / student</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table & Controls Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Building Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All buildings">All buildings</option>
              <option value="SVH">SVH</option>
              <option value="Engineering">Engineering</option>
              <option value="Law">Law</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="All statuses">All statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* More Filters Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            More filters
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50/70 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">USER</th>
                <th className="py-3 px-4">ROLE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">LAST LOGIN</th>
                <th className="py-3 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No users found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">{user.role}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : user.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">{user.lastLogin}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
                        >
                          Edit user
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {editingUser ? 'Edit User Details' : 'Add New User'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Roy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@campustwin.demo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none"
                >
                  <option value="Facility Administrator">Facility Administrator</option>
                  <option value="Energy Manager">Energy Manager</option>
                  <option value="Operations Staff">Operations Staff</option>
                  <option value="Read-only User">Read-only User</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Building</label>
                <select
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none"
                >
                  <option value="SVH">SVH</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Law">Law</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}