import React, { useState } from 'react';
import {
  Layers,
  Users,
  Building2,
  BedDouble,
  Pill,
  FlaskConical,
  PlusCircle,
  Edit3,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  IndianRupee,
  Check,
  UserCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { MasterUsersTab } from './MasterUsersTab';
import { HospitalProfileTab } from './HospitalProfileTab';
import {
  Staff,
  Department,
  Ward,
  Bed,
  PharmacyItem,
  LabTest,
  UserRole,
  AttendancePrivilege,
} from '../../types/hospital';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { DatePicker } from '../common/DatePicker';
import { formatCurrency, formatDate } from '../../lib/utils';

export const MastersView: React.FC = () => {
  const {
    staff,
    addStaff,
    updateStaff,
    departments,
    addDepartment,
    updateDepartment,
    wards,
    addWard,
    updateWard,
    beds,
    addBed,
    updateBed,
    pharmacyItems,
    addPharmacyItem,
    updatePharmacyItem,
    labTests,
    addLabTest,
    updateLabTest,
    masterUsers,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<
    'users' | 'staff' | 'departments' | 'wards' | 'pharmacy' | 'laboratory' | 'hospital_profile'
  >('users');

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [staffPrivilegeFilter, setStaffPrivilegeFilter] = useState<string>('all');

  // Modals state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);

  const [bedModalOpen, setBedModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);

  const [medModalOpen, setMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<PharmacyItem | null>(null);

  const [labModalOpen, setLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<LabTest | null>(null);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Staff Form State
  const [staffForm, setStaffForm] = useState<Omit<Staff, 'id'>>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'nurse',
    departmentId: departments[0]?.id || 'dept-1',
    departmentName: departments[0]?.name || 'General',
    designation: '',
    licenseNumber: '',
    specialization: '',
    joiningDate: formatDate(new Date().toISOString()),
    basicSalary: 65000,
    shiftTiming: '09:00 AM - 05:00 PM',
    isActive: true,
    attendancePrivilege: 'inside_only',
  });

  // Department Form State
  const [deptForm, setDeptForm] = useState<Omit<Department, 'id'>>({
    name: '',
    code: '',
    headOfDepartment: '',
    floorNumber: 1,
    bedCapacity: 20,
  });

  // Ward Form State
  const [wardForm, setWardForm] = useState<Omit<Ward, 'id'>>({
    name: '',
    wardType: 'General',
    floor: 'Floor 1',
    chargePerDay: 1500,
    totalBeds: 10,
    occupiedBeds: 0,
  });

  // Bed Form State
  const [bedForm, setBedForm] = useState<Omit<Bed, 'id'>>({
    bedNumber: '',
    wardId: wards[0]?.id || '',
    wardName: wards[0]?.name || '',
    status: 'available',
    dailyRate: 1500,
  });

  // Medicine Form State
  const [medForm, setMedForm] = useState<Omit<PharmacyItem, 'id'>>({
    itemCode: '',
    name: '',
    genericName: '',
    category: 'Antibiotic',
    dosageForm: 'Tablet',
    batchNumber: '',
    expiryDate: formatDate(new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()),
    hsnCode: '3004',
    stockQuantity: 100,
    reorderLevel: 30,
    unitPrice: 120,
    supplier: '',
  });

  // Lab Test Form State
  const [labForm, setLabForm] = useState<Omit<LabTest, 'id'>>({
    testCode: '',
    name: '',
    category: 'Biochemistry',
    specimenType: 'Blood',
    turnaroundHours: 3,
    price: 500,
    normalRange: 'Normal',
    unit: 'mg/dL',
  });

  // Handlers for Staff
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    const empNum = String(staff.length + 1).padStart(3, '0');
    setStaffForm({
      employeeId: `EMP-${empNum}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '+91 ',
      role: 'nurse',
      departmentId: departments[0]?.id || 'dept-1',
      departmentName: departments[0]?.name || 'General',
      designation: '',
      licenseNumber: '',
      specialization: '',
      joiningDate: formatDate(new Date().toISOString()),
      basicSalary: 65000,
      shiftTiming: '09:00 AM - 05:00 PM',
      isActive: true,
      attendancePrivilege: 'inside_only',
    });
    setStaffModalOpen(true);
  };

  const handleOpenEditStaff = (member: Staff) => {
    setEditingStaff(member);
    setStaffForm({
      employeeId: member.employeeId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      departmentId: member.departmentId,
      departmentName: member.departmentName || '',
      designation: member.designation,
      licenseNumber: member.licenseNumber,
      specialization: member.specialization,
      joiningDate: member.joiningDate,
      basicSalary: member.basicSalary,
      shiftTiming: member.shiftTiming,
      isActive: member.isActive,
      attendancePrivilege: member.attendancePrivilege || 'inside_only',
    });
    setStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === staffForm.departmentId);
    const payload = {
      ...staffForm,
      departmentName: dept ? dept.name : staffForm.departmentName,
    };

    if (editingStaff) {
      updateStaff(editingStaff.id, payload);
      showToast(`Updated Staff Master: ${payload.firstName} ${payload.lastName} with [${payload.attendancePrivilege?.toUpperCase()}] attendance privilege.`);
    } else {
      addStaff(payload);
      showToast(`Added new staff member: ${payload.firstName} ${payload.lastName}`);
    }
    setStaffModalOpen(false);
  };

  // Handlers for Department
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      code: '',
      headOfDepartment: '',
      floorNumber: 1,
      bedCapacity: 20,
    });
    setDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      headOfDepartment: dept.headOfDepartment,
      floorNumber: dept.floorNumber,
      bedCapacity: dept.bedCapacity,
    });
    setDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      updateDepartment(editingDept.id, deptForm);
      showToast(`Updated Department: ${deptForm.name}`);
    } else {
      addDepartment(deptForm);
      showToast(`Added Department: ${deptForm.name}`);
    }
    setDeptModalOpen(false);
  };

  // Handlers for Ward
  const handleOpenAddWard = () => {
    setEditingWard(null);
    setWardForm({
      name: '',
      wardType: 'General',
      floor: 'Floor 1',
      chargePerDay: 1500,
      totalBeds: 10,
      occupiedBeds: 0,
    });
    setWardModalOpen(true);
  };

  const handleOpenEditWard = (w: Ward) => {
    setEditingWard(w);
    setWardForm({
      name: w.name,
      wardType: w.wardType,
      floor: w.floor,
      chargePerDay: w.chargePerDay,
      totalBeds: w.totalBeds,
      occupiedBeds: w.occupiedBeds,
    });
    setWardModalOpen(true);
  };

  const handleSaveWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWard) {
      updateWard(editingWard.id, wardForm);
      showToast(`Updated Ward: ${wardForm.name}`);
    } else {
      addWard(wardForm);
      showToast(`Added Ward: ${wardForm.name}`);
    }
    setWardModalOpen(false);
  };

  // Handlers for Bed
  const handleOpenAddBed = () => {
    setEditingBed(null);
    const ward = wards[0];
    setBedForm({
      bedNumber: '',
      wardId: ward?.id || '',
      wardName: ward?.name || '',
      status: 'available',
      dailyRate: ward?.chargePerDay || 1500,
    });
    setBedModalOpen(true);
  };

  const handleOpenEditBed = (b: Bed) => {
    setEditingBed(b);
    setBedForm({
      bedNumber: b.bedNumber,
      wardId: b.wardId,
      wardName: b.wardName,
      status: b.status,
      dailyRate: b.dailyRate,
    });
    setBedModalOpen(true);
  };

  const handleSaveBed = (e: React.FormEvent) => {
    e.preventDefault();
    const ward = wards.find((w) => w.id === bedForm.wardId);
    const payload = {
      ...bedForm,
      wardName: ward ? ward.name : bedForm.wardName,
    };

    if (editingBed) {
      updateBed(editingBed.id, payload);
      showToast(`Updated Bed: ${payload.bedNumber}`);
    } else {
      addBed(payload);
      showToast(`Added Bed: ${payload.bedNumber}`);
    }
    setBedModalOpen(false);
  };

  // Handlers for Pharmacy Medicine
  const handleOpenAddMed = () => {
    setEditingMed(null);
    const code = `MED-${String(pharmacyItems.length + 1).padStart(3, '0')}`;
    setMedForm({
      itemCode: code,
      name: '',
      genericName: '',
      category: 'Antibiotic',
      dosageForm: 'Tablet',
      batchNumber: `BTH-${new Date().getFullYear()}-01`,
      expiryDate: formatDate(new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()),
      hsnCode: '3004',
      stockQuantity: 100,
      reorderLevel: 30,
      unitPrice: 120,
      supplier: 'Sun Pharma Ltd',
    });
    setMedModalOpen(true);
  };

  const handleOpenEditMed = (m: PharmacyItem) => {
    setEditingMed(m);
    setMedForm({
      itemCode: m.itemCode,
      name: m.name,
      genericName: m.genericName,
      category: m.category,
      dosageForm: m.dosageForm,
      batchNumber: m.batchNumber,
      expiryDate: m.expiryDate,
      hsnCode: m.hsnCode || '3004',
      stockQuantity: m.stockQuantity,
      reorderLevel: m.reorderLevel,
      unitPrice: m.unitPrice,
      supplier: m.supplier,
    });
    setMedModalOpen(true);
  };

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      updatePharmacyItem(editingMed.id, medForm);
      showToast(`Updated Medicine Master: ${medForm.name}`);
    } else {
      addPharmacyItem(medForm);
      showToast(`Added Medicine Master: ${medForm.name}`);
    }
    setMedModalOpen(false);
  };

  // Handlers for Lab Test
  const handleOpenAddLab = () => {
    setEditingLab(null);
    const code = `LAB-${String(labTests.length + 101)}`;
    setLabForm({
      testCode: code,
      name: '',
      category: 'Biochemistry',
      specimenType: 'Blood',
      turnaroundHours: 3,
      price: 500,
      normalRange: 'Normal',
      unit: 'mg/dL',
    });
    setLabModalOpen(true);
  };

  const handleOpenEditLab = (t: LabTest) => {
    setEditingLab(t);
    setLabForm({
      testCode: t.testCode,
      name: t.name,
      category: t.category,
      specimenType: t.specimenType,
      turnaroundHours: t.turnaroundHours,
      price: t.price,
      normalRange: t.normalRange,
      unit: t.unit,
    });
    setLabModalOpen(true);
  };

  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLab) {
      updateLabTest(editingLab.id, labForm);
      showToast(`Updated Diagnostic Test: ${labForm.name}`);
    } else {
      addLabTest(labForm);
      showToast(`Added Diagnostic Test: ${labForm.name}`);
    }
    setLabModalOpen(false);
  };

  // Filtered staff list
  const filteredStaff = staff.filter((s) => {
    const privilege = s.attendancePrivilege || 'inside_only';
    const matchesPrivilege =
      staffPrivilegeFilter === 'all' || privilege === staffPrivilegeFilter;

    const matchesSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.departmentName && s.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesPrivilege && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Hospital Master Data Management & Administration
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              NABH & NABL Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure, manage and update core hospital entities: Staff roster & attendance premises privileges, clinical departments, ward bed tariffs, drug formulary, and diagnostic lab test catalogs.
          </p>
        </div>
      </div>

      {/* Main Master Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex flex-wrap gap-1">
        <button
          onClick={() => {
            setActiveTab('users');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Master Users & Access ({masterUsers?.length || 0})
        </button>

        <button
          onClick={() => {
            setActiveTab('staff');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'staff'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Directory ({staff.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('departments');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'departments'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Department Master ({departments.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('wards');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wards'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          Wards & Beds Master ({wards.length} Wards / {beds.length} Beds)
        </button>

        <button
          onClick={() => {
            setActiveTab('pharmacy');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pharmacy'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          Medicine Master / Formulary ({pharmacyItems.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('laboratory');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'laboratory'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Diagnostic Test Master ({labTests.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('hospital_profile');
            setSearchTerm('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hospital_profile'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          App Name & Hospital Profile
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: MASTER USERS & CHANNEL ACCESS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && <MasterUsersTab onShowToast={showToast} />}

      {/* ========================================================================= */}
      {/* TAB 6: HOSPITAL PROFILE & APP BRANDING */}
      {/* ========================================================================= */}
      {activeTab === 'hospital_profile' && <HospitalProfileTab onShowToast={showToast} />}

      {/* ========================================================================= */}
      {/* TAB 1: STAFF MASTER & ATTENDANCE GEOLOCATION PRIVILEGES */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Privilege Insight Banner */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sky-900">
                  Staff Attendance Premises Access Control
                </p>
                <p className="text-sky-700 mt-0.5">
                  Configure whether each staff member is restricted to <strong className="font-semibold">Inside Hospital Premises Only</strong> (Biometric / On-Campus WiFi) or permitted to mark attendance from <strong className="font-semibold">Outside Premises</strong> (Field Emergency, Remote Calls, Teleconsultation, or Both).
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenAddStaff}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors whitespace-nowrap flex items-center gap-1.5 self-start md:self-center"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Staff
            </button>
          </div>

          {/* Search & Privilege Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by Name, ID, or Designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Attendance Privilege:
              </span>
              {[
                { id: 'all', label: 'All Privileges' },
                { id: 'inside_only', label: '🏢 Inside Only' },
                { id: 'outside_only', label: '📍 Outside Only' },
                { id: 'both', label: '🌐 Both Allowed' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setStaffPrivilegeFilter(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    staffPrivilegeFilter === p.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member & ID</th>
                    <th className="py-3.5 px-4">Role & Department</th>
                    <th className="py-3.5 px-4">Designation & License</th>
                    <th className="py-3.5 px-4">Basic Pay (₹)</th>
                    <th className="py-3.5 px-4">Attendance Privilege</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((s) => {
                    const privilege = s.attendancePrivilege || 'inside_only';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                              {s.firstName[0]}
                              {s.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {s.firstName} {s.lastName}
                              </p>
                              <p className="text-[10px] font-mono text-slate-500">
                                {s.employeeId} • {s.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="capitalize font-semibold text-slate-800">
                            {s.role.replace('_', ' ')}
                          </span>
                          <p className="text-[10px] text-slate-500">{s.departmentName}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{s.designation}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {s.licenseNumber || 'N/A'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatCurrency(s.basicSalary)}
                        </td>

                        <td className="py-3.5 px-4">
                          {privilege === 'both' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                              Inside & Outside Allowed
                            </span>
                          ) : privilege === 'outside_only' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              <MapPin className="w-3 h-3 text-purple-600" />
                              Outside Premises Only
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Building2 className="w-3 h-3 text-emerald-600" />
                              Inside Premises Only
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={s.isActive ? 'success' : 'neutral'} size="sm">
                            {s.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEditStaff(s)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Update & Privileges
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEPARTMENT MASTER */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Hospital Clinical & Administration Departments
            </h2>
            <button
              onClick={handleOpenAddDept}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Add Department
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Department Name</th>
                  <th className="py-3.5 px-4">Head of Department (HOD)</th>
                  <th className="py-3.5 px-4">Floor</th>
                  <th className="py-3.5 px-4">Bed Capacity</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      {dept.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{dept.headOfDepartment}</td>
                    <td className="py-3.5 px-4">Floor {dept.floorNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {dept.bedCapacity} Beds
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEditDept(dept)}
                        className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WARDS & BEDS MASTER */}
      {/* ========================================================================= */}
      {activeTab === 'wards' && (
        <div className="space-y-6">
          {/* Wards Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-sky-600" />
                Hospital Inpatient Wards & Tariffs
              </h2>
              <button
                onClick={handleOpenAddWard}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Ward
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Ward Name</th>
                    <th className="py-3.5 px-4">Ward Type</th>
                    <th className="py-3.5 px-4">Floor</th>
                    <th className="py-3.5 px-4">Daily Charge Rate (₹)</th>
                    <th className="py-3.5 px-4">Total Beds</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wards.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{w.name}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="purple" size="sm">
                          {w.wardType}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{w.floor}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {formatCurrency(w.chargePerDay)} / day
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {w.totalBeds} Beds
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditWard(w)}
                          className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Beds Section */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Individual Inpatient Beds Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Manage bed numbers, assigned wards, and individual tariff rates.
                </p>
              </div>
              <button
                onClick={handleOpenAddBed}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Bed
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Bed Number</th>
                    <th className="py-3.5 px-4">Assigned Ward</th>
                    <th className="py-3.5 px-4">Daily Rate (₹)</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {beds.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {b.bedNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{b.wardName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {formatCurrency(b.dailyRate)} / day
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            b.status === 'available'
                              ? 'success'
                              : b.status === 'occupied'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditBed(b)}
                          className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MEDICINE MASTER / PHARMACY FORMULARY */}
      {/* ========================================================================= */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Hospital Pharmacy Formulary & Drug Master (HSN 3004)
              </h2>
              <p className="text-xs text-slate-500">
                Indian retail drug catalog with HSN codes, batch numbers, MRP rates, and reorder levels.
              </p>
            </div>
            <button
              onClick={handleOpenAddMed}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-center"
            >
              <PlusCircle className="w-4 h-4" /> Add Medication
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Drug Code & Name</th>
                    <th className="py-3.5 px-4">Generic Composition</th>
                    <th className="py-3.5 px-4">HSN Code</th>
                    <th className="py-3.5 px-4">Batch & Expiry</th>
                    <th className="py-3.5 px-4">Stock / Reorder</th>
                    <th className="py-3.5 px-4">Unit MRP (₹)</th>
                    <th className="py-3.5 px-4">Manufacturer</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pharmacyItems.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{med.itemCode}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {med.genericName}
                        <span className="text-[10px] text-slate-400 block">
                          {med.category} • {med.dosageForm}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        {med.hsnCode || '3004'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <span className="font-semibold text-slate-800">{med.batchNumber}</span>
                        <p className="text-[10px] text-slate-400">Exp: {med.expiryDate}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-extrabold ${
                            med.stockQuantity <= med.reorderLevel
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {med.stockQuantity}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Min: {med.reorderLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(med.unitPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">
                        {med.supplier}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditMed(med)}
                          className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DIAGNOSTIC TEST MASTER (LIS) */}
      {/* ========================================================================= */}
      {activeTab === 'laboratory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Diagnostic Laboratory Test Master & Pathology Catalog
              </h2>
              <p className="text-xs text-slate-500">
                NABL standard laboratory investigations, biological reference intervals, and tariffs.
              </p>
            </div>
            <button
              onClick={handleOpenAddLab}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-center"
            >
              <PlusCircle className="w-4 h-4" /> Add Test
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Test Code & Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Specimen Type</th>
                    <th className="py-3.5 px-4">Turnaround</th>
                    <th className="py-3.5 px-4">Biological Reference Range</th>
                    <th className="py-3.5 px-4">Test Tariff (₹)</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labTests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{t.testCode}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{t.category}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="purple" size="sm">
                          {t.specimenType}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{t.turnaroundHours} Hours</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {t.normalRange} {t.unit && `(${t.unit})`}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(t.price)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditLab(t)}
                          className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT STAFF MASTER (WITH ATTENDANCE PRIVILEGES) */}
      {/* ========================================================================= */}
      {staffModalOpen && (
        <Modal
          isOpen={staffModalOpen}
          onClose={() => setStaffModalOpen(false)}
          title={editingStaff ? `Update Staff: ${editingStaff.firstName} ${editingStaff.lastName}` : 'Add New Hospital Staff Member'}
          subtitle="Configure employee details, designation, Indian salary structure, and attendance premises privileges."
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={staffForm.employeeId}
                  onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh or Sister Anitha"
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 XXXXX"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical / ERP Role *</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold capitalize"
                >
                  <option value="doctor">Doctor / Consultant</option>
                  <option value="nurse">Nurse / Sister</option>
                  <option value="super_admin">Super Admin / Superintendent</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="receptionist">Front Desk Receptionist</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="lab_technician">Lab Pathologist</option>
                  <option value="accountant">Accountant / Cashier</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={staffForm.departmentId}
                  onChange={(e) => setStaffForm({ ...staffForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Designation *</label>
                <input
                  type="text"
                  required
                  value={staffForm.designation}
                  onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  License / Registration No (MCI / KMC / INC / PCI)
                </label>
                <input
                  type="text"
                  value={staffForm.licenseNumber}
                  onChange={(e) => setStaffForm({ ...staffForm, licenseNumber: e.target.value })}
                  placeholder="e.g. MCI-2004-94211"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Specialization / Qualification
                </label>
                <input
                  type="text"
                  value={staffForm.specialization}
                  onChange={(e) => setStaffForm({ ...staffForm, specialization: e.target.value })}
                  placeholder="e.g. DM Cardiology, MD Trauma, GNM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* DatePicker for Joining Date */}
              <div>
                <DatePicker
                  label="Joining Date (DD-MM-YYYY)"
                  required
                  value={staffForm.joiningDate}
                  onChange={(val) => setStaffForm({ ...staffForm, joiningDate: val })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Basic Monthly Pay (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={staffForm.basicSalary}
                  onChange={(e) => setStaffForm({ ...staffForm, basicSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duty Shift Timing *</label>
                <input
                  type="text"
                  value={staffForm.shiftTiming}
                  onChange={(e) => setStaffForm({ ...staffForm, shiftTiming: e.target.value })}
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* ATTENDANCE PREMISES PRIVILEGES CONFIGURATION */}
            <div className="p-4 bg-sky-50/70 border-2 border-sky-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-700" />
                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Attendance Premises & Geolocation Access Privileges *
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Controls whether this staff member can punch attendance strictly inside hospital premises or also outside premises.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* Option 1: Inside Premises Only */}
                <div
                  onClick={() => setStaffForm({ ...staffForm, attendancePrivilege: 'inside_only' })}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    staffForm.attendancePrivilege === 'inside_only'
                      ? 'border-emerald-500 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      Inside Premises Only
                    </span>
                    {staffForm.attendancePrivilege === 'inside_only' && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Restricted to hospital premises WiFi / Biometric gate. Cannot punch from outside.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Default for Nurses, Ward & Techs
                  </span>
                </div>

                {/* Option 2: Outside Premises Allowed */}
                <div
                  onClick={() => setStaffForm({ ...staffForm, attendancePrivilege: 'outside_only' })}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    staffForm.attendancePrivilege === 'outside_only'
                      ? 'border-purple-500 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      Outside Premises Only
                    </span>
                    {staffForm.attendancePrivilege === 'outside_only' && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Dedicated field staff, ambulance drivers, or off-campus mobile healthcare workers.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Field / Community Outreach
                  </span>
                </div>

                {/* Option 3: Both Inside & Outside */}
                <div
                  onClick={() => setStaffForm({ ...staffForm, attendancePrivilege: 'both' })}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    staffForm.attendancePrivilege === 'both'
                      ? 'border-sky-500 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-600" />
                      Both (Inside & Outside)
                    </span>
                    {staffForm.attendancePrivilege === 'both' && (
                      <Check className="w-4 h-4 text-sky-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Permitted to mark attendance either inside hospital campus or from remote emergency calls.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    Doctors, Directors & Emergency CMOs
                  </span>
                </div>
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={staffForm.isActive}
                  onChange={(e) => setStaffForm({ ...staffForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                Active Staff Member in Hospital Master
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingStaff ? 'Update Staff Master Record' : 'Create Staff Record'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT DEPARTMENT */}
      {/* ========================================================================= */}
      {deptModalOpen && (
        <Modal
          isOpen={deptModalOpen}
          onClose={() => setDeptModalOpen(false)}
          title={editingDept ? `Edit Department: ${editingDept.name}` : 'Add Clinical Department'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CARD, NEUR, ICU, EMER"
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiology & Cardiothoracic Surgery"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Sharma, MD, DM"
                value={deptForm.headOfDepartment}
                onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital Floor #</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={deptForm.floorNumber}
                  onChange={(e) => setDeptForm({ ...deptForm, floorNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bed Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={deptForm.bedCapacity}
                  onChange={(e) => setDeptForm({ ...deptForm, bedCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeptModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
              >
                Save Department
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT WARD */}
      {/* ========================================================================= */}
      {wardModalOpen && (
        <Modal
          isOpen={wardModalOpen}
          onClose={() => setWardModalOpen(false)}
          title={editingWard ? `Edit Ward: ${editingWard.name}` : 'Add Inpatient Ward'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveWard} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ward Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Critical Care ICU Wing B"
                value={wardForm.name}
                onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ward Type *</label>
                <select
                  value={wardForm.wardType}
                  onChange={(e) => setWardForm({ ...wardForm, wardType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="ICU">ICU</option>
                  <option value="Semi-Private">Semi-Private</option>
                  <option value="General">General</option>
                  <option value="Emergency">Emergency / Casualty</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Floor Location</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 2, Wing A"
                  value={wardForm.floor}
                  onChange={(e) => setWardForm({ ...wardForm, floor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Bed Charge (₹ INR) *</label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={wardForm.chargePerDay}
                onChange={(e) => setWardForm({ ...wardForm, chargePerDay: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWardModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
              >
                Save Ward
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT BED */}
      {/* ========================================================================= */}
      {bedModalOpen && (
        <Modal
          isOpen={bedModalOpen}
          onClose={() => setBedModalOpen(false)}
          title={editingBed ? `Edit Bed: ${editingBed.bedNumber}` : 'Add Inpatient Bed'}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveBed} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bed Number / Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. ICU-105 or GEN-303"
                value={bedForm.bedNumber}
                onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign to Ward *</label>
              <select
                value={bedForm.wardId}
                onChange={(e) => {
                  const w = wards.find((ward) => ward.id === e.target.value);
                  setBedForm({
                    ...bedForm,
                    wardId: e.target.value,
                    wardName: w ? w.name : '',
                    dailyRate: w ? w.chargePerDay : bedForm.dailyRate,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.chargePerDay)}/day)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Bed Rate (₹ INR) *</label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={bedForm.dailyRate}
                onChange={(e) => setBedForm({ ...bedForm, dailyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBedModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
              >
                Save Bed
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD / EDIT PHARMACY MEDICINE (WITH DATEPICKER) */}
      {/* ========================================================================= */}
      {medModalOpen && (
        <Modal
          isOpen={medModalOpen}
          onClose={() => setMedModalOpen(false)}
          title={editingMed ? `Edit Drug: ${editingMed.name}` : 'Add Medicine to Formulary Master'}
          subtitle="Indian Pharmaceutical standard with HSN code 3004 and expiry date."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveMed} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine Code *</label>
                <input
                  type="text"
                  required
                  value={medForm.itemCode}
                  onChange={(e) => setMedForm({ ...medForm, itemCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">HSN Code *</label>
                <input
                  type="text"
                  required
                  placeholder="3004"
                  value={medForm.hsnCode}
                  onChange={(e) => setMedForm({ ...medForm, hsnCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-sky-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Augmentin 625 Duo or Dolo 650"
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Generic Composition *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol IP 650mg"
                  value={medForm.genericName}
                  onChange={(e) => setMedForm({ ...medForm, genericName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={medForm.category}
                  onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Analgesic">Analgesic & Antipyretic</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Anticoagulant">Anticoagulant</option>
                  <option value="Respiratory">Respiratory</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosage Form *</label>
                <select
                  value={medForm.dosageForm}
                  onChange={(e) => setMedForm({ ...medForm, dosageForm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Pre-filled Syringe">Pre-filled Syringe</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={medForm.batchNumber}
                  onChange={(e) => setMedForm({ ...medForm, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* DatePicker for Expiry Date */}
              <div>
                <DatePicker
                  label="Expiry Date (DD-MM-YYYY)"
                  required
                  value={medForm.expiryDate}
                  onChange={(val) => setMedForm({ ...medForm, expiryDate: val })}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={medForm.stockQuantity}
                  onChange={(e) => setMedForm({ ...medForm, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reorder Level *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={medForm.reorderLevel}
                  onChange={(e) => setMedForm({ ...medForm, reorderLevel: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit MRP Rate (₹ INR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={medForm.unitPrice}
                  onChange={(e) => setMedForm({ ...medForm, unitPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Manufacturer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cipla Ltd, Sun Pharma, Zydus"
                  value={medForm.supplier}
                  onChange={(e) => setMedForm({ ...medForm, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMedModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
              >
                Save Medicine Master
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD / EDIT DIAGNOSTIC TEST (LIS) */}
      {/* ========================================================================= */}
      {labModalOpen && (
        <Modal
          isOpen={labModalOpen}
          onClose={() => setLabModalOpen(false)}
          title={editingLab ? `Edit Test: ${editingLab.name}` : 'Add Diagnostic Investigation'}
          subtitle="NABL standard pathology & radiology test catalog."
          maxWidth="md"
        >
          <form onSubmit={handleSaveLab} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Code *</label>
                <input
                  type="text"
                  required
                  value={labForm.testCode}
                  onChange={(e) => setLabForm({ ...labForm, testCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={labForm.category}
                  onChange={(e) => setLabForm({ ...labForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="Hematology">Hematology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Cardiology / Casualty">Cardiology / Casualty</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Test Investigation Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Blood Count (CBC) with ESR"
                value={labForm.name}
                onChange={(e) => setLabForm({ ...labForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specimen Analyzed *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Blood (EDTA) or Serum"
                  value={labForm.specimenType}
                  onChange={(e) => setLabForm({ ...labForm, specimenType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Turnaround Time (Hours)</label>
                <input
                  type="number"
                  min="1"
                  value={labForm.turnaroundHours}
                  onChange={(e) => setLabForm({ ...labForm, turnaroundHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Reference Range *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hb: 13.5-17.5 g/dL"
                  value={labForm.normalRange}
                  onChange={(e) => setLabForm({ ...labForm, normalRange: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  placeholder="e.g. mg/dL, g/dL, %"
                  value={labForm.unit}
                  onChange={(e) => setLabForm({ ...labForm, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Test Price (₹ INR) *</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={labForm.price}
                onChange={(e) => setLabForm({ ...labForm, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLabModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
              >
                Save Diagnostic Test
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
