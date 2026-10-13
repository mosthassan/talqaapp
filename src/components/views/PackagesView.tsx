'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CardPackage, DistributorPoint } from '@/src/types';
import { getContentRepository } from '@/src/lib/data/repository';
import { isDistributorOpenNow, calculateDistanceKm } from '@/src/data/distributors';
import { NETWORK_LINKS } from '@/src/config/links';
import {
  Clock,
  Calendar,
  Wifi,
  MapPin,
  MessageCircle,
  Phone,
  Check,
  ShieldAlert,
  ArrowUpRight,
  ChevronLeft,
  Navigation,
  Compass,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { Sheet } from '@/src/components/ui/Sheet';

// Dynamic import for Leaflet map to prevent SSR window issues
const DistributorsMap = dynamic(
  () => import('@/src/components/map/DistributorsMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] sm:h-[320px] bg-[#F8F8F7] rounded-[20px] border border-[#E7E5E4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-xs text-[#57534E]">
          <div className="w-8 h-8 border-2 border-[#C59424] border-t-transparent rounded-full animate-spin" />
          <span>جاري تحميل خريطة نقاط التوزيع...</span>
        </div>
      </div>
    ),
  }
);

export const PackagesView: React.FC = () => {
  const [packages, setPackages] = useState<CardPackage[]>([]);
  const [distributors, setDistributors] = useState<DistributorPoint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<CardPackage | null>(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'map'>('packages');

  useEffect(() => {
    const repo = getContentRepository();
    repo.getPackages().then(setPackages);
    repo.getDistributors().then(setDistributors);
  }, []);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocationError('تعذر تحديد الموقع. يرجى تفعيل إذن الموقع في المتصفح.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const filterCategories = [
    { id: 'all', label: 'الكل' },
    { id: 'hours', label: 'الساعات' },
    { id: 'daily', label: 'اليومية' },
    { id: 'weekly', label: 'الأسبوعية' },
    { id: 'monthly', label: 'شهرية VIP' },
  ];

  const filteredPackages =
    selectedCategory === 'all'
      ? packages
      : packages.filter((p) => p.category === selectedCategory);

  // Compute distances if user location available
  const distributorsWithDistance = distributors.map((d) => {
    if (!userLocation) return d;
    const distanceKm = calculateDistanceKm(
      userLocation.lat,
      userLocation.lng,
      d.lat,
      d.lng
    );
    return { ...d, distanceKm };
  });

  const sortedDistributors = userLocation
    ? [...distributorsWithDistance].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    : distributorsWithDistance;

  // Filter distributors selling selected card
  const distributorsForSelectedPackage = selectedPackage
    ? distributors.filter((d) =>
        d.availableCards.some((c) =>
          c.includes(selectedPackage.price.toString()) || c.includes('جميع')
        )
      )
    : [];

  return (
    <div className="space-y-6 pb-24 text-right font-body">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1C1917] tracking-tight font-heading">
            باقات وكروت طلقة نت
          </h2>
          <Badge variant="gold-solid" size="sm">
            الأسعار الرسمية
          </Badge>
        </div>
        <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
          فئات إنترنت مسبقة الدفع عبر منظومة ستارلينك الفضائية في مأرب بالريال اليمني، مع خريطة نقاط التوزيع المعتمدة.
        </p>
      </div>

      {/* View Switcher: Packages List vs Map */}
      <div className="flex rounded-full bg-white p-1 border border-[#E7E5E4] shadow-2xs">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'packages'
              ? 'bg-[#C59424] text-white shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          فئات الكروت والباقات
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'map'
              ? 'bg-[#C59424] text-white shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>خريطة نقاط التوزيع (مأرب)</span>
        </button>
      </div>

      {/* Tab 1: Packages List */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {filterCategories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredPackages.map((pkg) => (
              <Card
                key={pkg.id}
                variant="surface"
                padding="md"
                onClick={() => setSelectedPackage(pkg)}
                className="cursor-pointer border border-[#E7E5E4] hover:border-[#D4AF37] transition-all hover:shadow-xs group"
              >
                <div className="space-y-3">
                  {/* Top: Price and Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#1C1917] font-heading">
                          {pkg.price}
                        </span>
                        <span className="text-xs font-bold text-[#8C6311]">
                          {pkg.currency}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-[#57534E] mt-0.5">
                        {pkg.name}
                      </h3>
                    </div>

                    {pkg.popular ? (
                      <Badge variant="gold-solid" size="sm">
                        الأكثر طلباً
                      </Badge>
                    ) : (
                      <Badge variant="gold" size="sm">
                        {pkg.categoryLabel}
                      </Badge>
                    )}
                  </div>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#F8F8F7] rounded-xl text-center text-[11px]">
                    <div>
                      <span className="text-[#78716C] block text-[10px]">الرصيد</span>
                      <strong className="text-[#1C1917] font-bold font-heading">
                        {pkg.dataLimitLabel}
                      </strong>
                    </div>
                    <div className="border-r border-[#E7E5E4]">
                      <span className="text-[#78716C] block text-[10px]">الوقت</span>
                      <strong className="text-[#1C1917] font-bold font-heading">
                        {pkg.durationLabel}
                      </strong>
                    </div>
                    <div className="border-r border-[#E7E5E4]">
                      <span className="text-[#78716C] block text-[10px]">الصلاحية</span>
                      <strong className="text-[#1C1917] font-bold font-heading">
                        {pkg.validityDaysLabel}
                      </strong>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5 pt-1">
                    {pkg.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#57534E]">
                        <Check className="w-3.5 h-3.5 text-[#C59424] shrink-0" strokeWidth={2.5} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#F5F5F4] text-xs">
                    <span className="text-[11px] font-bold text-[#0284C7]">
                      السرعة: {pkg.speedLimitLabel}
                    </span>
                    <span className="text-[#C59424] font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      التفاصيل ونقاط البيع
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Map and Distributors List */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          {/* Interactive Leaflet Map */}
          <DistributorsMap
            distributors={sortedDistributors}
            selectedId={selectedDistributorId}
            onSelectDistributor={(d) => setSelectedDistributorId(d.id)}
            userCoords={userLocation}
          />

          {/* Location Request Bar */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E7E5E4] text-xs">
            <div className="flex items-center gap-2 text-[#57534E]">
              <Navigation className="w-4 h-4 text-[#0284C7]" />
              <span>
                {userLocation
                  ? 'تم تحديد موقعك (مرتبة حسب الأقرب لك)'
                  : 'رتّب نقاط البيع حسب الأقرب لموقعك'}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              isLoading={locating}
              onClick={handleRequestLocation}
            >
              {userLocation ? 'تحديث الموقع' : 'تحديد موقعي'}
            </Button>
          </div>

          {locationError && (
            <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg text-right">
              {locationError}
            </p>
          )}

          {/* Distributors List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
                نقاط البيع في مأرب ({sortedDistributors.length})
              </h3>
              <Badge variant="neutral" size="sm">
                بيانات أولية
              </Badge>
            </div>

            <div className="space-y-2">
              {sortedDistributors.map((dist) => {
                const isOpen = isDistributorOpenNow(dist);
                const isSelected = selectedDistributorId === dist.id;

                return (
                  <Card
                    key={dist.id}
                    variant="surface"
                    padding="sm"
                    className={`border transition-all ${
                      isSelected
                        ? 'border-[#C59424] bg-[#FDF7E7]/30 shadow-xs'
                        : 'border-[#E7E5E4] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#1C1917] font-heading">
                              {dist.name}
                            </h4>
                            {isOpen ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                مفتوح الآن
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                                مغلق حالياً
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#57534E] mt-0.5">
                            {dist.neighborhood} • {dist.address}
                          </p>
                        </div>

                        {dist.distanceKm !== undefined && (
                          <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full whitespace-nowrap">
                            يبعد {dist.distanceKm} كم
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-[#78716C] flex items-center justify-between border-t border-[#F5F5F4] pt-2">
                        <span>الساعات: {dist.openHours}</span>
                        <span>المسؤول: {dist.ownerName}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${dist.phone.replace(/\s+/g, '')}`}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#F8F8F7] hover:bg-[#E7E5E4] text-[#1C1917] text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-[#0284C7]" />
                          اتصال
                        </a>

                        <a
                          href={`https://wa.me/${dist.whatsapp}?text=${encodeURIComponent(
                            `السلام عليكم، هل كروت طلقة نت متوفرة لديكم؟`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#E7F8EE] hover:bg-[#D1FAE5] text-emerald-800 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          واتساب
                        </a>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${dist.lat},${dist.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#C59424] hover:bg-[#B58218] text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Compass className="w-3 h-3" />
                          الاتجاهات
                        </a>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Package Detail Bottom Sheet */}
      {selectedPackage && (
        <Sheet
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          title={`تفاصيل ${selectedPackage.name}`}
          subtitle={`سعر الكرت: ${selectedPackage.price} ${selectedPackage.currency}`}
        >
          <div className="space-y-4 py-1 text-right font-body">
            {/* Specs Summary Box */}
            <div className="p-4 bg-gradient-to-r from-[#FDF7E7] to-[#F8F8F7] rounded-[20px] border border-[#EEDAA2] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8C6311] font-bold font-heading">
                  المواصفات الكاملة
                </span>
                <Badge variant="gold-solid" size="sm">
                  {selectedPackage.categoryLabel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-white rounded-lg border border-[#E7E5E4]">
                  <span className="text-[10px] text-[#78716C] block">الرصيد المتاح</span>
                  <strong className="text-sm font-bold text-[#1C1917]">
                    {selectedPackage.dataLimitLabel}
                  </strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#E7E5E4]">
                  <span className="text-[10px] text-[#78716C] block">مدة الاتصال</span>
                  <strong className="text-sm font-bold text-[#1C1917]">
                    {selectedPackage.durationLabel}
                  </strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#E7E5E4]">
                  <span className="text-[10px] text-[#78716C] block">فترة الصلاحية</span>
                  <strong className="text-sm font-bold text-[#1C1917]">
                    {selectedPackage.validityDaysLabel}
                  </strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#E7E5E4]">
                  <span className="text-[10px] text-[#78716C] block">أقصى سرعة</span>
                  <strong className="text-sm font-bold text-[#0284C7]">
                    {selectedPackage.speedLimitLabel}
                  </strong>
                </div>
              </div>
            </div>

            {/* How to use the card guide */}
            <div className="p-4 bg-white rounded-[20px] border border-[#E7E5E4] space-y-2.5">
              <h4 className="text-xs font-bold text-[#1C1917] font-heading flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C59424]" />
                <span>كيف أستخدم كرتي؟</span>
              </h4>
              <ol className="text-xs text-[#57534E] space-y-2 pr-4 list-decimal leading-relaxed">
                <li>اتصل بشبكة واي فاي <strong>طلقة نت</strong> من هاتفك.</li>
                <li>افتح صفحة الدخول عبر الرابط المباشر <strong>t.net</strong>.</li>
                <li>أدخل كود الكرت المكون من أرقام واضغط «دخول».</li>
              </ol>

              <div className="pt-1">
                <a
                  href={NETWORK_LINKS.portal.login}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#C59424] hover:bg-[#B58218] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Wifi className="w-4 h-4" />
                  <span>فتح بوابة الدخول (t.net)</span>
                </a>
              </div>
            </div>

            {/* Distributors selling this card */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1C1917] font-heading">
                نقاط بيع هذا الكرت في مأرب
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {distributorsForSelectedPackage.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 bg-[#F8F8F7] rounded-xl border border-[#E7E5E4] flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-[#1C1917] block font-heading">{d.name}</strong>
                      <span className="text-[10px] text-[#78716C]">{d.neighborhood}</span>
                    </div>
                    <a
                      href={`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(
                        `السلام عليكم، هل يتوفر لديكم ${selectedPackage.name}؟`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                    >
                      طلب واتساب
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Network Support Order */}
            <div className="pt-2">
              <a
                href={NETWORK_LINKS.support.whatsappMessageUrl(
                  `السلام عليكم، أرغب في الاستفسار عن ${selectedPackage.name} (${selectedPackage.price} ريال يمني).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>طلب الكرت مباشرة من خدمة عملاء طلقة نت</span>
              </a>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
};
