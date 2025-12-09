import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Event } from "@/types";

// Helper to get upcoming dates relative to current date
const getUpcomingDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Kajian Rutin Ahad Pagi",
    date: getUpcomingDate(6),
    time: "08:00 - 10:00",
    description: "Kajian kitab bersama Ustadz Ahmad",
    type: "kajian",
  },
  {
    id: "2",
    title: "Pengajian Ibu-ibu",
    date: getUpcomingDate(9),
    time: "09:00 - 11:00",
    description: "Pengajian rutin ibu-ibu",
    type: "pengajian",
  },
  {
    id: "3",
    title: "Buka Bersama Yatim",
    date: getUpcomingDate(11),
    time: "17:30 - 19:00",
    description: "Buka puasa bersama anak yatim",
    type: "sosial",
  },
  {
    id: "4",
    title: "Shalat Jumat",
    date: getUpcomingDate(3),
    time: "12:00 - 13:00",
    description: "Khutbah oleh Ustadz Ridwan",
    type: "shalat",
  },
];

const typeColors: Record<string, string> = {
  kajian: "border-primary text-primary bg-transparent",
  pengajian: "border-primary text-primary bg-transparent",
  shalat: "border-emerald-600 text-emerald-600 bg-transparent",
  sosial: "border-gold text-gold bg-transparent",
  acara: "border-gold text-gold bg-transparent",
  reservasi: "border-secondary text-secondary-foreground bg-transparent",
};

// Get upcoming events sorted by date
const getUpcomingEvents = () => {
  const now = new Date();
  return sampleEvents
    .filter((event) => event.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDateEvents = sampleEvents.filter(
    (event) =>
      date && event.date.toDateString() === date.toDateString()
  );

  const eventDates = sampleEvents.map((e) => e.date.toDateString());
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-islamic border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Kalender Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-xl border-0 pointer-events-auto"
              modifiers={{
                event: (day) => eventDates.includes(day.toDateString()),
              }}
              modifiersClassNames={{
                event: "bg-primary/20 text-primary font-bold",
              }}
            />
          </CardContent>
        </Card>

        <Card className="shadow-islamic border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {date
                ? format(date, "EEEE, d MMMM yyyy", { locale: id })
                : "Pilih Tanggal"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                      <Badge variant="outline" className={typeColors[event.type]}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Masjid Pendidikan Ibnul Qayyim, Makassar</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Tidak ada kegiatan terjadwal pada tanggal ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kegiatan Mendatang Section */}
      <Card className="shadow-islamic border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Kegiatan Mendatang
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="divide-y divide-border">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {event.title}
                    </h4>
                    <p className="text-sm text-primary">
                      {format(event.date, "d MMM", { locale: id })} • {event.time}
                    </p>
                  </div>
                  <Badge variant="outline" className={typeColors[event.type]}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Tidak ada kegiatan mendatang</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
