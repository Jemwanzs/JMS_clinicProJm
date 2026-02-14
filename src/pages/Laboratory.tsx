import { useState, useEffect } from "react";
import { FlaskConical, Plus, Search, X, Save, Edit2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getLabOrders, addLabOrder, updateLabOrder, deleteLabOrder, getPatients, getMasterList, type LabOrder, type Patient } from "@/lib/store";
import { exportToCSV } from "@/lib/export-utils";

export default function Laboratory() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", patientName: "", testName: "", notes: "", result: "" });

  useEffect(() => { setOrders(getLabOrders()); setPatients(getPatients()); }, []);

  const labTests = getMasterList("Lab Tests");

  const openNew = () => { setEditingId(null); setForm({ patientId: "", patientName: "", testName: "", notes: "", result: "" }); setShowForm(true); };
  const openEdit = (o: LabOrder) => { setEditingId(o.id); setForm({ patientId: o.patientId, patientName: o.patientName, testName: o.testName, notes: o.notes, result: o.result }); setShowForm(true); };

  const handleSave = () => {
    if (!form.patientId || !form.testName) { toast({ title: "Required", description: "Patient and test are required.", variant: "destructive" }); return; }
    const p = patients.find(p => p.id === form.patientId);
    const patientName = p ? `${p.firstName} ${p.lastName}` : "";
    if (editingId) {
      updateLabOrder(editingId, { ...form, patientName });
      toast({ title: "Updated", description: "Lab order updated." });
    } else {
      addLabOrder({ ...form, patientName, status: "ordered", result: "" });
      toast({ title: "Ordered", description: "Lab test ordered." });
    }
    setOrders(getLabOrders());
    setShowForm(false);
    setForm({ patientId: "", patientName: "", testName: "", notes: "", result: "" });
  };

  const advanceStatus = (order: LabOrder) => {
    const next: Record<string, LabOrder["status"]> = { ordered: "sample_taken", sample_taken: "result_ready" };
    if (next[order.status]) {
      updateLabOrder(order.id, { status: next[order.status] });
      setOrders(getLabOrders());
    }
  };

  const handleDelete = (id: string) => {
    deleteLabOrder(id);
    setOrders(getLabOrders());
    toast({ title: "Deleted", description: "Lab order deleted." });
  };

  const handleExport = () => {
    exportToCSV(filtered.map(o => ({
      Test: o.testName, Patient: o.patientName, Status: o.status,
      Result: o.result, Notes: o.notes, Date: new Date(o.createdAt).toLocaleDateString(),
    })), "lab-orders.csv");
    toast({ title: "Exported", description: `${filtered.length} lab orders exported.` });
  };

  const filtered = orders.filter(o =>
    o.patientName.toLowerCase().includes(search.toLowerCase()) ||
    o.testName.toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel: Record<string, string> = { ordered: "Ordered", sample_taken: "Sample Taken", result_ready: "Result Ready" };
  const statusColor: Record<string, string> = { ordered: "bg-warning/10 text-warning", sample_taken: "bg-info/10 text-info", result_ready: "bg-success/10 text-success" };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Laboratory</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage lab test orders and results.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 text-xs flex-1 sm:flex-none" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />Export
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={openNew}><Plus className="h-4 w-4" />Order Lab Test</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search lab orders..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingId ? "Edit" : "Order"} Lab Test</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Patient *</Label>
              <Select value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Test *</Label>
              <Select value={form.testName} onValueChange={v => setForm(p => ({ ...p, testName: v }))}>
                <SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger>
                <SelectContent>
                  {labTests.filter(t => t.active).length === 0 ? (
                    <>
                      <SelectItem value="CBC">CBC</SelectItem>
                      <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                      <SelectItem value="Blood Sugar">Blood Sugar</SelectItem>
                    </>
                  ) : (
                    labTests.filter(t => t.active).map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
            {editingId && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Result</Label>
                <Textarea value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))} rows={2} placeholder="Enter test results..." />
              </div>
            )}
          </div>
          <div className="flex justify-end"><Button onClick={handleSave} className="gap-2 w-full sm:w-auto"><Save className="h-4 w-4" />{editingId ? "Update" : "Order"} Test</Button></div>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <FlaskConical className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No lab orders</p>
          <p className="text-xs text-muted-foreground mt-1">Configure lab tests in Settings → Master Lists, then order tests here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-card-foreground">{o.testName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{o.patientName} • {new Date(o.createdAt).toLocaleDateString()}</p>
                  {o.result && <p className="text-xs mt-1 text-foreground bg-muted/50 rounded p-1.5">Result: {o.result}</p>}
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap">
                  <Button size="sm" variant="ghost" className="text-xs h-8 gap-1" onClick={() => openEdit(o)}><Edit2 className="h-3 w-3" />Edit</Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(o.id)}><Trash2 className="h-3 w-3" />Delete</Button>
                  {o.status !== "result_ready" && (
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => advanceStatus(o)}>
                      {o.status === "ordered" ? "Mark Sample Taken" : "Mark Result Ready"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
