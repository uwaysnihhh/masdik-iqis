import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Send, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Tanggal dengan waktu yang sudah dipesan (format: "YYYY-MM-DD-HH:MM")
const bookedSlots = [
  { date: new Date(2024, 11, 15), time: "08:00" },
  { date: new Date(2024, 11, 15), time: "10:00" },
  { date: new Date(2024, 11, 20), time: "08:00" },
  { date: new Date(2024, 11, 20), time: "14:00" },
  { date: new Date(2024, 11, 20), time: "19:00" },
  { date: new Date(2024, 11, 25), time: "08:00" },
];

const timeSlots = [
  { value: "08:00", label: "08:00 - 10:00" },
  { value: "10:00", label: "10:00 - 12:00" },
  { value: "14:00", label: "14:00 - 16:00" },
  { value: "16:00", label: "16:00 - 18:00" },
  { value: "19:00", label: "19:00 - 21:00" },
];

const activityTypes = [
  { value: "pernikahan", label: "Akad Nikah / Resepsi" },
  { value: "pengajian", label: "Pengajian / Kajian" },
  { value: "aqiqah", label: "Aqiqah" },
  { value: "tahlilan", label: "Tahlilan" },
  { value: "rapat", label: "Rapat / Pertemuan" },
  { value: "lainnya", label: "Lainnya" },
];

export function BookingForm() {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    activity: "",
    description: "",
  });

  // Cek slot waktu yang tersedia untuk tanggal tertentu
  const getAvailableSlots = (selectedDate: Date) => {
    const bookedTimes = bookedSlots
      .filter(slot => slot.date.toDateString() === selectedDate.toDateString())
      .map(slot => slot.time);
    return timeSlots.filter(slot => !bookedTimes.includes(slot.value));
  };

  // Cek apakah tanggal memiliki slot tersedia
  const hasAvailableSlots = (day: Date) => {
    const bookedTimes = bookedSlots
      .filter(slot => slot.date.toDateString() === day.toDateString())
      .map(slot => slot.time);
    return bookedTimes.length < timeSlots.length;
  };

  // Cek apakah tanggal fully booked
  const isFullyBooked = (day: Date) => {
    const bookedTimes = bookedSlots
      .filter(slot => slot.date.toDateString() === day.toDateString())
      .map(slot => slot.time);
    return bookedTimes.length >= timeSlots.length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.activity || !date || !time) {
      toast({
        title: "Form Tidak Lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    // Simulate submission
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
          <Button onClick={() => setIsSubmitted(false)} variant="outline">
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
              <Label htmlFor="phone">Nomor Telepon *</Label>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
                      setTime(""); // Reset waktu saat tanggal berubah
                    }}
                    disabled={(day) =>
                      day < new Date() || isFullyBooked(day)
                    }
                    modifiers={{
                      partiallyBooked: (day) => {
                        const bookedTimes = bookedSlots
                          .filter(slot => slot.date.toDateString() === day.toDateString())
                          .map(slot => slot.time);
                        return bookedTimes.length > 0 && bookedTimes.length < timeSlots.length;
                      },
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
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih waktu kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSlots(date).map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getAvailableSlots(date).length < timeSlots.length && (
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
            <Label htmlFor="description">Keterangan Tambahan</Label>
            <Textarea
              id="description"
              placeholder="Tuliskan detail kegiatan Anda..."
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <Button type="submit" size="lg" className="w-full" variant="islamic">
            <Send className="w-4 h-4 mr-2" />
            Kirim Pengajuan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
