import { useState, useEffect } from "react";
import { Plus, Search, ListChecks, Trash2, Edit2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getMasterList, addMasterItem, updateMasterItem, deleteMasterItem, type MasterListItem } from "@/lib/store";

const listTypes = ["Services", "Consultation Types", "Drugs", "Lab Tests", "Procedures", "Insurance Providers", "Payment Modes"];

export default function MasterListSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Services");
  const [items, setItems] = useState<MasterListItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const loadItems = (type: string) => setItems(getMasterList(type));
  useEffect(() => { loadItems(activeTab); }, [activeTab]);

  const openNew = () => { setEditingId(null); setForm({ name: "", code: "", description: "" }); setShowForm(true); };
  const openEdit = (item: MasterListItem) => { setEditingId(item.id); setForm({ name: item.name, code: item.code, description: item.description }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Required", description: "Name is required.", variant: "destructive" }); return; }
    if (editingId) {
      updateMasterItem(editingId, form);
      toast({ title: "Updated", description: `"${form.name}" updated.` });
    } else {
      addMasterItem({ ...form, active: true, listType: activeTab });
      toast({ title: "Added", description: `"${form.name}" added to ${activeTab}.` });
    }
    loadItems(activeTab);
    setShowForm(false);
  };

  const handleDelete = (id: string) => { deleteMasterItem(id); loadItems(activeTab); toast({ title: "Deleted", description: "Item removed." }); };
  const handleToggle = (item: MasterListItem) => { updateMasterItem(item.id, { active: !item.active }); loadItems(activeTab); };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Master Lists</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Configure dynamic lists used across the system.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={openNew}>
          <Plus className="h-4 w-4" />Add Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch(""); setShowForm(false); }}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="flex-wrap h-auto gap-1 w-max sm:w-auto">
            {listTypes.map(t => <TabsTrigger key={t} value={t} className="text-[10px] sm:text-xs">{t}</TabsTrigger>)}
          </TabsList>
        </div>

        {listTypes.map(t => (
          <TabsContent key={t} value={t} className="mt-4 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={`Search ${t.toLowerCase()}...`} className="pl-9" value={activeTab === t ? search : ""} onChange={e => setSearch(e.target.value)} />
            </div>

            {showForm && (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{editingId ? "Edit" : "Add"} {t.slice(0, -1)}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Code</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="Optional" /></div>
                  <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                </div>
                <div className="flex justify-end"><Button onClick={handleSave} className="gap-2 w-full sm:w-auto"><Save className="h-4 w-4" />{editingId ? "Update" : "Add"}</Button></div>
              </div>
            )}

            {filtered.length === 0 && !showForm ? (
              <div className="rounded-xl border border-border bg-card p-10 sm:p-12 text-center">
                <ListChecks className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No {t.toLowerCase()} configured</p>
                <p className="text-xs text-muted-foreground mt-1">Add items to this list to use them across the system.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(item => (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-card-foreground truncate">{item.name}</p>
                        {item.code && <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.code}</span>}
                      </div>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={item.active} onCheckedChange={() => handleToggle(item)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
