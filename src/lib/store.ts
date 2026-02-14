// localStorage-based data store for Sync Clinic

export interface Patient {
  id: string;
  patientNo: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  idNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  visitNo: string;
  visitType: string;
  doctor: string;
  dateTime: string;
  notes: string;
  status: "open" | "completed" | "closed";
  createdAt: string;
  updatedAt?: string;
}

export interface VitalRecord {
  id: string;
  patientId: string;
  patientName: string;
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  weight: string;
  height: string;
  bmi: string;
  oxygenSat: string;
  notes: string;
  recordedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  visitId: string;
  drugs: { name: string; dosage: string; frequency: string; duration: string; instructions: string }[];
  createdAt: string;
  updatedAt?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  status: "ordered" | "sample_taken" | "result_ready";
  result: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  patientId: string;
  patientName: string;
  items: { description: string; amount: number; source?: string }[];
  total: number;
  paid: number;
  status: "draft" | "issued" | "paid" | "partial" | "unpaid" | "overpaid";
  payments: Payment[];
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  amount: number;
  mode: string;
  reference: string;
  notes: string;
  paidAt: string;
}

export interface BillingHistory {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface OrgSettings {
  name: string;
  tradingName: string;
  regNumber: string;
  email: string;
  phone: string;
  address: string;
  footerNotes: string;
}

export interface BrandingSettings {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  staffType: string;
  status: "active" | "deactivated" | "terminated";
  attendance: "present" | "absent";
  createdAt: string;
  updatedAt?: string;
}

export interface MasterListItem {
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
  listType: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  module: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface DocumentRecord {
  id: string;
  patientId: string;
  patientName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64 for local storage
  uploadedAt: string;
}

// Generic CRUD helpers
function getItems<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch { return []; }
}

function setItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function getObject<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function setObject<T>(key: string, obj: T) {
  localStorage.setItem(key, JSON.stringify(obj));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Audit log
export function addAuditEntry(action: string, module: string, details: string) {
  const entries = getItems<AuditEntry>("sc_audit");
  entries.unshift({
    id: generateId(),
    action,
    module,
    details,
    user: "Admin",
    timestamp: new Date().toISOString(),
  });
  setItems("sc_audit", entries.slice(0, 500));
}

export function getAuditEntries(): AuditEntry[] {
  return getItems("sc_audit");
}

// Billing History
export function addBillingHistory(invoiceId: string, invoiceNo: string, action: string, details: string) {
  const entries = getItems<BillingHistory>("sc_billing_history");
  entries.unshift({
    id: generateId(),
    invoiceId,
    invoiceNo,
    action,
    details,
    user: "Admin",
    timestamp: new Date().toISOString(),
  });
  setItems("sc_billing_history", entries);
}

export function getBillingHistory(invoiceId?: string): BillingHistory[] {
  const all = getItems<BillingHistory>("sc_billing_history");
  return invoiceId ? all.filter(h => h.invoiceId === invoiceId) : all;
}

// Patients
export function getPatients(): Patient[] { return getItems("sc_patients"); }
export function addPatient(data: Omit<Patient, "id" | "patientNo" | "createdAt">): Patient {
  const patients = getPatients();
  const num = (patients.length + 1).toString().padStart(4, "0");
  const patient: Patient = {
    ...data,
    id: generateId(),
    patientNo: `PT-${num}`,
    createdAt: new Date().toISOString(),
  };
  patients.push(patient);
  setItems("sc_patients", patients);
  addAuditEntry("Created", "Patients", `Registered ${data.firstName} ${data.lastName}`);
  return patient;
}

export function updatePatient(id: string, updates: Partial<Patient>) {
  const items = getPatients().map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
  setItems("sc_patients", items);
  addAuditEntry("Updated", "Patients", `Updated patient ${updates.firstName || ""} ${updates.lastName || ""}`);
}
export function deletePatient(id: string) {
  const p = getPatients().find(pt => pt.id === id);
  setItems("sc_patients", getPatients().filter(pt => pt.id !== id));
  addAuditEntry("Deleted", "Patients", `Deleted patient ${p ? p.firstName + " " + p.lastName : id}`);
}

// Visits
export function getVisits(): Visit[] { return getItems("sc_visits"); }
export function addVisit(data: Omit<Visit, "id" | "visitNo" | "createdAt">): Visit {
  const visits = getVisits();
  const num = (visits.length + 1).toString().padStart(4, "0");
  const visit: Visit = { ...data, id: generateId(), visitNo: `V-${num}`, createdAt: new Date().toISOString() };
  visits.push(visit);
  setItems("sc_visits", visits);
  addAuditEntry("Created", "Visits", `Visit ${visit.visitNo} for ${data.patientName}`);
  return visit;
}
export function updateVisit(id: string, updates: Partial<Visit>) {
  const visits = getVisits().map(v => v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v);
  setItems("sc_visits", visits);
  addAuditEntry("Updated", "Visits", `Visit updated`);
}
export function deleteVisit(id: string) {
  setItems("sc_visits", getVisits().filter(v => v.id !== id));
  addAuditEntry("Deleted", "Visits", `Visit deleted`);
}

// Vitals
export function getVitals(): VitalRecord[] { return getItems("sc_vitals"); }
export function addVital(data: Omit<VitalRecord, "id" | "recordedAt">): VitalRecord {
  const vitals = getVitals();
  const rec: VitalRecord = { ...data, id: generateId(), recordedAt: new Date().toISOString() };
  vitals.push(rec);
  setItems("sc_vitals", vitals);
  addAuditEntry("Recorded", "Vitals", `Vitals for ${data.patientName}`);
  return rec;
}
export function updateVital(id: string, updates: Partial<VitalRecord>) {
  const items = getVitals().map(v => v.id === id ? { ...v, ...updates } : v);
  setItems("sc_vitals", items);
  addAuditEntry("Updated", "Vitals", `Vitals updated`);
}
export function deleteVital(id: string) {
  setItems("sc_vitals", getVitals().filter(v => v.id !== id));
  addAuditEntry("Deleted", "Vitals", `Vital record deleted`);
}

// Prescriptions
export function getPrescriptions(): Prescription[] { return getItems("sc_prescriptions"); }
export function addPrescription(data: Omit<Prescription, "id" | "createdAt">): Prescription {
  const items = getPrescriptions();
  const rx: Prescription = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  items.push(rx);
  setItems("sc_prescriptions", items);
  addAuditEntry("Created", "Prescriptions", `Prescription for ${data.patientName}`);
  return rx;
}
export function updatePrescription(id: string, updates: Partial<Prescription>) {
  const items = getPrescriptions().map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
  setItems("sc_prescriptions", items);
  addAuditEntry("Updated", "Prescriptions", `Prescription updated`);
}
export function deletePrescription(id: string) {
  setItems("sc_prescriptions", getPrescriptions().filter(p => p.id !== id));
  addAuditEntry("Deleted", "Prescriptions", `Prescription deleted`);
}

// Lab
export function getLabOrders(): LabOrder[] { return getItems("sc_lab"); }
export function addLabOrder(data: Omit<LabOrder, "id" | "createdAt">): LabOrder {
  const items = getLabOrders();
  const order: LabOrder = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  items.push(order);
  setItems("sc_lab", items);
  addAuditEntry("Ordered", "Laboratory", `${data.testName} for ${data.patientName}`);
  return order;
}
export function updateLabOrder(id: string, updates: Partial<LabOrder>) {
  const items = getLabOrders().map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o);
  setItems("sc_lab", items);
  addAuditEntry("Updated", "Laboratory", `Lab order updated`);
}
export function deleteLabOrder(id: string) {
  setItems("sc_lab", getLabOrders().filter(o => o.id !== id));
  addAuditEntry("Deleted", "Laboratory", `Lab order deleted`);
}

// Invoices
export function getInvoices(): Invoice[] { return getItems("sc_invoices"); }
export function addInvoice(data: Omit<Invoice, "id" | "invoiceNo" | "createdAt" | "payments">): Invoice {
  const items = getInvoices();
  const num = (items.length + 1).toString().padStart(4, "0");
  const inv: Invoice = { ...data, id: generateId(), invoiceNo: `INV-${num}`, payments: [], createdAt: new Date().toISOString() };
  items.push(inv);
  setItems("sc_invoices", items);
  addAuditEntry("Created", "Billing", `Invoice ${inv.invoiceNo} - KES ${data.total}`);
  addBillingHistory(inv.id, inv.invoiceNo, "Created", `Invoice created for KES ${data.total}`);
  return inv;
}

export function updateInvoice(id: string, updates: Partial<Invoice>) {
  const items = getInvoices().map(inv => inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv);
  setItems("sc_invoices", items);
  const inv = items.find(i => i.id === id);
  if (inv) {
    addBillingHistory(inv.id, inv.invoiceNo, "Updated", `Invoice line items updated. Total: KES ${inv.total}`);
    addAuditEntry("Updated", "Billing", `Invoice ${inv.invoiceNo} updated`);
  }
}

function recalcInvoiceStatus(inv: Invoice): Invoice["status"] {
  if (inv.paid === 0) return "unpaid";
  if (inv.paid > inv.total) return "overpaid";
  if (inv.paid >= inv.total) return "paid";
  return "partial";
}

export function addPaymentToInvoice(invoiceId: string, payment: Omit<Payment, "id" | "paidAt">) {
  const items = getInvoices().map(inv => {
    if (inv.id !== invoiceId) return inv;
    const p: Payment = { ...payment, id: generateId(), paidAt: new Date().toISOString() };
    const payments = [...inv.payments, p];
    const paid = payments.reduce((s, x) => s + x.amount, 0);
    const updated = { ...inv, payments, paid, updatedAt: new Date().toISOString() };
    updated.status = recalcInvoiceStatus(updated);
    return updated;
  });
  setItems("sc_invoices", items);
  const inv = items.find(i => i.id === invoiceId);
  if (inv) {
    addBillingHistory(inv.id, inv.invoiceNo, "Payment", `Payment of KES ${payment.amount} via ${payment.mode}`);
  }
  addAuditEntry("Payment", "Billing", `Payment of KES ${payment.amount} via ${payment.mode}`);
}

export function updatePaymentOnInvoice(invoiceId: string, paymentId: string, updates: Partial<Payment>) {
  const items = getInvoices().map(inv => {
    if (inv.id !== invoiceId) return inv;
    const payments = inv.payments.map(p => p.id === paymentId ? { ...p, ...updates } : p);
    const paid = payments.reduce((s, x) => s + x.amount, 0);
    const updated = { ...inv, payments, paid, updatedAt: new Date().toISOString() };
    updated.status = recalcInvoiceStatus(updated);
    return updated;
  });
  setItems("sc_invoices", items);
  const inv = items.find(i => i.id === invoiceId);
  if (inv) {
    addBillingHistory(inv.id, inv.invoiceNo, "Payment Edited", `Payment ${paymentId} edited`);
    addAuditEntry("Updated", "Billing", `Payment edited on ${inv.invoiceNo}`);
  }
}

export function deletePaymentFromInvoice(invoiceId: string, paymentId: string) {
  const items = getInvoices().map(inv => {
    if (inv.id !== invoiceId) return inv;
    const payments = inv.payments.filter(p => p.id !== paymentId);
    const paid = payments.reduce((s, x) => s + x.amount, 0);
    const updated = { ...inv, payments, paid, updatedAt: new Date().toISOString() };
    updated.status = recalcInvoiceStatus(updated);
    return updated;
  });
  setItems("sc_invoices", items);
  const inv = items.find(i => i.id === invoiceId);
  if (inv) {
    addBillingHistory(inv.id, inv.invoiceNo, "Payment Deleted", `Payment removed`);
    addAuditEntry("Deleted", "Billing", `Payment deleted on ${inv.invoiceNo}`);
  }
}

// Get patient's billable items (labs + prescriptions)
export function getPatientBillableItems(patientId: string): { description: string; amount: number; source: string }[] {
  const labs = getLabOrders().filter(l => l.patientId === patientId);
  const prescriptions = getPrescriptions().filter(p => p.patientId === patientId);
  const items: { description: string; amount: number; source: string }[] = [];
  labs.forEach(l => items.push({ description: `Lab: ${l.testName}`, amount: 0, source: "lab" }));
  prescriptions.forEach(rx => rx.drugs.forEach(d => items.push({ description: `Drug: ${d.name} (${d.dosage})`, amount: 0, source: "prescription" })));
  return items;
}

// Org Settings
const defaultOrg: OrgSettings = { name: "Sync Clinic", tradingName: "", regNumber: "", email: "", phone: "", address: "", footerNotes: "" };
export function getOrgSettings(): OrgSettings { return getObject("sc_org", defaultOrg); }
export function saveOrgSettings(s: OrgSettings) { setObject("sc_org", s); addAuditEntry("Updated", "Settings", "Organization settings updated"); }

// Branding
const defaultBranding: BrandingSettings = { logo: "", primaryColor: "#2a9d8f", secondaryColor: "#264653", accentColor: "#e9c46a", textColor: "#1d3557" };
export function getBranding(): BrandingSettings { return getObject("sc_branding", defaultBranding); }
export function saveBranding(b: BrandingSettings) { setObject("sc_branding", b); addAuditEntry("Updated", "Branding", "Branding settings updated"); }

// Roles
export function getRoles(): Role[] { return getItems("sc_roles"); }
export function addRole(data: Omit<Role, "id" | "createdAt">): Role {
  const items = getRoles();
  const role: Role = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  items.push(role);
  setItems("sc_roles", items);
  addAuditEntry("Created", "Roles", `Role: ${data.name}`);
  return role;
}
export function updateRole(id: string, updates: Partial<Role>) {
  const items = getRoles().map(r => r.id === id ? { ...r, ...updates } : r);
  setItems("sc_roles", items);
}
export function deleteRole(id: string) {
  setItems("sc_roles", getRoles().filter(r => r.id !== id));
}

// Users
export function getSystemUsers(): SystemUser[] { return getItems("sc_users"); }
export function addSystemUser(data: Omit<SystemUser, "id" | "createdAt">): SystemUser {
  const items = getSystemUsers();
  const user: SystemUser = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  items.push(user);
  setItems("sc_users", items);
  addAuditEntry("Created", "Users", `User: ${data.fullName} (${data.staffType})`);
  return user;
}
export function updateSystemUser(id: string, updates: Partial<SystemUser>) {
  const items = getSystemUsers().map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u);
  setItems("sc_users", items);
  addAuditEntry("Updated", "Users", `User updated`);
}

// Master Lists
export function getMasterList(listType: string): MasterListItem[] {
  return getItems<MasterListItem>("sc_master").filter(i => i.listType === listType);
}
export function getAllMasterItems(): MasterListItem[] { return getItems("sc_master"); }
export function addMasterItem(data: Omit<MasterListItem, "id" | "createdAt">): MasterListItem {
  const items = getItems<MasterListItem>("sc_master");
  const item: MasterListItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  items.push(item);
  setItems("sc_master", items);
  addAuditEntry("Created", "Master Lists", `${data.listType}: ${data.name}`);
  return item;
}
export function updateMasterItem(id: string, updates: Partial<MasterListItem>) {
  const items = getItems<MasterListItem>("sc_master").map(i => i.id === id ? { ...i, ...updates } : i);
  setItems("sc_master", items);
}
export function deleteMasterItem(id: string) {
  setItems("sc_master", getItems<MasterListItem>("sc_master").filter(i => i.id !== id));
}

// Documents
export function getDocuments(): DocumentRecord[] { return getItems("sc_documents"); }
export function addDocument(data: Omit<DocumentRecord, "id" | "uploadedAt">): DocumentRecord {
  const items = getDocuments();
  const doc: DocumentRecord = { ...data, id: generateId(), uploadedAt: new Date().toISOString() };
  items.push(doc);
  setItems("sc_documents", items);
  addAuditEntry("Uploaded", "Documents", `${data.fileName} for ${data.patientName}`);
  return doc;
}
export function deleteDocument(id: string) {
  const doc = getDocuments().find(d => d.id === id);
  setItems("sc_documents", getDocuments().filter(d => d.id !== id));
  if (doc) addAuditEntry("Deleted", "Documents", `Deleted ${doc.fileName}`);
}

// Utility
export function calcAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
}

export function isInPeriod(dateStr: string, period: string, customFrom?: string, customTo?: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case "today": return date >= today;
    case "week": { const w = new Date(today); w.setDate(w.getDate() - 7); return date >= w; }
    case "month": { const m = new Date(today); m.setMonth(m.getMonth() - 1); return date >= m; }
    case "quarter": { const q = new Date(today); q.setMonth(q.getMonth() - 3); return date >= q; }
    case "year": { const y = new Date(today); y.setFullYear(y.getFullYear() - 1); return date >= y; }
    case "custom": {
      if (!customFrom || !customTo) return true;
      const from = new Date(customFrom);
      const to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
      return date >= from && date <= to;
    }
    default: return true;
  }
}

// Staff types for user management
export const STAFF_TYPES = ["Doctor", "Nurse", "Lab Technician", "Pharmacist", "Receptionist", "Administrator", "Other"] as const;

// Assets / Equipment
export interface AssetFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  folderId: string;
  name: string;
  description: string;
  imageData: string; // base64
  imageType: string;
  imageName: string;
  createdAt: string;
  updatedAt?: string;
}

export function getAssetFolders(): AssetFolder[] { return getItems("sc_asset_folders"); }
export function addAssetFolder(name: string): AssetFolder {
  const items = getAssetFolders();
  const folder: AssetFolder = { id: generateId(), name, createdAt: new Date().toISOString() };
  items.push(folder);
  setItems("sc_asset_folders", items);
  addAuditEntry("Created", "Assets", `Folder: ${name}`);
  return folder;
}
export function updateAssetFolder(id: string, name: string) {
  const items = getAssetFolders().map(f => f.id === id ? { ...f, name } : f);
  setItems("sc_asset_folders", items);
}
export function deleteAssetFolder(id: string) {
  setItems("sc_asset_folders", getAssetFolders().filter(f => f.id !== id));
  // also delete assets in that folder
  setItems("sc_assets", getAssets().filter(a => a.folderId !== id));
  addAuditEntry("Deleted", "Assets", "Folder deleted with contents");
}

export function getAssets(folderId?: string): Asset[] {
  const all = getItems<Asset>("sc_assets");
  return folderId ? all.filter(a => a.folderId === folderId) : all;
}
export function addAsset(data: Omit<Asset, "id" | "createdAt">): Asset {
  const items = getItems<Asset>("sc_assets");
  const asset: Asset = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  items.push(asset);
  setItems("sc_assets", items);
  addAuditEntry("Uploaded", "Assets", `Asset: ${data.name}`);
  return asset;
}
export function updateAsset(id: string, updates: Partial<Asset>) {
  const items = getItems<Asset>("sc_assets").map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
  setItems("sc_assets", items);
  addAuditEntry("Updated", "Assets", `Asset updated`);
}
export function deleteAsset(id: string) {
  const asset = getItems<Asset>("sc_assets").find(a => a.id === id);
  setItems("sc_assets", getItems<Asset>("sc_assets").filter(a => a.id !== id));
  if (asset) addAuditEntry("Deleted", "Assets", `Deleted asset: ${asset.name}`);
}
