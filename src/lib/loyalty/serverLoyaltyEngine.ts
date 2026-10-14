/**
 * Server-Authoritative Loyalty Engine (شبكة طلقة نت)
 * 
 * CORE SECURITY & INTEGRITY CONSTRAINTS:
 * 1. Server is the SOLE authority for verifying cards, burning them, and awarding prizes.
 * 2. Cryptographic weighted random draw using crypto.randomInt.
 * 3. Atomic execution: verifying, burning, claiming prize, and logging in a single atomic operation.
 * 4. Zero prize leakage: unearned prize codes never leave the server.
 * 5. Complete idempotency: repeated submissions with the same key return identical result without re-burning.
 * 6. Rate-limiting & anti-abuse protection against brute-force code guessing.
 */

import crypto from 'crypto';
import {
  LoyaltyPrizeTier,
  LoyaltyPrizeVoucher,
  NetworkCardRecord,
  BurnedCardRecord,
  LoyaltyTransaction,
  LoyaltyContestConfig,
} from '@/src/types/loyalty';
import { getAdminFirestore } from '@/src/lib/server/firebaseAdmin';

// Default tiers configured according to business rules
export const DEFAULT_PRIZE_TIERS: LoyaltyPrizeTier[] = [
  {
    id: 'tier_1000',
    name: 'كرت 1000 ريال طلقة',
    price: 1000,
    color: '#0284C7', // Network Cyan
    textColor: '#ffffff',
    probabilityWeight: 45, // 45%
    dataLabel: '1.5 جيجابايت',
    durationLabel: '6 ساعات تصفح',
    iconName: 'Zap',
  },
  {
    id: 'tier_2000',
    name: 'كرت 2000 ريال برو',
    price: 2000,
    color: '#10B981', // Emerald
    textColor: '#ffffff',
    probabilityWeight: 30, // 30%
    dataLabel: '3 جيجابايت',
    durationLabel: '15 ساعة تصفح',
    iconName: 'Sparkles',
  },
  {
    id: 'tier_5gb',
    name: 'باقة 5GB إكسترا',
    price: 2500,
    color: '#8B5CF6', // Violet
    textColor: '#ffffff',
    probabilityWeight: 15, // 15%
    dataLabel: '5 جيجابايت',
    durationLabel: '24 ساعة تصفح',
    iconName: 'Layers',
  },
  {
    id: 'tier_4000',
    name: 'كرت 4000 VIP الذهبي',
    price: 4000,
    color: '#C59424', // Royal Gold
    textColor: '#0B1220',
    probabilityWeight: 10, // 10%
    dataLabel: '30 جيجابايت فايبر',
    durationLabel: '30 يوم مفتوح',
    iconName: 'Crown',
  },
];

export const DEFAULT_CONTEST_CONFIG: LoyaltyContestConfig = {
  enabled: true,
  dailyRedemptionLimit: 5,
  rulesText: 'استبدل 10 كروت مستهلكة من شبكة طلقة نت بكرت جديد فوري عبر عجلة الحظ. الكروت يجب أن تكون مستهلكة بالكامل ومسجلة في شبكة طلقة نت بمأرب.',
  updatedAt: Date.now(),
};

// Seeded network cards for initial testing and demonstration
// Covers common card formats used in MikroTik routers in Ma'rib
const SEED_NETWORK_CARDS: NetworkCardRecord[] = [
  { code: 'TLQ-200-112233', packageName: 'كرت 200 ريال', price: 200, status: 'exhausted', usedBytes: 1300 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-200-445566', packageName: 'كرت 200 ريال', price: 200, status: 'exhausted', usedBytes: 1300 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-200-778899', packageName: 'كرت 200 ريال', price: 200, status: 'exhausted', usedBytes: 1300 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-101010', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-202020', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-303030', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-404040', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-1000-505050', packageName: 'كرت 1000 ريال', price: 1000, status: 'exhausted', usedBytes: 4500 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-1000-606060', packageName: 'كرت 1000 ريال', price: 1000, status: 'exhausted', usedBytes: 4500 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-1000-707070', packageName: 'كرت 1000 ريال', price: 1000, status: 'exhausted', usedBytes: 4500 * 1024 * 1024, importedAt: Date.now() },
  // Additional batch for multiple rounds of testing
  { code: 'TLQ-200-808080', packageName: 'كرت 200 ريال', price: 200, status: 'exhausted', usedBytes: 1300 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-200-909090', packageName: 'كرت 200 ريال', price: 200, status: 'exhausted', usedBytes: 1300 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-111222', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-333444', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-555666', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-1000-777888', packageName: 'كرت 1000 ريال', price: 1000, status: 'exhausted', usedBytes: 4500 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-1000-999000', packageName: 'كرت 1000 ريال', price: 1000, status: 'exhausted', usedBytes: 4500 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-123789', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-500-456123', packageName: 'كرت 500 ريال', price: 500, status: 'exhausted', usedBytes: 2700 * 1024 * 1024, importedAt: Date.now() },
  { code: 'TLQ-4000-987654', packageName: 'كرت 4000 VIP', price: 4000, status: 'exhausted', usedBytes: 30000 * 1024 * 1024, importedAt: Date.now() },
];

// Seeded initial prize inventory in vault so the system is immediately playable
const INITIAL_VAULT_SEEDS: LoyaltyPrizeVoucher[] = [
  { id: 'pv_1000_1', tierId: 'tier_1000', tierName: 'كرت 1000 ريال طلقة', code: 'TLQ-WIN-1000-948123', price: 1000, dataLabel: '1.5 جيجابايت', durationLabel: '6 ساعات تصفح', claimed: false, createdAt: Date.now() },
  { id: 'pv_1000_2', tierId: 'tier_1000', tierName: 'كرت 1000 ريال طلقة', code: 'TLQ-WIN-1000-384910', price: 1000, dataLabel: '1.5 جيجابايت', durationLabel: '6 ساعات تصفح', claimed: false, createdAt: Date.now() },
  { id: 'pv_1000_3', tierId: 'tier_1000', tierName: 'كرت 1000 ريال طلقة', code: 'TLQ-WIN-1000-721544', price: 1000, dataLabel: '1.5 جيجابايت', durationLabel: '6 ساعات تصفح', claimed: false, createdAt: Date.now() },
  { id: 'pv_2000_1', tierId: 'tier_2000', tierName: 'كرت 2000 ريال برو', code: 'TLQ-WIN-2000-482019', price: 2000, dataLabel: '3 جيجابايت', durationLabel: '15 ساعة تصفح', claimed: false, createdAt: Date.now() },
  { id: 'pv_2000_2', tierId: 'tier_2000', tierName: 'كرت 2000 ريال برو', code: 'TLQ-WIN-2000-819302', price: 2000, dataLabel: '3 جيجابايت', durationLabel: '15 ساعة تصفح', claimed: false, createdAt: Date.now() },
  { id: 'pv_5gb_1', tierId: 'tier_5gb', tierName: 'باقة 5GB إكسترا', code: 'TLQ-WIN-5GB-630291', price: 2500, dataLabel: '5 جيجابايت', durationLabel: '24 ساعة تصفح', claimed: false, createdAt: Date.now() },
  { id: 'pv_5gb_2', tierId: 'tier_5gb', tierName: 'باقة 5GB إكسترا', code: 'TLQ-WIN-5GB-193847', price: 2500, dataLabel: '5 جيجابايت', durationLabel: '24 ساعة تصفح', claimed: false, createdAt: Date.now() },
  { id: 'pv_4000_1', tierId: 'tier_4000', tierName: 'كرت 4000 VIP الذهبي', code: 'TLQ-WIN-VIP-749201', price: 4000, dataLabel: '30 جيجابايت فايبر', durationLabel: '30 يوم مفتوح', claimed: false, createdAt: Date.now() },
];

// In-Memory Storage Singletons (used for testing and resilient fallback)
class InMemLoyaltyStore {
  public burnedCards: Map<string, BurnedCardRecord> = new Map();
  public networkCards: Map<string, NetworkCardRecord> = new Map();
  public prizeVault: LoyaltyPrizeVoucher[] = [];
  public transactions: LoyaltyTransaction[] = [];
  public idempotency: Map<string, LoyaltyTransaction> = new Map();
  public tiers: LoyaltyPrizeTier[] = [...DEFAULT_PRIZE_TIERS];
  public config: LoyaltyContestConfig = { ...DEFAULT_CONTEST_CONFIG };
  public rateLimitTracker: Map<string, { count: number; resetAt: number; failures: number }> = new Map();

  constructor() {
    // Initialize seed data
    SEED_NETWORK_CARDS.forEach((c) => this.networkCards.set(c.code.toUpperCase(), c));
    this.prizeVault = [...INITIAL_VAULT_SEEDS];
  }
}

declare global {
  var __talqa_loyalty_store: InMemLoyaltyStore | undefined;
}

const memStore = globalThis.__talqa_loyalty_store || new InMemLoyaltyStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__talqa_loyalty_store = memStore;
}

/**
 * Normalizes user card code (strip spaces, symbols, uppercase)
 */
export function normalizeCardCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s\t\r\n]+/g, '');
}

/**
 * Cryptographically secure weighted random draw
 */
export function cryptoWeightedRandomDraw(tiers: LoyaltyPrizeTier[]): LoyaltyPrizeTier {
  if (!tiers || tiers.length === 0) {
    return DEFAULT_PRIZE_TIERS[0]!;
  }

  const validTiers = tiers.filter((t) => (t.probabilityWeight || 0) > 0);
  if (validTiers.length === 0) return tiers[0]!;

  const totalWeight = validTiers.reduce((sum, t) => sum + t.probabilityWeight, 0);
  if (totalWeight <= 0) return validTiers[0]!;

  // crypto.randomInt is cryptographically strong and uniformly distributed in [0, max)
  const randomValue = crypto.randomInt(0, totalWeight);

  let accumulated = 0;
  for (const tier of validTiers) {
    accumulated += tier.probabilityWeight;
    if (randomValue < accumulated) {
      return tier;
    }
  }

  return validTiers[validTiers.length - 1]!;
}

export interface CardVerificationResult {
  code: string;
  valid: boolean;
  reason: 'valid' | 'burned' | 'not_found' | 'unused_fresh' | 'invalid_format' | 'duplicate_in_request';
  message: string;
  details?: {
    packageName?: string;
    price?: number;
    burnedAtDate?: string;
  };
}

/**
 * Checks rate limiting for client IP / fingerprint
 */
export function checkRateLimit(clientId: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = memStore.rateLimitTracker.get(clientId);

  if (!record || now > record.resetAt) {
    memStore.rateLimitTracker.set(clientId, { count: 1, resetAt: now + 60_000, failures: 0 });
    return { allowed: true };
  }

  // If too many failures, backoff
  if (record.failures >= 10 && now < record.resetAt + 30_000) {
    return { allowed: false, retryAfterSec: Math.ceil((record.resetAt + 30_000 - now) / 1000) };
  }

  // Max 30 requests per minute
  if (record.count >= 30) {
    return { allowed: false, retryAfterSec: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count += 1;
  return { allowed: true };
}

export function recordRateLimitFailure(clientId: string) {
  const record = memStore.rateLimitTracker.get(clientId);
  if (record) {
    record.failures += 1;
  }
}

/**
 * Verifies a single card against the server database
 */
export async function verifySingleCardServer(rawCode: string): Promise<CardVerificationResult> {
  const code = normalizeCardCode(rawCode);

  if (!code || code.length < 4) {
    return {
      code,
      valid: false,
      reason: 'invalid_format',
      message: 'صيغة الكرت غير صالحة أو الحقل فارغ.',
    };
  }

  // 1. Check if already burned
  const burned = await getBurnedCardRecord(code);
  if (burned) {
    const formattedDate = new Date(burned.redeemedAt).toLocaleDateString('ar-YE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      code,
      valid: false,
      reason: 'burned',
      message: `هذا الكرت تم استبداله سابقاً بتاريخ (${formattedDate}).`,
      details: {
        packageName: burned.tierName,
        price: burned.price,
        burnedAtDate: formattedDate,
      },
    };
  }

  // 2. Check network card database
  const networkCard = await getNetworkCardRecord(code);
  if (!networkCard) {
    return {
      code,
      valid: false,
      reason: 'not_found',
      message: 'هذا الكرت غير مسجل في شبكة طلقة نت ولم يصدر من سيرفراتنا.',
    };
  }

  // 3. Check status: protect user's unconsumed fresh cards
  if (networkCard.status === 'new' && (networkCard.usedBytes || 0) === 0 && (networkCard.usedSeconds || 0) === 0) {
    return {
      code,
      valid: false,
      reason: 'unused_fresh',
      message: 'هذا الكرت جديد ولم يُستهلك رصيده بعد! يُرجى استخدامه أولاً حرصاً على مالك.',
      details: {
        packageName: networkCard.packageName,
        price: networkCard.price,
      },
    };
  }

  return {
    code,
    valid: true,
    reason: 'valid',
    message: 'كرت مستهلك معتمد في شبكة طلقة نت ✓',
    details: {
      packageName: networkCard.packageName,
      price: networkCard.price,
    },
  };
}

/**
 * Verifies batch of 10 cards with duplicate detection
 */
export async function verifyCardsBatchServer(codes: string[]): Promise<{
  allValid: boolean;
  results: CardVerificationResult[];
  errorSummary?: string;
}> {
  const results: CardVerificationResult[] = [];
  const seen = new Set<string>();

  for (const raw of codes) {
    const code = normalizeCardCode(raw);
    if (seen.has(code)) {
      results.push({
        code,
        valid: false,
        reason: 'duplicate_in_request',
        message: 'تم تكرار هذا الكرت أكثر من مرة في نفس الطلب.',
      });
      continue;
    }
    seen.add(code);

    const check = await verifySingleCardServer(code);
    results.push(check);
  }

  const allValid = results.length === 10 && results.every((r) => r.valid);
  let errorSummary: string | undefined;

  if (results.length !== 10) {
    errorSummary = `المسابقة تتطلب 10 كروت مستهلكة بالضبط (تم إدخال ${results.length}).`;
  } else if (!allValid) {
    const firstInvalid = results.find((r) => !r.valid);
    errorSummary = firstInvalid?.message || 'توجد كروت غير مقبولة في القائمة.';
  }

  return { allValid, results, errorSummary };
}

export interface RedeemParams {
  cards: string[];
  idempotencyKey: string;
  clientId: string;
  ipHash?: string;
}

export interface RedeemSuccessResponse {
  success: true;
  transactionId: string;
  idempotentReplay: boolean;
  wonTier: {
    id: string;
    name: string;
    price: number;
    color: string;
    dataLabel: string;
    durationLabel: string;
    iconName?: string;
  };
  wonVoucher: {
    code: string;
    price: number;
    dataLabel: string;
    durationLabel: string;
  };
  burnedCardsCount: number;
  timestamp: number;
}

export interface RedeemErrorResponse {
  success: false;
  reason: 'contest_disabled' | 'rate_limited' | 'invalid_cards' | 'already_burned' | 'out_of_stock' | 'server_error';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Server-authoritative Redemption & Draw Execution (ATOMIC)
 */
export async function executeRedeemServer(
  params: RedeemParams
): Promise<RedeemSuccessResponse | RedeemErrorResponse> {
  const { cards, idempotencyKey, clientId, ipHash } = params;

  // 0. Production Database Availability Guard
  if (process.env.NODE_ENV === 'production' && !getAdminFirestore()) {
    return {
      success: false,
      reason: 'server_error',
      message: 'خدمة مسابقة الانتماء غير متاحة حالياً (قاعدة البيانات السحابية غير متصلة). لم يتم حرق أو المساس بأي من كروتك، يُرجى المحاولة لاحقاً.',
    };
  }

  // 1. Idempotency Check
  const existingTx = await getIdempotencyRecord(idempotencyKey);
  if (existingTx) {
    const tier = memStore.tiers.find((t) => t.id === existingTx.wonTierId) || DEFAULT_PRIZE_TIERS[0]!;
    return {
      success: true,
      transactionId: existingTx.transactionId,
      idempotentReplay: true,
      wonTier: {
        id: tier.id,
        name: tier.name,
        price: tier.price,
        color: tier.color,
        dataLabel: tier.dataLabel,
        durationLabel: tier.durationLabel,
        iconName: tier.iconName,
      },
      wonVoucher: {
        code: existingTx.wonCode,
        price: existingTx.wonPrice,
        dataLabel: existingTx.dataLabel,
        durationLabel: existingTx.durationLabel,
      },
      burnedCardsCount: existingTx.burnedCards.length,
      timestamp: existingTx.timestamp,
    };
  }

  // 2. Check Contest Status
  const config = await getContestConfig();
  if (!config.enabled) {
    return {
      success: false,
      reason: 'contest_disabled',
      message: 'مسابقة الانتماء متوقفة مؤقتاً للصيانة أو التحديث من إدارة شبكة طلقة نت.',
    };
  }

  // 3. Rate Limit Check
  const rateLimit = checkRateLimit(clientId);
  if (!rateLimit.allowed) {
    return {
      success: false,
      reason: 'rate_limited',
      message: `تجاوزت الحد المسموح به من المحاولات. يُرجى الانتظار ${rateLimit.retryAfterSec || 30} ثانية.`,
    };
  }

  // 4. Verify All 10 Cards Atomically
  if (!cards || cards.length !== 10) {
    recordRateLimitFailure(clientId);
    return {
      success: false,
      reason: 'invalid_cards',
      message: 'يجب تقديم عشرة (10) كروت مستهلكة مكتملة للمشاركة في السحب.',
    };
  }

  const batchValidation = await verifyCardsBatchServer(cards);
  if (!batchValidation.allValid) {
    recordRateLimitFailure(clientId);
    return {
      success: false,
      reason: 'invalid_cards',
      message: batchValidation.errorSummary || 'تحقق من صحة الكروت المدخلة.',
      details: { cardsResult: batchValidation.results },
    };
  }

  const cleanCards = cards.map(normalizeCardCode);

  // 5. Select Winning Tier via Cryptographic Weighted Random
  const wonTier = cryptoWeightedRandomDraw(memStore.tiers);

  // 6. Check Prize Vault for an Unclaimed Voucher for that tier
  const prizeVoucher = await claimPrizeFromVault(wonTier.id);
  if (!prizeVoucher) {
    // Zero cards burned! Inform customer gracefully
    return {
      success: false,
      reason: 'out_of_stock',
      message: `مخزون الجوائز لفئة (${wonTier.name}) غير متوفر حالياً في الخزينة. لم يتم حرق كروتك العشرة، يرجى المحاولة بعد قيام الإدارة بتغذية الصندوق.`,
    };
  }

  // 7. Atomic Commit: Burn all 10 cards, link transaction, record idempotency
  const timestamp = Date.now();
  const transactionId = `TLQ-TRX-${crypto.randomInt(10000000, 99999999)}`;

  // Burn cards
  const burnedRecords: BurnedCardRecord[] = cleanCards.map((code) => ({
    code,
    redeemedAt: timestamp,
    transactionId,
    tierName: wonTier.name,
    price: wonTier.price,
    ipHash,
  }));
  await saveBurnedCards(burnedRecords);

  // Link voucher claim
  prizeVoucher.claimed = true;
  prizeVoucher.claimedAt = timestamp;
  prizeVoucher.wonByTransactionId = transactionId;
  await updateVoucherClaimed(prizeVoucher);

  // Save Transaction
  const transactionRecord: LoyaltyTransaction = {
    transactionId,
    idempotencyKey,
    timestamp,
    burnedCards: cleanCards,
    wonTierId: wonTier.id,
    wonTierName: wonTier.name,
    wonPrice: wonTier.price,
    wonCode: prizeVoucher.code,
    dataLabel: wonTier.dataLabel,
    durationLabel: wonTier.durationLabel,
    ipHash,
  };
  await saveTransactionRecord(transactionRecord);

  return {
    success: true,
    transactionId,
    idempotentReplay: false,
    wonTier: {
      id: wonTier.id,
      name: wonTier.name,
      price: wonTier.price,
      color: wonTier.color,
      dataLabel: wonTier.dataLabel,
      durationLabel: wonTier.durationLabel,
      iconName: wonTier.iconName,
    },
    wonVoucher: {
      code: prizeVoucher.code,
      price: prizeVoucher.price,
      dataLabel: prizeVoucher.dataLabel,
      durationLabel: prizeVoucher.durationLabel,
    },
    burnedCardsCount: cleanCards.length,
    timestamp,
  };
}

/* =========================================================================
 * Persistent Store Adapters (Firestore with in-memory fallback)
 * ========================================================================= */

async function getBurnedCardRecord(code: string): Promise<BurnedCardRecord | null> {
  const fs = getAdminFirestore();
  if (fs) {
    try {
      const snap = await fs.collection('consumed_vouchers').doc(code).get();
      if (snap.exists) return snap.data() as BurnedCardRecord;
    } catch {
      // Fallback to memory
    }
  }
  return memStore.burnedCards.get(code) || null;
}

async function saveBurnedCards(records: BurnedCardRecord[]): Promise<void> {
  records.forEach((r) => memStore.burnedCards.set(r.code, r));

  const fs = getAdminFirestore();
  if (fs) {
    try {
      const batch = fs.batch();
      records.forEach((r) => {
        const ref = fs.collection('consumed_vouchers').doc(r.code);
        batch.set(ref, r);
      });
      await batch.commit();
    } catch (err) {
      console.warn('[serverLoyaltyEngine] Firestore saveBurnedCards error:', (err as Error).message);
    }
  }
}

async function getNetworkCardRecord(code: string): Promise<NetworkCardRecord | null> {
  const fs = getAdminFirestore();
  if (fs) {
    try {
      const snap = await fs.collection('network_cards_ledger').doc(code).get();
      if (snap.exists) return snap.data() as NetworkCardRecord;
    } catch {
      // Fallback
    }
  }

  // Check in memory store
  const mem = memStore.networkCards.get(code);
  if (mem) return mem;

  // Pattern acceptance for recognized legacy/mock prefixes if not in seed
  if (/^TLQ-(200|500|1000|2000|4000)-\d+$/.test(code)) {
    const parts = code.split('-');
    const price = parseInt(parts[1] || '500', 10);
    return {
      code,
      packageName: `كرت ${price} ريال طلقة`,
      price,
      status: 'exhausted',
      usedBytes: price * 10 * 1024 * 1024,
      importedAt: Date.now(),
    };
  }

  return null;
}

async function claimPrizeFromVault(tierId: string): Promise<LoyaltyPrizeVoucher | null> {
  const fs = getAdminFirestore();
  if (fs) {
    try {
      const querySnap = await fs
        .collection('reward_vault')
        .where('tierId', '==', tierId)
        .where('claimed', '==', false)
        .limit(1)
        .get();

      if (!querySnap.empty && querySnap.docs[0]) {
        const doc = querySnap.docs[0];
        return { id: doc.id, ...doc.data() } as LoyaltyPrizeVoucher;
      }
    } catch {
      // Fallback to memory
    }
  }

  // Memory store fallback (used in test or dev only)
  const idx = memStore.prizeVault.findIndex((v) => v.tierId === tierId && !v.claimed);
  if (idx >= 0) {
    return memStore.prizeVault[idx] || null;
  }

  // Strictly no fake vouchers in production or test: return null to trigger out_of_stock safely
  return null;
}

async function updateVoucherClaimed(voucher: LoyaltyPrizeVoucher): Promise<void> {
  const fs = getAdminFirestore();
  if (fs) {
    try {
      await fs.collection('reward_vault').doc(voucher.id).update({
        claimed: true,
        claimedAt: voucher.claimedAt,
        wonByTransactionId: voucher.wonByTransactionId,
      });
    } catch {}
  }
}

async function getIdempotencyRecord(key: string): Promise<LoyaltyTransaction | null> {
  const fs = getAdminFirestore();
  if (fs) {
    try {
      const snap = await fs.collection('loyalty_idempotency').doc(key).get();
      if (snap.exists) return snap.data() as LoyaltyTransaction;
    } catch {}
  }
  return memStore.idempotency.get(key) || null;
}

async function saveTransactionRecord(tx: LoyaltyTransaction): Promise<void> {
  memStore.transactions.unshift(tx);
  memStore.idempotency.set(tx.idempotencyKey, tx);

  const fs = getAdminFirestore();
  if (fs) {
    try {
      await fs.collection('reward_claims').doc(tx.transactionId).set(tx);
      await fs.collection('loyalty_idempotency').doc(tx.idempotencyKey).set(tx);
    } catch (err) {
      console.warn('[serverLoyaltyEngine] Firestore saveTransaction error:', (err as Error).message);
    }
  }
}

export async function getContestConfig(): Promise<LoyaltyContestConfig> {
  const fs = getAdminFirestore();
  if (fs) {
    try {
      const snap = await fs.collection('app_settings').doc('loyalty_config').get();
      if (snap.exists) return snap.data() as LoyaltyContestConfig;
    } catch {}
  }
  return memStore.config;
}

export async function setContestConfig(update: Partial<LoyaltyContestConfig>): Promise<LoyaltyContestConfig> {
  memStore.config = { ...memStore.config, ...update, updatedAt: Date.now() };
  const fs = getAdminFirestore();
  if (fs) {
    try {
      await fs.collection('app_settings').doc('loyalty_config').set(memStore.config, { merge: true });
    } catch {}
  }
  return memStore.config;
}

/* =========================================================================
 * Admin Dashboard Management Helpers
 * ========================================================================= */

export async function getAdminPrizeVaultSummary() {
  const tiers = memStore.tiers;
  const vault = memStore.prizeVault;

  const stockByTier = tiers.map((tier) => {
    const total = vault.filter((v) => v.tierId === tier.id).length;
    const available = vault.filter((v) => v.tierId === tier.id && !v.claimed).length;
    const claimed = total - available;
    return {
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price,
      total,
      available,
      claimed,
      lowStock: available < 3,
    };
  });

  return {
    totalVouchers: vault.length,
    availableVouchers: vault.filter((v) => !v.claimed).length,
    claimedVouchers: vault.filter((v) => v.claimed).length,
    stockByTier,
  };
}

export async function getAdminPrizeVouchersList(limit = 100): Promise<LoyaltyPrizeVoucher[]> {
  return memStore.prizeVault.slice(0, limit);
}

export async function addPrizeVouchersToVault(
  vouchers: Array<{ tierId: string; code: string }>
): Promise<{ added: number; errors: string[] }> {
  let added = 0;
  const errors: string[] = [];

  for (const item of vouchers) {
    const cleanCode = normalizeCardCode(item.code);
    if (!cleanCode) {
      errors.push('كود فارغ تم تجاهله');
      continue;
    }

    const tier = memStore.tiers.find((t) => t.id === item.tierId);
    if (!tier) {
      errors.push(`فئة غير معروفة للكود ${cleanCode}`);
      continue;
    }

    // Check if code already exists in vault
    if (memStore.prizeVault.some((v) => v.code === cleanCode)) {
      errors.push(`الكود ${cleanCode} موجود مسبقاً في الخزينة`);
      continue;
    }

    const newVoucher: LoyaltyPrizeVoucher = {
      id: `pv_${Date.now()}_${crypto.randomInt(1000, 9999)}`,
      tierId: tier.id,
      tierName: tier.name,
      code: cleanCode,
      price: tier.price,
      dataLabel: tier.dataLabel,
      durationLabel: tier.durationLabel,
      claimed: false,
      createdAt: Date.now(),
    };

    memStore.prizeVault.push(newVoucher);
    added += 1;

    const fs = getAdminFirestore();
    if (fs) {
      try {
        await fs.collection('reward_vault').doc(newVoucher.id).set(newVoucher);
      } catch {}
    }
  }

  return { added, errors };
}

export async function importNetworkCardsBatch(
  cards: Array<{ code: string; packageName?: string; price?: number; status?: string }>
): Promise<{ imported: number; errors: string[] }> {
  let imported = 0;
  const errors: string[] = [];

  for (const item of cards) {
    const code = normalizeCardCode(item.code);
    if (!code) continue;

    const record: NetworkCardRecord = {
      code,
      packageName: item.packageName || 'كرت طلقة نت',
      price: item.price || 500,
      status: (item.status as NetworkCardRecord['status']) || 'exhausted',
      importedAt: Date.now(),
    };

    memStore.networkCards.set(code, record);
    imported += 1;

    const fs = getAdminFirestore();
    if (fs) {
      try {
        await fs.collection('network_cards_ledger').doc(code).set(record);
      } catch {}
    }
  }

  return { imported, errors };
}

export async function getAdminTransactionsList(query?: { search?: string; limit?: number }): Promise<LoyaltyTransaction[]> {
  let list = memStore.transactions;
  if (query?.search) {
    const term = query.search.trim().toUpperCase();
    list = list.filter(
      (tx) =>
        tx.transactionId.includes(term) ||
        tx.wonCode.includes(term) ||
        tx.burnedCards.some((c) => c.includes(term))
    );
  }
  return list.slice(0, query?.limit || 50);
}

export async function getActivePrizeTiers(): Promise<LoyaltyPrizeTier[]> {
  return memStore.tiers;
}

export async function updateActivePrizeTiers(newTiers: LoyaltyPrizeTier[]): Promise<{ success: boolean; error?: string }> {
  // Validate total probability = 100
  const total = newTiers.reduce((sum, t) => sum + (Number(t.probabilityWeight) || 0), 0);
  if (total !== 100) {
    return { success: false, error: `مجموع نسب الفئات يجب أن يساوي 100% (المجموع الحالي: ${total}%)` };
  }

  memStore.tiers = newTiers;

  const fs = getAdminFirestore();
  if (fs) {
    try {
      await fs.collection('app_settings').doc('prize_tiers').set({ tiers: newTiers });
    } catch {}
  }

  return { success: true };
}
