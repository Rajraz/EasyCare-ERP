import React, { useState } from 'react';
import {
  BedDouble,
  UserPlus,
  LogOut,
  RefreshCw,
  Wrench,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import {
  Button as MuiButton,
  Chip as MuiChip,
  LinearProgress,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { useHospital } from '../../context/HospitalContext';
import { useNotification } from '../../context/NotificationContext';
import { Bed, Ward } from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../lib/utils';

export const WardsView: React.FC = () => {
  const {
    wards,
    beds,
    patients,
    updateBedStatus,
    admitPatientToBed,
    dischargePatientFromBed,
  } = useHospital();
  const { showNotification } = useNotification();

  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [activeBedModal, setActiveBedModal] = useState<Bed | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const filteredWards =
    selectedWardFilter === 'all'
      ? wards
      : wards.filter((w) => w.id === selectedWardFilter);

  // Available unadmitted patients
  const admittedPatientIds = beds
    .filter((b) => b.currentPatientId)
    .map((b) => b.currentPatientId);
  const unadmittedPatients = patients.filter((p) => !admittedPatientIds.includes(p.id));

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBedModal || !selectedPatientId) return;
    const pat = patients.find((p) => p.id === selectedPatientId);
    if (!pat) return;

    admitPatientToBed(activeBedModal.id, pat.id, `${pat.firstName} ${pat.lastName}`);
    showNotification(`Patient ${pat.firstName} ${pat.lastName} admitted to Bed ${activeBedModal.bedNumber} (${activeBedModal.wardName})`, 'success');
    setActiveBedModal(null);
    setSelectedPatientId('');
  };

  const handleDischarge = () => {
    if (!activeBedModal) return;
    if (confirm(`Confirm discharge of ${activeBedModal.currentPatientName} from Bed ${activeBedModal.bedNumber}? Bed will be scheduled for immediate cleaning.`)) {
      dischargePatientFromBed(activeBedModal.id);
      showNotification(`Discharged ${activeBedModal.currentPatientName} from Bed ${activeBedModal.bedNumber}. Bed sent for sanitization.`, 'info');
      setActiveBedModal(null);
    }
  };

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'available').length;
  const cleaningBeds = beds.filter((b) => b.status === 'cleaning').length;

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-sky-600" />
            Inpatient Bed & Ward Management (Floor Map)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual bed map for ICU, step-down, emergency, and general wards.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Available ({availableBeds})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">Occupied ({occupiedBeds})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">Sanitizing ({cleaningBeds})</span>
          </div>
        </div>
      </div>

      {/* Ward Filter Bar with Interactive Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <MuiChip
          label={`All Hospital Wards (${totalBeds} Beds)`}
          clickable
          color={selectedWardFilter === 'all' ? 'primary' : 'default'}
          variant={selectedWardFilter === 'all' ? 'filled' : 'outlined'}
          onClick={() => setSelectedWardFilter('all')}
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            borderRadius: '0.75rem',
            py: 2,
            px: 1,
            cursor: 'pointer',
            ...(selectedWardFilter === 'all'
              ? { bgcolor: '#0284c7', color: '#fff' }
              : { bgcolor: '#fff', color: '#475569', borderColor: '#cbd5e1' }),
          }}
        />
        {wards.map((w) => (
          <MuiChip
            key={w.id}
            label={`${w.name} (${formatCurrency(w.chargePerDay)}/day)`}
            clickable
            color={selectedWardFilter === w.id ? 'primary' : 'default'}
            variant={selectedWardFilter === w.id ? 'filled' : 'outlined'}
            onClick={() => setSelectedWardFilter(w.id)}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '0.75rem',
              py: 2,
              px: 1,
              cursor: 'pointer',
              ...(selectedWardFilter === w.id
                ? { bgcolor: '#0284c7', color: '#fff' }
                : { bgcolor: '#fff', color: '#475569', borderColor: '#cbd5e1' }),
            }}
          />
        ))}
      </div>

      {/* Wards Interactive Visual Map */}
      <div className="space-y-6">
        {filteredWards.map((ward) => {
          const wardBeds = beds.filter((b) => b.wardId === ward.id);
          const wardOccupied = wardBeds.filter((b) => b.status === 'occupied').length;
          const wardPercent = Math.round((wardOccupied / (wardBeds.length || 1)) * 100);

          return (
            <div
              key={ward.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Ward Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-sm font-bold text-slate-800">{ward.name}</h2>
                    <Badge variant="purple" size="sm">
                      {ward.floor}
                    </Badge>
                    <Badge variant="info" size="sm">
                      {ward.wardType}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily Room Charge: <span className="font-semibold text-slate-700">{formatCurrency(ward.chargePerDay)}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1 min-w-[200px]">
                  <div className="text-xs font-semibold text-slate-600 flex items-center justify-between sm:justify-end gap-2 w-full">
                    <span>Ward Occupancy:</span>
                    <span className="text-sky-700 font-bold">{wardOccupied} / {wardBeds.length} ({wardPercent}%)</span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={wardPercent}
                    sx={{
                      width: '100%',
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: wardPercent > 85 ? '#e11d48' : wardPercent > 60 ? '#f59e0b' : '#0d9488',
                      },
                    }}
                  />
                </div>
              </div>

              {/* Beds Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wardBeds.map((bed) => {
                  const isOccupied = bed.status === 'occupied';
                  const isAvailable = bed.status === 'available';
                  const isCleaning = bed.status === 'cleaning';
                  const isMaint = bed.status === 'maintenance';

                  const cardBorderColor = isOccupied
                    ? 'border-rose-200 hover:border-rose-400 bg-rose-50/40'
                    : isAvailable
                    ? 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40'
                    : isCleaning
                    ? 'border-amber-200 hover:border-amber-400 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50';

                  return (
                    <div
                      key={bed.id}
                      onClick={() => setActiveBedModal(bed)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between min-h-[140px] ${cardBorderColor}`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {bed.bedNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              isOccupied
                                ? 'bg-rose-100 text-rose-700'
                                : isAvailable
                                ? 'bg-emerald-100 text-emerald-700'
                                : isCleaning
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {bed.status}
                          </span>
                        </div>

                        <div className="mt-2.5">
                          {isOccupied ? (
                            <div>
                              <p className="font-bold text-slate-800 text-xs truncate">
                                {bed.currentPatientName}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Admitted: {bed.admissionDate}
                              </p>
                              {bed.assignedNurse && (
                                <p className="text-[10px] text-slate-500">
                                  Nurse: {bed.assignedNurse}
                                </p>
                              )}
                            </div>
                          ) : isCleaning ? (
                            <p className="text-xs text-amber-700 italic flex items-center gap-1">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Sanitizing & Sterilization
                            </p>
                          ) : isMaint ? (
                            <p className="text-xs text-slate-600 italic flex items-center gap-1">
                              <Wrench className="w-3.5 h-3.5" />
                              Technical Maintenance
                            </p>
                          ) : (
                            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Ready for Admission
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 mt-3 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{formatCurrency(bed.dailyRate)}/day</span>
                        <span className="text-sky-600 font-semibold hover:underline">
                          Manage &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Management & Admission Modal */}
      {activeBedModal && (
        <Modal
          isOpen={Boolean(activeBedModal)}
          onClose={() => setActiveBedModal(null)}
          title={`Manage Bed: ${activeBedModal.bedNumber}`}
          subtitle={`${activeBedModal.wardName} | Charge: ${formatCurrency(activeBedModal.dailyRate)}/day`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {/* If Bed is Currently Occupied */}
            {activeBedModal.status === 'occupied' ? (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900">
                  <p className="text-[10px] uppercase font-bold text-rose-700">Admitted Patient</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {activeBedModal.currentPatientName}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Admission Date: <span className="font-semibold">{activeBedModal.admissionDate}</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Primary Nurse: <span className="font-semibold">{activeBedModal.assignedNurse || 'Nurse on Duty'}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <MuiButton
                    variant="contained"
                    fullWidth
                    onClick={handleDischarge}
                    sx={{
                      bgcolor: '#e11d48',
                      '&:hover': { bgcolor: '#be123c' },
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '0.75rem',
                      py: 1,
                    }}
                    startIcon={<LogOut className="w-4 h-4" />}
                  >
                    Discharge & Sanitize Bed
                  </MuiButton>
                  <MuiButton
                    variant="outlined"
                    onClick={() => {
                      updateBedStatus(activeBedModal.id, 'cleaning');
                      showNotification(`Bed ${activeBedModal.bedNumber} sent for cleaning`, 'info');
                      setActiveBedModal(null);
                    }}
                    sx={{
                      color: '#b45309',
                      borderColor: '#fde68a',
                      bgcolor: '#fffbeb',
                      '&:hover': { bgcolor: '#fef3c7', borderColor: '#fcd34d' },
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Send Cleaning Request
                  </MuiButton>
                </div>
              </div>
            ) : (
              /* If Bed is Vacant / Available / Cleaning */
              <div className="space-y-4">
                {activeBedModal.status === 'available' ? (
                  <form onSubmit={handleAdmit} className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Select Patient for Admission *
                      </label>
                      {unadmittedPatients.length > 0 ? (
                        <select
                          required
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="">-- Choose Registered Patient --</option>
                          {unadmittedPatients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.firstName} {p.lastName} ({p.mrn}) - Blood: {p.bloodGroup}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-rose-600 italic">
                          All registered patients are currently admitted. Please register a new patient first.
                        </p>
                      )}
                    </div>

                    <MuiButton
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={!selectedPatientId}
                      sx={{
                        bgcolor: '#0284c7',
                        '&:hover': { bgcolor: '#0369a1' },
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '0.75rem',
                        py: 1,
                      }}
                      startIcon={<UserPlus className="w-4 h-4" />}
                    >
                      Admit Patient to Bed {activeBedModal.bedNumber}
                    </MuiButton>
                  </form>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <p className="font-semibold">Bed is currently in status: {activeBedModal.status}</p>
                    <p className="text-xs mt-1 text-slate-600">
                      You can mark this bed as sanitized and ready for inpatient admission.
                    </p>
                  </div>
                )}

                {/* Quick Bed Status Override */}
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-slate-500 font-semibold mb-2">Change Bed Status:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <MuiButton
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        updateBedStatus(activeBedModal.id, 'available');
                        showNotification(`Bed ${activeBedModal.bedNumber} marked as Available`, 'success');
                        setActiveBedModal(null);
                      }}
                      sx={{
                        color: '#059669',
                        borderColor: '#a7f3d0',
                        bgcolor: '#ecfdf5',
                        '&:hover': { bgcolor: '#d1fae5', borderColor: '#6ee7b7' },
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '0.5rem',
                      }}
                    >
                      Available
                    </MuiButton>
                    <MuiButton
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        updateBedStatus(activeBedModal.id, 'cleaning');
                        showNotification(`Bed ${activeBedModal.bedNumber} marked for Cleaning`, 'info');
                        setActiveBedModal(null);
                      }}
                      sx={{
                        color: '#d97706',
                        borderColor: '#fde68a',
                        bgcolor: '#fffbeb',
                        '&:hover': { bgcolor: '#fef3c7', borderColor: '#fcd34d' },
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '0.5rem',
                      }}
                    >
                      Cleaning
                    </MuiButton>
                    <MuiButton
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        updateBedStatus(activeBedModal.id, 'maintenance');
                        showNotification(`Bed ${activeBedModal.bedNumber} marked under Maintenance`, 'warning');
                        setActiveBedModal(null);
                      }}
                      sx={{
                        color: '#475569',
                        borderColor: '#cbd5e1',
                        bgcolor: '#f8fafc',
                        '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '0.5rem',
                      }}
                    >
                      Maintenance
                    </MuiButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
