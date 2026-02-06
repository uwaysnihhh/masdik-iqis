import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parse, isWithinInterval } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";
import logoMasjid from "@/assets/logo-masjid-white.png";

interface PrayerTime {
  name: string;
  nameArabic: string;
  time: string;
}

interface Activity {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  type: string;
}

const defaultPrayerData: PrayerTime[] = [
  { name: "Subuh", nameArabic: "الفجر", time: "04:30" },
  { name: "Dzuhur", nameArabic: "الظهر", time: "12:00" },
  { name: "Ashar", nameArabic: "العصر", time: "15:15" },
  { name: "Maghrib", nameArabic: "المغرب", time: "18:00" },
  { name: "Isya", nameArabic: "العشاء", time: "19:15" },
];

const islamicQuotes = [
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Sesungguhnya bersama kesulitan ada kemudahan", source: "QS. Al-Insyirah: 6" },
  { arabic: "وَتَوَكَّلْ عَلَى اللَّهِ وَكَفَى بِاللَّهِ وَكِيلًا", translation: "Dan bertawakallah kepada Allah. Cukuplah Allah sebagai Penolong", source: "QS. Al-Ahzab: 3" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "Ingatlah kepada-Ku, niscaya Aku akan mengingatmu", source: "QS. Al-Baqarah: 152" },
  { arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "Ya Tuhanku, tambahkanlah kepadaku ilmu", source: "QS. Thaha: 114" },
  { arabic: "وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", translation: "Ya Tuhanku, sayangilah keduanya sebagaimana mereka menyayangiku waktu kecil", source: "QS. Al-Isra: 24" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Sesungguhnya Allah bersama orang-orang yang sabar", source: "QS. Al-Baqarah: 153" },
  { arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "Barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupinya", source: "QS. At-Talaq: 3" },
  { arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ", translation: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain", source: "HR. Ahmad" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function parseTimeToMinutes(timeStr: string): number {
  const cleanTime = timeStr.replace(/\s*\([^)]*\)/g, "").trim();
  const match = cleanTime.match(/(\d{1,2})\D(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function getActivePrayer(currentTime: string, prayerData: PrayerTime[]): string | null {
  const currentMinutes = parseTimeToMinutes(currentTime);
  for (const prayer of prayerData) {
    const prayerStartMinutes = parseTimeToMinutes(prayer.time);
    if (currentMinutes >= prayerStartMinutes && currentMinutes < prayerStartMinutes + 20) {
      return prayer.name;
    }
  }
  return null;
}

export default function Display() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [prayerData, setPrayerData] = useState<PrayerTime[]>(defaultPrayerData);
  const [activePrayer, setActivePrayer] = useState<string | null>(null);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);

  // Fetch prayer times
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const today = new Date();
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?latitude=-5.1477&longitude=119.4327&method=20`
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

  // Fetch transactions for saldo
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase.from("transactions").select("*");
      if (data) {
        const income = data.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expense = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        setTotalIncome(income);
        setTotalExpense(expense);
        setTotalSaldo(income - expense);
      }
    };
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch upcoming activities
  useEffect(() => {
    const fetchActivities = async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data } = await supabase
        .from("activities")
        .select("*")
        .gte("event_date", today)
        .eq("is_active", true)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true })
        .limit(5);
      if (data) setUpcomingActivities(data);
    };
    fetchActivities();
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check current activity
  useEffect(() => {
    const checkCurrentActivity = async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const now = new Date();
      const currentTimeStr = format(now, "HH:mm");

      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .eq("event_date", today)
        .eq("is_active", true);

      const { data: reservations } = await supabase
        .from("reservations")
        .select("*")
        .eq("reservation_date", today)
        .eq("status", "approved");

      const nowTime = parse(currentTimeStr, "HH:mm", new Date());

      // Check activities
      for (const activity of activities || []) {
        if (!activity.event_time) continue;
        const startTime = parse(activity.event_time, "HH:mm", new Date());
        const endTime = activity.event_end_time
          ? parse(activity.event_end_time, "HH:mm", new Date())
          : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
        if (isWithinInterval(nowTime, { start: startTime, end: endTime })) {
          setCurrentActivity(activity.title);
          return;
        }
      }

      // Check reservations
      for (const reservation of reservations || []) {
        const startTime = parse(reservation.reservation_time, "HH:mm", new Date());
        const endTime = reservation.reservation_end_time
          ? parse(reservation.reservation_end_time, "HH:mm", new Date())
          : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
        if (isWithinInterval(nowTime, { start: startTime, end: endTime })) {
          setCurrentActivity(reservation.description || reservation.activity_type);
          return;
        }
      }

      setCurrentActivity(null);
    };

    checkCurrentActivity();
    const interval = setInterval(checkCurrentActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Makassar",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      const dateStr = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Makassar",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(now);
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
      setActivePrayer(getActivePrayer(timeStr, prayerData));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % islamicQuotes.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = islamicQuotes[currentQuoteIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground p-8 overflow-hidden">
      {/* Decorative Pattern */}
      <div className="fixed inset-0 islamic-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoMasjid} alt="Logo Masjid" className="h-16 w-auto" />
            <div>
              <h1 className="text-3xl font-bold">Masjid Pendidikan Ibnul Qayyim</h1>
              <p className="text-primary-foreground/70">SMP-SMA Islam Athirah Boarding School</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg text-primary-foreground/70">{currentDate}</p>
            <p className="text-5xl font-bold font-mono tracking-wider">{currentTime}</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Left Column - Prayer Times */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Jadwal Shalat
            </h2>
            <div className="space-y-3">
              {prayerData.map((prayer) => (
                <div
                  key={prayer.name}
                  className={cn(
                    "p-4 rounded-2xl transition-all duration-500 flex items-center justify-between",
                    activePrayer === prayer.name
                      ? "bg-accent text-accent-foreground shadow-gold scale-105"
                      : "bg-primary-foreground/10 backdrop-blur-sm"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-arabic text-3xl">{prayer.nameArabic}</span>
                    <span className="text-xl font-medium">{prayer.name}</span>
                  </div>
                  <span className="text-3xl font-bold font-mono">{prayer.time}</span>
                  {activePrayer === prayer.name && (
                    <span className="absolute right-2 top-2 w-3 h-3 bg-accent rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            {/* Current Activity Indicator */}
            {(activePrayer || currentActivity) && (
              <div className="mt-4 p-4 rounded-2xl bg-accent/20 backdrop-blur-sm border border-accent/30">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                  <span className="text-lg">
                    {activePrayer ? (
                      <>Waktu Shalat <strong>{activePrayer}</strong> sedang berlangsung</>
                    ) : (
                      <><strong>{currentActivity}</strong> sedang berlangsung</>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Islamic Quote & Saldo */}
          <div className="space-y-6">
            {/* Islamic Quote */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="font-arabic text-4xl leading-relaxed mb-4">{currentQuote.arabic}</p>
              <p className="text-xl text-primary-foreground/90 mb-2">"{currentQuote.translation}"</p>
              <p className="text-sm text-primary-foreground/60">{currentQuote.source}</p>
            </div>

            {/* Saldo Info */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Wallet className="w-6 h-6" />
                Informasi Keuangan
              </h2>
              <div className="text-center mb-4">
                <p className="text-primary-foreground/70 text-sm">Saldo Masjid</p>
                <p className="text-4xl font-bold">{formatCurrency(totalSaldo)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary-foreground/70 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Pemasukan
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary-foreground/70 text-sm mb-1">
                    <TrendingDown className="w-4 h-4" />
                    Pengeluaran
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Activities */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Kegiatan Akan Datang
            </h2>
            <div className="space-y-3">
              {upcomingActivities.length === 0 ? (
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center text-primary-foreground/60">
                  Belum ada kegiatan terjadwal
                </div>
              ) : (
                upcomingActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg font-semibold">{activity.title}</p>
                        <p className="text-primary-foreground/70 text-sm capitalize">{activity.type}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">
                          {format(new Date(activity.event_date), "d MMM", { locale: id })}
                        </p>
                        {activity.event_time && (
                          <p className="text-primary-foreground/70">{activity.event_time}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-primary-foreground/50 text-sm">
          <p>masdik.iqis.sch.id</p>
        </footer>
      </div>
    </div>
  );
}
