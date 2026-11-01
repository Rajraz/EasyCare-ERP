import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Clock,
  Database,
  ChevronDown,
  Sparkles,
  PhoneCall,
  Calendar,
  Building2,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Check,
  LogOut,
  Globe,
  Smartphone,
  Settings,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types/hospital';
import { formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

interface NavbarProps {
  onNavigateEmergency?: () => void;
  onNavigateMasters?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateEmergency, onNavigateMasters }) => {
  const { currentUser, logout } = useAuth();
  const { staff, attendance, clockInStaff, clockOutStaff, hospitalProfile } = useHospital();
  const [userProfileMenuOpen, setUserProfileMenuOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  // Attendance Punch State
  const [punchMode, setPunchMode] = useState<'inside' | 'outside'>('inside');
  const [punchLocationName, setPunchLocationName] = useState('');
  const [punchRemarks, setPunchRemarks] = useState('');
  const [punchResult, setPunchResult] = useState<{ success: boolean; message: string } | null>(null);

  // Find active staff member from latest hospitalContext staff state to ensure dynamic privilege updates
  const activeStaffMember = staff.find((s) => s.id === currentUser.id) || currentUser;
  const privilege = activeStaffMember.attendancePrivilege || 'inside_only';
  const isAttendanceRequired = activeStaffMember.isAttendanceRequired !== false;

  const todayStr = formatDate(new Date().toISOString());
  const userAttendance = attendance.find(
    (a) => a.staffId === activeStaffMember.id && a.date === todayStr
  );
  const isClockedIn = Boolean(userAttendance?.clockIn && !userAttendance?.clockOut);

  // Check if current punchMode is allowed for this staff
  const isModeAllowed =
    isAttendanceRequired &&
    (privilege === 'both' ||
      (punchMode === 'inside' && privilege === 'inside_only') ||
      (punchMode === 'outside' && privilege === 'outside_only'));

  const handlePunchClockIn = () => {
    setPunchResult(null);
    const res = clockInStaff(activeStaffMember.id, punchMode, punchLocationName, punchRemarks);
    setPunchResult(res);
    if (res.success) {
      setTimeout(() => {
        setAttendanceModalOpen(false);
        setPunchResult(null);
      }, 1500);
    }
  };

  const handleClockOut = () => {
    clockOutStaff(activeStaffMember.id);
    setAttendanceModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo - Easy Care only, subtitle removed */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            {hospitalProfile.appName || 'Easy Care'}
          </span>
        </div>

        {/* Center: System Status & Emergency Hotkey */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">{todayStr}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
            <span>Casualty / 108 Emergency: Ext 911</span>
          </div>
        </div>

        {/* Right: Attendance & User Profile */}
        <div className="flex items-center gap-3">
          {/* Biometric & Geolocation Attendance Button */}
          <button
            onClick={() => {
              setPunchResult(null);
              setAttendanceModalOpen(true);
            }}
            title={isClockedIn ? 'Click to Review Duty & Clock Out' : 'Click to Mark Attendance Clock In'}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isClockedIn
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            {isClockedIn ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Duty: Clocked In
              </span>
            ) : (
              'Mark Attendance'
            )}
          </button>

          {/* User Profile Info & Sign Out Menu */}
          <div className="relative pl-2 border-l border-slate-200">
            <button
              onClick={() => setUserProfileMenuOpen(!userProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.firstName[0]}
                {currentUser.lastName[0]}
              </div>
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Account" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">{currentUser.designation}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Popup */}
            {userProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-3 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                    <p className="font-bold text-slate-900 text-xs">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-[11px] text-sky-700 font-medium">@{currentUser.username || 'user'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.email}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Status: Active
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase flex items-center gap-1">
                        <Globe className="w-3 h-3 text-sky-600" />
                        Web ERP
                      </span>
                    </div>
                  </div>

                  {/* Channel Access Overview */}
                  <div className="px-2 py-1.5 text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Web ERP Access:
                      </span>
                      <span className="font-bold text-emerald-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        Mobile App Access:
                      </span>
                      <span className={`font-bold ${currentUser.allowMobileAccess !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {currentUser.allowMobileAccess !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                    {onNavigateMasters && (
                      <button
                        onClick={() => {
                          setUserProfileMenuOpen(false);
                          onNavigateMasters();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-sky-50 hover:text-sky-800 font-semibold transition-colors text-left"
                      >
                        <UserCheck className="w-4 h-4 text-sky-600" />
                        <span>Manage Master Users & Access</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out Workstation</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Standalone Log Out Button */}
          <button
            onClick={logout}
            title="Sign Out Workstation"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden xl:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Attendance Punch & Premises Privilege Modal */}
      {attendanceModalOpen && (
        <Modal
          isOpen={attendanceModalOpen}
          onClose={() => setAttendanceModalOpen(false)}
          title="Hospital Staff Attendance Punch Terminal"
          subtitle={`Staff: ${activeStaffMember.firstName} ${activeStaffMember.lastName} (${activeStaffMember.employeeId}) | Shift: ${activeStaffMember.shiftTiming}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {/* Active Privilege & Attendance Required Badge Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Staff Master Attendance Policy & Privilege
                  </span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {privilege === 'both' ? (
                      <span className="text-sky-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        Inside Hospital & Outside Premises Authorized
                      </span>
                    ) : privilege === 'outside_only' ? (
                      <span className="text-purple-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Outside Premises Only (Field Staff)
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        Inside Hospital Premises Only (Biometric Gate)
                      </span>
                    )}
                  </p>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded bg-slate-200 text-slate-700">
                  {activeStaffMember.departmentName}
                </span>
              </div>

              {/* Attendance Mandatory vs Exempt status */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-500 font-medium">Duty Punch Policy:</span>
                {isAttendanceRequired ? (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Attendance Required (Punch Allowed)
                  </span>
                ) : (
                  <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-slate-500" />
                    Attendance Exempt / Not Required (Duty Punch Disabled)
                  </span>
                )}
              </div>
            </div>

            {/* If currently Clocked In: Show clock-out interface */}
            {isClockedIn ? (
              <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold text-sm">Duty Status: Currently Clocked In</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Punch Time: <strong className="font-bold">{userAttendance?.clockIn}</strong> ({userAttendance?.punchLocationName || 'Hospital Biometric'})
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-xs text-emerald-700">
                    Ready to conclude duty for date {todayStr}?
                  </span>
                  <button
                    onClick={handleClockOut}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    Confirm Clock Out of Duty
                  </button>
                </div>
              </div>
            ) : (
              /* If Clocking In: Show Premises Mode Selection */
              <div className="space-y-3">
                <label className="block font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  Select Duty Attendance Punch Location *
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Mode 1: Inside Hospital Premises */}
                  <div
                    onClick={() => {
                      setPunchMode('inside');
                      setPunchResult(null);
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      punchMode === 'inside'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        Inside Premises
                      </span>
                      {punchMode === 'inside' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Hospital Campus Biometric Terminal, IP WiFi network & On-Site wards.
                    </p>
                  </div>

                  {/* Mode 2: Outside Premises */}
                  <div
                    onClick={() => {
                      setPunchMode('outside');
                      setPunchResult(null);
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      punchMode === 'outside'
                        ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-sky-600" />
                        Outside Premises
                      </span>
                      {punchMode === 'outside' && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Field Emergency trauma call, Tele-consultation, Ambulance, or Home-care OD.
                    </p>
                  </div>
                </div>

                {/* Validation Message: If Attendance Not Required or Privilege Check Fails */}
                {!isModeAllowed && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        {!isAttendanceRequired ? 'Duty Punch Not Required / Not Allowed' : 'Attendance Permission Denied'}
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        {!isAttendanceRequired
                          ? `Your staff profile is set to Attendance Required = NO. Duty punch is not required or allowed for this account. If you need to punch attendance, ask your Administrator or HR to enable Attendance Required in Master Users.`
                          : punchMode === 'outside'
                          ? `Your staff profile is restricted to Inside Premises attendance only. You are not authorized to mark attendance from outside premises. Please ask HR or Administrator to update premises privileges in Master Users.`
                          : `Your staff profile is configured for Outside Premises / Field attendance only.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional punch details */}
                {punchMode === 'outside' && isModeAllowed && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Remote Location / Incident Site *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar Trauma Incident / Off-Campus Clinic"
                      value={punchLocationName}
                      onChange={(e) => setPunchLocationName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Punch Duty Remarks / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Regular morning clinical shift / Emergency standby"
                    value={punchRemarks}
                    onChange={(e) => setPunchRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* Punch Result Toast */}
                {punchResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      punchResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                        : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                    }`}
                  >
                    {punchResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{punchResult.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={!isModeAllowed}
                    onClick={handlePunchClockIn}
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    Confirm Attendance Punch
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </header>
  );
};
