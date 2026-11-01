import React, { useState } from 'react';
import {
  FlaskConical,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  FileCheck,
  Search,
  Filter,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { LabOrder, LabTest } from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

export const LaboratoryView: React.FC = () => {
  const { labOrders, labTests, updateLabOrderResult } = useHospital();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeResultModal, setActiveResultModal] = useState<LabOrder | null>(null);
  const [activePrintModal, setActivePrintModal] = useState<LabOrder | null>(null);

  // Result entry form state
  const [resultValue, setResultValue] = useState('');
  const [resultNotes, setResultNotes] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);

  const handleOpenResultEntry = (order: LabOrder) => {
    setActiveResultModal(order);
    setResultValue(order.resultValue || '');
    setResultNotes(order.resultNotes || '');
    setIsAbnormal(order.isAbnormal || false);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResultModal) return;

    updateLabOrderResult(activeResultModal.id, resultValue, resultNotes, isAbnormal);
    setActiveResultModal(null);
  };

  const filteredOrders = labOrders.filter((ord) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'pending' && (ord.status === 'pending_sample' || ord.status === 'processing')) ||
      (activeFilter === 'verified' && ord.status === 'verified') ||
      (activeFilter === 'abnormal' && ord.isAbnormal);

    const matchesSearch =
      ord.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-sky-600" />
            Laboratory Information System (LIS) & Diagnostic Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pathology accessioning, specimen barcode workflow, bio-assays, and verified diagnostic reporting.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="warning">
            {labOrders.filter((o) => o.status === 'pending_sample' || o.status === 'processing').length} In Progress
          </Badge>
          <Badge variant="success">
            {labOrders.filter((o) => o.status === 'verified').length} Published
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient, Order #, or Investigation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['all', 'pending', 'verified', 'abnormal'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Order # & Date</th>
              <th className="py-3.5 px-4">Patient & MRN</th>
              <th className="py-3.5 px-4">Test Investigation</th>
              <th className="py-3.5 px-4">Specimen Type</th>
              <th className="py-3.5 px-4">Result / Findings</th>
              <th className="py-3.5 px-4">LIS Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono">
                  <span className="font-bold text-slate-800">{ord.orderNumber}</span>
                  <p className="text-[10px] text-slate-400 font-sans">{ord.orderDate}</p>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">{ord.patientName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{ord.patientMrn}</p>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-800">{ord.testName}</p>
                  <p className="text-[10px] text-slate-400">Ref: {ord.normalRange}</p>
                </td>

                <td className="py-3.5 px-4">
                  <Badge variant="purple" size="sm">
                    {ord.specimenType}
                  </Badge>
                </td>

                <td className="py-3.5 px-4">
                  {ord.resultValue ? (
                    <div>
                      <span
                        className={`font-bold ${
                          ord.isAbnormal ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {ord.resultValue} {ord.unit}
                      </span>
                      {ord.isAbnormal && (
                        <Badge variant="danger" size="sm" className="ml-1.5">
                          Critical Alert
                        </Badge>
                      )}
                      {ord.resultNotes && (
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {ord.resultNotes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Awaiting specimen analysis</span>
                  )}
                </td>

                <td className="py-3.5 px-4">
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
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {ord.status !== 'verified' ? (
                      <button
                        onClick={() => handleOpenResultEntry(ord)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        Enter Results
                      </button>
                    ) : (
                      <button
                        onClick={() => setActivePrintModal(ord)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Report
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result Entry Modal */}
      {activeResultModal && (
        <Modal
          isOpen={Boolean(activeResultModal)}
          onClose={() => setActiveResultModal(null)}
          title={`Enter Diagnostic Result: ${activeResultModal.testName}`}
          subtitle={`Order #${activeResultModal.orderNumber} for ${activeResultModal.patientName} (${activeResultModal.patientMrn})`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Standard Reference Interval</span>
                <p className="font-semibold text-slate-800">{activeResultModal.normalRange}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Specimen Analyzed</span>
                <p className="font-semibold text-slate-800">{activeResultModal.specimenType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observed Result Value *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. 14.5 or Positive`}
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  readOnly
                  value={activeResultModal.unit}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-800">Flag as Abnormal / Critical Reading?</span>
                <p className="text-[10px] text-rose-600">
                  Flags this reading on the Executive Dashboard and Patient EMR.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isAbnormal}
                onChange={(e) => setIsAbnormal(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Pathologist Observations & Notes
              </label>
              <textarea
                rows={3}
                placeholder="Diagnostic comments, microscopic analysis, or confirmation by repeat test..."
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveResultModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm"
              >
                Verify & Publish Diagnostic Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Diagnostic Report Modal */}
      {activePrintModal && (
        <Modal
          isOpen={Boolean(activePrintModal)}
          onClose={() => setActivePrintModal(null)}
          title="Official Patient Diagnostic Report"
          subtitle={`Report: ${activePrintModal.orderNumber}`}
          maxWidth="2xl"
        >
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-xs font-sans">
            {/* Hospital Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  AAYUSH APEX SUPER-SPECIALITY DIAGNOSTIC LABORATORIES
                </h2>
                <p className="text-[11px] text-slate-500">
                  NABL & NABH Accredited Clinical Pathology & Molecular Diagnostic Center
                </p>
                <p className="text-[10px] text-slate-400">Accreditation: NABL-ISO-15189 • 24x7 Casualty & Critical Care Lab</p>
              </div>
              <div className="text-right">
                <Badge variant="success">Verified & Released</Badge>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Report ID: {activePrintModal.orderNumber}
                </p>
              </div>
            </div>

            {/* Patient Meta Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Patient Name</span>
                <p className="font-bold text-slate-900">{activePrintModal.patientName}</p>
                <p className="text-[10px] font-mono text-slate-500">{activePrintModal.patientMrn}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Referring Physician</span>
                <p className="font-bold text-slate-900">{activePrintModal.doctorName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Specimen</span>
                <p className="font-bold text-slate-900">{activePrintModal.specimenType}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Reported At</span>
                <p className="font-bold text-slate-900">{activePrintModal.completedAt || activePrintModal.orderDate}</p>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Investigation / Analyte</th>
                    <th className="py-2.5 px-3">Measured Value</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Biological Reference Range</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="py-3 px-3 font-bold text-slate-900">{activePrintModal.testName}</td>
                    <td className="py-3 px-3 font-extrabold text-sm text-slate-900">
                      {activePrintModal.resultValue || '--'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{activePrintModal.unit}</td>
                    <td className="py-3 px-3 text-slate-600">{activePrintModal.normalRange}</td>
                    <td className="py-3 px-3">
                      {activePrintModal.isAbnormal ? (
                        <Badge variant="danger" size="sm">
                          Abnormal High
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          Normal
                        </Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pathologist Notes */}
            {activePrintModal.resultNotes && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pathologist Impression:</p>
                <p className="text-slate-800 mt-1">{activePrintModal.resultNotes}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <div>
                <p className="font-bold text-slate-800">
                  {activePrintModal.technicianName || 'Dr. Sneha Kulkarni, MD (Pathology)'}
                </p>
                <p className="text-[10px] text-slate-500">Consultant Pathologist & Lab Director (Reg: KMC-77812)</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Official Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
