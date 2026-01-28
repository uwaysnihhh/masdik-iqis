import { useState, useEffect } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import logoMasjid from "@/assets/logo-masjid.png";

interface PrayerTimeData {
  name: string;
  time: string;
}

const defaultPrayerTimes: PrayerTimeData[] = [
  { name: "Subuh", time: "04:30" },
  { name: "Dzuhur", time: "12:00" },
  { name: "Ashar", time: "15:15" },
  { name: "Maghrib", time: "18:00" },
  { name: "Isya", time: "19:15" },
];

export function Footer() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData[]>(defaultPrayerTimes);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=-5.1477&longitude=119.4327&method=20`
        );
        const data = await response.json();
        
        if (data.code === 200) {
          const timings = data.data.timings;
          setPrayerTimes([
            { name: "Subuh", time: timings.Fajr },
            { name: "Dzuhur", time: timings.Dhuhr },
            { name: "Ashar", time: timings.Asr },
            { name: "Maghrib", time: timings.Maghrib },
            { name: "Isya", time: timings.Isha },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch prayer times:", error);
      }
    };

    fetchPrayerTimes();
  }, []);

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
                className="w-12 h-12 object-contain border-2 border-background/30 rounded-lg p-0.5"
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
                <a 
                  href="https://maps.google.com/?q=Jl.+Taman+Bunga+Sudiang+No.2,+Laikang,+Biringkanaya,+Makassar+City,+South+Sulawesi+90242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  Jl. Taman Bunga Sudiang No.2, Laikang, Biringkanaya, Makassar City, South Sulawesi 90242
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <a 
                  href="https://wa.me/6281244294529"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  +62 812-4429-4529
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a 
                  href="mailto:masdik@iqis.sch.id"
                  className="hover:text-gold transition-colors"
                >
                  masdik@iqis.sch.id
                </a>
              </li>
            </ul>
          </div>

          {/* Prayer Times Summary */}
          <div>
            <h4 className="font-bold text-lg mb-4">Jadwal Shalat</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {prayerTimes.map((prayer) => (
                <li key={prayer.name} className="flex justify-between">
                  <span>{prayer.name}</span>
                  <span className="text-gold">{prayer.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 pb-4 text-center text-sm text-background/50">
          <p>© 2025 Masjid Pendidikan Ibnul Qayyim Makassar. Created By Uways.</p>
        </div>
      </div>
    </footer>
  );
}
