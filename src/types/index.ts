/**
 * Talqa Net - Application Types & Domain Contracts
 * Fully typed contracts for Packages, Distributors, Lounge, Channels, and Speed Tests
 */

export type PackageCategory = 'hours' | 'daily' | 'weekly' | 'monthly';

export interface CardPackage {
  id: string;
  name: string;
  category: PackageCategory;
  categoryLabel: string;
  price: number;
  currency: string;
  durationLabel: string;
  validityDaysLabel: string;
  dataLimitLabel: string;
  dataLimitMB: number;
  speedLimitLabel: string;
  badge?: string;
  popular?: boolean;
  colorTheme: 'blue' | 'emerald' | 'amber' | 'indigo' | 'violet';
  features: string[];
}

export interface StructuredHours {
  openTime: string; // e.g. "08:00"
  closeTime: string; // e.g. "23:00"
  is24Hours?: boolean;
  daysLabel: string; // e.g. "يومياً"
}

export interface DistributorPoint {
  id: string;
  name: string;
  ownerName: string;
  neighborhood: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  openHours: string;
  structuredHours?: StructuredHours;
  lat: number;
  lng: number;
  isVerified: boolean;
  isPlaceholder: boolean; // Flagged true until confirmed by network owner in Phase 2
  availableCards: string[];
  distanceKm?: number;
}

export interface NetworkAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'promotion' | 'info' | 'maintenance';
  date: string;
  active: boolean;
  linkText?: string;
  linkUrl?: string;
}

export interface LoungeItem {
  id: string;
  title: string;
  category: 'media' | 'downloads' | 'tools';
  categoryLabel: string;
  description: string;
  url: string;
  iconName: string;
  requiresLan: boolean;
  enabled: boolean;
  fileSize?: string;
}

// Kept for backward compatibility
export type LocalMediaItem = LoungeItem;

export interface LiveChannel {
  id: string;
  name: string;
  streamUrl: string;
  httpsUrl?: string;
  logo?: string;
  category: string;
  enabled: boolean;
  requiresLan: boolean;
  status: 'live' | 'upcoming' | 'offline';
  matchTitle?: string;
  tournament?: string;
}

export interface LoyaltyRules {
  requiredCardsCount: number; // 10 consumed cards to enter lucky wheel
  prizeTierDescription: string;
}

export interface AppSettings {
  networkName: string;
  supportPhone: string;
  supportWhatsapp: string;
  portalUrl: string;
  statusUrl: string;
  announcementTicker?: string;
}

/**
 * Abstract Content Repository Contract
 * Allows switching seamlessly between Static In-Memory Seeds and Supabase Backend
 */
export interface ContentRepository {
  getPackages(): Promise<CardPackage[]>;
  getDistributors(): Promise<DistributorPoint[]>;
  getAnnouncements(): Promise<NetworkAnnouncement[]>;
  getLoungeItems(): Promise<LoungeItem[]>;
  getChannels(): Promise<LiveChannel[]>;
  getAppSettings(): Promise<AppSettings>;
}
