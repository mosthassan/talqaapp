import { NetworkAnnouncement } from '../types';

export const NETWORK_ANNOUNCEMENTS: NetworkAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'تحديث محطة ستارلينك الفضائية في مأرب',
    content: 'استقرار كامل وسرعات متوازنة عبر أحدث محطات ستارلينك في مأرب مع توجيه مباشر للبث والألعاب.',
    type: 'promotion',
    date: 'اليوم',
    active: true,
    linkText: 'عرض الكروت',
  },
  {
    id: 'ann-2',
    title: 'خوادم التوجيه المباشر في مأرب',
    content: 'تحسين مسارات الاستجابة للألعاب عبر منظومة ميكروتك المحلية لضمان بينج منخفض ومستقر.',
    type: 'info',
    date: 'مستمر',
    active: true,
  },
];
