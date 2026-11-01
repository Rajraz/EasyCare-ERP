import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  FileText,
  Activity,
  Heart,
  Shield,
  Phone,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
  Ticket,
} from 'lucide-react';
import {
  Button as MuiButton,
  Chip as MuiChip,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { useHospital } from '../../context/HospitalContext';
import { useNotification } from '../../context/NotificationContext';
import { Patient } from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { DatePicker } from '../common/DatePicker';
import { generateMRN, formatDate } from '../../lib/utils';

export const PatientsView: React.FC = () => {
  const { patients, addPatient, prescriptions, labOrders, beds, inwardOpdToken, staff } = useHospital();
  const { showNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeEmrPatient, setActiveEmrPatient] = useState<Patient | null>(null);
  const [tokenPatientTarget, setTokenPatientTarget] = useState<Patient | null>(null);
  const [issueDoctorId, setIssueDoctorId] = useState('');
  const [issueReason, setIssueReason] = useState('General Consultation & Health Check');
  const [tokenFeedback, setTokenFeedback] = useState<string | null>(null);

  const doctors = React.useMemo(() => {
    return staff.filter((s) => s.role === 'doctor' || s.designation.toLowerCase().includes('consultant') || s.designation.toLowerCase().includes('doctor'));
  }, [staff]);

  // New Patient Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '15-06-1988',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceProvider: 'Star Health & Allied Insurance',
    insurancePolicyNumber: '',
  });

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);

    const matchesBlood =
      selectedBloodGroup === 'all' || p.bloodGroup === selectedBloodGroup;

    return matchesSearch && matchesBlood;
  });

  const handleIssueTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenPatientTarget) return;

    const assignedDoc = doctors.find((d) => d.id === issueDoctorId) || doctors[0];
    const docName = assignedDoc
      ? assignedDoc.firstName.startsWith('Dr.')
        ? `${assignedDoc.firstName} ${assignedDoc.lastName}`
        : `Dr. ${assignedDoc.firstName} ${assignedDoc.lastName}`
      : 'Dr. Duty Medical Officer';

    const tok = inwardOpdToken({
      patientId: tokenPatientTarget.id,
      patientName: `${tokenPatientTarget.firstName} ${tokenPatientTarget.lastName}`,
      patientMrn: tokenPatientTarget.mrn,
      patientPhone: tokenPatientTarget.phone,
      patientAge: tokenPatientTarget.age,
      patientGender: tokenPatientTarget.gender,
      doctorId: assignedDoc?.id || 'staff-2',
      doctorName: docName,
      department: assignedDoc?.departmentName || 'General OPD',
      roomNumber: assignedDoc?.departmentName?.includes('Cardiology') ? 'OPD Chamber 101' : 'OPD Chamber 204',
      priority: 'normal',
      reason: issueReason,
      inwardedBy: 'Front Desk Receptionist',
    });

    setTokenPatientTarget(null);
    showNotification(`OPD Token ${tok.tokenDisplay} inwarded for ${tokenPatientTarget.firstName}! Queue position #${tok.tokenNumber}.`, 'success');
    setTokenFeedback(`OPD Token ${tok.tokenDisplay} successfully inwarded for ${tokenPatientTarget.firstName}! Queue position #${tok.tokenNumber}.`);
    setTimeout(() => setTokenFeedback(null), 5000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('Please fill in required fields: First Name, Last Name, Phone Number');
      return;
    }

    let age = 35;
    if (formData.dob.includes('-')) {
      const parts = formData.dob.split('-');
      const year = parts[0].length === 4 ? Number(parts[0]) : Number(parts[2]);
      if (!isNaN(year)) {
        age = Math.max(1, new Date().getFullYear() - year);
      }
    }

    const newPat = addPatient({
      mrn: generateMRN(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      dob: formatDate(formData.dob),
      age,
      phone: formData.phone,
      email: formData.email,
      address: formData.address || '#12, Residency Road, Bengaluru, Karnataka',
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      insuranceProvider: formData.insuranceProvider,
      insurancePolicyNumber: formData.insurancePolicyNumber || 'INS-PENDING',
    });

    setIsRegisterModalOpen(false);
    setActiveEmrPatient(newPat);
    showNotification(`Patient ${newPat.firstName} ${newPat.lastName} registered! Assigned MRN: ${newPat.mrn}`, 'success');
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      dob: '15-06-1988',
      phone: '',
      email: '',
      address: '',
      bloodGroup: 'O+',
      allergies: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      insuranceProvider: 'Star Health & Allied Insurance',
      insurancePolicyNumber: '',
    });
  };

  // Find related patient clinical records
  const patientPrescriptions = activeEmrPatient
    ? prescriptions.filter((p) => p.patientId === activeEmrPatient.id || p.patientMrn === activeEmrPatient.mrn)
    : [];

  const patientLabOrders = activeEmrPatient
    ? labOrders.filter((l) => l.patientId === activeEmrPatient.id || l.patientMrn === activeEmrPatient.mrn)
    : [];

  const patientBed = activeEmrPatient
    ? beds.find((b) => b.currentPatientId === activeEmrPatient.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Patient Records & Electronic Health Records (EHR / EMR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Indian Medical Record System: ABHA/MRN records, PMJAY/TPA insurance coverage, vitals & allergies.
          </p>
        </div>

        <MuiButton
          variant="contained"
          onClick={() => setIsRegisterModalOpen(true)}
          sx={{
            bgcolor: '#0284c7',
            '&:hover': { bgcolor: '#0369a1' },
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            borderRadius: '0.75rem',
            py: 1,
            px: 2.5,
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
          }}
          startIcon={<UserPlus className="w-4 h-4" />}
        >
          Register New Patient
        </MuiButton>
      </div>

      {tokenFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{tokenFeedback}</span>
          </div>
          <button onClick={() => setTokenFeedback(null)} className="text-emerald-500 hover:text-emerald-800 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient Name, MRN (e.g. MRN-2026-1001), or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1">Blood Group:</span>
          {['all', 'A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((bg) => (
            <MuiChip
              key={bg}
              label={bg === 'all' ? 'All' : bg}
              clickable
              color={selectedBloodGroup === bg ? 'primary' : 'default'}
              variant={selectedBloodGroup === bg ? 'filled' : 'outlined'}
              size="small"
              onClick={() => setSelectedBloodGroup(bg)}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                ...(selectedBloodGroup === bg
                  ? { bgcolor: '#0284c7', color: '#fff' }
                  : { bgcolor: '#f8fafc', color: '#475569' }),
              }}
            />
          ))}
          <span className="text-xs text-slate-400 pl-2">
            ({filteredPatients.length})
          </span>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">MRN & Patient Name</th>
                <th className="py-3.5 px-4">Gender / Age</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Contact (+91)</th>
                <th className="py-3.5 px-4">TPA / PMJAY Scheme</th>
                <th className="py-3.5 px-4">Allergies</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const isAdmitted = beds.some((b) => b.currentPatientId === patient.id);

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0">
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-sm">
                              {patient.firstName} {patient.lastName}
                            </span>
                            {isAdmitted && (
                              <Badge variant="danger" size="sm">
                                Admitted
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">
                            {patient.mrn}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span>{patient.gender}</span>, <span className="font-medium">{patient.age} yrs</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="purple" size="sm">
                        {patient.bloodGroup}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium">{patient.phone}</span>
                      <p className="text-[10px] text-slate-400">{patient.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{patient.insuranceProvider}</span>
                      <p className="text-[10px] font-mono text-slate-400">
                        {patient.insurancePolicyNumber}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((alg, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">NKDA (None)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <MuiTooltip title="Inward Daily OPD Token for Consultation Queue" arrow>
                          <MuiButton
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setTokenPatientTarget(patient);
                              setIssueDoctorId(doctors[0]?.id || '');
                            }}
                            sx={{
                              color: '#059669',
                              borderColor: '#a7f3d0',
                              bgcolor: '#ecfdf5',
                              '&:hover': { bgcolor: '#d1fae5', borderColor: '#6ee7b7' },
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '0.5rem',
                              py: 0.5,
                              px: 1.5,
                            }}
                            startIcon={<Ticket className="w-3.5 h-3.5" />}
                          >
                            Issue Token
                          </MuiButton>
                        </MuiTooltip>

                        <MuiTooltip title="Open Electronic Medical Record (EMR) & Clinical History" arrow>
                          <MuiButton
                            size="small"
                            variant="outlined"
                            onClick={() => setActiveEmrPatient(patient)}
                            sx={{
                              color: '#0284c7',
                              borderColor: '#bae6fd',
                              bgcolor: '#f0f9ff',
                              '&:hover': { bgcolor: '#e0f2fe', borderColor: '#7dd3fc' },
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '0.5rem',
                              py: 0.5,
                              px: 1.5,
                            }}
                            startIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View EMR
                          </MuiButton>
                        </MuiTooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Hospital Patient"
        subtitle="Generates unique Medical Record Number (MRN) and initializes electronic record."
        maxWidth="2xl"
      >
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Ramesh"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Sharma"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <DatePicker
              label="Date of Birth (DD-MM-YYYY)"
              required
              value={formData.dob}
              onChange={(val) => setFormData({ ...formData, dob: val })}
            />
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number (+91) *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98450 00000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Residential Address (India)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. #42, Koramangala 5th Block, Bengaluru, Karnataka"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Known Drug Allergies
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Comma separated: Penicillin, Sulfa, Aspirin"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Name & Relationship (e.g. Meera Sharma - Spouse)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Insurance / PMJAY Scheme</label>
              <select
                value={formData.insuranceProvider}
                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Star Health & Allied Insurance">Star Health & Allied Insurance</option>
                <option value="Ayushman Bharat - PMJAY (Govt of India)">Ayushman Bharat - PMJAY (Govt of India)</option>
                <option value="Medi Assist TPA (Corporate Cashless)">Medi Assist TPA (Corporate Cashless)</option>
                <option value="HDFC ERGO Health Suraksha">HDFC ERGO Health Suraksha</option>
                <option value="CGHS (Central Govt Health Scheme)">CGHS (Central Govt Health Scheme)</option>
                <option value="Cash / Self-Pay">Cash / Self-Pay</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Policy / PMJAY Card #</label>
              <input
                type="text"
                value={formData.insurancePolicyNumber}
                onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                placeholder="e.g. SH-88912-KA or PMJAY-1092"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <MuiButton
              type="button"
              variant="outlined"
              onClick={() => setIsRegisterModalOpen(false)}
              sx={{
                textTransform: 'none',
                borderColor: '#cbd5e1',
                color: '#475569',
                borderRadius: '0.5rem',
                fontWeight: 600,
              }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              type="submit"
              variant="contained"
              sx={{
                textTransform: 'none',
                bgcolor: '#0284c7',
                '&:hover': { bgcolor: '#0369a1' },
                borderRadius: '0.5rem',
                fontWeight: 700,
              }}
            >
              Complete Registration & Issue MRN
            </MuiButton>
          </div>
        </form>
      </Modal>

      {/* Comprehensive Patient EMR Record Modal */}
      {activeEmrPatient && (
        <Modal
          isOpen={Boolean(activeEmrPatient)}
          onClose={() => setActiveEmrPatient(null)}
          title={`Electronic Medical Record (EMR): ${activeEmrPatient.firstName} ${activeEmrPatient.lastName}`}
          subtitle={`Hospital MRN: ${activeEmrPatient.mrn} | Registered on ${formatDate(activeEmrPatient.registeredDate)}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Top Patient Profile Header Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Demographics</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {activeEmrPatient.gender}, {activeEmrPatient.age} yrs
                </p>
                <p className="text-slate-500 text-[11px]">DOB: {formatDate(activeEmrPatient.dob)}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Blood Group</p>
                <p className="font-bold text-rose-700 text-sm mt-0.5">{activeEmrPatient.bloodGroup}</p>
                <p className="text-slate-500 text-[11px]">Rh Factor Verified</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Inpatient Status</p>
                {patientBed ? (
                  <div>
                    <span className="font-bold text-rose-600 text-xs">Bed {patientBed.bedNumber}</span>
                    <p className="text-slate-500 text-[10px]">{patientBed.wardName}</p>
                  </div>
                ) : (
                  <span className="font-semibold text-emerald-600">Outpatient (OPD)</span>
                )}
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">TPA / Insurance</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">
                  {activeEmrPatient.insuranceProvider}
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  {activeEmrPatient.insurancePolicyNumber}
                </p>
              </div>
            </div>

            {/* Allergies Alert */}
            {activeEmrPatient.allergies.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold">Medical Alert - Documented Allergies: </span>
                  <span className="font-semibold">{activeEmrPatient.allergies.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Prescriptions History */}
            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Active Clinical Prescriptions ({patientPrescriptions.length})
              </h3>
              {patientPrescriptions.length > 0 ? (
                <div className="space-y-2">
                  {patientPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{rx.diagnosis}</span>
                          <span className="text-slate-400 text-[11px] ml-2">by {rx.doctorName}</span>
                        </div>
                        <Badge variant={rx.isDispensed ? 'success' : 'warning'} size="sm">
                          {rx.isDispensed ? 'Dispensed' : 'Pending Pharmacy'}
                        </Badge>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg space-y-1">
                        {rx.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700">
                              • {item.medicineName} ({item.dosage})
                            </span>
                            <span className="text-slate-500">
                              {item.frequency} for {item.durationDays} days (Qty: {item.quantity})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic bg-slate-50 p-3 rounded-lg">
                  No active prescriptions logged for this patient.
                </p>
              )}
            </div>

            {/* Diagnostic Lab Tests */}
            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                Laboratory & Diagnostic Investigations ({patientLabOrders.length})
              </h3>
              {patientLabOrders.length > 0 ? (
                <div className="space-y-2">
                  {patientLabOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{ord.testName}</span>
                          {ord.isAbnormal && (
                            <Badge variant="danger" size="sm">
                              Abnormal High
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Sample: {ord.specimenType} | Ordered on {formatDate(ord.orderDate)}
                        </p>
                        {ord.resultValue && (
                          <p className="text-xs font-bold text-sky-800 mt-1">
                            Result: {ord.resultValue} {ord.unit} (Ref: {ord.normalRange})
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          ord.status === 'verified'
                            ? 'success'
                            : ord.status === 'processing'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {ord.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic bg-slate-50 p-3 rounded-lg">
                  No diagnostic lab orders logged for this patient.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Issue OPD Token Modal */}
      {tokenPatientTarget && (
        <Modal
          isOpen={!!tokenPatientTarget}
          onClose={() => setTokenPatientTarget(null)}
          title={`Issue OPD Token - ${tokenPatientTarget.firstName} ${tokenPatientTarget.lastName}`}
          subtitle={`MRN: ${tokenPatientTarget.mrn} • Phone: ${tokenPatientTarget.phone}`}
          maxWidth="md"
        >
          <form onSubmit={handleIssueTokenSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Consulting Doctor *</label>
              <select
                value={issueDoctorId}
                onChange={(e) => setIssueDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.firstName.startsWith('Dr.') ? `${doc.firstName} ${doc.lastName}` : `Dr. ${doc.firstName} ${doc.lastName}`} ({doc.departmentName || doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason for OPD Visit / Symptoms</label>
              <input
                type="text"
                required
                value={issueReason}
                onChange={(e) => setIssueReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <MuiButton
                type="button"
                variant="outlined"
                onClick={() => setTokenPatientTarget(null)}
                sx={{
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Cancel
              </MuiButton>
              <MuiButton
                type="submit"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  bgcolor: '#059669',
                  '&:hover': { bgcolor: '#047857' },
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                }}
                startIcon={<Ticket className="w-4 h-4" />}
              >
                Generate & Inward Token
              </MuiButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
