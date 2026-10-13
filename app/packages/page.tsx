import type { Metadata } from 'next';
import { PackagesView } from '@/src/components/views/PackagesView';

export const metadata: Metadata = {
  title: 'باقات الكروت ونقاط التوزيع | طلقة نت',
  description: 'فئات كروت طلقة نت بأسعارها المعتمدة في مأرب، مع خريطة تفاعلية لنقاط التوزيع.',
  openGraph: {
    title: 'باقات الكروت ونقاط التوزيع | طلقة نت',
    description: 'اختر باقتك المفضلة وتعرف على أقرب نقطة توزيع لك في مأرب.',
  },
};

export default function PackagesPage() {
  return <PackagesView />;
}
