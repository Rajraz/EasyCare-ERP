-- ============================================================================
-- Aayush Apex Super-Speciality Hospital (NABH Accredited)
-- Supabase PostgreSQL Seed Dataset (Indian Healthcare Structure)
-- ============================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, name, code, head_of_department, floor_number, bed_capacity) VALUES
('d1000000-0000-0000-0000-000000000001', 'Cardiology & Cardiothoracic Surgery', 'CARD', 'Dr. Rajesh Sharma, MD, DM (Cardio)', 3, 24),
('d1000000-0000-0000-0000-000000000002', 'Emergency, Casualty & 108 Trauma Center', 'EMER', 'Dr. Priya Nair, MBBS, MS (Trauma)', 1, 16),
('d1000000-0000-0000-0000-000000000003', 'Neurology & Neurosurgery', 'NEUR', 'Dr. Arvind Swaminathan, MD, MCh (Neuro)', 4, 18),
('d1000000-0000-0000-0000-000000000004', 'Orthopedics & Joint Replacement', 'ORTH', 'Dr. Rameshwar Iyer, MS (Ortho)', 2, 20),
('d1000000-0000-0000-0000-000000000005', 'Intensive Care Unit (ICU / CCU)', 'ICU', 'Dr. Sneha Kulkarni, MD, FNB (Crit Care)', 2, 12),
('d1000000-0000-0000-0000-000000000006', 'Pediatrics & Neonatology (NICU)', 'PED', 'Dr. Ananya Sen, MD (Pediatrics)', 2, 15),
('d1000000-0000-0000-0000-000000000007', 'General Medicine & OPD', 'GEN', 'Dr. Manojit Das, MD (Gen Med)', 1, 30);

-- 2. STAFF / EMPLOYEES (Indian Clinical & Administrative Staff)
INSERT INTO staff (id, employee_id, first_name, last_name, email, phone, role, department_id, designation, license_number, specialization, joining_date, basic_salary, shift_timing, is_active) VALUES
('s1000000-0000-0000-0000-000000000001', 'EMP-001', 'Dr. Arvind', 'Swaminathan', 'medical.superintendent@aayushhosp.in', '+91 98450 11001', 'super_admin', 'd1000000-0000-0000-0000-000000000007', 'Medical Superintendent & Director', 'MCI-1998-34892', 'Healthcare Governance & Hospital Administration', '2020-01-15', 280000.00, '09:00 AM - 05:00 PM', true),
('s1000000-0000-0000-0000-000000000002', 'EMP-002', 'Dr. Rajesh', 'Sharma', 'dr.rajesh@aayushhosp.in', '+91 98450 11002', 'doctor', 'd1000000-0000-0000-0000-000000000001', 'Senior Interventional Cardiologist', 'MCI-2004-94211', 'Interventional Cardiology & Angioplasty', '2021-03-01', 225000.00, '09:00 AM - 05:00 PM', true),
('s1000000-0000-0000-0000-000000000003', 'EMP-003', 'Dr. Priya', 'Nair', 'dr.priya@aayushhosp.in', '+91 98450 11003', 'doctor', 'd1000000-0000-0000-0000-000000000002', 'Casualty & Emergency Medical Officer (CMO)', 'KMC-2012-32948', 'Trauma Resuscitation & Emergency Critical Care', '2021-06-15', 185000.00, 'Rotational 24x7 Shift', true),
('s1000000-0000-0000-0000-000000000004', 'EMP-004', 'Sister Anitha', 'Thomas', 'anitha.thomas@aayushhosp.in', '+91 98450 11004', 'nurse', 'd1000000-0000-0000-0000-000000000005', 'Nursing Superintendent / Head Nurse ICU', 'INC-RN-102940', 'Critical Care Nursing & NABH Quality Standards', '2021-09-01', 58000.00, '07:00 AM - 03:30 PM (Morning)', true),
('s1000000-0000-0000-0000-000000000005', 'EMP-005', 'Amit', 'Verma', 'amit.hr@aayushhosp.in', '+91 98450 11005', 'hr_manager', 'd1000000-0000-0000-0000-000000000007', 'Human Resources Manager & Payroll Head', 'HR-MBA-5501', 'Hospital HRM, Statutory Compliance (PF/ESI/PT)', '2022-01-10', 82000.00, '09:30 AM - 06:00 PM', true),
('s1000000-0000-0000-0000-000000000006', 'EMP-006', 'Sunita', 'Deshmukh', 'reception@aayushhosp.in', '+91 98450 11006', 'receptionist', 'd1000000-0000-0000-0000-000000000007', 'Senior Triage & OPD Front Desk Executive', 'REG-ADM-0012', 'Ayushman Bharat PMJAY Helpdesk & Registration', '2022-04-12', 38000.00, '08:00 AM - 04:30 PM', true),
('s1000000-0000-0000-0000-000000000007', 'EMP-007', 'Vikram', 'Patel', 'pharmacy@aayushhosp.in', '+91 98450 11007', 'pharmacist', 'd1000000-0000-0000-0000-000000000007', 'Chief Pharmacist & Retail Dispensary Head', 'PCI-KA-88122', 'Clinical Pharmacy, HSN Billing & Narcotics Log', '2021-11-20', 64000.00, '08:00 AM - 04:30 PM', true),
('s1000000-0000-0000-0000-000000000008', 'EMP-008', 'Dr. Sneha', 'Kulkarni', 'pathology@aayushhosp.in', '+91 98450 11008', 'lab_technician', 'd1000000-0000-0000-0000-000000000007', 'Senior Pathologist & NABL Lab In-Charge', 'KMC-2015-44021', 'Clinical Hematology, Biochemistry & Histopath', '2022-02-14', 120000.00, '08:30 AM - 04:30 PM', true),
('s1000000-0000-0000-0000-000000000009', 'EMP-009', 'Rameshwar', 'Iyer', 'accounts@aayushhosp.in', '+91 98450 11009', 'accountant', 'd1000000-0000-0000-0000-000000000007', 'Chief Financial Controller (CA)', 'ICAI-FCA-99042', 'TPA Cashless Settlement, GST Auditing & ERP', '2020-08-01', 145000.00, '09:30 AM - 06:30 PM', true);

-- 3. WARDS & BEDS (Indian Rates in INR ₹)
INSERT INTO wards (id, name, ward_type, floor, charge_per_day) VALUES
('w1000000-0000-0000-0000-000000000001', 'Critical Care ICU Wing A', 'ICU', 'Floor 2', 6500.00),
('w1000000-0000-0000-0000-000000000002', 'Cardiac Step-Down Ward', 'Semi-Private', 'Floor 3', 3500.00),
('w1000000-0000-0000-0000-000000000003', 'General Medical Ward B', 'General', 'Floor 1', 1200.00),
('w1000000-0000-0000-0000-000000000004', 'Casualty Observation Bay', 'Emergency', 'Floor 1', 2200.00);

INSERT INTO beds (id, ward_id, bed_number, status) VALUES
('b1000000-0000-0000-0000-000000000001', 'w1000000-0000-0000-0000-000000000001', 'ICU-101', 'occupied'),
('b1000000-0000-0000-0000-000000000002', 'w1000000-0000-0000-0000-000000000001', 'ICU-102', 'occupied'),
('b1000000-0000-0000-0000-000000000003', 'w1000000-0000-0000-0000-000000000001', 'ICU-103', 'available'),
('b1000000-0000-0000-0000-000000000004', 'w1000000-0000-0000-0000-000000000001', 'ICU-104', 'cleaning'),
('b1000000-0000-0000-0000-000000000005', 'w1000000-0000-0000-0000-000000000002', 'CARD-201', 'occupied'),
('b1000000-0000-0000-0000-000000000006', 'w1000000-0000-0000-0000-000000000002', 'CARD-202', 'available'),
('b1000000-0000-0000-0000-000000000007', 'w1000000-0000-0000-0000-000000000003', 'GEN-301', 'available'),
('b1000000-0000-0000-0000-000000000008', 'w1000000-0000-0000-0000-000000000003', 'GEN-302', 'occupied'),
('b1000000-0000-0000-0000-000000000009', 'w1000000-0000-0000-0000-000000000004', 'CAS-01', 'occupied'),
('b1000000-0000-0000-0000-000000000010', 'w1000000-0000-0000-0000-000000000004', 'CAS-02', 'available');

-- 4. PHARMACY FORMULARY (Indian Brands, HSN 3004, MRP in INR ₹)
INSERT INTO pharmacy_items (id, item_code, name, generic_name, category, dosage_form, batch_number, expiry_date, hsn_code, stock_quantity, reorder_level, unit_price, supplier) VALUES
('p1000000-0000-0000-0000-000000000001', 'MED-001', 'Augmentin 625 Duo Tablet', 'Amoxicillin 500mg + Clavulanic Acid 125mg', 'Antibiotic', 'Tablet', 'BTH-2026-AUG', '2027-08-30', '3004', 350, 60, 204.50, 'GlaxoSmithKline Pharmaceuticals India Ltd'),
('p1000000-0000-0000-0000-000000000002', 'MED-002', 'Atorva 20mg (Atorvastatin)', 'Atorvastatin Calcium IP', 'Cardiovascular', 'Tablet', 'BTH-2026-AT2', '2027-11-15', '3004', 420, 50, 168.00, 'Zydus Healthcare Ltd'),
('p1000000-0000-0000-0000-000000000003', 'MED-003', 'Glycomet-GP 1 Forte', 'Metformin 1000mg + Glimepiride 1mg', 'Antidiabetic', 'Tablet', 'BTH-2026-GLY', '2028-01-20', '3004', 800, 100, 112.00, 'USV Private Limited'),
('p1000000-0000-0000-0000-000000000004', 'MED-004', 'Pantocid 40mg IV Injection', 'Pantoprazole Sodium IP', 'Gastrointestinal', 'Injection', 'BTH-2026-PAN', '2026-12-10', '3004', 45, 50, 54.00, 'Sun Pharmaceutical Industries Ltd'),
('p1000000-0000-0000-0000-000000000005', 'MED-005', 'Clexane 40mg / 0.4ml Prefilled Syringe', 'Enoxaparin Sodium IP', 'Anticoagulant', 'Pre-filled Syringe', 'BTH-2026-CLX', '2027-04-18', '3004', 85, 30, 620.00, 'Sanofi India Limited'),
('p1000000-0000-0000-0000-000000000006', 'MED-006', 'Dolo 650 Tablet', 'Paracetamol IP 650mg', 'Analgesic & Antipyretic', 'Tablet', 'BTH-2026-DOL', '2028-05-10', '3004', 1500, 200, 34.00, 'Micro Labs Limited');

-- 5. LAB TEST CATALOG (NABL Standard, Prices in INR ₹)
INSERT INTO lab_tests (id, test_code, name, category, specimen_type, turnaround_hours, price, normal_range, unit) VALUES
('t1000000-0000-0000-0000-000000000001', 'LAB-CBC', 'Complete Blood Count (CBC) with ESR', 'Hematology', 'Whole Blood (EDTA)', 2, 450.00, 'Hb: 13.5-17.5, TLC: 4,000-11,000', 'g/dL, /cumm'),
('t1000000-0000-0000-0000-000000000002', 'LAB-LIP', 'Comprehensive Lipid Profile', 'Biochemistry', 'Serum (Fasting)', 4, 850.00, 'Total Chol: <200, Triglycerides: <150', 'mg/dL'),
('t1000000-0000-0000-0000-000000000003', 'LAB-KFT', 'Renal Function & Electrolytes (KFT)', 'Biochemistry', 'Serum', 3, 750.00, 'Creatinine: 0.7-1.3, Urea: 15-40', 'mg/dL'),
('t1000000-0000-0000-0000-000000000004', 'LAB-TROP', 'High-Sensitivity Cardiac Troponin-I', 'Cardiology / Casualty', 'Plasma', 1, 1200.00, '< 0.04 (Negative)', 'ng/mL'),
('t1000000-0000-0000-0000-000000000005', 'LAB-CXR', 'Chest X-Ray Digital PA View', 'Radiology', 'Radiation Scan', 2, 600.00, 'Normal bronchovascular markings, CTR normal', 'Film & Report');

-- 6. PATIENT RECORDS (Indian Patients, TPA / Ayushman Bharat PMJAY)
INSERT INTO patients (id, mrn, first_name, last_name, gender, date_of_birth, phone, email, address, blood_group, allergies, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number) VALUES
('u1000000-0000-0000-0000-000000000001', 'MRN-2026-1001', 'Rahul', 'Verma', 'Male', '1968-05-14', '+91 98440 12345', 'rahul.verma@gmail.com', 'Flat 402, Shanthi Niketan, Indiranagar, Bengaluru', 'B+', ARRAY['Penicillin', 'Sulfa'], 'Sunita Verma', '+91 98440 12346', 'Star Health Allied Insurance', 'SH-BLR-88912-A'),
('u1000000-0000-0000-0000-000000000002', 'MRN-2026-1002', 'Meenakshi', 'Sundaram', 'Female', '1984-11-23', '+91 94480 54321', 'meenakshi.s@outlook.com', '#14, 5th Cross, Malleshwaram, Bengaluru', 'O+', ARRAY[]::TEXT[], 'K. Sundaram', '+91 94480 54322', 'Ayushman Bharat PMJAY', 'PMJAY-KA-991204'),
('u1000000-0000-0000-0000-000000000003', 'MRN-2026-1003', 'Suresh', 'Chandran', 'Male', '1952-02-18', '+91 98860 99881', 'suresh.c@gmail.com', 'Plot 88, BTM 2nd Stage, Bengaluru', 'A+', ARRAY['Aspirin / NSAIDs'], 'Geetha Chandran', '+91 98860 99882', 'Medi Assist TPA (Corporate Cashless)', 'MA-CORP-44012-K'),
('u1000000-0000-0000-0000-000000000004', 'MRN-2026-1004', 'Pooja', 'Kashyap', 'Female', '1995-07-09', '+91 97410 33211', 'pooja.kashyap@yahoo.in', 'House 56, HSR Layout Sector 1, Bengaluru', 'AB+', ARRAY[]::TEXT[], 'Naveen Kashyap', '+91 97410 33212', 'HDFC ERGO Health Insurance', 'HE-IND-77312-X');

-- 7. STAFF SHORT PERMISSION & GATE PASS SAMPLES
INSERT INTO staff_permissions (id, staff_id, gate_pass_no, permission_type, permission_date, from_time, to_time, duration_hours, reason, status, approved_by, approved_at) VALUES
('pm100000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000004', 'GP-2026-101', 'early_departure', '2026-10-31', '02:30 PM', '04:00 PM', 1.5, 'Family medical emergency at home', 'approved', 's1000000-0000-0000-0000-000000000005', NOW()),
('pm100000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000007', 'GP-2026-102', 'mid_day_permission', '2026-10-31', '01:00 PM', '02:30 PM', 1.5, 'Urgent banking work at SBI branch for statutory challan submission', 'pending', NULL, NULL);

-- 8. PHARMACY INDIVIDUAL BILLS (GST CASH MEMO SAMPLES)
INSERT INTO pharmacy_bills (id, bill_number, patient_type, patient_id, patient_name, patient_phone, patient_mrn, prescribed_by, bill_date, bill_time, subtotal, cgst_amount, sgst_amount, discount_amount, grand_total, payment_mode, pharmacist_name) VALUES
('pb100000-0000-0000-0000-000000000001', 'PHARM-2026-8801', 'opd', 'u1000000-0000-0000-0000-000000000001', 'Rahul Verma', '+91 98440 12345', 'MRN-2026-1001', 'Dr. Rajesh Sharma, MD, DM', '2026-10-31', '10:45 AM', 617.14, 15.43, 15.43, 0.00, 648.00, 'UPI', 'Vikram Patel, Reg. Pharmacist'),
('pb100000-0000-0000-0000-000000000002', 'PHARM-2026-8802', 'walk_in', NULL, 'Girish Kumar', '+91 99001 88234', NULL, 'Dr. B. K. Rao (External Consultant)', '2026-10-31', '11:15 AM', 323.81, 8.10, 8.10, 0.00, 340.00, 'Cash', 'Vikram Patel, Reg. Pharmacist');

-- 9. AMBULANCE FLEET (KA RTO Registration, 108 Emergency Service)
INSERT INTO ambulance_fleet (id, vehicle_number, type, driver_name, driver_phone, status, current_location) VALUES
('a1000000-0000-0000-0000-000000000001', 'KA-01-EA-1008', 'Advanced Cardiac Life Support (ACLS)', 'Manjunath Gowda', '+91 98450 88110', 'available', 'Emergency Bay Gate 1'),
('a1000000-0000-0000-0000-000000000002', 'KA-01-EA-1009', 'Neonatal Critical Transport Unit', 'Syed Shakeel', '+91 98450 88120', 'dispatched', 'En route to HSR Trauma Incident'),
('a1000000-0000-0000-0000-000000000003', 'KA-01-EM-1108', 'Basic Life Support (BLS 108 Emergency)', 'Ravi Teja', '+91 98450 88130', 'maintenance', 'Fleet Workshop (Brake inspection)');
