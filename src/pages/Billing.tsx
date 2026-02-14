import { useState, useEffect, useRef } from "react";
import { Receipt, Plus, Search, X, Save, CreditCard, Printer, Edit2, Trash2, AlertTriangle, Calendar, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getInvoices, addInvoice, updateInvoice, addPaymentToInvoice, updatePaymentOnInvoice, deletePaymentFromInvoice,
  getPatients, getMasterList, getPatientBillableItems, getBillingHistory, getOrgSettings, getBranding, isInPeriod,
  type Invoice, type Patient, type Payment,
} from "@/lib/store";

export default function Billing() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [showInvoice, setShowInvoice] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [patientId, setPatientId] = useState("");
  const [lineItems, setLineItems] = useState<{ description: string; amount: number; source?: string }[]>([{ description: "", amount: 0 }]);
  const [payment, setPayment] = useState({ amount: 0, mode: "", reference: "", notes: "" });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInvoices(getInvoices()); setPatients(getPatients()); }, []);

  const paymentModes = getMasterList("Payment Modes");
  const defaultModes = ["M-Pesa", "Cash", "Bank"];
  const allModes = [...defaultModes, ...paymentModes.filter(m => m.active && !defaultModes.includes(m.name)).map(m => m.name)];

  const filteredInvoices = invoices
    .filter(i => isInPeriod(i.createdAt, period))
    .filter(i => i.patientName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNo.toLowerCase().includes(search.toLowerCase()));

  const periodInvoices = invoices.filter(i => isInPeriod(i.createdAt, period));
  const totalBilled = periodInvoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = periodInvoices.reduce((s, i) => s + i.paid, 0);
  const total = lineItems.reduce((s, i) => s + (i.amount || 0), 0);

  const periods = [
    { value: "today", label: "Today" }, { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }, { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }, { value: "all", label: "All Time" },
  ];

  // Auto-populate billable items when patient selected
  const handlePatientSelect = (pid: string) => {
    setPatientId(pid);
    const billable = getPatientBillableItems(pid);
    if (billable.length > 0) {
      setLineItems([...billable, { description: "", amount: 0 }]);
    } else {
      setLineItems([{ description: "", amount: 0 }]);
    }
  };

  const openNewInvoice = () => { setEditingInvoiceId(null); setPatientId(""); setLineItems([{ description: "", amount: 0 }]); setShowInvoice(true); };
  const openEditInvoice = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setPatientId(inv.patientId);
    setLineItems([...inv.items, { description: "", amount: 0 }]);
    setShowInvoice(true);
  };

  const handleCreateInvoice = () => {
    if (!patientId) { toast({ title: "Required", description: "Select a patient.", variant: "destructive" }); return; }
    const p = patients.find(p => p.id === patientId);
    const validItems = lineItems.filter(i => i.description);
    const t = validItems.reduce((s, i) => s + (i.amount || 0), 0);
    if (editingInvoiceId) {
      updateInvoice(editingInvoiceId, { items: validItems, total: t });
      toast({ title: "Updated", description: "Invoice updated." });
    } else {
      addInvoice({ patientId, patientName: p ? `${p.firstName} ${p.lastName}` : "", items: validItems, total: t, paid: 0, status: "issued" });
      toast({ title: "Invoice Created", description: `Invoice for KES ${t.toLocaleString()} created.` });
    }
    setInvoices(getInvoices());
    setShowInvoice(false);
    setLineItems([{ description: "", amount: 0 }]);
    setPatientId("");
  };

  const openPayment = (invoiceId: string) => {
    setEditingPaymentId(null);
    const inv = invoices.find(i => i.id === invoiceId);
    const due = inv ? inv.total - inv.paid : 0;
    setPayment({ amount: due > 0 ? due : 0, mode: "", reference: "", notes: "" });
    setShowPayment(invoiceId);
  };

  const openEditPayment = (invoiceId: string, p: Payment) => {
    setEditingPaymentId(p.id);
    setPayment({ amount: p.amount, mode: p.mode, reference: p.reference, notes: p.notes });
    setShowPayment(invoiceId);
  };

  const handlePayment = () => {
    if (!showPayment || !payment.amount || !payment.mode) { toast({ title: "Required", description: "Amount and mode required.", variant: "destructive" }); return; }
    if (editingPaymentId) {
      updatePaymentOnInvoice(showPayment, editingPaymentId, payment);
      toast({ title: "Payment Updated", description: "Payment details updated." });
    } else {
      addPaymentToInvoice(showPayment, payment);
      toast({ title: "Payment Recorded", description: `KES ${payment.amount.toLocaleString()} recorded.` });
    }
    setInvoices(getInvoices());
    setShowPayment(null);
    setEditingPaymentId(null);
    setPayment({ amount: 0, mode: "", reference: "", notes: "" });
  };

  const handleDeletePayment = (invoiceId: string, paymentId: string) => {
    deletePaymentFromInvoice(invoiceId, paymentId);
    setInvoices(getInvoices());
    toast({ title: "Payment Deleted", description: "Payment removed." });
  };

  const handlePrint = (inv: Invoice) => {
    const org = getOrgSettings();
    const branding = getBranding();
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    const due = inv.total - inv.paid;
    win.document.write(`
      <html><head><title>Invoice ${inv.invoiceNo}</title>
      <style>
        @page { size: 74mm 105mm; margin: 2mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; font-size: 7pt; padding: 3mm; color: #1a1a1a; width: 74mm; }
        .header { text-align: center; border-bottom: 0.5pt solid #ccc; padding-bottom: 2mm; margin-bottom: 2mm; }
        .logo { max-height: 12mm; max-width: 20mm; margin-bottom: 1mm; }
        .org-name { font-size: 9pt; font-weight: bold; }
        .subtitle { font-size: 6pt; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 1.5mm 0; }
        td, th { padding: 0.5mm 1mm; text-align: left; font-size: 7pt; }
        th { border-bottom: 0.5pt solid #999; font-weight: 600; }
        .total-row { border-top: 0.5pt solid #999; font-weight: bold; }
        .status-badge { display: inline-block; padding: 0.5mm 2mm; border-radius: 2mm; font-size: 6pt; font-weight: 600; }
        .paid { background: #d4edda; color: #155724; }
        .partial { background: #fff3cd; color: #856404; }
        .unpaid { background: #f8d7da; color: #721c24; }
        .overpaid { background: #d4edda; color: #155724; }
        .footer { text-align: center; border-top: 0.5pt solid #ccc; padding-top: 1.5mm; margin-top: 2mm; font-size: 6pt; color: #888; }
      </style></head><body>
      <div class="header">
        ${branding.logo ? `<img src="${branding.logo}" class="logo" />` : ""}
        <div class="org-name">${org.name || "Sync Clinic"}</div>
        ${org.tradingName ? `<div class="subtitle">${org.tradingName}</div>` : ""}
        ${org.phone ? `<div class="subtitle">Tel: ${org.phone}</div>` : ""}
        ${org.email ? `<div class="subtitle">${org.email}</div>` : ""}
      </div>
      <div style="margin-bottom: 2mm;">
        <div style="font-weight: bold; font-size: 8pt;">INVOICE ${inv.invoiceNo}</div>
        <div>Patient: ${inv.patientName}</div>
        <div>Date: ${new Date(inv.createdAt).toLocaleDateString()}</div>
        <div>Status: <span class="status-badge ${inv.status}">${inv.status.toUpperCase()}</span></div>
      </div>
      <table>
        <thead><tr><th>Description</th><th style="text-align:right">Amount (KES)</th></tr></thead>
        <tbody>
          ${inv.items.map(i => `<tr><td>${i.description}</td><td style="text-align:right">${i.amount.toLocaleString()}</td></tr>`).join("")}
          <tr class="total-row"><td>Total</td><td style="text-align:right">${inv.total.toLocaleString()}</td></tr>
          <tr><td>Paid</td><td style="text-align:right">${inv.paid.toLocaleString()}</td></tr>
          <tr class="total-row"><td>${due > 0 ? "Balance Due" : due < 0 ? "Overpaid" : "Balance"}</td><td style="text-align:right">${Math.abs(due).toLocaleString()}</td></tr>
        </tbody>
      </table>
      ${inv.payments.length > 0 ? `
        <div style="font-weight: bold; font-size: 7pt; margin-top: 1.5mm;">Payments:</div>
        <table><thead><tr><th>Date</th><th>Mode</th><th style="text-align:right">Amount</th></tr></thead><tbody>
          ${inv.payments.map(p => `<tr><td>${new Date(p.paidAt).toLocaleDateString()}</td><td>${p.mode}</td><td style="text-align:right">${p.amount.toLocaleString()}</td></tr>`).join("")}
        </tbody></table>
      ` : ""}
      <div class="footer">
        ${org.footerNotes || "Thank you for choosing " + (org.name || "Sync Clinic")}
      </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground", issued: "bg-info/10 text-info",
    paid: "bg-success/10 text-success", partial: "bg-warning/10 text-warning",
    unpaid: "bg-destructive/10 text-destructive", overpaid: "bg-success/10 text-success",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Billing</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage invoices and payments.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={openNewInvoice}><Plus className="h-4 w-4" />Create Invoice</Button>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-3 flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
        <p className="text-[10px] text-muted-foreground">All billing edits and payments are tracked in history. Changes are audited automatically.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{periods.map(p => <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Billed", value: `KES ${totalBilled.toLocaleString()}` },
          { label: "Total Paid", value: `KES ${totalPaid.toLocaleString()}` },
          { label: "Outstanding", value: `KES ${Math.max(0, totalBilled - totalPaid).toLocaleString()}` },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
            <p className="text-lg sm:text-2xl font-bold text-card-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {showInvoice && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingInvoiceId ? "Edit" : "New"} Invoice</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowInvoice(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Patient * <span className="text-muted-foreground">(auto-populates labs & prescriptions)</span></Label>
            <Select value={patientId} onValueChange={handlePatientSelect}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Line Items</Label>
            {lineItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input placeholder="Description" className="flex-1" value={item.description} onChange={e => setLineItems(prev => prev.map((li, idx) => idx === i ? { ...li, description: e.target.value } : li))} />
                <Input type="number" placeholder="Amount" className="w-28" value={item.amount || ""} onChange={e => setLineItems(prev => prev.map((li, idx) => idx === i ? { ...li, amount: parseFloat(e.target.value) || 0 } : li))} />
                {lineItems.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setLineItems(p => p.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setLineItems(p => [...p, { description: "", amount: 0 }])} className="text-xs gap-1"><Plus className="h-3 w-3" />Add Line</Button>
            <p className="text-sm font-semibold text-right text-foreground">Total: KES {total.toLocaleString()}</p>
          </div>
          <div className="flex justify-end"><Button onClick={handleCreateInvoice} className="gap-2 w-full sm:w-auto"><Save className="h-4 w-4" />{editingInvoiceId ? "Update" : "Create"} Invoice</Button></div>
        </div>
      )}

      {showPayment && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingPaymentId ? "Edit" : "Record"} Payment</h2>
            <Button variant="ghost" size="icon" onClick={() => { setShowPayment(null); setEditingPaymentId(null); }}><X className="h-4 w-4" /></Button>
          </div>
          {(() => {
            const inv = invoices.find(i => i.id === showPayment);
            const due = inv ? inv.total - inv.paid : 0;
            return inv ? (
              <div className="text-xs bg-muted/50 rounded-lg p-3 space-y-1">
                <p><span className="text-muted-foreground">Invoice:</span> <span className="font-semibold">{inv.invoiceNo}</span></p>
                <p><span className="text-muted-foreground">Total:</span> KES {inv.total.toLocaleString()}</p>
                <p><span className="text-muted-foreground">Paid:</span> KES {inv.paid.toLocaleString()}</p>
                <p className="font-semibold"><span className="text-muted-foreground">Due:</span> <span className={due > 0 ? "text-destructive" : "text-success"}>KES {due.toLocaleString()}</span></p>
              </div>
            ) : null;
          })()}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Amount (KES) *</Label><Input type="number" value={payment.amount || ""} onChange={e => setPayment(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Mode *</Label>
              <Select value={payment.mode} onValueChange={v => setPayment(p => ({ ...p, mode: v }))}>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>{allModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Reference (M-Pesa code, etc.)</Label><Input value={payment.reference} onChange={e => setPayment(p => ({ ...p, reference: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Notes</Label><Input value={payment.notes} onChange={e => setPayment(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end"><Button onClick={handlePayment} className="gap-2 w-full sm:w-auto"><Save className="h-4 w-4" />{editingPaymentId ? "Update" : "Record"} Payment</Button></div>
        </div>
      )}

      {filteredInvoices.length === 0 && !showInvoice ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No invoices yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first invoice to start billing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map(inv => {
            const due = inv.total - inv.paid;
            const history = showHistory === inv.id ? getBillingHistory(inv.id) : [];
            return (
              <div key={inv.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-card-foreground">{inv.invoiceNo}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
                      {inv.status === "overpaid" && <span className="text-[9px] text-success font-medium">(overpaid by KES {Math.abs(due).toLocaleString()})</span>}
                      {due > 0 && inv.status !== "unpaid" && inv.paid > 0 && <span className="text-[9px] text-destructive font-medium">(KES {due.toLocaleString()} outstanding)</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{inv.patientName} • KES {inv.total.toLocaleString()} (Paid: KES {inv.paid.toLocaleString()})</p>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Button size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={() => openEditInvoice(inv)}><Edit2 className="h-3 w-3" />Edit</Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={() => handlePrint(inv)}><Printer className="h-3 w-3" />Print</Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={() => setShowHistory(showHistory === inv.id ? null : inv.id)}><History className="h-3 w-3" />History</Button>
                    {inv.status !== "paid" && (
                      <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => openPayment(inv.id)}>
                        <CreditCard className="h-3 w-3" />Pay
                      </Button>
                    )}
                  </div>
                </div>

                {/* Payment lines */}
                {inv.payments.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Payments</p>
                    {inv.payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                        <div>
                          <span className="font-medium">KES {p.amount.toLocaleString()}</span>
                          <span className="text-muted-foreground"> via {p.mode}</span>
                          {p.reference && <span className="text-muted-foreground"> • Ref: {p.reference}</span>}
                          <span className="text-muted-foreground"> • {new Date(p.paidAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditPayment(inv.id, p)}><Edit2 className="h-2.5 w-2.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeletePayment(inv.id, p.id)}><Trash2 className="h-2.5 w-2.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* History */}
                {showHistory === inv.id && (
                  <div className="space-y-1 border-t border-border pt-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Edit History</p>
                    {history.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground">No history entries.</p>
                    ) : (
                      history.map(h => (
                        <div key={h.id} className="text-[10px] text-muted-foreground flex gap-2">
                          <span className="font-medium text-foreground">{h.action}</span>
                          <span className="flex-1">{h.details}</span>
                          <span>{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
