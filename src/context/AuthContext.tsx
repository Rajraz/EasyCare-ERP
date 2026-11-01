import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserRole, Staff, MasterUser } from '../types/hospital';
import { useHospital } from './HospitalContext';

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: Staff & Partial<MasterUser>;
  currentMasterUser: MasterUser | null;
  currentRole: UserRole;
  login: (usernameOrEmail: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  allStaff: Staff[];
  hasAccess: (module: string) => boolean;
  sessionError: string | null;
  clearSessionError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'patients', 'opd_tokens', 'wards', 'hrm', 'doctor', 'pharmacy', 'laboratory', 'billing', 'finance', 'operations', 'masters'],
  doctor: ['dashboard', 'patients', 'opd_tokens', 'wards', 'doctor', 'laboratory', 'pharmacy', 'masters'],
  nurse: ['dashboard', 'patients', 'opd_tokens', 'wards', 'doctor', 'laboratory'],
  hr_manager: ['dashboard', 'hrm', 'masters'],
  receptionist: ['dashboard', 'patients', 'opd_tokens', 'wards', 'billing'],
  pharmacist: ['dashboard', 'pharmacy', 'billing', 'masters'],
  lab_technician: ['dashboard', 'laboratory', 'masters'],
  accountant: ['dashboard', 'billing', 'finance', 'hrm', 'masters'],
};

const AUTH_STORAGE_KEY = 'hosperp_auth_session_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { masterUsers, staff, updateMasterUser } = useHospital();

  const [sessionUserId, setSessionUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [sessionError, setSessionError] = useState<string | null>(null);

  // Find active MasterUser from live HospitalContext masterUsers
  const currentMasterUser = useMemo(() => {
    if (!sessionUserId) return null;
    return masterUsers.find((u) => u.id === sessionUserId) || null;
  }, [sessionUserId, masterUsers]);

  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');

  // Verify and enforce live active status and web access
  useEffect(() => {
    if (sessionUserId && currentMasterUser) {
      if (currentMasterUser.status === 'inactive') {
        setSessionError(`Session Ended: Your account (${currentMasterUser.username}) has been marked INACTIVE by administrator. Login is disabled.`);
        setSessionUserId(null);
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (e) {
          console.error(e);
        }
      } else if (!currentMasterUser.allowWebAccess) {
        setSessionError(`Session Ended: Web Access has been revoked for account (${currentMasterUser.username}). Only Mobile App access is permitted.`);
        setSessionUserId(null);
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Keep role in sync with master user unless user switches it explicitly
        setCurrentRole(currentMasterUser.role);
      }
    } else if (sessionUserId && !currentMasterUser) {
      // User was deleted
      setSessionUserId(null);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    }
  }, [sessionUserId, currentMasterUser]);

  // Construct staff-compatible currentUser
  const currentUser: Staff & Partial<MasterUser> = useMemo(() => {
    if (currentMasterUser) {
      const linkedStaff = staff.find(
        (s) => s.id === currentMasterUser.staffId || s.employeeId === currentMasterUser.employeeId
      );

      return {
        id: linkedStaff?.id || currentMasterUser.id,
        employeeId: linkedStaff?.employeeId || currentMasterUser.employeeId || 'USR-001',
        firstName: currentMasterUser.firstName,
        lastName: currentMasterUser.lastName,
        email: currentMasterUser.email,
        phone: currentMasterUser.phone,
        role: currentRole,
        departmentId: currentMasterUser.departmentId || linkedStaff?.departmentId || 'dept-7',
        departmentName: currentMasterUser.department || linkedStaff?.departmentName || 'Administration',
        designation: currentMasterUser.designation,
        licenseNumber: linkedStaff?.licenseNumber || 'SYS-AUTH',
        specialization: currentMasterUser.specialization || linkedStaff?.specialization || 'Clinical Operations',
        joiningDate: linkedStaff?.joiningDate || currentMasterUser.createdAt,
        basicSalary: linkedStaff?.basicSalary || 85000,
        shiftTiming: linkedStaff?.shiftTiming || '09:00 AM - 05:00 PM',
        isActive: currentMasterUser.status === 'active',
        isAttendanceRequired: currentMasterUser.isAttendanceRequired !== false,
        attendancePrivilege: currentMasterUser.attendancePrivilege || linkedStaff?.attendancePrivilege || 'both',
        username: currentMasterUser.username,
        allowWebAccess: currentMasterUser.allowWebAccess,
        allowMobileAccess: currentMasterUser.allowMobileAccess,
        status: currentMasterUser.status,
      };
    }

    // Fallback when not logged in
    const firstStaff = staff[0] || {
      id: 'staff-fallback',
      employeeId: 'EMP-001',
      firstName: 'Dr. Arvind',
      lastName: 'Swaminathan',
      email: 'admin@hosperp.in',
      phone: '+91 98450 11001',
      role: 'super_admin' as UserRole,
      departmentId: 'dept-7',
      departmentName: 'Administration',
      designation: 'Medical Superintendent',
      licenseNumber: 'MCI-1998',
      specialization: 'Administration',
      joiningDate: '01-01-2020',
      basicSalary: 280000,
      shiftTiming: '09:00 AM - 05:00 PM',
      isActive: true,
      attendancePrivilege: 'both',
    };

    return {
      ...firstStaff,
      role: currentRole,
      username: 'admin',
      allowWebAccess: true,
      allowMobileAccess: true,
      status: 'active',
    };
  }, [currentMasterUser, staff, currentRole]);

  const login = (usernameOrEmail: string, password: string): { success: boolean; message?: string } => {
    setSessionError(null);
    const trimmedInput = usernameOrEmail.trim().toLowerCase();

    // Find master user by username or email (case-insensitive)
    const foundUser = masterUsers.find(
      (u) =>
        u.username.toLowerCase() === trimmedInput ||
        u.email.toLowerCase() === trimmedInput
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'Invalid username/email or password. Please verify your credentials.',
      };
    }

    if (foundUser.password !== password) {
      return {
        success: false,
        message: 'Incorrect password entered. Please verify or reset your password.',
      };
    }

    // 1. Enforce User Status validation ("user status update to login also")
    if (foundUser.status === 'inactive') {
      return {
        success: false,
        message: `Login Denied: Account status is INACTIVE / SUSPENDED for user '${foundUser.username}'. Please contact the Hospital IT Administrator or HR Department to activate your account.`,
      };
    }

    // 2. Enforce Web Access validation ("allow acces for web and mobile")
    if (!foundUser.allowWebAccess) {
      return {
        success: false,
        message: `Login Denied: Web Portal Access is not enabled for '${foundUser.username}'. This user account is currently restricted to Mobile Application access only.`,
      };
    }

    // Login successful
    setSessionUserId(foundUser.id);
    setCurrentRole(foundUser.role);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, foundUser.id);
    } catch (e) {
      console.error(e);
    }

    // Update lastLogin timestamp
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    updateMasterUser(foundUser.id, { lastLogin: `Today, ${nowTimeStr}` });

    return { success: true };
  };

  const logout = () => {
    setSessionUserId(null);
    setSessionError(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const hasAccess = (module: string): boolean => {
    const allowed = ROLE_PERMISSIONS[currentRole] || [];
    return allowed.includes(module);
  };

  const clearSessionError = () => {
    setSessionError(null);
  };

  const isAuthenticated = Boolean(sessionUserId && currentMasterUser && currentMasterUser.status === 'active' && currentMasterUser.allowWebAccess);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        currentMasterUser,
        currentRole,
        login,
        logout,
        switchRole,
        allStaff: staff,
        hasAccess,
        sessionError,
        clearSessionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
