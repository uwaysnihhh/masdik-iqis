import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ETaklim() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 lg:pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              e-Taklim
            </h1>
            <p className="text-muted-foreground">
              Platform pembelajaran online Masjid Pendidikan Ibnul Qayyim
            </p>
            <div className="h-1 w-24 mx-auto gradient-gold rounded-full mt-4" />
          </div>

          {/* Coming Soon Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full" />
              <div className="relative bg-card border border-border rounded-2xl p-12 text-center max-w-md mx-auto shadow-lg">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Coming Soon
                </h2>
                <p className="text-muted-foreground mb-6">
                  Fitur e-Taklim sedang dalam pengembangan. Segera hadir untuk memudahkan pembelajaran ilmu agama secara online.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Dalam Pengembangan</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
