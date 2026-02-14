import { useState, useEffect } from "react";
import { Pill, Plus, X, Save, Trash2, Search, Edit2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getPrescriptions, addPrescription, updatePrescription, deletePrescription, getPatients, getMasterList, type Prescription, type Patient } from "@/lib/store";
import { exportToCSV } from "@/lib/export-utils";

const emptyDrug = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };

export default function Prescriptions() {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState("");
  const [drugs, setDrugs] = useState([{ ...emptyDrug }]);

  useEffect(() => { setPrescriptions(getPrescriptions()); setPatients(getPatients()); }, []);

  const drugList = getMasterList("Drugs");

  const openNew = () => { setEditingId(null); setPatientId(""); setDrugs([{ ...emptyDrug }]); setShowForm(true); };
  const openEdit = (rx: Prescription) => { setEditingId(rx.id); setPatientId(rx.patientId); setDrugs(rx.drugs.length ? [...rx.drugs] : [{ ...emptyDrug }]); setShowForm(true); };

  const updateDrug = (i: number, field: string, value: string) => {
    setDrugs(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  };

  const handleSave = () => {
    if (!patientId) { toast({ title: "Required", description: "Select a patient.", variant: "destructive" }); return; }
    const p = patients.find(p => p.id === patientId);
    const patientName = p ? `${p.firstName} ${p.lastName}` : "";
    if (editingId) {
      updatePrescription(editingId, { patientId, patientName, drugs: drugs.filter(d => d.name) });
      toast({ title: "Updated", description: "Prescription updated." });
    } else {
      addPrescription({ patientId, patientName, visitId: "", drugs: drugs.filter(d => d.name) });
      toast({ title: "Created", description: "Prescription created." });
    }
    setPrescriptions(getPrescriptions());
    setShowForm(false);
    setDrugs([{ ...emptyDrug }]);
    setPatientId("");
  };

  const handleDelete = (id: string) => {
    deletePrescription(id);
    setPrescriptions(getPrescriptions());
    toast({ title: "Deleted", description: "Prescription deleted." });
  };

  const handleExport = () => {
    const rows: Record<string, string | number>[] = [];
    filtered.forEach(rx => {
      rx.drugs.forEach(d => {
        rows.push({ Patient: rx.patientName, Drug: d.name, Dosage: d.dosage, Frequency: d.frequency, Duration: d.duration, Instructions: d.instructions, Date: new Date(rx.createdAt).toLocaleDateString() });
      });
    });
    exportToCSV(rows, "prescriptions.csv");
    toast({ title: "Exported", description: `${filtered.length} prescriptions exported.` });
  };

  const filtered = prescriptions.filter(rx =>
    rx.patientName.toLowerCase().includes(search.toLowerCase()) ||
    rx.drugs.some(d => d.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Prescriptions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage patient prescriptions and medication.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 text-xs flex-1 sm:flex-none" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />Export
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={openNew}><Plus className="h-4 w-4" />New Prescription</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search prescriptions..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingId ? "Edit" : "New"} Prescription</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Patient *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {drugs.map((drug, i) => (
            <div key={i} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Drug #{i + 1}</span>
                {drugs.length > 1 && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDrugs(d => d.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Drug name" value={drug.name} onChange={e => updateDrug(i, "name", e.target.value)} list="drug-list" />
                <Input placeholder="Dosage (e.g. 500mg)" value={drug.dosage} onChange={e => updateDrug(i, "dosage", e.target.value)} />
                <Input placeholder="Frequency (e.g. 3x daily)" value={drug.frequency} onChange={e => updateDrug(i, "frequency", e.target.value)} />
                <Input placeholder="Duration (e.g. 7 days)" value={drug.duration} onChange={e => updateDrug(i, "duration", e.target.value)} />
                <Input placeholder="Instructions" className="sm:col-span-2" value={drug.instructions} onChange={e => updateDrug(i, "instructions", e.target.value)} />
              </div>
            </div>
          ))}
          <datalist id="drug-list">{drugList.filter(d => d.active).map(d => <option key={d.id} value={d.name} />)}</datalist>
          <Button variant="outline" size="sm" onClick={() => setDrugs(d => [...d, { ...emptyDrug }])} className="gap-1 text-xs"><Plus className="h-3 w-3" />Add Drug</Button>
          <div className="flex justify-end"><Button onClick={handleSave} className="gap-2 w-full sm:w-auto"><Save className="h-4 w-4" />{editingId ? "Update" : "Save"} Prescription</Button></div>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No prescriptions</p>
          <p className="text-xs text-muted-foreground mt-1">Prescriptions will appear here after consultations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rx => (
            <div key={rx.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-card-foreground truncate">{rx.patientName}</p>
                  <p className="text-xs text-muted-foreground mb-2">{new Date(rx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => openEdit(rx)}><Edit2 className="h-3 w-3" />Edit</Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(rx.id)}><Trash2 className="h-3 w-3" />Delete</Button>
                </div>
              </div>
              <div className="space-y-1">
                {rx.drugs.map((d, i) => (
                  <div key={i} className="text-xs bg-muted/50 rounded p-2">
                    <span className="font-medium">{d.name}</span> — {d.dosage} | {d.frequency} | {d.duration}
                    {d.instructions && <span className="text-muted-foreground"> ({d.instructions})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
