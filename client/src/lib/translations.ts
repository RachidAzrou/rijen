// Translations for the public imam dashboard
export const translations = {
  nl: {
    pageTitle: 'Gebedsruimtes',
    available: 'Rijen zijn goed',
    unavailable: 'Rijen zijn niet goed',
    lastUpdate: 'Laatste update',
    hadithTitle: 'Hadieth',
    hadithText: "Houd de rijen recht, want het recht houden van de rijen is deel van het perfect verrichten van het gebed.",
    hadithSource: "Overgeleverd door Bukhari & Muslim",
    rooms: {
      'first-floor': 'Moskee +1',
      'beneden': 'Moskee +0',
      'garage': 'Garage'
    }
  },
  ar: {
    pageTitle: 'مصليات',
    available: 'الصفوف منتظمة',
    unavailable: 'الصفوف غير منتظمة',
    lastUpdate: 'آخر تحديث',
    hadithTitle: 'قال رسول الله ﷺ',
    hadithText: 'سَوُّوا صُفُوفَكُمْ، فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ تَمَامِ الصَّلَاةِ',
    hadithSource: 'رواه البخاري ومسلم',
    rooms: {
      'first-floor': 'مصلى +١',
      'beneden': 'مصلى +٠',
      'garage': 'المرآب'
    }
  }
};

export type Language = 'nl' | 'ar';