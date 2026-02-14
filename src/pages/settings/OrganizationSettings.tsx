import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getOrgSettings, saveOrgSettings } from "@/lib/store";

export default function OrganizationSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState(getOrgSettings());

  useEffect(() => { setForm(getOrgSettings()); }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name) { toast({ title: "Required", description: "Organization name is required.", variant: "destructive" }); return; }
    saveOrgSettings(form);
    toast({ title: "Saved", description: "Organization settings saved locally." });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Organization Profile</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Configure your clinic's details.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Organization Name *</Label>
            <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Trading Name</Label>
            <Input value={form.tradingName} onChange={(e) => handleChange("tradingName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Registration Number</Label>
            <Input value={form.regNumber} onChange={(e) => handleChange("regNumber", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Phone *</Label>
            <Input placeholder="+254..." value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Physical Address</Label>
            <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Invoice Footer Notes</Label>
            <Textarea value={form.footerNotes} onChange={(e) => handleChange("footerNotes", e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button className="gap-2 w-full sm:w-auto" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
