import { describe, it, expect, beforeEach } from 'vitest';
import {
  cryptoWeightedRandomDraw,
  normalizeCardCode,
  verifySingleCardServer,
  verifyCardsBatchServer,
  executeRedeemServer,
  getUserWalletCards,
  addUserWalletCard,
  redeemUserWalletCards,
  DEFAULT_PRIZE_TIERS,
} from './serverLoyaltyEngine';
import { LoyaltyPrizeTier } from '@/src/types/loyalty';

describe('Server Loyalty Engine - Logic & Cryptographic Integrity', () => {
  it('normalizes card codes correctly (strips whitespace, forces uppercase)', () => {
    expect(normalizeCardCode('  tlq-200-112233  ')).toBe('TLQ-200-112233');
    expect(normalizeCardCode('tlq 500 101010')).toBe('TLQ500101010');
  });

  describe('cryptoWeightedRandomDraw', () => {
    it('returns a valid tier matching the configured options', () => {
      const drawn = cryptoWeightedRandomDraw(DEFAULT_PRIZE_TIERS);
      expect(DEFAULT_PRIZE_TIERS.map((t) => t.id)).toContain(drawn.id);
    });

    it('respects weights over multiple iterations (highest weight wins most frequently)', () => {
      const mockTiers: LoyaltyPrizeTier[] = [
        {
          id: 'common',
          name: 'كرت شائع',
          price: 1000,
          color: '#blue',
          probabilityWeight: 90,
          dataLabel: '1GB',
          durationLabel: '6h',
        },
        {
          id: 'rare',
          name: 'كرت نادر',
          price: 4000,
          color: '#gold',
          probabilityWeight: 10,
          dataLabel: '30GB',
          durationLabel: '30d',
        },
      ];

      const counts: Record<string, number> = { common: 0, rare: 0 };
      const trials = 500;

      for (let i = 0; i < trials; i++) {
        const tier = cryptoWeightedRandomDraw(mockTiers);
        counts[tier.id] = (counts[tier.id] || 0) + 1;
      }

      // 90% common should be substantially higher than 10% rare
      expect(counts.common).toBeGreaterThan(counts.rare!);
      expect(counts.common).toBeGreaterThan(350);
    });
  });

  describe('verifySingleCardServer', () => {
    it('rejects empty or very short codes', async () => {
      const res = await verifySingleCardServer('ab');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('invalid_format');
    });

    it('accepts registered exhausted network card', async () => {
      const res = await verifySingleCardServer('TLQ-200-112233');
      expect(res.valid).toBe(true);
      expect(res.reason).toBe('valid');
      expect(res.details?.price).toBe(200);
    });

    it('rejects unregistered unknown card', async () => {
      const res = await verifySingleCardServer('FAKE-UNKNOWN-999999');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('not_found');
    });
  });

  describe('verifyCardsBatchServer', () => {
    it('rejects batch when less than 10 cards are provided', async () => {
      const batch = ['TLQ-200-112233', 'TLQ-200-445566'];
      const res = await verifyCardsBatchServer(batch);
      expect(res.allValid).toBe(false);
      expect(res.errorSummary).toContain('المسابقة تتطلب 10 كروت');
    });

    it('detects duplicate cards within the request batch', async () => {
      const batch = [
        'TLQ-200-112233',
        'TLQ-200-112233', // Duplicate!
        'TLQ-200-778899',
        'TLQ-500-101010',
        'TLQ-500-202020',
        'TLQ-500-303030',
        'TLQ-500-404040',
        'TLQ-1000-505050',
        'TLQ-1000-606060',
        'TLQ-1000-707070',
      ];
      const res = await verifyCardsBatchServer(batch);
      expect(res.allValid).toBe(false);
      const dup = res.results.find((r) => r.reason === 'duplicate_in_request');
      expect(dup).toBeDefined();
    });

    it('accepts 10 distinct, valid network cards', async () => {
      const batch = [
        'TLQ-200-112233',
        'TLQ-200-445566',
        'TLQ-200-778899',
        'TLQ-500-101010',
        'TLQ-500-202020',
        'TLQ-500-303030',
        'TLQ-500-404040',
        'TLQ-1000-505050',
        'TLQ-1000-606060',
        'TLQ-1000-707070',
      ];
      const res = await verifyCardsBatchServer(batch);
      expect(res.allValid).toBe(true);
      expect(res.results.every((r) => r.valid)).toBe(true);
    });
  });

  describe('executeRedeemServer & Idempotency', () => {
    it('burns 10 cards, awards a legitimate prize, and replays idempotently', async () => {
      const batch = [
        'TLQ-200-808080',
        'TLQ-200-909090',
        'TLQ-500-111222',
        'TLQ-500-333444',
        'TLQ-500-555666',
        'TLQ-1000-777888',
        'TLQ-1000-999000',
        'TLQ-500-123789',
        'TLQ-500-456123',
        'TLQ-4000-987654',
      ];
      const idempotencyKey = `test_idempotency_${Date.now()}`;

      // 1. First redemption execution
      const result1 = await executeRedeemServer({
        cards: batch,
        idempotencyKey,
        clientId: 'test-client-1',
      });

      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.idempotentReplay).toBe(false);
        expect(result1.wonVoucher.code).toBeDefined();
        expect(result1.burnedCardsCount).toBe(10);
        expect(result1.transactionId).toMatch(/^TLQ-TRX-/);
      }

      // 2. Immediate Replay with the same idempotency key (e.g. user retrying on slow network)
      const result2 = await executeRedeemServer({
        cards: batch,
        idempotencyKey,
        clientId: 'test-client-1',
      });

      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        expect(result2.idempotentReplay).toBe(true);
        expect(result2.transactionId).toBe(result1.transactionId);
        expect(result2.wonVoucher.code).toBe(result1.wonVoucher.code);
      }

      // 3. Trying to burn the same cards with a NEW idempotency key MUST fail (already burned)
      const result3 = await executeRedeemServer({
        cards: batch,
        idempotencyKey: `new_key_${Date.now()}`,
        clientId: 'test-client-2',
      });

      expect(result3.success).toBe(false);
      if (!result3.success) {
        expect(result3.reason).toBe('invalid_cards');
      }
    });

    it('returns out_of_stock without burning cards when vault inventory is empty', async () => {
      // Import the in-memory store to simulate empty vault
      const store = globalThis.__talqa_loyalty_store;
      const originalVault = store ? [...store.prizeVault] : [];
      if (store) {
        store.prizeVault = []; // EMPTY VAULT
      }

      const freshBatch = [
        'TLQ-200-112233',
        'TLQ-200-445566',
        'TLQ-200-778899',
        'TLQ-500-101010',
        'TLQ-500-202020',
        'TLQ-500-303030',
        'TLQ-500-404040',
        'TLQ-1000-505050',
        'TLQ-1000-606060',
        'TLQ-1000-707070',
      ];

      const res = await executeRedeemServer({
        cards: freshBatch,
        idempotencyKey: `empty_vault_key_${Date.now()}`,
        clientId: 'test-client-empty',
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.reason).toBe('out_of_stock');
        expect(res.message).toContain('لم يتم حرق كروتك العشرة');
      }

      // Verify that cards were NOT burned
      const cardCheck = await verifySingleCardServer('TLQ-200-112233');
      expect(cardCheck.valid).toBe(true);
      expect(cardCheck.reason).not.toBe('burned');

      // Restore vault
      if (store) {
        store.prizeVault = originalVault;
      }
    });

    it('fails safely with server_error in production mode when Firestore is unavailable', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

        const freshBatch = [
          'TLQ-200-112233',
          'TLQ-200-445566',
          'TLQ-200-778899',
          'TLQ-500-101010',
          'TLQ-500-202020',
          'TLQ-500-303030',
          'TLQ-500-404040',
          'TLQ-1000-505050',
          'TLQ-1000-606060',
          'TLQ-1000-707070',
        ];

        const res = await executeRedeemServer({
          cards: freshBatch,
          idempotencyKey: `prod_guard_key_${Date.now()}`,
          clientId: 'test-client-prod',
        });

        expect(res.success).toBe(false);
        if (!res.success) {
          expect(res.reason).toBe('server_error');
          expect(res.message).toContain('لم يتم حرق');
        }
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe('User Card Stashing / Loyalty Wallet (اجمع كروتك تدريجياً في حسابك)', () => {
    const testUid = 'user_test_stash_123';
    const otherUid = 'user_test_other_456';

    beforeEach(() => {
      const store = globalThis.__talqa_loyalty_store;
      if (store) {
        store.networkCards.set('TLQ-STASH-CARD-01', {
          code: 'TLQ-STASH-CARD-01',
          packageName: 'كرت 500 ريال',
          price: 500,
          status: 'exhausted',
          usedBytes: 2500 * 1024 * 1024,
          importedAt: Date.now(),
        });
        for (let i = 1; i <= 10; i++) {
          const code = `TLQ-WALLET-TEN-${String(i).padStart(2, '0')}`;
          store.networkCards.set(code, {
            code,
            packageName: 'كرت 500 ريال',
            price: 500,
            status: 'exhausted',
            usedBytes: 2500 * 1024 * 1024,
            importedAt: Date.now(),
          });
        }
      }
    });

    it('returns empty wallet for a brand new user', async () => {
      const wallet = await getUserWalletCards('brand_new_user');
      expect(wallet.count).toBe(0);
      expect(wallet.cards).toEqual([]);
    });

    it('adds a valid card to user wallet successfully', async () => {
      const res = await addUserWalletCard(testUid, 'TLQ-STASH-CARD-01');
      expect(res.success).toBe(true);
      expect(res.count).toBe(1);
      expect(res.cards?.[0]?.code).toBe('TLQ-STASH-CARD-01');

      const wallet = await getUserWalletCards(testUid);
      expect(wallet.count).toBe(1);
      expect(wallet.cards[0]?.code).toBe('TLQ-STASH-CARD-01');
    });

    it('rejects adding the same card twice to the same user (already_mine)', async () => {
      const res = await addUserWalletCard(testUid, 'TLQ-STASH-CARD-01');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('already_mine');
      expect(res.error).toContain('موجود في رصيد كروتك مسبقاً');
    });

    it('rejects adding a card already stashed by another user (taken)', async () => {
      const res = await addUserWalletCard(otherUid, 'TLQ-STASH-CARD-01');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('taken');
      expect(res.error).toContain('أضافه مشترك آخر');
    });

    it('rejects unknown cards not found in network ledger', async () => {
      const res = await addUserWalletCard(testUid, 'UNKNOWN-CARD-999');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('not_found');
      expect(res.error).toContain('غير مسجل');
    });

    it('rejects invalid short card code format', async () => {
      const res = await addUserWalletCard(testUid, 'AB');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('invalid_format');
    });

    it('prevents redeeming wallet if card count is less than 10', async () => {
      const res = await redeemUserWalletCards(testUid, 'test_idem_early', 'client_1');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.reason).toBe('wallet_incomplete');
        expect(res.message).toContain('تحتاج 10 كروت');
      }
    });

    it('redeems 10 stashed cards atomically, awards genuine prize, and clears wallet', async () => {
      const multiUserUid = 'user_with_ten_cards';
      const tenCodes = Array.from({ length: 10 }, (_, i) => `TLQ-WALLET-TEN-${String(i + 1).padStart(2, '0')}`);

      // Add all 10 cards to user's wallet
      for (const code of tenCodes) {
        const addRes = await addUserWalletCard(multiUserUid, code);
        expect(addRes.success).toBe(true);
      }

      const walletBefore = await getUserWalletCards(multiUserUid);
      expect(walletBefore.count).toBe(10);

      // Redeem full wallet
      const redeemRes = await redeemUserWalletCards(
        multiUserUid,
        `wallet_redeem_idem_${Date.now()}`,
        'client_full_wallet'
      );

      expect(redeemRes.success).toBe(true);
      if (redeemRes.success) {
        expect(redeemRes.wonVoucher.code).toBeDefined();
        expect(redeemRes.wonTier.name).toBeDefined();
      }

      // Verify user's wallet was cleared of redeemed cards
      const walletAfter = await getUserWalletCards(multiUserUid);
      expect(walletAfter.count).toBe(0);
    });
  });
});
