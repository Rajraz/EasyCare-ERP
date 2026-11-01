import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  Globe,
  Smartphone,
  Lock,
  KeyRound,
  Edit3,
  Trash2,
  AlertCircle,
  Ban,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { MasterUser, UserRole, UserStatus, AttendancePrivilege } from '../../types/hospital';
import { Modal } from '../common/Modal';

interface MasterUsersTabProps {
  onShowToast: (msg: string) => void;
}

export const MasterUsersTab: React.FC<MasterUsersTabProps> = ({ onShowToast }) => {
  const {
    masterUsers,
    addMasterUser,
    updateMasterUser,
    deleteMasterUser,
    toggleUserStatus,
    toggleWebAccess,
    toggleMobileAccess,
    toggleAttendanceRequired,
    updatePremisesPrivilege,
    departments,
    staff,
  } = useHospital();

  const { currentUser: authUser } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [platformFilter, setPlatformFilter] = useState<
    'all' | 'web_allowed' | 'web_blocked' | 'mobile_allowed' | 'mobile_blocked'
  >('all');
  const [attendanceRequiredFilter, setAttendanceRequiredFilter] = useState<
    'all' | 'required' | 'exempt'
  >('all');
  const [premisesFilter, setPremisesFilter] = useState<
    'all' | 'inside_only' | 'outside_only' | 'both'
  >('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MasterUser | null>(null);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<MasterUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  // Form state
  const [userForm, setUserForm] = useState<Omit<MasterUser, 'id' | 'createdAt'>>({
    fullName: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '+91 ',
    password: '',
    role: 'nurse',
    department: departments[0]?.name || 'Hospital Administration',
    departmentId: departments[0]?.id || 'dept-7',
    designation: '',
    specialization: '',
    employeeId: '',
    allowWebAccess: true,
    allowMobileAccess: true,
    status: 'active',
    isAttendanceRequired: true,
    attendancePrivilege: 'inside_only',
    notes: '',
  });

  // KPI Calculations
  const totalUsers = masterUsers.length;
  const activeUsersCount = masterUsers.filter((u) => u.status === 'active').length;
  const inactiveUsersCount = masterUsers.filter((u) => u.status === 'inactive').length;
  const webAllowedCount = masterUsers.filter((u) => u.allowWebAccess).length;
  const mobileAllowedCount = masterUsers.filter((u) => u.allowMobileAccess).length;
  const attendanceRequiredCount = masterUsers.filter((u) => u.isAttendanceRequired !== false).length;

  // Filtered Users List
  const filteredUsers = masterUsers.filter((u) => {
    // Search match
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(term)) ||
      u.designation.toLowerCase().includes(term) ||
      u.department.toLowerCase().includes(term);

    // Status filter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    // Platform filter
    let matchesPlatform = true;
    if (platformFilter === 'web_allowed') matchesPlatform = u.allowWebAccess;
    else if (platformFilter === 'web_blocked') matchesPlatform = !u.allowWebAccess;
    else if (platformFilter === 'mobile_allowed') matchesPlatform = u.allowMobileAccess;
    else if (platformFilter === 'mobile_blocked') matchesPlatform = !u.allowMobileAccess;

    // Attendance Required filter
    let matchesAttendance = true;
    if (attendanceRequiredFilter === 'required') matchesAttendance = u.isAttendanceRequired !== false;
    else if (attendanceRequiredFilter === 'exempt') matchesAttendance = u.isAttendanceRequired === false;

    // Premises filter
    const privilege = u.attendancePrivilege || 'inside_only';
    const matchesPremises = premisesFilter === 'all' || privilege === premisesFilter;

    // Role filter
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesPlatform && matchesAttendance && matchesPremises && matchesRole;
  });

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      fullName: '',
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '+91 98450 ',
      password: 'user123',
      role: 'nurse',
      department: departments[0]?.name || 'General Medicine',
      departmentId: departments[0]?.id || 'dept-7',
      designation: 'Clinical Staff',
      specialization: 'Patient Care',
      employeeId: `EMP-${String(masterUsers.length + 1).padStart(3, '0')}`,
      allowWebAccess: true,
      allowMobileAccess: true,
      status: 'active',
      isAttendanceRequired: true,
      attendancePrivilege: 'inside_only',
      notes: '',
    });
    setShowPasswordInModal(false);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: MasterUser) => {
    setEditingUser(user);
    setUserForm({
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: user.role,
      department: user.department,
      departmentId: user.departmentId || departments[0]?.id || 'dept-7',
      designation: user.designation,
      specialization: user.specialization || '',
      employeeId: user.employeeId || '',
      staffId: user.staffId,
      allowWebAccess: user.allowWebAccess,
      allowMobileAccess: user.allowMobileAccess,
      status: user.status,
      isAttendanceRequired: user.isAttendanceRequired !== false,
      attendancePrivilege: user.attendancePrivilege || 'inside_only',
      notes: user.notes || '',
    });
    setShowPasswordInModal(false);
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userForm.username.trim()) {
      alert('Please provide a valid username / login ID');
      return;
    }
    if (!userForm.password.trim()) {
      alert('Please provide a password');
      return;
    }

    let fName = userForm.firstName;
    let lName = userForm.lastName;
    if (!fName && userForm.fullName) {
      const parts = userForm.fullName.trim().split(' ');
      fName = parts[0] || 'User';
      lName = parts.slice(1).join(' ') || '';
    }
    const computedFullName = userForm.fullName || `${fName} ${lName}`.trim();

    const payload = {
      ...userForm,
      fullName: computedFullName,
      firstName: fName,
      lastName: lName,
    };

    if (editingUser) {
      updateMasterUser(editingUser.id, payload);
      onShowToast(`Updated Master User: @${payload.username} (${payload.fullName})`);
    } else {
      addMasterUser(payload);
      onShowToast(`Created New Master User: @${payload.username}`);
    }

    setUserModalOpen(false);
  };

  const handleToggleUserStatus = (user: MasterUser) => {
    const { newStatus } = toggleUserStatus(user.id);
    if (newStatus === 'active') {
      onShowToast(`User status updated: @${user.username} is now ACTIVE. Login permitted.`);
    } else {
      onShowToast(`User status updated: @${user.username} is now INACTIVE. Login blocked.`);
    }
  };

  const handleToggleWebAccess = (user: MasterUser) => {
    const { newAccess } = toggleWebAccess(user.id);
    if (newAccess) {
      onShowToast(`Web ERP Access AUTHORIZED for @${user.username}`);
    } else {
      onShowToast(`Web ERP Access BLOCKED for @${user.username} (Mobile Only)`);
    }
  };

  const handleToggleMobileAccess = (user: MasterUser) => {
    const { newAccess } = toggleMobileAccess(user.id);
    if (newAccess) {
      onShowToast(`Mobile App Access AUTHORIZED for @${user.username}`);
    } else {
      onShowToast(`Mobile App Access BLOCKED for @${user.username}`);
    }
  };

  const handleToggleAttendanceRequired = (user: MasterUser) => {
    const { newRequired } = toggleAttendanceRequired(user.id);
    if (newRequired) {
      onShowToast(`Attendance Required: YES for @${user.username}. Duty punch is now required & permitted.`);
    } else {
      onShowToast(`Attendance Required: NO (Exempt) for @${user.username}. Duty punch disabled.`);
    }
  };

  const handleCyclePremises = (user: MasterUser) => {
    const current = user.attendancePrivilege || 'inside_only';
    let nextPrivilege: AttendancePrivilege = 'both';
    if (current === 'inside_only') nextPrivilege = 'outside_only';
    else if (current === 'outside_only') nextPrivilege = 'both';
    else nextPrivilege = 'inside_only';

    updatePremisesPrivilege(user.id, nextPrivilege);
    const label =
      nextPrivilege === 'both'
        ? 'Inside & Outside Premises'
        : nextPrivilege === 'inside_only'
        ? 'Inside Premises Only'
        : 'Outside Premises Only';
    onShowToast(`Attendance premises for @${user.username} updated to: ${label}`);
  };

  const handleDeleteUser = (user: MasterUser) => {
    if (user.username === 'admin') {
      alert('The root super admin account cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete Master User @${user.username} (${user.fullName})?`)) {
      deleteMasterUser(user.id);
      onShowToast(`Deleted Master User: @${user.username}`);
    }
  };

  const handleOpenResetPassword = (user: MasterUser) => {
    setResetTargetUser(user);
    setNewPassword(`${user.username}123`);
    setResetPasswordModalOpen(true);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword.trim()) return;

    updateMasterUser(resetTargetUser.id, { password: newPassword.trim() });
    onShowToast(`Password updated for user @${resetTargetUser.username}`);
    setResetPasswordModalOpen(false);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserForm((prev) => ({ ...prev, password: res }));
    setShowPasswordInModal(true);
  };

  const handleSelectStaffLink = (staffId: string) => {
    const member = staff.find((s) => s.id === staffId);
    if (member) {
      setUserForm((prev) => ({
        ...prev,
        staffId: member.id,
        employeeId: member.employeeId,
        fullName: `${member.firstName} ${member.lastName}`,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        role: member.role,
        department: member.departmentName || departments[0]?.name || 'General',
        departmentId: member.departmentId,
        designation: member.designation,
        specialization: member.specialization,
        attendancePrivilege: member.attendancePrivilege || 'inside_only',
        isAttendanceRequired: member.isAttendanceRequired !== false,
        username: member.firstName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.' + member.lastName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
            <p className="text-lg font-extrabold text-slate-800">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
            <p className="text-lg font-extrabold text-emerald-600">{activeUsersCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Ban className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive</p>
            <p className="text-lg font-extrabold text-rose-600">{inactiveUsersCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Web Allowed</p>
            <p className="text-lg font-extrabold text-sky-600">{webAllowedCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Allowed</p>
            <p className="text-lg font-extrabold text-teal-600">{mobileAllowedCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Punch Required</p>
            <p className="text-lg font-extrabold text-amber-600">{attendanceRequiredCount}</p>
          </div>
        </div>
      </div>

      {/* Policy Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-sky-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">
              Master User Account, Multi-Channel Access & Attendance Policy
            </p>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              Authorize <strong>Web ERP</strong> & <strong>Mobile App</strong> channels, toggle <strong>Login Status</strong>, and configure <strong>Attendance Required</strong> policies with <strong>Inside vs Outside Premises</strong> access control.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddUser}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 whitespace-nowrap self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Master User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, @username, email, employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="all">All ({totalUsers})</option>
              <option value="active">Active Only ({activeUsersCount})</option>
              <option value="inactive">Inactive Only ({inactiveUsersCount})</option>
            </select>
          </div>

          {/* Platform Access Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Channels:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="all">All Channels</option>
              <option value="web_allowed">Web Allowed</option>
              <option value="web_blocked">Web Blocked</option>
              <option value="mobile_allowed">Mobile Allowed</option>
              <option value="mobile_blocked">Mobile Blocked</option>
            </select>
          </div>

          {/* Attendance Required Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Attendance:</span>
            <select
              value={attendanceRequiredFilter}
              onChange={(e) => setAttendanceRequiredFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="all">All Policies</option>
              <option value="required">Required Only</option>
              <option value="exempt">Exempt Only</option>
            </select>
          </div>

          {/* Premises Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Premises:</span>
            <select
              value={premisesFilter}
              onChange={(e) => setPremisesFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="all">All Premises</option>
              <option value="inside_only">Inside Premises Only</option>
              <option value="outside_only">Outside Premises Only</option>
              <option value="both">Both (Inside & Outside)</option>
            </select>
          </div>

          {(searchTerm ||
            statusFilter !== 'all' ||
            platformFilter !== 'all' ||
            attendanceRequiredFilter !== 'all' ||
            premisesFilter !== 'all' ||
            roleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPlatformFilter('all');
                setAttendanceRequiredFilter('all');
                setPremisesFilter('all');
                setRoleFilter('all');
              }}
              className="px-2.5 py-1.5 rounded-lg text-sky-600 hover:bg-sky-50 font-bold text-[11px] transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Master Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5">Master User & Identity</th>
                <th className="py-3 px-3">Role & Dept</th>
                <th className="py-3 px-2.5 text-center">Web Access</th>
                <th className="py-3 px-2.5 text-center">Mobile Access</th>
                <th className="py-3 px-3 text-center">Attendance Required</th>
                <th className="py-3 px-3 text-center">Premises Access</th>
                <th className="py-3 px-2.5 text-center">Login Status</th>
                <th className="py-3 px-3">Password</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No master user accounts match current criteria</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try resetting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAuthUser = authUser.username === user.username;
                  const isActive = user.status === 'active';
                  const isAttendanceRequired = user.isAttendanceRequired !== false;
                  const privilege = user.attendancePrivilege || 'inside_only';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isActive ? 'bg-slate-50/40 opacity-80' : ''
                      }`}
                    >
                      {/* 1. Identity */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0 ${
                              user.role === 'super_admin'
                                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                                : user.role === 'doctor'
                                ? 'bg-gradient-to-tr from-sky-600 to-cyan-600'
                                : user.role === 'nurse'
                                ? 'bg-gradient-to-tr from-teal-600 to-emerald-600'
                                : 'bg-slate-700'
                            }`}
                          >
                            {user.firstName[0]}
                            {user.lastName ? user.lastName[0] : ''}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {user.fullName}
                              </span>
                              {user.employeeId && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                  {user.employeeId}
                                </span>
                              )}
                              {isCurrentAuthUser && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  You
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="text-sky-700 font-semibold">@{user.username}</span>
                              <span>•</span>
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role & Department */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide ${
                            user.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'doctor'
                              ? 'bg-sky-100 text-sky-800'
                              : user.role === 'nurse'
                              ? 'bg-teal-100 text-teal-800'
                              : user.role === 'hr_manager'
                              ? 'bg-amber-100 text-amber-800'
                              : user.role === 'pharmacist'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                        <p className="text-[10px] text-slate-600 font-medium mt-0.5 truncate">
                          {user.department}
                        </p>
                      </td>

                      {/* 3. Web Access */}
                      <td className="py-3 px-2.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleWebAccess(user)}
                            title={`Click to ${user.allowWebAccess ? 'Block' : 'Authorize'} Web ERP Access`}
                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              user.allowWebAccess ? 'bg-sky-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                user.allowWebAccess ? 'translate-x-3' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-flex items-center gap-1 ${
                              user.allowWebAccess
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Globe className="w-2.5 h-2.5" />
                            {user.allowWebAccess ? 'Allowed' : 'Blocked'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Mobile Access */}
                      <td className="py-3 px-2.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleMobileAccess(user)}
                            title={`Click to ${user.allowMobileAccess ? 'Block' : 'Authorize'} Mobile App Access`}
                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              user.allowMobileAccess ? 'bg-teal-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                user.allowMobileAccess ? 'translate-x-3' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-flex items-center gap-1 ${
                              user.allowMobileAccess
                                ? 'bg-teal-50 text-teal-700'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Smartphone className="w-2.5 h-2.5" />
                            {user.allowMobileAccess ? 'Allowed' : 'Blocked'}
                          </span>
                        </div>
                      </td>

                      {/* 5. Attendance Required (if required only allow) */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendanceRequired(user)}
                            title={`Click to switch Attendance Policy (Current: ${isAttendanceRequired ? 'Required' : 'Exempt'})`}
                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              isAttendanceRequired ? 'bg-amber-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isAttendanceRequired ? 'translate-x-3' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-flex items-center gap-1 ${
                              isAttendanceRequired
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            {isAttendanceRequired ? 'Required' : 'Exempt'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Premises Access (inside, outside premises) */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleCyclePremises(user)}
                          title="Click to cycle premises authorization (Inside -> Outside -> Both)"
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all inline-flex items-center gap-1.5 ${
                            privilege === 'both'
                              ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                              : privilege === 'outside_only'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {privilege === 'both' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-sky-600" />
                              Both (In & Out)
                            </>
                          ) : privilege === 'outside_only' ? (
                            <>
                              <MapPin className="w-3 h-3 text-purple-600" />
                              Outside Only
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3 h-3 text-emerald-600" />
                              Inside Only
                            </>
                          )}
                        </button>
                      </td>

                      {/* 7. Login Status */}
                      <td className="py-3 px-2.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(user)}
                            title={`Click to switch user status to ${isActive ? 'Inactive' : 'Active'}`}
                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              isActive ? 'bg-emerald-600' : 'bg-rose-500'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isActive ? 'translate-x-3' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-flex items-center gap-1 uppercase tracking-wider ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Active
                              </>
                            ) : (
                              <>
                                <Ban className="w-2.5 h-2.5 text-rose-600" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* 8. Password */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-500 tracking-wider">
                            ••••••••
                          </span>
                          <button
                            onClick={() => handleOpenResetPassword(user)}
                            title="Reset password"
                            className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {user.lastLogin && (
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                            {user.lastLogin}
                          </p>
                        )}
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            title="Edit User Profile & Access"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {user.username !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Delete Master User"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT MASTER USER */}
      {/* ========================================================================= */}
      {userModalOpen && (
        <Modal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          title={editingUser ? `Edit Master User: @${editingUser.username}` : 'Create New Master User Account'}
          subtitle="Configure system login credentials, multi-channel device access, attendance requirements & premises privileges."
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            {/* Optional Staff Auto-Linker */}
            {!editingUser && staff.length > 0 && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-sky-900 block">Link to Existing Hospital Staff Member?</span>
                  <p className="text-[11px] text-sky-700">
                    Optionally pre-fill details from your registered staff and doctors directory.
                  </p>
                </div>
                <select
                  onChange={(e) => handleSelectStaffLink(e.target.value)}
                  defaultValue=""
                  className="px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="" disabled>Select Staff Member...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.employeeId} - {s.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Username / Login ID * <span className="text-slate-400">(Unique)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dr.rajesh"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@easycare.health"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98450 00000"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  placeholder="EMP-012"
                  value={userForm.employeeId}
                  onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical / ERP Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg capitalize font-semibold"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="doctor">Consultant Doctor</option>
                  <option value="nurse">Nursing Staff / Sister</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="receptionist">Receptionist / Front Desk</option>
                  <option value="pharmacist">Chief Pharmacist</option>
                  <option value="lab_technician">Lab Technologist</option>
                  <option value="accountant">Billing & Accountant</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={userForm.department}
                  onChange={(e) => {
                    const d = departments.find((dept) => dept.name === e.target.value);
                    setUserForm({
                      ...userForm,
                      department: e.target.value,
                      departmentId: d?.id || userForm.departmentId,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Medical Officer"
                  value={userForm.designation}
                  onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Account Password *</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Auto-Generate Strong Password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPasswordInModal ? 'text' : 'password'}
                  required
                  placeholder="Enter login password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 pr-10 py-2 border border-slate-200 rounded-lg font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CHANNEL ACCESS, ATTENDANCE POLICY & PREMISES */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                Multi-Channel Device Access & Attendance Policy
              </span>

              {/* 1. Allow Web Access */}
              <div className="flex items-start justify-between gap-4 p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Allow Web Access (Easy Care Browser Portal)</p>
                    <p className="text-[11px] text-slate-500">
                      When enabled, this user can log into the desktop browser portal. When disabled, web login is rejected with a notice.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={userForm.allowWebAccess}
                    onChange={(e) => setUserForm({ ...userForm, allowWebAccess: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>

              {/* 2. Allow Mobile Access */}
              <div className="flex items-start justify-between gap-4 p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Allow Mobile Access (Doctor / Staff Mobile App)</p>
                    <p className="text-[11px] text-slate-500">
                      Authorizes this account to authenticate into the mobile staff application for on-call duties and attendance.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={userForm.allowMobileAccess}
                    onChange={(e) => setUserForm({ ...userForm, allowMobileAccess: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* 3. Attendance Required Policy */}
              <div className="flex items-start justify-between gap-4 p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Attendance Required (Duty Punch Allowed)</p>
                    <p className="text-[11px] text-slate-500">
                      <strong>If required, only then allow attendance punch.</strong> If disabled, the staff member is marked as exempt and duty punching is disabled.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={userForm.isAttendanceRequired}
                    onChange={(e) => setUserForm({ ...userForm, isAttendanceRequired: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* 4. Attendance Premises Access Control (inside, outside premises) */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-slate-800">Attendance Premises Access Authorization</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, attendancePrivilege: 'inside_only' })}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      userForm.attendancePrivilege === 'inside_only'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px]">Inside Only</span>
                    </div>
                    <p className="text-[9px] text-slate-500">Biometric Gate / On-site wards</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, attendancePrivilege: 'outside_only' })}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      userForm.attendancePrivilege === 'outside_only'
                        ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-[11px]">Outside Only</span>
                    </div>
                    <p className="text-[9px] text-slate-500">Ambulance / Field emergency</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, attendancePrivilege: 'both' })}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      userForm.attendancePrivilege === 'both'
                        ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-[11px]">Both (In & Out)</span>
                    </div>
                    <p className="text-[9px] text-slate-500">Unrestricted duty punch</p>
                  </button>
                </div>
              </div>

              {/* 5. User Login Status (Active vs Inactive) */}
              <div className="flex items-start justify-between gap-4 p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Account Login Status (Active / Inactive)</p>
                    <p className="text-[11px] text-slate-500">
                      If set to <strong>Inactive</strong>, the user cannot log into any application interface. Any existing session is automatically terminated.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={userForm.status === 'active'}
                    onChange={(e) =>
                      setUserForm({ ...userForm, status: e.target.checked ? 'active' : 'inactive' })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-rose-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
              >
                {editingUser ? 'Save Changes' : 'Create Master User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESET PASSWORD */}
      {/* ========================================================================= */}
      {resetPasswordModalOpen && resetTargetUser && (
        <Modal
          isOpen={resetPasswordModalOpen}
          onClose={() => setResetPasswordModalOpen(false)}
          title={`Reset Password: @${resetTargetUser.username}`}
          subtitle={`User: ${resetTargetUser.fullName} (${resetTargetUser.role.replace('_', ' ')})`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Security Note
              </p>
              <p className="text-[11px] text-amber-800 mt-1">
                The user must use this new password immediately upon next workstation login.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetPasswordModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
              >
                Confirm New Password
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
