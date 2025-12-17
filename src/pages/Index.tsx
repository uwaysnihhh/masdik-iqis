import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArabicGreeting } from "@/components/ArabicGreeting";
import { PrayerTimes } from "@/components/PrayerTimes";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Wallet, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 islamic-pattern opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Arabic Greeting */}
            <div className="mb-12 animate-fade-in">
              <ArabicGreeting />
            </div>

            {/* Prayer Times */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <PrayerTimes />
            </div>

            {/* Quick Links */}
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <QuickLink
                to="/kegiatan"
                icon={CalendarDays}
                title="Kegiatan"
                description="Lihat jadwal kegiatan masjid"
              />
              <QuickLink
                to="/layanan"
                icon={FileText}
                title="Layanan"
                description="Ajukan penggunaan masjid"
              />
              <QuickLink
                to="/struktur"
                icon={Users}
                title="Struktur DKM"
                description="Lihat pengurus masjid"
              />
              <QuickLink
                to="/saldo"
                icon={Wallet}
                title="Saldo & Donasi"
                description="Info keuangan & donasi"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Tentang Masjid
            </h2>
            <div className="h-1 w-24 mx-auto gradient-gold rounded-full mb-6" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              Masjid Pendidikan Ibnul Qayyim Makassar (MASDIK IQIS) adalah pusat
              pendidikan Islam dan kegiatan umat yang berlokasi di jantung
              kota. Kami berkomitmen untuk menyediakan tempat ibadah yang
              nyaman, program pendidikan yang berkualitas, dan kegiatan sosial
              yang bermanfaat bagi seluruh lapisan masyarakat.
            </p>
            <div className="mt-8">
              <Link to="/layanan">
                <Button size="lg" variant="islamic">
                  Ajukan Reservasi
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group p-6 bg-card rounded-2xl shadow-lg hover:shadow-islamic transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-12 h-12 gradient-islamic rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
