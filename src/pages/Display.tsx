import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parse, isWithinInterval } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Calendar, Clock, Sparkles } from "lucide-react";
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
        .limit(4);
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
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 islamic-pattern opacity-30 pointer-events-none" />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative z-10 h-screen flex flex-col p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-islamic flex items-center justify-center shadow-islamic">
              <img src={logoMasjid} alt="Logo Masjid" className="h-10 w-auto" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Masjid Pendidikan <span className="text-primary">Ibnul Qayyim</span>
              </h1>
              <p className="text-muted-foreground text-sm">SMP-SMA Islam Athirah Boarding School</p>
            </div>
          </div>
          
          {/* Time & Date */}
          <div className="text-right">
            <p className="text-muted-foreground text-sm">{currentDate}</p>
            <p className="text-5xl lg:text-6xl font-bold text-foreground font-mono tracking-wider">
              {currentTime}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-6">
          {/* Left Column - Prayer Times */}
          <div className="col-span-4 flex flex-col gap-4">
            <div className="bg-card rounded-2xl shadow-islamic border border-border overflow-hidden">
              <div className="gradient-islamic p-4">
                <h2 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Jadwal Shalat Hari Ini
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {prayerData.map((prayer) => (
                  <div
                    key={prayer.name}
                    className={cn(
                      "relative p-4 rounded-xl transition-all duration-500 flex items-center justify-between",
                      activePrayer === prayer.name
                        ? "gradient-gold shadow-gold scale-[1.02]"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {activePrayer === prayer.name && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-accent-foreground animate-pulse" />
                    )}
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "font-arabic text-2xl",
                        activePrayer === prayer.name ? "text-accent-foreground" : "text-primary"
                      )}>
                        {prayer.nameArabic}
                      </span>
                      <span className={cn(
                        "text-lg font-medium",
                        activePrayer === prayer.name ? "text-accent-foreground" : "text-foreground"
                      )}>
                        {prayer.name}
                      </span>
                    </div>
                    <span className={cn(
                      "text-2xl font-bold font-mono",
                      activePrayer === prayer.name ? "text-accent-foreground" : "text-primary"
                    )}>
                      {prayer.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Activity/Prayer Indicator */}
            {(activePrayer || currentActivity) && (
              <div className={cn(
                "p-4 rounded-2xl border animate-fade-in",
                activePrayer ? "gradient-gold border-accent shadow-gold" : "bg-primary/10 border-primary/20"
              )}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    activePrayer ? "bg-accent-foreground" : "bg-primary"
                  )} />
                  <span className={cn(
                    "text-lg font-medium",
                    activePrayer ? "text-accent-foreground" : "text-foreground"
                  )}>
                    {activePrayer ? (
                      <>Waktu Shalat <strong>{activePrayer}</strong> berlangsung</>
                    ) : (
                      <><strong>{currentActivity}</strong> sedang berlangsung</>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Quote & Saldo */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Islamic Quote */}
            <div className="flex-1 bg-card rounded-2xl shadow-islamic border border-border overflow-hidden flex flex-col">
              <div className="gradient-gold p-4">
                <h2 className="text-lg font-bold text-accent-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Mutiara Hikmah
                </h2>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <p className="font-arabic text-4xl lg:text-5xl leading-relaxed text-primary mb-6 animate-fade-in" key={currentQuoteIndex}>
                  {currentQuote.arabic}
                </p>
                <p className="text-xl text-foreground mb-3">"{currentQuote.translation}"</p>
                <p className="text-sm text-muted-foreground font-medium">{currentQuote.source}</p>
              </div>
            </div>

            {/* Saldo Info */}
            <div className="bg-card rounded-2xl shadow-islamic border border-border overflow-hidden">
              <div className="gradient-islamic p-4">
                <h2 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Informasi Keuangan Masjid
                </h2>
              </div>
              <div className="p-4">
                <div className="text-center mb-4 p-4 bg-secondary rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(totalSaldo)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/10 rounded-xl p-3 text-center border border-primary/20">
                    <div className="flex items-center justify-center gap-1.5 text-primary text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Pemasukan
                    </div>
                    <p className="text-lg font-bold text-primary">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="bg-destructive/10 rounded-xl p-3 text-center border border-destructive/20">
                    <div className="flex items-center justify-center gap-1.5 text-destructive text-sm mb-1">
                      <TrendingDown className="w-4 h-4" />
                      Pengeluaran
                    </div>
                    <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpense)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Activities */}
          <div className="col-span-4 flex flex-col">
            <div className="flex-1 bg-card rounded-2xl shadow-islamic border border-border overflow-hidden flex flex-col">
              <div className="bg-secondary p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Kegiatan Akan Datang
                </h2>
              </div>
              <div className="flex-1 p-4">
                {upcomingActivities.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Belum ada kegiatan terjadwal</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className={cn(
                          "p-4 rounded-xl border transition-all hover:shadow-md",
                          index === 0 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-secondary border-transparent"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className={cn(
                              "text-lg font-semibold",
                              index === 0 ? "text-primary" : "text-foreground"
                            )}>
                              {activity.title}
                            </p>
                            <span className={cn(
                              "inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                              index === 0 
                                ? "bg-primary/20 text-primary" 
                                : "bg-muted text-muted-foreground"
                            )}>
                              {activity.type}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={cn(
                              "font-bold",
                              index === 0 ? "text-primary" : "text-foreground"
                            )}>
                              {format(new Date(activity.event_date), "d MMM", { locale: id })}
                            </p>
                            {activity.event_time && (
                              <p className="text-sm text-muted-foreground">{activity.event_time}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>Jl. Taman Bunga Sudiang, Makassar</p>
          <p className="font-medium text-primary">masdik.iqis.sch.id</p>
        </footer>
      </div>
    </div>
  );
}
