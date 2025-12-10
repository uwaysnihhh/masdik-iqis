import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { PrayerTime } from "@/types";

const prayerData: PrayerTime[] = [
  { name: "Subuh", nameArabic: "الفجر", time: "04:30" },
  { name: "Dzuhur", nameArabic: "الظهر", time: "12:00" },
  { name: "Ashar", nameArabic: "العصر", time: "15:15" },
  { name: "Maghrib", nameArabic: "المغرب", time: "18:00" },
  { name: "Isya", nameArabic: "العشاء", time: "19:15" },
];

function getActivePrayer(currentTime: string): string | null {
  const [hours, minutes] = currentTime.split(":").map(Number);
  const currentMinutes = hours * 60 + minutes;

  for (let i = 0; i < prayerData.length; i++) {
    const [prayerHours, prayerMinutes] = prayerData[i].time.split(":").map(Number);
    const prayerStartMinutes = prayerHours * 60 + prayerMinutes;
    const prayerEndMinutes = prayerStartMinutes + 10; // Active for 10 minutes

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
      setActivePrayer(getActivePrayer(timeStr));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
