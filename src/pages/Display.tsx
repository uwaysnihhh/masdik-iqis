import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  Clock,
  Heart,
} from "lucide-react";
import logoWhite from "@/assets/logo-masjid-white.png";

// ── Types ──
interface PrayerTime {
  name: string;
  nameArabic: string;
  time: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface Activity {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_end_time: string | null;
  type: string;
}

// ── Helpers ──
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.replace(/\s*\([^)]*\)/g, "").trim();
  const match = clean.match(/(\d{1,2})\D(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

// ── Islamic Quotes ──
const islamicQuotes = [
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Sesungguhnya bersama kesulitan ada kemudahan.", source: "QS. Al-Insyirah: 6" },
  { arabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى", translation: "Dan tolong-menolonglah kamu dalam kebajikan dan takwa.", source: "QS. Al-Ma'idah: 2" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "Ingatlah kepada-Ku, niscaya Aku ingat kepadamu.", source: "QS. Al-Baqarah: 152" },
  { arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "Barangsiapa bertawakkal kepada Allah, maka Allah akan mencukupinya.", source: "QS. At-Talaq: 3" },
  { arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "Ya Tuhanku, tambahkanlah kepadaku ilmu.", source: "QS. Taha: 114" },
  { arabic: "وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", translation: "Ya Tuhanku, sayangilah mereka berdua sebagaimana mereka mendidikku waktu kecil.", source: "QS. Al-Isra: 24" },
];

const sedekahQuotes = [
  "Sedekah tidak akan mengurangi harta. (HR. Muslim)",
  "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain. (HR. Ahmad)",
  "Bersedekahlah, karena sedekah itu memadamkan kemurkaan Rabb. (HR. Tirmidzi)",
];

// ── Default Prayer Times ──
const defaultPrayerData: PrayerTime[] = [
  { name: "Subuh", nameArabic: "الفجر", time: "04:30" },
  { name: "Dzuhur", nameArabic: "الظهر", time: "12:00" },
  { name: "Ashar", nameArabic: "العصر", time: "15:15" },
  { name: "Maghrib", nameArabic: "المغرب", time: "18:00" },
  { name: "Isya", nameArabic: "العشاء", time: "19:15" },
];

// ── Iqamah Countdown Component ──
function IqamahCountdown({ prayerName, prayerNameArabic, remainingSeconds }: {
  prayerName: string;
  prayerNameArabic: string;
  remainingSeconds: number;
}) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gradient-islamic overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full border-2 border-primary-foreground/10 animate-pulse" />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-primary-foreground/5 animate-ping" style={{ animationDuration: "3s" }} />
      </div>

      <div className="relative z-10 text-center space-y-8">
        {/* Mosque Logo */}
        <img src={logoWhite} alt="Logo" className="w-24 h-24 mx-auto opacity-80" />

        {/* Arabic Name */}
        <p className="font-arabic text-5xl lg:text-7xl text-accent leading-relaxed">
          {prayerNameArabic}
        </p>

        {/* Prayer Name */}
        <div>
          <p className="text-primary-foreground/70 text-xl lg:text-2xl mb-2">Waktu Shalat</p>
          <h1 className="text-5xl lg:text-7xl font-bold text-primary-foreground">
            {prayerName}
          </h1>
        </div>

        {/* Countdown */}
        <div className="space-y-4">
          <p className="text-primary-foreground/70 text-lg lg:text-xl">Menuju Iqamah</p>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 min-w-[120px]">
              <p className="text-6xl lg:text-8xl font-bold font-mono text-accent">
                {String(minutes).padStart(2, "0")}
              </p>
              <p className="text-primary-foreground/60 text-sm mt-2">Menit</p>
            </div>
            <p className="text-5xl lg:text-7xl font-bold text-accent animate-pulse">:</p>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 min-w-[120px]">
              <p className="text-6xl lg:text-8xl font-bold font-mono text-accent">
                {String(seconds).padStart(2, "0")}
              </p>
              <p className="text-primary-foreground/60 text-sm mt-2">Detik</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-primary-foreground/60 text-lg font-arabic">
          لُزُوْمُ الصَّفِّ وَ تَسْوِيَتُهُ ـ Luruskan dan rapatkan shaf
        </p>
      </div>
    </div>
  );
}

// ── Main Display Page ──
export default function Display() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [prayerData, setPrayerData] = useState<PrayerTime[]>(defaultPrayerData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [sedekahIndex, setSedekahIndex] = useState(0);
  const [iqamahState, setIqamahState] = useState<{
    active: boolean;
    prayerName: string;
    prayerNameArabic: string;
    remainingSeconds: number;
  } | null>(null);

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
          const t = data.data.timings;
          setPrayerData([
            { name: "Subuh", nameArabic: "الفجر", time: t.Fajr },
            { name: "Dzuhur", nameArabic: "الظهر", time: t.Dhuhr },
            { name: "Ashar", nameArabic: "العصر", time: t.Asr },
            { name: "Maghrib", nameArabic: "المغرب", time: t.Maghrib },
            { name: "Isya", nameArabic: "العشاء", time: t.Isha },
          ]);
        }
      } catch (e) {
        console.error("Failed to fetch prayer times:", e);
      }
    };
    fetchPrayerTimes();
  }, []);

  // Fetch transactions (public saldo uses a select with no RLS issue for admin-only)
  // We'll use a different approach - calculate from public-facing data
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setTransactions(data);
    };
    fetchTransactions();
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
        .limit(5);
      if (data) setUpcomingActivities(data);
    };
    fetchActivities();
  }, []);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % islamicQuotes.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSedekahIndex((prev) => (prev + 1) % sedekahQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Clock + iqamah detection
  useEffect(() => {
    const IQAMAH_DURATION = 15 * 60; // 15 minutes in seconds

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

      // Check iqamah countdown
      const currentMinutes = parseTimeToMinutes(timeStr);
      const currentSeconds = (() => {
        const parts = timeStr.replace(/\./g, ":").split(":");
        if (parts.length >= 3) return parseInt(parts[2], 10);
        return 0;
      })();
      const totalCurrentSeconds = currentMinutes * 60 + currentSeconds;

      let foundIqamah = false;
      for (const prayer of prayerData) {
        const prayerMinutes = parseTimeToMinutes(prayer.time);
        const prayerSeconds = prayerMinutes * 60;
        const elapsed = totalCurrentSeconds - prayerSeconds;

        if (elapsed >= 0 && elapsed < IQAMAH_DURATION) {
          const remaining = IQAMAH_DURATION - elapsed;
          setIqamahState({
            active: true,
            prayerName: prayer.name,
            prayerNameArabic: prayer.nameArabic,
            remainingSeconds: remaining,
          });
          foundIqamah = true;
          break;
        }
      }

      if (!foundIqamah) {
        setIqamahState(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  // Calculated values
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalSaldo = totalIncome - totalExpense;

  const currentQuote = islamicQuotes[quoteIndex];

  // Find next prayer
  const nextPrayer = useMemo(() => {
    const currentMinutes = parseTimeToMinutes(currentTime);
    for (const prayer of prayerData) {
      if (parseTimeToMinutes(prayer.time) > currentMinutes) return prayer;
    }
    return prayerData[0]; // wrap to Subuh
  }, [currentTime, prayerData]);

  // Render iqamah countdown overlay
  if (iqamahState?.active) {
    return (
      <IqamahCountdown
        prayerName={iqamahState.prayerName}
        prayerNameArabic={iqamahState.prayerNameArabic}
        remainingSeconds={iqamahState.remainingSeconds}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="gradient-islamic relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <div className="relative z-10 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Logo Masjid" className="w-14 h-14" />
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                Masjid Pendidikan Ibnul Qayyim
              </h1>
              <p className="text-primary-foreground/70 text-sm">
                Pondok Pesantren IMMIM Putra Makassar
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold font-mono text-primary-foreground tracking-wider">
              {currentTime}
            </p>
            <p className="text-primary-foreground/70 text-sm">{currentDate}</p>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Left Column: Prayer Times */}
        <section className="col-span-4 flex flex-col gap-4">
          {/* Prayer Schedule */}
          <div className="bg-card rounded-2xl shadow-islamic border border-border overflow-hidden flex-1">
            <div className="gradient-islamic px-5 py-3">
              <h2 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Jadwal Shalat
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {prayerData.map((prayer) => {
                const isNext = nextPrayer?.name === prayer.name;
                return (
                  <div
                    key={prayer.name}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                      isNext
                        ? "bg-accent/15 border border-accent/30 scale-[1.02]"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-arabic text-2xl text-accent leading-none">
                        {prayer.nameArabic}
                      </span>
                      <span className={cn(
                        "font-semibold text-base",
                        isNext ? "text-accent-foreground" : "text-foreground"
                      )}>
                        {prayer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isNext && (
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      )}
                      <span className={cn(
                        "text-xl font-bold font-mono",
                        isNext ? "text-accent" : "text-foreground"
                      )}>
                        {prayer.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Saldo Card */}
          <div className="bg-card rounded-2xl shadow-islamic border border-border overflow-hidden">
            <div className="gradient-gold px-5 py-3">
              <h2 className="text-lg font-bold text-accent-foreground flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Informasi Keuangan
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">Total Saldo</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalSaldo)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Pemasukan</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-destructive/5 rounded-xl p-3 text-center">
                  <TrendingDown className="w-5 h-5 text-destructive mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Pengeluaran</p>
                  <p className="text-sm font-bold text-destructive">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center Column: Quote */}
        <section className="col-span-4 flex flex-col gap-4">
          <div className="bg-card rounded-2xl shadow-islamic border border-border flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-10" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-full gradient-gold mx-auto flex items-center justify-center shadow-gold">
                <span className="font-arabic text-2xl text-accent-foreground">☪</span>
              </div>
              <h2 className="text-lg font-semibold text-muted-foreground">Mutiara Hikmah</h2>
              <p
                key={quoteIndex}
                className="font-arabic text-4xl lg:text-5xl text-accent leading-[1.8] animate-fade-in"
              >
                {currentQuote.arabic}
              </p>
              <p
                key={`t-${quoteIndex}`}
                className="text-lg text-foreground/80 max-w-md mx-auto animate-fade-in"
              >
                "{currentQuote.translation}"
              </p>
              <p className="text-sm text-muted-foreground font-medium">{currentQuote.source}</p>
            </div>
          </div>
        </section>

        {/* Right Column: Upcoming Activities */}
        <section className="col-span-4 flex flex-col gap-4">
          <div className="bg-card rounded-2xl shadow-islamic border border-border overflow-hidden flex-1">
            <div className="gradient-islamic px-5 py-3">
              <h2 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Kegiatan Mendatang
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {upcomingActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada kegiatan mendatang</p>
                </div>
              ) : (
                upcomingActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-muted/50 rounded-xl p-4 border-l-4 border-primary hover:bg-muted transition-colors"
                  >
                    <h3 className="font-semibold text-foreground text-base mb-1">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {format(new Date(activity.event_date), "EEEE, d MMMM yyyy", {
                          locale: localeID,
                        })}
                      </span>
                      {activity.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {activity.event_time}
                          {activity.event_end_time ? ` - ${activity.event_end_time}` : ""}
                        </span>
                      )}
                    </div>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      {activity.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer: Donation Banner ── */}
      <footer className="gradient-gold relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="relative z-10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-foreground/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p
                key={sedekahIndex}
                className="text-base font-semibold text-accent-foreground animate-fade-in"
              >
                {sedekahQuotes[sedekahIndex]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-accent-foreground/70">Bank Syariah Indonesia (BSI)</p>
              <p className="text-xl font-bold font-mono text-accent-foreground">7301136287</p>
              <p className="text-xs text-accent-foreground/70">
                a.n. Msjd Pendidikan Ibnul Qayyim
              </p>
            </div>
            <div className="h-12 w-px bg-accent-foreground/20" />
            <div className="text-right">
              <p className="text-xs text-accent-foreground/70">QRIS</p>
              <p className="text-sm font-semibold text-accent-foreground">Scan untuk berinfaq</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
