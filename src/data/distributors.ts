import { DistributorPoint } from '../types';

/**
 * Provisional Distributor Points (نقاط التوزيع المؤقتة)
 * 
 * NOTE FOR PHASE 2 / NETWORK OWNER:
 * These distributor records were extracted from the legacy dataset.
 * They are explicitly marked with `isPlaceholder: true`.
 * In Phase 2, these will be replaced with real GPS coordinates and verified distributor data.
 */
export const PROVISIONAL_DISTRIBUTORS: DistributorPoint[] = [
  {
    id: 'dist-1',
    name: 'مركز النجم للاتصالات والخدمات',
    ownerName: 'أبو أحمد النهاري',
    neighborhood: 'شارع 26 سبتمبر - حي الروضة',
    city: 'مأرب المدينة',
    address: 'شارع 26 سبتمبر الرئيسي، بجوار مجمع النور، مأرب',
    phone: '+967 718 097 168',
    whatsapp: '967718097168',
    openHours: '8:00 ص – 12:00 منتصف الليل',
    structuredHours: {
      openTime: '08:00',
      closeTime: '23:59',
      daysLabel: 'يومياً عدا الجمعة صباحاً',
    },
    lat: 15.4590,
    lng: 45.3260,
    isVerified: true,
    isPlaceholder: true,
    availableCards: ['كرت 200 ريال', 'كرت 500 ريال', 'كرت 1000 ريال', 'كرت 4000 ريال'],
  },
  {
    id: 'dist-2',
    name: 'سوبر ماركت البركة الحديث',
    ownerName: 'محمد سعيد العولقي',
    neighborhood: 'شارع الأربعين - حي المجمع',
    city: 'مأرب المدينة',
    address: 'شارع الأربعين، مقابل كلية التربية، مأرب',
    phone: '+967 773 987 654',
    whatsapp: '967773987654',
    openHours: 'مفتوح 24 ساعة يومياً',
    structuredHours: {
      openTime: '00:00',
      closeTime: '23:59',
      is24Hours: true,
      daysLabel: 'مفتوح 24 ساعة يومياً',
    },
    lat: 15.4640,
    lng: 45.3200,
    isVerified: true,
    isPlaceholder: true,
    availableCards: ['كرت 200 ريال', 'كرت 500 ريال', 'كرت 1000 ريال'],
  },
  {
    id: 'dist-3',
    name: 'كافيه ولاونج الأندلس',
    ownerName: 'م. طارق العريقي',
    neighborhood: 'حي السلام - شارع الجامعة',
    city: 'مأرب المدينة',
    address: 'شارع الجامعة الجديد، جوار مكتبة التوفير، مأرب',
    phone: '+967 775 555 123',
    whatsapp: '967775555123',
    openHours: '7:00 ص – 1:00 فجراً',
    structuredHours: {
      openTime: '07:00',
      closeTime: '01:00',
      daysLabel: 'يومياً',
    },
    lat: 15.4520,
    lng: 45.3340,
    isVerified: true,
    isPlaceholder: true,
    availableCards: ['كرت 200 ريال', 'كرت 500 ريال', 'كرت 1000 ريال', 'كرت 4000 ريال VIP'],
  },
  {
    id: 'dist-4',
    name: 'محل الفخامة للإلكترونيات والألعاب',
    ownerName: 'عبدالرحمن باحاج',
    neighborhood: 'سوق مأرب العام',
    city: 'وسط مأرب',
    address: 'مدخل السوق العام، بجوار البريد، المحل رقم 14',
    phone: '+967 770 112 233',
    whatsapp: '967770112233',
    openHours: '9:00 ص – 11:00 م',
    structuredHours: {
      openTime: '09:00',
      closeTime: '23:00',
      daysLabel: 'السبت إلى الخميس',
    },
    lat: 15.4570,
    lng: 45.3280,
    isVerified: true,
    isPlaceholder: true,
    availableCards: ['كرت 1000 ريال', 'كرت 4000 ريال VIP'],
  },
  {
    id: 'dist-5',
    name: 'بقالة الوفاء السريعة',
    ownerName: 'حسام العدني',
    neighborhood: 'حي اليرموك - تقاطع النور',
    city: 'مأرب',
    address: 'شارع اليرموك المتفرع، عمارة السلام 3، مأرب',
    phone: '+967 777 444 888',
    whatsapp: '967777444888',
    openHours: '6:00 ص – 12:30 ليلاً',
    structuredHours: {
      openTime: '06:00',
      closeTime: '00:30',
      daysLabel: 'يومياً',
    },
    lat: 15.4680,
    lng: 45.3150,
    isVerified: true,
    isPlaceholder: true,
    availableCards: ['كرت 200 ريال', 'كرت 500 ريال'],
  },
];

/**
 * Determines whether a distributor is currently open based on local Yemen time (UTC+3)
 */
export function isDistributorOpenNow(point: DistributorPoint): boolean {
  if (point.structuredHours?.is24Hours) return true;
  if (!point.structuredHours) return true; // Default to assumed open

  // Use Yemen time (UTC+3)
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const yemenMinutesTotal = ((utcHours + 3) % 24) * 60 + utcMinutes;

  const [openH, openM] = point.structuredHours.openTime.split(':').map(Number);
  const [closeH, closeM] = point.structuredHours.closeTime.split(':').map(Number);

  const openTotal = (openH ?? 8) * 60 + (openM ?? 0);
  const closeTotal = (closeH ?? 23) * 60 + (closeM ?? 0);

  if (closeTotal < openTotal) {
    // Closes past midnight (e.g. 07:00 to 01:00)
    return yemenMinutesTotal >= openTotal || yemenMinutesTotal < closeTotal;
  }

  return yemenMinutesTotal >= openTotal && yemenMinutesTotal <= closeTotal;
}

/**
 * Haversine formula to compute distance between two coordinates in Kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
