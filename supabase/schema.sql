-- ============================================================================
-- MedPulse Hospital HRM & ERP Database Schema
-- Compatible with Supabase PostgreSQL
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'doctor',
  'nurse',
  'hr_manager',
  'receptionist',
  'pharmacist',
  'lab_technician',
  'accountant'
);

CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'cleaning', 'maintenance');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'checked_in', 'in_consultation', 'completed', 'cancelled');
CREATE TYPE admission_status AS ENUM ('admitted', 'discharged', 'transferred');
CREATE TYPE lab_order_status AS ENUM ('pending_sample', 'processing', 'completed', 'verified');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'partially_paid', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'half_day', 'on_leave');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE permission_type AS ENUM ('late_coming', 'early_departure', 'mid_day_permission', 'official_duty');
CREATE TYPE permission_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. DEPARTMENTS & SPECIALTIES
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  head_of_department VARCHAR(100),
  floor_number INT DEFAULT 1,
  bed_capacity INT DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STAFF / HRM DIRECTORY
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(30) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  role user_role NOT NULL DEFAULT 'nurse',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation VARCHAR(100) NOT NULL,
  license_number VARCHAR(50),
  specialization VARCHAR(100),
  joining_date DATE NOT NULL,
  basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 3500.00,
  shift_timing VARCHAR(50) DEFAULT '08:00 - 16:00',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  allow_web_access BOOLEAN DEFAULT true,
  allow_mobile_access BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3B. MASTER USERS & ACCESS PLATFORM CONTROL (WEB & MOBILE)
CREATE TABLE IF NOT EXISTS master_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  employee_id VARCHAR(30),
  full_name VARCHAR(150) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'nurse',
  department VARCHAR(100),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation VARCHAR(100),
  specialization VARCHAR(100),
  allow_web_access BOOLEAN NOT NULL DEFAULT true,
  allow_mobile_access BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'inactive'
  last_login TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3C. HOSPITAL BRANDING & SETTINGS
CREATE TABLE IF NOT EXISTS hospital_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_name VARCHAR(100) NOT NULL DEFAULT 'Hosp-ERP',
  hospital_name VARCHAR(200) NOT NULL DEFAULT 'Hosp-ERP Super-Speciality Hospital',
  tagline TEXT,
  short_name VARCHAR(50) DEFAULT 'Hosp-ERP',
  accreditation VARCHAR(100) DEFAULT 'NABH ACCREDITED',
  emergency_contact VARCHAR(100) DEFAULT 'Casualty / 108 Emergency: Ext 911',
  address TEXT,
  email VARCHAR(150),
  phone VARCHAR(50),
  website VARCHAR(150),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ATTENDANCE & SHIFTS
CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  status attendance_status DEFAULT 'present',
  hours_worked DECIMAL(4, 2) DEFAULT 8.00,
  overtime_hours DECIMAL(4, 2) DEFAULT 0.00,
  biometric_verified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, attendance_date)
);

-- 5. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS staff_leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- 'Casual', 'Sick', 'Privilege', 'Emergency'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT NOT NULL,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5B. STAFF SHORT PERMISSIONS & SECURITY GATE PASS (INDIAN HOSPITAL PROTOCOL)
CREATE TABLE IF NOT EXISTS staff_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  gate_pass_no VARCHAR(50) UNIQUE NOT NULL,
  permission_type permission_type NOT NULL,
  permission_date DATE NOT NULL,
  from_time VARCHAR(20) NOT NULL,
  to_time VARCHAR(20) NOT NULL,
  duration_hours DECIMAL(4, 2) NOT NULL,
  reason TEXT NOT NULL,
  status permission_status DEFAULT 'pending',
  approved_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PAYROLL & COMPENSATION
CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  month_year VARCHAR(20) NOT NULL, -- 'October 2026'
  basic_salary DECIMAL(10, 2) NOT NULL,
  allowances DECIMAL(10, 2) DEFAULT 0.00,
  deductions DECIMAL(10, 2) DEFAULT 0.00,
  net_salary DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'paid', 'unpaid', 'processing'
  payment_date DATE,
  payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PATIENTS MASTER & EMR
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mrn VARCHAR(30) UNIQUE NOT NULL, -- Medical Record Number e.g. 'MRN-2026-0041'
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150),
  address TEXT,
  blood_group VARCHAR(10),
  allergies TEXT[],
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(30),
  insurance_provider VARCHAR(100),
  insurance_policy_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. APPOINTMENTS (OPD)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number INT NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot VARCHAR(30) NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  reason_for_visit TEXT,
  vital_signs JSONB, -- { "bp": "120/80", "pulse": 72, "temp": "98.6 F", "spo2": 99 }
  doctor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. WARDS & BEDS (IPD)
CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  ward_type VARCHAR(50) NOT NULL, -- 'ICU', 'General', 'Semi-Private', 'Emergency'
  floor VARCHAR(20) NOT NULL,
  charge_per_day DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  bed_number VARCHAR(20) NOT NULL,
  status bed_status DEFAULT 'available',
  current_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  assigned_nurse_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ward_id, bed_number)
);

-- 10. IPD ADMISSIONS & DISCHARGES
CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES beds(id),
  admitting_doctor_id UUID NOT NULL REFERENCES staff(id),
  admission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discharge_date TIMESTAMP WITH TIME ZONE,
  status admission_status DEFAULT 'admitted',
  primary_diagnosis TEXT NOT NULL,
  daily_clinical_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PHARMACY & INVENTORY
CREATE TABLE IF NOT EXISTS pharmacy_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'Antibiotic', 'Analgesic', 'Cardiovascular', etc.
  dosage_form VARCHAR(50) NOT NULL, -- 'Tablet', 'Syrup', 'Injection', 'Capsule'
  batch_number VARCHAR(50) NOT NULL,
  expiry_date DATE NOT NULL,
  hsn_code VARCHAR(20) DEFAULT '3004',
  stock_quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 50,
  unit_price DECIMAL(10, 2) NOT NULL,
  supplier VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11B. PHARMACY INDIVIDUAL MEDICINE BILLING (GST TAX INVOICE)
CREATE TABLE IF NOT EXISTS pharmacy_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number VARCHAR(50) UNIQUE NOT NULL, -- 'PHARM-2026-8801'
  patient_type VARCHAR(20) NOT NULL DEFAULT 'walk_in', -- 'walk_in', 'opd', 'ipd'
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name VARCHAR(150) NOT NULL,
  patient_phone VARCHAR(30) NOT NULL,
  patient_mrn VARCHAR(50),
  prescribed_by VARCHAR(150),
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bill_time VARCHAR(20) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  cgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  sgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(12, 2) NOT NULL,
  payment_mode VARCHAR(30) NOT NULL DEFAULT 'UPI', -- 'UPI', 'Cash', 'Card'
  pharmacist_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacy_bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES pharmacy_bills(id) ON DELETE CASCADE,
  item_id UUID REFERENCES pharmacy_items(id) ON DELETE SET NULL,
  medicine_name VARCHAR(150) NOT NULL,
  batch_number VARCHAR(50) NOT NULL,
  expiry_date VARCHAR(20) NOT NULL,
  hsn_code VARCHAR(20) DEFAULT '3004',
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  cgst_rate DECIMAL(4, 2) DEFAULT 2.50,
  sgst_rate DECIMAL(4, 2) DEFAULT 2.50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES staff(id),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  instructions TEXT,
  is_dispensed BOOLEAN DEFAULT false,
  dispensed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  pharmacy_item_id UUID NOT NULL REFERENCES pharmacy_items(id),
  dosage VARCHAR(50) NOT NULL, -- '500mg'
  frequency VARCHAR(50) NOT NULL, -- '1-0-1 After meals'
  duration_days INT NOT NULL DEFAULT 5,
  quantity INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. LABORATORY & DIAGNOSTICS
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'Hematology', 'Biochemistry', 'Radiology', 'Microbiology'
  specimen_type VARCHAR(50) DEFAULT 'Blood',
  turnaround_hours INT DEFAULT 4,
  price DECIMAL(10, 2) NOT NULL,
  normal_range VARCHAR(100),
  unit VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES staff(id),
  test_id UUID NOT NULL REFERENCES lab_tests(id),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status lab_order_status DEFAULT 'pending_sample',
  result_value VARCHAR(100),
  result_notes TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  technician_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. BILLING & INVOICES
CREATE TABLE IF NOT EXISTS billing_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- 'INV-2026-1002'
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  insurance_covered_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status invoice_status DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'Cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'Consultation', 'Bed Charge', 'Lab Test', 'Pharmacy', 'Surgery'
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. FINANCE & GENERAL LEDGER
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_ref VARCHAR(50) UNIQUE NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
  category VARCHAR(100) NOT NULL, -- 'Patient Billing', 'Pharmacy Sales', 'Staff Payroll', 'Medical Supplies', 'Utilities'
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  payment_channel VARCHAR(50) DEFAULT 'Bank Transfer',
  created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. HOSPITAL OPERATIONS & FACILITIES
CREATE TABLE IF NOT EXISTS ambulance_fleet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number VARCHAR(30) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Basic Life Support (BLS)', 'Advanced Life Support (ALS)', 'ICU on Wheels'
  driver_name VARCHAR(100) NOT NULL,
  driver_phone VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'available', -- 'available', 'dispatched', 'maintenance'
  current_location VARCHAR(100) DEFAULT 'Base Hospital Station',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ot_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ot_room VARCHAR(30) NOT NULL, -- 'OT-1 (Neuro)', 'OT-2 (Cardio)', 'OT-3 (General)'
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  lead_surgeon_id UUID NOT NULL REFERENCES staff(id),
  surgery_name VARCHAR(150) NOT NULL,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(30) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'post_op'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_schedules ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform operations based on clinical and administrative needs
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Public read patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Public full access patients" ON patients FOR ALL USING (true);
CREATE POLICY "Public full access appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Public full access admissions" ON admissions FOR ALL USING (true);
CREATE POLICY "Public full access beds" ON beds FOR ALL USING (true);
CREATE POLICY "Public full access billing" ON billing_invoices FOR ALL USING (true);
CREATE POLICY "Public full access lab" ON lab_orders FOR ALL USING (true);
CREATE POLICY "Public full access pharmacy" ON pharmacy_items FOR ALL USING (true);
CREATE POLICY "Public full access pharmacy_bills" ON pharmacy_bills FOR ALL USING (true);
CREATE POLICY "Public full access pharmacy_bill_items" ON pharmacy_bill_items FOR ALL USING (true);
CREATE POLICY "Public full access staff_attendance" ON staff_attendance FOR ALL USING (true);
CREATE POLICY "Public full access staff_leaves" ON staff_leaves FOR ALL USING (true);
CREATE POLICY "Public full access staff_permissions" ON staff_permissions FOR ALL USING (true);
CREATE POLICY "Public full access payroll" ON payroll_records FOR ALL USING (true);
CREATE POLICY "Public full access finance" ON financial_transactions FOR ALL USING (true);
