import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface EventItem {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string | null;
  type: string;
  source: "activity" | "reservation";
  requester?: string;
}

const typeColors: Record<string, string> = {
  kajian: "border-primary text-primary bg-transparent",
  pengajian: "border-primary text-primary bg-transparent",
  shalat: "border-emerald-600 text-emerald-600 bg-transparent",
  sholat: "border-emerald-600 text-emerald-600 bg-transparent",
  sosial: "border-gold text-gold bg-transparent",
  acara: "border-gold text-gold bg-transparent",
  reservasi: "border-secondary text-secondary-foreground bg-transparent",
  pernikahan: "border-pink-500 text-pink-500 bg-transparent",
  aqiqah: "border-amber-500 text-amber-500 bg-transparent",
  tahlilan: "border-purple-500 text-purple-500 bg-transparent",
  rapat: "border-blue-500 text-blue-500 bg-transparent",
  lainnya: "border-gray-500 text-gray-500 bg-transparent",
};

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      // Fetch activities and approved reservations
      const [activitiesRes, reservationsRes] = await Promise.all([
        supabase
          .from("activities")
          .select("*")
          .eq("is_active", true)
          .order("event_date", { ascending: true }),
        supabase
          .from("reservations")
          .select("*")
          .eq("status", "approved")
          .order("reservation_date", { ascending: true }),
      ]);

      const allEvents: EventItem[] = [];

      // Add activities
      if (activitiesRes.data) {
        activitiesRes.data.forEach((activity) => {
          const timeStr = activity.event_time
            ? activity.event_end_time
              ? `${activity.event_time} - ${activity.event_end_time}`
              : activity.event_time
            : "";

          allEvents.push({
            id: activity.id,
            title: activity.title,
            date: new Date(activity.event_date),
            time: timeStr,
            description: activity.description,
            type: activity.type,
            source: "activity",
          });
        });
      }

      // Add approved reservations
      if (reservationsRes.data) {
        reservationsRes.data.forEach((reservation) => {
          const timeStr = reservation.reservation_time
            ? reservation.reservation_end_time
              ? `${reservation.reservation_time} - ${reservation.reservation_end_time}`
              : reservation.reservation_time
            : "";

          allEvents.push({
            id: reservation.id,
            title: `Reservasi: ${reservation.activity_type.charAt(0).toUpperCase() + reservation.activity_type.slice(1)}`,
            date: new Date(reservation.reservation_date),
            time: timeStr,
            description: reservation.description,
            type: reservation.activity_type,
            source: "reservation",
            requester: reservation.name,
          });
        });
      }

      setEvents(allEvents);
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  const selectedDateEvents = events.filter(
    (event) => date && event.date.toDateString() === date.toDateString()
  );

  const eventDates = events.map((e) => e.date.toDateString());

  // Get upcoming events (future events only)
  const upcomingEvents = events
    .filter((event) => event.date >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 10);

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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
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
            )}
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
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        {event.source === "reservation" && event.requester && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{event.requester}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant="outline" className={typeColors[event.type] || typeColors.lainnya}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                        {event.source === "reservation" && (
                          <Badge variant="secondary" className="text-xs">
                            Reservasi
                          </Badge>
                        )}
                      </div>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
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
                      {format(event.date, "d MMM", { locale: id })} • {event.time || "-"}
                    </p>
                    {event.source === "reservation" && event.requester && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {event.requester}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="outline" className={typeColors[event.type] || typeColors.lainnya}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                    {event.source === "reservation" && (
                      <Badge variant="secondary" className="text-xs">
                        Reservasi
                      </Badge>
                    )}
                  </div>
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
