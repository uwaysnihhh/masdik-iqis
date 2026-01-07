import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoMasjid from "@/assets/logo-masjid.png";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Kegiatan", href: "/kegiatan" },
  { name: "Layanan", href: "/layanan" },
  { name: "Struktur", href: "/struktur" },
  { name: "Saldo", href: "/saldo" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logoMasjid} 
              alt="Logo Masjid Pendidikan Ibnul Qayyim" 
              className="w-10 h-10 lg:w-12 lg:h-12 object-contain border-2 border-primary rounded-lg p-0.5"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-foreground text-sm lg:text-base">MASDIK IQIS</h1>
              <p className="text-xs text-muted-foreground">Masjid Pendidikan Ibnul Qayyim Makassar</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={handleNavClick}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground shadow-islamic"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleNavClick}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                    location.pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
