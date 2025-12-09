import { motion } from "framer-motion";

export function ArabicGreeting() {
  return (
    <div className="text-center space-y-4">
      <p className="font-arabic text-5xl lg:text-7xl text-primary leading-relaxed">
        أَهْلًا وَسَهْلًا
      </p>
      <div className="h-1 w-32 mx-auto gradient-gold rounded-full" />
      <p className="text-muted-foreground text-lg">
        Selamat Datang di Masjid Pendidikan Ibnul Qayyim, Makassar
      </p>
    </div>
  );
}
