import { MapPin, Phone, Mail } from "lucide-react";
import logoMasjid from "@/assets/logo-masjid.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoMasjid} 
                alt="Logo MASDIK IQIS" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="font-bold text-lg">MASDIK IQIS</h3>
                <p className="text-sm text-background/70">Masjid Pendidikan Ibnul Qayyim Makassar</p>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Masjid sebagai pusat pendidikan Islam dan kegiatan umat. Tempat
              untuk beribadah, belajar, dan mempererat ukhuwah Islamiyah.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>Jl. Taman Bunga Sudiang No.2, Laikang, Biringkanaya, Makassar City, South Sulawesi 90242</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span>+62 22 1234567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span>info@masdikiqis.or.id</span>
              </li>
            </ul>
          </div>

          {/* Prayer Times Summary */}
          <div>
            <h4 className="font-bold text-lg mb-4">Jadwal Shalat</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li className="flex justify-between">
                <span>Subuh</span>
                <span className="text-gold">04:30</span>
              </li>
              <li className="flex justify-between">
                <span>Dzuhur</span>
                <span className="text-gold">12:00</span>
              </li>
              <li className="flex justify-between">
                <span>Ashar</span>
                <span className="text-gold">15:15</span>
              </li>
              <li className="flex justify-between">
                <span>Maghrib</span>
                <span className="text-gold">18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Isya</span>
                <span className="text-gold">19:15</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© 2024 Masjid Pendidikan Ibnul Qayyim Makassar. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
