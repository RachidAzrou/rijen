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
      'prayer-ground': 'Gebedsruimte +0',
      'prayer-first': 'Gebedsruimte +1',
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
      'prayer-ground': 'مصلى +٠',
      'prayer-first': 'مصلى +١',
      'garage': 'المرآب'
    }
  }
};

export type Language = 'nl' | 'ar';