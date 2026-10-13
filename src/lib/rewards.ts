export const PRIZES = [200, 500, 1000] as const;

export function validateCards(codes: string[]): string | null {
  const clean = codes.map((c) => c.trim()).filter(Boolean);
  if (clean.length !== 10) return 'أدخل عشرة كروت مستخدمة بالضبط.';
  if (new Set(clean).size !== 10) return 'كل كرت يجب أن يكون مختلفًا عن الآخر.';
  return null;
}

export function prizeRotation(value: number, turns = 6): number {
  const index = PRIZES.findIndex((p) => p === value);
  if (index < 0) throw new Error('Invalid prize');
  return turns * 360 + (360 - (index * 120 + 60));
}
