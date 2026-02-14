import { useState, useEffect } from "react";
import { Activity, Plus, X, Save, Search, Edit2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getVitals, addVital, updateVital, deleteVital, getPatients, type VitalRecord, type Patient } from "@/lib/store";
import { exportToCSV } from "@/lib/export-utils";

export default function Vitals() {
  const { toast } = useToast();
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", patientName: "", temperature: "", bloodPressure: "", heartRate: "", weight: "", height: "", bmi: "", oxygenSat: "", notes: "" });

  useEffect(() => { setVitals(getVitals()); setPatients(getPatients()); }, []);

  const calcBMI = (w: string, h: string) => {
    const wt = parseFloat(w), ht = parseFloat(h) / 100;
    if (wt > 0 && ht > 0) return (wt / (ht * ht)).toFixed(1);
    return "";
  };

  const handleWeightHeight = (field: "weight" | "height", value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      updated.bmi = calcBMI(updated.weight, updated.height);
      return updated;
    });
  };

  const openNew = () => { setEditingId(null); setForm({ patientId: "", patientName: "", temperature: "", bloodPressure: "", heartRate: "", weight: "", height: "", bmi: "", oxygenSat: "", notes: "" }); setShowForm(true); };
  const openEdit = (v: VitalRecord) => {
    setEditingId(v.id);
    setForm({ patientId: v.patientId, patientName: v.patientName, temperature: v.temperature, bloodPressure: v.bloodPressure, heartRate: v.heartRate, weight: v.weight, height: v.height, bmi: v.bmi, oxygenSat: v.oxygenSat, notes: v.notes || "" });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.patientId) { toast({ title: "Required", description: "Select a patient.", variant: "destructive" }); return; }
    const p = patients.find(p => p.id === form.patientId);
    const patientName = p ? `${p.firstName} ${p.lastName}` : "";
    if (editingId) {
      updateVital(editingId, { ...form, patientName });
      toast({ title: "Updated", description: "Vitals updated." });
    } else {
      addVital({ ...form, patientName });
      toast({ title: "Recorded", description: "Vitals recorded successfully." });
    }
    setVitals(getVitals());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteVital(id);
    setVitals(getVitals());
    toast({ title: "Deleted", description: "Vital record deleted." });
  };

  const handleExport = () => {
    exportToCSV(filtered.map(v => ({
      Patient: v.patientName, Temp: v.temperature, BP: v.bloodPressure,
      HR: v.heartRate, Weight: v.weight, Height: v.height, BMI: v.bmi,
      O2: v.oxygenSat, Date: new Date(v.recordedAt).toLocaleString(),
    })), "vitals.csv");
    toast({ title: "Exported", description: `${filtered.length} records exported.` });
  };

  const filtered = vitals.filter(v =>
    v.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Vitals</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Record and track patient vital signs.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 text-xs flex-1 sm:flex-none" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />Export
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={openNew}><Plus className="h-4 w-4" />Record Vitals</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vitals..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingId ? "Edit" : "Record"} Vitals</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Patient *</Label>
            <Select value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.length === 0 ? <SelectItem value="none" disabled>No patients</SelectItem> :
                  patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Temp (°C)</Label><Input type="number" step="0.1" value={form.temperature} onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">BP (mmHg)</Label><Input placeholder="120/80" value={form.bloodPressure} onChange={e => setForm(p => ({ ...p, bloodPressure: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Heart Rate</Label><Input type="number" value={form.heartRate} onChange={e => setForm(p => ({ ...p, heartRate: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Weight (kg)</Label><Input type="number" step="0.1" value={form.weight} onChange={e => handleWeightHeight("weight", e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Height (cm)</Label><Input type="number" value={form.height} onChange={e => handleWeightHeight("height", e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">BMI</Label><Input value={form.bmi} readOnly className="bg-muted" /></div>
            <div className="space-y-1.5"><Label className="text-xs">O₂ Sat (%)</Label><Input type="number" value={form.oxygenSat} onChange={e => setForm(p => ({ ...p, oxygenSat: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSave} className="gap-2 w-full sm:w-auto"><Save className="h-4 w-4" />{editingId ? "Update" : "Save"} Vitals</Button></div>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No vitals recorded</p>
          <p className="text-xs text-muted-foreground mt-1">Select a patient to record their vitals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-card-foreground truncate">{v.patientName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(v.recordedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="text-xs h-8 gap-1" onClick={() => openEdit(v)}><Edit2 className="h-3 w-3" />Edit</Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-3 w-3" />Delete</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
                {v.temperature && <div><span className="text-muted-foreground">Temp:</span> <span className="font-medium">{v.temperature}°C</span></div>}
                {v.bloodPressure && <div><span className="text-muted-foreground">BP:</span> <span className="font-medium">{v.bloodPressure}</span></div>}
                {v.heartRate && <div><span className="text-muted-foreground">HR:</span> <span className="font-medium">{v.heartRate}</span></div>}
                {v.weight && <div><span className="text-muted-foreground">Wt:</span> <span className="font-medium">{v.weight}kg</span></div>}
                {v.height && <div><span className="text-muted-foreground">Ht:</span> <span className="font-medium">{v.height}cm</span></div>}
                {v.bmi && <div><span className="text-muted-foreground">BMI:</span> <span className="font-medium">{v.bmi}</span></div>}
                {v.oxygenSat && <div><span className="text-muted-foreground">O₂:</span> <span className="font-medium">{v.oxygenSat}%</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
