import React, { useState, useMemo, useRef } from 'react';
import {
  Ticket,
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  Activity,
  Printer,
  Volume2,
  Stethoscope,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Calendar,
  Building2,
  PlusCircle,
  Phone,
  Maximize2,
  Minimize2,
  Filter,
  Sparkles,
  SkipForward,
  Play,
  ArrowRightLeft,
  X,
  HeartPulse,
  User,
  Check,
  Pill,
  FlaskConical,
  Trash2,
} from 'lucide-react';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import MuiBadge from '@mui/material/Badge';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  OpdToken,
  TokenStatus,
  TokenPriority,
  TokenVitals,
  Patient,
  Staff,
  PrescriptionItem,
} from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { generateMRN, formatDate, formatCurrency } from '../../lib/utils';

type TokenTab = 'inward' | 'queue' | 'display_board';

export const OpdTokensView: React.FC = () => {
  const {
    opdTokens,
    inwardOpdToken,
    updateOpdTokenStatus,
    updateOpdTokenVitals,
    transferOpdToken,
    patients,
    addPatient,
    staff,
    hospitalProfile,
    pharmacyItems,
    addPrescription,
    labTests,
    addLabOrder,
  } = useHospital();

  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TokenTab>('inward');

  // Search Patient for Inwarding
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Active Doctor Filter for Token-Wise Management
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals State
  const [isPrintTokenModalOpen, setIsPrintTokenModalOpen] = useState(false);
  const [tokenToPrint, setTokenToPrint] = useState<OpdToken | null>(null);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [tokenForVitals, setTokenForVitals] = useState<OpdToken | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [tokenForTransfer, setTokenForTransfer] = useState<OpdToken | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [tokenForComplete, setTokenForComplete] = useState<OpdToken | null>(null);

  // Fullscreen state for Display Board
  const [isFullscreen, setIsFullscreen] = useState(false);
  const displayBoardRef = useRef<HTMLDivElement>(null);

  // Success / Feedback Notification
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Get active hospital doctors
  const doctors = useMemo(() => {
    return staff.filter((s) => s.role === 'doctor' || s.designation.toLowerCase().includes('consultant') || s.designation.toLowerCase().includes('doctor'));
  }, [staff]);

  // Inward Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors[0]?.id || ''
  );
  const [roomNumber, setRoomNumber] = useState('OPD Chamber 101');
  const [tokenPriority, setTokenPriority] = useState<TokenPriority>('normal');
  const [visitReason, setVisitReason] = useState('General Consultation & Health Check');
  const [inwardVitals, setInwardVitals] = useState<TokenVitals>({
    bp: '120/80',
    pulse: 74,
    temp: '98.6 F',
    spo2: 99,
    weight: '65 kg',
  });

  // Quick Register Patient Form State (when search patient not found)
  const [quickPatientForm, setQuickPatientForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: 35,
    phone: '',
    bloodGroup: 'O+',
    address: 'Bengaluru, Karnataka',
  });

  // Complete Consultation Form State (with Prescriptions & Lab Tests)
  const [consultNotes, setConsultNotes] = useState('');
  const [consultDiagnosis, setConsultDiagnosis] = useState('');
  const [tokenRxItems, setTokenRxItems] = useState<PrescriptionItem[]>([]);
  const [tokenLabTests, setTokenLabTests] = useState<string[]>([]);
  const [tokenMedId, setTokenMedId] = useState('');
  const [tokenDosage, setTokenDosage] = useState('650mg');
  const [tokenFrequency, setTokenFrequency] = useState('1-0-1');
  const [tokenMealTiming, setTokenMealTiming] = useState<'After Food' | 'Before Food' | 'With Food' | 'Empty Stomach'>('After Food');
  const [tokenDurationDays, setTokenDurationDays] = useState(5);
  const [tokenQty, setTokenQty] = useState(10);
  const [tokenInstructions, setTokenInstructions] = useState('Take with warm water');

  // Helper to compute tablet quantity based on frequency and duration
  const calcTokenQty = (freq: string, days: number): number => {
    if (freq === '1-0-1') return Math.max(1, days * 2);
    if (freq === '1-1-1') return Math.max(1, days * 3);
    if (freq === '1-0-0' || freq === '0-0-1') return Math.max(1, days * 1);
    if (freq === '1-1-1-1') return Math.max(1, days * 4);
    if (freq === 'SOS') return 5;
    return Math.max(1, days * 2);
  };

  // Transfer Form State
  const [transferTargetDoctorId, setTransferTargetDoctorId] = useState('');
  const [transferTargetRoom, setTransferTargetRoom] = useState('');

  // Today's date string DD-MM-YYYY
  const todayStr = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${d.getFullYear()}`;
  }, []);

  // Filtered patients for search
  const searchedPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return [];
    const term = patientSearchTerm.trim().toLowerCase();
    return patients.filter(
      (p) =>
        p.phone.includes(term) ||
        p.mrn.toLowerCase().includes(term) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(term)
    );
  }, [patients, patientSearchTerm]);

  // Today's Tokens
  const todayTokens = useMemo(() => {
    return opdTokens.filter((t) => t.date === todayStr);
  }, [opdTokens, todayStr]);

  // Filtered Tokens for Queue view
  const filteredTokens = useMemo(() => {
    return todayTokens.filter((token) => {
      const matchDoctor =
        selectedDoctorFilter === 'all' || token.doctorId === selectedDoctorFilter;
      const matchStatus =
        statusFilter === 'all' || token.status === statusFilter;
      return matchDoctor && matchStatus;
    });
  }, [todayTokens, selectedDoctorFilter, statusFilter]);

  // Statistics
  const waitingCount = todayTokens.filter((t) => t.status === 'waiting').length;
  const inConsultCount = todayTokens.filter((t) => t.status === 'in_consultation').length;
  const completedCount = todayTokens.filter((t) => t.status === 'completed').length;
  const skippedCount = todayTokens.filter((t) => t.status === 'skipped').length;

  // Selected Doctor for Queue
  const currentDoctorObj = doctors.find((d) => d.id === selectedDoctorFilter);

  // Active Calling Token for Selected Doctor (or overall)
  const currentServingToken = useMemo(() => {
    if (selectedDoctorFilter !== 'all') {
      return (
        todayTokens.find(
          (t) => t.doctorId === selectedDoctorFilter && t.status === 'in_consultation'
        ) || null
      );
    }
    return todayTokens.find((t) => t.status === 'in_consultation') || null;
  }, [todayTokens, selectedDoctorFilter]);

  // ==========================================
  // Handlers
  // ==========================================

  // Inward token for an existing found patient
  const handleInwardExistingPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const assignedDoc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    const docName = assignedDoc
      ? assignedDoc.firstName.startsWith('Dr.')
        ? `${assignedDoc.firstName} ${assignedDoc.lastName}`
        : `Dr. ${assignedDoc.firstName} ${assignedDoc.lastName}`
      : 'Dr. Duty Medical Officer';

    const newToken = inwardOpdToken({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientMrn: selectedPatient.mrn,
      patientPhone: selectedPatient.phone,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      doctorId: assignedDoc?.id || 'staff-2',
      doctorName: docName,
      department: assignedDoc?.departmentName || 'General Medicine & OPD',
      roomNumber: roomNumber || 'OPD Chamber 101',
      priority: tokenPriority,
      reason: visitReason,
      vitals: inwardVitals,
      inwardedBy: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.designation || 'Front Desk'})`,
    });

    setTokenToPrint(newToken);
    setIsPrintTokenModalOpen(true);
    showNotification(
      `Token ${newToken.tokenDisplay} successfully inwarded for ${selectedPatient.firstName} ${selectedPatient.lastName}! Queue #${newToken.tokenNumber}.`,
      'success'
    );
    setFeedbackMessage(
      `Token ${newToken.tokenDisplay} successfully inwarded for ${selectedPatient.firstName} ${selectedPatient.lastName}! Queue Position: #${newToken.tokenNumber}.`
    );
    setTimeout(() => setFeedbackMessage(null), 5000);

    // Reset Search & Inward state
    setSelectedPatient(null);
    setPatientSearchTerm('');
  };

  // Quick Register and Inward (when search patient not found)
  const handleQuickRegisterAndInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPatientForm.firstName || !quickPatientForm.phone) {
      alert('Please provide patient First Name and Phone number.');
      return;
    }

    // 1. Create Patient
    const newPat = addPatient({
      mrn: generateMRN(),
      firstName: quickPatientForm.firstName,
      lastName: quickPatientForm.lastName || 'Walk-in',
      gender: quickPatientForm.gender,
      dob: `01-01-${new Date().getFullYear() - Number(quickPatientForm.age || 30)}`,
      age: Number(quickPatientForm.age || 30),
      phone: quickPatientForm.phone,
      email: `${quickPatientForm.firstName.toLowerCase()}.${Date.now().toString().slice(-4)}@easycare.in`,
      address: quickPatientForm.address,
      bloodGroup: quickPatientForm.bloodGroup,
      allergies: [],
      emergencyContactName: 'Relative / Attender',
      emergencyContactPhone: quickPatientForm.phone,
      insuranceProvider: 'Self Pay / Cashless Pending',
      insurancePolicyNumber: 'OPD-DIRECT',
    });

    // 2. Inward Token
    const assignedDoc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    const docName = assignedDoc
      ? assignedDoc.firstName.startsWith('Dr.')
        ? `${assignedDoc.firstName} ${assignedDoc.lastName}`
        : `Dr. ${assignedDoc.firstName} ${assignedDoc.lastName}`
      : 'Dr. Duty Medical Officer';

    const newToken = inwardOpdToken({
      patientId: newPat.id,
      patientName: `${newPat.firstName} ${newPat.lastName}`,
      patientMrn: newPat.mrn,
      patientPhone: newPat.phone,
      patientAge: newPat.age,
      patientGender: newPat.gender,
      doctorId: assignedDoc?.id || 'staff-2',
      doctorName: docName,
      department: assignedDoc?.departmentName || 'General Medicine & OPD',
      roomNumber: roomNumber || 'OPD Chamber 101',
      priority: tokenPriority,
      reason: visitReason,
      vitals: inwardVitals,
      inwardedBy: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.designation || 'Front Desk'})`,
    });

    setTokenToPrint(newToken);
    setIsPrintTokenModalOpen(true);
    showNotification(
      `New Patient ${newPat.firstName} registered (${newPat.mrn}) & Token ${newToken.tokenDisplay} inwarded!`,
      'success'
    );
    setFeedbackMessage(
      `New Patient ${newPat.firstName} registered (${newPat.mrn}) & Token ${newToken.tokenDisplay} inwarded!`
    );
    setTimeout(() => setFeedbackMessage(null), 5000);

    // Reset Form
    setPatientSearchTerm('');
    setQuickPatientForm({
      firstName: '',
      lastName: '',
      gender: 'Male',
      age: 35,
      phone: '',
      bloodGroup: 'O+',
      address: 'Bengaluru, Karnataka',
    });
  };

  // Doctor Token Action: Call Next Token
  const handleCallNextToken = (docId?: string) => {
    const targetDocId = docId || (selectedDoctorFilter !== 'all' ? selectedDoctorFilter : undefined);
    const nextWaiting = todayTokens.find((t) => {
      if (t.status !== 'waiting') return false;
      if (targetDocId && t.doctorId !== targetDocId) return false;
      return true;
    });

    if (!nextWaiting) {
      alert('No patients currently waiting in the queue for this doctor.');
      return;
    }

    updateOpdTokenStatus(nextWaiting.id, 'in_consultation');
    showNotification(
      `Called Token ${nextWaiting.tokenDisplay} (${nextWaiting.patientName}) to ${nextWaiting.roomNumber || 'Doctor Cabin'}!`,
      'info'
    );
    setFeedbackMessage(
      `Called Token ${nextWaiting.tokenDisplay} (${nextWaiting.patientName}) to ${nextWaiting.roomNumber || 'Doctor Cabin'}!`
    );
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Doctor Token Action: Complete
  const handleConfirmCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenForComplete) return;

    // 1. Dispatch Prescription to Pharmacy if medications were added
    if (tokenRxItems.length > 0) {
      const totalAmount = tokenRxItems.reduce((sum, item) => {
        const med = pharmacyItems.find((m) => m.id === item.pharmacyItemId);
        return sum + (med ? med.unitPrice * item.quantity : 0);
      }, 0);

      addPrescription({
        patientId: tokenForComplete.patientId,
        patientName: tokenForComplete.patientName,
        patientMrn: tokenForComplete.patientMrn,
        doctorId: tokenForComplete.doctorId || currentUser.id,
        doctorName: tokenForComplete.doctorName || currentUser.firstName,
        date: formatDate(new Date().toISOString()),
        diagnosis: consultDiagnosis || 'OPD Clinical Consultation',
        items: tokenRxItems,
        isDispensed: false,
        totalAmount,
      });
    }

    // 2. Dispatch Diagnostic Lab Orders if lab tests were selected
    if (tokenLabTests.length > 0) {
      tokenLabTests.forEach((testId) => {
        const test = labTests.find((t) => t.id === testId);
        if (test) {
          addLabOrder({
            patientId: tokenForComplete.patientId,
            patientName: tokenForComplete.patientName,
            patientMrn: tokenForComplete.patientMrn,
            doctorName: tokenForComplete.doctorName || currentUser.firstName,
            testId: test.id,
            testName: test.name,
            specimenType: test.specimenType,
            normalRange: test.normalRange,
            unit: test.unit,
            price: test.price,
          });
        }
      });
    }

    const fullNotes = consultDiagnosis
      ? `Diagnosis: ${consultDiagnosis}. Notes: ${consultNotes || 'Consultation complete.'}${
          tokenRxItems.length > 0 ? ` (Prescribed ${tokenRxItems.length} meds)` : ''
        }${tokenLabTests.length > 0 ? ` (${tokenLabTests.length} tests ordered)` : ''}`
      : consultNotes || 'OPD Consultation finished.';

    updateOpdTokenStatus(tokenForComplete.id, 'completed', fullNotes);
    setIsCompleteModalOpen(false);

    let summaryMsg = `Consultation completed for Token ${tokenForComplete.tokenDisplay} (${tokenForComplete.patientName}).`;
    if (tokenRxItems.length > 0) summaryMsg += ` Rx sent to Pharmacy Desk.`;
    if (tokenLabTests.length > 0) summaryMsg += ` Lab tests dispatched.`;

    setFeedbackMessage(summaryMsg);
    setTokenForComplete(null);
    setConsultDiagnosis('');
    setConsultNotes('');
    setTokenRxItems([]);
    setTokenLabTests([]);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Doctor Token Action: Skip
  const handleSkipToken = (token: OpdToken) => {
    updateOpdTokenStatus(token.id, 'skipped', 'Patient absent when called');
    setFeedbackMessage(`Token ${token.tokenDisplay} moved to Skipped list.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Doctor Token Action: Recall
  const handleRecallToken = (token: OpdToken) => {
    updateOpdTokenStatus(token.id, 'waiting', 'Recalled to active queue');
    setFeedbackMessage(`Token ${token.tokenDisplay} restored to Waiting queue.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Vitals Save
  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenForVitals) return;
    updateOpdTokenVitals(tokenForVitals.id, tokenForVitals.vitals || {});
    setIsVitalsModalOpen(false);
    setFeedbackMessage(`Vitals updated for Token ${tokenForVitals.tokenDisplay}`);
    setTokenForVitals(null);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Transfer Save
  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenForTransfer) return;
    const targetDoc = doctors.find((d) => d.id === transferTargetDoctorId);
    if (!targetDoc) return;

    const targetDocName = targetDoc.firstName.startsWith('Dr.')
      ? `${targetDoc.firstName} ${targetDoc.lastName}`
      : `Dr. ${targetDoc.firstName} ${targetDoc.lastName}`;

    transferOpdToken(
      tokenForTransfer.id,
      targetDoc.id,
      targetDocName,
      targetDoc.departmentName || 'Speciality OPD',
      transferTargetRoom || 'OPD Chamber 101'
    );

    setIsTransferModalOpen(false);
    setFeedbackMessage(
      `Token ${tokenForTransfer.tokenDisplay} transferred to ${targetDocName} (${transferTargetRoom || 'Chamber'})`
    );
    setTokenForTransfer(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Toggle Fullscreen on display board
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      displayBoardRef.current?.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Top Banner & Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Daily Outpatient (OPD) Patient Token System
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Daily Reset &bull; {todayStr}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Search & Inward Existing Patients &bull; 1-Click Quick Register &bull; Doctor Token-Wise Live Queue Management &bull; TV Queue Board
              </p>
            </div>
          </div>
        </div>

        {/* Material UI Interactive Tabs with Live Badges */}
        <div className="bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: '#0284c7',
              },
            }}
          >
            <Tab
              value="inward"
              icon={<UserPlus className="w-4 h-4" />}
              iconPosition="start"
              label="Search & Inward"
              sx={{ fontWeight: 700, fontSize: '0.78rem', minHeight: 40, textTransform: 'none' }}
            />
            <Tab
              value="queue"
              icon={<Stethoscope className="w-4 h-4" />}
              iconPosition="start"
              label={
                <div className="flex items-center gap-1.5">
                  <span>Doctor Console</span>
                  {waitingCount > 0 && (
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded-full">
                      {waitingCount}
                    </span>
                  )}
                </div>
              }
              sx={{ fontWeight: 700, fontSize: '0.78rem', minHeight: 40, textTransform: 'none' }}
            />
            <Tab
              value="display_board"
              icon={<Building2 className="w-4 h-4" />}
              iconPosition="start"
              label="Waiting TV Board"
              sx={{ fontWeight: 700, fontSize: '0.78rem', minHeight: 40, textTransform: 'none' }}
            />
          </Tabs>
        </div>
      </div>

      {/* Floating Alert / Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-sky-500 hover:text-sky-800 font-bold ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Daily Queue KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Tokens Today</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{todayTokens.length}</p>
          <span className="text-[10px] text-slate-500">Inwarded on {todayStr}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-500">Waiting in Queue</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{waitingCount}</p>
          <span className="text-[10px] text-slate-500">In waiting room</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-sky-500">In Consultation</span>
          <p className="text-xl font-extrabold text-sky-600 mt-1">{inConsultCount}</p>
          <span className="text-[10px] text-slate-500">Inside doctor cabin</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-500">Consulted & Done</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[10px] text-slate-500">Rx / tests issued</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-500">Skipped / Absent</span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{skippedCount}</p>
          <span className="text-[10px] text-slate-500">Can be recalled</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SEARCH & INWARD TOKEN                                 */}
      {/* ============================================================ */}
      {activeTab === 'inward' && (
        <div className="space-y-6">
          {/* Patient Search Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-sky-600" />
              Step 1: Search Patient by Phone Number, MRN/UHID, or Full Name
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              If patient is found in the hospital records, select and inward token. If not found, you can quick-register and issue a token instantly below.
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Type patient phone (e.g. 98451), MRN (e.g. MRN-2026-1001), or name (e.g. Rahul)..."
                value={patientSearchTerm}
                onChange={(e) => {
                  setPatientSearchTerm(e.target.value);
                  if (selectedPatient) setSelectedPatient(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
              {patientSearchTerm && (
                <button
                  onClick={() => {
                    setPatientSearchTerm('');
                    setSelectedPatient(null);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search Results List (if search term entered) */}
            {patientSearchTerm.trim() && (
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {searchedPatients.length > 0 ? (
                  <>
                    <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase flex items-center justify-between">
                      <span>Found {searchedPatients.length} Existing Patient(s)</span>
                      <span className="text-sky-600">Click to Select Patient</span>
                    </div>
                    {searchedPatients.map((pat) => (
                      <div
                        key={pat.id}
                        onClick={() => setSelectedPatient(pat)}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                          selectedPatient?.id === pat.id
                            ? 'bg-sky-50/80 border-l-4 border-l-sky-600'
                            : 'hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                            {pat.firstName[0]}
                            {pat.lastName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {pat.firstName} {pat.lastName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                                {pat.mrn}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {pat.gender}, {pat.age} yrs &bull; Blood: {pat.bloodGroup}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {pat.phone}
                              </span>
                              <span>{pat.address}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(pat);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            selectedPatient?.id === pat.id
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800'
                          }`}
                        >
                          {selectedPatient?.id === pat.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Selected
                            </>
                          ) : (
                            'Select Patient'
                          )}
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  /* Patient Not Found Banner */
                  <div className="p-4 bg-amber-50/80 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-xs">
                          No registered patient found matching &ldquo;{patientSearchTerm}&rdquo;
                        </span>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Use the Quick Registration form below to create this patient and issue their token in 1 click!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Condition 1: Patient Found & Selected -> Inward Token Form */}
          {selectedPatient && (
            <div className="bg-white p-5 rounded-2xl border-2 border-sky-400 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Step 2: Inward OPD Token for {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      MRN: <strong className="text-slate-700 font-mono">{selectedPatient.mrn}</strong> &bull; Phone: {selectedPatient.phone} &bull; Age/Sex: {selectedPatient.age}y/{selectedPatient.gender}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Change Patient
                </button>
              </div>

              <form onSubmit={handleInwardExistingPatient} className="space-y-4 text-xs font-medium">
                {/* Doctor & Room & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Consulting Doctor & Speciality *
                    </label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => {
                        setSelectedDoctorId(e.target.value);
                        const doc = doctors.find((d) => d.id === e.target.value);
                        if (doc?.departmentName?.includes('Cardiology')) setRoomNumber('OPD Chamber 101');
                        else if (doc?.departmentName?.includes('Emergency')) setRoomNumber('OPD Chamber 204');
                        else setRoomNumber('OPD Chamber 302');
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                    >
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.firstName.startsWith('Dr.') ? `${doc.firstName} ${doc.lastName}` : `Dr. ${doc.firstName} ${doc.lastName}`} ({doc.departmentName || doc.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">OPD Chamber / Room</label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Queue Priority</label>
                    <select
                      value={tokenPriority}
                      onChange={(e) => setTokenPriority(e.target.value as TokenPriority)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="normal">Normal Walk-in</option>
                      <option value="senior_citizen">Senior Citizen / Geriatric (Fast-track)</option>
                      <option value="emergency">Emergency / Acute Triage</option>
                      <option value="follow_up">Follow-up / Report Review</option>
                    </select>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Chief Complaint / Reason for Visit
                  </label>
                  <input
                    type="text"
                    required
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    placeholder="e.g. Fever for 3 days, chest heaviness, routine BP check..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Preliminary Vitals Strip */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-sky-600" />
                    Preliminary Reception Vitals (Optional)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div>
                      <span className="block text-[10px] text-slate-500">Blood Pressure</span>
                      <input
                        type="text"
                        placeholder="120/80"
                        value={inwardVitals.bp}
                        onChange={(e) => setInwardVitals({ ...inwardVitals, bp: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Pulse (BPM)</span>
                      <input
                        type="number"
                        placeholder="72"
                        value={inwardVitals.pulse}
                        onChange={(e) => setInwardVitals({ ...inwardVitals, pulse: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Temperature</span>
                      <input
                        type="text"
                        placeholder="98.6 F"
                        value={inwardVitals.temp}
                        onChange={(e) => setInwardVitals({ ...inwardVitals, temp: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">SpO2 (%)</span>
                      <input
                        type="number"
                        placeholder="99"
                        value={inwardVitals.spo2}
                        onChange={(e) => setInwardVitals({ ...inwardVitals, spo2: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Weight</span>
                      <input
                        type="text"
                        placeholder="65 kg"
                        value={inwardVitals.weight}
                        onChange={(e) => setInwardVitals({ ...inwardVitals, weight: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
                  >
                    <Ticket className="w-4 h-4" />
                    Generate & Inward OPD Token
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Condition 2: Patient Not Found (or no patient selected) -> Quick Create & Inward */}
          {(!selectedPatient || (patientSearchTerm.trim() && searchedPatients.length === 0)) && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {patientSearchTerm.trim() && searchedPatients.length === 0
                      ? 'Patient Not Found: Quick Register & Inward Token in 1 Step'
                      : 'Or Quick Register New Patient & Issue Token'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Creates new patient record with automatic MRN and instantly assigns today's OPD token.
                  </p>
                </div>
              </div>

              <form onSubmit={handleQuickRegisterAndInward} className="space-y-4 text-xs font-medium">
                {/* Patient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh"
                      value={quickPatientForm.firstName}
                      onChange={(e) => setQuickPatientForm({ ...quickPatientForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kumar"
                      value={quickPatientForm.lastName}
                      onChange={(e) => setQuickPatientForm({ ...quickPatientForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={quickPatientForm.phone || (patientSearchTerm && /^\d+$/.test(patientSearchTerm) ? patientSearchTerm : '')}
                      onChange={(e) => setQuickPatientForm({ ...quickPatientForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gender & Age</label>
                    <div className="flex gap-2">
                      <select
                        value={quickPatientForm.gender}
                        onChange={(e) => setQuickPatientForm({ ...quickPatientForm, gender: e.target.value as any })}
                        className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        placeholder="Age"
                        value={quickPatientForm.age}
                        onChange={(e) => setQuickPatientForm({ ...quickPatientForm, age: Number(e.target.value) })}
                        className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Blood Group</label>
                    <select
                      value={quickPatientForm.bloodGroup}
                      onChange={(e) => setQuickPatientForm({ ...quickPatientForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="O+">O Positive (O+)</option>
                      <option value="A+">A Positive (A+)</option>
                      <option value="B+">B Positive (B+)</option>
                      <option value="AB+">AB Positive (AB+)</option>
                      <option value="O-">O Negative (O-)</option>
                      <option value="A-">A Negative (A-)</option>
                      <option value="B-">B Negative (B-)</option>
                      <option value="AB-">AB Negative (AB-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Residential Address / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar, Bengaluru"
                      value={quickPatientForm.address}
                      onChange={(e) => setQuickPatientForm({ ...quickPatientForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Token Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Assigned Doctor *</label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
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
                    <label className="block text-slate-700 font-semibold mb-1">Chamber / Room</label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                    <select
                      value={tokenPriority}
                      onChange={(e) => setTokenPriority(e.target.value as TokenPriority)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="normal">Normal Walk-in</option>
                      <option value="senior_citizen">Senior Citizen / Geriatric</option>
                      <option value="emergency">Emergency / Acute Triage</option>
                      <option value="follow_up">Follow-up</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    required
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    placeholder="Chief complaints or symptoms..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register Patient & Issue OPD Token (1-Click)
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: DOCTOR TOKEN-WISE QUEUE & CONSOLE                     */}
      {/* ============================================================ */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Doctor Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                Select Doctor:
              </span>
              <button
                onClick={() => setSelectedDoctorFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDoctorFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Doctors ({todayTokens.length})
              </button>

              {doctors.map((doc) => {
                const docTokenCount = todayTokens.filter((t) => t.doctorId === doc.id).length;
                const docWaitingCount = todayTokens.filter(
                  (t) => t.doctorId === doc.id && t.status === 'waiting'
                ).length;

                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctorFilter(doc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selectedDoctorFilter === doc.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{doc.firstName.startsWith('Dr.') ? `${doc.firstName} ${doc.lastName}` : `Dr. ${doc.firstName} ${doc.lastName}`}</span>
                    {docWaitingCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        selectedDoctorFilter === doc.id ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {docWaitingCount} wait
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="contained"
                color="success"
                onClick={() => handleCallNextToken()}
                startIcon={<Volume2 className="w-4 h-4" />}
                sx={{
                  py: 0.9,
                  px: 2.2,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  boxShadow: '0 4px 12px 0 rgba(5, 150, 105, 0.25)',
                  textTransform: 'none',
                  backgroundColor: '#059669',
                  '&:hover': { backgroundColor: '#047857' },
                }}
              >
                Call Next Token
              </Button>
            </div>
          </div>

          {/* Currently In Cabin Banner */}
          {currentServingToken ? (
            <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex flex-col items-center justify-center font-mono">
                  <span className="text-[10px] uppercase font-bold text-sky-300">SERVING</span>
                  <span className="text-xl font-extrabold text-white">{currentServingToken.tokenDisplay}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-white">
                      {currentServingToken.patientName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/30 text-sky-200 font-mono">
                      {currentServingToken.patientMrn}
                    </span>
                    <span className="text-xs text-sky-200">
                      ({currentServingToken.patientGender}, {currentServingToken.patientAge}y)
                    </span>
                  </div>
                  <p className="text-xs text-sky-200 mt-0.5">
                    Consulting with: <strong className="text-white">{currentServingToken.doctorName}</strong> &bull; {currentServingToken.roomNumber || 'Chamber'}
                  </p>
                  <p className="text-xs text-slate-300 italic mt-1">&ldquo;{currentServingToken.reason}&rdquo;</p>
                  {currentServingToken.vitals && (
                    <div className="flex items-center gap-3 text-[11px] text-sky-300 mt-2 font-mono">
                      <span>BP: {currentServingToken.vitals.bp || '—'}</span>
                      <span>Pulse: {currentServingToken.vitals.pulse || '—'}</span>
                      <span>Temp: {currentServingToken.vitals.temp || '—'}</span>
                      <span>SpO2: {currentServingToken.vitals.spo2 || '—'}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setTokenForComplete(currentServingToken);
                    setIsCompleteModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Consultation
                </button>

                <button
                  onClick={() => handleSkipToken(currentServingToken)}
                  className="px-3 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Patient not present, skip and call next"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-slate-500 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>No patient currently marked &ldquo;In Consultation&rdquo; for this view.</span>
              </div>
              <button
                onClick={() => handleCallNextToken()}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs"
              >
                Call Next Patient from Queue
              </button>
            </div>
          )}

          {/* Status Filter Pill Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['all', 'waiting', 'in_consultation', 'completed', 'skipped'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Showing {filteredTokens.length} token(s)
            </span>
          </div>

          {/* Token Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Name & MRN</th>
                  <th className="py-3 px-4">Doctor & Chamber</th>
                  <th className="py-3 px-4">Time & Priority</th>
                  <th className="py-3 px-4">Reason / Symptoms</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Doctor Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No tokens found for the selected doctor or status filter today.
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((token) => (
                    <tr key={token.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                          {token.tokenDisplay}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{token.patientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {token.patientMrn} &bull; {token.patientGender}, {token.patientAge}y &bull; {token.patientPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{token.doctorName}</div>
                        <div className="text-[10px] text-slate-500">
                          {token.department} &bull; <strong className="text-slate-700">{token.roomNumber || 'Room 101'}</strong>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 block">{token.time}</span>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded capitalize mt-0.5 ${
                          token.priority === 'emergency'
                            ? 'bg-rose-100 text-rose-800'
                            : token.priority === 'senior_citizen'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {token.priority.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-700" title={token.reason}>
                        <span>{token.reason}</span>
                        {token.vitals && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            BP: {token.vitals.bp || '—'} &bull; Pulse: {token.vitals.pulse || '—'} &bull; SpO2: {token.vitals.spo2 || '—'}%
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            token.status === 'in_consultation'
                              ? 'info'
                              : token.status === 'completed'
                              ? 'success'
                              : token.status === 'skipped'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {token.status.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If waiting -> Call Patient */}
                          {token.status === 'waiting' && (
                            <button
                              onClick={() => {
                                updateOpdTokenStatus(token.id, 'in_consultation');
                                setFeedbackMessage(`Called ${token.tokenDisplay} (${token.patientName})`);
                                setTimeout(() => setFeedbackMessage(null), 3000);
                              }}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                              title="Call patient to consultation room"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Call In
                            </button>
                          )}

                          {/* If in_consultation -> Complete */}
                          {token.status === 'in_consultation' && (
                            <button
                              onClick={() => {
                                setTokenForComplete(token);
                                setIsCompleteModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                              title="Mark consultation completed"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Complete
                            </button>
                          )}

                          {/* If waiting or in_consultation -> Skip */}
                          {(token.status === 'waiting' || token.status === 'in_consultation') && (
                            <button
                              onClick={() => handleSkipToken(token)}
                              className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                              title="Skip patient / not present"
                            >
                              Skip
                            </button>
                          )}

                          {/* If skipped -> Recall */}
                          {token.status === 'skipped' && (
                            <button
                              onClick={() => handleRecallToken(token)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Recall skipped patient back to active queue"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Recall
                            </button>
                          )}

                          {/* Update Vitals */}
                          <button
                            onClick={() => {
                              setTokenForVitals(token);
                              setIsVitalsModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Update Vitals"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>

                          {/* Transfer Doctor */}
                          <button
                            onClick={() => {
                              setTokenForTransfer(token);
                              setTransferTargetDoctorId(doctors[0]?.id || '');
                              setTransferTargetRoom(token.roomNumber || 'Room 101');
                              setIsTransferModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Transfer to another doctor / room"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Slip */}
                          <button
                            onClick={() => {
                              setTokenToPrint(token);
                              setIsPrintTokenModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Print Token Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WAITING HALL TV / QUEUE DISPLAY BOARD                 */}
      {/* ============================================================ */}
      {activeTab === 'display_board' && (
        <div
          ref={displayBoardRef}
          className={`space-y-6 ${
            isFullscreen ? 'bg-slate-950 text-white p-8 overflow-y-auto' : ''
          }`}
        >
          {/* TV Display Header */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {hospitalProfile.appName} - OPD Live Queue Display Board
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time Patient Token Call Display & Waiting Hall Queue &bull; {todayStr}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono hidden sm:block">
                <div className="text-base font-bold text-sky-400">
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] text-slate-400">Easy Care OPD</div>
              </div>

              <button
                onClick={toggleFullscreen}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen TV Mode'}
              </button>
            </div>
          </div>

          {/* Active Chambers Grid (Now Serving) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => {
              const activeDocToken = todayTokens.find(
                (t) => t.doctorId === doc.id && t.status === 'in_consultation'
              );
              const nextDocTokens = todayTokens
                .filter((t) => t.doctorId === doc.id && t.status === 'waiting')
                .slice(0, 3);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {doc.firstName.startsWith('Dr.') ? `${doc.firstName} ${doc.lastName}` : `Dr. ${doc.firstName} ${doc.lastName}`}
                      </h4>
                      <span className="text-[11px] text-sky-300 font-semibold">{doc.departmentName}</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      Chamber 10{doc.id.slice(-1) || '1'}
                    </span>
                  </div>

                  {/* Big Number Serving Box */}
                  <div className="p-6 text-center border-b border-slate-100 bg-sky-50/50 flex-1 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      NOW SERVING TOKEN
                    </span>
                    {activeDocToken ? (
                      <div className="space-y-1 animate-pulse">
                        <div className="text-4xl font-extrabold font-mono text-emerald-600">
                          {activeDocToken.tokenDisplay}
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {activeDocToken.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Inside Cabin &bull; Call Time: {activeDocToken.calledAt || activeDocToken.time}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 py-3">
                        <span className="text-2xl font-mono block font-bold text-slate-300">--</span>
                        <span className="text-xs">Chamber Waiting for Next Patient</span>
                      </div>
                    )}
                  </div>

                  {/* Upcoming Tokens in Chamber */}
                  <div className="p-3 bg-slate-50 text-xs">
                    <span className="font-bold text-slate-600 text-[10px] uppercase block mb-1.5">
                      Next Up in Queue ({nextDocTokens.length} waiting):
                    </span>
                    {nextDocTokens.length > 0 ? (
                      <div className="space-y-1">
                        {nextDocTokens.map((nextT, idx) => (
                          <div
                            key={nextT.id}
                            className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200"
                          >
                            <span className="font-mono font-bold text-slate-800">
                              #{idx + 1} &bull; {nextT.tokenDisplay}
                            </span>
                            <span className="text-slate-600 truncate max-w-[140px]">
                              {nextT.patientName}
                            </span>
                            <span className="text-[10px] text-slate-400">{nextT.time}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No pending queue.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PRINTABLE OPD TOKEN SLIP                             */}
      {/* ============================================================ */}
      {isPrintTokenModalOpen && tokenToPrint && (
        <Modal
          isOpen={isPrintTokenModalOpen}
          onClose={() => setIsPrintTokenModalOpen(false)}
          title="OPD Consultation Token Slip"
          subtitle={`Issued on ${tokenToPrint.date} at ${tokenToPrint.time}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-medium">
            {/* Printable Slip Container */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white space-y-4 text-center">
              {/* Slip Header */}
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">
                  {hospitalProfile.hospitalName || 'Easy Care Super-Speciality Hospital'}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {hospitalProfile.tagline || 'Excellence in Patient Care & Clinical Service'} &bull; Phone: {hospitalProfile.phone || '+91 80 4455 0000'}
                </p>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                  OUTPATIENT CONSULTATION TOKEN SLIP
                </div>
              </div>

              {/* Huge Token Display */}
              <div className="py-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">YOUR TOKEN NUMBER</span>
                <div className="text-5xl font-black font-mono text-sky-600 my-1">
                  {tokenToPrint.tokenDisplay}
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  Queue Position Today: #{tokenToPrint.tokenNumber}
                </span>
              </div>

              {/* Patient & Doctor Table */}
              <div className="border-t border-b border-slate-200 py-3 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-900">{tokenToPrint.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MRN / UHID:</span>
                  <span className="font-mono font-bold text-slate-800">{tokenToPrint.patientMrn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Age / Gender:</span>
                  <span className="font-semibold text-slate-800">{tokenToPrint.patientAge} Yrs / {tokenToPrint.patientGender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{tokenToPrint.patientPhone}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between">
                  <span className="text-slate-500">Doctor Assigned:</span>
                  <span className="font-bold text-indigo-700">{tokenToPrint.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">OPD Chamber / Room:</span>
                  <span className="font-bold text-slate-900">{tokenToPrint.roomNumber || 'Room 101'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-700">{tokenToPrint.department}</span>
                </div>
                {tokenToPrint.vitals && (
                  <div className="border-t border-slate-100 pt-1 text-[11px] text-slate-600 flex justify-between">
                    <span>Recorded Vitals:</span>
                    <span className="font-mono">BP {tokenToPrint.vitals.bp || '—'} &bull; Pulse {tokenToPrint.vitals.pulse || '—'} &bull; Temp {tokenToPrint.vitals.temp || '—'}</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p>&bull; Please wait comfortably in the designated waiting hall.</p>
                <p>&bull; Watch the live display screen for your token call number.</p>
                <p>&bull; Inwarded By: {tokenToPrint.inwardedBy} at {tokenToPrint.time}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print Token Thermal Slip
              </button>

              <button
                type="button"
                onClick={() => setIsPrintTokenModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Done / Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: COMPLETE CONSULTATION (DOCTOR)                       */}
      {/* ============================================================ */}
      {isCompleteModalOpen && tokenForComplete && (
        <Modal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          title={`Complete Consultation - Token ${tokenForComplete.tokenDisplay}`}
          subtitle={`Patient: ${tokenForComplete.patientName} • Doctor: ${tokenForComplete.doctorName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmCompleteConsultation} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Bronchitis, Essential Hypertension..."
                  value={consultDiagnosis}
                  onChange={(e) => setConsultDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Doctor Consultation Notes</label>
                <input
                  type="text"
                  placeholder="Advice, findings, follow-up..."
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Prescribe Medications Section (Tablets with 1-0-1 and Before/After Food) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" /> Prescribe Tablets (Will Route to Pharmacy Desk)
                </span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {tokenRxItems.length} tablets added
                </span>
              </div>

              {/* Drug Row Form */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Medicine / Tablet</label>
                  <select
                    value={tokenMedId}
                    onChange={(e) => {
                      setTokenMedId(e.target.value);
                      const m = pharmacyItems.find((x) => x.id === e.target.value);
                      if (m) {
                        if (m.name.toLowerCase().includes('dolo') || m.name.toLowerCase().includes('paracetamol')) {
                          setTokenDosage('650mg');
                          setTokenFrequency('1-0-1');
                          setTokenMealTiming('After Food');
                          setTokenInstructions('Take after food for fever or pain');
                        } else if (m.name.toLowerCase().includes('panto')) {
                          setTokenDosage('40mg');
                          setTokenFrequency('1-0-0');
                          setTokenMealTiming('Before Food');
                          setTokenInstructions('Take early morning before food');
                        }
                      }
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- Choose Tablet / Drug --</option>
                    {pharmacyItems.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} (MRP: {formatCurrency(med.unitPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Frequency</label>
                  <select
                    value={tokenFrequency}
                    onChange={(e) => {
                      setTokenFrequency(e.target.value);
                      setTokenQty(calcTokenQty(e.target.value, tokenDurationDays));
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  >
                    <option value="1-0-1">1-0-1 (Morning & Night)</option>
                    <option value="1-1-1">1-1-1 (Thrice a day)</option>
                    <option value="1-0-0">1-0-0 (Morning only)</option>
                    <option value="0-0-1">0-0-1 (Night only)</option>
                    <option value="1-1-1-1">1-1-1-1 (4 times daily)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Meal Timing</label>
                  <select
                    value={tokenMealTiming}
                    onChange={(e) => setTokenMealTiming(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-teal-800"
                  >
                    <option value="After Food">After Food (Post Cibum)</option>
                    <option value="Before Food">Before Food (Ante Cibum)</option>
                    <option value="With Food">With Food</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tokenDurationDays}
                    onChange={(e) => {
                      const d = Number(e.target.value) || 1;
                      setTokenDurationDays(d);
                      setTokenQty(calcTokenQty(tokenFrequency, d));
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Total Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={tokenQty}
                    onChange={(e) => setTokenQty(Number(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-extrabold text-teal-800"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Take with warm water"
                    value={tokenInstructions}
                    onChange={(e) => setTokenInstructions(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    disabled={!tokenMedId}
                    onClick={() => {
                      const med = pharmacyItems.find((m) => m.id === tokenMedId);
                      if (!med) return;
                      const newItem: PrescriptionItem = {
                        pharmacyItemId: med.id,
                        medicineName: med.name,
                        dosage: tokenDosage,
                        frequency: tokenFrequency,
                        mealTiming: tokenMealTiming,
                        durationDays: tokenDurationDays,
                        quantity: tokenQty,
                        instructions: tokenInstructions,
                      };
                      setTokenRxItems([...tokenRxItems, newItem]);
                      setTokenMedId('');
                    }}
                    className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Table of added medicines */}
              {tokenRxItems.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="py-1.5 px-2.5">Medicine</th>
                        <th className="py-1.5 px-2.5">Schedule</th>
                        <th className="py-1.5 px-2.5">Timing</th>
                        <th className="py-1.5 px-2.5">Qty</th>
                        <th className="py-1.5 px-2.5 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tokenRxItems.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800">{it.medicineName} ({it.dosage})</td>
                          <td className="py-1.5 px-2.5 font-mono text-teal-800 font-bold">{it.frequency}</td>
                          <td className="py-1.5 px-2.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              it.mealTiming === 'Before Food'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {it.mealTiming || 'After Food'}
                            </span>
                          </td>
                          <td className="py-1.5 px-2.5 font-bold">{it.quantity}</td>
                          <td className="py-1.5 px-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setTokenRxItems(tokenRxItems.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Diagnostic Lab Tests Picker */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-sky-600" /> Order Diagnostic Pathology / Radiology Tests
                </span>
                <span className="text-[10px] text-sky-700 font-bold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                  {tokenLabTests.length} tests selected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {labTests.slice(0, 8).map((t) => {
                  const isChecked = tokenLabTests.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setTokenLabTests(tokenLabTests.filter((id) => id !== t.id));
                        } else {
                          setTokenLabTests([...tokenLabTests, t.id]);
                        }
                      }}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isChecked
                          ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="font-bold text-[11px] truncate">{t.name}</div>
                      <div className="text-[10px] text-slate-400">{formatCurrency(t.price)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                Will forward prescriptions to <strong>Pharmacy Desk</strong> & orders to <strong>Lab</strong>.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finish & Route to Pharmacy
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: UPDATE VITALS                                         */}
      {/* ============================================================ */}
      {isVitalsModalOpen && tokenForVitals && (
        <Modal
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          title={`Update Vitals for Token ${tokenForVitals.tokenDisplay}`}
          subtitle={`Patient: ${tokenForVitals.patientName} (${tokenForVitals.patientMrn})`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveVitals} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Blood Pressure (BP)</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={tokenForVitals.vitals?.bp || ''}
                  onChange={(e) =>
                    setTokenForVitals({
                      ...tokenForVitals,
                      vitals: { ...tokenForVitals.vitals, bp: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pulse Rate (BPM)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={tokenForVitals.vitals?.pulse || ''}
                  onChange={(e) =>
                    setTokenForVitals({
                      ...tokenForVitals,
                      vitals: { ...tokenForVitals.vitals, pulse: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Temperature</label>
                <input
                  type="text"
                  placeholder="98.6 F"
                  value={tokenForVitals.vitals?.temp || ''}
                  onChange={(e) =>
                    setTokenForVitals({
                      ...tokenForVitals,
                      vitals: { ...tokenForVitals.vitals, temp: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Oxygen Saturation (SpO2 %)</label>
                <input
                  type="number"
                  placeholder="99"
                  value={tokenForVitals.vitals?.spo2 || ''}
                  onChange={(e) =>
                    setTokenForVitals({
                      ...tokenForVitals,
                      vitals: { ...tokenForVitals.vitals, spo2: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Weight</label>
                <input
                  type="text"
                  placeholder="e.g. 68 kg"
                  value={tokenForVitals.vitals?.weight || ''}
                  onChange={(e) =>
                    setTokenForVitals({
                      ...tokenForVitals,
                      vitals: { ...tokenForVitals.vitals, weight: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsVitalsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs"
              >
                Save Vitals
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: TRANSFER TOKEN TO ANOTHER DOCTOR                     */}
      {/* ============================================================ */}
      {isTransferModalOpen && tokenForTransfer && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title={`Transfer Token ${tokenForTransfer.tokenDisplay}`}
          subtitle={`Current: ${tokenForTransfer.doctorName} &bull; Patient: ${tokenForTransfer.patientName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveTransfer} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Transfer to Doctor *</label>
              <select
                value={transferTargetDoctorId}
                onChange={(e) => {
                  setTransferTargetDoctorId(e.target.value);
                  const doc = doctors.find((d) => d.id === e.target.value);
                  if (doc?.departmentName?.includes('Cardiology')) setTransferTargetRoom('OPD Chamber 101');
                  else if (doc?.departmentName?.includes('Emergency')) setTransferTargetRoom('OPD Chamber 204');
                  else setTransferTargetRoom('OPD Chamber 302');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.firstName.startsWith('Dr.') ? `${doc.firstName} ${doc.lastName}` : `Dr. ${doc.firstName} ${doc.lastName}`} ({doc.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Chamber / Room</label>
              <input
                type="text"
                required
                value={transferTargetRoom}
                onChange={(e) => setTransferTargetRoom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Confirm Transfer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
