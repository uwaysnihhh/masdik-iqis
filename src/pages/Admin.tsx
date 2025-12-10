import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  CalendarDays,
  Wallet,
  Users,
  FileText,
  Check,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Sample Data
type BookingStatus = "pending" | "approved" | "rejected";

interface Booking {
  id: string;
  name: string;
  phone: string;
  activity: string;
  date: string;
  status: BookingStatus;
}

const bookingRequests: Booking[] = [
  {
    id: "1",
    name: "Ahmad Fauzi",
    phone: "081234567890",
    activity: "Akad Nikah",
    date: "2024-12-20",
    status: "pending",
  },
  {
    id: "2",
    name: "Siti Aminah",
    phone: "081234567891",
    activity: "Pengajian",
    date: "2024-12-18",
    status: "approved",
  },
  {
    id: "3",
    name: "Budi Santoso",
    phone: "081234567892",
    activity: "Aqiqah",
    date: "2024-12-25",
    status: "pending",
  },
];

const transactions = [
  { id: "1", type: "income" as const, amount: 5000000, description: "Donasi Jumat", date: "2024-12-13" },
  { id: "2", type: "expense" as const, amount: 1500000, description: "Pembayaran Listrik", date: "2024-12-10" },
  { id: "3", type: "income" as const, amount: 2500000, description: "Infaq Bulanan", date: "2024-12-05" },
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>(bookingRequests);
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (id: string) => {
    setBookings(
      bookings.map((b): Booking => (b.id === id ? { ...b, status: "approved" } : b))
    );
    toast({ title: "Reservasi Disetujui", description: "Notifikasi telah dikirim ke pemohon" });
  };

  const handleReject = (id: string) => {
    setBookings(
      bookings.map((b): Booking => (b.id === id ? { ...b, status: "rejected" } : b))
    );
    toast({ title: "Reservasi Ditolak", variant: "destructive" });
  };

  const stats = [
    {
      title: "Total Saldo",
      value: formatCurrency(45750000),
      icon: Wallet,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Reservasi Pending",
      value: bookings.filter((b) => b.status === "pending").length.toString(),
      icon: Clock,
      trend: "Butuh tindakan",
      trendUp: null,
    },
    {
      title: "Kegiatan Bulan Ini",
      value: "8",
      icon: CalendarDays,
      trend: "+3",
      trendUp: true,
    },
    {
      title: "Total Donasi",
      value: formatCurrency(17500000),
      icon: TrendingUp,
      trend: "+25%",
      trendUp: true,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">MASDIK IQIS Makassar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    {stat.trendUp !== null && (
                      <p
                        className={cn(
                          "text-xs mt-1 flex items-center gap-1",
                          stat.trendUp ? "text-primary" : "text-destructive"
                        )}
                      >
                        {stat.trendUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {stat.trend}
                      </p>
                    )}
                    {stat.trendUp === null && (
                      <p className="text-xs mt-1 text-yellow-600">{stat.trend}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 gradient-islamic rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reservations" className="space-y-6">
          <TabsList className="bg-card shadow-lg">
            <TabsTrigger value="reservations" className="gap-2">
              <FileText className="w-4 h-4" />
              Reservasi
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Wallet className="w-4 h-4" />
              Transaksi
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Kegiatan
            </TabsTrigger>
          </TabsList>

          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daftar Reservasi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Kegiatan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.name}</TableCell>
                        <TableCell>{booking.phone}</TableCell>
                        <TableCell>{booking.activity}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(booking.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(booking.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Riwayat Transaksi</CardTitle>
                <Button size="sm" variant="islamic">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell className="font-medium">{tx.description}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tx.type === "income"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {tx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold",
                            tx.type === "income" ? "text-primary" : "text-destructive"
                          )}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manajemen Kegiatan</CardTitle>
                <Button size="sm" variant="islamic">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kegiatan
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Fitur manajemen kegiatan akan segera hadir</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
