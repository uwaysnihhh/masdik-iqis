import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, FileText, Video, Music, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PustakaItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_url: string;
  thumbnail_url: string | null;
  category: string | null;
  created_at: string;
  created_by_name: string | null;
  is_active: boolean;
}

interface PustakaManagerProps {
  userId: string | undefined;
  searchTerm: string;
}

export function PustakaManager({ userId, searchTerm }: PustakaManagerProps) {
  const [items, setItems] = useState<PustakaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("document");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [category, setCategory] = useState("");
  const [createdByName, setCreatedByName] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("pustaka")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data as PustakaItem[]);
    setIsLoading(false);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!title || !fileUrl) {
      toast({ title: "Judul dan URL file wajib diisi", variant: "destructive" });
      return;
    }
    
    let thumbnailUrl: string | null = null;
    
    // If thumbnail file is selected, convert to base64 URL for now
    // In production, you would upload to Supabase Storage
    if (thumbnailPreview) {
      thumbnailUrl = thumbnailPreview;
    }
    
    const { data, error } = await supabase
      .from("pustaka")
      .insert({
        title, description: description || null, type, file_url: fileUrl,
        thumbnail_url: thumbnailUrl, category: category || null,
        created_by: userId, created_by_name: createdByName || null,
      })
      .select()
      .single();
    if (error) { toast({ title: "Gagal menambahkan", variant: "destructive" }); return; }
    setItems([data as PustakaItem, ...items]);
    resetForm(); setDialogOpen(false);
    toast({ title: "Pustaka Ditambahkan" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pustaka").delete().eq("id", id);
    if (error) { toast({ title: "Gagal menghapus", variant: "destructive" }); return; }
    setItems(items.filter((item) => item.id !== id));
    setDeleteId(null);
    toast({ title: "Pustaka Dihapus" });
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setType("document");
    setFileUrl(""); setThumbnailFile(null); setThumbnailPreview(""); setCategory(""); setCreatedByName("");
  };

  const getTypeIcon = (t: string) => t === "video" ? <Video className="w-4 h-4" /> : t === "audio" ? <Music className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  const getTypeBadgeColor = (t: string) => t === "video" ? "bg-red-100 text-red-800" : t === "audio" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base md:text-lg">Kelola Pustaka</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Tambah</span></Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Tambah Pustaka Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Judul <span className="text-destructive">*</span></Label><Input placeholder="Judul materi/video" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Tipe</Label><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="document">Dokumen</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>URL File/Video <span className="text-destructive">*</span></Label><Input placeholder="https://..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} /><p className="text-xs text-muted-foreground">Untuk video YouTube, gunakan link video.</p></div>
              <div className="space-y-2">
                <Label>Thumbnail (opsional)</Label>
                <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img src={thumbnailPreview} alt="Preview" className="w-32 h-20 object-cover rounded border" />
                  </div>
                )}
              </div>
              <div className="space-y-2"><Label>Kategori (opsional)</Label><Input placeholder="Fiqih, Akhlak, dll." value={category} onChange={(e) => setCategory(e.target.value)} /></div>
              <div className="space-y-2"><Label>Nama Pemateri (opsional)</Label><Input placeholder="Nama ustadz/pemateri" value={createdByName} onChange={(e) => setCreatedByName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Keterangan (opsional)</Label><Textarea placeholder="Keterangan singkat" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <Button onClick={handleAdd} className="w-full">Simpan Pustaka</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Judul</TableHead><TableHead>Tipe</TableHead><TableHead className="hidden md:table-cell">Kategori</TableHead><TableHead className="hidden sm:table-cell">Tanggal</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (<TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{searchTerm ? "Tidak ada pustaka yang cocok" : "Belum ada pustaka"}</TableCell></TableRow>
            ) : (filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-sm max-w-[200px] truncate">{item.title}</TableCell>
                <TableCell><Badge className={getTypeBadgeColor(item.type)}><span className="flex items-center gap-1">{getTypeIcon(item.type)}{item.type === "video" ? "Video" : item.type === "audio" ? "Audio" : "Dokumen"}</span></Badge></TableCell>
                <TableCell className="hidden md:table-cell text-sm">{item.category || "-"}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm">{new Date(item.created_at).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="px-2"><ExternalLink className="w-4 h-4" /></Button></a>
                    <Dialog open={deleteId === item.id} onOpenChange={(open) => setDeleteId(open ? item.id : null)}>
                      <DialogTrigger asChild><Button size="sm" variant="outline" className="text-destructive hover:text-destructive px-2"><Trash2 className="w-4 h-4" /></Button></DialogTrigger>
                      <DialogContent><DialogHeader><DialogTitle>Hapus Pustaka</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus "{item.title}"?</DialogDescription></DialogHeader><DialogFooter className="gap-2 sm:gap-0"><Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="destructive" onClick={() => handleDelete(item.id)}>Hapus</Button></DialogFooter></DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
