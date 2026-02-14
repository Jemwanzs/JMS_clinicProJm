import { useState, useEffect } from "react";
import { Users, Plus, X, Save, Edit2, Search, UserCheck, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getSystemUsers, addSystemUser, updateSystemUser, getRoles, STAFF_TYPES, type SystemUser, type Role } from "@/lib/store";

export default function UsersSettings() {
  const { toast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", roleId: "", roleName: "", staffType: "" as string });

  useEffect(() => { setUsers(getSystemUsers()); setRoles(getRoles()); }, []);

  const openNew = () => { setEditingId(null); setForm({ fullName: "", email: "", phone: "", roleId: "", roleName: "", staffType: "" }); setShowForm(true); };
  const openEdit = (u: SystemUser) => { setEditingId(u.id); setForm({ fullName: u.fullName, email: u.email, phone: u.phone, roleId: u.roleId, roleName: u.roleName, staffType: u.staffType }); setShowForm(true); };

  const handleSave = () => {
    if (!form.fullName || !form.email || !form.staffType) { toast({ title: "Required", description: "Name, email, and staff type are required.", variant: "destructive" }); return; }
    const selectedRole = roles.find(r => r.id === form.roleId);
    const roleName = selectedRole?.name || "Unassigned";
    if (editingId) {
      updateSystemUser(editingId, { ...form, roleName });
      toast({ title: "Updated", description: `User "${form.fullName}" updated.` });
    } else {
      addSystemUser({ ...form, roleName, status: "active", attendance: "present" });
      toast({ title: "Created", description: `User "${form.fullName}" created.` });
    }
    setUsers(getSystemUsers());
    setShowForm(false);
  };

  const toggleStatus = (u: SystemUser, newStatus: SystemUser["status"]) => {
    updateSystemUser(u.id, { status: newStatus });
    setUsers(getSystemUsers());
    toast({ title: "Status Updated", description: `${u.fullName} is now ${newStatus}.` });
  };

  const toggleAttendance = (u: SystemUser) => {
    const newAttendance = u.attendance === "present" ? "absent" : "present";
    updateSystemUser(u.id, { attendance: newAttendance });
    setUsers(getSystemUsers());
    toast({ title: "Attendance Updated", description: `${u.fullName} marked as ${newAttendance}.` });
  };

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.staffType.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    active: "bg-success/10 text-success",
    deactivated: "bg-warning/10 text-warning",
    terminated: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Staff & User Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage doctors, nurses, lab technicians, and other staff.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={openNew}>
          <Plus className="h-4 w-4" />Add Staff
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingId ? "Edit" : "New"} Staff Member</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input placeholder="+254..." value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Staff Type *</Label>
              <Select value={form.staffType} onValueChange={(v) => setForm(p => ({ ...p, staffType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {STAFF_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={form.roleId} onValueChange={(v) => setForm(p => ({ ...p, roleId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.length === 0 ? (
                    <SelectItem value="none" disabled>No roles – create one first</SelectItem>
                  ) : (
                    roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
              <Save className="h-4 w-4" />{editingId ? "Update" : "Create"} Staff
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center"><Users className="h-5 w-5 text-muted-foreground" /></div>
            <p className="text-sm font-medium text-foreground">No staff configured</p>
            <p className="text-xs text-muted-foreground">Add doctors, nurses, lab technicians, and other staff.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-card-foreground">{u.fullName}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">{u.staffType}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[u.status]}`}>{u.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email} • {u.roleName || "No role"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={u.attendance === "present"}
                      onCheckedChange={() => toggleAttendance(u)}
                      disabled={u.status !== "active"}
                    />
                    <span className={`text-[10px] font-medium ${u.attendance === "present" ? "text-success" : "text-muted-foreground"}`}>
                      {u.attendance === "present" ? "Present" : "Absent"}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Edit2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {u.status === "active" && (
                  <>
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-warning" onClick={() => toggleStatus(u, "deactivated")}>
                      <UserX className="h-3 w-3" />Deactivate
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-destructive" onClick={() => toggleStatus(u, "terminated")}>
                      <Clock className="h-3 w-3" />Terminate
                    </Button>
                  </>
                )}
                {u.status === "deactivated" && (
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-success" onClick={() => toggleStatus(u, "active")}>
                    <UserCheck className="h-3 w-3" />Reactivate
                  </Button>
                )}
                {u.status === "terminated" && (
                  <span className="text-[10px] text-destructive font-medium px-2 py-1">Terminated – cannot reactivate</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
