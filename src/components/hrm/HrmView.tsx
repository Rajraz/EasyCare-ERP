import React, { useState } from 'react';
import {
  UserCheck2,
  Users,
  Clock,
  Calendar,
  IndianRupee,
  PlusCircle,
  CheckCircle,
  XCircle,
  Printer,
  Search,
  KeyRound,
  FileCheck,
  Building2,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Check,
  Edit3,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Staff, LeaveRequest, StaffPermission, PayrollRecord, UserRole, PermissionType, AttendancePrivilege } from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { DatePicker } from '../common/DatePicker';
import { formatCurrency, formatDate } from '../../lib/utils';

export const HrmView: React.FC = () => {
  const {
    staff,
    addStaff,
    updateStaff,
    attendance,
    clockInStaff,
    clockOutStaff,
    leaves,
    submitLeave,
    updateLeaveStatus,
    permissions,
    applyPermission,
    updatePermissionStatus,
    payroll,
    markPayrollPaid,
    departments,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'staff' | 'attendance' | 'leaves' | 'permissions' | 'payroll'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [selectedGatePass, setSelectedGatePass] = useState<StaffPermission | null>(null);

  // New Staff Form State
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'nurse' as UserRole,
    departmentId: departments[0]?.id || '',
    designation: '',
    licenseNumber: '',
    specialization: '',
    joiningDate: formatDate(new Date().toISOString()),
    basicSalary: 65000,
    shiftTiming: '08:00 AM - 04:30 PM',
  });

  // Leave Request Form State
  const [leaveForm, setLeaveForm] = useState({
    staffId: staff[0]?.id || '',
    leaveType: 'Casual' as 'Casual' | 'Sick' | 'Privilege' | 'Emergency',
    startDate: formatDate(new Date().toISOString()),
    endDate: formatDate(new Date().toISOString()),
    totalDays: 2,
    reason: '',
  });

  // Permission Request Form State
  const [permForm, setPermForm] = useState({
    staffId: staff[0]?.id || '',
    permissionType: 'Mid-Day Short Absence' as PermissionType,
    date: formatDate(new Date().toISOString()),
    fromTime: '11:00 AM',
    toTime: '01:00 PM',
    durationHours: 2,
    reason: '',
  });

  // Edit Staff Attendance Privilege State
  const [editingPrivilegeStaff, setEditingPrivilegeStaff] = useState<Staff | null>(null);
  const [selectedPrivilege, setSelectedPrivilege] = useState<AttendancePrivilege>('inside_only');

  // Terminal Simulator State for testing attendance privilege checks
  const [simStaffId, setSimStaffId] = useState<string>(staff[0]?.id || '');
  const [simMode, setSimMode] = useState<'inside' | 'outside'>('inside');
  const [simLocation, setSimLocation] = useState<string>('');
  const [simResult, setSimResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSimulatePunch = () => {
    if (!simStaffId) return;
    const res = clockInStaff(simStaffId, simMode, simLocation || undefined);
    setSimResult(res);
  };

  const handleSavePrivilege = () => {
    if (!editingPrivilegeStaff) return;
    updateStaff(editingPrivilegeStaff.id, { attendancePrivilege: selectedPrivilege });
    setEditingPrivilegeStaff(null);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === staffForm.departmentId);
    const empId = `EMP-${String(staff.length + 1).padStart(3, '0')}`;

    addStaff({
      ...staffForm,
      employeeId: empId,
      departmentName: dept?.name || 'General',
      isActive: true,
    });

    setIsAddStaffModalOpen(false);
    setStaffForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'nurse',
      departmentId: departments[0]?.id || '',
      designation: '',
      licenseNumber: '',
      specialization: '',
      joiningDate: formatDate(new Date().toISOString()),
      basicSalary: 65000,
      shiftTiming: '08:00 AM - 04:30 PM',
    });
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = staff.find((s) => s.id === leaveForm.staffId);
    if (!member) return;

    submitLeave({
      staffId: member.id,
      staffName: `${member.firstName} ${member.lastName}`,
      employeeId: member.employeeId,
      department: member.departmentName || 'Clinical',
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays: Number(leaveForm.totalDays),
      reason: leaveForm.reason,
    });

    setIsLeaveModalOpen(false);
    setLeaveForm({ ...leaveForm, reason: '' });
  };

  const handlePermissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = staff.find((s) => s.id === permForm.staffId);
    if (!member) return;

    const newPerm = applyPermission({
      staffId: member.id,
      staffName: `${member.firstName} ${member.lastName}`,
      employeeId: member.employeeId,
      department: member.departmentName || 'Clinical',
      permissionType: permForm.permissionType,
      date: permForm.date,
      fromTime: permForm.fromTime,
      toTime: permForm.toTime,
      durationHours: Number(permForm.durationHours),
      reason: permForm.reason,
    });

    setIsPermissionModalOpen(false);
    setPermForm({ ...permForm, reason: '' });
    setSelectedGatePass(newPerm);
  };

  const filteredStaff = staff.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck2 className="w-5 h-5 text-sky-600" />
            Human Resources Management (HRM) & Staff Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage clinical credentials, biometric shift attendance, duty permissions (gate pass), leaves, and Indian payroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPermissionModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-amber-600" />
            Apply Permission / Gate Pass
          </button>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            Apply Leave
          </button>
          <button
            onClick={() => setIsAddStaffModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* HRM Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs overflow-x-auto">
        {[
          { id: 'staff', label: 'Staff Roster & Licensing', icon: Users, count: staff.length },
          { id: 'attendance', label: 'Shift Attendance & Biometrics', icon: Clock, count: attendance.length },
          {
            id: 'leaves',
            label: 'Leave Applications',
            icon: Calendar,
            count: leaves.filter((l) => l.status === 'pending').length,
            badgeColor: 'rose',
          },
          {
            id: 'permissions',
            label: 'Staff Permissions & Gate Pass',
            icon: KeyRound,
            count: permissions.filter((p) => p.status === 'pending').length,
            badgeColor: 'amber',
          },
          { id: 'payroll', label: 'Monthly Payroll (INR)', icon: IndianRupee, count: payroll.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.badgeColor === 'rose'
                      ? 'bg-rose-100 text-rose-700'
                      : tab.badgeColor === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Staff Directory */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, role, registration or EMP ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredStaff.length} healthcare professionals
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Role / Department</th>
                  <th className="py-3.5 px-4">Registration / MCI/KMC #</th>
                  <th className="py-3.5 px-4">Shift Schedule</th>
                  <th className="py-3.5 px-4">Monthly Basic (₹)</th>
                  <th className="py-3.5 px-4">Attendance Privilege</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => {
                  const todayStr = formatDate(new Date().toISOString());
                  const userAtt = attendance.find(
                    (a) => a.staffId === member.id && a.date === todayStr
                  );
                  const isClockedIn = Boolean(userAtt?.clockIn && !userAtt?.clockOut);
                  const priv = member.attendancePrivilege || 'inside_only';

                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="font-mono text-[10px] text-slate-500 font-semibold">
                              {member.employeeId} • {member.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{member.designation}</p>
                        <p className="text-[10px] text-slate-500">{member.departmentName}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                          {member.licenseNumber}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{member.specialization}</p>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {member.shiftTiming}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-800">
                        {formatCurrency(member.basicSalary)}
                      </td>

                      <td className="py-3 px-4">
                        {priv === 'both' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                            Inside & Outside
                          </span>
                        ) : priv === 'outside_only' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <MapPin className="w-3 h-3 text-purple-600" />
                            Outside Only
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Building2 className="w-3 h-3 text-emerald-600" />
                            Inside Only
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="success" size="sm">
                          Active Full-Time
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingPrivilegeStaff(member);
                              setSelectedPrivilege(member.attendancePrivilege || 'inside_only');
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1"
                            title="Update attendance premises privileges"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                            Privileges
                          </button>

                          <button
                            onClick={() => {
                              if (isClockedIn) {
                                clockOutStaff(member.id);
                              } else {
                                clockInStaff(member.id);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isClockedIn
                                ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {isClockedIn ? 'Clock Out' : 'Clock In'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance & Biometrics */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Geolocation & Premises Access Testing Terminal */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Attendance Punch Simulator & Premises Access Verification
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                HR Master Protocol
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Test staff attendance punches to verify the enforcement of <strong>Inside Hospital Premises Only</strong> vs <strong>Outside Premises Allowed</strong> privileges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Staff Member *</label>
                <select
                  value={simStaffId}
                  onChange={(e) => {
                    setSimStaffId(e.target.value);
                    setSimResult(null);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.attendancePrivilege === 'both' ? 'Both' : s.attendancePrivilege === 'outside_only' ? 'Outside' : 'Inside Only'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Punch Mode *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSimMode('inside');
                      setSimResult(null);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                      simMode === 'inside'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Inside
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimMode('outside');
                      setSimResult(null);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                      simMode === 'outside'
                        ? 'bg-sky-50 text-sky-800 border-sky-400 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> Outside
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location Tag (Optional)</label>
                <input
                  type="text"
                  placeholder={simMode === 'outside' ? 'e.g. Field Emergency Bay' : 'Hospital Gate 1'}
                  value={simLocation}
                  onChange={(e) => setSimLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSimulatePunch}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Punch Attendance
                </button>
              </div>
            </div>

            {/* Simulator Result Output */}
            {simResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 mt-2 ${
                  simResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                    : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                }`}
              >
                {simResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{simResult.message}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Today's Biometric & Location Attendance Log</h3>
              <span className="text-xs text-slate-500">Date: {formatDate(new Date().toISOString())}</span>
            </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Staff Name & ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Premises Mode</th>
                <th className="py-3 px-4">Clock-In Time</th>
                <th className="py-3 px-4">Clock-Out Time</th>
                <th className="py-3 px-4">Hours Logged</th>
                <th className="py-3 px-4">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {att.staffName}
                    <span className="text-[10px] text-slate-400 font-mono block font-normal">
                      {att.employeeId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{att.department}</td>
                  <td className="py-3 px-4">
                    {att.punchLocationMode === 'outside' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        <MapPin className="w-3 h-3 text-purple-600" /> Outside Premises
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Building2 className="w-3 h-3 text-emerald-600" /> Inside Hospital
                      </span>
                    )}
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {att.punchLocationName || 'Biometric Gate 1'}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                    {att.clockIn || '--:--'}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                    {att.clockOut || 'On Duty'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {att.hoursWorked > 0 ? `${att.hoursWorked} hrs` : '--'}
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        att.status === 'present'
                          ? 'success'
                          : att.status === 'late'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {att.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Tab 3: Leaves Management */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Staff Leave Applications & Approval Workflow</h3>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-500"
            >
              + Submit Leave
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Period & Duration (DD-MM-YYYY)</th>
                <th className="py-3 px-4">Stated Reason</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-right">HR Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {leave.staffName}
                    <span className="text-[10px] text-slate-400 font-mono block font-normal">
                      {leave.employeeId} • {leave.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{leave.leaveType} Leave</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      ({leave.totalDays} Days)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{leave.reason}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        leave.status === 'approved'
                          ? 'success'
                          : leave.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {leave.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {leave.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateLeaveStatus(leave.id, 'approved')}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 text-xs flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => updateLeaveStatus(leave.id, 'rejected')}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 text-xs flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Action Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Staff Permissions & Gate Pass (NEW!) */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Staff Permission Requests & Hospital Security Gate Pass
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Apply for Short Absence, Late Arrival, Early Leaving, or Official On-Duty (OD) movement.
              </p>
            </div>
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="px-3.5 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-500 shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Apply Permission / Gate Pass
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Gate Pass #</th>
                <th className="py-3 px-4">Staff Name & ID</th>
                <th className="py-3 px-4">Permission Type</th>
                <th className="py-3 px-4">Date & Time Slot (DD-MM-YYYY)</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-sky-700">
                    {perm.gatePassNo}
                    <span className="text-[10px] text-slate-400 font-sans block font-normal">
                      Applied: {formatDate(perm.appliedOn)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {perm.staffName}
                    <span className="text-[10px] text-slate-400 font-mono block font-normal">
                      {perm.employeeId} • {perm.department}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{perm.permissionType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{formatDate(perm.date)}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {perm.fromTime} to {perm.toTime}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{perm.durationHours} hrs</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{perm.reason}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        perm.status === 'approved'
                          ? 'success'
                          : perm.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {perm.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {perm.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => updatePermissionStatus(perm.id, 'approved')}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 text-xs flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => updatePermissionStatus(perm.id, 'rejected')}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedGatePass(perm)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Gate Pass
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Payroll & Payslips */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monthly Compensation & Indian Hospital Payroll</h3>
              <p className="text-xs text-slate-500">Cycle: October 2026 Disbursement • Indian Rupee (₹)</p>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Basic Pay (₹)</th>
                <th className="py-3 px-4">HRA & Allowances</th>
                <th className="py-3 px-4">PF, PT & TDS</th>
                <th className="py-3 px-4">Net Take-Home (₹)</th>
                <th className="py-3 px-4">Disbursement</th>
                <th className="py-3 px-4 text-right">Print Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payroll.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {pay.staffName}
                    <span className="text-[10px] text-slate-400 font-mono block font-normal">
                      {pay.employeeId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{pay.designation}</td>
                  <td className="py-3 px-4">{formatCurrency(pay.basicSalary)}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">
                    +{formatCurrency(pay.allowances)}
                  </td>
                  <td className="py-3 px-4 text-rose-700 font-semibold">
                    -{formatCurrency(pay.deductions + pay.taxDeduction)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                    {formatCurrency(pay.netSalary)}
                  </td>
                  <td className="py-3 px-4">
                    {pay.status === 'paid' ? (
                      <Badge variant="success" size="sm">
                        Paid ({formatDate(pay.paymentDate || '')})
                      </Badge>
                    ) : (
                      <button
                        onClick={() => markPayrollPaid(pay.id)}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-[10px]"
                      >
                        Process NEFT
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPayslip(pay)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        title="Register Hospital Staff Member / Healthcare Specialist"
        subtitle="Registers staff in HRM master with Indian medical council license and Indian payroll."
        maxWidth="2xl"
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={staffForm.firstName}
                onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={staffForm.lastName}
                onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (+91) *</label>
              <input
                type="tel"
                required
                placeholder="+91 98450 00000"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Role *</label>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="doctor">Consultant Doctor / Specialist</option>
                <option value="nurse">Nursing Staff / Sister</option>
                <option value="hr_manager">HR Manager</option>
                <option value="receptionist">Receptionist / Triage</option>
                <option value="pharmacist">Chief Pharmacist</option>
                <option value="lab_technician">Head Pathologist</option>
                <option value="accountant">Accounts & Billing Officer</option>
                <option value="super_admin">Medical Superintendent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={staffForm.departmentId}
                onChange={(e) => setStaffForm({ ...staffForm, departmentId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Resident, Consultant"
                value={staffForm.designation}
                onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / National Council Registration #</label>
              <input
                type="text"
                placeholder="e.g. MCI-2015-88120 or KMC-9912"
                value={staffForm.licenseNumber}
                onChange={(e) => setStaffForm({ ...staffForm, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Basic Monthly Pay (₹) *</label>
              <input
                type="number"
                required
                value={staffForm.basicSalary}
                onChange={(e) => setStaffForm({ ...staffForm, basicSalary: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Timing *</label>
              <input
                type="text"
                value={staffForm.shiftTiming}
                onChange={(e) => setStaffForm({ ...staffForm, shiftTiming: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm"
            >
              Register Staff Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Staff Leave Application"
        subtitle="Route to HR manager for review, roster balancing, and approval."
        maxWidth="md"
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Staff Member *</label>
            <select
              value={leaveForm.staffId}
              onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="Casual">Casual Leave (CL)</option>
                <option value="Sick">Sick Leave (SL)</option>
                <option value="Privilege">Privilege / Annual (PL)</option>
                <option value="Emergency">Emergency Leave</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Days *</label>
              <input
                type="number"
                min="1"
                required
                value={leaveForm.totalDays}
                onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <DatePicker
                label="Start Date (DD-MM-YYYY)"
                required
                value={leaveForm.startDate}
                onChange={(val) => setLeaveForm({ ...leaveForm, startDate: val })}
              />
            </div>
            <div>
              <DatePicker
                label="End Date (DD-MM-YYYY)"
                required
                value={leaveForm.endDate}
                onChange={(val) => setLeaveForm({ ...leaveForm, endDate: val })}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="Provide reason for absence..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Permission / Gate Pass Modal (NEW!) */}
      <Modal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        title="Apply Staff Duty Permission & Gate Pass"
        subtitle="For Short Leave, Late Arrival, Early Exit, or On-Duty (OD) hospital movement."
        maxWidth="md"
      >
        <form onSubmit={handlePermissionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Staff Member *</label>
            <select
              value={permForm.staffId}
              onChange={(e) => setPermForm({ ...permForm, staffId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.designation} - {s.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Permission Category *</label>
            <select
              value={permForm.permissionType}
              onChange={(e) => setPermForm({ ...permForm, permissionType: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="Mid-Day Short Absence">Mid-Day Short Absence (Max 2-3 hrs)</option>
              <option value="Late Coming">Late Arrival Permission</option>
              <option value="Early Departure">Early Departure Permission</option>
              <option value="Official On-Duty (OD)">Official On-Duty (OD) Visit</option>
              <option value="Personal Emergency">Personal Emergency Duty Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <DatePicker
                label="Date (DD-MM-YYYY)"
                required
                value={permForm.date}
                onChange={(val) => setPermForm({ ...permForm, date: val })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">From Time *</label>
              <input
                type="text"
                placeholder="10:30 AM"
                required
                value={permForm.fromTime}
                onChange={(e) => setPermForm({ ...permForm, fromTime: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">To Time *</label>
              <input
                type="text"
                placeholder="12:30 PM"
                required
                value={permForm.toTime}
                onChange={(e) => setPermForm({ ...permForm, toTime: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Duration (Hours) *</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              value={permForm.durationHours}
              onChange={(e) => setPermForm({ ...permForm, durationHours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Reason for Permission *</label>
            <textarea
              required
              rows={3}
              value={permForm.reason}
              onChange={(e) => setPermForm({ ...permForm, reason: e.target.value })}
              placeholder="State reason (e.g. Bank official visit, IMA meeting, urgent family duty)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPermissionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-sm"
            >
              Generate Permission & Gate Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Hospital Gate Pass / Permission Slip */}
      {selectedGatePass && (
        <Modal
          isOpen={Boolean(selectedGatePass)}
          onClose={() => setSelectedGatePass(null)}
          title="Hospital Security Gate Pass / Permission Slip"
          subtitle={`Pass ID: ${selectedGatePass.gatePassNo} | Date: ${formatDate(selectedGatePass.date)}`}
          maxWidth="md"
        >
          <div className="p-4 bg-white border border-slate-300 rounded-xl space-y-4 text-xs font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                  AAYUSH APEX SUPER-SPECIALITY HOSPITAL
                </h2>
                <p className="text-[10px] text-slate-500">Security Checkpoint & Staff Movement Gate Pass</p>
                <p className="text-[10px] text-slate-400">NABH Accredited • Security Desk Ext: 104</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {selectedGatePass.gatePassNo}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">{formatDate(selectedGatePass.date)}</p>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Staff Name</span>
                <p className="font-bold text-slate-900">{selectedGatePass.staffName}</p>
                <p className="text-[10px] font-mono text-slate-500">{selectedGatePass.employeeId}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Department</span>
                <p className="font-bold text-slate-900">{selectedGatePass.department}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Permission Type</span>
                <p className="font-bold text-amber-800">{selectedGatePass.permissionType}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Permitted Window</span>
                <p className="font-bold text-slate-900">
                  {selectedGatePass.fromTime} - {selectedGatePass.toTime} ({selectedGatePass.durationHours} hrs)
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Approved Reason:</span>
              <p className="text-slate-800 mt-0.5">{selectedGatePass.reason}</p>
            </div>

            {/* Security Verification & Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="border border-dashed border-slate-300 p-2 rounded text-center">
                <p className="text-[10px] text-slate-400">Security Gate Sign & Time</p>
                <div className="h-8 flex items-center justify-center font-mono text-[11px] text-slate-600">
                  [ Out: _____ / In: _____ ]
                </div>
              </div>
              <div className="border border-dashed border-slate-300 p-2 rounded text-center">
                <p className="text-[10px] text-slate-400">Approving Authority (HOD / HR)</p>
                <div className="h-8 flex items-center justify-center font-bold text-emerald-700 text-xs">
                  ✓ {selectedGatePass.approvedBy || 'Approved by HR'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Official Gate Pass
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Printable Indian Payslip Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={Boolean(selectedPayslip)}
          onClose={() => setSelectedPayslip(null)}
          title="Official Hospital Salary Payslip (Indian Format)"
          subtitle={`Pay Period: ${selectedPayslip.monthYear} | Aayush Apex Hospital`}
          maxWidth="2xl"
        >
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-5 text-xs font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  AAYUSH APEX SUPER-SPECIALITY HOSPITAL
                </h2>
                <p className="text-slate-600 text-[11px]">
                  Healthcare Administration & Human Resources Division
                </p>
                <p className="text-slate-400 text-[10px]">
                  PAN: AABCA1234D • TAN: BLRA99102 • PF Establishment: KA/BLR/00912
                </p>
              </div>
              <div className="text-right">
                <Badge variant="success">NEFT Transfer Confirmed</Badge>
                <p className="text-slate-500 text-[11px] mt-1">
                  Credit Date: {formatDate(selectedPayslip.paymentDate || '')}
                </p>
              </div>
            </div>

            {/* Employee Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Employee</span>
                <p className="font-bold text-slate-900">{selectedPayslip.staffName}</p>
                <p className="text-[10px] text-slate-500 font-mono">{selectedPayslip.employeeId}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Designation</span>
                <p className="font-bold text-slate-900">{selectedPayslip.designation}</p>
                <p className="text-[10px] text-slate-500">{selectedPayslip.department}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Pay Period</span>
                <p className="font-bold text-slate-900">{selectedPayslip.monthYear}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Payment Channel</span>
                <p className="font-bold text-slate-900">{selectedPayslip.paymentMethod}</p>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown (Indian Structure: Basic, HRA, DA, PF, PT, TDS) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <p className="font-bold text-emerald-800 border-b border-slate-100 pb-1">
                  Earnings (Gross Inflow)
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Salary:</span>
                  <span className="font-semibold">{formatCurrency(selectedPayslip.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">House Rent Allowance (HRA):</span>
                  <span className="font-semibold">{formatCurrency(selectedPayslip.allowances * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Dearness Allowance (DA) & Medical:</span>
                  <span className="font-semibold">{formatCurrency(selectedPayslip.allowances * 0.4)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-emerald-700">
                  <span>Gross Earnings:</span>
                  <span>{formatCurrency(selectedPayslip.basicSalary + selectedPayslip.allowances)}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <p className="font-bold text-rose-800 border-b border-slate-100 pb-1">
                  Deductions (Statutory Indian)
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-600">Provident Fund (EPF 12%):</span>
                  <span className="font-semibold">{formatCurrency(selectedPayslip.deductions * 0.8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Professional Tax (PT Karnataka):</span>
                  <span className="font-semibold">{formatCurrency(selectedPayslip.deductions * 0.2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Income Tax (TDS u/s 192):</span>
                  <span className="font-semibold">{formatCurrency(selectedPayslip.taxDeduction)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-rose-700">
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(selectedPayslip.deductions + selectedPayslip.taxDeduction)}</span>
                </div>
              </div>
            </div>

            {/* Net Take-Home Salary Bar */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 text-sm">NET TAKE-HOME SALARY:</span>
                <p className="text-[10px] text-emerald-700">Transferred via Corporate NEFT to Salary Bank Account</p>
              </div>
              <span className="text-xl font-extrabold text-emerald-800">
                {formatCurrency(selectedPayslip.netSalary)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-400">
                Authorized Signature: General Manager (HR & Finance)
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Indian Payslip
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Staff Attendance Privilege Modal */}
      {editingPrivilegeStaff && (
        <Modal
          isOpen={Boolean(editingPrivilegeStaff)}
          onClose={() => setEditingPrivilegeStaff(null)}
          title={`Update Attendance Privilege: ${editingPrivilegeStaff.firstName} ${editingPrivilegeStaff.lastName}`}
          subtitle={`Employee: ${editingPrivilegeStaff.employeeId} | ${editingPrivilegeStaff.designation} (${editingPrivilegeStaff.departmentName})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Configure geolocation and premises punch authorization for this staff member. Changes take effect immediately across all biometric and mobile terminals.
            </p>

            <div className="space-y-2.5">
              {/* Option 1: Inside Premises Only */}
              <div
                onClick={() => setSelectedPrivilege('inside_only')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPrivilege === 'inside_only'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Inside Hospital Premises Only (Biometric Gate)
                  </span>
                  {selectedPrivilege === 'inside_only' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Staff can only punch attendance when connected to hospital campus WiFi or biometric gate. Cannot punch from outside premises.
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  Recommended for Nurses, Ward Boys & Lab Techs
                </span>
              </div>

              {/* Option 2: Outside Premises Allowed */}
              <div
                onClick={() => setSelectedPrivilege('outside_only')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPrivilege === 'outside_only'
                    ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Outside Premises Only (Field & Mobile Staff)
                  </span>
                  {selectedPrivilege === 'outside_only' && (
                    <Check className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Designated mobile field health workers, outreach nurses, and emergency ambulance teams.
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                  Field / Mobile Duty
                </span>
              </div>

              {/* Option 3: Both Inside & Outside */}
              <div
                onClick={() => setSelectedPrivilege('both')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPrivilege === 'both'
                    ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Both (Inside & Outside Premises Authorized)
                  </span>
                  {selectedPrivilege === 'both' && (
                    <Check className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Full dual access. Staff can mark attendance on campus or while on emergency calls, remote consults, or visiting consultant rounds.
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded">
                  Superintendent, Visiting Doctors & CMOs
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPrivilegeStaff(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePrivilege}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
              >
                Save Attendance Privilege
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
