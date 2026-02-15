import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Eye, EyeOff, ArrowRight, Building2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBranding, getOrgSettings } from "@/lib/store";

// Background scattered images
const bgImages = [
  //"/bg/bg1.jpg",
  //"/bg/bg2.jpg",
  //"/bg/bg3.jpg",
  //"/bg/bg4.jpg",
  //"/bg/bg5.jpg",
];

const getRandomPosition = () => ({
  top: `${Math.random() * 80 + 5}%`,
  left: `${Math.random() * 80 + 5}%`,
  rotate: `${Math.random() * 20 - 8}deg`,
  size: `${Math.random() * 280 + 180}px`,
});

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const branding = getBranding();
  const org = getOrgSettings();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Missing state for carousel
  const [currentSlide, setCurrentSlide] = useState(0);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    try {
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
    } catch (error: any) {
      setLoading(false);
      toast({ title: "An error occurred", description: error.message || String(error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-white relative">
      {/* Top stripe */}
      <div className="h-1.5 w-full bg-[orange]" />

      {/* Background scattered images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bgImages.map((src, i) => {
          const pos = getRandomPosition();
          return (
            <img
              key={i}
              src={src}
              className="absolute opacity-15 object-cover"
              style={{
                top: pos.top,
                left: pos.left,
                transform: `rotate(${pos.rotate})`,
                width: pos.size,
                height: "auto",
              }}
              alt=""
            />
          );
        })}
      </div>

      {/* Three-column layout */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12 gap-6 lg:gap-8 relative z-10">

        {/* LEFT SIDE IMAGE */}
        <div className="hidden lg:flex flex-[0.8] justify-center items-center">
          <img
            src="/bg/bg3.jpg"
            alt="Clinic visual"
            className="h-[75vh] w-auto rounded-xl shadow-xl object-cover"
          />
        </div>

        {/* CENTER SIGNUP FORM */}
        <div className="w-full max-w-[420px] space-y-6 sm:space-y-8">
          {/* Logo & title */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain" />
              ) : (
                <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-muted-foreground mt-1">
                Create your clinic
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Set up your Sync Clinic account
              </p>
            </div>
          </div>

          {/* Signup form card */}
          <Card className="border-border/60 shadow-lg bg-white/95 backdrop-blur-sm">
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

          {/* Already have account */}
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

        {/* RIGHT SIDE NARRATION CARD */}
        <div className="hidden lg:flex flex-1 justify-start items-center">
          <div className="w-[600px] min-h-[600px] max-h-[1200px] p-6 bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col">

            <h2 className="text-xl font-bold mb-4 text-[#520E69]">About this System:</h2>

            {/* Carousel container */}
            <div className="flex-1 relative">

              {/* Slide wrapper */}
              <div className="overflow-hidden h-full">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* Slide 1 */}
                  <div className="w-full flex-shrink-0 pr-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Developer & Contact</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This Healthcare Management System is designed, built, and developed by <strong>James</strong> (+254798993404) of <strong>SyncScore</strong>, enabling your facility to operate efficiently, securely, and fully customized while providing high-quality patient care.
                    </p>
                    <br></br>
                    <h3 className="font-semibold text-gray-700 mb-2">Overview</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Are you struggling to keep accurate and up-to-date patient records? Modern healthcare facilities require a seamless system to manage both human and animal patients efficiently. This robust, flexible, and scalable Healthcare Management System is designed to centralize your clinic or hospital operations on a single, secure platform.
                    </p>
                    <br></br>
                    <h3 className="font-semibold text-gray-700 mt-4 mb-2">Core Features</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1">
                      <li>Track Patients: Manage human and animal patients in separate modules.</li>
                      <li>Manage Appointments & Visits: Schedule, record, and review consultations.</li>
                      <li>Record Vitals & Measurements: Track health indicators with alerts for abnormal values.</li>
                      <li>Handle Prescriptions & Pharmacy Dispensing.</li>
                      <li>Laboratory Management: Record tests, store results, flag abnormalities.</li>
                      <li>Billing & Payments: Issue invoices, track multiple payment modes.</li>
                      <li>Generate Reports & Analytics: Exportable to PDF or Excel.</li>
                      <li>Document Management: Upload, attach, and version control documents.</li>
                      <li>Organization Settings & Branding.</li>
                      <li>User Roles & Permissions.</li>
                      <li>Notifications & Reminders.</li>
                    </ul>
                  </div>

                  {/* Slide 2 */}
                  <div className="w-full flex-shrink-0 pr-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Key Highlights</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1">
                      <li>Fully Dynamic & Configurable.</li>
                      <li>Kenya-Specific: Includes M-Pesa payment support.</li>
                      <li>Scalable & Extensible.</li>
                      <li>Customizable Branding.</li>
                      <li>Separate Human & Animal Modules.</li>
                      <li>Developer-Ready: Easy to enhance and integrate.</li>
                    </ul>
                    <h3 className="font-semibold text-gray-700 mt-4 mb-2">Sidebar Overview</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1">
                      <li>Dashboard – Overview of activities and metrics.</li>
                      <li>Patients – Human and animal patient management.</li>
                      <li>Visits – Record and track consultations.</li>
                      <li>Vitals – Monitor measurements over time.</li>
                      <li>Prescriptions – Generate, record, print.</li>
                      <li>Laboratory – Manage lab tests and results.</li>
                      <li>Billing – Financial records management.</li>
                      <li>Reports – Analytics and summaries.</li>
                      <li>Documents – Upload and manage files.</li>
                      <li>Assets – Track clinic or hospital assets.</li>
                      <li>Settings – Organization configuration and branding.</li>
                      <li>Audit Log – Complete system action trail.</li>
                    </ul>
                  </div>
                  {/* Slide 3 */}
                  <div className="w-full flex-shrink-0 pr-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Software Eng.</h3>

                    {/* Text section without bullets */}
                    <div className="text-sm text-gray-600 leading-relaxed space-y-1 mb-3">
                      <p>James Sammy</p>
                      <p>CEO & Founder</p>
                      <p>Sync Solutions Ltd</p>
                      <p>+254 798 993 404</p>
                    </div>

                    {/* Images section */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <img
                        src="/bg/bg1.jpg" // replace with your actual image path
                        alt="James Sammy"
                        className="w-24 h-24 object-cover rounded-md shadow-md"
                      />
                      <img
                        src="/bg/logo1.png"
                        alt="Company Logo"
                        className="w-24 h-24 object-cover rounded-md shadow-md"
                      />
                      <img
                        src="/bg/ceo1.jpeg"
                        alt="Team Image"
                        className="w-24 h-24 object-cover rounded-md shadow-md"
                      />
                      <img
                        src="/bg/team2.jpeg"
                        alt="Team Image"
                        className="w-24 h-24 object-cover rounded-md shadow-md"
                      />
                      <img
                        src="/bg/team1.jpeg"
                        alt="Team Image"
                        className="w-24 h-24 object-cover rounded-md shadow-md"
                      />
                    </div>
                  </div>


                </div>
              </div>

              {/* Pagination Buttons */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 w-2 rounded-full ${currentSlide === idx ? "bg-primary" : "bg-gray-300"}`}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}