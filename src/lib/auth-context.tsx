import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { addAuditEntry } from "@/lib/store";

// ─── Multi-tenant ready auth types ───
// When backend is plugged in, replace localStorage calls with API calls
// and inject tenant_id into all queries via TenantContext

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string; // multi-tenant: every user belongs to a tenant
  avatar?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string; // subdomain or URL slug for multi-tenant routing
  plan?: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: Tenant | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  clinicName: string; // creates new tenant
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Local storage keys (prefix with tenant for isolation) ───
const AUTH_USER_KEY = "sc_auth_user";
const AUTH_USERS_DB_KEY = "sc_auth_users_db"; // simulated users table
const TENANTS_KEY = "sc_tenants";

interface StoredUser {
  id: string;
  email: string;
  password: string; // In production: NEVER store plain text — use hashed passwords server-side
  fullName: string;
  role: string;
  tenantId: string;
}

function getStoredUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(AUTH_USERS_DB_KEY) || "[]"); }
  catch { return []; }
}

function getTenants(): Tenant[] {
  try { return JSON.parse(localStorage.getItem(TENANTS_KEY) || "[]"); }
  catch { return []; }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const u: AuthUser = JSON.parse(stored);
        setUser(u);
        const tenants = getTenants();
        setTenant(tenants.find(t => t.id === u.tenantId) || null);
      }
    } catch { /* no session */ }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Replace with API call: POST /api/auth/login
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };

    const tenants = getTenants();
    const t = tenants.find(t => t.id === found.tenantId);

    const authUser: AuthUser = {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      role: found.role,
      tenantId: found.tenantId,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    setTenant(t || null);
    addAuditEntry("Login", "Auth", `${found.fullName} logged in`);
    return { success: true };
  };

  const signup = async (data: SignupData) => {
    // TODO: Replace with API call: POST /api/auth/signup
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Create tenant
    const tenantId = generateId();
    const newTenant: Tenant = {
      id: tenantId,
      name: data.clinicName,
      slug: data.clinicName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      createdAt: new Date().toISOString(),
    };
    const tenants = getTenants();
    tenants.push(newTenant);
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));

    // Create user as admin of that tenant
    const userId = generateId();
    const newUser: StoredUser = {
      id: userId,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: "Admin",
      tenantId,
    };
    users.push(newUser);
    localStorage.setItem(AUTH_USERS_DB_KEY, JSON.stringify(users));

    // Auto-login
    const authUser: AuthUser = {
      id: userId,
      email: data.email,
      fullName: data.fullName,
      role: "Admin",
      tenantId,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));

    // Set org name to the clinic name
    const orgSettings = { name: data.clinicName, tradingName: "", regNumber: "", email: data.email, phone: "", address: "", footerNotes: "" };
    localStorage.setItem("sc_org", JSON.stringify(orgSettings));

    setUser(authUser);
    setTenant(newTenant);
    addAuditEntry("Signup", "Auth", `${data.fullName} created account for ${data.clinicName}`);
    return { success: true };
  };

  const logout = () => {
    if (user) addAuditEntry("Logout", "Auth", `${user.fullName} logged out`);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, isLoading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/*
 * ─── MULTI-TENANT ARCHITECTURE NOTES ───
 * 
 * When plugging in a real backend (Supabase, etc.):
 * 
 * 1. DATABASE SCHEMA:
 *    - tenants (id, name, slug, plan, created_at)
 *    - users (id, email, password_hash, full_name, tenant_id FK, role_id FK)
 *    - user_roles (id, user_id FK, role enum, tenant_id FK)
 *    - All data tables (patients, visits, invoices, etc.) get a tenant_id FK
 * 
 * 2. ROW LEVEL SECURITY (RLS):
 *    - Every table policy filters by tenant_id = auth.jwt()->>'tenant_id'
 *    - Users can only see data belonging to their tenant
 * 
 * 3. API LAYER:
 *    - Replace localStorage calls in store.ts with Supabase client queries
 *    - The tenant_id is injected automatically via RLS, no manual filtering needed
 * 
 * 4. AUTH FLOW:
 *    - Replace login/signup with Supabase Auth (signInWithPassword, signUp)
 *    - Store tenant_id in user metadata or custom claims
 *    - Use onAuthStateChange for session management
 * 
 * 5. SLUG-BASED ROUTING (optional):
 *    - Route: /:tenantSlug/dashboard
 *    - Validate slug against tenants table on load
 */
