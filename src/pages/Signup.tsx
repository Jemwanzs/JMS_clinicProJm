import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Eye, EyeOff, ArrowRight, Building2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBranding } from "@/lib/store";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const branding = getBranding();

  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", clinicName: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.password || !form.clinicName.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    setLoading(true);
    const result = await signup({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      clinicName: form.clinicName.trim(),
    });
    setLoading(false);

    if (result.success) {
      toast({ title: "Welcome to Sync Clinic!", description: "Your clinic has been created." });
      navigate("/");
    } else {
      toast({ title: "Signup failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-white"> {/*Main screen Container)*/}
      <div className="h-1.5 w-full bg-[orange]"/> {/* Teal gradient strip at top */}

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px] space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain" />
              ) : (
                <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-muted-foreground mt-1">Create your clinic</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Set up your Sync Clinic account</p>
            </div>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6 pb-6 px-5 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Clinic Name */}
                <div className="space-y-2">
                  <Label htmlFor="clinicName" className="text-sm font-medium flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Clinic / Hospital Name
                  </Label>
                  <Input
                    id="clinicName"
                    placeholder="e.g. Nairobi Medical Centre"
                    value={form.clinicName}
                    onChange={e => update("clinicName", e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Your full name</Label>
                  <Input
                    id="fullName"
                    placeholder="Dr. Jane Wanjiku"
                    value={form.fullName}
                    onChange={e => update("fullName", e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@clinic.com"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    autoComplete="email"
                    className="h-11"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      autoComplete="new-password"
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => update("confirmPassword", e.target.value)}
                    autoComplete="new-password"
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create clinic <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/90">
            <Shield className="h-3 w-3" />
            <span>Your data stays private & secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}