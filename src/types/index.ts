export interface PrayerTime {
  name: string;
  nameArabic: string;
  time: string;
  isActive?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  time?: string;
  description: string;
  type: 'kajian' | 'pengajian' | 'shalat' | 'sholat' | 'acara' | 'sosial' | 'reservasi' | 'lainnya' | 'tudung_sipulung';
}

export interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: Date;
  activity: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface DKMMember {
  id: string;
  name: string;
  role?: string;
  position: string;
  photo?: string;
}

export interface SaldoInfo {
  total: number;
  lastUpdated: Date;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Date;
}
