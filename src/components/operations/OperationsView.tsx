import React, { useState } from 'react';
import {
  Ambulance as AmbulanceIcon,
  HeartPulse,
  Wrench,
  Clock,
  Phone,
  CheckCircle,
  AlertTriangle,
  Send,
  Calendar,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Ambulance, OperationTheatreSchedule } from '../../types/hospital';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const OperationsView: React.FC = () => {
  const { ambulances, updateAmbulanceStatus, otSchedules } = useHospital();

  const [activeAmbulanceModal, setActiveAmbulanceModal] = useState<Ambulance | null>(null);
  const [dispatchLocation, setDispatchLocation] = useState('');

  // Equipment maintenance mock state
  const [equipmentList] = useState([
    { id: 'eq-1', name: 'GE Signa 1.5T MRI Scanner', dept: 'Radiology / Imaging', lastService: '14-08-2026', nextService: '14-11-2026', status: 'optimal' },
    { id: 'eq-2', name: 'Hamilton-G5 Critical Care Ventilator (ICU)', dept: 'ICU Wing A', lastService: '20-09-2026', nextService: '31-10-2026', status: 'due_soon' },
    { id: 'eq-3', name: 'Zoll R-Series Defibrillator (ER)', dept: 'Emergency Bay', lastService: '01-10-2026', nextService: '01-12-2026', status: 'optimal' },
    { id: 'eq-4', name: 'Philips Azurion Cath Lab System', dept: 'Cardiology', lastService: '10-07-2026', nextService: '10-11-2026', status: 'optimal' },
  ]);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAmbulanceModal || !dispatchLocation) return;

    updateAmbulanceStatus(activeAmbulanceModal.id, 'dispatched', dispatchLocation);
    setActiveAmbulanceModal(null);
    setDispatchLocation('');
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AmbulanceIcon className="w-5 h-5 text-sky-600" />
            Hospital Operations, Ambulance Dispatch & Facility Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emergency fleet logistics, Operation Theatre (OT) schedules, and biomedical engineering maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="success">
            {ambulances.filter((a) => a.status === 'available').length} Ambulances Ready
          </Badge>
          <Badge variant="danger">
            {otSchedules.filter((o) => o.status === 'in_progress').length} OT Active
          </Badge>
        </div>
      </div>

      {/* Ambulance Dispatch Fleet Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AmbulanceIcon className="w-4 h-4 text-emerald-600" />
              Emergency Ambulance Fleet & Rapid Response Logistics
            </h2>
            <p className="text-xs text-slate-500">Live GPS tracking and driver communication dispatch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ambulances.map((amb) => {
            const isAvail = amb.status === 'available';
            const isDisp = amb.status === 'dispatched';

            return (
              <div
                key={amb.id}
                className={`p-4 rounded-xl border-2 transition-all shadow-xs flex flex-col justify-between ${
                  isAvail
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : isDisp
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-sm text-slate-900">
                      {amb.vehicleNumber}
                    </span>
                    <Badge variant={isAvail ? 'success' : isDisp ? 'danger' : 'neutral'} size="sm">
                      {amb.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 mt-1">{amb.type}</p>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Driver: <strong>{amb.driverName}</strong> ({amb.driverPhone})
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Location: <strong className="text-slate-700">{amb.location}</strong>
                    </p>
                    {amb.eta && (
                      <p className="text-[11px] font-bold text-rose-600">
                        Dispatch ETA: {amb.eta}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between">
                  {isAvail ? (
                    <button
                      onClick={() => setActiveAmbulanceModal(amb)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch to Emergency
                    </button>
                  ) : isDisp ? (
                    <button
                      onClick={() => updateAmbulanceStatus(amb.id, 'available', 'Base Hospital Station')}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Mark Returned to Base
                    </button>
                  ) : (
                    <button
                      onClick={() => updateAmbulanceStatus(amb.id, 'available', 'Base Hospital Station')}
                      className="w-full py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                    >
                      Restore to Ready
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operation Theatre (OT) Schedules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            Operation Theatre (OT) Surgical Suites & Live Timetable
          </h2>
          <p className="text-xs text-slate-500">Lead surgeons, surgical teams, and patient prep schedules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otSchedules.map((ot) => (
            <div
              key={ot.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{ot.room}</span>
                <Badge variant={ot.status === 'in_progress' ? 'danger' : 'info'}>
                  {ot.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-sky-800">{ot.surgeryName}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Patient: <strong className="text-slate-800">{ot.patientName}</strong> ({ot.patientMrn})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Lead Surgeon</span>
                  <p className="font-semibold text-slate-800">{ot.leadSurgeon}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Schedule</span>
                  <p className="font-semibold text-slate-800">
                    {ot.scheduledTime} ({ot.durationHours} hrs)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biomedical Equipment Maintenance Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-600" />
            Biomedical Engineering & High-Value Equipment Audit
          </h2>
          <span className="text-xs text-slate-500">Facility Quality Assurance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Medical Equipment Name</th>
                <th className="py-3 px-4">Department Location</th>
                <th className="py-3 px-4">Last Certified Service</th>
                <th className="py-3 px-4">Next Inspection Due</th>
                <th className="py-3 px-4">Calibration Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipmentList.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{eq.name}</td>
                  <td className="py-3 px-4 text-slate-600">{eq.dept}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{eq.lastService}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {eq.nextService}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={eq.status === 'optimal' ? 'success' : 'warning'} size="sm">
                      {eq.status === 'optimal' ? 'Calibrated (Optimal)' : 'Service Due Soon'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ambulance Dispatch Modal */}
      {activeAmbulanceModal && (
        <Modal
          isOpen={Boolean(activeAmbulanceModal)}
          onClose={() => setActiveAmbulanceModal(null)}
          title={`Dispatch Emergency Ambulance: ${activeAmbulanceModal.vehicleNumber}`}
          subtitle={`Type: ${activeAmbulanceModal.type} | Driver: ${activeAmbulanceModal.driverName}`}
          maxWidth="sm"
        >
          <form onSubmit={handleDispatch} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Emergency Location / Incident Address *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Ring Road Junction, near Silk Board Flyover / Indiranagar 100ft Road, Trauma Accident Site..."
                value={dispatchLocation}
                onChange={(e) => setDispatchLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveAmbulanceModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Confirm & Dispatch Siren
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
