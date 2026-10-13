import type { Metadata } from 'next';
import { HomePage } from '@/src/components/talqa/Features';

export const metadata: Metadata = {
  title: 'طلقة نت | عالمك المتصل',
  description: 'خدمات شبكة طلقة نت: استراحة، بث مباريات، فحص سرعة ومكافآت الانتماء.',
  openGraph: {
    title: 'طلقة نت | عالمك المتصل',
    description: 'اتصال، ترفيه ومكافآت في مكان واحد.',
  },
};

export default function Page() {
  return <HomePage />;
}
