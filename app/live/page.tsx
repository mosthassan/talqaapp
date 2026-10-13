import type { Metadata } from 'next';
import { MatchesView } from '@/src/components/views/MatchesView';

export const metadata: Metadata = {
  title: 'البث المباشر HLS | طلقة نت',
  description: 'مركز بث المباريات HLS وأجواء كرة القدم عبر سيرفر طلقة نت الداخلي.',
  openGraph: {
    title: 'البث المباشر HLS | طلقة نت',
    description: 'عش حماس المباريات مع شبكة طلقة نت بدون استهلاك رصيدك.',
  },
};

export default function LivePage() {
  return <MatchesView />;
}
