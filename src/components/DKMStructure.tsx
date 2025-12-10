import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import type { DKMMember } from "@/types";

const dkmMembers: DKMMember[] = [
  { id: "1", name: "H. Ahmad Ridwan, S.Ag", position: "Ketua DKM" },
  { id: "2", name: "Ustadz Muhammad Yusuf", position: "Wakil Ketua" },
  { id: "3", name: "H. Abdullah Rahman", position: "Sekretaris" },
  { id: "4", name: "Ir. Bambang Supriyadi", position: "Bendahara" },
  { id: "5", name: "Ustadz Hasan Basri", position: "Koordinator Ibadah" },
  { id: "6", name: "Drs. Suparto, M.Pd", position: "Koordinator Pendidikan" },
  { id: "7", name: "H. Surya Darma", position: "Koordinator Sosial" },
  { id: "8", name: "Ustadz Fauzi Rahman", position: "Koordinator Dakwah" },
];

export function DKMStructure() {
  const ketua = dkmMembers.find((m) => m.position === "Ketua DKM");
  const wakil = dkmMembers.find((m) => m.position === "Wakil Ketua");
  const sekben = dkmMembers.filter((m) =>
    ["Sekretaris", "Bendahara"].includes(m.position)
  );
  const koordinator = dkmMembers.filter((m) =>
    m.position.includes("Koordinator")
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Struktur Organisasi DKM
        </h2>
        <p className="text-muted-foreground">
          Masjid Pendidikan Ibnul Qayyim Makassar (MASDIK IQIS)
        </p>
        <div className="h-1 w-24 mx-auto gradient-gold rounded-full mt-4" />
      </div>

      {/* Ketua */}
      {ketua && (
        <div className="flex justify-center">
          <MemberCard member={ketua} isLeader />
        </div>
      )}

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-border" />
      </div>

      {/* Wakil */}
      {wakil && (
        <div className="flex justify-center">
          <MemberCard member={wakil} isVice />
        </div>
      )}

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-border" />
      </div>

      {/* Sekretaris & Bendahara */}
      <div className="flex justify-center gap-4 lg:gap-8 flex-wrap">
        {sekben.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {/* Connecting Line */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-border" />
      </div>

      {/* Koordinator */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {koordinator.map((member) => (
          <MemberCard key={member.id} member={member} isCoordinator />
        ))}
      </div>
    </div>
  );
}

function MemberCard({
  member,
  isLeader = false,
  isVice = false,
  isCoordinator = false,
}: {
  member: DKMMember;
  isLeader?: boolean;
  isVice?: boolean;
  isCoordinator?: boolean;
}) {
  return (
    <Card
      className={`
        border-0 transition-all duration-300 hover:-translate-y-1 
        ${isLeader ? "shadow-islamic gradient-islamic" : "shadow-lg hover:shadow-islamic"}
        ${isVice ? "bg-primary/5 border-2 border-primary/20" : ""}
        ${isCoordinator ? "bg-card" : ""}
      `}
    >
      <CardContent className={`p-6 text-center ${isLeader ? "text-primary-foreground" : ""}`}>
        <div
          className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4
            ${isLeader ? "bg-primary-foreground/20" : "bg-primary/10"}
          `}
        >
          <User
            className={`w-8 h-8 ${isLeader ? "text-primary-foreground" : "text-primary"}`}
          />
        </div>
        <h3
          className={`font-bold text-lg mb-1 ${
            isLeader ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {member.name}
        </h3>
        <p
          className={`text-sm ${
            isLeader ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
        >
          {member.position}
        </p>
      </CardContent>
    </Card>
  );
}
