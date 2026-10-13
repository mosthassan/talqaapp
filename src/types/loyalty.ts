export interface LoyaltyPrizeTier {
  id: string;
  name: string;
  price: number;
  color: string;
  textColor?: string;
  probabilityWeight: number; // e.g., 45 for 45%
  dataLabel: string;
  durationLabel: string;
  iconName?: string;
}

export interface LoyaltyPrizeVoucher {
  id: string;
  tierId: string;
  tierName: string;
  code: string;
  price: number;
  dataLabel: string;
  durationLabel: string;
  claimed: boolean;
  claimedAt?: number;
  wonByTransactionId?: string;
  createdAt: number;
}

export interface NetworkCardRecord {
  code: string;
  packageName: string;
  price: number;
  status: 'used' | 'exhausted' | 'expired' | 'new';
  usedBytes?: number;
  usedSeconds?: number;
  importedAt: number;
}

export interface BurnedCardRecord {
  code: string;
  redeemedAt: number;
  transactionId: string;
  tierName: string;
  price: number;
  ipHash?: string;
}

export interface LoyaltyTransaction {
  transactionId: string;
  idempotencyKey: string;
  timestamp: number;
  burnedCards: string[];
  wonTierId: string;
  wonTierName: string;
  wonPrice: number;
  wonCode: string;
  dataLabel: string;
  durationLabel: string;
  ipHash?: string;
}

export interface LoyaltyContestConfig {
  enabled: boolean;
  dailyRedemptionLimit: number;
  rulesText: string;
  updatedAt: number;
}
