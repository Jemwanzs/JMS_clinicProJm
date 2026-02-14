import { useState, useEffect } from "react";
import { BarChart3, Calendar, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getPatients, getVisits, getInvoices, getLabOrders, getPrescriptions, getVitals,
  getSystemUsers, isInPeriod,
} from "@/lib/store";

const periods = [
  { value: "today", label: "Today" }, { value: "week", label: "This Week" },
  { value: "month", label: "This Month" }, { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" }, { value: "all", label: "All Time" },
];

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const patients = getPatients().filter(p => isInPeriod(p.createdAt, period));
  const visits = getVisits().filter(v => isInPeriod(v.createdAt, period));
  const invoices = getInvoices().filter(i => isInPeriod(i.createdAt, period));
  const labs = getLabOrders().filter(l => isInPeriod(l.createdAt, period));
  const prescriptions = getPrescriptions().filter(p => isInPeriod(p.createdAt, period));
  const staff = getSystemUsers();

  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = totalBilled - totalPaid;

  // Group by payment mode
  const byMode: Record<string, number> = {};
  invoices.forEach(inv => inv.payments.forEach(p => { byMode[p.mode] = (byMode[p.mode] || 0) + p.amount; }));

  // Group by doctor
  const byDoctor: Record<string, number> = {};
  visits.forEach(v => { if (v.doctor) byDoctor[v.doctor] = (byDoctor[v.doctor] || 0) + 1; });

  const exportCSV = (data: Record<string, string | number>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h]}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    {
      title: "Income Report",
      desc: "Revenue by service, doctor, and payment mode",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase">Total Billed</p><p className="text-lg font-bold text-foreground">KES {totalBilled.toLocaleString()}</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase">Total Paid</p><p className="text-lg font-bold text-success">KES {totalPaid.toLocaleString()}</p></div>
            <div className="bg-muted/50 rounded-lg p-3"><p className="text-[10px] text-muted-foreground uppercase">Outstanding</p><p className="text-lg font-bold text-destructive">KES {outstanding.toLocaleString()}</p></div>
          </div>
          <div><p className="text-xs font-semibold text-foreground mb-2">By Payment Mode</p>
            {Object.entries(byMode).length === 0 ? <p className="text-xs text-muted-foreground">No payments recorded.</p> :
              Object.entries(byMode).map(([mode, amt]) => (
                <div key={mode} className="flex justify-between text-xs py-1 border-b border-border"><span>{mode}</span><span className="font-medium">KES {amt.toLocaleString()}</span></div>
              ))}
          </div>
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => exportCSV(invoices.map(i => ({ Invoice: i.invoiceNo, Patient: i.patientName, Total: i.total, Paid: i.paid, Status: i.status })), "income-report.csv")}><Download className="h-3 w-3" />Export CSV</Button>
        </div>
      ),
    },
    {
      title: "Patient Report",
      desc: "Patient list with visit counts and summaries",
      content: (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{patients.length} patients in period</p>
          {patients.slice(0, 20).map(p => {
            const vCount = visits.filter(v => v.patientId === p.id).length;
            return (
              <div key={p.id} className="flex justify-between text-xs py-1.5 border-b border-border">
                <div><span className="font-medium">{p.firstName} {p.lastName}</span> <span className="text-muted-foreground font-mono">({p.patientNo})</span></div>
                <span className="text-muted-foreground">{vCount} visit{vCount !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => exportCSV(patients.map(p => ({ PatientNo: p.patientNo, Name: `${p.firstName} ${p.lastName}`, Phone: p.phone, Gender: p.gender })), "patients-report.csv")}><Download className="h-3 w-3" />Export CSV</Button>
        </div>
      ),
    },
    {
      title: "Visit Report",
      desc: "Visit summaries grouped by date and type",
      content: (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{visits.length} visits in period</p>
          <div><p className="text-xs font-semibold text-foreground mb-1">By Doctor</p>
            {Object.entries(byDoctor).map(([doc, count]) => (
              <div key={doc} className="flex justify-between text-xs py-1 border-b border-border"><span>{doc}</span><span>{count} visits</span></div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => exportCSV(visits.map(v => ({ VisitNo: v.visitNo, Patient: v.patientName, Type: v.visitType, Doctor: v.doctor, Status: v.status, Date: v.dateTime })), "visits-report.csv")}><Download className="h-3 w-3" />Export CSV</Button>
        </div>
      ),
    },
    {
      title: "Lab Report",
      desc: "Laboratory test summaries and status",
      content: (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{labs.length} lab orders in period</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-warning/10 rounded-lg p-2 text-center"><p className="text-lg font-bold text-warning">{labs.filter(l => l.status === "ordered").length}</p><p className="text-[9px] text-muted-foreground">Ordered</p></div>
            <div className="bg-info/10 rounded-lg p-2 text-center"><p className="text-lg font-bold text-info">{labs.filter(l => l.status === "sample_taken").length}</p><p className="text-[9px] text-muted-foreground">Sample Taken</p></div>
            <div className="bg-success/10 rounded-lg p-2 text-center"><p className="text-lg font-bold text-success">{labs.filter(l => l.status === "result_ready").length}</p><p className="text-[9px] text-muted-foreground">Results Ready</p></div>
          </div>
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => exportCSV(labs.map(l => ({ Test: l.testName, Patient: l.patientName, Status: l.status, Date: l.createdAt })), "lab-report.csv")}><Download className="h-3 w-3" />Export CSV</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Reports</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Financial and clinical reporting.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{periods.map(p => <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.title} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setActiveReport(activeReport === report.title ? null : report.title)}
              className="w-full p-4 sm:p-6 text-left hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">{report.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{report.desc}</p>
                </div>
              </div>
            </button>
            {activeReport === report.title && (
              <div className="border-t border-border p-4 sm:p-6">
                {report.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
