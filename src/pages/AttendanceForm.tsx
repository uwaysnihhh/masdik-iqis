import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, Loader2, AlertTriangle, XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


interface SessionData {
  id: string;
  activity_id: string;
  session_number: number | null;
  session_label: string | null;
  qr_token: string;
  scan_type: string;
  is_active: boolean;
}

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

function getDeviceFingerprint(): string {
  const stored = localStorage.getItem("attendance_device_id");
  if (stored) return stored;
  const fp = crypto.randomUUID();
  localStorage.setItem("attendance_device_id", fp);
  return fp;
}

function getCookieKey(sessionId: string): string {
  return `attendance_${sessionId}`;
}

function hasAlreadySubmitted(sessionId: string): boolean {
  return document.cookie.includes(getCookieKey(sessionId) + "=1");
}

function setSubmittedCookie(sessionId: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${getCookieKey(sessionId)}=1; expires=${expires.toUTCString()}; path=/`;
}


export default function AttendanceForm() {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<SessionData | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [expired, setExpired] = useState(false);
  const [needsArrivalFirst, setNeedsArrivalFirst] = useState(false);

  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");

  // Restore name from cookie
  useEffect(() => {
    const savedName = localStorage.getItem("attendance_name");
    if (savedName) setName(savedName);
  }, []);

  // Fetch session and activity
  useEffect(() => {
    const fetchSession = async () => {
      if (!token) { setNotFound(true); setLoading(false); return; }

      const { data: sessData, error: sessErr } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("qr_token", token)
        .eq("is_active", true)
        .single();

      if (sessErr || !sessData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const sessionData = sessData as SessionData;
      setSession(sessionData);

      // Check cookie/device duplicate
      if (hasAlreadySubmitted(sessionData.id)) {
        setAlreadyDone(true);
        setLoading(false);
        return;
      }

      const { data: actData } = await supabase
        .from("activities")
        .select("*")
        .eq("id", sessionData.activity_id)
        .single();

      if (actData) {
        const activityData = actData as ActivityData;
        setActivity(activityData);

        // Time validation for kajian/rapat: arrival QR expires after event ends
        if ((activityData.type === "kajian" || activityData.type === "rapat") && sessionData.scan_type === "arrival") {
          const now = new Date();
          const eventDate = new Date(activityData.event_date);
          if (activityData.event_end_time) {
            const [h, m] = activityData.event_end_time.split(":").map(Number);
            eventDate.setHours(h, m, 0, 0);
            if (now > eventDate) {
              setExpired(true);
              setLoading(false);
              return;
            }
          }
        }

        // Sequence validation for kajian/rapat: completion requires arrival first
        if ((activityData.type === "kajian" || activityData.type === "rapat") && sessionData.scan_type === "completion") {
          const deviceFp = getDeviceFingerprint();
          // Find the arrival session for this activity
          const { data: arrSessions } = await supabase
            .from("attendance_sessions")
            .select("id")
            .eq("activity_id", sessionData.activity_id)
            .eq("scan_type", "arrival");

          if (arrSessions && arrSessions.length > 0) {
            const arrivalSessionId = arrSessions[0].id;
            const { data: arrRecords } = await supabase
              .from("attendance_records")
              .select("id")
              .eq("session_id", arrivalSessionId)
              .eq("device_fingerprint", deviceFp);

            if (!arrRecords || arrRecords.length === 0) {
              setNeedsArrivalFirst(true);
              setLoading(false);
              return;
            }
          }
        }
      }
      setLoading(false);
    };

    fetchSession();
  }, [token]);


  const handleSubmit = async () => {
    if (!session || !activity) return;

    if (!name.trim()) {
      toast({ title: "Masukkan nama Anda", variant: "destructive" });
      return;
    }
    if (feedback.trim().length < 10) {
      toast({ title: "Feedback minimal 10 karakter", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const deviceFp = getDeviceFingerprint();

    const { error } = await supabase.from("attendance_records").insert({
      session_id: session.id,
      activity_id: session.activity_id,
      participant_name: name.trim(),
      feedback: feedback.trim(),
      device_fingerprint: deviceFp,
      latitude: null,
      longitude: null,
    });

    if (error) {
      if (error.code === "23505") {
        setAlreadyDone(true);
        toast({ title: "Anda sudah mengisi absensi ini", variant: "destructive" });
      } else {
        toast({ title: "Gagal menyimpan absensi", description: error.message, variant: "destructive" });
      }
      setSubmitting(false);
      return;
    }

    // Save name and set cookie
    localStorage.setItem("attendance_name", name.trim());
    setSubmittedCookie(session.id);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">QR Code Tidak Valid</h2>
            <p className="text-muted-foreground">QR code ini tidak ditemukan atau sudah tidak aktif.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Absensi Ditutup</h2>
            <p className="text-muted-foreground">Waktu kegiatan sudah selesai, absensi kedatangan tidak lagi tersedia.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsArrivalFirst) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Absen Kedatangan Dulu</h2>
            <p className="text-muted-foreground">Anda harus mengisi absensi kedatangan terlebih dahulu sebelum mengisi absensi selesai.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Sudah Absen</h2>
            <p className="text-muted-foreground">Anda sudah mengisi absensi untuk sesi ini.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Absensi Berhasil!</h2>
            <p className="text-muted-foreground mb-2">Terima kasih telah mengisi absensi.</p>
            {activity && (
              <div className="bg-muted/50 rounded-lg p-3 mt-4">
                <p className="font-medium text-sm">{activity.title}</p>
                <Badge variant="outline" className="mt-1">{session?.session_label}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const feedbackLabel =
    activity?.type === "daurah"
      ? `Apa manfaat dari ${session?.session_label || "sesi ini"}?`
      : "Apa manfaat dari kegiatan ini?";

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl gradient-islamic mx-auto flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-lg">Absensi Kegiatan</CardTitle>
          {activity && (
            <div className="space-y-1">
              <p className="font-medium text-sm">{activity.title}</p>
              <Badge variant="outline">{session?.session_label}</Badge>
              {activity.speaker_name && (
                <p className="text-xs text-muted-foreground">Pemateri: {activity.speaker_name}</p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Form */}
          <div className="space-y-2">
            <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
            <Input
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>{feedbackLabel} <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Minimal 10 karakter..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className={`text-xs ${feedback.trim().length < 10 ? "text-destructive" : "text-muted-foreground"}`}>
              {feedback.trim().length}/500 (min. 10)
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || feedback.trim().length < 10}
            className="w-full"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
            ) : (
              "Kirim Absensi"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
