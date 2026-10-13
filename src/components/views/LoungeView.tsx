'use client';

import React, { useState, useEffect } from 'react';
import { LoungeItem } from '@/src/types';
import { getContentRepository } from '@/src/lib/data/repository';
import { NETWORK_LINKS } from '@/src/config/links';
import {
  Film,
  Download,
  Gamepad2,
  Zap,
  ExternalLink,
  Wifi,
  Info,
  Check,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';

const memorySymbols = ['⚡', '🎮', '🏆', '🎯', '⚡', '🎮', '🏆', '🎯'];

export const LoungeView: React.FC = () => {
  const [items, setItems] = useState<LoungeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'downloads' | 'game'>('all');

  // Memory Game state
  const [deck, setDeck] = useState(memorySymbols);
  const [opened, setOpened] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const repo = getContentRepository();
    repo.getLoungeItems().then(setItems);
  }, []);

  const handleCardClick = (index: number) => {
    if (opened.length === 2 || opened.includes(index) || matched.includes(index)) return;
    const next = [...opened, index];
    setOpened(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = next;
      if (first !== undefined && second !== undefined && deck[first] === deck[second]) {
        setMatched((prev) => [...prev, first, second]);
        setOpened([]);
      } else {
        setTimeout(() => setOpened([]), 700);
      }
    }
  };

  const resetGame = () => {
    setDeck([...memorySymbols].sort(() => Math.random() - 0.5));
    setOpened([]);
    setMatched([]);
    setMoves(0);
  };

  const filteredItems =
    activeTab === 'all'
      ? items
      : items.filter((item) => item.category === activeTab);

  return (
    <div className="space-y-6 pb-24 text-right font-body">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1C1917] tracking-tight font-heading">
            استراحة طلقة نت
          </h2>
          <Badge variant="gold" size="sm">
            مركز الترفيه
          </Badge>
        </div>
        <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
          ترفيه محلي هادئ: مكتبة أفلام Jellyfin، تحميلات سريعة للألعاب والتطبيقات بدون استهلاك رصيدك، وتحديات خفيفة.
        </p>
      </div>

      {/* Honest LAN Connectivity Notice */}
      <div className="p-4 bg-gradient-to-r from-[#FDF7E7] to-[#F8F8F7] rounded-[20px] border border-[#E7E5E4] space-y-1.5 text-xs text-[#57534E]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8C6311] font-heading">
          <Wifi className="w-4 h-4 text-[#C59424]" strokeWidth={2} />
          <span>الخدمات الداخلية تعمل عبر شبكة طلقة نت (LAN)</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          خادم الوسائط وملفات الألعاب مستضافة محلياً في مأرب عبر <code>{NETWORK_LINKS.localServer.mediaServer}</code>. لفتح المحتوى، تأكد من اتصال هاتفك بشبكة واي فاي طلقة نت.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'bg-[#C59424] text-white shadow-xs'
              : 'bg-white text-[#57534E] border border-[#E7E5E4] hover:bg-[#F8F8F7]'
          }`}
        >
          كل الاستراحة
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'media'
              ? 'bg-[#C59424] text-white shadow-xs'
              : 'bg-white text-[#57534E] border border-[#E7E5E4] hover:bg-[#F8F8F7]'
          }`}
        >
          الأفلام والمسلسلات
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'downloads'
              ? 'bg-[#C59424] text-white shadow-xs'
              : 'bg-white text-[#57534E] border border-[#E7E5E4] hover:bg-[#F8F8F7]'
          }`}
        >
          تحميلات الألعاب والتطبيقات
        </button>
        <button
          onClick={() => setActiveTab('game')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'game'
              ? 'bg-[#C59424] text-white shadow-xs'
              : 'bg-white text-[#57534E] border border-[#E7E5E4] hover:bg-[#F8F8F7]'
          }`}
        >
          تحدي الذاكرة 🎮
        </button>
      </div>

      {/* Catalog Cards Section */}
      {activeTab !== 'game' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                variant="surface"
                padding="md"
                className="space-y-3 border border-[#E7E5E4] hover:border-[#D4AF37] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FDF7E7] text-[#C59424] flex items-center justify-center shrink-0">
                      {item.category === 'media' ? (
                        <Film className="w-5 h-5" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1917] font-heading">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-[#78716C]">
                        {item.categoryLabel}
                        {item.fileSize && ` • الحجم: ${item.fileSize}`}
                      </span>
                    </div>
                  </div>
                  {item.requiresLan && (
                    <Badge variant="network" size="sm">
                      داخل الشبكة
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-[#57534E] leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-1 flex items-center justify-between border-t border-[#F5F5F4]">
                  <span className="text-[10px] text-[#78716C] flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#0284C7]" />
                    فتح مباشر في نافذة جديدة
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C59424] hover:bg-[#B58218] text-white text-xs font-bold transition-transform active:scale-95 shadow-xs"
                  >
                    <span>فتح الخدمة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Memory Challenge Game (Offline-Friendly Entertainment) */}
      {(activeTab === 'all' || activeTab === 'game') && (
        <section className="p-5 bg-white rounded-[24px] border border-[#E7E5E4] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1C1917] font-heading">
                  تحدي الذاكرة: لقّط المتشابه!
                </h3>
                <span className="text-[10px] text-[#78716C]">
                  ألعاب خفيفة تعمل بدون إنترنت • المحاولات: {moves}
                </span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={resetGame}>
              <RotateCcw className="w-3.5 h-3.5 ml-1" />
              إعادة
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto">
            {deck.map((sym, idx) => {
              const isFlipped = opened.includes(idx) || matched.includes(idx);
              const isMatchedCard = matched.includes(idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  disabled={isMatchedCard}
                  className={`aspect-square rounded-xl text-xl flex items-center justify-center font-bold transition-all transform active:scale-95 border ${
                    isMatchedCard
                      ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
                      : isFlipped
                      ? 'bg-[#FDF7E7] text-[#8C6311] border-[#EEDAA2] shadow-xs'
                      : 'bg-[#F8F8F7] hover:bg-[#F5F5F4] text-[#A8A29E] border-[#E7E5E4]'
                  }`}
                >
                  {isFlipped ? sym : <Zap className="w-5 h-5 text-[#D6D3D1]" />}
                </button>
              );
            })}
          </div>

          {matched.length === deck.length && (
            <div className="p-3 bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl text-center space-y-1 animate-fadeIn">
              <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs font-heading">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span>أحسنت! ذاكرة حديدية</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                أنهيت اللعبة في {moves} محاولات.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
