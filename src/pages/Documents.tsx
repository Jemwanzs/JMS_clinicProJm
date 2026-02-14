import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Search, Trash2, Download, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getDocuments, addDocument, deleteDocument, getPatients, type DocumentRecord, type Patient } from "@/lib/store";

export default function Documents() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDocuments(getDocuments()); setPatients(getPatients()); }, []);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !patientId) {
      toast({ title: "Required", description: "Select a patient before uploading.", variant: "destructive" });
      return;
    }
    const patient = patients.find(p => p.id === patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";

    Array.from(files).forEach(file => {
      if (file.size > 100 * 1024 * 1024) {
        toast({ title: "File Too Large", description: `${file.name} exceeds 100MB limit.`, variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          addDocument({
            patientId,
            patientName,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: reader.result as string,
          });
          setDocuments(getDocuments());
          toast({ title: "Uploaded", description: `${file.name} uploaded.` });
        } catch {
          toast({ title: "Storage Full", description: "LocalStorage is full. Consider clearing old documents.", variant: "destructive" });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownload = (doc: DocumentRecord) => {
    const a = document.createElement("a");
    a.href = doc.fileData;
    a.download = doc.fileName;
    a.click();
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    setDocuments(getDocuments());
    toast({ title: "Deleted", description: "Document removed." });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filtered = documents.filter(d =>
    d.fileName.toLowerCase().includes(search.toLowerCase()) ||
    d.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Documents</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Upload and manage patient documents, images, and PDFs.</p>
      </div>

      {/* Upload section */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Upload Document</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Patient *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientNo})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={e => handleFileUpload(e.target.files)} />
          <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={e => handleFileUpload(e.target.files)} />
          <Button variant="outline" className="gap-2 text-xs" onClick={() => fileInputRef.current?.click()} disabled={!patientId}>
            <Upload className="h-3.5 w-3.5" />Upload Files
          </Button>
          <Button variant="outline" className="gap-2 text-xs" onClick={() => cameraInputRef.current?.click()} disabled={!patientId}>
            <Camera className="h-3.5 w-3.5" />Take Photo
          </Button>
          <p className="text-[10px] text-muted-foreground self-center">Max 100MB per file. Supports images, PDFs, and documents.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No documents uploaded</p>
            <p className="text-xs text-muted-foreground">Select a patient and upload documents above.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {doc.fileType.startsWith("image/") ? (
                    <img src={doc.fileData} alt={doc.fileName} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-card-foreground">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{doc.patientName} • {formatSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleDownload(doc)}><Download className="h-3 w-3" />Download</Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive" onClick={() => handleDelete(doc.id)}><Trash2 className="h-3 w-3" />Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
