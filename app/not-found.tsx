import Link from 'next/link';
import { BrandLogo } from '@/src/components/ui/BrandLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-6 text-center font-body">
      <div className="w-14 h-14 rounded-full bg-white border border-[#E3E8EE] flex items-center justify-center mb-4">
        <BrandLogo size={28} variant="ink" />
      </div>
      <h2 className="text-xl font-bold text-[#0B1220] mb-1 font-heading">الصفحة غير موجودة</h2>
      <p className="text-xs text-[#5B6676] max-w-xs mb-6">
        عذراً، الرابط المطلوب غير متوفر في تطبيق شبكة طلقة نت.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-[#0B1220] text-white text-xs font-semibold hover:bg-[#1a2335] tap-press"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
