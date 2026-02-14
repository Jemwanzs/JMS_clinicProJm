import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Stethoscope, FlaskConical, Receipt, FileText, Settings, Shield,
  ChevronDown, ChevronRight, Activity, Pill, BarChart3, Menu, X, LogOut, User, Package,
} from "lucide-react";
import { getOrgSettings, getBranding } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    label: "Patients",
    icon: Users,
    children: [
      { label: "Patient List", path: "/patients" },
      { label: "Register Patient", path: "/patients/register" },
    ],
  },
  { label: "Visits", icon: Stethoscope, path: "/visits" },
  { label: "Vitals", icon: Activity, path: "/vitals" },
  { label: "Prescriptions", icon: Pill, path: "/prescriptions" },
  { label: "Laboratory", icon: FlaskConical, path: "/laboratory" },
  { label: "Billing", icon: Receipt, path: "/billing" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "Documents", icon: FileText, path: "/documents" },
  { label: "Assets", icon: Package, path: "/assets" },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Organization", path: "/settings/organization" },
      { label: "Branding", path: "/settings/branding" },
      { label: "Master Lists", path: "/settings/master-lists" },
      { label: "Roles & Permissions", path: "/settings/roles" },
      { label: "Users", path: "/settings/users" },
    ],
  },
  { label: "Audit Log", icon: Shield, path: "/audit" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(["Patients", "Settings"]);
  const [orgName, setOrgName] = useState("Sync Clinic");
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const org = getOrgSettings();
    const branding = getBranding();
    if (org.name) setOrgName(org.name);
    if (branding.logo) setLogo(branding.logo);
  }, [location.pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => path === location.pathname;
  const isChildActive = (children?: { path: string }[]) =>
    children?.some((c) => c.path === location.pathname);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 sm:h-16 items-center gap-3 px-4 sm:px-5 border-b border-sidebar-border">
        {logo ? (
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
        ) : (
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-sidebar-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <div className="animate-slide-in-left min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-sidebar-primary-foreground tracking-tight truncate">
              {orgName}
            </h1>
            <p className="text-[9px] sm:text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
              Management System
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4 space-y-0.5 sm:space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children;
          const isOpen = openMenus.includes(item.label);
          const active = isActive(item.path) || isChildActive(item.children);

          if (hasChildren) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex w-full items-center gap-2.5 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-50" /> : <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-50" />}
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-4 sm:ml-5 mt-0.5 sm:mt-1 space-y-0.5 border-l border-sidebar-border pl-3 sm:pl-4">
                    {item.children!.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-[13px] transition-colors ${
                          isActive(child.path)
                            ? "bg-sidebar-primary/15 text-sidebar-primary font-medium"
                            : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path!}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ${
                active
                  ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="border-t border-sidebar-border px-3 py-2.5 sm:py-3">
        {!collapsed && user && (
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5 text-sidebar-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.fullName}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-medium">Sign out</span>}
        </button>
        {!collapsed && (
          <p className="text-[10px] text-sidebar-foreground/30 text-center mt-2">{orgName} v1.0</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`hidden lg:flex flex-col sidebar-gradient border-r border-sidebar-border transition-all duration-300 ${collapsed ? "w-[60px]" : "w-60 xl:w-64"}`}>
        {sidebarContent}
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-50 w-60 sm:w-64 sidebar-gradient border-r border-sidebar-border transform transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 text-sidebar-foreground/60 hover:text-sidebar-foreground">
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 sm:h-14 items-center gap-3 sm:gap-4 border-b border-border bg-card px-3 sm:px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-contain" />
            ) : (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] sm:text-xs font-semibold text-primary">
                  {orgName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
