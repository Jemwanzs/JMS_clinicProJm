import { useState, useEffect } from "react";
import { CalendarCheck, Plus, Search, X, Save, Edit2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getVisits, addVisit, updateVisit, deleteVisit, getPatients, getMasterList, getSystemUsers, type Visit, type Patient } from "@/lib/store";
import { exportToCSV } from "@/lib/export-utils";

export default function Visits() {
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", patientName: "", visitType: "", doctor: "", dateTime: "", notes: "", status: "open" as Visit["status"] });

  useEffect(() => { setVisits(getVisits()); setPatients(getPatients()); }, []);

  const visitTypes = getMasterList("Consultation Types");
  const doctors = getSystemUsers().filter(u => u.staffType === "Doctor" && u.status === "active");

  const openNew = () => { setEditingId(null); setForm({ patientId: "", patientName: "", visitType: "", doctor: "", dateTime: "", notes: "", status: "open" }); setShowForm(true); };
  const openEdit = (v: Visit) => { setEditingId(v.id); setForm({ patientId: v.patientId, patientName: v.patientName, visitType: v.visitType, doctor: v.doctor, dateTime: v.dateTime, notes: v.notes, status: v.status }); setShowForm(true); };

  const handleSave = () => {
    if (!form.patientId || !form.dateTime) { toast({ title: "Required", description: "Patient and date are required.", variant: "destructive" }); return; }
    const p = patients.find(p => p.id === form.patientId);
    const patientName = p ? `${p.firstName} ${p.lastName}` : form.patientName;
    if (editingId) {
      updateVisit(editingId, { ...form, patientName });
      toast({ title: "Updated", description: "Visit updated." });
    } else {
      addVisit({ ...form, patientName });
      toast({ title: "Visit Created", description: "New visit recorded." });
    }
    setVisits(getVisits());
    setShowForm(false);
  };

  const changeStatus = (id: string, status: Visit["status"]) => {
    updateVisit(id, { status });
    setVisits(getVisits());
  };

  const handleDelete = (id: string) => {
    deleteVisit(id);
    setVisits(getVisits());
    toast({ title: "Deleted", description: "Visit deleted." });
  };

  const handleExport = () => {
    exportToCSV(filtered.map(v => ({
      VisitNo: v.visitNo, Patient: v.patientName, Type: v.visitType,
      Doctor: v.doctor, Status: v.status, Date: v.dateTime, Notes: v.notes,
    })), "visits.csv");
    toast({ title: "Exported", description: `${filtered.length} visits exported.` });
  };

  const filtered = visits.filter(v =>
    v.patientName.toLowerCase().includes(search.toLowerCase()) ||
    v.visitNo.toLowerCase().includes(search.toLowerCase()) ||
    v.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = { open: "bg-info/10 text-info", completed: "bg-success/10 text-success", closed: "bg-muted text-muted-foreground" };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Visits</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Track patient consultations and visits.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 text-xs flex-1 sm:flex-none" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />Export
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={openNew}><Plus className="h-4 w-4" />New Visit</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search visits..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingId ? "Edit" : "New"} Visit</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Patient *</Label>
              <Select value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.length === 0 ? <SelectItem value="none" disabled>No patients registered</SelectItem> :
                    patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientNo})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Visit Type</Label>
              <Select value={form.visitType} onValueChange={v => setForm(p => ({ ...p, visitType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  {visitTypes.filter(t => t.active).map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Doctor</Label>
              <Select value={form.doctor} onValueChange={v => setForm(p => ({ ...p, doctor: v }))}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.length === 0 ? <SelectItem value="none" disabled>No doctors configured</SelectItem> :
                    doctors.map(d => <SelectItem key={d.id} value={d.fullName}>{d.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date & Time *</Label>
              <Input type="datetime-local" value={form.dateTime} onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSave} className="gap-2 w-full sm:w-auto"><Save className="h-4 w-4" />{editingId ? "Update" : "Create"} Visit</Button></div>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <CalendarCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No visits recorded</p>
          <p className="text-xs text-muted-foreground mt-1">Visits will appear here once patients are checked in.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-card-foreground">{v.patientName}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">{v.visitNo}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[v.status]}`}>{v.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.visitType} • {v.doctor || "—"} • {new Date(v.dateTime).toLocaleString()}</p>
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap">
                  <Button size="sm" variant="ghost" className="text-xs h-8 gap-1" onClick={() => openEdit(v)}><Edit2 className="h-3 w-3" />Edit</Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-3 w-3" />Delete</Button>
                  {v.status === "open" && <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => changeStatus(v.id, "completed")}>Complete</Button>}
                  {v.status === "completed" && <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => changeStatus(v.id, "closed")}>Close</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
