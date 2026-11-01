export type UserRole =
  | 'super_admin'
  | 'doctor'
  | 'nurse'
  | 'hr_manager'
  | 'receptionist'
  | 'pharmacist'
  | 'lab_technician'
  | 'accountant';

export type UserStatus = 'active' | 'inactive';

export interface MasterUser {
  id: string;
  staffId?: string;
  employeeId?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  department: string;
  departmentId?: string;
  designation: string;
  specialization?: string;
  allowWebAccess: boolean;
  allowMobileAccess: boolean;
  status: UserStatus;
  isAttendanceRequired: boolean; // Attendance required or not
  attendancePrivilege: AttendancePrivilege; // 'inside_only' | 'outside_only' | 'both'
  lastLogin?: string;
  createdAt: string;
  notes?: string;
}

export interface HospitalProfile {
  appName: string;
  hospitalName: string;
  tagline: string;
  shortName: string;
  accreditation: string;
  emergencyContact: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  drugLicenseNumber?: string;
  gstin?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  floorNumber: number;
  bedCapacity: number;
}

export type AttendancePrivilege = 'inside_only' | 'outside_only' | 'both';

export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  departmentId: string;
  departmentName?: string;
  designation: string;
  licenseNumber: string;
  specialization: string;
  joiningDate: string;
  basicSalary: number;
  shiftTiming: string;
  isActive: boolean;
  avatarUrl?: string;
  isAttendanceRequired?: boolean;
  attendancePrivilege?: AttendancePrivilege; // 'inside_only' | 'outside_only' | 'both'
  allowedPunchLocations?: string[];
  allowWebAccess?: boolean;
  allowMobileAccess?: boolean;
  username?: string;
  password?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  department: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  hoursWorked: number;
  overtimeHours: number;
  biometricVerified: boolean;
  punchLocationMode?: 'inside' | 'outside';
  punchLocationName?: string;
  punchRemarks?: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'Casual' | 'Sick' | 'Privilege' | 'Emergency';

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export type PermissionType =
  | 'Late Coming'
  | 'Early Departure'
  | 'Mid-Day Short Absence'
  | 'Official On-Duty (OD)'
  | 'Personal Emergency';

export type PermissionStatus = 'pending' | 'approved' | 'rejected';

export interface StaffPermission {
  id: string;
  gatePassNo: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  department: string;
  permissionType: PermissionType;
  date: string; // DD-MM-YYYY
  fromTime: string;
  toTime: string;
  durationHours: number;
  reason: string;
  status: PermissionStatus;
  appliedOn: string;
  approvedBy?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  department: string;
  monthYear: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxDeduction: number;
  netSalary: number;
  status: 'paid' | 'unpaid' | 'processing';
  paymentDate?: string;
  paymentMethod: string;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  registeredDate: string;
}

export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';
export type WardType = 'ICU' | 'General' | 'Semi-Private' | 'Emergency';

export interface Ward {
  id: string;
  name: string;
  wardType: WardType;
  floor: string;
  chargePerDay: number;
  totalBeds: number;
  occupiedBeds: number;
}

export interface Bed {
  id: string;
  wardId: string;
  wardName: string;
  bedNumber: string;
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  admissionDate?: string;
  assignedNurse?: string;
  dailyRate: number;
}

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_consultation' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  reason: string;
  vitals?: {
    bp: string;
    pulse: number;
    temp: string;
    spo2: number;
    weight: string;
  };
  doctorNotes?: string;
}

// ==========================================
// Daily OPD Patient Token System
// ==========================================

export type TokenStatus = 'waiting' | 'in_consultation' | 'completed' | 'skipped' | 'cancelled';
export type TokenPriority = 'normal' | 'emergency' | 'senior_citizen' | 'follow_up';

export interface TokenVitals {
  bp?: string;
  pulse?: number;
  temp?: string;
  spo2?: number;
  weight?: string;
}

export interface OpdToken {
  id: string;
  tokenNumber: number; // Daily sequence number (1, 2, 3...)
  tokenDisplay: string; // e.g. "TK-001"
  date: string; // DD-MM-YYYY (Daily basis)
  time: string; // e.g. "09:30 AM"
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  doctorId: string;
  doctorName: string;
  department: string;
  roomNumber?: string; // e.g. "OPD Chamber 101"
  status: TokenStatus;
  priority: TokenPriority;
  reason: string;
  vitals?: TokenVitals;
  doctorNotes?: string;
  calledAt?: string;
  completedAt?: string;
  inwardedBy: string;
  createdAt: string;
}

export interface PharmacyItem {
  id: string;
  itemCode: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  batchNumber: string;
  expiryDate: string;
  stockQuantity: number;
  reorderLevel: number;
  unitPrice: number; // MRP in INR
  hsnCode?: string;
  supplier: string;
}

export interface PrescriptionItem {
  pharmacyItemId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  mealTiming?: 'After Food' | 'Before Food' | 'With Food' | 'Empty Stomach' | string;
  durationDays: number;
  quantity: number;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  isDispensed: boolean;
  dispensedDate?: string;
  totalAmount?: number;
  billId?: string;
  paymentMode?: string;
  paymentStatus?: 'pending' | 'paid';
}

export interface PharmacyBillItem {
  pharmacyItemId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  cgstPercent: number;
  sgstPercent: number;
  totalPrice: number;
}

export interface PharmacyBill {
  id: string;
  billNumber: string;
  patientType: 'OPD' | 'IPD' | 'Walk-in';
  patientName: string;
  patientPhone: string;
  patientMrn?: string;
  doctorName: string;
  date: string;
  time: string;
  items: PharmacyBillItem[];
  subtotal: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGstAmount: number;
  netTotal: number;
  paymentMode: 'UPI / QR Code' | 'Cash' | 'Debit/Credit Card';
  pharmacistName: string;
}

export interface LabTest {
  id: string;
  testCode: string;
  name: string;
  category: string;
  specimenType: string;
  turnaroundHours: number;
  price: number;
  normalRange: string;
  unit: string;
}

export type LabOrderStatus = 'pending_sample' | 'processing' | 'completed' | 'verified';

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorName: string;
  testId: string;
  testName: string;
  specimenType: string;
  orderDate: string;
  status: LabOrderStatus;
  resultValue?: string;
  resultNotes?: string;
  normalRange: string;
  unit: string;
  isAbnormal?: boolean;
  technicianName?: string;
  completedAt?: string;
  price: number;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partially_paid' | 'cancelled';

export interface InvoiceItem {
  id: string;
  type: 'Consultation' | 'Bed Charge' | 'Lab Test' | 'Pharmacy' | 'Procedure' | 'Nursing';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  insuranceCoverage: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentMethod: string;
}

export interface FinancialTransaction {
  id: string;
  ref: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  paymentChannel: string;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: string;
  driverName: string;
  driverPhone: string;
  status: 'available' | 'dispatched' | 'maintenance';
  location: string;
  eta?: string;
}

export interface OperationTheatreSchedule {
  id: string;
  room: string;
  patientName: string;
  patientMrn: string;
  leadSurgeon: string;
  surgeryName: string;
  scheduledTime: string;
  durationHours: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'post_op';
}

// ==========================================
// Procurement & Accounts Payable (PO, GRN, Debit Note)
// ==========================================

export type PurchaseOrderStatus =
  | 'draft'
  | 'approved'
  | 'partially_received'
  | 'completed'
  | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  itemName: string;
  category: 'Pharmaceuticals' | 'Surgical Consumables' | 'Lab Reagents' | 'Biomedical Equipment' | 'Facility Supplies';
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRatePercent: number;
  taxAmount: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorContact?: string;
  vendorGstin?: string;
  orderDate: string; // DD-MM-YYYY
  expectedDeliveryDate: string;
  department: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentTerms: string;
  notes?: string;
  status: PurchaseOrderStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export type GrnStatus = 'draft' | 'inspected_accepted' | 'partial_rejection' | 'rejected';

export interface GrnItem {
  id: string;
  poItemId?: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectionReason?: string;
  unit: string;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  acceptedAmount: number;
  rejectedAmount: number;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poId?: string;
  poNumber?: string;
  vendorName: string;
  invoiceOrChallanNo: string;
  receiptDate: string; // DD-MM-YYYY
  receivedBy: string;
  inspectedBy: string;
  qcStatus: 'passed' | 'partial_pass' | 'failed';
  items: GrnItem[];
  totalAcceptedAmount: number;
  totalRejectedAmount: number;
  status: GrnStatus;
  hasDebitNoteGenerated: boolean;
  debitNoteId?: string;
  debitNoteNumber?: string;
  hasBillGenerated?: boolean;
  purchaseBillId?: string;
  purchaseBillNumber?: string;
  stockUpdated: boolean;
  notes?: string;
  createdAt: string;
}

export type DebitNoteStatus = 'issued' | 'adjusted' | 'refunded';

export interface DebitNoteItem {
  id: string;
  itemName: string;
  rejectedQty: number;
  unitPrice: number;
  reason: string;
  taxPercent: number;
  totalAmount: number;
}

export interface DebitNote {
  id: string;
  debitNoteNumber: string;
  vendorName: string;
  grnId?: string;
  grnNumber?: string;
  vendorInvoiceRef?: string;
  issueDate: string;
  reason: string;
  items: DebitNoteItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: DebitNoteStatus;
  adjustedAgainstBill?: string;
  createdBy: string;
  notes?: string;
  createdAt: string;
}

// ==========================================
// Inward Purchase Bills & Accounts Payable
// ==========================================

export type PurchaseBillStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
export type BillClearanceStatus = 'cleared' | 'pending_clearance' | 'on_hold';

export interface PurchaseBillPayment {
  id: string;
  paymentNumber: string; // PAY-2026-041
  paymentDate: string; // DD-MM-YYYY
  amount: number;
  paymentMode: 'Bank Transfer (RTGS/NEFT)' | 'Cheque' | 'UPI' | 'Direct Debit';
  bankAccountId?: string;
  bankAccountName: string;
  referenceNo: string; // UTR or Cheque number
  notes?: string;
  paidBy: string;
  createdAt: string;
}

export interface PurchaseBill {
  id: string;
  billNumber: string; // BILL-2026-088
  vendorInvoiceNo: string; // INV-CIP-88412
  vendorName: string;
  vendorGstin?: string;
  grnId?: string;
  grnNumber?: string;
  poId?: string;
  poNumber?: string;
  billDate: string; // DD-MM-YYYY
  dueDate: string; // DD-MM-YYYY
  department: string;
  subtotal: number;
  taxAmount: number;
  grossAmount: number;
  debitNoteDeduction: number;
  linkedDebitNoteNo?: string;
  freightOrAdjustments?: number;
  netPayable: number;
  paidAmount: number;
  balanceDue: number;
  status: PurchaseBillStatus;
  clearanceStatus: BillClearanceStatus;
  clearedBy?: string;
  clearedAt?: string;
  clearanceNotes?: string;
  payments: PurchaseBillPayment[];
  notes?: string;
  createdAt: string;
}

// ==========================================
// Treasury & Bank Reconciliation (BRS)
// ==========================================

export interface BankStatementTransaction {
  id: string;
  date: string; // DD-MM-YYYY
  valueDate?: string;
  description: string;
  referenceNo: string;
  withdrawal: number; // Debit
  deposit: number; // Credit
  balance: number;
  isMatched: boolean;
  matchedTransactionId?: string;
  matchedLedgerRef?: string;
  matchedDate?: string;
  reconciliationStatus: 'matched' | 'unmatched' | 'reconciled';
}

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  currentStatementBalance: number;
  erpBookBalance: number;
  unreconciledDifference: number;
  lastReconciledDate: string;
}

export interface BankReconciliationSummary {
  bankAccountId: string;
  statementBalance: number;
  depositsInTransit: number;
  outstandingCheques: number;
  adjustedBookBalance: number;
  isBalanced: boolean;
}

// ==========================================
// Financial Statements (P&L and Balance Sheet)
// ==========================================

export interface ProfitAndLossStatement {
  period: string;
  revenues: {
    opdConsultation: number;
    ipdBedAndNursing: number;
    pharmacySales: number;
    labDiagnostics: number;
    otProcedures: number;
    totalRevenue: number;
  };
  cogs: {
    directPurchases: number;
    grnInwardReceipts: number;
    debitNoteDeductions: number;
    totalCogs: number;
  };
  grossProfit: number;
  grossMarginPercent: number;
  expenses: {
    staffPayroll: number;
    hospitalUtilities: number;
    medicalEquipmentMaintenance: number;
    adminAndFacilityOverhead: number;
    totalExpenses: number;
  };
  operatingIncome: number; // EBITDA
  depreciation: number;
  taxProvision: number;
  netProfit: number;
  netMarginPercent: number;
}

export interface BalanceSheetStatement {
  asOfDate: string;
  assets: {
    currentAssets: {
      cashAndBank: number;
      accountsReceivable: number;
      inventoryValuation: number;
      otherCurrentAssets: number;
      totalCurrentAssets: number;
    };
    nonCurrentAssets: {
      biomedicalEquipment: number;
      hospitalInfrastructure: number;
      furnitureAndFixtures: number;
      lessAccumulatedDepreciation: number;
      totalNonCurrentAssets: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      accruedStaffPayroll: number;
      statutoryTaxPayable: number;
      totalCurrentLiabilities: number;
    };
    longTermLiabilities: {
      healthcareTermLoans: number;
      totalLongTermLiabilities: number;
    };
    totalLiabilities: number;
  };
  equity: {
    hospitalTrustCapital: number;
    retainedEarnings: number;
    currentPeriodSurplus: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  variance: number;
}

