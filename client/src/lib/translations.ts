// Translations for the public imam dashboard
export const translations = {
  nl: {
    pageTitle: 'Gebedsruimtes',
    available: 'In orde',
    unavailable: 'Niet in orde',
    unknown: 'Onbekend',
    lastUpdate: 'Laatste update',
    hadithTitle: 'قال رسول الله ﷺ',
    hadithText: 'سَوُّوا صُفُوفَكُمْ، فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ تَمَامِ الصَّلَاةِ',
    hadithSource: 'رواه البخاري ومسلم',
    rooms: {
      'first-floor': 'Moskee +1',
      'beneden': 'Moskee +0',
      'garage': 'Garage'
    }
  },
  ar: {
    pageTitle: 'قاعات الصلاة',
    available: 'متاح',
    unavailable: 'غير متاح',
    unknown: 'غير معروف',
    lastUpdate: 'آخر تحديث',
    hadithTitle: 'قال رسول الله ﷺ',
    hadithText: 'سَوُّوا صُفُوفَكُمْ، فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ تَمَامِ الصَّلَاةِ',
    hadithSource: 'رواه البخاري ومسلم',
    rooms: {
      'first-floor': 'المسجد +١',
      'beneden': 'المسجد +٠',
      'garage': 'المرآب'
    }
  }
};

export type Language = 'nl' | 'ar';