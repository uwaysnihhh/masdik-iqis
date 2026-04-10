import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Clock, Share2, Copy, Download, Volume2, VolumeX,
  Maximize, Minimize, ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActivityData {
  id: string;
  title: string;
  type: string;
  event_date: string;
  event_time: string | null;
  event_end_time: string | null;
  speaker_name: string | null;
  topic: string | null;
}

interface SessionData {
  id: string;
  activity_id: string;
  session_number: number | null;
  session_label: string | null;
  qr_token: string;
  scan_type: string;
  is_active: boolean | null;
}

interface AttendanceRecord {
  id: string;
  session_id: string;
  activity_id: string;
  participant_name: string;
  feedback: string;
  instansi: string | null;
  phone_number: string | null;
  device_fingerprint: string;
  created_at: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INSTANSI_COLORS = [
  "#16a34a", "#d97706", "#7c3aed", "#db2777", "#0891b2",
  "#65a30d", "#dc2626", "#0284c7", "#9333ea", "#c2410c",
  "#0d9488", "#b45309", "#6d28d9", "#be185d", "#1d4ed8",
  "#15803d", "#92400e", "#5b21b6", "#9f1239", "#1e40af",
];

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span className={className}>{display}</motion.span>;
}

// ─── Audio ding ──────────────────────────────────────────────────────────────

function playDing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext not available
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AttendanceDashboard() {
  const { activityId } = useParams<{ activityId: string }>();
  const [searchParams] = useSearchParams();
  const isDisplayMode = searchParams.get("mode") === "display";

  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [now, setNow] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | "all">("all");
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  // ── Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Fullscreen API
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ── Initial data fetch
  useEffect(() => {
    if (!activityId) { setNotFound(true); setLoading(false); return; }

    const fetchData = async () => {
      const [actRes, sessRes, recRes] = await Promise.all([
        supabase.from("activities").select("*").eq("id", activityId).single(),
        supabase.from("attendance_sessions").select("*").eq("activity_id", activityId).order("session_number"),
        supabase.from("attendance_records").select("*").eq("activity_id", activityId).order("created_at", { ascending: false }),
      ]);

      if (actRes.error || !actRes.data) { setNotFound(true); setLoading(false); return; }

      setActivity(actRes.data as ActivityData);
      setSessions((sessRes.data ?? []) as SessionData[]);
      setRecords((recRes.data ?? []) as AttendanceRecord[]);
      setLoading(false);
    };

    fetchData();
  }, [activityId]);

  // ── Realtime subscription
  useEffect(() => {
    if (!activityId) return;

    const channel = supabase
      .channel(`dashboard-${activityId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance_records", filter: `activity_id=eq.${activityId}` },
        (payload) => {
          setRecords((prev) => [payload.new as AttendanceRecord, ...prev]);
          if (soundRef.current) playDing();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "attendance_sessions", filter: `activity_id=eq.${activityId}` },
        (payload) => {
          setSessions((prev) => prev.map((s) => s.id === payload.new.id ? payload.new as SessionData : s));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance_sessions", filter: `activity_id=eq.${activityId}` },
        (payload) => {
          setSessions((prev) => [...prev, payload.new as SessionData]);
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "connected" : status === "CHANNEL_ERROR" ? "error" : "connecting");
      });

    // Fallback polling every 30s if realtime disconnects
    const poll = setInterval(async () => {
      if (realtimeStatus !== "connected") {
        const { data } = await supabase
          .from("attendance_records")
          .select("*")
          .eq("activity_id", activityId)
          .order("created_at", { ascending: false });
        if (data) setRecords(data as AttendanceRecord[]);
      }
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [activityId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived stats
  const isTudung = activity?.type === "tudung_sipulung";

  const arrivalCount = records.filter((r) => {
    const sess = sessions.find((s) => s.id === r.session_id);
    return sess?.scan_type === "arrival";
  }).length;

  const completionCount = records.filter((r) => {
    const sess = sessions.find((s) => s.id === r.session_id);
    return sess?.scan_type === "completion";
  }).length;

  const gapCount = Math.max(0, arrivalCount - completionCount);

  const instansiMap: Record<string, number> = {};
  records.forEach((r) => {
    if (r.instansi) instansiMap[r.instansi] = (instansiMap[r.instansi] ?? 0) + 1;
  });
  const instansiChartData = Object.entries(instansiMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const barData = sessions
    .filter((s) => s.scan_type === "arrival" || s.scan_type === "session")
    .map((s) => ({
      name: s.session_label ?? `Sesi ${s.session_number}`,
      peserta: records.filter((r) => r.session_id === s.id).length,
    }));

  const recentFeed = records.slice(0, 10);

  // ── Active QR sessions
  const activeSessions = sessions.filter((s) => s.is_active);
  const selectedQrSession =
    selectedSessionId === "all"
      ? activeSessions[0] ?? null
      : sessions.find((s) => s.id === selectedSessionId) ?? null;

  // ── CSV export
  const exportCSV = useCallback(() => {
    if (!activity || records.length === 0) return;
    let csv = isTudung
      ? "No,Nama,Nomor Telepon,Instansi,Waktu\n"
      : "No,Nama,Nomor Telepon,Sesi,Feedback,Waktu\n";

    records.forEach((r, i) => {
      const sess = sessions.find((s) => s.id === r.session_id);
      const time = r.created_at ? format(new Date(r.created_at), "dd/MM/yyyy HH:mm") : "-";
      if (isTudung) {
        csv += `${i + 1},"${r.participant_name}","${r.phone_number ?? ""}","${r.instansi ?? ""}","${time}"\n`;
      } else {
        csv += `${i + 1},"${r.participant_name}","${r.phone_number ?? ""}","${sess?.session_label ?? ""}","${r.feedback}","${time}"\n`;
      }
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absensi-${activity.title}-${activity.event_date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [records, sessions, activity, isTudung]);

  // ── Share
  const shareUrl = `${window.location.origin}/dashboard/${activityId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link disalin!" });
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`📊 Dashboard Absensi Live\n${activity?.title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // ─── Loading / Not Found ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen gradient-islamic flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="font-arabic text-lg">جار التحميل...</p>
        </div>
      </div>
    );
  }

  if (notFound || !activity) {
    return (
      <div className="min-h-screen gradient-islamic flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="pt-8 pb-8">
            <p className="text-2xl mb-2">🕌</p>
            <h2 className="font-bold text-lg mb-2">Kegiatan Tidak Ditemukan</h2>
            <p className="text-muted-foreground text-sm">Dashboard tidak tersedia.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Display Mode (Projector) ───────────────────────────────────────────────

  if (isDisplayMode) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col islamic-pattern">
        {/* Header */}
        <div className="gradient-islamic px-8 py-6 text-center">
          <p className="font-arabic text-2xl text-white/80 mb-1">بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيْمِ</p>
          <h1 className="text-4xl font-bold">{activity.title}</h1>
          {activity.speaker_name && (
            <p className="text-xl text-white/80 mt-1">{isTudung ? "Narasumber" : "Pemateri"}: {activity.speaker_name}</p>
          )}
          <p className="text-white/70 mt-1">
            {format(new Date(activity.event_date + "T00:00:00"), "EEEE, d MMMM yyyy", { locale: idLocale })}
          </p>
        </div>

        {/* Live clock */}
        <div className="text-center py-4">
          <span className="text-5xl font-mono font-bold text-emerald-400">
            {format(now, "HH:mm:ss")}
          </span>
        </div>

        {/* Big stats */}
        <div className="flex-1 grid grid-cols-2 gap-8 p-8 max-w-4xl mx-auto w-full">
          <div className="bg-emerald-900/50 rounded-3xl flex flex-col items-center justify-center p-10 border border-emerald-500/30">
            <Users className="w-16 h-16 text-emerald-400 mb-4" />
            <AnimatedNumber value={records.length} className="text-8xl font-bold text-emerald-400" />
            <p className="text-2xl text-white/70 mt-2">Total Hadir</p>
          </div>
          {isTudung ? (
            <div className="bg-amber-900/50 rounded-3xl flex flex-col items-center justify-center p-10 border border-amber-500/30">
              <p className="text-2xl text-white/70 mb-4">Instansi Terbanyak</p>
              <p className="text-4xl font-bold text-amber-400 text-center">
                {instansiChartData[0]?.name ?? "-"}
              </p>
              <AnimatedNumber value={instansiChartData[0]?.value ?? 0} className="text-6xl font-bold text-amber-300 mt-2" />
              <p className="text-xl text-white/50">peserta</p>
            </div>
          ) : (
            <div className="bg-blue-900/50 rounded-3xl flex flex-col items-center justify-center p-10 border border-blue-500/30">
              <p className="text-2xl text-white/70 mb-2">Kedatangan</p>
              <AnimatedNumber value={arrivalCount} className="text-8xl font-bold text-blue-400" />
            </div>
          )}
        </div>

        {/* Recent feed */}
        <div className="px-8 pb-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-white/50 text-center mb-3 text-lg">Peserta Terbaru</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <AnimatePresence>
                {recentFeed.slice(0, 6).map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-white/10 rounded-full px-6 py-2 text-white text-lg"
                  >
                    {r.participant_name}
                    {r.instansi && <span className="text-white/60 ml-2 text-sm">· {r.instansi}</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Live badge */}
        <div className="fixed top-4 right-4">
          <span className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Exit display mode */}
        <button
          onClick={() => window.location.href = `/dashboard/${activityId}`}
          className="fixed bottom-4 right-4 text-white/30 hover:text-white/70 text-sm"
        >
          Keluar Mode Proyektor
        </button>
      </div>
    );
  }

  // ─── Normal Dashboard ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Header */}
      <div className="gradient-islamic px-4 py-6 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-arabic text-lg opacity-80 mb-1">بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيْمِ</p>
              <h1 className={`font-bold ${isDisplayMode ? "text-4xl" : "text-xl md:text-2xl"}`}>
                {activity.title}
              </h1>
              {activity.speaker_name && (
                <p className="text-sm text-white/80 mt-0.5">
                  {isTudung ? "Narasumber" : "Pemateri"}: {activity.speaker_name}
                </p>
              )}
              {activity.topic && (
                <p className="text-sm text-white/70 mt-0.5">Tema: {activity.topic}</p>
              )}
              <p className="text-sm text-white/70 mt-1">
                {format(new Date(activity.event_date + "T00:00:00"), "EEEE, d MMMM yyyy", { locale: idLocale })}
                {activity.event_time && ` · ${activity.event_time}${activity.event_end_time ? ` – ${activity.event_end_time}` : ""}`}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Live clock */}
              <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-sm font-bold">{format(now, "HH:mm:ss")}</span>
              </div>

              {/* Realtime status */}
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                realtimeStatus === "connected" ? "bg-green-500/30 text-green-100" :
                realtimeStatus === "error" ? "bg-red-500/30 text-red-100" :
                "bg-white/20 text-white/70"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  realtimeStatus === "connected" ? "bg-green-400 animate-pulse" :
                  realtimeStatus === "error" ? "bg-red-400" : "bg-yellow-400 animate-pulse"
                }`} />
                {realtimeStatus === "connected" ? "LIVE" : realtimeStatus === "error" ? "Offline" : "Connecting..."}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm" variant="secondary" onClick={copyLink} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" /> Salin Link
            </Button>
            <Button size="sm" variant="secondary" onClick={shareWhatsApp} className="gap-1.5">
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </Button>
            <Button size="sm" variant="secondary" onClick={exportCSV} disabled={records.length === 0} className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> Unduh CSV
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(`/dashboard/${activityId}?mode=display`, "_blank")}
              className="gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Mode Proyektor
            </Button>
            <Button size="sm" variant="secondary" onClick={toggleFullscreen} className="gap-1.5">
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            </Button>
            <Button
              size="sm"
              variant={soundEnabled ? "default" : "secondary"}
              onClick={() => setSoundEnabled((v) => !v)}
              className="gap-1.5"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {soundEnabled ? "Suara Aktif" : "Suara Mati"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Stats Cards ── */}
        <div className={`grid gap-4 ${isTudung ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
          <motion.div custom={0} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
            <Card className="border-0 shadow-islamic text-center">
              <CardContent className="pt-6 pb-5">
                <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                <AnimatedNumber value={records.length} className="text-4xl font-bold text-primary block" />
                <p className="text-xs text-muted-foreground mt-1">{isTudung ? "Total Hadir" : "Total Absen"}</p>
              </CardContent>
            </Card>
          </motion.div>

          {!isTudung && (
            <>
              <motion.div custom={1} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
                <Card className="border-0 shadow-islamic text-center">
                  <CardContent className="pt-6 pb-5">
                    <p className="text-2xl mb-1">🟢</p>
                    <AnimatedNumber value={arrivalCount} className="text-4xl font-bold text-emerald-600 block" />
                    <p className="text-xs text-muted-foreground mt-1">Kedatangan</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div custom={2} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
                <Card className="border-0 shadow-islamic text-center">
                  <CardContent className="pt-6 pb-5">
                    <p className="text-2xl mb-1">✅</p>
                    <AnimatedNumber value={completionCount} className="text-4xl font-bold text-blue-600 block" />
                    <p className="text-xs text-muted-foreground mt-1">Selesai</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div custom={3} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
                <Card className="border-0 shadow-islamic text-center">
                  <CardContent className="pt-6 pb-5">
                    <p className="text-2xl mb-1">⚠️</p>
                    <AnimatedNumber value={gapCount} className="text-4xl font-bold text-amber-600 block" />
                    <p className="text-xs text-muted-foreground mt-1">Belum Selesai</p>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {isTudung && instansiChartData.length > 0 && (
            <motion.div custom={1} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
              <Card className="border-0 shadow-islamic text-center">
                <CardContent className="pt-6 pb-5">
                  <p className="text-2xl mb-1">🏛️</p>
                  <AnimatedNumber value={instansiChartData.length} className="text-4xl font-bold text-amber-600 block" />
                  <p className="text-xs text-muted-foreground mt-1">Instansi Hadir</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* ── Charts ── */}
        {records.length > 0 && (
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={CARD_VARIANTS}
            className={`grid gap-6 ${isTudung ? "md:grid-cols-2" : "grid-cols-1"}`}
          >
            {isTudung && instansiChartData.length > 0 && (
              <>
                <Card className="border-0 shadow-islamic">
                  <CardHeader>
                    <CardTitle className="text-sm">Distribusi Instansi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={instansiChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          isAnimationActive
                          label={({ name, percent }) =>
                            `${name.length > 12 ? name.slice(0, 12) + "…" : name} (${(percent * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {instansiChartData.map((_, i) => (
                            <Cell key={i} fill={INSTANSI_COLORS[i % INSTANSI_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v} peserta`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-islamic">
                  <CardHeader>
                    <CardTitle className="text-sm">Peserta per Instansi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={instansiChartData} layout="vertical" margin={{ left: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                        />
                        <Tooltip formatter={(v: number) => [`${v} peserta`]} />
                        <Bar dataKey="value" name="Peserta" isAnimationActive radius={[0, 4, 4, 0]}>
                          {instansiChartData.map((_, i) => (
                            <Cell key={i} fill={INSTANSI_COLORS[i % INSTANSI_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {!isTudung && barData.length > 0 && (
              <Card className="border-0 shadow-islamic">
                <CardHeader>
                  <CardTitle className="text-sm">Peserta per Sesi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="peserta" name="Peserta" fill="hsl(var(--primary))" isAnimationActive radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* ── Live Feed + QR ── */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Live feed */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
            <Card className="border-0 shadow-islamic">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Peserta Terbaru
                </CardTitle>
                <Badge variant="outline" className="text-xs">{records.length} total</Badge>
              </CardHeader>
              <CardContent>
                {recentFeed.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Belum ada peserta hadir
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {recentFeed.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: -16, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                            i === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/40"
                          }`}
                        >
                          <div>
                            <p className="font-medium text-sm leading-tight">{r.participant_name}</p>
                            {r.instansi && (
                              <p className="text-xs text-muted-foreground">{r.instansi}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            {r.created_at && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(r.created_at), "HH:mm")}
                              </p>
                            )}
                            {i === 0 && (
                              <Badge variant="outline" className="text-xs text-primary border-primary mt-0.5">
                                Terbaru
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* QR Display */}
          <motion.div custom={6} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
            <Card className="border-0 shadow-islamic">
              <CardHeader>
                <CardTitle className="text-sm">QR Scan Aktif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeSessions.length > 1 && (
                  <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Pilih sesi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSessions.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.session_label ?? `Sesi ${s.session_number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedQrSession ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                      <QRCodeSVG
                        value={`${window.location.origin}/absen/${selectedQrSession.qr_token}`}
                        size={180}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs mb-1">
                        {selectedQrSession.session_label ?? `Sesi ${selectedQrSession.session_number}`}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Scan dengan kamera untuk hadir
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p className="text-3xl mb-2">🔒</p>
                    Tidak ada sesi QR aktif
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-muted-foreground">
          <p>🕌 Masjid Pendidikan Ibnul Qayyim · Makassar</p>
          <p className="mt-1 font-arabic text-sm opacity-60">الَّذِينَ يُقِيمُونَ الصَّلَاةَ</p>
        </div>
      </div>
    </div>
  );
}
