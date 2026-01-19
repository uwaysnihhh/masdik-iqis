import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  Video, 
  FolderOpen, 
  Download,
  Calendar,
  User,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface PustakaItem {
  id: string;
  title: string;
  description: string | null;
  type: "document" | "video" | "audio";
  file_url: string;
  thumbnail_url: string | null;
  category: string | null;
  created_at: string;
  created_by_name: string | null;
}

export default function Pustaka() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<PustakaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("pustaka" as any)
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        
        if (data && !error) {
          setItems(data as unknown as PustakaItem[]);
        }
      } catch (e) {
        console.error("Error fetching pustaka:", e);
      }
      setIsLoading(false);
    };

    fetchItems();
  }, []);

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "audio":
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800";
      case "audio":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 lg:pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Pustaka Digital
            </h1>
            <p className="text-muted-foreground">
              Arsip materi taklim dan video kajian Masjid Pendidikan Ibnul Qayyim
            </p>
            <div className="h-1 w-24 mx-auto gradient-gold rounded-full mt-4" />
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari materi atau video..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  Semua
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category as string)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Pustaka Masih Kosong
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Materi taklim dan video kajian akan segera ditambahkan oleh admin. 
                Silakan kunjungi kembali nanti.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {item.thumbnail_url ? (
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          {getTypeIcon(item.type)}
                        </div>
                      )}
                      <Badge 
                        className={`absolute top-2 right-2 ${getTypeBadgeColor(item.type)}`}
                      >
                        {item.type === "video" ? "Video" : item.type === "audio" ? "Audio" : "Dokumen"}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString("id-ID")}
                        </div>
                        <a 
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {item.type === "video" ? (
                            <>
                              <ExternalLink className="w-3 h-3" />
                              Tonton
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              Unduh
                            </>
                          )}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
