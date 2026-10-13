/**
 * Talqa Net - Content Repository Implementation
 * Dual-Mode: (A) Bundled Static Seed (default offline-first) & (B) Supabase Live Backend
 */

import {
  CardPackage,
  DistributorPoint,
  NetworkAnnouncement,
  LoungeItem,
  LiveChannel,
  AppSettings,
  ContentRepository,
} from '@/src/types';
import { CARD_PACKAGES } from '@/src/data/packages';
import { PROVISIONAL_DISTRIBUTORS } from '@/src/data/distributors';
import { NETWORK_ANNOUNCEMENTS } from '@/src/data/announcements';
import { INITIAL_LOUNGE_ITEMS } from '@/src/data/lounge';
import { INITIAL_CHANNELS } from '@/src/data/channels';
import { NETWORK_LINKS } from '@/src/config/links';

const CACHE_KEY_PREFIX = 'talqa_cache_v2_';

function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCached<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota warnings
  }
}

/**
 * Static Seed Repository: 100% reliable, zero-config, works offline.
 */
export class StaticSeedRepository implements ContentRepository {
  async getPackages(): Promise<CardPackage[]> {
    const cached = getCached<CardPackage[]>('packages');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    setCached('packages', CARD_PACKAGES);
    return CARD_PACKAGES;
  }

  async getDistributors(): Promise<DistributorPoint[]> {
    const cached = getCached<DistributorPoint[]>('distributors');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    setCached('distributors', PROVISIONAL_DISTRIBUTORS);
    return PROVISIONAL_DISTRIBUTORS;
  }

  async getAnnouncements(): Promise<NetworkAnnouncement[]> {
    const cached = getCached<NetworkAnnouncement[]>('announcements');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    setCached('announcements', NETWORK_ANNOUNCEMENTS);
    return NETWORK_ANNOUNCEMENTS;
  }

  async getLoungeItems(): Promise<LoungeItem[]> {
    const cached = getCached<LoungeItem[]>('lounge_items');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    setCached('lounge_items', INITIAL_LOUNGE_ITEMS);
    return INITIAL_LOUNGE_ITEMS;
  }

  async getChannels(): Promise<LiveChannel[]> {
    const cached = getCached<LiveChannel[]>('channels');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    setCached('channels', INITIAL_CHANNELS);
    return INITIAL_CHANNELS;
  }

  async getAppSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      networkName: 'طلقة نت - مأرب',
      supportPhone: NETWORK_LINKS.support.phoneRaw,
      supportWhatsapp: NETWORK_LINKS.support.whatsappNumber,
      portalUrl: NETWORK_LINKS.portal.login,
      statusUrl: NETWORK_LINKS.portal.status,
      announcementTicker: 'شبكة طلقة نت ... إنترنت فضائي فائق السرعة عبر ستارلينك في مأرب',
    };
    return defaultSettings;
  }
}

/**
 * Supabase Repository: Reads live data from Supabase REST endpoint when configured,
 * falling back automatically to cached seed if unreachable or offline.
 */
export class SupabaseRepository implements ContentRepository {
  private fallback = new StaticSeedRepository();
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor(url: string, anonKey: string) {
    this.supabaseUrl = url.replace(/\/$/, '');
    this.supabaseAnonKey = anonKey;
  }

  private async fetchTable<T>(tableName: string, queryParams: string = ''): Promise<T[] | null> {
    try {
      const endpoint = `${this.supabaseUrl}/rest/v1/${tableName}?${queryParams}`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: this.supabaseAnonKey,
          Authorization: `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return null;
      return (await res.json()) as T[];
    } catch {
      return null;
    }
  }

  async getPackages(): Promise<CardPackage[]> {
    const live = await this.fetchTable<CardPackage>('packages', 'is_published=eq.true&order=sort_order.asc');
    if (live && live.length > 0) {
      setCached('packages', live);
      return live;
    }
    return this.fallback.getPackages();
  }

  async getDistributors(): Promise<DistributorPoint[]> {
    const live = await this.fetchTable<DistributorPoint>('distributors', 'is_published=eq.true&order=sort_order.asc');
    if (live && live.length > 0) {
      setCached('distributors', live);
      return live;
    }
    return this.fallback.getDistributors();
  }

  async getAnnouncements(): Promise<NetworkAnnouncement[]> {
    const live = await this.fetchTable<NetworkAnnouncement>('announcements', 'active=eq.true&order=sort_order.asc');
    if (live && live.length > 0) {
      setCached('announcements', live);
      return live;
    }
    return this.fallback.getAnnouncements();
  }

  async getLoungeItems(): Promise<LoungeItem[]> {
    const live = await this.fetchTable<LoungeItem>('lounge_items', 'enabled=eq.true&order=sort_order.asc');
    if (live && live.length > 0) {
      setCached('lounge_items', live);
      return live;
    }
    return this.fallback.getLoungeItems();
  }

  async getChannels(): Promise<LiveChannel[]> {
    const live = await this.fetchTable<LiveChannel>('channels', 'order=sort_order.asc');
    if (live && live.length > 0) {
      setCached('channels', live);
      return live;
    }
    return this.fallback.getChannels();
  }

  async getAppSettings(): Promise<AppSettings> {
    const live = await this.fetchTable<AppSettings>('app_settings', 'limit=1');
    if (live && live.length > 0 && live[0]) {
      return live[0];
    }
    return this.fallback.getAppSettings();
  }
}

/**
 * Firestore Repository: Direct Google Cloud Firestore integration.
 * Connects to collections: packages, distributors, announcements, channels, lounge_items, app_settings.
 * Falls back transparently to StaticSeedRepository on connection or permission failure.
 */
export class FirestoreRepository implements ContentRepository {
  private fallback = new StaticSeedRepository();

  private async fetchCollection<T>(collectionName: string): Promise<T[] | null> {
    try {
      const { getFirebaseFirestore } = await import('@/src/lib/firebase/config');
      const { collection, getDocs } = await import('firebase/firestore');
      const db = getFirebaseFirestore();
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) return null;
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
    } catch {
      return null;
    }
  }

  async getPackages(): Promise<CardPackage[]> {
    const live = await this.fetchCollection<CardPackage>('packages');
    if (live && live.length > 0) {
      setCached('packages', live);
      return live;
    }
    return this.fallback.getPackages();
  }

  async getDistributors(): Promise<DistributorPoint[]> {
    const live = await this.fetchCollection<DistributorPoint>('distributors');
    if (live && live.length > 0) {
      setCached('distributors', live);
      return live;
    }
    return this.fallback.getDistributors();
  }

  async getAnnouncements(): Promise<NetworkAnnouncement[]> {
    const live = await this.fetchCollection<NetworkAnnouncement>('announcements');
    if (live && live.length > 0) {
      setCached('announcements', live);
      return live;
    }
    return this.fallback.getAnnouncements();
  }

  async getLoungeItems(): Promise<LoungeItem[]> {
    const live = await this.fetchCollection<LoungeItem>('lounge_items');
    if (live && live.length > 0) {
      setCached('lounge_items', live);
      return live;
    }
    return this.fallback.getLoungeItems();
  }

  async getChannels(): Promise<LiveChannel[]> {
    const live = await this.fetchCollection<LiveChannel>('channels');
    if (live && live.length > 0) {
      setCached('channels', live);
      return live;
    }
    return this.fallback.getChannels();
  }

  async getAppSettings(): Promise<AppSettings> {
    const live = await this.fetchCollection<AppSettings>('app_settings');
    if (live && live.length > 0 && live[0]) {
      return live[0];
    }
    return this.fallback.getAppSettings();
  }
}

let repositoryInstance: ContentRepository | null = null;

/**
 * Returns the active ContentRepository instance.
 * Automatically chooses FirestoreRepository if Firebase is configured (or Supabase/Static as fallback).
 */
export function getContentRepository(): ContentRepository {
  if (repositoryInstance) return repositoryInstance;

  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (firebaseApiKey || firebaseProjectId) {
    repositoryInstance = new FirestoreRepository();
  } else {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      repositoryInstance = new SupabaseRepository(supabaseUrl, supabaseKey);
    } else {
      repositoryInstance = new StaticSeedRepository();
    }
  }

  return repositoryInstance;
}

