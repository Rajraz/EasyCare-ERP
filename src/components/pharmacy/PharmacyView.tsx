import React, { useState } from 'react';
import {
  Pill,
  Package,
  AlertTriangle,
  Search,
  PlusCircle,
  CheckCircle2,
  Receipt,
  ShoppingCart,
  Printer,
  Calendar,
  Layers,
  FileText,
  User,
  QrCode,
  DollarSign,
  Trash2,
  Smartphone,
  CreditCard,
  Banknote,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import MuiBadge from '@mui/material/Badge';
import { useHospital } from '../../context/HospitalContext';
import { useNotification } from '../../context/NotificationContext';
import { PharmacyItem, PharmacyBill, PharmacyBillItem, Prescription } from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

export const PharmacyView: React.FC = () => {
  const {
    pharmacyItems,
    addPharmacyItem,
    updatePharmacyStock,
    prescriptions,
    dispensePrescription,
    pharmacyBills,
    createPharmacyBill,
    patients,
    hospitalProfile,
  } = useHospital();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'billing' | 'history' | 'inventory' | 'prescriptions'>('billing');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<PharmacyBill | null>(null);

  // Delivery & Payment Fulfillment Modal State (For Doctor Prescriptions)
  const [selectedRxForDelivery, setSelectedRxForDelivery] = useState<Prescription | null>(null);
  const [rxPaymentMode, setRxPaymentMode] = useState<'UPI / QR Code' | 'Cash' | 'Debit/Credit Card'>('UPI / QR Code');
  const [rxCashTendered, setRxCashTendered] = useState<number | ''>('');
  const [rxUpiRef, setRxUpiRef] = useState('UPI/HOSP/' + Math.floor(100000 + Math.random() * 900000));
  const [rxDiscountPercent, setRxDiscountPercent] = useState<number>(0);

  // Individual Medicine Billing State
  const [patientType, setPatientType] = useState<'Walk-in' | 'OPD' | 'IPD'>('Walk-in');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Rajesh Sharma, MD, DM');
  const [paymentMode, setPaymentMode] = useState<'UPI / QR Code' | 'Cash' | 'Debit/Credit Card'>('UPI / QR Code');
  const [indivCashTendered, setIndivCashTendered] = useState<number | ''>('');
  const [indivUpiRef, setIndivUpiRef] = useState('UPI/POS/' + Math.floor(100000 + Math.random() * 900000));

  // Billing Line Items
  const [billingItems, setBillingItems] = useState<
    {
      pharmacyItemId: string;
      medicineName: string;
      batchNumber: string;
      expiryDate: string;
      hsnCode: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      cgstPercent: number;
      sgstPercent: number;
      totalPrice: number;
    }[]
  >([]);

  // Item Selector State for Bill
  const [selectedMedId, setSelectedMedId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(5); // default 5% discount

  // New Drug Form State
  const [itemForm, setItemForm] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotic',
    dosageForm: 'Tablet (Strip of 10)',
    batchNumber: 'BTH-26-90A',
    expiryDate: '30-06-2028',
    stockQuantity: 100,
    reorderLevel: 30,
    unitPrice: 150.00,
    hsnCode: '3004',
    supplier: 'Sun Pharmaceuticals India',
  });

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setCustomerName(`${pat.firstName} ${pat.lastName}`);
      setCustomerPhone(pat.phone);
    }
  };

  const handleAddMedicineToBill = () => {
    const med = pharmacyItems.find((m) => m.id === selectedMedId);
    if (!med) return;

    if (itemQty > med.stockQuantity) {
      alert(`Only ${med.stockQuantity} units available in stock.`);
      return;
    }

    const rowSubtotal = med.unitPrice * itemQty;
    const discountAmt = (rowSubtotal * itemDiscount) / 100;
    const taxableAmt = rowSubtotal - discountAmt;
    const cgstAmt = (taxableAmt * 2.5) / 100;
    const sgstAmt = (taxableAmt * 2.5) / 100;
    const rowTotal = taxableAmt + cgstAmt + sgstAmt;

    const newItem = {
      pharmacyItemId: med.id,
      medicineName: med.name,
      batchNumber: med.batchNumber,
      expiryDate: med.expiryDate,
      hsnCode: med.hsnCode || '3004',
      quantity: itemQty,
      unitPrice: med.unitPrice,
      discountPercent: itemDiscount,
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      totalPrice: rowTotal,
    };

    setBillingItems([...billingItems, newItem]);
    setSelectedMedId('');
    setItemQty(1);
    showNotification(`Added ${med.name} (Qty: ${itemQty}) to bill cart`, 'info');
  };

  const handleRemoveBillingItem = (idx: number) => {
    setBillingItems(billingItems.filter((_, i) => i !== idx));
  };

  // Calculations for Individual Bill
  const billSubtotal = billingItems.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0
  );
  const billDiscount = billingItems.reduce(
    (sum, it) => sum + (it.unitPrice * it.quantity * it.discountPercent) / 100,
    0
  );
  const taxableAmount = billSubtotal - billDiscount;
  const billCgst = taxableAmount * 0.025;
  const billSgst = taxableAmount * 0.025;
  const billTotalGst = billCgst + billSgst;
  const billNetTotal = taxableAmount + billTotalGst;

  const handleGenerateIndividualBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (billingItems.length === 0) {
      alert('Please add at least one medicine item to generate the bill.');
      return;
    }
    if (!customerName || !customerPhone) {
      alert('Please enter patient/customer name and mobile number.');
      return;
    }

    const newBill = createPharmacyBill({
      patientType,
      patientName: customerName,
      patientPhone: customerPhone,
      patientMrn: selectedPatientId ? patients.find((p) => p.id === selectedPatientId)?.mrn : undefined,
      doctorName,
      items: billingItems,
      subtotal: billSubtotal,
      discountAmount: billDiscount,
      cgstAmount: billCgst,
      sgstAmount: billSgst,
      totalGstAmount: billTotalGst,
      netTotal: billNetTotal,
      paymentMode,
      pharmacistName: 'Vikram Patel (Reg Pharmacist - DL: KA-B1-20B-99120)',
    });

    // Reset bill state and show printable invoice
    setBillingItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedPatientId('');
    setSelectedInvoiceToPrint(newBill);
    showNotification(`Generated GST Tax Invoice ${newBill.billNumber} for ${customerName}!`, 'success');
  };

  // Helper to calculate totals for prescription fulfillment
  const getRxBillDetails = (rx: Prescription) => {
    let subtotal = 0;
    const itemsWithPricing = rx.items.map((item) => {
      const stockItem = pharmacyItems.find((m) => m.id === item.pharmacyItemId) ||
        pharmacyItems.find((m) => m.name.toLowerCase().includes(item.medicineName.toLowerCase()));
      const unitPrice = stockItem ? stockItem.unitPrice : 45.0;
      const batchNumber = stockItem ? stockItem.batchNumber : 'RX-26-01';
      const expiryDate = stockItem ? stockItem.expiryDate : '2028-06-30';
      const hsnCode = stockItem?.hsnCode || '3004';
      const lineSubtotal = unitPrice * item.quantity;
      subtotal += lineSubtotal;
      return {
        ...item,
        pharmacyItemId: stockItem ? stockItem.id : item.pharmacyItemId,
        unitPrice,
        batchNumber,
        expiryDate,
        hsnCode,
        stockAvailable: stockItem ? stockItem.stockQuantity : 100,
        lineSubtotal,
      };
    });

    const discountAmount = (subtotal * rxDiscountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const cgstAmount = taxableAmount * 0.025;
    const sgstAmount = taxableAmount * 0.025;
    const totalGstAmount = cgstAmount + sgstAmount;
    const netTotal = taxableAmount + totalGstAmount;

    return {
      itemsWithPricing,
      subtotal,
      discountAmount,
      cgstAmount,
      sgstAmount,
      totalGstAmount,
      netTotal,
    };
  };

  const handleConfirmRxPaymentAndDispense = () => {
    if (!selectedRxForDelivery) return;
    const calc = getRxBillDetails(selectedRxForDelivery);

    const billItems: PharmacyBillItem[] = calc.itemsWithPricing.map((item) => {
      const lineTaxable = item.lineSubtotal * (1 - rxDiscountPercent / 100);
      const rowCgst = lineTaxable * 0.025;
      const rowSgst = lineTaxable * 0.025;
      return {
        pharmacyItemId: item.pharmacyItemId,
        medicineName: item.medicineName,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: rxDiscountPercent,
        cgstPercent: 2.5,
        sgstPercent: 2.5,
        totalPrice: lineTaxable + rowCgst + rowSgst,
      };
    });

    const patientRecord = patients.find((p) => p.id === selectedRxForDelivery.patientId || p.mrn === selectedRxForDelivery.patientMrn);

    // Create Pharmacy Bill
    const newBill = createPharmacyBill({
      patientType: 'OPD',
      patientName: selectedRxForDelivery.patientName,
      patientPhone: patientRecord?.phone || '+91 98450 12345',
      patientMrn: selectedRxForDelivery.patientMrn,
      doctorName: selectedRxForDelivery.doctorName,
      items: billItems,
      subtotal: calc.subtotal,
      discountAmount: calc.discountAmount,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      totalGstAmount: calc.totalGstAmount,
      netTotal: calc.netTotal,
      paymentMode: rxPaymentMode,
      pharmacistName: 'Vikram Patel (Reg Pharmacist - DL: KA-B1-20B-99120)',
    });

    // Mark prescription as dispensed with bill link
    dispensePrescription(selectedRxForDelivery.id, rxPaymentMode, newBill.id);

    // Close fulfillment modal and display printable invoice
    setSelectedRxForDelivery(null);
    setSelectedInvoiceToPrint(newBill);
    showNotification(`Prescription fulfilled! Dispatched medicines and generated bill ${newBill.billNumber}`, 'success');
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `MED-${String(pharmacyItems.length + 1).padStart(3, '0')}`;

    addPharmacyItem({
      ...itemForm,
      itemCode: code,
      stockQuantity: Number(itemForm.stockQuantity),
      reorderLevel: Number(itemForm.reorderLevel),
      unitPrice: Number(itemForm.unitPrice),
    });

    setIsAddItemModalOpen(false);
    showNotification(`Added new drug ${itemForm.name} to Indian formulary master`, 'success');
  };

  const filteredItems = pharmacyItems.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = pharmacyItems.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Central Hospital Pharmacy & Individual Medicine Invoicing Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual medicine GST billing, drug formulary management, prescription fulfillment & retail cash counter.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lowStockCount > 0 && (
            <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              {lowStockCount} Drugs Below Reorder Level
            </span>
          )}
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Add Formulary Drug
          </button>
        </div>
      </div>

      {/* Interactive Material UI Tabs with Live Badges */}
      <div className="bg-white px-3 py-1 rounded-2xl border border-slate-200 shadow-xs">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 46,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: '#0d9488',
            },
          }}
        >
          <Tab
            value="billing"
            icon={<Receipt className="w-4 h-4" />}
            iconPosition="start"
            label="Individual Medicine Billing"
            sx={{ fontWeight: 700, fontSize: '0.8rem', minHeight: 46 }}
          />
          <Tab
            value="history"
            icon={<FileText className="w-4 h-4" />}
            iconPosition="start"
            label={
              <div className="flex items-center gap-1.5">
                <span>Invoices Register</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full">
                  {pharmacyBills.length}
                </span>
              </div>
            }
            sx={{ fontWeight: 700, fontSize: '0.8rem', minHeight: 46 }}
          />
          <Tab
            value="inventory"
            icon={<Package className="w-4 h-4" />}
            iconPosition="start"
            label={
              <div className="flex items-center gap-1.5">
                <span>Formulary & Stock</span>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded-full">
                  {pharmacyItems.length}
                </span>
              </div>
            }
            sx={{ fontWeight: 700, fontSize: '0.8rem', minHeight: 46 }}
          />
          <Tab
            value="prescriptions"
            icon={<Pill className="w-4 h-4" />}
            iconPosition="start"
            label={
              <div className="flex items-center gap-1.5">
                <span>Doctor Prescriptions Desk</span>
                {prescriptions.filter((p) => !p.isDispensed).length > 0 && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full animate-pulse">
                    {prescriptions.filter((p) => !p.isDispensed).length} Pending
                  </span>
                )}
              </div>
            }
            sx={{ fontWeight: 700, fontSize: '0.8rem', minHeight: 46 }}
          />
        </Tabs>
      </div>

      {/* Tab 1: Individual Medicine Billing (GST Invoice) */}
      {activeTab === 'billing' && (
        <form onSubmit={handleGenerateIndividualBill} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Patient Info & Medicine Entry */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer / Patient Selection Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600" />
                    Patient / Customer Details for Pharmacy Invoice
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    {(['Walk-in', 'OPD', 'IPD'] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => {
                          setPatientType(t);
                          if (t === 'Walk-in') setSelectedPatientId('');
                        }}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          patientType === t
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {patientType !== 'Walk-in' ? (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Select Hospital Patient *
                      </label>
                      <select
                        value={selectedPatientId}
                        onChange={(e) => handlePatientSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
                      >
                        <option value="">-- Choose Registered Patient --</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} ({p.mrn})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Customer / Patient Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mobile Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 00000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Prescribed By Doctor *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sharma"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medicine Item Selector Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    Add Medicines to Bill (HSN Code 3004 / 5% GST)
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Date: {formatDate(new Date().toISOString())}
                  </span>
                </div>

                {/* Add Row Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-6">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Select Drug from Formulary *
                    </label>
                    <select
                      value={selectedMedId}
                      onChange={(e) => setSelectedMedId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="">-- Choose Medicine --</option>
                      {pharmacyItems.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.name} | Batch: {med.batchNumber} | Exp: {formatDate(med.expiryDate)} | MRP: {formatCurrency(med.unitPrice)} (Stock: {med.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Qty *</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={itemDiscount}
                      onChange={(e) => setItemDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-bold text-teal-700"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <Button
                      type="button"
                      variant="contained"
                      disabled={!selectedMedId}
                      onClick={handleAddMedicineToBill}
                      fullWidth
                      startIcon={<PlusCircle className="w-4 h-4" />}
                      sx={{
                        py: 1,
                        fontSize: '0.8rem',
                        borderRadius: 2.5,
                        backgroundColor: '#0d9488',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#0f766e' },
                      }}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Billing Table */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto mt-3">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Medicine & Form</th>
                        <th className="py-2.5 px-3">Batch & Exp (DD-MM-YYYY)</th>
                        <th className="py-2.5 px-3">HSN</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">MRP (₹)</th>
                        <th className="py-2.5 px-3">Disc %</th>
                        <th className="py-2.5 px-3">GST (5%)</th>
                        <th className="py-2.5 px-3 text-right">Total (₹)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billingItems.length > 0 ? (
                        billingItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{item.medicineName}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                              {item.batchNumber} | {formatDate(item.expiryDate)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{item.hsnCode}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{item.quantity}</td>
                            <td className="py-2.5 px-3">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-2.5 px-3 text-teal-700 font-semibold">{item.discountPercent}%</td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono text-[10px]">
                              CGST: 2.5% + SGST: 2.5%
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-slate-900 text-right">
                              {formatCurrency(item.totalPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveBillingItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                            No medicines added yet. Choose a drug from the dropdown above and click "+ Add Item".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Bill Summary & Checkout */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>GST Bill Summary</span>
                  <Badge variant="purple" size="sm">
                    {billingItems.length} items
                  </Badge>
                </h3>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Total (MRP):</span>
                    <span className="font-semibold">{formatCurrency(billSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-teal-700 font-semibold">
                    <span>Trade Discount:</span>
                    <span>-{formatCurrency(billDiscount)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                    <span>Taxable Value:</span>
                    <span className="font-semibold">{formatCurrency(taxableAmount)}</span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST (2.5%):</span>
                    <span>+{formatCurrency(billCgst)}</span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>SGST (2.5%):</span>
                    <span>+{formatCurrency(billSgst)}</span>
                  </div>

                  <div className="flex justify-between text-slate-700 font-semibold pt-2 border-t border-slate-100">
                    <span>Total GST:</span>
                    <span>{formatCurrency(billTotalGst)}</span>
                  </div>

                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-sm">
                    <span className="font-extrabold text-teal-900">NET AMOUNT PAYABLE:</span>
                    <span className="font-black text-lg text-teal-800">
                      {formatCurrency(billNetTotal)}
                    </span>
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="mt-5 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Payment Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['UPI / QR Code', 'Cash', 'Debit/Credit Card'] as const).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`p-2 rounded-xl border text-center font-bold transition-all ${
                          paymentMode === mode
                            ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-500'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {mode === 'UPI / QR Code' && <QrCode className="w-4 h-4 mx-auto mb-1 text-teal-600" />}
                        {mode === 'Cash' && <Banknote className="w-4 h-4 mx-auto mb-1 text-emerald-600" />}
                        {mode === 'Debit/Credit Card' && <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-600" />}
                        <span className="text-[11px] block">{mode === 'Debit/Credit Card' ? 'Card' : mode}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic UPI QR Code Display for Retail Cashier & Patient */}
                  {paymentMode === 'UPI / QR Code' && (
                    <div className="p-3 bg-slate-50 border border-teal-200 rounded-xl space-y-2 text-center">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-teal-800">
                          <QrCode className="w-3.5 h-3.5 text-teal-600" /> Dynamic UPI QR Code
                        </span>
                        <span className="text-teal-900 font-extrabold">{formatCurrency(billNetTotal)}</span>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 inline-block shadow-xs mx-auto">
                        <svg className="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" fill="white" />
                          <rect x="10" y="10" width="24" height="24" rx="3" fill="#0f172a" />
                          <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
                          <rect x="18" y="18" width="8" height="8" rx="1" fill="#0d9488" />
                          <rect x="66" y="10" width="24" height="24" rx="3" fill="#0f172a" />
                          <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
                          <rect x="74" y="18" width="8" height="8" rx="1" fill="#0d9488" />
                          <rect x="10" y="66" width="24" height="24" rx="3" fill="#0f172a" />
                          <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
                          <rect x="18" y="74" width="8" height="8" rx="1" fill="#0d9488" />
                          <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="12" width="6" height="6" fill="#0f172a" />
                          <rect x="42" y="22" width="6" height="6" fill="#0f172a" />
                          <rect x="52" y="22" width="6" height="6" fill="#0d9488" />
                          <rect x="12" y="38" width="6" height="6" fill="#0f172a" />
                          <rect x="22" y="38" width="6" height="6" fill="#0d9488" />
                          <rect x="32" y="38" width="6" height="6" fill="#0f172a" />
                          <rect x="42" y="38" width="16" height="16" rx="3" fill="#0f172a" />
                          <rect x="45" y="41" width="10" height="10" rx="2" fill="white" />
                          <rect x="48" y="44" width="4" height="4" fill="#0d9488" />
                          <rect x="62" y="38" width="6" height="6" fill="#0f172a" />
                          <rect x="72" y="38" width="6" height="6" fill="#0d9488" />
                          <rect x="82" y="38" width="6" height="6" fill="#0f172a" />
                          <rect x="38" y="58" width="6" height="6" fill="#0d9488" />
                          <rect x="48" y="58" width="6" height="6" fill="#0f172a" />
                          <rect x="58" y="58" width="6" height="6" fill="#0f172a" />
                          <rect x="68" y="58" width="6" height="6" fill="#0d9488" />
                          <rect x="78" y="58" width="6" height="6" fill="#0f172a" />
                          <rect x="38" y="68" width="6" height="6" fill="#0f172a" />
                          <rect x="48" y="68" width="6" height="6" fill="#0d9488" />
                          <rect x="58" y="68" width="6" height="6" fill="#0f172a" />
                          <rect x="68" y="68" width="6" height="6" fill="#0f172a" />
                          <rect x="78" y="68" width="6" height="6" fill="#0d9488" />
                          <rect x="38" y="78" width="6" height="6" fill="#0d9488" />
                          <rect x="48" y="78" width="6" height="6" fill="#0f172a" />
                          <rect x="58" y="78" width="6" height="6" fill="#0d9488" />
                          <rect x="68" y="78" width="6" height="6" fill="#0f172a" />
                          <rect x="78" y="78" width="6" height="6" fill="#0f172a" />
                        </svg>
                        <p className="text-[10px] font-mono text-slate-500 font-bold mt-1">
                          easycarehospital@hdfcbank
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-bold">
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-sky-700">GPay</span>
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-indigo-700">PhonePe</span>
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-cyan-700">Paytm</span>
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-emerald-700">BHIM</span>
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">UPI Ref / UTR No.</label>
                        <input
                          type="text"
                          value={indivUpiRef}
                          onChange={(e) => setIndivUpiRef(e.target.value)}
                          placeholder="e.g. UPI/20261101/99221"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cash Change Calculator */}
                  {paymentMode === 'Cash' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">Cash Received (₹)</label>
                        <div className="flex gap-1">
                          {[100, 500, 1000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setIndivCashTendered(amt)}
                              className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded hover:bg-slate-100 font-semibold"
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={indivCashTendered}
                        onChange={(e) => setIndivCashTendered(Number(e.target.value))}
                        placeholder={billNetTotal ? `Min ₹${Math.ceil(billNetTotal)}` : 'Enter amount'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                      />
                      {indivCashTendered !== '' && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                          <span className="text-slate-600">Change to Return:</span>
                          <span
                            className={`font-black ${
                              Number(indivCashTendered) >= billNetTotal ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {Number(indivCashTendered) >= billNetTotal
                              ? formatCurrency(Number(indivCashTendered) - billNetTotal)
                              : `Short by ${formatCurrency(billNetTotal - Number(indivCashTendered))}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="contained"
                disabled={billingItems.length === 0}
                fullWidth
                startIcon={<Printer className="w-4 h-4" />}
                sx={{
                  py: 1.4,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  backgroundColor: '#0d9488',
                  boxShadow: '0 4px 14px 0 rgba(13, 148, 136, 0.35)',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#0f766e' },
                }}
              >
                Generate & Print Pharmacy GST Bill
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Pharmacy Invoices Register */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Pharmacy Cash Memo & GST Bill Register</h3>
            <span className="text-xs text-slate-500 font-medium">
              Total Invoices: {pharmacyBills.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Bill # & Time</th>
                <th className="py-3 px-4">Patient / Customer</th>
                <th className="py-3 px-4">Prescribing Doctor</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">GST Amount (5%)</th>
                <th className="py-3 px-4">Net Total (₹)</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pharmacyBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-sky-700">
                    {bill.billNumber}
                    <span className="text-[10px] text-slate-400 font-sans block font-normal">
                      {formatDate(bill.date)} {bill.time}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{bill.patientName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {bill.patientPhone} {bill.patientMrn ? `• ${bill.patientMrn}` : ''}
                    </p>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">{bill.doctorName}</td>

                  <td className="py-3 px-4 text-slate-600">{bill.items.length} Medicines</td>

                  <td className="py-3 px-4 text-slate-600">{formatCurrency(bill.totalGstAmount)}</td>

                  <td className="py-3 px-4 font-extrabold text-slate-900 text-sm">
                    {formatCurrency(bill.netTotal)}
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant="purple" size="sm">
                      {bill.paymentMode}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoiceToPrint(bill)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Reprint Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Tab 3: Formulary Master & Stock */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search brand, generic name, batch or HSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredItems.length} formulary items
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Medication & Indian Manufacturer</th>
                  <th className="py-3.5 px-4">Generic Salt Composition</th>
                  <th className="py-3.5 px-4">HSN Code</th>
                  <th className="py-3.5 px-4">Batch # & Expiry (DD-MM-YYYY)</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">MRP Rate (₹)</th>
                  <th className="py-3.5 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((med) => {
                  const isLow = med.stockQuantity <= med.reorderLevel;

                  return (
                    <tr key={med.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {med.dosageForm} • {med.supplier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{med.genericName}</td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                        {med.hsnCode || '3004'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-800 font-semibold">
                          {med.batchNumber}
                        </span>
                        <p className="text-[10px] text-slate-500">Exp: {formatDate(med.expiryDate)}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-extrabold ${
                              isLow ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {med.stockQuantity}
                          </span>
                          {isLow && (
                            <Badge variant="danger" size="sm">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Reorder at: {med.reorderLevel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(med.unitPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            updatePharmacyStock(med.id, 50);
                            showNotification(`Restocked 50 strips of ${med.name}`, 'success');
                          }}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: 2,
                            borderColor: '#14b8a6',
                            color: '#0f766e',
                            textTransform: 'none',
                            py: 0.5,
                            px: 1.5,
                            '&:hover': {
                              borderColor: '#0d9488',
                              backgroundColor: 'rgba(20, 184, 166, 0.08)',
                            },
                          }}
                        >
                          +50 Strips
                        </Button>
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

      {/* Tab 4: Doctor Prescriptions Desk */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{rx.patientName}</h3>
                    <p className="font-mono text-[10px] text-slate-400 font-semibold">
                      {rx.patientMrn} • Prescribed by {rx.doctorName}
                    </p>
                  </div>
                  <Badge variant={rx.isDispensed ? 'success' : 'warning'}>
                    {rx.isDispensed ? 'Dispensed' : 'Ready to Dispense'}
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Diagnosis: {rx.diagnosis}
                  </p>
                  <div className="space-y-2 divide-y divide-slate-200/50">
                    {rx.items.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.medicineName}</p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                              {item.dosage}
                            </span>
                            <span className="bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold px-1.5 py-0.5 rounded">
                              Freq: {item.frequency}
                            </span>
                            <span className={`font-bold px-1.5 py-0.5 rounded ${
                              item.mealTiming === 'Before Food'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : item.mealTiming === 'Empty Stomach'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : item.mealTiming === 'With Food'
                                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {item.mealTiming || 'After Food'}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">{item.durationDays} Days</span>
                          </div>
                          {item.instructions && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5">
                              Note: {item.instructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-teal-800 text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 block">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Order Value: <strong className="text-slate-800">{formatCurrency(rx.totalAmount || 648)}</strong>
                  </span>

                  {!rx.isDispensed ? (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setSelectedRxForDelivery(rx);
                        setRxCashTendered('');
                        setRxDiscountPercent(0);
                      }}
                      startIcon={<ShoppingBag className="w-4 h-4" />}
                      sx={{
                        py: 0.9,
                        px: 2,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: 2.5,
                        backgroundColor: '#0d9488',
                        boxShadow: '0 2px 8px 0 rgba(13, 148, 136, 0.25)',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#0f766e' },
                      }}
                    >
                      Deliver, Bill & Receive Payment
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Fulfilled & Paid ({rx.paymentMode || 'Cash'})
                      </span>
                      {rx.billId && (
                        <button
                          onClick={() => {
                            const b = pharmacyBills.find((x) => x.id === rx.billId);
                            if (b) setSelectedInvoiceToPrint(b);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View Bill
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Fulfill Prescription & Collect Payment */}
      {selectedRxForDelivery && (
        <Modal
          isOpen={Boolean(selectedRxForDelivery)}
          onClose={() => setSelectedRxForDelivery(null)}
          title="Fulfill Prescription & Collect Patient Payment"
          subtitle={`Prescription for ${selectedRxForDelivery.patientName} (${selectedRxForDelivery.patientMrn})`}
          maxWidth="2xl"
        >
          {(() => {
            const rxCalc = getRxBillDetails(selectedRxForDelivery);

            return (
              <div className="space-y-4 text-xs font-sans">
                {/* Meta Header */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Patient</span>
                    <p className="font-bold text-slate-900">{selectedRxForDelivery.patientName}</p>
                    <p className="font-mono text-[10px] text-slate-500">{selectedRxForDelivery.patientMrn}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Prescribed By</span>
                    <p className="font-bold text-slate-900">{selectedRxForDelivery.doctorName}</p>
                    <p className="text-[10px] text-slate-500">OPD Consultation</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Diagnosis</span>
                    <p className="font-bold text-slate-800 truncate">{selectedRxForDelivery.diagnosis}</p>
                    <p className="text-[10px] text-slate-500">Date: {selectedRxForDelivery.date}</p>
                  </div>
                </div>

                {/* Prescribed Items & Stock Status */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <div className="p-2.5 bg-slate-100 font-bold text-slate-700 flex justify-between items-center text-[11px] min-w-[550px]">
                    <span>Medicines to Deliver & Dispense ({selectedRxForDelivery.items.length} items)</span>
                    <span className="text-slate-500 font-normal">HSN Code: 3004 (Medicaments)</span>
                  </div>
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Medicine & Dosage</th>
                        <th className="py-2 px-3">Frequency</th>
                        <th className="py-2 px-3">Meal Timing</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">MRP (₹)</th>
                        <th className="py-2 px-3 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rxCalc.itemsWithPricing.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3">
                            <span className="font-bold text-slate-800">{item.medicineName}</span>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>{item.dosage}</span>
                              <span>•</span>
                              <span>Batch: {item.batchNumber}</span>
                              <span>•</span>
                              <span className={item.stockAvailable >= item.quantity ? 'text-emerald-600 font-medium' : 'text-rose-600 font-bold'}>
                                {item.stockAvailable >= item.quantity ? `In Stock (${item.stockAvailable})` : `Low (${item.stockAvailable})`}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded">
                              {item.frequency}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.mealTiming === 'Before Food'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {item.mealTiming || 'After Food'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-center text-teal-800">{item.quantity}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(item.lineSubtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Billing Breakdown & Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Left: Payment Method Selection */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Select Payment Mode *
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'UPI / QR Code', icon: QrCode, label: 'UPI / QR' },
                        { id: 'Cash', icon: Banknote, label: 'Cash' },
                        { id: 'Debit/Credit Card', icon: CreditCard, label: 'Card' },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSel = rxPaymentMode === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setRxPaymentMode(m.id as any)}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              isSel
                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-[11px] font-bold">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* QR Code view */}
                    {rxPaymentMode === 'UPI / QR Code' && (
                      <div className="p-3 bg-white border border-teal-200 rounded-lg text-center space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-teal-900 flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-teal-600" /> Dynamic Hospital UPI QR
                          </span>
                          <span className="font-extrabold text-teal-800">{formatCurrency(rxCalc.netTotal)}</span>
                        </div>
                        {/* QR Code SVG */}
                        <div className="bg-white p-2 rounded border border-slate-200 inline-block shadow-xs">
                          <svg className="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" fill="white" />
                            <rect x="10" y="10" width="24" height="24" rx="3" fill="#0f172a" />
                            <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
                            <rect x="18" y="18" width="8" height="8" rx="1" fill="#0d9488" />
                            <rect x="66" y="10" width="24" height="24" rx="3" fill="#0f172a" />
                            <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
                            <rect x="74" y="18" width="8" height="8" rx="1" fill="#0d9488" />
                            <rect x="10" y="66" width="24" height="24" rx="3" fill="#0f172a" />
                            <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
                            <rect x="18" y="74" width="8" height="8" rx="1" fill="#0d9488" />
                            <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
                            <rect x="48" y="12" width="6" height="6" fill="#0f172a" />
                            <rect x="42" y="22" width="6" height="6" fill="#0f172a" />
                            <rect x="52" y="22" width="6" height="6" fill="#0d9488" />
                            <rect x="12" y="38" width="6" height="6" fill="#0f172a" />
                            <rect x="22" y="38" width="6" height="6" fill="#0d9488" />
                            <rect x="32" y="38" width="6" height="6" fill="#0f172a" />
                            <rect x="42" y="38" width="16" height="16" rx="3" fill="#0f172a" />
                            <rect x="45" y="41" width="10" height="10" rx="2" fill="white" />
                            <rect x="48" y="44" width="4" height="4" fill="#0d9488" />
                            <rect x="62" y="38" width="6" height="6" fill="#0f172a" />
                            <rect x="72" y="38" width="6" height="6" fill="#0d9488" />
                            <rect x="82" y="38" width="6" height="6" fill="#0f172a" />
                            <rect x="38" y="58" width="6" height="6" fill="#0d9488" />
                            <rect x="48" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="58" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="68" y="58" width="6" height="6" fill="#0d9488" />
                            <rect x="78" y="58" width="6" height="6" fill="#0f172a" />
                            <rect x="38" y="68" width="6" height="6" fill="#0f172a" />
                            <rect x="48" y="68" width="6" height="6" fill="#0d9488" />
                            <rect x="58" y="68" width="6" height="6" fill="#0f172a" />
                            <rect x="68" y="68" width="6" height="6" fill="#0f172a" />
                            <rect x="78" y="68" width="6" height="6" fill="#0d9488" />
                            <rect x="38" y="78" width="6" height="6" fill="#0d9488" />
                            <rect x="48" y="78" width="6" height="6" fill="#0f172a" />
                            <rect x="58" y="78" width="6" height="6" fill="#0d9488" />
                            <rect x="68" y="78" width="6" height="6" fill="#0f172a" />
                            <rect x="78" y="78" width="6" height="6" fill="#0f172a" />
                          </svg>
                          <p className="text-[10px] font-mono font-bold text-slate-600 mt-1">
                            easycarehospital@hdfcbank
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-bold">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-sky-700">GPay</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-700">PhonePe</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-cyan-700">Paytm</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-emerald-700">BHIM</span>
                        </div>
                        <div className="text-left">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">UPI Ref / UTR No.</label>
                          <input
                            type="text"
                            value={rxUpiRef}
                            onChange={(e) => setRxUpiRef(e.target.value)}
                            placeholder="UTR / Transaction Ref #"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {/* Cash view */}
                    {rxPaymentMode === 'Cash' && (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">Cash Tendered (₹)</span>
                          <div className="flex gap-1">
                            {[100, 500, 1000].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setRxCashTendered(c)}
                                className="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded font-semibold"
                              >
                                ₹{c}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="number"
                          value={rxCashTendered}
                          onChange={(e) => setRxCashTendered(Number(e.target.value))}
                          placeholder={`Min ₹${Math.ceil(rxCalc.netTotal)}`}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold"
                        />
                        {rxCashTendered !== '' && (
                          <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="text-slate-600">Change to Return:</span>
                            <span className={`font-black ${Number(rxCashTendered) >= rxCalc.netTotal ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {Number(rxCashTendered) >= rxCalc.netTotal
                                ? formatCurrency(Number(rxCashTendered) - rxCalc.netTotal)
                                : `Short by ${formatCurrency(rxCalc.netTotal - Number(rxCashTendered))}`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Price Breakdown */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-800 uppercase text-[11px] block border-b border-slate-200 pb-1">
                        Invoice Total Breakdown
                      </span>
                      <div className="flex justify-between text-slate-600">
                        <span>Gross Total (MRP):</span>
                        <span className="font-semibold">{formatCurrency(rxCalc.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST (2.5%):</span>
                        <span className="font-semibold">+{formatCurrency(rxCalc.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST (2.5%):</span>
                        <span className="font-semibold">+{formatCurrency(rxCalc.sgstAmount)}</span>
                      </div>
                      <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-xs mt-2">
                        <span className="font-extrabold text-teal-900">NET PAYABLE:</span>
                        <span className="font-black text-base text-teal-800">
                          {formatCurrency(rxCalc.netTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRxForDelivery(null)}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <Button
                        type="button"
                        variant="contained"
                        onClick={handleConfirmRxPaymentAndDispense}
                        startIcon={<CheckCircle2 className="w-4 h-4" />}
                        sx={{
                          px: 3,
                          py: 1,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: 2.5,
                          backgroundColor: '#0d9488',
                          textTransform: 'none',
                          boxShadow: '0 4px 12px 0 rgba(13, 148, 136, 0.3)',
                          '&:hover': { backgroundColor: '#0f766e' },
                        }}
                      >
                        Confirm Payment & Deliver Medicines
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Official Indian Pharmacy GST Tax Invoice / Cash Memo Modal */}
      {selectedInvoiceToPrint && (
        <Modal
          isOpen={Boolean(selectedInvoiceToPrint)}
          onClose={() => setSelectedInvoiceToPrint(null)}
          title="Official Pharmacy GST Tax Invoice / Cash Memo"
          subtitle={`Bill No: ${selectedInvoiceToPrint.billNumber}`}
          maxWidth="2xl"
        >
          <div className="p-6 bg-white border border-slate-300 rounded-xl space-y-5 text-xs font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {(hospitalProfile?.hospitalName || 'EASY CARE SUPER-SPECIALITY HOSPITAL').toUpperCase()} PHARMACY
                </h2>
                <p className="text-[11px] text-slate-600">
                  Licensed 24x7 Inpatient & Retail Medical Dispensary • {hospitalProfile?.address || '124/B Healthcare Boulevard, Metro District, Bengaluru - 560001'}
                </p>
                <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                  <p>Drug License No: <strong className="text-slate-800">{hospitalProfile?.drugLicenseNumber || 'KA-B1-20B-99120 & 21B-99121'}</strong></p>
                  <p>GSTIN: <strong className="text-slate-800">{hospitalProfile?.gstin || '29AABCE9988D1Z5'}</strong> • Phone: <strong className="text-slate-800">{hospitalProfile?.phone || '+91 80 4910 2200'}</strong></p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                  TAX INVOICE / CASH MEMO
                </span>
                <p className="text-[11px] font-mono font-bold text-slate-900 mt-1.5">
                  {selectedInvoiceToPrint.billNumber}
                </p>
                <p className="text-[10px] text-slate-500">
                  Date: {formatDate(selectedInvoiceToPrint.date)} {selectedInvoiceToPrint.time}
                </p>
              </div>
            </div>

            {/* Patient & Doctor Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Patient Name</span>
                <p className="font-bold text-slate-900">{selectedInvoiceToPrint.patientName}</p>
                <p className="text-[10px] font-mono text-slate-500">
                  {selectedInvoiceToPrint.patientPhone}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Prescribing Doctor</span>
                <p className="font-bold text-slate-900">{selectedInvoiceToPrint.doctorName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Mode</span>
                <p className="font-bold text-teal-800">{selectedInvoiceToPrint.paymentMode}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5">S.No</th>
                    <th className="py-2 px-2.5">Medicine Description</th>
                    <th className="py-2 px-2.5">HSN</th>
                    <th className="py-2 px-2.5">Batch</th>
                    <th className="py-2 px-2.5">Exp (DD-MM-YYYY)</th>
                    <th className="py-2 px-2.5">Qty</th>
                    <th className="py-2 px-2.5">MRP (₹)</th>
                    <th className="py-2 px-2.5">Disc%</th>
                    <th className="py-2 px-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceToPrint.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2.5 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">{it.medicineName}</td>
                      <td className="py-2 px-2.5 font-mono text-[10px] text-slate-500">{it.hsnCode}</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">{it.batchNumber}</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">{formatDate(it.expiryDate)}</td>
                      <td className="py-2 px-2.5 font-bold">{it.quantity}</td>
                      <td className="py-2 px-2.5">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2 px-2.5 text-teal-700">{it.discountPercent}%</td>
                      <td className="py-2 px-2.5 font-extrabold text-right text-slate-900">
                        {formatCurrency(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Tax Calculation Breakdown */}
            <div className="flex justify-end">
              <div className="w-72 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(selectedInvoiceToPrint.subtotal)}</span>
                </div>
                {selectedInvoiceToPrint.discountAmount > 0 && (
                  <div className="flex justify-between text-teal-700 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedInvoiceToPrint.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>CGST (2.5%):</span>
                  <span>+{formatCurrency(selectedInvoiceToPrint.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>SGST (2.5%):</span>
                  <span>+{formatCurrency(selectedInvoiceToPrint.sgstAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>TOTAL AMOUNT PAID:</span>
                  <span>{formatCurrency(selectedInvoiceToPrint.netTotal)}</span>
                </div>
              </div>
            </div>

            {/* Footer with Pharmacist Stamp & Print */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <div>
                <p className="font-bold text-slate-800">{selectedInvoiceToPrint.pharmacistName}</p>
                <p className="text-[10px] text-slate-500">Registered Pharmacist Signature & Stamp</p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print GST Cash Memo
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add New Medication to Indian Formulary Master"
        subtitle="Registers medicine with Indian HSN Code 3004, Batch No, and MRP rate."
        maxWidth="lg"
      >
        <form onSubmit={handleAddItemSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Augmentin 625 Duo"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Salt Composition *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin + Clavulanic Acid"
                value={itemForm.genericName}
                onChange={(e) => setItemForm({ ...itemForm, genericName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Drug Category *</label>
              <input
                type="text"
                required
                placeholder="e.g. Antibiotic, Antidiabetic"
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosage Form *</label>
              <input
                type="text"
                required
                placeholder="e.g. Strip of 10 Tablets"
                value={itemForm.dosageForm}
                onChange={(e) => setItemForm({ ...itemForm, dosageForm: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HSN Code *</label>
              <input
                type="text"
                required
                value={itemForm.hsnCode}
                onChange={(e) => setItemForm({ ...itemForm, hsnCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
              <input
                type="text"
                required
                value={itemForm.batchNumber}
                onChange={(e) => setItemForm({ ...itemForm, batchNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date (DD-MM-YYYY) *</label>
              <input
                type="text"
                required
                placeholder="DD-MM-YYYY"
                value={itemForm.expiryDate}
                onChange={(e) => setItemForm({ ...itemForm, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Stock (Strips / Units) *</label>
              <input
                type="number"
                min="0"
                required
                value={itemForm.stockQuantity}
                onChange={(e) => setItemForm({ ...itemForm, stockQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">MRP Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={itemForm.unitPrice}
                onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold text-teal-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm"
            >
              Save Formulary Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
