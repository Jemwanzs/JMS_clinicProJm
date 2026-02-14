import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBranding, getOrgSettings } from "@/lib/store";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const branding = getBranding();
  const org = getOrgSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      toast({ title: "Login failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Teal gradient strip at top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px] space-y-6 sm:space-y-8">
          {/* Logo & branding */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain" />
              ) : (
                <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {org.name || "Sync Clinic"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Sign in to your account
              </p>
            </div>
          </div>

          {/* Login form */}
          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6 pb-6 px-5 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@clinic.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
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
                <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create your clinic
            </Link>
          </p>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60">
            <Shield className="h-3 w-3" />
            <span>Secured & encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
