-- Hapus policy yang terlalu longgar (mengizinkan semua authenticated users)
DROP POLICY IF EXISTS "Block anonymous reads on reservations" ON public.reservations;

-- Policy "Admins can view all reservations" sudah ada dan benar
-- Tidak perlu menambahkan policy baru karena sudah ada policy admin yang tepat