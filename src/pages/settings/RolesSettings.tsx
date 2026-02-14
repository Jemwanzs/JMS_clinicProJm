import { useState, useEffect } from "react";
import { ShieldCheck, Plus, Trash2, Edit2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getRoles, addRole, updateRole, deleteRole, type Role } from "@/lib/store";

const modules = ["Patients", "Visits", "Vitals", "Prescriptions", "Laboratory", "Billing", "Reports", "Documents", "Settings"];
const actions = ["view", "create", "edit", "delete"] as const;

export default function RolesSettings() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>>({});

  useEffect(() => { setRoles(getRoles()); }, []);

  type PermSet = { view: boolean; create: boolean; edit: boolean; delete: boolean };
  const initPermissions = (): Record<string, PermSet> => {
    const p: Record<string, PermSet> = {};
    modules.forEach(m => { p[m] = { view: false, create: false, edit: false, delete: false }; });
    return p;
  };

  const openNew = () => {
    setEditingId(null);
    setName("");
    setPermissions(initPermissions());
    setShowForm(true);
  };

  const openEdit = (role: Role) => {
    setEditingId(role.id);
    setName(role.name);
    const p = initPermissions();
    Object.entries(role.permissions).forEach(([mod, perms]) => {
      if (p[mod]) p[mod] = perms;
    });
    setPermissions(p);
    setShowForm(true);
  };

  const togglePerm = (mod: string, action: string) => {
    setPermissions(prev => ({
      ...prev,
      [mod]: { ...prev[mod], [action]: !prev[mod][action] }
    }));
  };

  const handleSave = () => {
    if (!name.trim()) { toast({ title: "Required", description: "Role name is required.", variant: "destructive" }); return; }
    if (editingId) {
      updateRole(editingId, { name, permissions });
      toast({ title: "Updated", description: `Role "${name}" updated.` });
    } else {
      addRole({ name, permissions });
      toast({ title: "Created", description: `Role "${name}" created.` });
    }
    setRoles(getRoles());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteRole(id);
    setRoles(getRoles());
    toast({ title: "Deleted", description: "Role deleted." });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Roles & Permissions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage access control for system users.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={openNew}>
          <Plus className="h-4 w-4" />Create Role
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editingId ? "Edit" : "New"} Role</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Doctor, Nurse, Receptionist" />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Permissions</Label>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Module</th>
                    {actions.map(a => <th key={a} className="py-2 px-3 font-medium text-muted-foreground capitalize">{a}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {modules.map(mod => (
                    <tr key={mod} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 font-medium text-foreground">{mod}</td>
                      {actions.map(a => (
                        <td key={a} className="py-2 px-3 text-center">
                          <Checkbox checked={permissions[mod]?.[a] || false} onCheckedChange={() => togglePerm(mod, a)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
              <Save className="h-4 w-4" />{editingId ? "Update" : "Create"} Role
            </Button>
          </div>
        </div>
      )}

      {roles.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No roles configured</p>
            <p className="text-xs text-muted-foreground">Create roles with specific permissions to control access.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map(role => (
            <div key={role.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-card-foreground">{role.name}</p>
                <p className="text-xs text-muted-foreground">
                  {Object.values(role.permissions).reduce((c, p) => c + Object.values(p).filter(Boolean).length, 0)} permissions
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(role)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(role.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
