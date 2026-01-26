import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Send, CheckCircle, Clock, Loader2 } from "lucide-react";
import { format, parse, isWithinInterval, addMinutes } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookedSlot {
  date: string;
  startTime: string;
  endTime: string | null;
}

const activityTypes = [
  { value: "pernikahan", label: "Akad Nikah / Resepsi" },
  { value: "pengajian", label: "Pengajian / Kajian" },
  { value: "aqiqah", label: "Aqiqah" },
  { value: "rapat", label: "Rapat / Pertemuan" },
  { value: "lainnya", label: "Lainnya" },
];

// Generate time options from 05:00 to 23:00 in 30-minute intervals
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 5; hour <= 23; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 23) {
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export function BookingForm() {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    activity: "",
    description: "",
  });

  // Fetch approved reservations and activities to show booked slots
  useEffect(() => {
    const fetchBookedSlots = async () => {
      const [reservationsRes, activitiesRes] = await Promise.all([
        supabase
          .from("reservations")
          .select("reservation_date, reservation_time, reservation_end_time")
          .eq("status", "approved"),
        supabase
          .from("activities")
          .select("event_date, event_time, event_end_time")
          .eq("is_active", true),
      ]);

      const slots: BookedSlot[] = [];

      if (reservationsRes.data) {
        reservationsRes.data.forEach((r) => {
          slots.push({
            date: r.reservation_date,
            startTime: r.reservation_time,
            endTime: r.reservation_end_time,
          });
        });
      }

      if (activitiesRes.data) {
        activitiesRes.data.forEach((a) => {
          if (a.event_time) {
            slots.push({
              date: a.event_date,
              startTime: a.event_time,
              endTime: a.event_end_time,
            });
          }
        });
      }

      setBookedSlots(slots);
    };

    fetchBookedSlots();
  }, []);

  // Check if a time slot is booked for a given date
  const isTimeBooked = (selectedDate: Date, checkTime: string) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const checkTimeDate = parse(checkTime, "HH:mm", new Date());

    return bookedSlots.some((slot) => {
      if (slot.date !== dateStr) return false;

      const slotStart = parse(slot.startTime, "HH:mm", new Date());
      const slotEnd = slot.endTime
        ? parse(slot.endTime, "HH:mm", new Date())
        : addMinutes(slotStart, 120); // Default 2 hours if no end time

      // Check if the time falls within the booked slot
      return isWithinInterval(checkTimeDate, { start: slotStart, end: slotEnd }) ||
             checkTime === slot.startTime;
    });
  };

  // Get available time slots for the selected date
  const availableStartTimes = useMemo(() => {
    if (!date) return timeOptions;
    return timeOptions.filter((t) => !isTimeBooked(date, t));
  }, [date, bookedSlots]);

  // Get available end times (must be after start time)
  const availableEndTimes = useMemo(() => {
    if (!date || !time) return [];
    const startIndex = timeOptions.indexOf(time);
    return timeOptions.slice(startIndex + 1).filter((t) => {
      // Check if any slot in between is booked
      for (let i = startIndex + 1; i <= timeOptions.indexOf(t); i++) {
        if (isTimeBooked(date, timeOptions[i])) return false;
      }
      return true;
    });
  }, [date, time, bookedSlots]);

  // Check if date is fully booked (all time slots are taken)
  const isFullyBooked = (day: Date) => {
    // Check each time slot to see if it's available
    const availableSlots = timeOptions.filter((t) => !isTimeBooked(day, t));
    // If no available slots, the day is fully booked
    return availableSlots.length === 0;
  };

  // Check if date has some bookings
  const hasBookings = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return bookedSlots.some((slot) => slot.date === dateStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.activity || !date || !time || !formData.description) {
      toast({
        title: "Form Tidak Lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("reservations").insert({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      activity_type: formData.activity,
      reservation_date: format(date, "yyyy-MM-dd"),
      reservation_time: time,
      reservation_end_time: endTime || null,
      description: formData.description || null,
      status: "pending",
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Gagal Mengirim",
        description: "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
    toast({
      title: "Pengajuan Berhasil!",
      description: "Tim kami akan segera menghubungi Anda",
    });
  };

  if (isSubmitted) {
    return (
      <Card className="shadow-islamic border-0">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 gradient-islamic rounded-full flex items-center justify-center mx-auto mb-6 shadow-islamic">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Pengajuan Terkirim!
          </h3>
          <p className="text-muted-foreground mb-6">
            Terima kasih telah mengajukan reservasi. Tim kami akan menghubungi
            Anda dalam 1x24 jam untuk konfirmasi.
          </p>
          <Button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ name: "", phone: "", email: "", activity: "", description: "" });
              setDate(undefined);
              setTime("");
              setEndTime("");
            }}
            variant="outline"
          >
            Ajukan Reservasi Lain
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-islamic border-0">
      <CardHeader>
        <CardTitle>Formulir Reservasi Masjid</CardTitle>
        <CardDescription>
          Isi formulir di bawah untuk mengajukan penggunaan masjid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor WhatsApp *</Label>
              <Input
                id="phone"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Kegiatan *</Label>
              <Select
                value={formData.activity}
                onValueChange={(value) =>
                  setFormData({ ...formData, activity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kegiatan" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Kegiatan *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date
                      ? format(date, "PPP", { locale: id })
                      : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setTime("");
                      setEndTime("");
                    }}
                    disabled={(day) =>
                      day < new Date() || isFullyBooked(day)
                    }
                    modifiers={{
                      partiallyBooked: (day) => hasBookings(day) && !isFullyBooked(day),
                      fullyBooked: (day) => isFullyBooked(day),
                    }}
                    modifiersClassNames={{
                      partiallyBooked: "bg-amber-100 text-amber-800",
                      fullyBooked: "bg-destructive/20 text-destructive line-through",
                    }}
                    className="pointer-events-auto"
                    initialFocus
                  />
                  <div className="p-3 border-t border-border space-y-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-destructive/20 rounded" />
                        <span>Penuh</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-amber-100 rounded" />
                        <span>Tersedia waktu lain</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-primary rounded" />
                        <span>Dipilih</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Pilih Waktu */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pilih Waktu *
            </Label>
            {date ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Mulai</Label>
                    <Select value={time} onValueChange={(v) => { setTime(v); setEndTime(""); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jam mulai" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => {
                          const isBooked = isTimeBooked(date, t);
                          return (
                            <SelectItem key={t} value={t} disabled={isBooked}>
                              {t} {isBooked && "(Sudah dipesan)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sampai</Label>
                    <Select value={endTime} onValueChange={setEndTime} disabled={!time}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jam selesai" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEndTimes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {availableStartTimes.length < timeOptions.length && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Beberapa waktu pada tanggal ini sudah dipesan
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                Pilih tanggal terlebih dahulu untuk melihat waktu yang tersedia
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan Kegiatan *</Label>
            <Textarea
              id="description"
              placeholder="Tuliskan detail kegiatan Anda..."
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            variant="islamic"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Mengirim..." : "Kirim Pengajuan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
