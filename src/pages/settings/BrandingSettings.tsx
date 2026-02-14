import { useState, useEffect, useRef } from "react";
import { Palette, Upload, RotateCcw, Save, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getBranding, saveBranding, type BrandingSettings as BrandingType } from "@/lib/store";

export default function BrandingSettings() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BrandingType>({
    logo: "", primaryColor: "#2a9d8f", secondaryColor: "#264653", accentColor: "#e9c46a", textColor: "#1d3557"
  });

  useEffect(() => { setForm(getBranding()); }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB allowed.", variant: "destructive" });
      return;
    }
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast({ title: "Invalid format", description: "Use PNG, JPG, or SVG.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveBranding(form);
    toast({ title: "Branding Saved", description: "Your branding settings have been saved." });
  };

  const handleReset = () => {
    const defaults = { logo: "", primaryColor: "#2a9d8f", secondaryColor: "#264653", accentColor: "#e9c46a", textColor: "#1d3557" };
    setForm(defaults);
    saveBranding(defaults);
    toast({ title: "Reset", description: "Branding reset to defaults." });
  };

  const colorFields = [
    { key: "primaryColor" as const, label: "Primary" },
    { key: "secondaryColor" as const, label: "Secondary" },
    { key: "accentColor" as const, label: "Accent" },
    { key: "textColor" as const, label: "Text" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Branding</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Upload your logo and configure brand colors.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Logo</h2>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
          >
            {form.logo ? (
              <img src={form.logo} alt="Logo preview" className="max-h-20 mx-auto object-contain" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag to upload your logo</p>
              </>
            )}
            <p className="text-xs text-muted-foreground mt-2">PNG, JPG, or SVG (max 2MB)</p>
          </div>
          {form.logo && (
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setForm(prev => ({ ...prev, logo: "" }))}>
              Remove Logo
            </Button>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Brand Colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="h-10 w-10 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={form[key]}
                    onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="text-xs font-mono flex-1"
                    maxLength={7}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Preview</h2>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-center gap-3">
              {form.logo && <img src={form.logo} alt="Logo" className="h-8 object-contain" />}
              <span className="font-bold text-sm" style={{ color: form.textColor }}>Your Clinic Name</span>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded" style={{ backgroundColor: form.primaryColor }} />
              <div className="h-8 w-8 rounded" style={{ backgroundColor: form.secondaryColor }} />
              <div className="h-8 w-8 rounded" style={{ backgroundColor: form.accentColor }} />
              <div className="h-8 w-8 rounded" style={{ backgroundColor: form.textColor }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          <Button variant="outline" onClick={handleReset} className="gap-2 w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" /> Reset Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
            <Save className="h-4 w-4" /> Save Branding
          </Button>
        </div>
      </div>
    </div>
  );
}
