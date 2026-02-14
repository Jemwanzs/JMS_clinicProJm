import { Settings, Building2, Palette, ListChecks, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";

const settingsItems = [
  { title: "Organization", desc: "Profile, registration, and contact details", icon: Building2, path: "/settings/organization" },
  { title: "Branding", desc: "Logo, colors, and visual identity", icon: Palette, path: "/settings/branding" },
  { title: "Master Lists", desc: "Services, drugs, lab tests, and more", icon: ListChecks, path: "/settings/master-lists" },
  { title: "Roles & Permissions", desc: "Manage user roles and access control", icon: ShieldCheck, path: "/settings/roles" },
  { title: "User Management", desc: "System users and account settings", icon: Users, path: "/settings/users" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your clinic system.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-xl border border-border bg-card p-6 hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
