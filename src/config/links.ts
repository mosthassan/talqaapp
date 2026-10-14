/**
 * Talqa Net - Links Configuration
 * Single Source of Truth (مصدر الحقيقة الوحيد للروابط)
 * 
 * Strict rule: All components and services must import links from this file.
 * Do not hardcode any URL, phone number, or local endpoint anywhere else.
 */

export const NETWORK_LINKS = {
  // Hotspot Portal URLs (Active only when connected to Talqa Net Wi-Fi)
  portal: {
    login: 'http://t.net',
    fallbackLogin: 'http://10.5.50.1/login',
    status: 'http://t.net/status',
    logout: 'http://t.net/logout',
    hostname: 't.net',
    ipGateway: '10.5.50.1',
  },

  // Production App Domain
  app: {
    production: 'https://talqanet.vercel.app',
  },

  // Customer Care & Social Support
  support: {
    whatsappNumber: '967718097168',
    whatsappUrl: 'https://wa.me/967718097168',
    whatsappMessageUrl: (message: string) =>
      `https://wa.me/967718097168?text=${encodeURIComponent(message)}`,
    phoneRaw: '+967 718 097 168',
    phoneTel: 'tel:+967718097168',
    telegram: 'https://t.me/talqanet',
    facebook: 'https://facebook.com/talqanet',
  },

  // Developer Attribution (Displayed exclusively in "More" footer)
  developer: {
    name: 'م/ مصطفى حسان',
    website: 'https://samtecai.com',
    whatsappNumber: '967770446040',
    whatsappUrl: 'https://wa.me/967770446040',
  },

  // Local Network Services (LAN only - Free service without card or internet)
  localServer: {
    mediaServer: 'http://192.168.50.2:8096',
    lanPlayerUrl: 'http://192.168.50.2:8080/files/player.html',
    downloadsBase: 'http://192.168.50.2:8080/files/',
    downloads: {
      apk: 'http://192.168.50.2:8080/files/talqa-net.apk',
      pubg: 'http://192.168.50.2:8080/files/pubg-update.zip',
      freefire: 'http://192.168.50.2:8080/files/freefire.apk',
    },
    hlsBase: 'http://192.168.50.2:8888/live/',
    streams: {
      bein1: 'http://192.168.50.2:8888/live/bein1/',
      bein2: 'http://192.168.50.2:8888/live/bein2/',
      ssc1: 'http://192.168.50.2:8888/live/ssc1/',
    },
  },

  // Firebase Configuration Reference
  firebase: {
    projectId: 'talqanet-cf3e1',
  },
} as const;

export type NetworkLinks = typeof NETWORK_LINKS;
