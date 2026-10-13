import type { Metadata } from 'next';
import { LoungeView } from '@/src/components/views/LoungeView';

export const metadata: Metadata = {
  title: 'الاستراحة | طلقة نت',
  description: 'استراحة طلقة نت: مكتبة وسائط Jellyfin وتنزيلات ألعاب وتطبيقات سريعة بدون استهلاك رصيد.',
  openGraph: {
    title: 'الاستراحة | طلقة نت',
    description: 'ترفيه محلي وتنزيلات سريعة بدون استهلاك كرتك مع طلقة نت.',
  },
};

export default function Lounge() {
  return <LoungeView />;
}
