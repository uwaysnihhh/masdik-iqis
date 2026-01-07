import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, QrCode, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import qrisImage from "@/assets/qris-donasi.jpg";

const saldoData = {
  total: 45750000,
  lastUpdated: new Date(),
  transactions: [
    { id: "1", type: "income" as const, amount: 5000000, description: "Donasi Jumat", date: new Date(2024, 11, 13) },
    { id: "2", type: "expense" as const, amount: 1500000, description: "Pembayaran Listrik", date: new Date(2024, 11, 10) },
    { id: "3", type: "income" as const, amount: 2500000, description: "Infaq Bulanan", date: new Date(2024, 11, 5) },
    { id: "4", type: "expense" as const, amount: 800000, description: "Perawatan AC", date: new Date(2024, 11, 3) },
    { id: "5", type: "income" as const, amount: 10000000, description: "Donasi Renovasi", date: new Date(2024, 11, 1) },
  ],
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function SaldoSection() {
  const totalIncome = saldoData.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = saldoData.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <Card className="gradient-islamic text-primary-foreground shadow-islamic border-0 overflow-hidden relative">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <CardContent className="p-6 lg:p-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm mb-1">Saldo Masjid</p>
              <p className="text-3xl lg:text-4xl font-bold">{formatCurrency(saldoData.total)}</p>
              <p className="text-primary-foreground/70 text-xs mt-2">
                Terakhir diperbarui: {saldoData.lastUpdated.toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="hidden sm:block">
              <Wallet className="w-16 h-16 text-primary-foreground/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Pemasukan
              </div>
              <p className="text-xl font-bold text-primary-foreground">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-1">
                <TrendingDown className="w-4 h-4" />
                Pengeluaran
              </div>
              <p className="text-xl font-bold text-primary-foreground">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code Card */}
        <Card className="shadow-islamic border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Infaq
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-card p-4 rounded-2xl shadow-lg border border-border">
              <img 
                src={qrisImage} 
                alt="QRIS Masjid Pendidikan Ibnul Qayyim" 
                className="w-72 h-auto rounded-xl"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Scan QR code untuk berinfaq
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bank Syariah Indonesia (BSI) - 7301136287
            </p>
            <p className="text-xs text-muted-foreground">
              a.n. Msjd Pendidikan Ibnul Qayyim
            </p>
            <a 
              href={qrisImage} 
              download="QRIS-Masjid-Ibnul-Qayyim.jpg"
              className="mt-4"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-islamic border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Transaksi Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {saldoData.transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        transaction.type === "income"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date.toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      transaction.type === "income" ? "text-primary" : "text-destructive"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
