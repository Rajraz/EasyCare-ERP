import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  DollarSign,
  Printer,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  Button as MuiButton,
  Chip as MuiChip,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { useHospital } from '../../context/HospitalContext';
import { useNotification } from '../../context/NotificationContext';
import { Invoice, InvoiceItem } from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

export const BillingView: React.FC = () => {
  const { invoices, addInvoice, payInvoice, patients, beds } = useHospital();
  const { showNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);

  // New Invoice State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'it-1',
      type: 'Consultation',
      description: 'Super-Specialist Clinical OPD Consultation (Cardiology)',
      quantity: 1,
      unitPrice: 1000,
      totalPrice: 1000,
    },
    {
      id: 'it-2',
      type: 'Lab Test',
      description: 'Complete Blood Count (CBC) + Lipid Profile',
      quantity: 1,
      unitPrice: 1300,
      totalPrice: 1300,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [insuranceCoverage, setInsuranceCoverage] = useState(1500);

  // Pay Modal State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        id: `it-${Date.now()}`,
        type: 'Pharmacy',
        description: 'Prescribed Medications / IV lines',
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650,
      },
    ]);
  };

  const handleUpdateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      updated[idx].totalPrice = updated[idx].quantity * updated[idx].unitPrice;
    }
    setItems(updated);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
    const taxRate = 5; // 2.5% CGST + 2.5% SGST
    const taxAmount = (subtotal - discount) * 0.05;
    const total = Math.max(0, subtotal + taxAmount - discount - insuranceCoverage);

    const todayStr = formatDate(new Date().toISOString());
    const dueD = new Date();
    dueD.setDate(dueD.getDate() + 7);
    const dueDateStr = formatDate(dueD.toISOString());

    const newInv = addInvoice({
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      patientMrn: pat.mrn,
      date: todayStr,
      dueDate: dueDateStr,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      insuranceCoverage,
      total,
      paidAmount: 0,
      balanceDue: total,
      status: 'pending',
      paymentMethod: 'Awaiting Settlement',
    });

    setIsNewInvoiceModalOpen(false);
    setSelectedInvoice(newInv);
    showNotification(`Invoice ${newInv.invoiceNumber} created for ${newInv.patientName} (${formatCurrency(newInv.total)})`, 'success');
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice || payAmount <= 0) return;

    payInvoice(payModalInvoice.id, payAmount, paymentMethod);
    showNotification(`Payment of ${formatCurrency(payAmount)} received via ${paymentMethod} for ${payModalInvoice.invoiceNumber}`, 'success');
    setPayModalInvoice(null);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientMrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-sky-600" />
            Hospital Billing, Invoicing & Insurance (TPA / PMJAY) Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified billing for OPD consultations, IPD room stay, lab tests, and formulary items (Indian GST & TPA Standards).
          </p>
        </div>

        <MuiButton
          variant="contained"
          onClick={() => setIsNewInvoiceModalOpen(true)}
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
          startIcon={<PlusCircle className="w-4 h-4" />}
        >
          Generate Patient Bill (₹)
        </MuiButton>
      </div>

      {/* Summary KPI Cards in Indian Rupees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Gross Invoiced</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalBilled)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{invoices.length} total patient invoices</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Collections Received</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(totalCollected)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Direct cashier, UPI & PMJAY cashless</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Outstanding Receivables</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Pending patient copay & TPA settlements</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Invoice #, Patient, or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredInvoices.length} invoices
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Invoice # & Date (DD-MM-YYYY)</th>
              <th className="py-3.5 px-4">Patient Name & MRN</th>
              <th className="py-3.5 px-4">Subtotal (₹)</th>
              <th className="py-3.5 px-4">TPA / PMJAY Covered</th>
              <th className="py-3.5 px-4">Net Total (₹)</th>
              <th className="py-3.5 px-4">Paid / Balance (₹)</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono">
                  <span className="font-bold text-slate-900">{inv.invoiceNumber}</span>
                  <p className="text-[10px] text-slate-400 font-sans">{formatDate(inv.date)}</p>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">{inv.patientName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{inv.patientMrn}</p>
                </td>

                <td className="py-3.5 px-4 text-slate-600">{formatCurrency(inv.subtotal)}</td>

                <td className="py-3.5 px-4 font-semibold text-sky-700">
                  {formatCurrency(inv.insuranceCoverage)}
                </td>

                <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                  {formatCurrency(inv.total)}
                </td>

                <td className="py-3.5 px-4">
                  <span className="font-semibold text-emerald-700 block">
                    Paid: {formatCurrency(inv.paidAmount)}
                  </span>
                  {inv.balanceDue > 0 && (
                    <span className="text-[10px] text-rose-600 font-bold">
                      Due: {formatCurrency(inv.balanceDue)}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <Badge
                    variant={
                      inv.status === 'paid'
                        ? 'success'
                        : inv.status === 'partially_paid'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {inv.status.replace('_', ' ')}
                  </Badge>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {inv.balanceDue > 0 && (
                      <MuiTooltip title="Receive cash, card, or UPI QR payment settlement" arrow>
                        <MuiButton
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setPayModalInvoice(inv);
                            setPayAmount(inv.balanceDue);
                          }}
                          sx={{
                            bgcolor: '#059669',
                            '&:hover': { bgcolor: '#047857' },
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: '0.5rem',
                            py: 0.5,
                            px: 1.5,
                          }}
                          startIcon={<CreditCard className="w-3.5 h-3.5" />}
                        >
                          Record Pay
                        </MuiButton>
                      </MuiTooltip>
                    )}
                    <MuiTooltip title="Preview & Print Official GST Hospital Bill" arrow>
                      <MuiButton
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedInvoice(inv)}
                        sx={{
                          color: '#334155',
                          borderColor: '#cbd5e1',
                          bgcolor: '#f8fafc',
                          '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '0.5rem',
                          py: 0.5,
                          px: 1.5,
                        }}
                        startIcon={<Printer className="w-3.5 h-3.5" />}
                      >
                        View Bill
                      </MuiButton>
                    </MuiTooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      <Modal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        title="Generate Consolidated Patient Bill (₹ INR)"
        subtitle="Combine OPD, IPD, Diagnostics, and Formulary charges into one itemized bill with 5% GST."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.mrn}) - TPA: {p.insuranceProvider}
                </option>
              ))}
            </select>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 uppercase tracking-wide">
                Invoice Item Breakdown
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-sky-600 font-bold hover:underline"
              >
                + Add Line Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 bg-slate-50 p-2 rounded-lg">
                  <div className="col-span-3">
                    <select
                      value={item.type}
                      onChange={(e) => handleUpdateItem(idx, 'type', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Bed Charge">Bed Charge</option>
                      <option value="Lab Test">Lab Test</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Procedure">Procedure / Surgery</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="1"
                      placeholder="Price (₹)"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discounts & Insurance */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hospital Discount / Concession (₹)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                TPA Insurance / PMJAY Pre-Auth Coverage (₹)
              </label>
              <input
                type="number"
                min="0"
                value={insuranceCoverage}
                onChange={(e) => setInsuranceCoverage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-sky-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewInvoiceModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm"
            >
              Create Hospital Invoice & Register Claim
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      {payModalInvoice && (
        <Modal
          isOpen={Boolean(payModalInvoice)}
          onClose={() => setPayModalInvoice(null)}
          title={`Record Receipt for ${payModalInvoice.invoiceNumber}`}
          subtitle={`Patient: ${payModalInvoice.patientName} | Due: ${formatCurrency(payModalInvoice.balanceDue)}`}
          maxWidth="sm"
        >
          <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount to Pay (₹) *</label>
              <input
                type="number"
                step="1"
                max={payModalInvoice.balanceDue}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="UPI / QR Code">UPI (PhonePe, GooglePay, Paytm / QR)</option>
                <option value="Cash Counter">Cash at Billing Counter</option>
                <option value="Credit / Debit Card">Credit / Debit Card POS</option>
                <option value="PMJAY Pre-Auth Settlement">PMJAY / Ayushman Bharat Settlement</option>
                <option value="TPA Insurance Cashless Settlement">Star Health / Medi Assist TPA Settlement</option>
                <option value="NEFT / RTGS Wire">NEFT / RTGS Bank Transfer</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayModalInvoice(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm"
              >
                Confirm Payment Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Hospital Tax Invoice */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title="Official Hospital Tax Invoice & Discharge Receipt"
          subtitle={`Invoice: ${selectedInvoice.invoiceNumber}`}
          maxWidth="2xl"
        >
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-xs font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  EASY CARE SUPER-SPECIALITY HOSPITAL
                </h2>
                <p className="text-[11px] text-slate-600">
                  Central Revenue Cycle Management & Patient Invoicing
                </p>
                <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                  <p>GSTIN: <strong className="text-slate-800">29AABCA1234D1Z5</strong> • PAN: AABCA1234D</p>
                  <p>Central Billing & Cashier Desk • Ayushman Bharat & TPA Empanelled</p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    selectedInvoice.status === 'paid'
                      ? 'success'
                      : selectedInvoice.status === 'partially_paid'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {selectedInvoice.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <p className="text-[10px] font-mono text-slate-700 font-bold mt-1.5">
                  Inv Date: {formatDate(selectedInvoice.date)}
                </p>
              </div>
            </div>

            {/* Patient Meta Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Patient Name</span>
                <p className="font-bold text-slate-900">{selectedInvoice.patientName}</p>
                <p className="text-[10px] font-mono text-slate-500">{selectedInvoice.patientMrn}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Due Date</span>
                <p className="font-bold text-slate-900">{formatDate(selectedInvoice.dueDate)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Mode</span>
                <p className="font-bold text-slate-900">{selectedInvoice.paymentMethod}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Billing Status</span>
                <p className="font-bold text-slate-900 capitalize">{selectedInvoice.status}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Service / Medication</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{it.description}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="neutral" size="sm">
                          {it.type}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">{it.quantity}</td>
                      <td className="py-2.5 px-3">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2.5 px-3 font-bold text-right text-slate-900">
                        {formatCurrency(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex justify-end">
              <div className="w-80 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>CGST (2.5%):</span>
                  <span>+{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>SGST (2.5%):</span>
                  <span>+{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Discount / Concession:</span>
                    <span>-{formatCurrency(selectedInvoice.discount)}</span>
                  </div>
                )}
                {selectedInvoice.insuranceCoverage > 0 && (
                  <div className="flex justify-between text-sky-700 font-semibold">
                    <span>TPA / PMJAY Claim:</span>
                    <span>-{formatCurrency(selectedInvoice.insuranceCoverage)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>NET PAYABLE:</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Print & Stamp */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                Official Computer-Generated Tax Invoice. Signed by Chief Billing Officer (Rameshwar Iyer).
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Hospital Bill
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
