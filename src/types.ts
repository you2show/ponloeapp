export enum ViewMode {
  HOME = 'HOME',
  START_HERE = 'START_HERE',
  FRAMES = 'FRAMES',
  PRAYER = 'PRAYER',
  ALLAH_NAMES = 'ALLAH_NAMES',
  HALAL = 'HALAL',
  HADITH = 'HADITH',
  HISNUL_MUSLIM = 'HISNUL_MUSLIM',
  CALENDAR = 'CALENDAR',
  QIBLA = 'QIBLA',
  QURAN = 'QURAN',
  FAQ = 'FAQ',
  WATCH = 'WATCH',
  LISTEN = 'LISTEN',
  LIBRARY = 'LIBRARY',
  POSTERS = 'POSTERS',
  COMMUNITY = 'COMMUNITY',
  ZAKAT = 'ZAKAT',
  TASBIH = 'TASBIH',
  QADA = 'QADA',
  NAMES = 'NAMES',
  WUDU = 'WUDU',
  BASIC_KNOWLEDGE = 'BASIC_KNOWLEDGE',
  FIQH = 'FIQH',
  AQEEDA = 'AQEEDA',
  TAFSEER = 'TAFSEER',
  BASIC_HADITH = 'BASIC_HADITH',
  ADAB = 'ADAB',
  MORALITY = 'MORALITY',
  ADEIAH = 'ADEIAH',
  MISC = 'MISC',
  SEERA = 'SEERA',
  UMRAH = 'UMRAH',
  FASTING_GUIDE = 'FASTING_GUIDE',
  SALAT_GUIDE = 'SALAT_GUIDE',
  GALLERY = 'GALLERY',
  PROFILE = 'PROFILE'
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';
