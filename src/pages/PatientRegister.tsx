import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addPatient, updatePatient, getPatients, type Patient } from "@/lib/store";

export default function PatientRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "", lastName: "", dob: "", gender: "", phone: "", email: "",
    idNumber: "", address: "", emergencyContact: "", emergencyPhone: "", notes: "",
  });

  useEffect(() => {
    if (editId) {
      const patient = getPatients().find(p => p.id === editId);
      if (patient) {
        setForm({
          firstName: patient.firstName, lastName: patient.lastName, dob: patient.dob,
          gender: patient.gender, phone: patient.phone, email: patient.email,
          idNumber: patient.idNumber, address: patient.address,
          emergencyContact: patient.emergencyContact, emergencyPhone: patient.emergencyPhone,
          notes: patient.notes,
        });
      }
    }
  }, [editId]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.dob || !form.gender || !form.phone) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    const phoneRegex = /^(\+254|0)\d{9}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) {
      toast({ title: "Invalid Phone", description: "Enter a valid Kenya phone number (+254... or 0...)", variant: "destructive" });
      return;
    }
    if (editId) {
      updatePatient(editId, form);
      toast({ title: "Patient Updated", description: `Patient details updated successfully.` });
    } else {
      const patient = addPatient(form);
      toast({ title: "Patient Registered", description: `Patient ${patient.patientNo} created successfully.` });
    }
    navigate("/patients");
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {editId ? "Edit Patient" : "Register Patient"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {editId ? "Update patient details." : "Add a new patient to the system."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs">First Name *</Label>
              <Input id="firstName" required value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs">Last Name *</Label>
              <Input id="lastName" required value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-xs">Date of Birth *</Label>
              <Input id="dob" type="date" required value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Gender *</Label>
              <Select onValueChange={(v) => handleChange("gender", v)} value={form.gender}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
              <Input id="phone" required placeholder="+254..." value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idNumber" className="text-xs">ID / Passport Number</Label>
              <Input id="idNumber" value={form.idNumber} onChange={(e) => handleChange("idNumber", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address" className="text-xs">Physical Address</Label>
              <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Emergency Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emergencyContact" className="text-xs">Contact Name</Label>
              <Input id="emergencyContact" value={form.emergencyContact} onChange={(e) => handleChange("emergencyContact", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergencyPhone" className="text-xs">Contact Phone</Label>
              <Input id="emergencyPhone" placeholder="+254..." value={form.emergencyPhone} onChange={(e) => handleChange("emergencyPhone", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-3">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Additional Notes</h2>
          <Textarea placeholder="Any additional notes..." value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/patients")} className="w-full sm:w-auto">Cancel</Button>
          <Button type="submit" className="gap-2 w-full sm:w-auto">
            <Save className="h-4 w-4" />
            {editId ? "Update Patient" : "Register Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
