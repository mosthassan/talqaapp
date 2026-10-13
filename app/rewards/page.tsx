import type { Metadata } from 'next';
import { LoyaltyContestView } from '@/src/components/loyalty/LoyaltyContestView';

export const metadata: Metadata = {
  title: 'مسابقة الانتماء | طلقة نت',
  description: 'اجمع 10 كروت مستهلكة من شبكة طلقة نت واستبدلها بكرت فوري جديد عبر عجلة الحظ السحابية.',
  openGraph: {
    title: 'مسابقة الانتماء | طلقة نت',
    description: '10 كروت مستهلكة = لفة عجلة حظ وكرت رابح فوري.',
  },
};

export default function Rewards() {
  return <LoyaltyContestView />;
}
