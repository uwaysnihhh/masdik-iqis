import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
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

// Protected Route wrapper that redirects to login if not authenticated or not admin
function AdminRoute() {
  const { user, isLoading, isAdmin } = useAuth();
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  
  // Redirect to login if authenticated but not admin
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return <Admin />;
}

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
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
