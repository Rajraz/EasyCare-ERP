import React, { useState, useMemo, useRef } from 'react';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PlusCircle,
  FileSpreadsheet,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  PackageCheck,
  CornerDownLeft,
  UploadCloud,
  RefreshCw,
  Scale,
  Receipt,
  Building2,
  Download,
  Check,
  Sparkles,
  ChevronRight,
  Clock,
  Printer,
  ShieldCheck,
  CreditCard,
  Banknote,
  History,
  FileEdit,
  CheckCircle,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import {
  FinancialTransaction,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  GoodsReceiptNote,
  GrnItem,
  DebitNote,
  DebitNoteItem,
  BankStatementTransaction,
  PurchaseBill,
  PurchaseBillPayment,
  PurchaseBillStatus,
  BillClearanceStatus,
} from '../../types/hospital';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

type FinanceTab =
  | 'process'
  | 'po'
  | 'grn'
  | 'debit_notes'
  | 'payables'
  | 'brs'
  | 'pnl'
  | 'balance_sheet'
  | 'ledger';

export const FinanceView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    vendors,
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrderStatus,
    goodsReceiptNotes,
    addGoodsReceiptNote,
    debitNotes,
    addDebitNote,
    updateDebitNoteStatus,
    purchaseBills,
    addPurchaseBill,
    createPurchaseBillFromGrn,
    recordBillPayment,
    updatePurchaseBill,
    clearPurchaseBill,
    bankAccounts,
    bankStatements,
    uploadBankStatement,
    loadDemoBankStatement,
    reconcileBankTransaction,
    unreconcileBankTransaction,
    runSmartAutoReconciliation,
    getProfitAndLossStatement,
    getBalanceSheetStatement,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<FinanceTab>('process');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [poStatusFilter, setPoStatusFilter] = useState<string>('all');
  const [brsFilter, setBrsFilter] = useState<'all' | 'reconciled' | 'unmatched'>('all');
  const [payablesFilter, setPayablesFilter] = useState<
    'all' | 'unpaid' | 'partially_paid' | 'paid' | 'pending_clearance' | 'cleared'
  >('all');

  // Modals
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState(false);
  const [isNewGrnModalOpen, setIsNewGrnModalOpen] = useState(false);
  const [isNewDebitNoteModalOpen, setIsNewDebitNoteModalOpen] = useState(false);
  const [isUploadStatementModalOpen, setIsUploadStatementModalOpen] = useState(false);
  const [selectedPoForView, setSelectedPoForView] = useState<PurchaseOrder | null>(null);
  const [selectedGrnForView, setSelectedGrnForView] = useState<GoodsReceiptNote | null>(null);
  const [selectedDebitNoteForView, setSelectedDebitNoteForView] = useState<DebitNote | null>(null);

  // Payables & Payment Modals State
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<PurchaseBill | null>(null);
  const [selectedBillForView, setSelectedBillForView] = useState<PurchaseBill | null>(null);
  const [selectedBillForEdit, setSelectedBillForEdit] = useState<PurchaseBill | null>(null);
  const [billEditForm, setBillEditForm] = useState({
    vendorInvoiceNo: '',
    billDate: '',
    dueDate: '',
    department: 'Central Hospital Pharmacy',
    subtotal: 0,
    taxAmount: 0,
    freightOrAdjustments: 0,
    debitNoteDeduction: 0,
    clearanceStatus: 'cleared' as BillClearanceStatus,
    clearedBy: 'Store In-Charge & Clearance Desk',
    clearanceNotes: '',
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMode: 'Bank Transfer (RTGS/NEFT)' as PurchaseBillPayment['paymentMode'],
    bankAccountId: bankAccounts[0]?.id || '',
    referenceNo: '',
    notes: '',
  });

  // File Upload State for BRS
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [autoReconcileFeedback, setAutoReconcileFeedback] = useState<string | null>(null);

  // 1. Transaction Form State
  const [txForm, setTxForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'Medical Supplies',
    amount: 15000,
    description: '',
    paymentChannel: 'Bank Transfer',
  });

  // 2. Purchase Order Form State
  const [poForm, setPoForm] = useState({
    vendorName: vendors[0]?.name || 'Cipla Healthcare & Lifesciences Ltd',
    vendorContact: vendors[0]?.phone || '+91 98201 44550',
    department: 'Central Hospital Pharmacy',
    expectedDeliveryDate: '05-11-2026',
    paymentTerms: '30 Days Net',
    notes: '',
  });

  const [poItems, setPoItems] = useState<
    Array<{
      itemName: string;
      category: PurchaseOrderItem['category'];
      quantity: number;
      unit: string;
      unitPrice: number;
      taxRatePercent: number;
    }>
  >([
    {
      itemName: 'Meropenem 1g IV Injection Vials',
      category: 'Pharmaceuticals',
      quantity: 100,
      unit: 'Vials',
      unitPrice: 850,
      taxRatePercent: 12,
    },
  ]);

  // 3. GRN Form State
  const [grnForm, setGrnForm] = useState({
    poId: '',
    vendorName: vendors[0]?.name || 'Cipla Healthcare & Lifesciences Ltd',
    invoiceOrChallanNo: 'CH-2026-' + Math.floor(1000 + Math.random() * 9000),
    receiptDate: formatDate(new Date().toISOString()),
    receivedBy: 'Chief Pharmacist Vikram Patel',
    inspectedBy: 'Quality Assurance Pharmacist',
    qcStatus: 'passed' as 'passed' | 'partial_pass' | 'failed',
    stockUpdated: true,
    autoDebitNote: true,
    autoInwardBill: true,
    notes: 'Inward verification completed at Receiving Bay.',
  });

  const [grnItems, setGrnItems] = useState<
    Array<{
      itemName: string;
      orderedQty: number;
      receivedQty: number;
      acceptedQty: number;
      rejectedQty: number;
      rejectionReason: string;
      unit: string;
      unitPrice: number;
      batchNumber: string;
      expiryDate: string;
    }>
  >([
    {
      itemName: 'Meropenem 1g IV Injection Vials',
      orderedQty: 100,
      receivedQty: 100,
      acceptedQty: 90,
      rejectedQty: 10,
      rejectionReason: 'Damaged packaging seal in vial box',
      unit: 'Vials',
      unitPrice: 850,
      batchNumber: 'MER-BATCH-26',
      expiryDate: '12-2028',
    },
  ]);

  // 4. Debit Note Form State
  const [dnForm, setDnForm] = useState({
    vendorName: vendors[0]?.name || 'Cipla Healthcare & Lifesciences Ltd',
    grnNumber: '',
    vendorInvoiceRef: '',
    issueDate: formatDate(new Date().toISOString()),
    reason: 'Defective / Damaged units returned to supplier',
    itemName: 'Meropenem 1g IV Injection Vials',
    rejectedQty: 10,
    unitPrice: 850,
    taxPercent: 12,
    notes: 'Debit Note adjustment against pending vendor balance.',
  });

  // Calculate live Financial Statements
  const pnlData = useMemo(() => getProfitAndLossStatement(), [
    getProfitAndLossStatement,
    transactions,
    goodsReceiptNotes,
    debitNotes,
    purchaseBills,
  ]);

  const balanceSheetData = useMemo(() => getBalanceSheetStatement(), [
    getBalanceSheetStatement,
    transactions,
    goodsReceiptNotes,
    debitNotes,
    purchaseBills,
    bankAccounts,
  ]);

  // Bank Reconciliation stats
  const activeBank = bankAccounts[0];
  const matchedBankTransactionsCount = bankStatements.filter((s) => s.isMatched).length;
  const unmatchedBankTransactionsCount = bankStatements.filter((s) => !s.isMatched).length;
  const brsReconciledPercentage = bankStatements.length
    ? Math.round((matchedBankTransactionsCount / bankStatements.length) * 100)
    : 100;

  // Payables stats
  const totalAccountsPayableDue = purchaseBills.reduce((acc, b) => acc + b.balanceDue, 0);
  const totalVendorPaid = purchaseBills.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalDebitNotesDeducted = purchaseBills.reduce((acc, b) => acc + b.debitNoteDeduction, 0);
  const pendingBillsCount = purchaseBills.filter((b) => b.balanceDue > 0).length;

  // --- Handlers ---
  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = `TX-${txForm.type === 'income' ? 'REV' : 'EXP'}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    addTransaction({
      ref: refCode,
      date: formatDate(new Date().toISOString()),
      type: txForm.type,
      category: txForm.category,
      amount: Number(txForm.amount),
      description: txForm.description || 'Hospital Operational Transaction',
      paymentChannel: txForm.paymentChannel,
    });

    setIsNewTxModalOpen(false);
    setTxForm({
      type: 'expense',
      category: 'Medical Supplies',
      amount: 15000,
      description: '',
      paymentChannel: 'Bank Transfer',
    });
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedPoNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const formattedItems: PurchaseOrderItem[] = poItems.map((item, idx) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const taxAmount = (lineSubtotal * item.taxRatePercent) / 100;
      return {
        id: `poi-${Date.now()}-${idx}`,
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        taxRatePercent: item.taxRatePercent,
        taxAmount,
        totalPrice: lineSubtotal + taxAmount,
      };
    });

    const subtotal = formattedItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const taxTotal = formattedItems.reduce((acc, i) => acc + i.taxAmount, 0);
    const grandTotal = subtotal + taxTotal;

    addPurchaseOrder({
      poNumber: generatedPoNumber,
      vendorName: poForm.vendorName,
      vendorContact: poForm.vendorContact,
      orderDate: formatDate(new Date().toISOString()),
      expectedDeliveryDate: poForm.expectedDeliveryDate,
      department: poForm.department,
      items: formattedItems,
      subtotal,
      taxTotal,
      discountTotal: 0,
      grandTotal,
      paymentTerms: poForm.paymentTerms,
      notes: poForm.notes,
      status: 'approved',
      createdBy: 'Store In-Charge & Procurement Officer',
      approvedBy: 'Medical Superintendent',
    });

    setIsNewPoModalOpen(false);
    setActiveTab('po');
  };

  const handleCreateGrn = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedGrnNumber = `GRN-2026-${Math.floor(100 + Math.random() * 900)}`;

    const formattedGrnItems: GrnItem[] = grnItems.map((item, idx) => {
      const acceptedAmount = item.acceptedQty * item.unitPrice;
      const rejectedAmount = item.rejectedQty * item.unitPrice;
      return {
        id: `grni-${Date.now()}-${idx}`,
        itemName: item.itemName,
        orderedQty: Number(item.orderedQty),
        receivedQty: Number(item.receivedQty),
        acceptedQty: Number(item.acceptedQty),
        rejectedQty: Number(item.rejectedQty),
        rejectionReason: item.rejectionReason,
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        acceptedAmount,
        rejectedAmount,
      };
    });

    const totalAcceptedAmount = formattedGrnItems.reduce((acc, i) => acc + i.acceptedAmount, 0);
    const totalRejectedAmount = formattedGrnItems.reduce((acc, i) => acc + i.rejectedAmount, 0);

    const grnStatus =
      totalRejectedAmount > 0
        ? totalAcceptedAmount > 0
          ? 'partial_rejection'
          : 'rejected'
        : 'inspected_accepted';

    const res = addGoodsReceiptNote(
      {
        grnNumber: generatedGrnNumber,
        poId: grnForm.poId || undefined,
        poNumber: grnForm.poId
          ? purchaseOrders.find((p) => p.id === grnForm.poId)?.poNumber
          : undefined,
        vendorName: grnForm.vendorName,
        invoiceOrChallanNo: grnForm.invoiceOrChallanNo,
        receiptDate: grnForm.receiptDate,
        receivedBy: grnForm.receivedBy,
        inspectedBy: grnForm.inspectedBy,
        qcStatus: grnForm.qcStatus,
        items: formattedGrnItems,
        totalAcceptedAmount,
        totalRejectedAmount,
        status: grnStatus,
        hasDebitNoteGenerated: false,
        stockUpdated: grnForm.stockUpdated,
        notes: grnForm.notes,
      },
      {
        autoDebitNote: grnForm.autoDebitNote,
        autoInwardBill: grnForm.autoInwardBill,
      }
    );

    setIsNewGrnModalOpen(false);
    setActiveTab(grnForm.autoInwardBill ? 'payables' : 'grn');

    setAutoReconcileFeedback(
      `GRN ${generatedGrnNumber} successfully inwarded! Pharmacy stock updated.${
        res.debitNote ? ` Debit Note ${res.debitNote.debitNoteNumber} generated.` : ''
      }${
        res.purchaseBill ? ` Inward Bill ${res.purchaseBill.billNumber} created & cleared for payment.` : ''
      }`
    );
    setTimeout(() => setAutoReconcileFeedback(null), 6000);
  };

  const handleOpenEditBillModal = (bill: PurchaseBill) => {
    setSelectedBillForEdit(bill);
    setBillEditForm({
      vendorInvoiceNo: bill.vendorInvoiceNo,
      billDate: bill.billDate,
      dueDate: bill.dueDate,
      department: bill.department || 'Central Hospital Pharmacy',
      subtotal: bill.subtotal,
      taxAmount: bill.taxAmount,
      freightOrAdjustments: bill.freightOrAdjustments || 0,
      debitNoteDeduction: bill.debitNoteDeduction || 0,
      clearanceStatus: bill.clearanceStatus || 'cleared',
      clearedBy: bill.clearedBy || 'Store In-Charge & Clearance Desk',
      clearanceNotes:
        bill.clearanceNotes ||
        'Verified 3-way match: PO rates vs GRN accepted count and vendor invoice.',
      notes: bill.notes || '',
    });
  };

  const handleInwardBillFromGrn = (grn: GoodsReceiptNote) => {
    try {
      const newBill = createPurchaseBillFromGrn(grn.id);
      setAutoReconcileFeedback(
        `Inward Purchase Bill ${newBill.billNumber} created from GRN ${grn.grnNumber}! Opening Clearance & Update inspector.`
      );
      setTimeout(() => setAutoReconcileFeedback(null), 5000);
      setActiveTab('payables');
      handleOpenEditBillModal(newBill);
    } catch (err: any) {
      alert(err?.message || 'Could not inward purchase bill');
    }
  };

  const handleSaveBillEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForEdit) return;

    const subtotal = Math.max(0, Number(billEditForm.subtotal) || 0);
    const taxAmount = Math.max(0, Number(billEditForm.taxAmount) || 0);
    const grossAmount = subtotal + taxAmount;
    const freightOrAdjustments = Number(billEditForm.freightOrAdjustments) || 0;
    const debitNoteDeduction = Math.max(0, Number(billEditForm.debitNoteDeduction) || 0);
    const netPayable = Math.max(0, grossAmount + freightOrAdjustments - debitNoteDeduction);
    const balanceDue = Math.max(0, netPayable - selectedBillForEdit.paidAmount);

    const updated = updatePurchaseBill(selectedBillForEdit.id, {
      vendorInvoiceNo: billEditForm.vendorInvoiceNo,
      billDate: billEditForm.billDate,
      dueDate: billEditForm.dueDate,
      department: billEditForm.department,
      subtotal,
      taxAmount,
      grossAmount,
      freightOrAdjustments,
      debitNoteDeduction,
      netPayable,
      balanceDue,
      clearanceStatus: billEditForm.clearanceStatus,
      clearedBy: billEditForm.clearedBy,
      clearedAt:
        billEditForm.clearanceStatus === 'cleared'
          ? selectedBillForEdit.clearedAt || formatDate(new Date().toISOString())
          : undefined,
      clearanceNotes: billEditForm.clearanceNotes,
      notes: billEditForm.notes,
    });

    setSelectedBillForEdit(null);
    setAutoReconcileFeedback(
      `Purchase Bill ${updated.billNumber} successfully updated! Clearance Status: ${updated.clearanceStatus.replace('_', ' ').toUpperCase()}.`
    );
    setTimeout(() => setAutoReconcileFeedback(null), 5000);
  };

  const handleQuickClearBill = (bill: PurchaseBill) => {
    const cleared = clearPurchaseBill(
      bill.id,
      'Store In-Charge & Clearance Desk',
      'Quick 3-way match clearance approved for payment disbursement'
    );
    setAutoReconcileFeedback(
      `Purchase Bill ${cleared.billNumber} cleared & verified for payment disbursement!`
    );
    setTimeout(() => setAutoReconcileFeedback(null), 5000);
  };

  const handleOpenPaymentModal = (bill: PurchaseBill) => {
    setSelectedBillForPayment(bill);
    setPaymentForm({
      amount: bill.balanceDue,
      paymentMode: 'Bank Transfer (RTGS/NEFT)',
      bankAccountId: bankAccounts[0]?.id || '',
      referenceNo: `RTGS-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Settlement payment for bill ${bill.billNumber}`,
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;

    if (paymentForm.amount <= 0 || paymentForm.amount > selectedBillForPayment.balanceDue) {
      alert(`Payment amount must be between ₹1 and ₹${selectedBillForPayment.balanceDue.toLocaleString()}`);
      return;
    }

    const { updatedBill, payment } = recordBillPayment(selectedBillForPayment.id, {
      amount: paymentForm.amount,
      paymentMode: paymentForm.paymentMode,
      bankAccountId: paymentForm.bankAccountId,
      referenceNo: paymentForm.referenceNo || `UTR-${Date.now()}`,
      notes: paymentForm.notes,
    });

    setSelectedBillForPayment(null);
    setAutoReconcileFeedback(
      `Payment of ₹${payment.amount.toLocaleString()} successfully recorded against Bill ${updatedBill.billNumber}! UTR: ${payment.referenceNo}. Treasury bank balance updated & matched in BRS.`
    );
    setTimeout(() => setAutoReconcileFeedback(null), 6000);
  };

  const handleCreateDebitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedDnNumber = `DN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const lineSubtotal = dnForm.rejectedQty * dnForm.unitPrice;
    const taxAmount = (lineSubtotal * dnForm.taxPercent) / 100;
    const totalAmount = lineSubtotal + taxAmount;

    const items: DebitNoteItem[] = [
      {
        id: `dni-${Date.now()}`,
        itemName: dnForm.itemName,
        rejectedQty: Number(dnForm.rejectedQty),
        unitPrice: Number(dnForm.unitPrice),
        reason: dnForm.reason,
        taxPercent: Number(dnForm.taxPercent),
        totalAmount,
      },
    ];

    addDebitNote({
      debitNoteNumber: generatedDnNumber,
      vendorName: dnForm.vendorName,
      grnNumber: dnForm.grnNumber || undefined,
      vendorInvoiceRef: dnForm.vendorInvoiceRef || undefined,
      issueDate: dnForm.issueDate,
      reason: dnForm.reason,
      items,
      subtotal: lineSubtotal,
      taxAmount,
      totalAmount,
      status: 'adjusted',
      adjustedAgainstBill: 'Vendor ledger payable deducted accordingly',
      createdBy: 'Finance & Accounts Officer',
      notes: dnForm.notes,
    });

    setIsNewDebitNoteModalOpen(false);
    setActiveTab('debit_notes');
  };

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUploading(true);

    setTimeout(() => {
      uploadBankStatement([
        {
          date: formatDate(new Date().toISOString()),
          description: `Direct RTGS Inward - TPA Health Insurance Reimbursement (${file.name})`,
          referenceNo: `STMT-UPLOAD-${Math.floor(1000 + Math.random() * 9000)}`,
          withdrawal: 0,
          deposit: 225000,
          balance: (activeBank?.currentStatementBalance || 4800000) + 225000,
          isMatched: false,
          reconciliationStatus: 'unmatched',
        },
        {
          date: formatDate(new Date().toISOString()),
          description: `Medical Equipment AMC Maintenance Cheque Clearance - GE Healthcare`,
          referenceNo: `CHQ-CLR-${Math.floor(1000 + Math.random() * 9000)}`,
          withdrawal: 45000,
          deposit: 0,
          balance: (activeBank?.currentStatementBalance || 4800000) + 180000,
          isMatched: false,
          reconciliationStatus: 'unmatched',
        },
      ]);
      setIsUploading(false);
      setIsUploadStatementModalOpen(false);
      setAutoReconcileFeedback(`Successfully processed statement: "${file.name}". 2 new entries ingested.`);
      setTimeout(() => setAutoReconcileFeedback(null), 5000);
    }, 800);
  };

  const handleAutoReconcileClick = () => {
    const res = runSmartAutoReconciliation();
    setAutoReconcileFeedback(
      `Smart Reconciliation Complete: ${res.matchedCount} transactions matched and reconciled with general ledger!`
    );
    setTimeout(() => setAutoReconcileFeedback(null), 5000);
  };

  // General Ledger Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const financialTrend = [
    { month: 'May', income: 720000, expense: 640000 },
    { month: 'Jun', income: 780000, expense: 690000 },
    { month: 'Jul', income: 820000, expense: 710000 },
    { month: 'Aug', income: 790000, expense: 730000 },
    { month: 'Sep', income: 860000, expense: 760000 },
    { month: 'Oct (Current)', income: totalIncome, expense: totalExpenses },
  ];

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ref.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const matchesStatus = poStatusFilter === 'all' || po.status === poStatusFilter;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredPurchaseBills = purchaseBills.filter((bill) => {
    const matchesStatus =
      payablesFilter === 'all' ||
      (payablesFilter === 'cleared' && bill.clearanceStatus === 'cleared') ||
      (payablesFilter === 'pending_clearance' && bill.clearanceStatus === 'pending_clearance') ||
      bill.status === payablesFilter;
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendorInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.grnNumber && bill.grnNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.poNumber && bill.poNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredBankStatements = bankStatements.filter((stmt) => {
    const matchesStatus =
      brsFilter === 'all' ||
      (brsFilter === 'reconciled' && stmt.isMatched) ||
      (brsFilter === 'unmatched' && !stmt.isMatched);
    const matchesSearch =
      stmt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stmt.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Title & Quick Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Hospital Finance, Procurement & Accounts Payable Suite
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete Process: Purchase Orders &bull; GRN Inward &bull; Debit Notes &bull; Inward Purchase Bills &bull; Payment Against Bill &bull; BRS &bull; P&L &bull; Balance Sheet
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setIsNewPoModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            New Purchase Order
          </button>
          <button
            onClick={() => setIsNewGrnModalOpen(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4" />
            Inward GRN
          </button>
          <button
            onClick={() => setActiveTab('payables')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Banknote className="w-4 h-4" />
            Payables & Bills ({pendingBillsCount})
          </button>
          <button
            onClick={() => setIsUploadStatementModalOpen(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Bank Stmt
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'process', label: 'Complete Process Hub', icon: Sparkles, badge: 'Full Flow' },
          { id: 'po', label: 'Purchase Orders', icon: FileText, count: purchaseOrders.length },
          { id: 'grn', label: 'Goods Receipt (GRN)', icon: PackageCheck, count: goodsReceiptNotes.length },
          { id: 'debit_notes', label: 'Debit Notes', icon: CornerDownLeft, count: debitNotes.length },
          { id: 'payables', label: 'Inward Bills & Payables', icon: Banknote, count: purchaseBills.length, badge: formatCurrency(totalAccountsPayableDue) },
          { id: 'brs', label: 'Bank Reconciliation (BRS)', icon: Landmark, badge: `${brsReconciledPercentage}%` },
          { id: 'pnl', label: 'Profit & Loss (P&L)', icon: TrendingUp },
          { id: 'balance_sheet', label: 'Balance Sheet', icon: Scale, badge: 'Balanced' },
          { id: 'ledger', label: 'General Ledger', icon: FileSpreadsheet, count: transactions.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as FinanceTab);
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Auto Reconcile / Action Feedback Banner */}
      {autoReconcileFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{autoReconcileFeedback}</span>
          </div>
          <button
            onClick={() => setAutoReconcileFeedback(null)}
            className="text-xs text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: COMPLETE PROCESS HUB & VISUAL ERP PIPELINE             */}
      {/* ============================================================ */}
      {activeTab === 'process' && (
        <div className="space-y-6">
          {/* Top ERP Workflow Diagram Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Full Hospital Financial & Procurement Loop
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Complete Process: Purchase Order &rarr; GRN &rarr; Inward Bill &rarr; Payment &rarr; P&L &rarr; Balance Sheet
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Every PO approved links to inward GRN inspection, Debit Note adjustments, formal Purchase Bills, Treasury payments, bank reconciliation, and automated double-entry verification.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-300 uppercase font-semibold">Accounts Payable Due</p>
                  <p className="text-xs font-bold text-emerald-300">{formatCurrency(totalAccountsPayableDue)}</p>
                </div>
              </div>
            </div>

            {/* Interactive Process Pipeline Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 relative">
              {[
                {
                  step: '01',
                  title: 'Purchase Order',
                  desc: 'Clinical vendor quotation & approval',
                  actionTab: 'po' as FinanceTab,
                  icon: FileText,
                  stat: `${purchaseOrders.length} POs`,
                  color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
                },
                {
                  step: '02',
                  title: 'GRN Inward',
                  desc: 'Physical receipt & QC batch check',
                  actionTab: 'grn' as FinanceTab,
                  icon: PackageCheck,
                  stat: `${goodsReceiptNotes.length} Received`,
                  color: 'border-teal-500/40 bg-teal-950/40 text-teal-300',
                },
                {
                  step: '03',
                  title: 'Debit Note',
                  desc: 'Deductions for rejected goods',
                  actionTab: 'debit_notes' as FinanceTab,
                  icon: CornerDownLeft,
                  stat: `${debitNotes.length} Issued`,
                  color: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
                },
                {
                  step: '04',
                  title: 'Inward Bill',
                  desc: 'Vendor bill generated from GRN',
                  actionTab: 'payables' as FinanceTab,
                  icon: Receipt,
                  stat: `${purchaseBills.length} Bills`,
                  color: 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300',
                },
                {
                  step: '05',
                  title: 'Pay Against Bill',
                  desc: 'RTGS/NEFT settlement against bill',
                  actionTab: 'payables' as FinanceTab,
                  icon: Banknote,
                  stat: formatCurrency(totalVendorPaid),
                  color: 'border-sky-500/40 bg-sky-950/40 text-sky-300',
                },
                {
                  step: '06',
                  title: 'BRS Reconcile',
                  desc: 'Bank statement auto-match',
                  actionTab: 'brs' as FinanceTab,
                  icon: Landmark,
                  stat: `${brsReconciledPercentage}% Matched`,
                  color: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
                },
                {
                  step: '07',
                  title: 'Profit & Loss',
                  desc: 'Revenues vs COGS = Net Profit',
                  actionTab: 'pnl' as FinanceTab,
                  icon: TrendingUp,
                  stat: formatCurrency(pnlData.netProfit),
                  color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
                },
                {
                  step: '08',
                  title: 'Balance Sheet',
                  desc: 'Assets = AP + Liabilities + Equity',
                  actionTab: 'balance_sheet' as FinanceTab,
                  icon: Scale,
                  stat: 'Balanced',
                  color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
                },
              ].map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.step}
                    onClick={() => setActiveTab(step.actionTab)}
                    className={`rounded-2xl p-3 border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between ${step.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/10">
                          Step {step.step}
                        </span>
                        <StepIcon className="w-3.5 h-3.5 opacity-80" />
                      </div>
                      <h3 className="font-bold text-xs text-white leading-tight">{step.title}</h3>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white truncate">{step.stat}</span>
                      <ChevronRight className="w-3 h-3 text-white/70 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High-Level Financial Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Total Accounts Payable</span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-rose-600 mt-2">
                {formatCurrency(totalAccountsPayableDue)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{pendingBillsCount} Vendor bills pending settlement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Settled to Vendors</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {formatCurrency(totalVendorPaid)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Paid via RTGS/NEFT against verified bills</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Debit Note Deductions</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <CornerDownLeft className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-600 mt-2">
                {formatCurrency(totalDebitNotesDeducted)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Quarantined goods deducted from bills</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Reconciled Treasury Bank</span>
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {formatCurrency(activeBank?.currentStatementBalance || 4892450)}
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                {brsReconciledPercentage}% Reconciled with Books
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PURCHASE ORDERS (PO)                                   */}
      {/* ============================================================ */}
      {activeTab === 'po' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search PO number, vendor or dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {['all', 'approved', 'partially_received', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setPoStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                      poStatusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNewPoModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Create PO
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Vendor & Department</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Items / Qty</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPurchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>{po.poNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{po.vendorName}</div>
                      <div className="text-[11px] text-slate-500">{po.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{po.orderDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{po.items.length} Line Items</span>
                      <p className="text-[11px] text-slate-500">
                        {po.items.reduce((acc, i) => acc + i.quantity, 0)} Units total
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(po.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          po.status === 'completed'
                            ? 'success'
                            : po.status === 'approved'
                            ? 'info'
                            : po.status === 'partially_received'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {po.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPoForView(po)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                        >
                          View Details
                        </button>
                        {po.status !== 'completed' && (
                          <button
                            onClick={() => {
                              setGrnForm((prev) => ({
                                ...prev,
                                poId: po.id,
                                vendorName: po.vendorName,
                              }));
                              setGrnItems(
                                po.items.map((i) => ({
                                  itemName: i.itemName,
                                  orderedQty: i.quantity,
                                  receivedQty: i.quantity,
                                  acceptedQty: i.quantity,
                                  rejectedQty: 0,
                                  rejectionReason: '',
                                  unit: i.unit,
                                  unitPrice: i.unitPrice,
                                  batchNumber: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
                                  expiryDate: '12-2028',
                                }))
                              );
                              setIsNewGrnModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors flex items-center gap-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Receive GRN
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: GOODS RECEIPT NOTE (GRN)                              */}
      {/* ============================================================ */}
      {activeTab === 'grn' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search GRN number, PO, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <button
              onClick={() => setIsNewGrnModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              Inward New GRN
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">GRN Number</th>
                  <th className="py-3 px-4">Supplier & Delivery Challan</th>
                  <th className="py-3 px-4">Receipt Date</th>
                  <th className="py-3 px-4">Accepted Value</th>
                  <th className="py-3 px-4">QC Status</th>
                  <th className="py-3 px-4">Debit Note</th>
                  <th className="py-3 px-4 text-right">Inward Bill & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {goodsReceiptNotes.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-teal-600" />
                        <div>
                          <span>{grn.grnNumber}</span>
                          {grn.poNumber && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Ref: {grn.poNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{grn.vendorName}</div>
                      <div className="text-[11px] text-slate-500">Challan: {grn.invoiceOrChallanNo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{grn.receiptDate}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(grn.totalAcceptedAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          grn.qcStatus === 'passed'
                            ? 'success'
                            : grn.qcStatus === 'partial_pass'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {grn.qcStatus === 'passed'
                          ? 'QC Passed'
                          : grn.qcStatus === 'partial_pass'
                          ? 'Partial Pass'
                          : 'QC Rejected'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {grn.hasDebitNoteGenerated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <CornerDownLeft className="w-3 h-3" />
                          {grn.debitNoteNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Direct Inward Purchase Bill Action & Clearance */}
                        {grn.hasBillGenerated ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                const b = purchaseBills.find(
                                  (bill) => bill.grnId === grn.id || bill.id === grn.purchaseBillId
                                );
                                if (b) setSelectedBillForView(b);
                              }}
                              className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="View Inward Purchase Bill details"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              Bill: {grn.purchaseBillNumber || 'Inwarded'}
                            </button>
                            <button
                              onClick={() => {
                                const b = purchaseBills.find(
                                  (bill) => bill.grnId === grn.id || bill.id === grn.purchaseBillId
                                );
                                if (b) handleOpenEditBillModal(b);
                              }}
                              className="px-2 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Clearance verification & update bill"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              Clear / Update
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInwardBillFromGrn(grn)}
                            className="px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                            title="Convert completed GRN to Inward Purchase Bill and open clearance inspector"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Inward & Clear Bill
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedGrnForView(grn)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                        >
                          Inspection
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: DEBIT NOTES                                            */}
      {/* ============================================================ */}
      {activeTab === 'debit_notes' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search debit note, supplier or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <button
              onClick={() => setIsNewDebitNoteModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CornerDownLeft className="w-4 h-4" />
              Issue Debit Note
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Debit Note #</th>
                  <th className="py-3 px-4">Vendor Name</th>
                  <th className="py-3 px-4">GRN / Invoice Ref</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Reason for Return</th>
                  <th className="py-3 px-4">Total Amount Debited</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {debitNotes.map((dn) => (
                  <tr key={dn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <CornerDownLeft className="w-4 h-4 text-amber-600" />
                        <span>{dn.debitNoteNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{dn.vendorName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {dn.grnNumber || dn.vendorInvoiceRef || 'Direct Adjustment'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{dn.issueDate}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={dn.reason}>
                      {dn.reason}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      -{formatCurrency(dn.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success">Adjusted in AP</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedDebitNoteForView(dn)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: INWARD PURCHASE BILLS & ACCOUNTS PAYABLE               */}
      {/* ============================================================ */}
      {activeTab === 'payables' && (
        <div className="space-y-6">
          {/* Payables KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Accounts Payable Due</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-2">
                {formatCurrency(totalAccountsPayableDue)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{pendingBillsCount} Bills awaiting payment</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Paid / Settled Amount</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-2">
                {formatCurrency(totalVendorPaid)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Disbursed via RTGS / NEFT / Cheque</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Debit Note Deductions</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-2">
                {formatCurrency(totalDebitNotesDeducted)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Credits deducted from supplier invoices</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Inward Purchase Bills</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {purchaseBills.length} Bills
              </p>
              <p className="text-xs text-slate-500 mt-1">Inwarded against approved GRNs</p>
            </div>
          </div>

          {/* Action Header & Search Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bill number, vendor, or GRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
              {(['all', 'pending_clearance', 'cleared', 'unpaid', 'partially_paid', 'paid'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setPayablesFilter(status)}
                  className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all whitespace-nowrap ${
                    payablesFilter === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'pending_clearance'
                    ? 'Pending Clearance'
                    : status === 'cleared'
                    ? 'Cleared Bills'
                    : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Inward Purchase Bills Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Bill # / Vendor Inv</th>
                  <th className="py-3 px-4">Supplier & Reference</th>
                  <th className="py-3 px-4">Bill & Due Date</th>
                  <th className="py-3 px-4 text-right">Gross Amount</th>
                  <th className="py-3 px-4 text-right">Debit Note</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Clearance</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPurchaseBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-indigo-600" />
                        <div>
                          <span>{bill.billNumber}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Inv: {bill.vendorInvoiceNo}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{bill.vendorName}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        {bill.grnNumber && <span className="bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded font-semibold">{bill.grnNumber}</span>}
                        {bill.poNumber && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">{bill.poNumber}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600">{bill.billDate}</span>
                      <span className="block text-[10px] text-slate-400">Due: {bill.dueDate}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                      {formatCurrency(bill.grossAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {bill.debitNoteDeduction > 0 ? (
                        <div>
                          <span className="font-bold text-amber-700">-{formatCurrency(bill.debitNoteDeduction)}</span>
                          {bill.linkedDebitNoteNo && (
                            <span className="block text-[10px] text-amber-600">{bill.linkedDebitNoteNo}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(bill.netPayable)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
                      {formatCurrency(bill.balanceDue)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {bill.clearanceStatus === 'cleared' ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                          title={`Cleared by ${bill.clearedBy || 'Accounts'}${bill.clearedAt ? ` on ${bill.clearedAt}` : ''}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Cleared
                        </span>
                      ) : bill.clearanceStatus === 'on_hold' ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                          title="Bill is on hold / under query"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          On Hold
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickClearBill(bill)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-emerald-50 hover:text-emerald-700 border border-amber-200 hover:border-emerald-200 transition-colors"
                          title="Click to clear for payment"
                        >
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending &bull; Clear
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          bill.status === 'paid'
                            ? 'success'
                            : bill.status === 'partially_paid'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {bill.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditBillModal(bill)}
                          className="px-2 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Update bill amounts, invoice details or clearance status"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          Clear / Update
                        </button>

                        {bill.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenPaymentModal(bill)}
                            className="px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Bill
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedBillForView(bill)}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: BANK RECONCILIATION (BRS)                              */}
      {/* ============================================================ */}
      {activeTab === 'brs' && (
        <div className="space-y-6">
          {/* Bank Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Statement Balance</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {formatCurrency(activeBank?.currentStatementBalance || 4892450)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {activeBank?.bankName} &bull; A/c: {activeBank?.accountNumber}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">ERP Book Balance</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {formatCurrency(activeBank?.erpBookBalance || 4946450)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Hospital general ledger cash book</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">BRS Status</span>
                <span className="text-xs font-bold text-emerald-600">{brsReconciledPercentage}% Reconciled</span>
              </div>
              <p className="text-2xl font-extrabold text-amber-600 mt-2">
                {formatCurrency(activeBank?.unreconciledDifference || 54000)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Timing difference (Cheques in transit)</p>
            </div>
          </div>

          {/* Action Header & Upload Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Bank Statement Transactions & Match Engine
              </h2>
              <p className="text-xs text-slate-500">
                Upload bank e-statements (CSV / Excel) or run smart automatic matching against ERP ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={handleAutoReconcileClick}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Run Smart Auto-Reconcile
              </button>
              <button
                onClick={() => setIsUploadStatementModalOpen(true)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={loadDemoBankStatement}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                Reset HDFC Demo
              </button>
            </div>
          </div>

          {/* Bank Statement Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter statement rows by ref or desc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                {(['all', 'reconciled', 'unmatched'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setBrsFilter(filter)}
                    className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                      brsFilter === filter
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Narration</th>
                  <th className="py-3 px-4">Reference No</th>
                  <th className="py-3 px-4 text-right">Debit / Withdrawal</th>
                  <th className="py-3 px-4 text-right">Credit / Deposit</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBankStatements.map((stmt) => (
                  <tr key={stmt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{stmt.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{stmt.description}</span>
                      {stmt.matchedLedgerRef && (
                        <span className="block text-[11px] text-emerald-600 font-medium">
                          Matched with: {stmt.matchedLedgerRef}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {stmt.referenceNo}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {stmt.withdrawal > 0 ? `-${formatCurrency(stmt.withdrawal)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {stmt.deposit > 0 ? `+${formatCurrency(stmt.deposit)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={stmt.isMatched ? 'success' : 'warning'}>
                        {stmt.isMatched ? 'Reconciled' : 'Unmatched'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {stmt.isMatched ? (
                        <button
                          onClick={() => unreconcileBankTransaction(stmt.id)}
                          className="px-2.5 py-1 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg font-semibold transition-colors text-[11px]"
                        >
                          Unmatch
                        </button>
                      ) : (
                        <button
                          onClick={() => reconcileBankTransaction(stmt.id)}
                          className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors text-[11px]"
                        >
                          Mark Matched
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Formal Bank Reconciliation Statement (BRS) Audit Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              Formal Bank Reconciliation Statement (As on 31-10-2026)
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-700">Balance as per Bank Statement (HDFC Treasury A/c):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(activeBank?.currentStatementBalance || 4892450)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 text-emerald-700">
                <span>Add: Cheques Deposited but pending clearance in transit (MediAssist):</span>
                <span className="font-bold">+₹1,85,000.00</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 text-rose-700">
                <span>Less: Outstanding Cheques Issued to Vendors not yet presented (B. Braun #409211):</span>
                <span className="font-bold">-₹1,31,000.00</span>
              </div>
              <div className="flex justify-between py-2 text-slate-900 text-sm font-extrabold bg-white p-3 rounded-xl border border-slate-200 mt-2">
                <span className="text-emerald-700">Adjusted Book Balance (Matches General Ledger):</span>
                <span className="text-emerald-700">
                  {formatCurrency(activeBank?.erpBookBalance || 4946450)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: PROFIT & LOSS (P&L) STATEMENT                          */}
      {/* ============================================================ */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-600 tracking-wider">
                Comprehensive Healthcare Operating Statement
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Profit & Loss (P&L) Account &bull; {pnlData.period}
              </h2>
              <p className="text-xs text-slate-500">
                Live automated rollup of Clinical Inpatient/OPD revenues, Procurement COGS (net of Debit Notes), and overhead expenses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                Net Margin: {pnlData.netMarginPercent}%
              </span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print P&L
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-200 text-xs font-medium">
              {/* Section 1: Revenue */}
              <div className="p-5">
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 mb-3">
                  <span className="flex items-center gap-2 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                    I. REVENUE FROM HEALTHCARE OPERATIONS
                  </span>
                  <span className="text-emerald-700">{formatCurrency(pnlData.revenues.totalRevenue)}</span>
                </div>
                <div className="space-y-2 pl-4 text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Inpatient (IPD) Bed Charges, Nursing & Surgeries:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.revenues.ipdBedAndNursing)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Central Pharmacy Retail & Dispensing Collections:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.revenues.pharmacySales)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Outpatient (OPD) Consultations & Registration:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.revenues.opdConsultation)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Diagnostic Pathology & Radiology Test Fees:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.revenues.labDiagnostics)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Operation Theatre (OT) & Minor Procedure Facility:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.revenues.otProcedures)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Cost of Goods Sold (COGS) */}
              <div className="p-5 bg-slate-50/50">
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 mb-3">
                  <span className="flex items-center gap-2 text-amber-700">
                    <PackageCheck className="w-4 h-4" />
                    II. COST OF GOODS SOLD (COGS / MEDICAL CONSUMPTION)
                  </span>
                  <span className="text-amber-700">-{formatCurrency(pnlData.cogs.totalCogs)}</span>
                </div>
                <div className="space-y-2 pl-4 text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Inward Pharmaceuticals & Surgical Consumables (GRN Receipts):</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.cogs.grnInwardReceipts)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Direct Emergency Medicine & Oxygen Cylinder Purchases:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.cogs.directPurchases)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                    <span>Less: Supplier Rejections & Return Credits (Debit Notes Issued):</span>
                    <span>-{formatCurrency(pnlData.cogs.debitNoteDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Gross Margin Row */}
              <div className="p-4 bg-emerald-50/70 flex justify-between font-extrabold text-sm text-emerald-900">
                <span>GROSS OPERATING PROFIT MARGIN ({pnlData.grossMarginPercent}%)</span>
                <span>{formatCurrency(pnlData.grossProfit)}</span>
              </div>

              {/* Section 3: Operating Overhead Expenses */}
              <div className="p-5">
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 mb-3">
                  <span className="flex items-center gap-2 text-rose-700">
                    <TrendingDown className="w-4 h-4" />
                    III. OPERATING OVERHEAD EXPENSES (OPEX)
                  </span>
                  <span className="text-rose-700">-{formatCurrency(pnlData.expenses.totalExpenses)}</span>
                </div>
                <div className="space-y-2 pl-4 text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Clinical, Specialist & Nursing Staff Payroll (HRM):</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.expenses.staffPayroll)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Hospital Electricity Grid, Generator Fuel & Water Utilities:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.expenses.hospitalUtilities)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Biomedical Imaging Equipment AMC & Calibration (MRI/Cath Lab):</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.expenses.medicalEquipmentMaintenance)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>NABH Administrative, Housekeeping & Waste Disposal Overheads:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(pnlData.expenses.adminAndFacilityOverhead)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Operating Income & Taxes */}
              <div className="p-5 bg-slate-50/50">
                <div className="space-y-2 pl-4 text-slate-700">
                  <div className="flex justify-between py-1 font-bold text-slate-900">
                    <span>Operating Profit Before Depreciation & Tax (EBITDA):</span>
                    <span>{formatCurrency(pnlData.operatingIncome)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200">
                    <span>Less: Biomedical Equipment & Building Depreciation:</span>
                    <span>-{formatCurrency(pnlData.depreciation)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Less: Provision for Healthcare Institutional Income Tax:</span>
                    <span>-{formatCurrency(pnlData.taxProvision)}</span>
                  </div>
                </div>
              </div>

              {/* Final Net Profit */}
              <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between font-extrabold text-base rounded-b-2xl">
                <span>NET HOSPITAL SURPLUS (PROFIT FOR THE PERIOD)</span>
                <span>{formatCurrency(pnlData.netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: BALANCE SHEET                                         */}
      {/* ============================================================ */}
      {activeTab === 'balance_sheet' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-600 tracking-wider">
                Double-Entry Statement of Financial Position
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Balance Sheet &bull; As at {balanceSheetData.asOfDate}
              </h2>
              <p className="text-xs text-slate-500">
                Verification of Total Assets against Total Liabilities & Hospital Trust Capital Fund.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                Double-Entry Status: Balanced (₹0.00 Diff)
              </span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print Balance Sheet
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ASSETS COLUMN */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  Assets
                </h3>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatCurrency(balanceSheetData.assets.totalAssets)}
                </span>
              </div>

              {/* Current Assets */}
              <div>
                <h4 className="font-bold text-xs text-sky-700 uppercase mb-2">1. Current Assets</h4>
                <div className="space-y-2 text-xs font-medium pl-3 border-l-2 border-sky-100">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Cash & Reconciled Bank Treasury Balances:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.assets.currentAssets.cashAndBank)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Accounts Receivable (Patient Billing Dues):</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.assets.currentAssets.accountsReceivable)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Pharmaceuticals & Surgical Stock (Inventory):</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.assets.currentAssets.inventoryValuation)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">Other Prepaid Expenses & Deposits:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.assets.currentAssets.otherCurrentAssets)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-sky-900 text-[11px]">
                    <span>Total Current Assets:</span>
                    <span>{formatCurrency(balanceSheetData.assets.currentAssets.totalCurrentAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Non-Current / Fixed Assets */}
              <div>
                <h4 className="font-bold text-xs text-sky-700 uppercase mb-2">2. Non-Current / Fixed Assets</h4>
                <div className="space-y-2 text-xs font-medium pl-3 border-l-2 border-sky-100">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Biomedical Diagnostic Equipment (MRI, CT, Cath Lab):</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.biomedicalEquipment)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Hospital Real Estate & Inpatient Infrastructure:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.hospitalInfrastructure)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Furniture, OT Fixtures & Ambulances:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.assets.nonCurrentAssets.furnitureAndFixtures)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-rose-600 font-semibold">
                    <span>Less: Accumulated Machinery Depreciation:</span>
                    <span>
                      -{formatCurrency(balanceSheetData.assets.nonCurrentAssets.lessAccumulatedDepreciation)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-sky-900 text-[11px]">
                    <span>Total Non-Current Assets:</span>
                    <span>{formatCurrency(balanceSheetData.assets.nonCurrentAssets.totalNonCurrentAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Assets Total Row */}
              <div className="pt-3 border-t-2 border-slate-300 flex justify-between font-extrabold text-sm text-slate-900 bg-slate-50 p-3 rounded-xl">
                <span>TOTAL HOSPITAL ASSETS</span>
                <span className="text-sky-700">
                  {formatCurrency(balanceSheetData.assets.totalAssets)}
                </span>
              </div>
            </div>

            {/* LIABILITIES & CAPITAL COLUMN */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Liabilities & Equity
                </h3>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}
                </span>
              </div>

              {/* Current Liabilities */}
              <div>
                <h4 className="font-bold text-xs text-amber-700 uppercase mb-2">1. Current Liabilities</h4>
                <div className="space-y-2 text-xs font-medium pl-3 border-l-2 border-amber-100">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700 font-semibold">Accounts Payable (Vendor Bills Due):</span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(balanceSheetData.liabilities.currentLiabilities.accountsPayable)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Accrued Staff Payroll & Employee Benefits:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.liabilities.currentLiabilities.accruedStaffPayroll)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">Statutory Tax & GST Payable:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.liabilities.currentLiabilities.statutoryTaxPayable)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-amber-900 text-[11px]">
                    <span>Total Current Liabilities:</span>
                    <span>
                      {formatCurrency(balanceSheetData.liabilities.currentLiabilities.totalCurrentLiabilities)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Long Term Debt */}
              <div>
                <h4 className="font-bold text-xs text-amber-700 uppercase mb-2">2. Long-Term Liabilities</h4>
                <div className="space-y-2 text-xs font-medium pl-3 border-l-2 border-amber-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">Healthcare Infrastructure Expansion Term Loans:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.liabilities.longTermLiabilities.healthcareTermLoans)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-amber-900 text-[11px]">
                    <span>Total Long-Term Liabilities:</span>
                    <span>
                      {formatCurrency(balanceSheetData.liabilities.longTermLiabilities.totalLongTermLiabilities)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Equity & Reserves */}
              <div>
                <h4 className="font-bold text-xs text-emerald-700 uppercase mb-2">3. Hospital Equity & Capital</h4>
                <div className="space-y-2 text-xs font-medium pl-3 border-l-2 border-emerald-100">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Hospital Trust Capital Fund / Equity:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.equity.hospitalTrustCapital)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700">Retained Earnings / General Reserves:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(balanceSheetData.equity.retainedEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-700 font-bold">
                    <span>Current Period Net Surplus (Transferred from P&L):</span>
                    <span>{formatCurrency(balanceSheetData.equity.currentPeriodSurplus)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-emerald-900 text-[11px]">
                    <span>Total Hospital Equity:</span>
                    <span>{formatCurrency(balanceSheetData.equity.totalEquity)}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity Total Row */}
              <div className="pt-3 border-t-2 border-slate-300 flex justify-between font-extrabold text-sm text-slate-900 bg-slate-50 p-3 rounded-xl">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="text-emerald-700">
                  {formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 9: GENERAL LEDGER & CASH FLOW                            */}
      {/* ============================================================ */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Chart: Cash Flow Trends */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Hospital Operating Cash Flow & Ledger Inflows
                </h2>
                <p className="text-xs text-slate-500">Gross Clinical Revenue vs Operating Overhead Expenses</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                FY 2026 Monthly Trend
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Clinical Revenue"
                    stroke="#059669"
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Hospital Expenses"
                    stroke="#e11d48"
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* General Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter general ledger records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'income', 'expense'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTypeFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      typeFilter === filter
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{tx.ref}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">{tx.description}</td>
                    <td className="py-3.5 px-4 text-slate-500">{tx.paymentChannel}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS                                                       */}
      {/* ============================================================ */}

      {/* Modal: Record Payment Against Bill */}
      {selectedBillForPayment && (
        <Modal
          isOpen={!!selectedBillForPayment}
          onClose={() => setSelectedBillForPayment(null)}
          title={`Record Payment Against Bill: ${selectedBillForPayment.billNumber}`}
          subtitle={`Payee: ${selectedBillForPayment.vendorName} &bull; Inv: ${selectedBillForPayment.vendorInvoiceNo}`}
          maxWidth="lg"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-medium">
            {/* Bill Summary Alert */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Billed</span>
                <p className="font-bold text-slate-800">{formatCurrency(selectedBillForPayment.grossAmount)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Debit Note Deducted</span>
                <p className="font-bold text-amber-700">
                  {selectedBillForPayment.debitNoteDeduction > 0
                    ? `-${formatCurrency(selectedBillForPayment.debitNoteDeduction)}`
                    : '₹0.00'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Already Paid</span>
                <p className="font-bold text-emerald-700">{formatCurrency(selectedBillForPayment.paidAmount)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Balance Due Now</span>
                <p className="font-extrabold text-rose-600 text-sm">
                  {formatCurrency(selectedBillForPayment.balanceDue)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Payment Amount to Disburse (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedBillForPayment.balanceDue}
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, amount: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      paymentMode: e.target.value as PurchaseBillPayment['paymentMode'],
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Bank Transfer (RTGS/NEFT)">Bank Transfer (RTGS/NEFT)</option>
                  <option value="Cheque">Corporate Cheque</option>
                  <option value="UPI">Direct Corporate UPI</option>
                  <option value="Direct Debit">Direct Debit / Standing Instruction</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Treasury Bank Account</label>
                <select
                  value={paymentForm.bankAccountId}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, bankAccountId: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountName} ({formatCurrency(b.currentStatementBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">UTR / Cheque / Ref Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RTGS-HDFC-991201"
                  value={paymentForm.referenceNo}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, referenceNo: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Notes / Remarks</label>
              <input
                type="text"
                placeholder="Optional payment advice note..."
                value={paymentForm.notes}
                onChange={(e) =>
                  setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] leading-relaxed border border-emerald-200">
              <span className="font-bold block mb-0.5">Automated Multi-Module Synchronization:</span>
              Recording this payment will immediately reduce bill balance due, debit the bank account balance, record an outward cash transaction in the general ledger, and add a verified withdrawal in the Bank Reconciliation (BRS) module.
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedBillForPayment(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirm & Disburse Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Bill & Payment History */}
      {selectedBillForView && (
        <Modal
          isOpen={!!selectedBillForView}
          onClose={() => setSelectedBillForView(null)}
          title={`Purchase Bill: ${selectedBillForView.billNumber}`}
          subtitle={`Vendor: ${selectedBillForView.vendorName} &bull; Inv: ${selectedBillForView.vendorInvoiceNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs font-medium">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">GRN Reference</span>
                <p className="font-bold text-slate-800">{selectedBillForView.grnNumber || 'Direct'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Bill Date</span>
                <p className="font-bold text-slate-800">{selectedBillForView.billDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Due Date</span>
                <p className="font-bold text-slate-800">{selectedBillForView.dueDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Status</span>
                <p>
                  <Badge variant={selectedBillForView.status === 'paid' ? 'success' : 'warning'}>
                    {selectedBillForView.status.replace('_', ' ')}
                  </Badge>
                </p>
              </div>
            </div>

            {/* Clearance Audit Banner */}
            <div className={`p-3 rounded-xl border flex items-start gap-3 ${
              selectedBillForView.clearanceStatus === 'cleared'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : selectedBillForView.clearanceStatus === 'on_hold'
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}>
              {selectedBillForView.clearanceStatus === 'cleared' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : selectedBillForView.clearanceStatus === 'on_hold' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wide">
                    Clearance Status: {selectedBillForView.clearanceStatus.replace('_', ' ')}
                  </span>
                  {selectedBillForView.clearedAt && (
                    <span className="text-[10px] opacity-75">Date: {selectedBillForView.clearedAt}</span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5">
                  Verified by: <span className="font-semibold">{selectedBillForView.clearedBy || 'Accounts & Store Desk'}</span>
                </p>
                {selectedBillForView.clearanceNotes && (
                  <p className="text-[11px] italic mt-1 opacity-90">
                    &ldquo;{selectedBillForView.clearanceNotes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Gross Billed Subtotal (with GST):</span>
                <span className="font-bold text-slate-800">{formatCurrency(selectedBillForView.grossAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-amber-700">
                <span>Less: Debit Note Deduction ({selectedBillForView.linkedDebitNoteNo || 'None'}):</span>
                <span className="font-bold">
                  {selectedBillForView.debitNoteDeduction > 0
                    ? `-${formatCurrency(selectedBillForView.debitNoteDeduction)}`
                    : '₹0.00'}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-900 border-b border-slate-100">
                <span>Net Payable Amount:</span>
                <span>{formatCurrency(selectedBillForView.netPayable)}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700">
                <span>Total Amount Disbursed (Paid):</span>
                <span className="font-bold">{formatCurrency(selectedBillForView.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-1 text-rose-600 font-extrabold text-sm pt-1">
                <span>Outstanding Balance Due:</span>
                <span>{formatCurrency(selectedBillForView.balanceDue)}</span>
              </div>
            </div>

            {/* Payment History Audit Trail */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-600" />
                Payment Audit Trail ({selectedBillForView.payments.length} Settlements)
              </h4>

              {selectedBillForView.payments.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No payments recorded yet. Click "Pay Against Bill" to disburse funds.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Payment #</th>
                        <th className="py-2 px-3">Mode & UTR Ref</th>
                        <th className="py-2 px-3">Bank Source</th>
                        <th className="py-2 px-3 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedBillForView.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 px-3 text-slate-600">{p.paymentDate}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{p.paymentNumber}</td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-800">{p.paymentMode}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{p.referenceNo}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">{p.bankAccountName}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const b = selectedBillForView;
                    setSelectedBillForView(null);
                    handleOpenEditBillModal(b);
                  }}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileEdit className="w-4 h-4" />
                  Update / Clear Bill
                </button>

                {selectedBillForView.balanceDue > 0 && (
                  <button
                    onClick={() => {
                      const b = selectedBillForView;
                      setSelectedBillForView(null);
                      handleOpenPaymentModal(b);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Remaining {formatCurrency(selectedBillForView.balanceDue)}
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedBillForView(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Update & Clear Inward Purchase Bill */}
      {selectedBillForEdit && (
        <Modal
          isOpen={!!selectedBillForEdit}
          onClose={() => setSelectedBillForEdit(null)}
          title={`Update & Clear Purchase Bill: ${selectedBillForEdit.billNumber}`}
          subtitle={`Supplier: ${selectedBillForEdit.vendorName} &bull; Linked GRN: ${selectedBillForEdit.grnNumber || 'Direct'}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveBillEdit} className="space-y-4 text-xs font-medium">
            {/* Row 1: Vendor, Invoice Number, Department */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vendor / Supplier</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-bold truncate">
                  {selectedBillForEdit.vendorName}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vendor Invoice #</label>
                <input
                  type="text"
                  required
                  value={billEditForm.vendorInvoiceNo}
                  onChange={(e) => setBillEditForm((prev) => ({ ...prev, vendorInvoiceNo: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cost Center / Dept</label>
                <input
                  type="text"
                  value={billEditForm.department}
                  onChange={(e) => setBillEditForm((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 2: Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bill Date (DD-MM-YYYY)</label>
                <input
                  type="text"
                  required
                  value={billEditForm.billDate}
                  onChange={(e) => setBillEditForm((prev) => ({ ...prev, billDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Due Date (DD-MM-YYYY)</label>
                <input
                  type="text"
                  required
                  value={billEditForm.dueDate}
                  onChange={(e) => setBillEditForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 3: Financial Numbers */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2">
                Inward Purchase Bill Financials & Tax Adjustments
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Subtotal (Taxable ₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={billEditForm.subtotal}
                    onChange={(e) => setBillEditForm((prev) => ({ ...prev, subtotal: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">GST / Tax Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={billEditForm.taxAmount}
                    onChange={(e) => setBillEditForm((prev) => ({ ...prev, taxAmount: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Freight / Adjustments (₹)</label>
                  <input
                    type="number"
                    value={billEditForm.freightOrAdjustments}
                    onChange={(e) => setBillEditForm((prev) => ({ ...prev, freightOrAdjustments: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-amber-700 font-medium mb-1">Debit Note Deduction (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={billEditForm.debitNoteDeduction}
                    onChange={(e) => setBillEditForm((prev) => ({ ...prev, debitNoteDeduction: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Live Computation Preview */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Gross Billed:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(Number(billEditForm.subtotal) + Number(billEditForm.taxAmount))}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Net Payable:</span>
                  <span className="font-bold text-indigo-700">
                    {formatCurrency(
                      Math.max(
                        0,
                        Number(billEditForm.subtotal) +
                          Number(billEditForm.taxAmount) +
                          Number(billEditForm.freightOrAdjustments) -
                          Number(billEditForm.debitNoteDeduction)
                      )
                    )}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Paid Amount:</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(selectedBillForEdit.paidAmount)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Balance Due:</span>
                  <span className="font-extrabold text-rose-600">
                    {formatCurrency(
                      Math.max(
                        0,
                        Number(billEditForm.subtotal) +
                          Number(billEditForm.taxAmount) +
                          Number(billEditForm.freightOrAdjustments) -
                          Number(billEditForm.debitNoteDeduction) -
                          selectedBillForEdit.paidAmount
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Clearance Verification Box */}
            <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 space-y-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs uppercase tracking-wider">
                  3-Way Match & Clearance Verification Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBillEditForm((prev) => ({ ...prev, clearanceStatus: 'cleared' }))}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      billEditForm.clearanceStatus === 'cleared'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Cleared & Verified
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillEditForm((prev) => ({ ...prev, clearanceStatus: 'pending_clearance' }))}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      billEditForm.clearanceStatus === 'pending_clearance'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending Clearance
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillEditForm((prev) => ({ ...prev, clearanceStatus: 'on_hold' }))}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      billEditForm.clearanceStatus === 'on_hold'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    On Hold / Disputed
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cleared / Verified By</label>
                  <input
                    type="text"
                    value={billEditForm.clearedBy}
                    onChange={(e) => setBillEditForm((prev) => ({ ...prev, clearedBy: e.target.value }))}
                    placeholder="e.g. Chief Pharmacist Vikram Patel"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Clearance Audit Notes</label>
                  <input
                    type="text"
                    value={billEditForm.clearanceNotes}
                    onChange={(e) => setBillEditForm((prev) => ({ ...prev, clearanceNotes: e.target.value }))}
                    placeholder="e.g. PO price verified with accepted batch"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">General Notes / Remarks</label>
              <input
                type="text"
                value={billEditForm.notes}
                onChange={(e) => setBillEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedBillForEdit(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Update Bill & Save Clearance
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 1: Create Purchase Order */}
      <Modal
        isOpen={isNewPoModalOpen}
        onClose={() => setIsNewPoModalOpen(false)}
        title="Create New Clinical Purchase Order (PO)"
        subtitle="Issue purchase order for hospital pharmacy, surgical kits or diagnostic reagents"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePo} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vendor / Supplier</label>
              <select
                value={poForm.vendorName}
                onChange={(e) => {
                  const ven = vendors.find((v) => v.name === e.target.value);
                  setPoForm((prev) => ({
                    ...prev,
                    vendorName: e.target.value,
                    vendorContact: ven?.phone || '',
                  }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Department</label>
              <select
                value={poForm.department}
                onChange={(e) => setPoForm((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Central Hospital Pharmacy">Central Hospital Pharmacy</option>
                <option value="OT & Surgical Consumables Store">OT & Surgical Consumables Store</option>
                <option value="Pathology & Diagnostic Laboratory">Pathology & Diagnostic Laboratory</option>
                <option value="ICU & Emergency Drug Store">ICU & Emergency Drug Store</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expected Delivery Date</label>
              <input
                type="date"
                required
                value={poForm.expectedDeliveryDate}
                onChange={(e) => setPoForm((prev) => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Terms</label>
              <input
                type="text"
                value={poForm.paymentTerms}
                onChange={(e) => setPoForm((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                placeholder="e.g. 30 Days Net from GRN Approval"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Order Line Items
              </label>
              <button
                type="button"
                onClick={() =>
                  setPoItems((prev) => [
                    ...prev,
                    {
                      itemName: 'Disposable Syringes 5ml with Needle',
                      category: 'Surgical Consumables',
                      quantity: 500,
                      unit: 'Units',
                      unitPrice: 12,
                      taxRatePercent: 12,
                    },
                  ])
                }
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
              {poItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.itemName}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[index].itemName = e.target.value;
                        setPoItems(updated);
                      }}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[index].quantity = Number(e.target.value);
                        setPoItems(updated);
                      }}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Rate ₹"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[index].unitPrice = Number(e.target.value);
                        setPoItems(updated);
                      }}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="col-span-2 font-bold text-slate-800 text-right pr-2">
                    {formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRatePercent / 100))}
                  </div>
                  <div className="col-span-1 text-right">
                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPoItems(poItems.filter((_, i) => i !== index))}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewPoModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
            >
              Authorize & Issue PO
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Create GRN */}
      <Modal
        isOpen={isNewGrnModalOpen}
        onClose={() => setIsNewGrnModalOpen(false)}
        title="Inward Goods Receipt Note (GRN) & Quality Check"
        subtitle="Verify delivery against PO, inspect accepted vs rejected quantities, and sync inventory"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateGrn} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Supplier</label>
              <select
                value={grnForm.vendorName}
                onChange={(e) => setGrnForm((prev) => ({ ...prev, vendorName: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Challan / Invoice No</label>
              <input
                type="text"
                required
                value={grnForm.invoiceOrChallanNo}
                onChange={(e) => setGrnForm((prev) => ({ ...prev, invoiceOrChallanNo: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Receipt Date</label>
              <input
                type="text"
                value={grnForm.receiptDate}
                onChange={(e) => setGrnForm((prev) => ({ ...prev, receiptDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Inward Items Inspection Table */}
          <div>
            <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-2">
              Inward Items Quality Inspection & Rejection
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">Batch & Expiry</th>
                    <th className="py-2 px-3 text-center">Recv Qty</th>
                    <th className="py-2 px-3 text-center">Accepted</th>
                    <th className="py-2 px-3 text-center">Rejected</th>
                    <th className="py-2 px-3">Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grnItems.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="py-2 px-3 font-semibold text-slate-800">{item.itemName}</td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Batch"
                            value={item.batchNumber}
                            onChange={(e) => {
                              const updated = [...grnItems];
                              updated[index].batchNumber = e.target.value;
                              setGrnItems(updated);
                            }}
                            className="w-20 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                          />
                          <input
                            type="text"
                            placeholder="Exp"
                            value={item.expiryDate}
                            onChange={(e) => {
                              const updated = [...grnItems];
                              updated[index].expiryDate = e.target.value;
                              setGrnItems(updated);
                            }}
                            className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">{item.receivedQty}</td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={item.receivedQty}
                          value={item.acceptedQty}
                          onChange={(e) => {
                            const updated = [...grnItems];
                            const val = Number(e.target.value);
                            updated[index].acceptedQty = val;
                            updated[index].rejectedQty = Math.max(0, updated[index].receivedQty - val);
                            setGrnItems(updated);
                          }}
                          className="w-16 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-center font-bold text-emerald-800 text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          value={item.rejectedQty}
                          onChange={(e) => {
                            const updated = [...grnItems];
                            const val = Number(e.target.value);
                            updated[index].rejectedQty = val;
                            updated[index].acceptedQty = Math.max(0, updated[index].receivedQty - val);
                            setGrnItems(updated);
                          }}
                          className="w-16 px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded text-center font-bold text-rose-800 text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Reason if rejected..."
                          value={item.rejectionReason}
                          onChange={(e) => {
                            const updated = [...grnItems];
                            updated[index].rejectionReason = e.target.value;
                            setGrnItems(updated);
                          }}
                          className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs text-rose-700"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Automations Toggles */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={grnForm.stockUpdated}
                onChange={(e) => setGrnForm((prev) => ({ ...prev, stockUpdated: e.target.checked }))}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="font-semibold text-slate-800">
                Increment accepted quantities directly into Pharmacy & Surgical Store Inventory
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={grnForm.autoDebitNote}
                onChange={(e) => setGrnForm((prev) => ({ ...prev, autoDebitNote: e.target.checked }))}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold text-slate-800">
                Auto-generate and issue Debit Note for rejected items to deduct vendor bill payable
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={grnForm.autoInwardBill}
                onChange={(e) => setGrnForm((prev) => ({ ...prev, autoInwardBill: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">
                Auto-generate & clear Inward Purchase Bill for immediate accounts payable disbursement
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewGrnModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
            >
              Approve GRN Inward
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Issue Debit Note */}
      <Modal
        isOpen={isNewDebitNoteModalOpen}
        onClose={() => setIsNewDebitNoteModalOpen(false)}
        title="Issue Debit Note to Supplier"
        subtitle="Reduce vendor accounts payable for rejected batches or rate discrepancies"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDebitNote} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Vendor / Supplier</label>
            <select
              value={dnForm.vendorName}
              onChange={(e) => setDnForm((prev) => ({ ...prev, vendorName: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GRN Reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. GRN-2026-101"
                value={dnForm.grnNumber}
                onChange={(e) => setDnForm((prev) => ({ ...prev, grnNumber: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vendor Invoice Ref</label>
              <input
                type="text"
                placeholder="e.g. INV-CIP-88412"
                value={dnForm.vendorInvoiceRef}
                onChange={(e) => setDnForm((prev) => ({ ...prev, vendorInvoiceRef: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Reason for Debit Note</label>
            <input
              type="text"
              required
              value={dnForm.reason}
              onChange={(e) => setDnForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Broken cold-chain vials / damaged outer blister"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Returned Qty</label>
              <input
                type="number"
                min={1}
                value={dnForm.rejectedQty}
                onChange={(e) => setDnForm((prev) => ({ ...prev, rejectedQty: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Unit Rate ₹</label>
              <input
                type="number"
                min={0}
                value={dnForm.unitPrice}
                onChange={(e) => setDnForm((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GST %</label>
              <input
                type="number"
                value={dnForm.taxPercent}
                onChange={(e) => setDnForm((prev) => ({ ...prev, taxPercent: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between font-bold text-amber-900">
            <span>Total Deduction Amount:</span>
            <span>
              {formatCurrency(dnForm.rejectedQty * dnForm.unitPrice * (1 + dnForm.taxPercent / 100))}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewDebitNoteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
            >
              Issue Debit Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Upload Bank Statement */}
      <Modal
        isOpen={isUploadStatementModalOpen}
        onClose={() => setIsUploadStatementModalOpen(false)}
        title="Upload Bank Statement to Reconcile (BRS)"
        subtitle="Ingest e-statement from HDFC, SBI, ICICI or Axis Bank to auto-match with hospital ledger"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs font-medium">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUploadSimulate}
            accept=".csv,.xlsx,.xls,.txt"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-8 text-center cursor-pointer transition-all"
          >
            <UploadCloud className="w-10 h-10 text-sky-600 mx-auto mb-2 animate-bounce" />
            <p className="font-bold text-slate-900 text-sm">
              Click to select bank statement file
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports CSV, Excel (.xlsx, .xls), or standard banking text statements
            </p>
          </div>

          {isUploading && (
            <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2">
              <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-slate-800">Parsing and matching entries...</p>
            </div>
          )}

          <div className="p-3 bg-slate-100 rounded-xl text-slate-600 text-[11px] leading-relaxed">
            <span className="font-bold text-slate-800 block mb-0.5">Automated BRS Engine:</span>
            Matches withdrawals against vendor bills and payroll; matches deposits against daily OPD cash, POS swipe settlements, and TPA claims.
          </div>
        </div>
      </Modal>

      {/* Modal 5: Record Transaction (General Ledger) */}
      <Modal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        title="Record General Ledger Entry"
        subtitle="Post direct hospital revenue or operational overhead transaction"
        maxWidth="md"
      >
        <form onSubmit={handleAddTx} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTxForm({ ...txForm, type: 'income' })}
                className={`py-2 rounded-xl border font-bold transition-all ${
                  txForm.type === 'income'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                + Income (Revenue)
              </button>
              <button
                type="button"
                onClick={() => setTxForm({ ...txForm, type: 'expense' })}
                className={`py-2 rounded-xl border font-bold transition-all ${
                  txForm.type === 'expense'
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                - Expense (Overhead)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category</label>
            <select
              value={txForm.category}
              onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="Medical Supplies">Medical Supplies & Consumables</option>
              <option value="Patient Billing">Patient Billing (Discharges)</option>
              <option value="Pharmacy Sales">Pharmacy Sales Counter</option>
              <option value="Staff Payroll">Staff Salary & Payroll</option>
              <option value="Hospital Utilities">Hospital Utilities (Power/Oxygen)</option>
              <option value="Equipment Maintenance">Biomedical AMC Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Amount (INR ₹)</label>
            <input
              type="number"
              required
              min={1}
              value={txForm.amount}
              onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Generator diesel supply / TPA cashless settlement"
              value={txForm.description}
              onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Payment Channel</label>
            <select
              value={txForm.paymentChannel}
              onChange={(e) => setTxForm({ ...txForm, paymentChannel: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="HDFC Bank Current A/c">HDFC Bank Current A/c</option>
              <option value="SBI Corporate Account">SBI Corporate Account</option>
              <option value="UPI / QR POS Counter">UPI / QR POS Counter</option>
              <option value="Petty Cash Safe">Petty Cash Safe</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewTxModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-xs"
            >
              Post to Ledger
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 6: View PO Details */}
      {selectedPoForView && (
        <Modal
          isOpen={!!selectedPoForView}
          onClose={() => setSelectedPoForView(null)}
          title={`Purchase Order: ${selectedPoForView.poNumber}`}
          subtitle={`Issued to ${selectedPoForView.vendorName} on ${selectedPoForView.orderDate}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Department</span>
                <p className="font-bold text-slate-800">{selectedPoForView.department}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Date</span>
                <p className="font-bold text-slate-800">{selectedPoForView.expectedDeliveryDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Terms</span>
                <p className="font-bold text-slate-800">{selectedPoForView.paymentTerms}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                <p>
                  <Badge variant="success">{selectedPoForView.status}</Badge>
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Rate</th>
                  <th className="py-2 px-3 text-right">GST</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPoForView.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 px-3 font-semibold text-slate-800">{i.itemName}</td>
                    <td className="py-2 px-3 text-center">
                      {i.quantity} {i.unit}
                    </td>
                    <td className="py-2 px-3 text-right">{formatCurrency(i.unitPrice)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(i.taxAmount)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(i.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold text-sm">
              <span>Grand Total Payable:</span>
              <span className="text-emerald-700">{formatCurrency(selectedPoForView.grandTotal)}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPoForView(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 7: View GRN Details */}
      {selectedGrnForView && (
        <Modal
          isOpen={!!selectedGrnForView}
          onClose={() => setSelectedGrnForView(null)}
          title={`GRN Inspection: ${selectedGrnForView.grnNumber}`}
          subtitle={`Supplier: ${selectedGrnForView.vendorName} &bull; Challan: ${selectedGrnForView.invoiceOrChallanNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs font-medium">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Received By</span>
                <p className="font-bold text-slate-800">{selectedGrnForView.receivedBy}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">QC Inspected By</span>
                <p className="font-bold text-slate-800">{selectedGrnForView.inspectedBy}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">QC Result</span>
                <p>
                  <Badge variant={selectedGrnForView.qcStatus === 'passed' ? 'success' : 'warning'}>
                    {selectedGrnForView.qcStatus}
                  </Badge>
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Item & Batch</th>
                  <th className="py-2 px-3 text-center">Recv</th>
                  <th className="py-2 px-3 text-center">Acc</th>
                  <th className="py-2 px-3 text-center">Rej</th>
                  <th className="py-2 px-3 text-right">Accepted Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedGrnForView.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800">{i.itemName}</div>
                      <div className="text-[10px] text-slate-500">
                        Batch: {i.batchNumber} | Exp: {i.expiryDate}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">{i.receivedQty}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{i.acceptedQty}</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">{i.rejectedQty}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(i.acceptedAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedGrnForView.hasDebitNoteGenerated && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
                <span>Quarantined goods covered under Debit Note:</span>
                <span className="font-bold">{selectedGrnForView.debitNoteNumber}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedGrnForView(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 8: View Debit Note Details */}
      {selectedDebitNoteForView && (
        <Modal
          isOpen={!!selectedDebitNoteForView}
          onClose={() => setSelectedDebitNoteForView(null)}
          title={`Debit Note: ${selectedDebitNoteForView.debitNoteNumber}`}
          subtitle={`Issued to ${selectedDebitNoteForView.vendorName} on ${selectedDebitNoteForView.issueDate}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-medium">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Reason for Return</span>
              <p className="font-bold text-slate-800 mt-1">{selectedDebitNoteForView.reason}</p>
            </div>

            <div className="space-y-2">
              {selectedDebitNoteForView.items.map((i) => (
                <div key={i.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{i.itemName}</span>
                    <p className="text-[11px] text-slate-500">
                      Qty Returned: {i.rejectedQty} @ {formatCurrency(i.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right font-bold text-rose-600">
                    -{formatCurrency(i.totalAmount)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex justify-between font-bold text-rose-900">
              <span>Total Payable Deduction:</span>
              <span>-{formatCurrency(selectedDebitNoteForView.totalAmount)}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDebitNoteForView(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
