import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { PrayerTime } from "@/types";

const defaultPrayerData: PrayerTime[] = [
  { name: "Subuh", nameArabic: "الفجر", time: "04:30" },
  { name: "Dzuhur", nameArabic: "الظهر", time: "12:00" },
  { name: "Ashar", nameArabic: "العصر", time: "15:15" },
  { name: "Maghrib", nameArabic: "المغرب", time: "18:00" },
  { name: "Isya", nameArabic: "العشاء", time: "19:15" },
];

function parseTimeToMinutes(timeStr: string): number {
  // Remove any extra text like "(WITA)" and parse time
  const cleanTime = timeStr.replace(/\s*\([^)]*\)/g, "").trim();
  const parts = cleanTime.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

function getActivePrayer(currentTime: string, prayerData: PrayerTime[]): string | null {
  const currentMinutes = parseTimeToMinutes(currentTime);

  for (let i = 0; i < prayerData.length; i++) {
    const prayerStartMinutes = parseTimeToMinutes(prayerData[i].time);
    const prayerEndMinutes = prayerStartMinutes + 20; // Active for 20 minutes

    if (currentMinutes >= prayerStartMinutes && currentMinutes < prayerEndMinutes) {
      return prayerData[i].name;
    }
  }

  return null;
}

export function PrayerTimes() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [activePrayer, setActivePrayer] = useState<string | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTime[]>(defaultPrayerData);

  // Fetch prayer times for Makassar
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        // Makassar coordinates: -5.1477, 119.4327
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=-5.1477&longitude=119.4327&method=20`
        );
        const data = await response.json();
        
        if (data.code === 200) {
          const timings = data.data.timings;
          setPrayerData([
            { name: "Subuh", nameArabic: "الفجر", time: timings.Fajr },
            { name: "Dzuhur", nameArabic: "الظهر", time: timings.Dhuhr },
            { name: "Ashar", nameArabic: "العصر", time: timings.Asr },
            { name: "Maghrib", nameArabic: "المغرب", time: timings.Maghrib },
            { name: "Isya", nameArabic: "العشاء", time: timings.Isha },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch prayer times:", error);
      }
    };

    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const dateStr = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
      setActivePrayer(getActivePrayer(timeStr, prayerData));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-islamic p-6 lg:p-8 shadow-islamic">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-30" />
      
      <div className="relative z-10">
        {/* Time & Date */}
        <div className="text-center mb-6">
          <p className="text-primary-foreground/80 text-sm mb-1">{currentDate}</p>
          <div className="text-5xl lg:text-6xl font-bold text-primary-foreground font-mono tracking-wider">
            {currentTime}
          </div>
        </div>

        {/* Prayer Times Grid */}
        <div className="grid grid-cols-5 gap-2 lg:gap-3">
          {prayerData.map((prayer) => (
            <div
              key={prayer.name}
              className={cn(
                "relative p-3 lg:p-4 rounded-xl text-center transition-all duration-500",
                activePrayer === prayer.name
                  ? "bg-accent text-accent-foreground shadow-gold scale-105"
                  : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              )}
            >
              {activePrayer === prayer.name && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
              )}
              <p className="font-arabic text-lg lg:text-xl mb-1">{prayer.nameArabic}</p>
              <p className="text-xs lg:text-sm font-medium">{prayer.name}</p>
              <p className={cn(
                "text-sm lg:text-base font-bold mt-1",
                activePrayer === prayer.name ? "text-accent-foreground" : "text-primary-foreground"
              )}>
                {prayer.time}
              </p>
            </div>
          ))}
        </div>

        {/* Current Prayer Indicator */}
        {activePrayer && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-primary-foreground text-sm">
                Waktu Shalat <span className="font-bold">{activePrayer}</span> sedang berlangsung
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
