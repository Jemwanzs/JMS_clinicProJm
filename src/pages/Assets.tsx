import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  getAssetFolders, addAssetFolder, updateAssetFolder, deleteAssetFolder,
  getAssets, addAsset, updateAsset, deleteAsset,
  type AssetFolder, type Asset,
} from "@/lib/store";
import {
  FolderPlus, Upload, Pencil, Trash2, Download, ArrowLeft, Search, FolderOpen, Image, MoreVertical,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Assets() {
  const [folders, setFolders] = useState<AssetFolder[]>(getAssetFolders());
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");

  // Dialogs
  const [folderDialog, setFolderDialog] = useState(false);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");

  const [assetDialog, setAssetDialog] = useState(false);
  const [editAssetId, setEditAssetId] = useState<string | null>(null);
  const [assetName, setAssetName] = useState("");
  const [assetDesc, setAssetDesc] = useState("");
  const [assetImage, setAssetImage] = useState("");
  const [assetImageType, setAssetImageType] = useState("");
  const [assetImageName, setAssetImageName] = useState("");

  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    setFolders(getAssetFolders());
    if (activeFolderId) setAssets(getAssets(activeFolderId));
  };

  const openFolder = (id: string) => {
    setActiveFolderId(id);
    setAssets(getAssets(id));
    setSearch("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAssetImage(reader.result as string);
      setAssetImageType(file.type);
      setAssetImageName(file.name);
      if (!assetName) setAssetName(file.name.replace(/\.[^.]+$/, ""));
    };
    reader.readAsDataURL(file);
  };

  // Folder CRUD
  const saveFolderDialog = () => {
    if (!folderName.trim()) return;
    if (editFolderId) {
      updateAssetFolder(editFolderId, folderName.trim());
    } else {
      addAssetFolder(folderName.trim());
    }
    setFolderDialog(false);
    setFolderName("");
    setEditFolderId(null);
    reload();
  };

  const handleDeleteFolder = (id: string) => {
    if (!confirm("Delete this folder and all its assets?")) return;
    deleteAssetFolder(id);
    if (activeFolderId === id) setActiveFolderId(null);
    reload();
  };

  // Asset CRUD
  const openAddAsset = () => {
    setEditAssetId(null);
    setAssetName("");
    setAssetDesc("");
    setAssetImage("");
    setAssetImageType("");
    setAssetImageName("");
    setAssetDialog(true);
  };

  const openEditAsset = (a: Asset) => {
    setEditAssetId(a.id);
    setAssetName(a.name);
    setAssetDesc(a.description);
    setAssetImage(a.imageData);
    setAssetImageType(a.imageType);
    setAssetImageName(a.imageName);
    setAssetDialog(true);
  };

  const saveAssetDialog = () => {
    if (!assetName.trim() || !assetImage) return;
    if (editAssetId) {
      updateAsset(editAssetId, { name: assetName, description: assetDesc, imageData: assetImage, imageType: assetImageType, imageName: assetImageName });
    } else {
      addAsset({ folderId: activeFolderId!, name: assetName, description: assetDesc, imageData: assetImage, imageType: assetImageType, imageName: assetImageName });
    }
    setAssetDialog(false);
    reload();
  };

  const handleDeleteAsset = (id: string) => {
    if (!confirm("Delete this asset?")) return;
    deleteAsset(id);
    reload();
  };

  const handleDownload = (a: Asset) => {
    const link = document.createElement("a");
    link.href = a.imageData;
    link.download = a.imageName || `${a.name}.png`;
    link.click();
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFolders = folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {activeFolderId && (
            <Button variant="ghost" size="icon" onClick={() => { setActiveFolderId(null); setSearch(""); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {activeFolder ? activeFolder.name : "Assets & Equipment"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {activeFolder ? `${filteredAssets.length} item(s)` : `${folders.length} folder(s)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!activeFolderId ? (
            <Button size="sm" onClick={() => { setEditFolderId(null); setFolderName(""); setFolderDialog(true); }}>
              <FolderPlus className="h-4 w-4 mr-1" /> New Folder
            </Button>
          ) : (
            <Button size="sm" onClick={openAddAsset}>
              <Upload className="h-4 w-4 mr-1" /> Upload Asset
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={activeFolderId ? "Search assets..." : "Search folders..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Folder view */}
      {!activeFolderId && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredFolders.map((f) => (
            <Card
              key={f.id}
              className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl group relative"
              onClick={() => openFolder(f.id)}
            >
              <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 px-3">
                <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary/70 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-foreground text-center truncate w-full">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">{getAssets(f.id).length} items</p>
              </CardContent>
              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditFolderId(f.id); setFolderName(f.name); setFolderDialog(true); }}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteFolder(f.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
          {filteredFolders.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No folders yet. Create one to start organizing assets.</p>
            </div>
          )}
        </div>
      )}

      {/* Assets grid */}
      {activeFolderId && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredAssets.map((a) => (
            <Card key={a.id} className="rounded-2xl overflow-hidden group relative hover:shadow-md transition-shadow">
              {/* Image container: ~6cm x 4cm → use aspect ratio ~3:2 */}
              <div
                className="relative w-full cursor-pointer bg-muted"
                style={{ aspectRatio: "3/2", maxHeight: "160px" }}
                onClick={() => setPreviewAsset(a)}
              >
                <img
                  src={a.imageData}
                  alt={a.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-2.5 sm:p-3">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">{a.name}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{a.imageName}</p>
                {a.description && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                )}
                {/* Actions */}
                <div className="flex items-center gap-1 mt-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(a)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditAsset(a)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteAsset(a.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredAssets.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No assets in this folder. Upload one to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Folder Dialog */}
      <Dialog open={folderDialog} onOpenChange={setFolderDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editFolderId ? "Rename Folder" : "New Folder"}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveFolderDialog()}
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setFolderDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={saveFolderDialog}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Upload/Edit Dialog */}
      <Dialog open={assetDialog} onOpenChange={setAssetDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editAssetId ? "Edit Asset" : "Upload Asset"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Asset name" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
            <Input placeholder="Description (optional)" value={assetDesc} onChange={(e) => setAssetDesc(e.target.value)} />
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> {assetImage ? "Re-upload Image" : "Choose Image"}
              </Button>
              {assetImageName && <span className="ml-2 text-xs text-muted-foreground">{assetImageName}</span>}
            </div>
            {assetImage && (
              <div className="rounded-xl overflow-hidden border border-border bg-muted" style={{ aspectRatio: "3/2", maxHeight: "160px" }}>
                <img src={assetImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAssetDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={saveAssetDialog} disabled={!assetName.trim() || !assetImage}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-2 sm:p-4">
          {previewAsset && (
            <div className="space-y-3">
              <img src={previewAsset.imageData} alt={previewAsset.name} className="w-full rounded-xl object-contain max-h-[70vh]" />
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-medium">{previewAsset.name}</p>
                  <p className="text-xs text-muted-foreground">{previewAsset.imageName}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownload(previewAsset)}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
