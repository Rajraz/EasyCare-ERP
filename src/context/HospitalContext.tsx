import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Department,
  Staff,
  AttendanceRecord,
  LeaveRequest,
  StaffPermission,
  PayrollRecord,
  Patient,
  Ward,
  Bed,
  Appointment,
  PharmacyItem,
  Prescription,
  PharmacyBill,
  LabTest,
  LabOrder,
  Invoice,
  FinancialTransaction,
  Ambulance,
  OperationTheatreSchedule,
  MasterUser,
  HospitalProfile,
  AttendancePrivilege,
  PurchaseOrder,
  PurchaseOrderStatus,
  GoodsReceiptNote,
  GrnStatus,
  DebitNote,
  DebitNoteStatus,
  BankStatementTransaction,
  BankAccount,
  ProfitAndLossStatement,
  BalanceSheetStatement,
  PurchaseBill,
  PurchaseBillPayment,
  PurchaseBillStatus,
  OpdToken,
  TokenStatus,
  TokenVitals,
} from '../types/hospital';
import {
  Vendor,
  initialVendors,
  initialPurchaseOrders,
  initialGoodsReceiptNotes,
  initialDebitNotes,
  initialPurchaseBills,
  initialBankAccounts,
  initialBankStatement,
  initialDepartments,
  initialStaff,
  initialAttendance,
  initialLeaves,
  initialPermissions,
  initialPayroll,
  initialPatients,
  initialWards,
  initialBeds,
  initialAppointments,
  initialOpdTokens,
  initialPharmacyItems,
  initialPrescriptions,
  initialPharmacyBills,
  initialLabTests,
  initialLabOrders,
  initialInvoices,
  initialTransactions,
  initialAmbulances,
  initialOTSchedule,
  initialMasterUsers,
  initialHospitalProfile,
} from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';

const getTodayDateStr = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const getNowTimeStr = (): string => {
  const d = new Date();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

interface HospitalContextType {
  // Departments Master
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updatedData: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Staff & HRM Master
  staff: Staff[];
  addStaff: (member: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, updatedData: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // Attendance (with Inside / Outside Premises Privileges)
  attendance: AttendanceRecord[];
  clockInStaff: (
    staffId: string,
    punchLocationMode?: 'inside' | 'outside',
    punchLocationName?: string,
    remarks?: string
  ) => { success: boolean; message: string };
  clockOutStaff: (staffId: string) => void;

  // Leaves
  leaves: LeaveRequest[];
  submitLeave: (request: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;

  // Staff Permissions / Gate Pass
  permissions: StaffPermission[];
  applyPermission: (permission: Omit<StaffPermission, 'id' | 'gatePassNo' | 'appliedOn' | 'status'>) => StaffPermission;
  updatePermissionStatus: (id: string, status: 'approved' | 'rejected') => void;

  // Payroll
  payroll: PayrollRecord[];
  markPayrollPaid: (id: string) => void;

  // Patients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'registeredDate'>) => Patient;

  // Wards & Beds Master
  wards: Ward[];
  addWard: (ward: Omit<Ward, 'id'>) => void;
  updateWard: (id: string, updatedData: Partial<Ward>) => void;
  beds: Bed[];
  addBed: (bed: Omit<Bed, 'id'>) => void;
  updateBed: (id: string, updatedData: Partial<Bed>) => void;
  updateBedStatus: (bedId: string, status: Bed['status']) => void;
  admitPatientToBed: (bedId: string, patientId: string, patientName: string) => void;
  dischargePatientFromBed: (bedId: string) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'tokenNumber'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status'], notes?: string) => void;

  // Daily OPD Patient Token System
  opdTokens: OpdToken[];
  inwardOpdToken: (
    tokenData: Omit<OpdToken, 'id' | 'tokenNumber' | 'tokenDisplay' | 'date' | 'time' | 'status' | 'createdAt'>,
    customDate?: string
  ) => OpdToken;
  updateOpdTokenStatus: (tokenId: string, status: TokenStatus, notes?: string) => OpdToken;
  updateOpdTokenVitals: (tokenId: string, vitals: TokenVitals) => OpdToken;
  transferOpdToken: (
    tokenId: string,
    targetDoctorId: string,
    targetDoctorName: string,
    targetDepartment: string,
    targetRoom?: string
  ) => OpdToken;

  // Pharmacy Master & Dispensing
  pharmacyItems: PharmacyItem[];
  addPharmacyItem: (item: Omit<PharmacyItem, 'id'>) => void;
  updatePharmacyItem: (id: string, updatedData: Partial<PharmacyItem>) => void;
  updatePharmacyStock: (itemId: string, changeQuantity: number) => void;
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void;
  dispensePrescription: (
    prescriptionId: string,
    paymentMode?: 'UPI / QR Code' | 'Cash' | 'Debit/Credit Card',
    billId?: string
  ) => void;
  pharmacyBills: PharmacyBill[];
  createPharmacyBill: (bill: Omit<PharmacyBill, 'id' | 'billNumber' | 'date' | 'time'>) => PharmacyBill;

  // Laboratory Master & LIS
  labTests: LabTest[];
  addLabTest: (test: Omit<LabTest, 'id'>) => void;
  updateLabTest: (id: string, updatedData: Partial<LabTest>) => void;
  labOrders: LabOrder[];
  addLabOrder: (order: Omit<LabOrder, 'id' | 'orderNumber' | 'orderDate' | 'status'>) => void;
  updateLabOrderResult: (orderId: string, resultValue: string, resultNotes: string, isAbnormal: boolean) => void;

  // Billing
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  payInvoice: (invoiceId: string, amount: number, paymentMethod: string) => void;

  // Finance
  transactions: FinancialTransaction[];
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;

  // Procurement & Accounts Payable (PO, GRN, Debit Note)
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => PurchaseOrder;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus) => void;
  goodsReceiptNotes: GoodsReceiptNote[];
  addGoodsReceiptNote: (
    grn: Omit<GoodsReceiptNote, 'id' | 'createdAt'>,
    options?: { autoDebitNote?: boolean; autoInwardBill?: boolean }
  ) => { grn: GoodsReceiptNote; debitNote?: DebitNote; purchaseBill?: PurchaseBill };
  debitNotes: DebitNote[];
  addDebitNote: (dn: Omit<DebitNote, 'id' | 'createdAt'>) => DebitNote;
  updateDebitNoteStatus: (id: string, status: DebitNoteStatus) => void;

  // Inward Purchase Bills & Vendor Payables
  purchaseBills: PurchaseBill[];
  addPurchaseBill: (bill: Omit<PurchaseBill, 'id' | 'payments' | 'createdAt'>) => PurchaseBill;
  createPurchaseBillFromGrn: (grnId: string, customData?: Partial<PurchaseBill>) => PurchaseBill;
  recordBillPayment: (
    billId: string,
    payment: {
      amount: number;
      paymentMode: PurchaseBillPayment['paymentMode'];
      bankAccountId?: string;
      referenceNo: string;
      notes?: string;
    }
  ) => { updatedBill: PurchaseBill; payment: PurchaseBillPayment };
  updatePurchaseBill: (billId: string, updatedData: Partial<PurchaseBill>) => PurchaseBill;
  clearPurchaseBill: (billId: string, clearedBy?: string, notes?: string) => PurchaseBill;

  // Treasury & Bank Reconciliation (BRS)
  bankAccounts: BankAccount[];
  bankStatements: BankStatementTransaction[];
  uploadBankStatement: (transactions: Omit<BankStatementTransaction, 'id'>[]) => void;
  loadDemoBankStatement: () => void;
  reconcileBankTransaction: (bankTxId: string, matchedLedgerRef?: string) => void;
  unreconcileBankTransaction: (bankTxId: string) => void;
  runSmartAutoReconciliation: () => { matchedCount: number; differenceAmount: number };

  // Financial Reporting (P&L and Balance Sheet)
  getProfitAndLossStatement: (period?: string) => ProfitAndLossStatement;
  getBalanceSheetStatement: (asOfDate?: string) => BalanceSheetStatement;

  // Operations
  ambulances: Ambulance[];
  updateAmbulanceStatus: (id: string, status: Ambulance['status'], location?: string) => void;
  otSchedules: OperationTheatreSchedule[];

  // Master Users & Channel Access Control
  masterUsers: MasterUser[];
  addMasterUser: (user: Omit<MasterUser, 'id' | 'createdAt'>) => void;
  updateMasterUser: (id: string, updatedData: Partial<MasterUser>) => void;
  deleteMasterUser: (id: string) => void;
  toggleUserStatus: (id: string) => { updatedUser: MasterUser; newStatus: 'active' | 'inactive' };
  toggleWebAccess: (id: string) => { updatedUser: MasterUser; newAccess: boolean };
  toggleMobileAccess: (id: string) => { updatedUser: MasterUser; newAccess: boolean };
  toggleAttendanceRequired: (id: string) => { updatedUser: MasterUser; newRequired: boolean };
  updatePremisesPrivilege: (id: string, privilege: AttendancePrivilege) => void;

  // Hospital Profile & App Branding
  hospitalProfile: HospitalProfile;
  updateHospitalProfile: (profile: Partial<HospitalProfile>) => void;

  // Stats
  isLiveSupabase: boolean;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

function getStorage<T>(key: string, initial: T): T {
  try {
    const saved = localStorage.getItem(`medpulse_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
  }
  return initial;
}

function setStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`medpulse_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(() => getStorage('departments', initialDepartments));
  const [staff, setStaff] = useState<Staff[]>(() => getStorage('staff', initialStaff));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStorage('attendance', initialAttendance));
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => getStorage('leaves', initialLeaves));
  const [permissions, setPermissions] = useState<StaffPermission[]>(() => getStorage('permissions', initialPermissions));
  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => getStorage('payroll', initialPayroll));
  const [patients, setPatients] = useState<Patient[]>(() => getStorage('patients', initialPatients));
  const [wards, setWards] = useState<Ward[]>(() => getStorage('wards', initialWards));
  const [beds, setBeds] = useState<Bed[]>(() => getStorage('beds', initialBeds));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStorage('appointments', initialAppointments));
  const [opdTokens, setOpdTokens] = useState<OpdToken[]>(() => getStorage('opdTokens', initialOpdTokens));
  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>(() => getStorage('pharmacyItems', initialPharmacyItems));
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => getStorage('prescriptions', initialPrescriptions));
  const [pharmacyBills, setPharmacyBills] = useState<PharmacyBill[]>(() => getStorage('pharmacyBills', initialPharmacyBills));
  const [labTests, setLabTests] = useState<LabTest[]>(() => getStorage('labTests', initialLabTests));
  const [labOrders, setLabOrders] = useState<LabOrder[]>(() => getStorage('labOrders', initialLabOrders));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStorage('invoices', initialInvoices));
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => getStorage('transactions', initialTransactions));
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStorage('purchaseOrders', initialPurchaseOrders));
  const [goodsReceiptNotes, setGoodsReceiptNotes] = useState<GoodsReceiptNote[]>(() => getStorage('goodsReceiptNotes', initialGoodsReceiptNotes));
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>(() => getStorage('debitNotes', initialDebitNotes));
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>(() => getStorage('purchaseBills', initialPurchaseBills));
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => getStorage('bankAccounts', initialBankAccounts));
  const [bankStatements, setBankStatements] = useState<BankStatementTransaction[]>(() => getStorage('bankStatements', initialBankStatement));
  const [ambulances, setAmbulances] = useState<Ambulance[]>(() => getStorage('ambulances', initialAmbulances));
  const [otSchedules] = useState<OperationTheatreSchedule[]>(() => getStorage('otSchedules', initialOTSchedule));
  const [masterUsers, setMasterUsers] = useState<MasterUser[]>(() => getStorage('masterUsers', initialMasterUsers));
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(() => {
    const loaded = getStorage('hospitalProfile', initialHospitalProfile);
    if (loaded && (loaded.appName === 'Hosp-ERP' || !loaded.appName)) {
      return {
        ...loaded,
        appName: 'Easy Care',
        hospitalName: 'Easy Care Super-Speciality Hospital',
        shortName: 'Easy Care',
      };
    }
    return loaded;
  });

  // Sync to localStorage
  useEffect(() => setStorage('departments', departments), [departments]);
  useEffect(() => setStorage('staff', staff), [staff]);
  useEffect(() => setStorage('attendance', attendance), [attendance]);
  useEffect(() => setStorage('leaves', leaves), [leaves]);
  useEffect(() => setStorage('permissions', permissions), [permissions]);
  useEffect(() => setStorage('payroll', payroll), [payroll]);
  useEffect(() => setStorage('patients', patients), [patients]);
  useEffect(() => setStorage('wards', wards), [wards]);
  useEffect(() => setStorage('beds', beds), [beds]);
  useEffect(() => setStorage('appointments', appointments), [appointments]);
  useEffect(() => setStorage('opdTokens', opdTokens), [opdTokens]);
  useEffect(() => setStorage('pharmacyItems', pharmacyItems), [pharmacyItems]);
  useEffect(() => setStorage('prescriptions', prescriptions), [prescriptions]);
  useEffect(() => setStorage('pharmacyBills', pharmacyBills), [pharmacyBills]);
  useEffect(() => setStorage('labTests', labTests), [labTests]);
  useEffect(() => setStorage('labOrders', labOrders), [labOrders]);
  useEffect(() => setStorage('invoices', invoices), [invoices]);
  useEffect(() => setStorage('transactions', transactions), [transactions]);
  useEffect(() => setStorage('purchaseOrders', purchaseOrders), [purchaseOrders]);
  useEffect(() => setStorage('goodsReceiptNotes', goodsReceiptNotes), [goodsReceiptNotes]);
  useEffect(() => setStorage('debitNotes', debitNotes), [debitNotes]);
  useEffect(() => setStorage('purchaseBills', purchaseBills), [purchaseBills]);
  useEffect(() => setStorage('bankAccounts', bankAccounts), [bankAccounts]);
  useEffect(() => setStorage('bankStatements', bankStatements), [bankStatements]);
  useEffect(() => setStorage('ambulances', ambulances), [ambulances]);
  useEffect(() => setStorage('masterUsers', masterUsers), [masterUsers]);
  useEffect(() => {
    setStorage('hospitalProfile', hospitalProfile);
    if (typeof document !== 'undefined') {
      document.title = `${hospitalProfile.appName} | ${hospitalProfile.hospitalName}`;
    }
  }, [hospitalProfile]);

  // Master Users & Channel Access CRUD
  const addMasterUser = (user: Omit<MasterUser, 'id' | 'createdAt'>) => {
    const newUser: MasterUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: getTodayDateStr(),
    };
    setMasterUsers((prev) => [newUser, ...prev]);
  };

  const updateMasterUser = (id: string, updatedData: Partial<MasterUser>) => {
    setMasterUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updatedData };
          // If linked with a staffId, keep staff in sync (status, attendance required, premises)
          if (updated.staffId) {
            setStaff((sPrev) =>
              sPrev.map((s) => {
                if (s.id === updated.staffId) {
                  return {
                    ...s,
                    ...(updatedData.status !== undefined ? { isActive: updated.status === 'active' } : {}),
                    ...(updatedData.isAttendanceRequired !== undefined ? { isAttendanceRequired: updated.isAttendanceRequired } : {}),
                    ...(updatedData.attendancePrivilege !== undefined ? { attendancePrivilege: updated.attendancePrivilege } : {}),
                  };
                }
                return s;
              })
            );
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteMasterUser = (id: string) => {
    setMasterUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    let target = masterUsers.find((u) => u.id === id);
    let newStatus: 'active' | 'inactive' = 'active';
    if (target) {
      newStatus = target.status === 'active' ? 'inactive' : 'active';
      updateMasterUser(id, { status: newStatus });
      target = { ...target, status: newStatus };
    }
    return { updatedUser: target!, newStatus };
  };

  const toggleWebAccess = (id: string) => {
    let target = masterUsers.find((u) => u.id === id);
    let newAccess = true;
    if (target) {
      newAccess = !target.allowWebAccess;
      updateMasterUser(id, { allowWebAccess: newAccess });
      target = { ...target, allowWebAccess: newAccess };
    }
    return { updatedUser: target!, newAccess };
  };

  const toggleMobileAccess = (id: string) => {
    let target = masterUsers.find((u) => u.id === id);
    let newAccess = true;
    if (target) {
      newAccess = !target.allowMobileAccess;
      updateMasterUser(id, { allowMobileAccess: newAccess });
      target = { ...target, allowMobileAccess: newAccess };
    }
    return { updatedUser: target!, newAccess };
  };

  const toggleAttendanceRequired = (id: string) => {
    let target = masterUsers.find((u) => u.id === id);
    let newRequired = true;
    if (target) {
      newRequired = !target.isAttendanceRequired;
      updateMasterUser(id, { isAttendanceRequired: newRequired });
      target = { ...target, isAttendanceRequired: newRequired };
    }
    return { updatedUser: target!, newRequired };
  };

  const updatePremisesPrivilege = (id: string, privilege: AttendancePrivilege) => {
    updateMasterUser(id, { attendancePrivilege: privilege });
  };

  const updateHospitalProfile = (profile: Partial<HospitalProfile>) => {
    setHospitalProfile((prev) => ({
      ...prev,
      ...profile,
    }));
  };

  // Master: Staff CRUD
  const addStaff = (member: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...member,
      id: `staff-${Date.now()}`,
      attendancePrivilege: member.attendancePrivilege || 'inside_only',
    };
    setStaff((prev) => [newStaff, ...prev]);
  };

  const updateStaff = (id: string, updatedData: Partial<Staff>) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updatedData };
          // If status changed, sync linked master user
          if (updatedData.isActive !== undefined) {
            setMasterUsers((uPrev) =>
              uPrev.map((u) =>
                u.staffId === id ? { ...u, status: updatedData.isActive ? 'active' : 'inactive' } : u
              )
            );
          }
          return updated;
        }
        return s;
      })
    );
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  // Master: Departments CRUD
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  const updateDepartment = (id: string, updatedData: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedData } : d))
    );
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  // Master: Wards CRUD
  const addWard = (wardData: Omit<Ward, 'id'>) => {
    const newWard: Ward = {
      ...wardData,
      id: `ward-${Date.now()}`,
    };
    setWards((prev) => [...prev, newWard]);
  };

  const updateWard = (id: string, updatedData: Partial<Ward>) => {
    setWards((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updatedData } : w))
    );
  };

  // Master: Beds CRUD
  const addBed = (bedData: Omit<Bed, 'id'>) => {
    const newBed: Bed = {
      ...bedData,
      id: `bed-${Date.now()}`,
    };
    setBeds((prev) => [...prev, newBed]);
  };

  const updateBed = (id: string, updatedData: Partial<Bed>) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b))
    );
  };

  // Master: Pharmacy Item Update
  const updatePharmacyItem = (id: string, updatedData: Partial<PharmacyItem>) => {
    setPharmacyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
  };

  // Master: Lab Tests CRUD
  const addLabTest = (testData: Omit<LabTest, 'id'>) => {
    const newTest: LabTest = {
      ...testData,
      id: `test-${Date.now()}`,
    };
    setLabTests((prev) => [...prev, newTest]);
  };

  const updateLabTest = (id: string, updatedData: Partial<LabTest>) => {
    setLabTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );
  };

  // HRM: Clock In with Privilege Verification (Inside Premises vs Outside)
  const clockInStaff = (
    staffId: string,
    punchLocationMode: 'inside' | 'outside' = 'inside',
    punchLocationName?: string,
    remarks?: string
  ): { success: boolean; message: string } => {
    const timeStr = getNowTimeStr();
    const today = getTodayDateStr();
    const member = staff.find((s) => s.id === staffId);

    if (!member) {
      return { success: false, message: 'Staff profile not found.' };
    }

    // Attendance Required Policy verification (If required only allow)
    if (member.isAttendanceRequired === false) {
      return {
        success: false,
        message: `Attendance Denied: Attendance tracking is set to NOT REQUIRED (Exempt) for ${member.firstName} ${member.lastName}. Only staff with Attendance Required enabled are permitted to mark attendance.`,
      };
    }

    // Privilege verification (Inside Premises vs Outside)
    const privilege = member.attendancePrivilege || 'inside_only';

    if (punchLocationMode === 'outside' && privilege === 'inside_only') {
      return {
        success: false,
        message: `Attendance Denied: ${member.firstName} ${member.lastName} (${member.designation}) is restricted to Inside Premises attendance only. To mark attendance from outside premises, HR or Admin must update privileges in Staff Master.`,
      };
    }

    if (punchLocationMode === 'inside' && privilege === 'outside_only') {
      return {
        success: false,
        message: `Attendance Denied: ${member.firstName} ${member.lastName} is authorized for Outside / Field Attendance only.`,
      };
    }

    const locDisplayName =
      punchLocationName ||
      (punchLocationMode === 'outside'
        ? 'Field / Remote Location (Off-Campus Authorized)'
        : 'Main Hospital Premises (Biometric Gateway Gate 1)');

    setAttendance((prev) => {
      const exists = prev.find((a) => a.staffId === staffId && a.date === today);
      if (exists) {
        return prev.map((a) =>
          a.id === exists.id
            ? {
                ...a,
                clockIn: timeStr,
                status: 'present',
                punchLocationMode,
                punchLocationName: locDisplayName,
                punchRemarks: remarks,
              }
            : a
        );
      }

      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        staffId,
        staffName: `${member.firstName} ${member.lastName}`,
        employeeId: member.employeeId,
        department: member.departmentName || 'General',
        date: today,
        clockIn: timeStr,
        clockOut: null,
        status: 'present',
        hoursWorked: 0,
        overtimeHours: 0,
        biometricVerified: punchLocationMode === 'inside',
        punchLocationMode,
        punchLocationName: locDisplayName,
        punchRemarks: remarks,
      };
      return [newRec, ...prev];
    });

    return {
      success: true,
      message: `Punched in successfully as [${punchLocationMode === 'outside' ? 'Outside Premises' : 'Inside Hospital'}] at ${timeStr}.`,
    };
  };

  // HRM: Clock Out
  const clockOutStaff = (staffId: string) => {
    const timeStr = getNowTimeStr();
    const today = getTodayDateStr();

    setAttendance((prev) =>
      prev.map((a) => {
        if (a.staffId === staffId && a.date === today) {
          return {
            ...a,
            clockOut: timeStr,
            hoursWorked: a.hoursWorked > 0 ? a.hoursWorked : 8.0,
          };
        }
        return a;
      })
    );
  };

  // HRM: Submit Leave
  const submitLeave = (req: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `leave-${Date.now()}`,
      status: 'pending',
      appliedOn: getTodayDateStr(),
    };
    setLeaves((prev) => [newLeave, ...prev]);
  };

  // HRM: Update Leave Status
  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected') => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  // HRM: Apply Permission / Gate Pass
  const applyPermission = (permData: Omit<StaffPermission, 'id' | 'gatePassNo' | 'appliedOn' | 'status'>): StaffPermission => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newPerm: StaffPermission = {
      ...permData,
      id: `perm-${Date.now()}`,
      gatePassNo: `GP-${year}-${rand}`,
      status: 'pending',
      appliedOn: getTodayDateStr(),
    };
    setPermissions((prev) => [newPerm, ...prev]);
    return newPerm;
  };

  // HRM: Update Permission Status
  const updatePermissionStatus = (id: string, status: 'approved' | 'rejected') => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              approvedBy: status === 'approved' ? 'Amit Verma (HR Manager)' : undefined,
            }
          : p
      )
    );
  };

  // HRM: Mark Payroll Paid
  const markPayrollPaid = (id: string) => {
    const today = getTodayDateStr();
    setPayroll((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'paid', paymentDate: today } : p
      )
    );
  };

  // Patients: Add Patient
  const addPatient = (patientData: Omit<Patient, 'id' | 'registeredDate'>): Patient => {
    const newPat: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      registeredDate: getTodayDateStr(),
    };
    setPatients((prev) => [newPat, ...prev]);
    return newPat;
  };

  // Wards & Beds: Update status
  const updateBedStatus = (bedId: string, status: Bed['status']) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status } : b))
    );
  };

  // Wards & Beds: Admit Patient
  const admitPatientToBed = (bedId: string, patientId: string, patientName: string) => {
    const today = getTodayDateStr();
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'occupied',
              currentPatientId: patientId,
              currentPatientName: patientName,
              admissionDate: today,
            }
          : b
      )
    );
  };

  // Wards & Beds: Discharge Patient
  const dischargePatientFromBed = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'cleaning',
              currentPatientId: undefined,
              currentPatientName: undefined,
              admissionDate: undefined,
            }
          : b
      )
    );
  };

  // Appointments: Add
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'tokenNumber'>) => {
    const nextToken = appointments.length + 101;
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      tokenNumber: nextToken,
    };
    setAppointments((prev) => [newApt, ...prev]);
  };

  // Appointments: Update Status & Doctor Notes
  const updateAppointmentStatus = (id: string, status: Appointment['status'], notes?: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              ...(notes ? { doctorNotes: notes } : {}),
            }
          : a
      )
    );
  };

  // =========================================================
  // Daily OPD Patient Token System
  // =========================================================

  const inwardOpdToken = (
    tokenData: Omit<OpdToken, 'id' | 'tokenNumber' | 'tokenDisplay' | 'date' | 'time' | 'status' | 'createdAt'>,
    customDate?: string
  ): OpdToken => {
    const today = customDate || getTodayDateStr();
    const timeStr = getNowTimeStr();

    // Calculate today's next sequential token number
    const todayTokens = opdTokens.filter((t) => t.date === today);
    const maxTokenNum = todayTokens.reduce((max, t) => Math.max(max, t.tokenNumber), 0);
    const nextTokenNumber = maxTokenNum + 1;
    const tokenDisplay = `TK-${String(nextTokenNumber).padStart(3, '0')}`;

    const newToken: OpdToken = {
      ...tokenData,
      id: `tok-${Date.now()}`,
      tokenNumber: nextTokenNumber,
      tokenDisplay,
      date: today,
      time: timeStr,
      status: 'waiting',
      createdAt: today,
    };

    setOpdTokens((prev) => [newToken, ...prev]);

    // Mirror to appointments for Doctor consultation integration
    const newAppointment: Appointment = {
      id: `apt-tok-${newToken.id}`,
      tokenNumber: nextTokenNumber,
      patientId: newToken.patientId,
      patientName: newToken.patientName,
      patientMrn: newToken.patientMrn,
      doctorId: newToken.doctorId,
      doctorName: newToken.doctorName,
      department: newToken.department,
      appointmentDate: today,
      timeSlot: timeStr,
      status: 'checked_in',
      reason: newToken.reason,
      vitals: newToken.vitals
        ? {
            bp: newToken.vitals.bp || '120/80',
            pulse: newToken.vitals.pulse || 72,
            temp: newToken.vitals.temp || '98.6 F',
            spo2: newToken.vitals.spo2 || 99,
            weight: newToken.vitals.weight || '65 kg',
          }
        : undefined,
    };
    setAppointments((prev) => [newAppointment, ...prev]);

    return newToken;
  };

  const updateOpdTokenStatus = (
    tokenId: string,
    status: TokenStatus,
    notes?: string
  ): OpdToken => {
    let updatedToken: OpdToken | undefined;
    const timeStr = getNowTimeStr();

    setOpdTokens((prev) =>
      prev.map((tok) => {
        if (tok.id !== tokenId) return tok;
        const updated: OpdToken = {
          ...tok,
          status,
          ...(notes ? { doctorNotes: notes } : {}),
          ...(status === 'in_consultation' && !tok.calledAt ? { calledAt: timeStr } : {}),
          ...(status === 'completed' && !tok.completedAt ? { completedAt: timeStr } : {}),
        };
        updatedToken = updated;
        return updated;
      })
    );

    // Sync corresponding appointment in appointments list
    setAppointments((prev) =>
      prev.map((apt) => {
        if (
          apt.id === `apt-tok-${tokenId}` ||
          (updatedToken && apt.patientId === updatedToken.patientId && apt.tokenNumber === updatedToken.tokenNumber)
        ) {
          const aptStatus: Appointment['status'] =
            status === 'in_consultation'
              ? 'in_consultation'
              : status === 'completed'
              ? 'completed'
              : status === 'waiting'
              ? 'checked_in'
              : 'cancelled';
          return {
            ...apt,
            status: aptStatus,
            ...(notes ? { doctorNotes: notes } : {}),
          };
        }
        return apt;
      })
    );

    if (!updatedToken) {
      const found = opdTokens.find((t) => t.id === tokenId);
      if (!found) throw new Error(`Token ${tokenId} not found`);
      return { ...found, status };
    }

    return updatedToken;
  };

  const updateOpdTokenVitals = (tokenId: string, vitals: TokenVitals): OpdToken => {
    let updatedToken: OpdToken | undefined;
    setOpdTokens((prev) =>
      prev.map((tok) => {
        if (tok.id !== tokenId) return tok;
        const updated: OpdToken = {
          ...tok,
          vitals: { ...tok.vitals, ...vitals },
        };
        updatedToken = updated;
        return updated;
      })
    );

    if (!updatedToken) {
      const found = opdTokens.find((t) => t.id === tokenId);
      if (!found) throw new Error(`Token ${tokenId} not found`);
      return found;
    }

    return updatedToken;
  };

  const transferOpdToken = (
    tokenId: string,
    targetDoctorId: string,
    targetDoctorName: string,
    targetDepartment: string,
    targetRoom?: string
  ): OpdToken => {
    let updatedToken: OpdToken | undefined;
    setOpdTokens((prev) =>
      prev.map((tok) => {
        if (tok.id !== tokenId) return tok;
        const updated: OpdToken = {
          ...tok,
          doctorId: targetDoctorId,
          doctorName: targetDoctorName,
          department: targetDepartment,
          roomNumber: targetRoom || tok.roomNumber,
        };
        updatedToken = updated;
        return updated;
      })
    );

    if (!updatedToken) {
      const found = opdTokens.find((t) => t.id === tokenId);
      if (!found) throw new Error(`Token ${tokenId} not found`);
      return found;
    }

    return updatedToken;
  };

  // Pharmacy: Add Item
  const addPharmacyItem = (item: Omit<PharmacyItem, 'id'>) => {
    const newItem: PharmacyItem = {
      ...item,
      id: `med-${Date.now()}`,
    };
    setPharmacyItems((prev) => [newItem, ...prev]);
  };

  // Pharmacy: Update Stock
  const updatePharmacyStock = (itemId: string, changeQuantity: number) => {
    setPharmacyItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, stockQuantity: Math.max(0, item.stockQuantity + changeQuantity) }
          : item
      )
    );
  };

  // Pharmacy: Add Prescription
  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    const newRx: Prescription = {
      ...prescription,
      id: `rx-${Date.now()}`,
    };
    setPrescriptions((prev) => [newRx, ...prev]);
  };

  // Pharmacy: Dispense Prescription
  const dispensePrescription = (
    prescriptionId: string,
    paymentMode?: 'UPI / QR Code' | 'Cash' | 'Debit/Credit Card',
    billId?: string
  ) => {
    const today = getTodayDateStr();
    const rx = prescriptions.find((r) => r.id === prescriptionId);
    if (!rx) return;

    // Deduct stock for each item only if not already deducted by createPharmacyBill
    if (!billId) {
      rx.items.forEach((item) => {
        updatePharmacyStock(item.pharmacyItemId, -item.quantity);
      });
    }

    setPrescriptions((prev) =>
      prev.map((r) =>
        r.id === prescriptionId
          ? {
              ...r,
              isDispensed: true,
              dispensedDate: today,
              paymentMode: paymentMode || r.paymentMode || 'Cash',
              paymentStatus: 'paid',
              billId: billId || r.billId,
            }
          : r
      )
    );

    // Auto record pharmacy revenue transaction if not already created by createPharmacyBill
    if (!billId && rx.totalAmount && rx.totalAmount > 0) {
      addTransaction({
        ref: `TX-PHARM-${Date.now().toString().slice(-4)}`,
        date: today,
        type: 'income',
        category: 'Pharmacy Sales',
        amount: rx.totalAmount,
        description: `Prescription fulfillment for ${rx.patientName} (${rx.patientMrn})`,
        paymentChannel: paymentMode || 'Pharmacy Counter POS / UPI',
      });
    }
  };

  // Pharmacy: Individual Medicine Bill Creation
  const createPharmacyBill = (billData: Omit<PharmacyBill, 'id' | 'billNumber' | 'date' | 'time'>): PharmacyBill => {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const billNumber = `PHARM-${year}-${rand}`;
    const today = getTodayDateStr();
    const time = getNowTimeStr();

    const newBill: PharmacyBill = {
      ...billData,
      id: `pb-${Date.now()}`,
      billNumber,
      date: today,
      time,
    };

    // Deduct stock for all items
    billData.items.forEach((item) => {
      updatePharmacyStock(item.pharmacyItemId, -item.quantity);
    });

    // Record revenue in ERP Ledger
    addTransaction({
      ref: `TX-MED-${billNumber.slice(-4)}`,
      date: today,
      type: 'income',
      category: 'Pharmacy Sales',
      amount: billData.netTotal,
      description: `Retail Medicine GST Bill ${billNumber} for ${billData.patientName}`,
      paymentChannel: billData.paymentMode,
    });

    setPharmacyBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  // Lab: Add Order
  const addLabOrder = (orderData: Omit<LabOrder, 'id' | 'orderNumber' | 'orderDate' | 'status'>) => {
    const rand = Math.floor(10000 + Math.random() * 90000);
    const orderDate = `${getTodayDateStr()} ${getNowTimeStr()}`;
    const newOrd: LabOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `LAB-${rand}`,
      orderDate,
      status: 'pending_sample',
    };
    setLabOrders((prev) => [newOrd, ...prev]);
  };

  // Lab: Update Result
  const updateLabOrderResult = (
    orderId: string,
    resultValue: string,
    resultNotes: string,
    isAbnormal: boolean
  ) => {
    const completedAt = `${getTodayDateStr()} ${getNowTimeStr()}`;
    setLabOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'verified',
              resultValue,
              resultNotes,
              isAbnormal,
              completedAt,
              technicianName: 'Dr. Sneha Kulkarni (Head Pathologist)',
            }
          : o
      )
    );
  };

  // Billing: Add Invoice
  const addInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${year}-${rand}`,
    };
    setInvoices((prev) => [newInv, ...prev]);
    return newInv;
  };

  // Billing: Pay Invoice
  const payInvoice = (invoiceId: string, amount: number, paymentMethod: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          const newBal = Math.max(0, inv.total - newPaid);
          const newStatus = newBal <= 0 ? 'paid' : 'partially_paid';

          // Record financial transaction
          addTransaction({
            ref: `TX-BILL-${Date.now().toString().slice(-4)}`,
            date: getTodayDateStr(),
            type: 'income',
            category: 'Patient Billing',
            amount,
            description: `Payment for ${inv.invoiceNumber} (${inv.patientName})`,
            paymentChannel: paymentMethod,
          });

          return {
            ...inv,
            paidAmount: newPaid,
            balanceDue: newBal,
            status: newStatus,
            paymentMethod,
          };
        }
        return inv;
      })
    );
  };

  // Finance: Add Transaction
  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // =========================================================
  // Procurement & Accounts Payable (PO, GRN, Debit Note)
  // =========================================================

  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'createdAt'>): PurchaseOrder => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      createdAt: formatDate(new Date().toISOString()),
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    return newPO;
  };

  const updatePurchaseOrderStatus = (id: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const addGoodsReceiptNote = (
    grnData: Omit<GoodsReceiptNote, 'id' | 'createdAt'>,
    options?: { autoDebitNote?: boolean; autoInwardBill?: boolean }
  ): { grn: GoodsReceiptNote; debitNote?: DebitNote; purchaseBill?: PurchaseBill } => {
    let createdDebitNote: DebitNote | undefined;
    let createdBill: PurchaseBill | undefined;

    // 1. If rejected quantities exist and autoDebitNote is requested, generate Debit Note
    if (options?.autoDebitNote && grnData.totalRejectedAmount > 0) {
      const rejectedItems = grnData.items
        .filter((i) => i.rejectedQty > 0)
        .map((i) => ({
          id: `dni-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          itemName: i.itemName,
          rejectedQty: i.rejectedQty,
          unitPrice: i.unitPrice,
          reason: i.rejectionReason || 'Rejected during GRN Quality Inspection',
          taxPercent: 12,
          totalAmount: Math.round(i.rejectedAmount * 1.12),
        }));

      const dnSubtotal = grnData.totalRejectedAmount;
      const dnTotal = rejectedItems.reduce((acc, r) => acc + r.totalAmount, 0);

      createdDebitNote = {
        id: `dn-${Date.now()}`,
        debitNoteNumber: `DN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        vendorName: grnData.vendorName,
        grnId: `grn-${Date.now()}`,
        grnNumber: grnData.grnNumber,
        vendorInvoiceRef: grnData.invoiceOrChallanNo,
        issueDate: grnData.receiptDate,
        reason: `Goods rejection on inward GRN ${grnData.grnNumber}`,
        items: rejectedItems,
        subtotal: dnSubtotal,
        taxAmount: dnTotal - dnSubtotal,
        totalAmount: dnTotal,
        status: 'adjusted',
        adjustedAgainstBill: `Deducted from vendor invoice ${grnData.invoiceOrChallanNo}`,
        createdBy: grnData.receivedBy,
        createdAt: formatDate(new Date().toISOString()),
      };

      setDebitNotes((prev) => [createdDebitNote!, ...prev]);

      // Record Debit Note reversal in transactions (Vendor credit)
      addTransaction({
        ref: `TX-REV-DN-${createdDebitNote.debitNoteNumber}`,
        date: createdDebitNote.issueDate,
        type: 'income',
        category: 'Purchase Returns / Debit Note',
        amount: createdDebitNote.totalAmount,
        description: `Debit Note ${createdDebitNote.debitNoteNumber} issued to ${createdDebitNote.vendorName} (${createdDebitNote.reason})`,
        paymentChannel: 'Vendor Ledger Credit',
      });
    }

    // 2. Save GRN
    const newGrn: GoodsReceiptNote = {
      ...grnData,
      id: `grn-${Date.now()}`,
      hasDebitNoteGenerated: !!createdDebitNote,
      debitNoteId: createdDebitNote?.id,
      debitNoteNumber: createdDebitNote?.debitNoteNumber,
      createdAt: formatDate(new Date().toISOString()),
    };

    // If autoInwardBill is requested and accepted amount > 0, generate and clear Inward Purchase Bill
    if (options?.autoInwardBill && grnData.totalAcceptedAmount > 0) {
      const subtotal = grnData.totalAcceptedAmount;
      const taxAmount = Math.round(subtotal * 0.12);
      const grossAmount = subtotal + taxAmount;
      const debitNoteDeduction = createdDebitNote ? createdDebitNote.totalAmount : 0;
      const netPayable = Math.max(0, grossAmount - debitNoteDeduction);

      const generatedBillNumber = `BILL-${new Date().getFullYear()}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      createdBill = {
        id: `bill-${Date.now()}`,
        billNumber: generatedBillNumber,
        vendorInvoiceNo:
          grnData.invoiceOrChallanNo ||
          `INV-VEND-${Math.floor(1000 + Math.random() * 9000)}`,
        vendorName: grnData.vendorName,
        grnId: newGrn.id,
        grnNumber: newGrn.grnNumber,
        poId: newGrn.poId,
        poNumber: newGrn.poNumber,
        billDate: newGrn.receiptDate,
        dueDate: formatDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        ),
        department: 'Central Hospital Pharmacy',
        subtotal,
        taxAmount,
        grossAmount,
        debitNoteDeduction,
        linkedDebitNoteNo: createdDebitNote?.debitNoteNumber,
        netPayable,
        paidAmount: 0,
        balanceDue: netPayable,
        status: 'unpaid',
        clearanceStatus: 'cleared',
        clearedBy: grnData.inspectedBy || 'Store In-Charge & Clearance Desk',
        clearedAt: grnData.receiptDate,
        payments: [],
        notes: `Inward Purchase Bill auto-cleared upon GRN ${newGrn.grnNumber} completion. Net Payable: ₹${netPayable.toLocaleString()}.`,
        createdAt: formatDate(new Date().toISOString()),
      };

      newGrn.hasBillGenerated = true;
      newGrn.purchaseBillId = createdBill.id;
      newGrn.purchaseBillNumber = createdBill.billNumber;

      setPurchaseBills((prev) => [createdBill!, ...prev]);
    }

    setGoodsReceiptNotes((prev) => [newGrn, ...prev]);

    // 3. Update Pharmacy / Medical Stock for accepted items
    if (grnData.stockUpdated) {
      grnData.items.forEach((item) => {
        if (item.acceptedQty > 0) {
          setPharmacyItems((prevItems) => {
            const existing = prevItems.find(
              (p) => p.name.toLowerCase() === item.itemName.toLowerCase()
            );
            if (existing) {
              return prevItems.map((p) =>
                p.id === existing.id
                  ? {
                      ...p,
                      stockQuantity: p.stockQuantity + item.acceptedQty,
                      batchNumber: item.batchNumber || p.batchNumber,
                      expiryDate: item.expiryDate || p.expiryDate,
                    }
                  : p
              );
            }
            return prevItems;
          });
        }
      });
    }

    // 4. Auto-record Vendor Payable liability in Transactions
    if (grnData.totalAcceptedAmount > 0) {
      addTransaction({
        ref: `TX-EXP-GRN-${grnData.grnNumber}`,
        date: grnData.receiptDate,
        type: 'expense',
        category: 'Medical & Pharmacy Procurement (GRN)',
        amount: grnData.totalAcceptedAmount,
        description: `Inward GRN ${grnData.grnNumber} from ${grnData.vendorName} (Ref: ${grnData.invoiceOrChallanNo})`,
        paymentChannel: 'Accounts Payable Ledger',
      });
    }

    // 5. Update PO status if linked
    if (grnData.poId) {
      updatePurchaseOrderStatus(
        grnData.poId,
        grnData.status === 'inspected_accepted' ? 'completed' : 'partially_received'
      );
    }

    return { grn: newGrn, debitNote: createdDebitNote, purchaseBill: createdBill };
  };

  const addDebitNote = (dnData: Omit<DebitNote, 'id' | 'createdAt'>): DebitNote => {
    const newDN: DebitNote = {
      ...dnData,
      id: `dn-${Date.now()}`,
      createdAt: formatDate(new Date().toISOString()),
    };
    setDebitNotes((prev) => [newDN, ...prev]);

    // Record credit adjustment in transactions
    addTransaction({
      ref: `TX-REV-DN-${newDN.debitNoteNumber}`,
      date: newDN.issueDate,
      type: 'income',
      category: 'Purchase Returns / Debit Note',
      amount: newDN.totalAmount,
      description: `Debit Note ${newDN.debitNoteNumber} issued to ${newDN.vendorName} (${newDN.reason})`,
      paymentChannel: 'Vendor Ledger Credit',
    });

    return newDN;
  };

  const updateDebitNoteStatus = (id: string, status: DebitNoteStatus) => {
    setDebitNotes((prev) =>
      prev.map((dn) => (dn.id === id ? { ...dn, status } : dn))
    );
  };

  // =========================================================
  // Inward Purchase Bills & Vendor Payables
  // =========================================================

  const addPurchaseBill = (
    billData: Omit<PurchaseBill, 'id' | 'payments' | 'createdAt'>
  ): PurchaseBill => {
    const newBill: PurchaseBill = {
      ...billData,
      id: `bill-${Date.now()}`,
      payments: [],
      createdAt: formatDate(new Date().toISOString()),
    };
    setPurchaseBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  const createPurchaseBillFromGrn = (
    grnId: string,
    customData?: Partial<PurchaseBill>
  ): PurchaseBill => {
    const grn = goodsReceiptNotes.find((g) => g.id === grnId);
    if (!grn) throw new Error('GRN not found');

    const subtotal = grn.totalAcceptedAmount;
    const taxAmount = Math.round(subtotal * 0.12);
    const grossAmount = subtotal + taxAmount;

    // Check if an associated Debit Note exists for this GRN
    const associatedDn = debitNotes.find(
      (d) => d.grnId === grnId || (d.grnNumber && d.grnNumber === grn.grnNumber)
    );
    const debitNoteDeduction = associatedDn ? associatedDn.totalAmount : 0;
    const netPayable = Math.max(0, grossAmount - debitNoteDeduction);

    const generatedBillNumber = `BILL-${new Date().getFullYear()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newBill: PurchaseBill = {
      id: `bill-${Date.now()}`,
      billNumber: generatedBillNumber,
      vendorInvoiceNo:
        grn.invoiceOrChallanNo ||
        `INV-VEND-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName: grn.vendorName,
      grnId: grn.id,
      grnNumber: grn.grnNumber,
      poId: grn.poId,
      poNumber: grn.poNumber,
      billDate: grn.receiptDate,
      dueDate: formatDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
      department: 'Central Hospital Pharmacy',
      subtotal,
      taxAmount,
      grossAmount,
      debitNoteDeduction,
      linkedDebitNoteNo: associatedDn?.debitNoteNumber,
      freightOrAdjustments: 0,
      netPayable,
      paidAmount: 0,
      balanceDue: netPayable,
      status: 'unpaid',
      clearanceStatus: 'pending_clearance',
      payments: [],
      notes: `Inward Purchase Bill created from GRN ${grn.grnNumber}. Gross: ₹${grossAmount.toLocaleString()}${
        debitNoteDeduction > 0
          ? `, less Debit Note ${associatedDn?.debitNoteNumber}: -₹${debitNoteDeduction.toLocaleString()}`
          : ''
      }. Net Payable: ₹${netPayable.toLocaleString()}.`,
      createdAt: formatDate(new Date().toISOString()),
      ...customData,
    };

    setPurchaseBills((prev) => [newBill, ...prev]);

    // Mark GRN as having its inward bill generated
    setGoodsReceiptNotes((prev) =>
      prev.map((g) =>
        g.id === grnId
          ? {
              ...g,
              hasBillGenerated: true,
              purchaseBillId: newBill.id,
              purchaseBillNumber: newBill.billNumber,
            }
          : g
      )
    );

    return newBill;
  };

  const recordBillPayment = (
    billId: string,
    paymentData: {
      amount: number;
      paymentMode: PurchaseBillPayment['paymentMode'];
      bankAccountId?: string;
      referenceNo: string;
      notes?: string;
    }
  ): { updatedBill: PurchaseBill; payment: PurchaseBillPayment } => {
    const targetBill = purchaseBills.find((b) => b.id === billId);
    if (!targetBill) throw new Error('Purchase Bill not found');

    const paymentAmount = Math.min(paymentData.amount, targetBill.balanceDue);
    const newPaidAmount = targetBill.paidAmount + paymentAmount;
    const newBalanceDue = Math.max(0, targetBill.netPayable - newPaidAmount);
    const newStatus: PurchaseBillStatus =
      newBalanceDue === 0 ? 'paid' : 'partially_paid';

    const newPayment: PurchaseBillPayment = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-${new Date().getFullYear()}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      paymentDate: formatDate(new Date().toISOString()),
      amount: paymentAmount,
      paymentMode: paymentData.paymentMode,
      bankAccountId: paymentData.bankAccountId,
      bankAccountName:
        bankAccounts.find((b) => b.id === paymentData.bankAccountId)
          ?.accountName || 'HDFC Operational Treasury Escrow',
      referenceNo: paymentData.referenceNo,
      notes:
        paymentData.notes ||
        `Settlement against purchase bill ${targetBill.billNumber}`,
      paidBy: 'Finance & Accounts Officer',
      createdAt: formatDate(new Date().toISOString()),
    };

    const updatedBill: PurchaseBill = {
      ...targetBill,
      paidAmount: newPaidAmount,
      balanceDue: newBalanceDue,
      status: newStatus,
      payments: [newPayment, ...targetBill.payments],
    };

    setPurchaseBills((prev) =>
      prev.map((b) => (b.id === billId ? updatedBill : b))
    );

    // 1. Post Outward Payment to Ledger (Cash Book / General Ledger)
    addTransaction({
      ref: `TX-EXP-PAY-${newPayment.paymentNumber}`,
      date: newPayment.paymentDate,
      type: 'expense',
      category: 'Vendor Accounts Payable Settlement',
      amount: paymentAmount,
      description: `Payment against Bill ${targetBill.billNumber} to ${targetBill.vendorName} (Ref: ${newPayment.referenceNo})`,
      paymentChannel: newPayment.paymentMode,
    });

    // 2. Deduct from selected Bank Account balance
    setBankAccounts((prev) =>
      prev.map((acc, idx) =>
        idx === 0 || acc.id === paymentData.bankAccountId
          ? {
              ...acc,
              currentStatementBalance: Math.max(
                0,
                acc.currentStatementBalance - paymentAmount
              ),
              erpBookBalance: Math.max(0, acc.erpBookBalance - paymentAmount),
              lastReconciledDate: formatDate(new Date().toISOString()),
            }
          : acc
      )
    );

    // 3. Add to Bank Statement as matched withdrawal for BRS
    const newBankStmtTx: BankStatementTransaction = {
      id: `stmt-pay-${Date.now()}`,
      date: newPayment.paymentDate,
      valueDate: newPayment.paymentDate,
      description: `Direct Vendor Settlement - ${targetBill.vendorName} (Bill ${targetBill.billNumber})`,
      referenceNo: newPayment.referenceNo,
      withdrawal: paymentAmount,
      deposit: 0,
      balance: Math.max(
        0,
        (bankAccounts[0]?.currentStatementBalance || 4800000) - paymentAmount
      ),
      isMatched: true,
      matchedTransactionId: `tx-pay-${Date.now()}`,
      matchedLedgerRef: `TX-EXP-PAY-${newPayment.paymentNumber}`,
      matchedDate: newPayment.paymentDate,
      reconciliationStatus: 'reconciled',
    };
    setBankStatements((prev) => [newBankStmtTx, ...prev]);

    return { updatedBill, payment: newPayment };
  };

  const updatePurchaseBill = (
    billId: string,
    updatedData: Partial<PurchaseBill>
  ): PurchaseBill => {
    let resultBill: PurchaseBill | undefined;

    setPurchaseBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;

        const subtotal =
          updatedData.subtotal !== undefined ? Number(updatedData.subtotal) : bill.subtotal;
        const taxAmount =
          updatedData.taxAmount !== undefined ? Number(updatedData.taxAmount) : bill.taxAmount;
        const grossAmount =
          updatedData.grossAmount !== undefined
            ? Number(updatedData.grossAmount)
            : subtotal + taxAmount;
        const freightOrAdjustments =
          updatedData.freightOrAdjustments !== undefined
            ? Number(updatedData.freightOrAdjustments)
            : (bill.freightOrAdjustments || 0);
        const debitNoteDeduction =
          updatedData.debitNoteDeduction !== undefined
            ? Number(updatedData.debitNoteDeduction)
            : (bill.debitNoteDeduction || 0);

        const netPayable =
          updatedData.netPayable !== undefined
            ? Number(updatedData.netPayable)
            : Math.max(0, grossAmount + freightOrAdjustments - debitNoteDeduction);

        const paidAmount =
          updatedData.paidAmount !== undefined
            ? Number(updatedData.paidAmount)
            : bill.paidAmount;

        const balanceDue =
          updatedData.balanceDue !== undefined
            ? Number(updatedData.balanceDue)
            : Math.max(0, netPayable - paidAmount);

        const status: PurchaseBillStatus =
          updatedData.status ||
          (balanceDue === 0
            ? 'paid'
            : paidAmount > 0
            ? 'partially_paid'
            : 'unpaid');

        const updated: PurchaseBill = {
          ...bill,
          ...updatedData,
          subtotal,
          taxAmount,
          grossAmount,
          freightOrAdjustments,
          debitNoteDeduction,
          netPayable,
          paidAmount,
          balanceDue,
          status,
        };

        resultBill = updated;
        return updated;
      })
    );

    if (!resultBill) {
      const found = purchaseBills.find((b) => b.id === billId);
      if (!found) throw new Error(`Purchase Bill ${billId} not found`);
      return { ...found, ...updatedData };
    }

    return resultBill;
  };

  const clearPurchaseBill = (
    billId: string,
    clearedBy = 'Store In-Charge & Clearance Desk',
    notes?: string
  ): PurchaseBill => {
    return updatePurchaseBill(billId, {
      clearanceStatus: 'cleared',
      clearedBy,
      clearedAt: formatDate(new Date().toISOString()),
      clearanceNotes:
        notes || 'Verified with 3-way match (PO vs GRN vs Inward Bill) and cleared for payment disbursement',
    });
  };

  // =========================================================
  // Treasury & Bank Reconciliation (BRS)
  // =========================================================

  const uploadBankStatement = (newTxs: Omit<BankStatementTransaction, 'id'>[]) => {
    const formatted: BankStatementTransaction[] = newTxs.map((t, idx) => ({
      ...t,
      id: `stmt-${Date.now()}-${idx}`,
    }));
    setBankStatements((prev) => [...formatted, ...prev]);
  };

  const loadDemoBankStatement = () => {
    setBankStatements(initialBankStatement);
  };

  const reconcileBankTransaction = (bankTxId: string, matchedLedgerRef?: string) => {
    setBankStatements((prev) =>
      prev.map((t) =>
        t.id === bankTxId
          ? {
              ...t,
              isMatched: true,
              reconciliationStatus: 'reconciled',
              matchedLedgerRef: matchedLedgerRef || t.referenceNo,
              matchedDate: formatDate(new Date().toISOString()),
            }
          : t
      )
    );
  };

  const unreconcileBankTransaction = (bankTxId: string) => {
    setBankStatements((prev) =>
      prev.map((t) =>
        t.id === bankTxId
          ? {
              ...t,
              isMatched: false,
              reconciliationStatus: 'unmatched',
              matchedLedgerRef: undefined,
              matchedDate: undefined,
            }
          : t
      )
    );
  };

  const runSmartAutoReconciliation = () => {
    let matchedCount = 0;
    setBankStatements((prevStatements) => {
      return prevStatements.map((stmt) => {
        if (stmt.isMatched) return stmt;
        const targetAmount = stmt.deposit > 0 ? stmt.deposit : stmt.withdrawal;
        const targetType = stmt.deposit > 0 ? 'income' : 'expense';
        const found = transactions.find(
          (tx) => tx.type === targetType && Math.abs(tx.amount - targetAmount) < 1
        );
        if (found) {
          matchedCount++;
          return {
            ...stmt,
            isMatched: true,
            reconciliationStatus: 'reconciled',
            matchedTransactionId: found.id,
            matchedLedgerRef: found.ref,
            matchedDate: formatDate(new Date().toISOString()),
          };
        }
        return stmt;
      });
    });

    const primaryBank = bankAccounts[0] || initialBankAccounts[0];
    return { matchedCount, differenceAmount: primaryBank.unreconciledDifference };
  };

  // =========================================================
  // Financial Reporting: P&L and Balance Sheet Generators
  // =========================================================

  const getProfitAndLossStatement = (period: string = 'Current Financial Period (FY 2026-27)'): ProfitAndLossStatement => {
    // 1. Operating Revenues
    const opdConsultation = appointments.length * 750 || 185000;
    const ipdBedAndNursing = invoices
      .filter((i) => i.status === 'paid' || i.status === 'partially_paid')
      .reduce((sum, i) => sum + (i.paidAmount || i.total), 0) || 1284000;
    const pharmacySales = pharmacyBills.reduce((sum, b) => sum + b.netTotal, 0) || 312500;
    const labDiagnostics = labOrders.reduce((sum, o) => sum + o.price, 0) || 184500;
    const otProcedures = otSchedules.length * 35000 || 140000;
    const totalRevenue = opdConsultation + ipdBedAndNursing + pharmacySales + labDiagnostics + otProcedures;

    // 2. Cost of Goods Sold (COGS)
    const grnInwardReceipts = goodsReceiptNotes.reduce((sum, g) => sum + g.totalAcceptedAmount, 0) || 452500;
    const debitNoteDeductions = debitNotes.reduce((sum, d) => sum + d.totalAmount, 0) || 38080;
    const directPurchases = 120000;
    const totalCogs = Math.max(0, directPurchases + grnInwardReceipts - debitNoteDeductions);

    // 3. Gross Profit
    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPercent = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0;

    // 4. Operating Overhead Expenses (OPEX)
    const staffPayroll = payroll.reduce((sum, p) => sum + p.netSalary, 0) || 845000;
    const hospitalUtilities = 142000;
    const medicalEquipmentMaintenance = 65000;
    const adminAndFacilityOverhead = 58000;
    const totalExpenses = staffPayroll + hospitalUtilities + medicalEquipmentMaintenance + adminAndFacilityOverhead;

    // 5. Operating Income & Net Surplus
    const operatingIncome = grossProfit - totalExpenses;
    const depreciation = 75000;
    const taxProvision = operatingIncome > 0 ? Math.round(operatingIncome * 0.15) : 0;
    const netProfit = operatingIncome - depreciation - taxProvision;
    const netMarginPercent = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(2)) : 0;

    return {
      period,
      revenues: {
        opdConsultation,
        ipdBedAndNursing,
        pharmacySales,
        labDiagnostics,
        otProcedures,
        totalRevenue,
      },
      cogs: {
        directPurchases,
        grnInwardReceipts,
        debitNoteDeductions,
        totalCogs,
      },
      grossProfit,
      grossMarginPercent,
      expenses: {
        staffPayroll,
        hospitalUtilities,
        medicalEquipmentMaintenance,
        adminAndFacilityOverhead,
        totalExpenses,
      },
      operatingIncome,
      depreciation,
      taxProvision,
      netProfit,
      netMarginPercent,
    };
  };

  const getBalanceSheetStatement = (asOfDate: string = '31-10-2026'): BalanceSheetStatement => {
    const pnl = getProfitAndLossStatement();

    // 1. Assets
    const cashAndBank = bankAccounts.reduce((sum, b) => sum + b.currentStatementBalance, 0) || 6742450;
    const accountsReceivable = invoices
      .filter((i) => i.balanceDue > 0)
      .reduce((sum, i) => sum + i.balanceDue, 0) || 485000;
    const inventoryValuation = pharmacyItems.reduce((sum, p) => sum + p.stockQuantity * p.unitPrice, 0) || 892000;
    const otherCurrentAssets = 150000;
    const totalCurrentAssets = cashAndBank + accountsReceivable + inventoryValuation + otherCurrentAssets;

    const biomedicalEquipment = 42500000;
    const hospitalInfrastructure = 85000000;
    const furnitureAndFixtures = 3500000;
    const lessAccumulatedDepreciation = 12500000;
    const totalNonCurrentAssets =
      biomedicalEquipment + hospitalInfrastructure + furnitureAndFixtures - lessAccumulatedDepreciation;

    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

    // 2. Liabilities
    const totalBillsBalanceDue = purchaseBills.reduce((sum, b) => sum + b.balanceDue, 0);
    const accountsPayable = totalBillsBalanceDue > 0 ? totalBillsBalanceDue : 275860;
    const accruedStaffPayroll = 185000;
    const statutoryTaxPayable = 95000;
    const totalCurrentLiabilities = accountsPayable + accruedStaffPayroll + statutoryTaxPayable;

    const healthcareTermLoans = 28000000;
    const totalLongTermLiabilities = healthcareTermLoans;
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    // 3. Equity & Capital Fund (Balanced Double-Entry)
    const currentPeriodSurplus = pnl.netProfit;
    const hospitalTrustCapital = 75000000;
    const retainedEarnings = totalAssets - totalLiabilities - hospitalTrustCapital - currentPeriodSurplus;
    const totalEquity = hospitalTrustCapital + retainedEarnings + currentPeriodSurplus;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const variance = totalAssets - totalLiabilitiesAndEquity;

    return {
      asOfDate,
      assets: {
        currentAssets: {
          cashAndBank,
          accountsReceivable,
          inventoryValuation,
          otherCurrentAssets,
          totalCurrentAssets,
        },
        nonCurrentAssets: {
          biomedicalEquipment,
          hospitalInfrastructure,
          furnitureAndFixtures,
          lessAccumulatedDepreciation,
          totalNonCurrentAssets,
        },
        totalAssets,
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable,
          accruedStaffPayroll,
          statutoryTaxPayable,
          totalCurrentLiabilities,
        },
        longTermLiabilities: {
          healthcareTermLoans,
          totalLongTermLiabilities,
        },
        totalLiabilities,
      },
      equity: {
        hospitalTrustCapital,
        retainedEarnings,
        currentPeriodSurplus,
        totalEquity,
      },
      totalLiabilitiesAndEquity,
      isBalanced: Math.abs(variance) < 1,
      variance,
    };
  };

  // Operations: Ambulance
  const updateAmbulanceStatus = (id: string, status: Ambulance['status'], location?: string) => {
    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              ...(location ? { location } : {}),
            }
          : a
      )
    );
  };

  return (
    <HospitalContext.Provider
      value={{
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
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
        patients,
        addPatient,
        wards,
        addWard,
        updateWard,
        beds,
        addBed,
        updateBed,
        updateBedStatus,
        admitPatientToBed,
        dischargePatientFromBed,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        opdTokens,
        inwardOpdToken,
        updateOpdTokenStatus,
        updateOpdTokenVitals,
        transferOpdToken,
        pharmacyItems,
        addPharmacyItem,
        updatePharmacyItem,
        updatePharmacyStock,
        prescriptions,
        addPrescription,
        dispensePrescription,
        pharmacyBills,
        createPharmacyBill,
        labTests,
        addLabTest,
        updateLabTest,
        labOrders,
        addLabOrder,
        updateLabOrderResult,
        invoices,
        addInvoice,
        payInvoice,
        transactions,
        addTransaction,
        vendors,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrderStatus,
        goodsReceiptNotes,
        addGoodsReceiptNote,
        debitNotes,
        addDebitNote,
        updateDebitNoteStatus,
        purchaseBills,
        addPurchaseBill,
        createPurchaseBillFromGrn,
        recordBillPayment,
        updatePurchaseBill,
        clearPurchaseBill,
        bankAccounts,
        bankStatements,
        uploadBankStatement,
        loadDemoBankStatement,
        reconcileBankTransaction,
        unreconcileBankTransaction,
        runSmartAutoReconciliation,
        getProfitAndLossStatement,
        getBalanceSheetStatement,
        ambulances,
        updateAmbulanceStatus,
        otSchedules,
        masterUsers,
        addMasterUser,
        updateMasterUser,
        deleteMasterUser,
        toggleUserStatus,
        toggleWebAccess,
        toggleMobileAccess,
        toggleAttendanceRequired,
        updatePremisesPrivilege,
        hospitalProfile,
        updateHospitalProfile,
        isLiveSupabase: isSupabaseConfigured,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
