# Easy Care: Complete Hospital HRM & Healthcare ERP Solution

**Easy Care** is an enterprise-grade, comprehensive Hospital Management Solution developed with **React (TypeScript, Vite, Tailwind CSS)** on the frontend and **Supabase (PostgreSQL, RLS, Storage)** on the backend.

It covers the complete healthcare lifecycle: Secure Authentication & Role-Based Workstations, Master User Multi-Channel Access Control (Web & Mobile), Hospital Profile & App Branding Customization, Staff Biometric Attendance, Patient EMR/EHR, Ward/Bed Occupancy, Doctor Consultation Desk, Pharmacy POS, Laboratory Information System (LIS), Consolidated Billing & Insurance (TPA), Financial Ledger, and Facilities Operations.

---

## Key Modules & Functionalities

0. **Authentication & Workstation Security (Login Page)**
   - Hospital staff workstation login with username/email and encrypted password.
   - Live **Account Status Validation**: Blocks login immediately if account is marked Inactive or Suspended.
   - Live **Multi-Channel Access Validation**: Enforces Web Access vs Mobile App only access permissions.
   - 1-Click Demo Credential Selector for instantaneous testing across Super Admin, Doctor, Nurse, HR Manager, Receptionist, Pharmacist, Lab Tech, and Accountant.
   - Dynamic hospital branding, accreditation badges, and session persistence in `localStorage`.

1. **Hospital Master Data & User Access Management (`MastersView`)**
   - **Master Users & Multi-Channel Access Control**:
     * Real-time toggles for **Allow Web Access** (Browser ERP portal) and **Allow Mobile Access** (Mobile app).
     * One-click **Login Status Toggle** (`Active` / `Inactive`) that instantly permits or terminates system login access.
     * Password management, password generator, reset password workflows, and staff directory auto-linking.
   - **App Name & Hospital Profile Customizer**:
     * Dynamically update the Application Name (e.g., `Hosp-ERP`), Hospital Full Name, Tagline, Accreditation badges (NABH/JCI/NABL), and 24x7 Casualty Hotline.
     * Live preview card reflecting updates instantly across Navbar, Sidebar, and Login screen.
   - **Staff & Geolocation Privileges Master**:
     * Configure Inside Hospital Premises vs Outside Premises attendance privileges for field doctors and ambulance crews.
   - **Departments, Wards & Bed Tariffs, Drug Formulary, Diagnostic Lab Tests**.

1. **Executive Hospital Command Center (Dashboard)**
   - Live clinical KPIs: Bed Occupancy %, Today's Inpatients, OPD Consultations, Active On-Duty Staff, Daily Gross Billing.
   - Interactive charts: 7-day Admission vs Discharge flow, Departmental Revenue Breakdown.
   - Real-time emergency triage banners for critical lab alerts, formulary stock-outs, and ambulance statuses.

2. **Patient Management & Electronic Medical Records (EMR / EHR)**
   - Patient Registration with auto-generated Medical Record Number (`MRN-2026-XXXX`).
   - Demographics, blood group, allergies (NKDA warnings), emergency contacts, and insurance policy tracking.
   - Electronic Medical Records (EMR): clinical history, vital signs logs, prescription records, and diagnostic reports.

3. **Inpatient Bed & Ward Management (Floor Map)**
   - Interactive visual bed map covering ICU, Cardiac Step-Down, General Wards, and Emergency Bays.
   - Live color statuses: **Available** (Emerald), **Occupied** (Rose), **Sanitizing** (Amber), and **Maintenance** (Slate).
   - 1-click patient admission, bed transfer, and discharge with sanitization scheduling.

4. **Human Resources Management (HRM) & Attendance**
   - Staff Directory: Doctor specialists, nurses, technicians, and admin credentials with medical licensing numbers.
   - Biometric Attendance: Clock-in / clock-out simulator with shift hours and overtime calculation.
   - Leave Management: Leave applications (Casual, Sick, Privilege, Emergency) with approval/rejection pipeline.
   - Payroll & Compensation: Automated payslip generation with printable official hospital salary slips.

5. **Doctor Consultation Desk & Outpatient Clinic (OPD)**
   - OPD Token Queue (Scheduled, Checked-in, In Consultation, Completed).
   - Clinical consultation pad: Vitals summary, chief complaints, ICD-10 diagnosis.
   - Digital E-Prescription Desk: Prescribe formulary medications with direct sync to Pharmacy.
   - Diagnostic Order Desk: Order pathology/radiology tests with direct sync to Laboratory.

6. **Pharmacy & Point of Sale (POS)**
   - Drug Formulary: Brand & generic composition, batch numbers, expiry dates, unit prices.
   - Low-stock and reorder threshold badges.
   - Prescription fulfillment: 1-click dispensing with automatic stock quantity deduction.
   - Over-The-Counter (OTC) POS cashier with instant printable receipt.

7. **Laboratory Information System (LIS) & Diagnostics**
   - Test Catalog (CBC, Lipid Panel, Renal Function, Cardiac Troponin-I, Digital Chest X-Ray).
   - Specimen collection & processing workflow (Pending Sample $\rightarrow$ Processing $\rightarrow$ Verified).
   - Result entry with automated High/Low critical abnormal flagging.
   - Printable branded patient diagnostic report with reference intervals.

8. **Billing, Invoicing & Insurance (TPA)**
   - Unified Invoicing: Aggregates consultations, bed charges, pharmacy medicines, and lab investigations.
   - Insurance & TPA management: Cashless pre-authorizations, co-pays, and policy claim settlement.
   - Printable Hospital Tax Invoice with QR stamp.

9. **Hospital Finance & General Ledger (ERP)**
   - Daily, monthly, and fiscal financial ledger.
   - Operational cash flow: Revenue vs overhead expenses (payroll, supplies, utilities).
   - Net operating margin and departmental P&L breakdown.

10. **Operations, Ambulance Dispatch & OT Suites**
    - Rapid Response Ambulance Fleet with live GPS status (Available, Dispatched, Maintenance).
    - Operation Theatre (OT) surgical schedules with lead surgeon assignments.
    - Biomedical engineering equipment inspection and calibration audit log.

---

## Dual-Mode Architecture (Mock Sandbox + Live Supabase)

MedPulse ERP comes with an intelligent dual-mode service layer:
- **Demo Sandbox Mode (Default)**: Runs immediately out-of-the-box with comprehensive sample doctors, patients, bed maps, invoices, and lab tests. All updates persist in `localStorage`.
- **Live Supabase Mode**: Automatically activates as soon as you plug in your Supabase project credentials.

### Connecting to Live Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the provided SQL scripts:
   - `supabase/schema.sql` (Creates all tables, enums, foreign keys, and RLS policies)
   - `supabase/seed.sql` (Optional: Seeds initial departments, doctors, formulary items, and beds)
3. Copy your project URL and Anon key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Start the application:
   ```bash
   npm run dev
   ```

---

## Interactive Role Switcher

You can test the application from 8 distinct hospital perspectives using the **Role Switcher** in the top navigation bar:
- **Super Admin**: Full hospital management & all modules.
- **Doctor / Specialist**: OPD queue, patient EMR, e-prescriptions, lab ordering.
- **Head Nurse**: Ward bed map, patient vitals, shift attendance.
- **HR Manager**: Staff roster, biometric attendance, leave approvals, payroll.
- **Front Desk**: Patient intake, registration, appointment tokens.
- **Chief Pharmacist**: Formulary inventory, dispensing desk, retail POS.
- **Lab Pathologist**: Diagnostic orders, test result entry, report release.
- **Finance Controller**: Billing, insurance claims, cashier, general ledger.

---

## Build & Verification

```bash
# Production Build
npm run build

# Local Preview
npm run preview
```
