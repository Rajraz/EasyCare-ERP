import React, { useState } from 'react';
import {
  Stethoscope,
  Clock,
  User,
  HeartPulse,
  Pill,
  FlaskConical,
  CheckCircle,
  PlusCircle,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Trash2,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment, PrescriptionItem } from '../../types/hospital';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../lib/utils';

export const DoctorView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    opdTokens,
    updateOpdTokenStatus,
    pharmacyItems,
    addPrescription,
    labTests,
    addLabOrder,
    patients,
  } = useHospital();
  const { currentUser } = useAuth();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(
    appointments[0] || null
  );

  // Consultation state
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescribedItems, setPrescribedItems] = useState<PrescriptionItem[]>([]);
  const [selectedLabTestIds, setSelectedLabTestIds] = useState<string[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastDispatchedInfo, setLastDispatchedInfo] = useState<{
    patientName: string;
    itemCount: number;
    totalAmount: number;
    testCount: number;
  } | null>(null);

  // New Rx row state
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dosage, setDosage] = useState('650mg');
  const [frequency, setFrequency] = useState<'1-0-1' | '1-1-1' | '1-0-0' | '0-0-1' | '1-1-1-1' | 'SOS' | string>('1-0-1');
  const [mealTiming, setMealTiming] = useState<'After Food' | 'Before Food' | 'With Food' | 'Empty Stomach'>('After Food');
  const [durationDays, setDurationDays] = useState(5);
  const [quantity, setQuantity] = useState(10);
  const [instructions, setInstructions] = useState('Take with a full glass of water');

  // Auto-calculate quantity helper
  const computeQuantity = (freq: string, days: number): number => {
    if (freq === '1-0-1') return Math.max(1, days * 2);
    if (freq === '1-1-1') return Math.max(1, days * 3);
    if (freq === '1-0-0' || freq === '0-0-1') return Math.max(1, days * 1);
    if (freq === '1-1-1-1') return Math.max(1, days * 4);
    if (freq === 'SOS') return 5;
    return Math.max(1, days * 2);
  };

  const handleFrequencyChange = (newFreq: string) => {
    setFrequency(newFreq);
    setQuantity(computeQuantity(newFreq, durationDays));
  };

  const handleDurationChange = (days: number) => {
    setDurationDays(days);
    setQuantity(computeQuantity(frequency, days));
  };

  // Popular fast-click medicine templates
  const quickMedList = [
    { label: 'Paracetamol 650mg', nameSearch: 'Dolo 650mg', dosage: '650mg', freq: '1-0-1', timing: 'After Food' as const, days: 5, instructions: 'Take 1 tablet after food for fever or body ache' },
    { label: 'Augmentin 625 Duo', nameSearch: 'Augmentin', dosage: '625mg', freq: '1-0-1', timing: 'After Food' as const, days: 5, instructions: 'Complete full 5-day antibiotic course after meals' },
    { label: 'Pantoprazole 40mg', nameSearch: 'Pantocid', dosage: '40mg', freq: '1-0-0', timing: 'Before Food' as const, days: 7, instructions: 'Take early morning on empty stomach before food' },
    { label: 'Glycomet 500 SR', nameSearch: 'Glycomet', dosage: '500mg', freq: '1-0-1', timing: 'With Food' as const, days: 15, instructions: 'Take with main breakfast & dinner' },
    { label: 'Telma 40mg', nameSearch: 'Telma', dosage: '40mg', freq: '1-0-0', timing: 'Before Food' as const, days: 30, instructions: 'Take in morning before breakfast without fail' },
    { label: 'Atorva 20mg', nameSearch: 'Atorva', dosage: '20mg', freq: '0-0-1', timing: 'After Food' as const, days: 30, instructions: 'Take at bedtime after dinner' }
  ];

  const applyQuickDrug = (item: typeof quickMedList[0]) => {
    const matched = pharmacyItems.find(
      (m) =>
        m.name.toLowerCase().includes(item.nameSearch.toLowerCase()) ||
        m.genericName.toLowerCase().includes(item.nameSearch.toLowerCase())
    );
    if (matched) {
      setSelectedMedId(matched.id);
    }
    setDosage(item.dosage);
    setFrequency(item.freq);
    setMealTiming(item.timing);
    setDurationDays(item.days);
    setQuantity(computeQuantity(item.freq, item.days));
    setInstructions(item.instructions);
  };

  const handleAddMedication = () => {
    const med = pharmacyItems.find((m) => m.id === selectedMedId);
    if (!med) return;

    const newItem: PrescriptionItem = {
      pharmacyItemId: med.id,
      medicineName: med.name,
      dosage,
      frequency,
      mealTiming,
      durationDays: Number(durationDays),
      quantity: Number(quantity) || computeQuantity(frequency, durationDays),
      instructions,
    };

    setPrescribedItems([...prescribedItems, newItem]);
    setSelectedMedId('');
    setInstructions('Take with a full glass of water');
  };

  const handleToggleLabTest = (testId: string) => {
    if (selectedLabTestIds.includes(testId)) {
      setSelectedLabTestIds(selectedLabTestIds.filter((id) => id !== testId));
    } else {
      setSelectedLabTestIds([...selectedLabTestIds, testId]);
    }
  };

  const handleCompleteConsultation = () => {
    if (!selectedAppointment) return;

    const doctorFullName = currentUser.firstName.startsWith('Dr.')
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : `Dr. ${currentUser.firstName} ${currentUser.lastName}`;

    let totalAmount = 0;
    // 1. Dispatch Prescription if medications added
    if (prescribedItems.length > 0) {
      totalAmount = prescribedItems.reduce((sum, item) => {
        const med = pharmacyItems.find((m) => m.id === item.pharmacyItemId);
        return sum + (med ? med.unitPrice * item.quantity : 0);
      }, 0);

      addPrescription({
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        patientMrn: selectedAppointment.patientMrn,
        doctorId: currentUser.id,
        doctorName: doctorFullName,
        date: formatDate(new Date().toISOString()),
        diagnosis: diagnosis || 'Clinical Consultation',
        items: prescribedItems,
        isDispensed: false,
        totalAmount,
      });
    }

    // 2. Dispatch Lab Orders if tests selected
    selectedLabTestIds.forEach((testId) => {
      const test = labTests.find((t) => t.id === testId);
      if (test) {
        addLabOrder({
          patientId: selectedAppointment.patientId,
          patientName: selectedAppointment.patientName,
          patientMrn: selectedAppointment.patientMrn,
          doctorName: doctorFullName,
          testId: test.id,
          testName: test.name,
          specimenType: test.specimenType,
          normalRange: test.normalRange,
          unit: test.unit,
          price: test.price,
        });
      }
    });

    // 3. Mark appointment and OPD Token as completed
    updateAppointmentStatus(
      selectedAppointment.id,
      'completed',
      clinicalNotes ? `${diagnosis ? diagnosis + ' - ' : ''}${clinicalNotes}` : undefined
    );

    const matchedToken = opdTokens.find(
      (t) =>
        t.id === selectedAppointment.id.replace('apt-tok-', '') ||
        (t.patientId === selectedAppointment.patientId && t.tokenNumber === selectedAppointment.tokenNumber)
    );
    if (matchedToken) {
      updateOpdTokenStatus(
        matchedToken.id,
        'completed',
        clinicalNotes ? `${diagnosis ? diagnosis + ' - ' : ''}${clinicalNotes}` : diagnosis || undefined
      );
    }

    setLastDispatchedInfo({
      patientName: selectedAppointment.patientName,
      itemCount: prescribedItems.length,
      totalAmount,
      testCount: selectedLabTestIds.length,
    });
    setIsSuccessModalOpen(true);
  };

  // Find detailed patient
  const currentPatient = selectedAppointment
    ? patients.find((p) => p.id === selectedAppointment.patientId)
    : null;

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-sky-600" />
            Doctor Consultation Desk & Outpatient Clinic (OPD)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Consultant: <span className="font-semibold text-slate-700">{currentUser.firstName.startsWith('Dr.') ? `${currentUser.firstName} ${currentUser.lastName}` : `Dr. ${currentUser.firstName} ${currentUser.lastName}`}</span> ({currentUser.specialization || 'Clinical Specialist'})
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="info">
            OPD Queue: {appointments.filter((a) => a.status !== 'completed').length} Waiting
          </Badge>
          <Badge variant="success">
            {appointments.filter((a) => a.status === 'completed').length} Completed
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's OPD Token Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs uppercase text-slate-600">Today's Token Queue</span>
            <span className="text-xs text-slate-400 font-mono">Room 304</span>
          </div>

          <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
            {appointments.map((apt) => {
              const isSelected = selectedAppointment?.id === apt.id;

              return (
                <div
                  key={apt.id}
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setDiagnosis(apt.doctorNotes || '');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                      Token #{apt.tokenNumber}
                    </span>
                    <Badge
                      variant={
                        apt.status === 'in_consultation'
                          ? 'danger'
                          : apt.status === 'checked_in'
                          ? 'warning'
                          : apt.status === 'completed'
                          ? 'success'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {apt.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="font-bold text-slate-900 text-sm mt-2">{apt.patientName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{apt.patientMrn}</p>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-1 italic">
                    "{apt.reason}"
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Slot: {apt.timeSlot}</span>
                    <span className="text-sky-600 font-semibold">Select Patient &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Consultation Desk */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAppointment ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Header: Selected Patient Info & Vitals */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedAppointment.patientName}
                      </h2>
                      <span className="font-mono text-xs text-slate-500 font-semibold">
                        ({selectedAppointment.patientMrn})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chief Complaint: <span className="font-semibold text-slate-800">{selectedAppointment.reason}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    {selectedAppointment.status !== 'in_consultation' && selectedAppointment.status !== 'completed' && (
                      <button
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, 'in_consultation');
                          const matchedToken = opdTokens.find(
                            (t) =>
                              t.id === selectedAppointment.id.replace('apt-tok-', '') ||
                              (t.patientId === selectedAppointment.patientId && t.tokenNumber === selectedAppointment.tokenNumber)
                          );
                          if (matchedToken) {
                            updateOpdTokenStatus(matchedToken.id, 'in_consultation');
                          }
                          setSelectedAppointment({ ...selectedAppointment, status: 'in_consultation' });
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        Call to Cabin
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                      Token #{selectedAppointment.tokenNumber} • {selectedAppointment.timeSlot}
                    </span>
                  </div>
                </div>

                {/* Patient Vitals Ticker */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {selectedAppointment.vitals?.bp || '120/80'} mmHg
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate / Pulse</span>
                    <p className="font-extrabold text-rose-600 mt-0.5">
                      {selectedAppointment.vitals?.pulse || 74} bpm
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Body Temp</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {selectedAppointment.vitals?.temp || '98.6 F'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Oxygen (SpO2)</span>
                    <p className="font-extrabold text-emerald-600 mt-0.5">
                      {selectedAppointment.vitals?.spo2 || 99}%
                    </p>
                  </div>
                </div>

                {/* Documented Allergies */}
                {currentPatient && currentPatient.allergies.length > 0 && (
                  <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong className="font-bold">Drug Allergies:</strong> {currentPatient.allergies.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Clinical Assessment & Diagnosis Input */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Clinical Diagnosis & Examination Findings
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute Bronchitis, Essential Hypertension (ICD-10: I10)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-semibold"
                />
                <textarea
                  rows={2}
                  placeholder="Enter detailed clinical examination observations, dietary recommendations, or follow-up instructions..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Digital E-Prescription Desk */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-teal-600" />
                      Prescribe Medication (Hospital Formulary)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Configure tablet frequency (e.g. 1-0-1), meal timings, and automatic quantity calculation.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                    {prescribedItems.length} items prescribed
                  </span>
                </div>

                {/* Quick 1-Click Fast Presets */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Quick Drug Templates (1-Click Fill):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickMedList.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyQuickDrug(q)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-semibold transition-all flex items-center gap-1 hover:text-teal-800"
                      >
                        <Pill className="w-3 h-3 text-teal-600" />
                        <span>{q.label}</span>
                        <span className="text-[9px] font-mono text-slate-400">({q.freq})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Medicine Configuration Panel */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                  {/* Row 1: Drug & Dosage */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Select Drug / Tablet *
                      </label>
                      <select
                        value={selectedMedId}
                        onChange={(e) => setSelectedMedId(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
                      >
                        <option value="">-- Choose Medicine from Formulary --</option>
                        {pharmacyItems.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} ({med.genericName}) - MRP {formatCurrency(med.unitPrice)} [Stock: {med.stockQuantity}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Dosage / Strength *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 650mg, 500mg, 40mg"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Row 2: Frequency Selector (1-0-1, 1-1-1, etc.) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Frequency (Tablets Daily Schedule) *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Selected: <strong className="text-teal-700">{frequency}</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {[
                        { code: '1-0-1', label: '1-0-1 (M-N)', desc: 'Twice daily' },
                        { code: '1-1-1', label: '1-1-1 (M-A-N)', desc: 'Thrice daily' },
                        { code: '1-0-0', label: '1-0-0 (Morning)', desc: 'Once daily' },
                        { code: '0-0-1', label: '0-0-1 (Night)', desc: 'Bedtime only' },
                        { code: '1-1-1-1', label: '1-1-1-1', desc: '4 times daily' },
                        { code: 'SOS', label: 'SOS', desc: 'When needed' },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleFrequencyChange(item.code)}
                          className={`py-1.5 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                            frequency === item.code
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <div>{item.label}</div>
                          <div className={`text-[9px] font-normal ${frequency === item.code ? 'text-teal-100' : 'text-slate-400'}`}>
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 3: Meal Timing (Before Food vs After Food) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Meal Timing (Food Relationship) *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Selected: <strong className="text-teal-700">{mealTiming}</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'After Food', label: 'After Food (PC)', hint: 'Post Cibum / After meals', color: 'emerald' },
                        { id: 'Before Food', label: 'Before Food (AC)', hint: 'Ante Cibum / 30m prior', color: 'amber' },
                        { id: 'With Food', label: 'With Food', hint: 'During main meals', color: 'sky' },
                        { id: 'Empty Stomach', label: 'Empty Stomach', hint: 'Early AM fasting', color: 'purple' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setMealTiming(t.id as any)}
                          className={`py-1.5 px-2 rounded-lg border text-left transition-all ${
                            mealTiming === t.id
                              ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-1 ring-teal-500'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>{t.label}</span>
                            {mealTiming === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                          </div>
                          <div className="text-[9px] text-slate-400">{t.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 4: Duration, Auto Qty, Instructions & Add Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Duration (Days) *
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={durationDays}
                          onChange={(e) => handleDurationChange(Number(e.target.value) || 1)}
                          className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg font-bold text-center text-slate-800"
                        />
                        <div className="flex flex-wrap gap-1">
                          {[3, 5, 7, 10, 15, 30].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleDurationChange(d)}
                              className={`px-1.5 py-1 text-[10px] rounded font-semibold border ${
                                durationDays === d
                                  ? 'bg-slate-800 text-white border-slate-800'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Total Qty (Tablets)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg font-extrabold text-teal-800 text-center"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Specific Clinical Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Take with plenty of water"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        disabled={!selectedMedId}
                        onClick={handleAddMedication}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <PlusCircle className="w-4 h-4" /> Add Tablet
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prescribed Items Table */}
                {prescribedItems.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mt-3">
                    <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Prescribed Medication Schedule ({prescribedItems.length} items)</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        Will be automatically routed to Pharmacy Desk for dispensing
                      </span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3">Medicine & Strength</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Meal Timing</th>
                          <th className="py-2.5 px-3">Duration & Qty</th>
                          <th className="py-2.5 px-3">Instructions</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {prescribedItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900">{item.medicineName}</span>
                              <span className="ml-1.5 font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {item.dosage}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md">
                                {item.frequency}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                  item.mealTiming === 'Before Food'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : item.mealTiming === 'Empty Stomach'
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                    : item.mealTiming === 'With Food'
                                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {item.mealTiming || 'After Food'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              <span className="font-semibold">{item.durationDays} Days</span>
                              <span className="text-slate-400 mx-1">•</span>
                              <span className="font-bold text-teal-800">{item.quantity} Units</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                              {item.instructions || 'As advised'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setPrescribedItems(prescribedItems.filter((_, i) => i !== idx))
                                }
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove medication"
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

              {/* Diagnostic Lab Test Order Desk */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-sky-600" />
                      Order Diagnostic Pathology & Radiology Tests
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Select laboratory tests or imaging scans to be collected and processed for this patient.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                    {selectedLabTestIds.length} tests selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {labTests.map((test) => {
                    const isSelected = selectedLabTestIds.includes(test.id);

                    return (
                      <div
                        key={test.id}
                        onClick={() => handleToggleLabTest(test.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-400'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate">{test.name}</span>
                          <span className="font-mono text-[11px] font-semibold text-slate-700">
                            {formatCurrency(test.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                          <span>{test.category} • {test.specimenType}</span>
                          {isSelected && (
                            <span className="font-bold text-sky-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-sky-600" /> Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedLabTestIds.length > 0 && (
                  <div className="p-2.5 bg-sky-50/60 border border-sky-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-sky-900 font-medium">
                      Total Diagnostic Test Charges: <strong className="font-bold text-sky-950">
                        {formatCurrency(
                          selectedLabTestIds.reduce((sum, id) => {
                            const t = labTests.find((x) => x.id === id);
                            return sum + (t ? t.price : 0);
                          }, 0)
                        )}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedLabTestIds([])}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Clear All Tests
                    </button>
                  </div>
                )}
              </div>

              {/* Complete & Dispatch Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  Prescription will sync directly to Pharmacy Desk for medicine fulfillment & payment collection.
                </span>
                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Sign & Complete Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-700">No Patient Selected</p>
              <p className="text-xs text-slate-400 mt-1">
                Please pick a patient from the OPD queue on the left to start consultation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Consultation Completed Successfully"
        subtitle="Electronic medical record synchronized across Easy Care Super-Speciality Hospital."
        maxWidth="sm"
      >
        <div className="text-center py-4 space-y-3.5 text-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">
              {lastDispatchedInfo?.patientName} - Consultation Finalized
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Doctor consultation records signed & dispatched to hospital departments.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Pill className="w-3.5 h-3.5 text-teal-600" /> Pharmacy Routing:
              </span>
              <span className="font-bold text-teal-800">
                {lastDispatchedInfo?.itemCount || 0} Meds ({formatCurrency(lastDispatchedInfo?.totalAmount || 0)})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <FlaskConical className="w-3.5 h-3.5 text-sky-600" /> Lab Diagnostic Orders:
              </span>
              <span className="font-bold text-sky-800">
                {lastDispatchedInfo?.testCount || 0} Tests
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            The patient may now proceed to the <strong>Hospital Pharmacy Counter</strong> for medicine delivery and payment (Cash / UPI QR code).
          </p>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
          >
            Done & Next Patient
          </button>
        </div>
      </Modal>
    </div>
  );
};
