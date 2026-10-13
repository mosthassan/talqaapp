import type { Metadata } from 'next';
import { SpeedTestView } from '@/src/components/speed/SpeedTestView';

export const metadata: Metadata = {
  title: 'فحص سرعة الإنترنت الفعلي | طلقة نت',
  description: 'اختبر سرعة التنزيل والرفع الفعلي وزمن الاستجابة مع شبكة طلقة نت في مأرب.',
  openGraph: {
    title: 'فحص سرعة الإنترنت الفعلي | طلقة نت',
    description: 'قوة اتصالك بالأرقام مع فحص مباشر للتنزيل والرفع.',
  },
};

export default function Speed() {
  return (
    <div className="space-y-6 pb-24 text-right font-body">
      <div>
        <h1 className="text-xl font-bold text-[#1C1917] tracking-tight font-heading">
          فحص سرعة الإنترنت الفعلي
        </h1>
        <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
          قياس حي ودقيق لسرعة التنزيل، سرعة الرفع، وزمن استجابة الشبكة (Ping & Jitter).
        </p>
      </div>

      <SpeedTestView />
    </div>
  );
}
