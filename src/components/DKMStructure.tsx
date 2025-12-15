import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import type { DKMMember } from "@/types";

const dkmMembers: DKMMember[] = [
  // Pembina & Penasihat
  { id: "1", name: "drh. Islan Arvan Nurgas, M.Si.", position: "Ketua YPI Ibnul Qayyim Makassar", role: "pembina" },
  { id: "2", name: "Ustadz Budi Hariyanto, Lc., M.Pd.", position: "Dewan Pembina YPI Ibnul Qayyim Makassar", role: "pembina" },
  // Ketua
  { id: "3", name: "Muflih Habibullah, S.Pd.", position: "Ketua", role: "ketua" },
  // Sekretaris
  { id: "4", name: "Muhammad Alifyan Zulkarnain, S.Tr.T.", position: "Sekretaris", role: "sekretaris" },
  // Bendahara
  { id: "5", name: "Maududi Djamal, S.I.K.", position: "Bendahara", role: "bendahara" },
  // Bidang Keagamaan & Pembinaan
  { id: "6", name: "Ustadz Mustaqiem Musytari, S.Pd., M.Pd.", position: "Bidang Keagamaan & Pembinaan", role: "bidang" },
  { id: "7", name: "Ustadz Ali Amran, S.H.I., M.H.", position: "Bidang Keagamaan & Pembinaan", role: "bidang" },
  { id: "8", name: "Ustadz Muhammad Yusuf, S.Pd.", position: "Bidang Keagamaan & Pembinaan", role: "bidang" },
  // Bidang Humas & Media
  { id: "9", name: "Mashuri, S.Pd.", position: "Bidang Humas & Media", role: "bidang" },
  { id: "10", name: "Khalid Fikri", position: "Bidang Humas & Media", role: "bidang" },
  { id: "11", name: "Hammam Abdul Aziz", position: "Bidang Humas & Media", role: "bidang" },
  // Bidang Sarana & Prasarana
  { id: "11", name: "Adnan Pabean, S.Pd.", position: "Bidang Sarana & Prasarana", role: "bidang" },
  // Bidang Perawatan & Kebersihan
  { id: "12", name: "Suhardi", position: "Bidang Perawatan & Kebersihan", role: "bidang" },
  // Remaja Masjid
  { id: "14", name: "Rizki Ridho", position: "Remaja Masjid", role: "remaja" },
  { id: "15", name: "Suhaib", position: "Remaja Masjid", role: "remaja" },
  { id: "16", name: "Ali Abdurrozzaq", position: "Remaja Masjid", role: "remaja" },
];

export function DKMStructure() {
  const pembina = dkmMembers.filter((m) => m.role === "pembina");
  const ketua = dkmMembers.find((m) => m.role === "ketua");
  const sekretaris = dkmMembers.find((m) => m.role === "sekretaris");
  const bendahara = dkmMembers.find((m) => m.role === "bendahara");
  const bidangKeagamaan = dkmMembers.filter((m) => m.position === "Bidang Keagamaan & Pembinaan");
  const bidangHumas = dkmMembers.filter((m) => m.position === "Bidang Humas & Media");
  const bidangSarana = dkmMembers.filter((m) => m.position === "Bidang Sarana & Prasarana");
  const bidangPerawatan = dkmMembers.filter((m) => m.position === "Bidang Perawatan & Kebersihan");
  const remajaMasjid = dkmMembers.filter((m) => m.role === "remaja");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Struktur Organisasi DKM
        </h2>
        <p className="text-muted-foreground">
          Masjid Pendidikan Ibnul Qayyim Makassar
        </p>
        <div className="h-1 w-24 mx-auto gradient-gold rounded-full mt-4" />
      </div>

      {/* Pembina & Penasihat */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center text-foreground">Pembina & Penasihat</h3>
        <div className="flex justify-center gap-4 flex-wrap">
          {pembina.map((member) => (
            <MemberCard key={member.id} member={member} variant="pembina" />
          ))}
        </div>
      </div>

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-border" />
      </div>

      {/* Ketua */}
      {ketua && (
        <div className="flex justify-center">
          <MemberCard member={ketua} variant="ketua" />
        </div>
      )}

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-border" />
      </div>

      {/* Sekretaris & Bendahara */}
      <div className="flex justify-center gap-4 lg:gap-8 flex-wrap">
        {sekretaris && <MemberCard member={sekretaris} variant="sekben" />}
        {bendahara && <MemberCard member={bendahara} variant="sekben" />}
      </div>

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-border" />
      </div>

      {/* Bidang-bidang */}
      <div className="space-y-6">
        {/* Bidang Keagamaan & Pembinaan */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-center text-primary">Bidang Keagamaan & Pembinaan</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {bidangKeagamaan.map((member) => (
              <MemberCard key={member.id} member={member} variant="bidang" />
            ))}
          </div>
        </div>

        {/* Bidang Humas & Media */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-center text-primary">Bidang Humas & Media</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {bidangHumas.map((member) => (
              <MemberCard key={member.id} member={member} variant="bidang" />
            ))}
          </div>
        </div>

        {/* Bidang Sarana & Prasarana */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-center text-primary">Bidang Sarana & Prasarana</h4>
          <div className="flex justify-center gap-4 flex-wrap">
            {bidangSarana.map((member) => (
              <MemberCard key={member.id} member={member} variant="bidang" />
            ))}
          </div>
        </div>

        {/* Bidang Perawatan & Kebersihan */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-center text-primary">Bidang Perawatan & Kebersihan</h4>
          <div className="flex justify-center gap-4 flex-wrap">
            {bidangPerawatan.map((member) => (
              <MemberCard key={member.id} member={member} variant="bidang" />
            ))}
          </div>
        </div>
      </div>

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-border" />
      </div>

      {/* Remaja Masjid */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-center text-foreground">Remaja Masjid</h4>
        <div className="flex justify-center gap-4 flex-wrap">
          {remajaMasjid.map((member) => (
            <MemberCard key={member.id} member={member} variant="remaja" />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberCard({
  member,
  variant = "default",
}: {
  member: DKMMember;
  variant?: "pembina" | "ketua" | "sekben" | "bidang" | "remaja" | "default";
}) {
  const variantStyles = {
    pembina: "bg-primary/5 border-2 border-primary/20",
    ketua: "shadow-islamic gradient-islamic",
    sekben: "bg-accent/10 border-2 border-accent/30",
    bidang: "bg-card shadow-lg hover:shadow-islamic",
    remaja: "bg-muted/50",
    default: "bg-card shadow-lg",
  };

  const isKetua = variant === "ketua";

  return (
    <Card
      className={`
        border-0 transition-all duration-300 hover:-translate-y-1 
        ${variantStyles[variant]}
        ${variant === "bidang" || variant === "remaja" ? "w-full sm:w-auto sm:min-w-[200px]" : ""}
      `}
    >
      <CardContent className={`p-6 text-center ${isKetua ? "text-primary-foreground" : ""}`}>
        <div
          className={`
            w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3
            ${isKetua ? "bg-primary-foreground/20" : "bg-primary/10"}
          `}
        >
          <User
            className={`w-7 h-7 ${isKetua ? "text-primary-foreground" : "text-primary"}`}
          />
        </div>
        <h3
          className={`font-bold text-base mb-1 ${
            isKetua ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {member.name}
        </h3>
        <p
          className={`text-sm ${
            isKetua ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
        >
          {member.position}
        </p>
      </CardContent>
    </Card>
  );
}
