import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Kegiatan from "./pages/Kegiatan";
import ETaklim from "./pages/ETaklim";
import Pustaka from "./pages/Pustaka";
import Layanan from "./pages/Layanan";
import Struktur from "./pages/Struktur";
import Saldo from "./pages/Saldo";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kegiatan" element={<Kegiatan />} />
            <Route path="/e-taklim" element={<ETaklim />} />
            <Route path="/pustaka" element={<Pustaka />} />
            <Route path="/layanan" element={<Layanan />} />
            <Route path="/struktur" element={<Struktur />} />
            <Route path="/saldo" element={<Saldo />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
