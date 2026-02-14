import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getPatients, deletePatient, calcAge, type Patient } from "@/lib/store";
import { exportToCSV } from "@/lib/export-utils";

export default function PatientList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => { setPatients(getPatients()); }, []);

  const handleDelete = (id: string) => {
    deletePatient(id);
    setPatients(getPatients());
    toast({ title: "Deleted", description: "Patient deleted." });
  };

  const handleExport = () => {
    exportToCSV(filtered.map(p => ({
      PatientNo: p.patientNo, Name: `${p.firstName} ${p.lastName}`,
      Phone: p.phone, Gender: p.gender, Age: calcAge(p.dob),
      IDNumber: p.idNumber || "", Email: p.email || "",
    })), "patients.csv");
    toast({ title: "Exported", description: `${filtered.length} patients exported.` });
  };

  const filtered = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.patientNo.toLowerCase().includes(search.toLowerCase()) ||
      p.idNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Patients</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} registered.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 text-xs flex-1 sm:flex-none" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />Export
          </Button>
          <Link to="/patients/register" className="flex-1 sm:flex-none">
            <Button className="gap-2 w-full"><Plus className="h-4 w-4" />Register Patient</Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, ID, or patient number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Mobile cards */}
      <div className="block sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No patients found</p>
            <Link to="/patients/register"><Button size="sm" className="mt-3 gap-2"><Plus className="h-3.5 w-3.5" />Register Patient</Button></Link>
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-card-foreground truncate">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.patientNo}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p.gender}</span>
                  <Link to={`/patients/register?edit=${p.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-3.5 w-3.5" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>📞 {p.phone}</span>
                <span>🎂 {calcAge(p.dob)} yrs</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Patient No.</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Gender</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Age</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-sm font-medium text-foreground">No patients found</p>
                    <Link to="/patients/register"><Button size="sm" className="mt-3 gap-2"><Plus className="h-3.5 w-3.5" />Register Patient</Button></Link>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs">{p.patientNo}</td>
                    <td className="py-3 px-4 font-medium">{p.firstName} {p.lastName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.phone}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.gender}</td>
                    <td className="py-3 px-4 text-muted-foreground">{calcAge(p.dob)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Link to={`/patients/register?edit=${p.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"><Edit2 className="h-3 w-3" />Edit</Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3" />Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
