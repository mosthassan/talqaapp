import { LoungeItem } from '../types';
import { NETWORK_LINKS } from '../config/links';

/**
 * Lounge Catalog - Entertainment and Local High-Speed Downloads
 * 
 * Strict policy: Since direct HTTPS fetch to local HTTP LAN endpoints is blocked by
 * modern browsers (Mixed Content Security), items are honest cards with external navigation
 * (window navigation / target="_blank").
 */
export const INITIAL_LOUNGE_ITEMS: LoungeItem[] = [
  {
    id: 'media-jellyfin',
    title: 'سيرفر الأفلام والمسلسلات (Jellyfin)',
    category: 'media',
    categoryLabel: 'سينما محلية LAN',
    description: 'مكتبة ترفيهية ضخمة تضم أحدث الأفلام والمسلسلات والبرامج الوثائقية بدقة فائقة وبدون استهلاك رصيد كرتك.',
    url: NETWORK_LINKS.localServer.mediaServer,
    iconName: 'film',
    requiresLan: true,
    enabled: true,
  },
  {
    id: 'download-apk',
    title: 'تطبيق طلقة نت الرسمي (أندرويد APK)',
    category: 'downloads',
    categoryLabel: 'تطبيقات الشبكة',
    description: 'حزمة تثبيت التطبيق الأصلية لأجهزة أندرويد مع تحديثات مباشرة وتصفح أوفلاين فائق السرعة.',
    url: NETWORK_LINKS.localServer.downloads.apk,
    iconName: 'download',
    fileSize: '15.4 MB',
    requiresLan: true,
    enabled: true,
  },
  {
    id: 'download-pubg',
    title: 'تحديث ببجي موبايل السريع (PUBG Mobile)',
    category: 'downloads',
    categoryLabel: 'ألعاب باتل رويال',
    description: 'ملف تحديث اللعبة الأخير جاهز للتحميل بأقصى سرعة ألياف ضوئية محلية وبدون استهلاك كرت الإنترنت.',
    url: NETWORK_LINKS.localServer.downloads.pubg,
    iconName: 'gamepad',
    fileSize: '745 MB',
    requiresLan: true,
    enabled: true,
  },
  {
    id: 'download-freefire',
    title: 'حزمة فري فاير السريعة (Free Fire APK)',
    category: 'downloads',
    categoryLabel: 'ألعاب باتل رويال',
    description: 'تحميل مباشر للعبة فري فاير بنسختها الحديثة من السيرفر المحلي في مأرب بسرعة قصوى.',
    url: NETWORK_LINKS.localServer.downloads.freefire,
    iconName: 'zap',
    fileSize: '480 MB',
    requiresLan: true,
    enabled: true,
  },
];
