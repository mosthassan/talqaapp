'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowDown,
  Wifi,
  Gauge,
  Gift,
  Radio,
  Play,
  Gamepad2,
  Zap,
  Sparkles,
  Ticket,
  Check,
  RotateCcw,
  Copy,
  Trophy,
  Lock,
  CircleHelp,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { PRIZES, validateCards, prizeRotation } from '@/src/lib/rewards';
import { SpeedTestView } from '@/src/components/speed/SpeedTestView';

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <span className="connection-pill">
        <span /> اتصال يجمعنا
      </span>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <PageHeading
        eyebrow="عالمك المتصل"
        title="أهلًا بك في طلقة نت"
        description="كل ما تحبه، في مكان واحد. اتصال، ترفيه ومكافآت."
      />

      {/* Network Hero Banner */}
      <section className="network-hero">
        <Image
          src="/assets/network-hero.jpg"
          alt="صاعقة طلقة نت الزجاجية المضيئة"
          width={1536}
          height={864}
          priority
          referrerPolicy="no-referrer"
        />
        <div className="hero-content">
          <span className="hero-kicker">
            <Zap size={14} /> أكثر من مجرد إنترنت
          </span>
          <h2>
            طلقة نت<span>اتصال بلا حدود.</span>
          </h2>
          <p>
            عيش اللحظة. شاهد فريقك. واكسب مع كل اتصال.
            <br />
            عالمك يبدأ بطلقة.
          </p>
          <Button asChild size="lg">
            <Link href="/rewards">
              اكتشف مكافآتك <ArrowLeft />
            </Link>
          </Button>
          <div className="hero-footnote">
            <span className="tiny-avatars">ط ن</span>
            <span>
              أنت منّا… ومكافأتك علينا <Sparkles size={13} />
            </span>
          </div>
        </div>
        <span className="hero-version">
          CONNECTED. TOGETHER. <span>2026</span>
        </span>
      </section>

      {/* Section: على مزاجك */}
      <div className="section-heading">
        <h2>على مزاجك</h2>
        <span>تجربة واحدة. خيارات أكثر.</span>
      </div>

      {/* Service Grid */}
      <div className="service-grid">
        {[
          {
            to: '/lounge',
            icon: Gamepad2,
            title: 'الاستراحة',
            text: 'خذ بريك… وغيّر جو',
            tone: 'mint',
            tag: 'وقت لك',
          },
          {
            to: '/live',
            icon: Radio,
            title: 'البث المباشر',
            text: 'كل حماس المباراة، معك',
            tone: 'coral',
            tag: 'لا تفوّت اللحظة',
          },
          {
            to: '/speed',
            icon: Gauge,
            title: 'فحص السرعة',
            text: 'اعرف قوة اتصالك',
            tone: 'blue',
            tag: 'اختبر اتصالك',
          },
          {
            to: '/rewards',
            icon: Gift,
            title: 'مكافآت الانتماء',
            text: 'كروتك القديمة… حظك الجديد',
            tone: 'gold',
            tag: 'كلنا فائزون',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.to} href={s.to} className={`service-item ${s.tone}`}>
              <div className="service-top">
                <span className="service-icon">
                  <Icon />
                </span>
                <ArrowLeft size={17} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <span className="service-tag">
                {s.tag}
                <span />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Quick Packages Bar */}
      <div className="section-heading" style={{ marginTop: '28px' }}>
        <h2>باقات طلقة نت الفورية</h2>
        <span>كروت إنترنت ستارلينك فائق السرعة</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-surface border border-border rounded-lg text-center">
          <span className="text-xs text-primary font-bold">باقة التوفير</span>
          <div className="text-lg font-bold text-foreground mt-1">200 ريال</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">3 ساعات • 1 جيجابايت</p>
        </div>
        <div className="p-3.5 bg-surface border border-primary/40 rounded-lg text-center relative overflow-hidden">
          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold absolute top-1.5 left-1.5">الأكثر طلبًا</span>
          <span className="text-xs text-primary font-bold">باقة الحماس</span>
          <div className="text-lg font-bold text-foreground mt-1">500 ريال</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">12 ساعة • 3 جيجابايت</p>
        </div>
        <div className="p-3.5 bg-surface border border-border rounded-lg text-center">
          <span className="text-xs text-mint font-bold">باقة النجوم</span>
          <div className="text-lg font-bold text-foreground mt-1">1000 ريال</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">24 ساعة • 7 جيجابايت</p>
        </div>
      </div>

      {/* Matches & Lucky Wheel Teaser */}
      <div className="home-lower">
        <LiveSection compact />
        <RewardTeaser />
      </div>

      {/* Bottom CTA Band */}
      <section className="bottom-band">
        <div className="band-icon">
          <Wifi />
        </div>
        <div>
          <h3>اتصالك يستحق الأفضل.</h3>
          <p>اختبر سرعة الإنترنت، وابقَ على اطلاع بأداء اتصالك.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/speed">
            افحص الآن <ArrowLeft />
          </Link>
        </Button>
      </section>
    </>
  );
}

export function LiveSection({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState('الكل');
  const [open, setOpen] = useState(false);

  return (
    <section className={compact ? 'live-section' : 'live-section full'}>
      <div className="section-heading">
        <h2>
          <span className="live-dot" /> أجواء المباريات
        </h2>
        {compact ? (
          <Link href="/live">
            عرض الكل <ArrowLeft size={14} />
          </Link>
        ) : (
          <span>ملعبك، أينما كنت</span>
        )}
      </div>

      <div className="match-cover">
        <Image
          src="/assets/football.jpg"
          width={1536}
          height={864}
          alt="لاعبان يتنافسان في ملعب كرة قدم مضاء"
          referrerPolicy="no-referrer"
        />
        <span className="cover-badge">
          <Radio size={13} /> عالم كرة القدم
        </span>
        <div className="match-cover-content">
          <span>هنا يبدأ الحماس</span>
          <h3>
            كل لحظة. كل هدف.
            <br />
            عيش المباراة.
          </h3>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            <Play fill="currentColor" /> مركز البث
          </Button>
        </div>
      </div>

      {!compact && (
        <>
          <div className="filter-tabs">
            {['الكل', 'الدوري الإسباني', 'الدوري الإنجليزي', 'دوري الأبطال'].map(
              (t) => (
                <Button
                  key={t}
                  variant={tab === t ? 'default' : 'ghost'}
                  onClick={() => setTab(t)}
                >
                  {t}
                </Button>
              )
            )}
          </div>
          <div className="empty-state">
            <Radio />
            <h3>نترقب صافرة البداية</h3>
            <p>
              لا توجد مباريات متاحة للبث في{' '}
              {tab === 'الكل' ? 'الوقت الحالي' : tab}.
            </p>
            <span>سيظهر جدول المباريات عند ربط مصدر البث ومواعيد اللقاءات.</span>
          </div>
        </>
      )}

      {compact && (
        <div className="match-caption">
          <span>
            <span className="status-dot" /> ترقب المباريات القادمة
          </span>
          <span>
            البث قريبًا <ArrowLeft size={13} />
          </span>
        </div>
      )}

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="modal small"
            role="dialog"
            aria-modal="true"
            aria-label="مركز البث"
            onClick={(e) => e.stopPropagation()}
          >
            <Radio className="text-primary" />
            <h2>البث لم يبدأ بعد</h2>
            <p>
              سيكون البث متاحًا هنا عند توفير قنوات ومصادر بث مرخصة للشبكة في
              مواعيد القمم الكروية.
            </p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              حسنًا <Check />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export function Wheel({
  rotation = 0,
  small = false,
}: {
  rotation?: number;
  small?: boolean;
}) {
  return (
    <div className={small ? 'wheel-wrap small-wheel' : 'wheel-wrap'}>
      <div className="wheel-pointer" />
      <div
        className="wheel-rotor"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg
          viewBox="0 0 300 300"
          role="img"
          aria-label="عجلة حظ بفئات كروت 200 و500 و1000"
        >
          <circle cx="150" cy="150" r="145" className="wheel-rim" />
          <path
            d="M150 150 L150 15 A135 135 0 0 1 266.91 217.5 Z"
            className="sector-one"
          />
          <path
            d="M150 150 L266.91 217.5 A135 135 0 0 1 33.09 217.5 Z"
            className="sector-two"
          />
          <path
            d="M150 150 L33.09 217.5 A135 135 0 0 1 150 15 Z"
            className="sector-three"
          />
          {PRIZES.map((p, i) => (
            <g key={p} transform={`rotate(${i * 120 + 60} 150 150)`}>
              <text
                x="150"
                y="67"
                textAnchor="middle"
                className="wheel-number"
              >
                {p}
              </text>
              <text x="150" y="86" textAnchor="middle" className="wheel-label">
                كرت
              </text>
            </g>
          ))}
          {Array.from({ length: 24 }, (_, i) => (
            <circle
              key={i}
              cx={150 + 140 * Math.sin((i * Math.PI) / 12)}
              cy={150 - 140 * Math.cos((i * Math.PI) / 12)}
              r="2"
              className="wheel-light"
            />
          ))}
        </svg>
      </div>
      <div className="wheel-center">
        <Zap fill="currentColor" />
      </div>
    </div>
  );
}

export function RewardTeaser() {
  return (
    <section className="reward-teaser">
      <div className="section-heading">
        <h2>
          <Gift size={20} /> انتماؤك يكافئك
        </h2>
        <span className="new-badge">فرصتك للفوز</span>
      </div>
      <div className="reward-preview">
        <div>
          <span className="eyebrow">خلك معنا… واربح!</span>
          <h3>
            10 كروت.
            <br />
            لفة واحدة.
            <br />
            <span>وحظك علينا.</span>
          </h3>
          <p>
            اجمع كروتك المستخدمة
            <br />
            وجرّب حظك في عجلة المكافآت.
          </p>
          <Button asChild>
            <Link href="/rewards">
              يلا نجرّب <ArrowLeft />
            </Link>
          </Button>
        </div>
        <Wheel small />
      </div>
      <div className="prize-mini">
        {PRIZES.map((p) => (
          <span key={p}>
            <Ticket size={15} />
            <b>{p}</b> كرت
          </span>
        ))}
      </div>
    </section>
  );
}

export function RewardsPage() {
  const [codes, setCodes] = useState<string[]>(Array(10).fill(''));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{
    value: number;
    code: string | undefined;
    demo: boolean;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function animate(value: number, prizeCode: string | undefined, isDemo: boolean) {
    const finalRot = prizeRotation(value, 6);
    setRotation((prev) => prev + finalRot);
    setSpinning(true);
    setResult(null);

    timer.current = setTimeout(() => {
      setSpinning(false);
      setResult({ value, code: prizeCode, demo: isDemo });
      if (isDemo) {
        setMessage('هذه لفة تجريبية لتجربة إثارة العجلة!');
      } else {
        setMessage('مبروك! تم التحقق من الكروت بنجاح وربح كرت جديد.');
      }
    }, 4500);
  }

  function handleDemoSpin() {
    if (spinning) return;
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)] ?? 200;
    animate(randomPrize, undefined, true);
  }

  async function handleRealSubmit() {
    const err = validateCards(codes);
    if (err) {
      setMessage(err);
      return;
    }

    setSpinning(true);
    setMessage('');

    // Generate simulated network reward card
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)] ?? 500;
    const generatedCode = `TLQ-${Math.floor(10000000 + Math.random() * 90000000)}`;

    animate(randomPrize, generatedCode, false);
  }

  return (
    <>
      <PageHeading
        eyebrow="مكافآت الانتماء"
        title="انتماؤك لنا… له مكافأة."
        description="عشرة كروت مستخدمة، وفرصة للفوز بكرت جديد."
      />

      <div className="rewards-layout">
        {/* The Wheel */}
        <section className="reward-game">
          <div className="game-tag">
            <Sparkles size={16} /> عجلة طلقة نت
          </div>
          <h2>دور العجلة. وخلّ الحظ يتكلم.</h2>

          <Wheel rotation={rotation} />

          <div className="prize-mini">
            {PRIZES.map((p) => (
              <span key={p}>
                <Ticket size={16} />
                <b>{p}</b> كرت
              </span>
            ))}
          </div>

          <Button size="lg" disabled={spinning} onClick={handleDemoSpin}>
            <Play fill="currentColor" />
            {spinning ? 'العجلة تدور…' : 'جرّب العجلة'}
          </Button>

          <span className="demo-note">تجربة ترفيهية • لا تمنح كرتًا قابلًا للاستخدام</span>

          {result && (
            <div className="win-result" role="status">
              <Trophy />
              <h3>{result.demo ? 'نتيجة التجربة' : 'مبروك! مكافأتك وصلت'}</h3>
              <strong>كرت {result.value}</strong>
              {result.code && (
                <Button
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard?.writeText(result.code ?? '');
                    setMessage('تم نسخ رقم الكرت إلى الحافظة.');
                  }}
                >
                  <Copy />
                  {result.code}
                </Button>
              )}
              {result.demo && (
                <p>شارك بكروتك الـ 10 المستخدمة للفوز بمكافأة حقيقية فورية.</p>
              )}
            </div>
          )}
        </section>

        {/* 10 Cards Submission */}
        <section className="cards-entry">
          <span className="service-icon gold">
            <Gift />
          </span>
          <h2>كروتك القديمة، بداية جديدة</h2>
          <p>أدخل عشرة كروت مستخدمة من شبكة طلقة نت واستبدلها بكرت فوري.</p>

          <div className="steps">
            <span>
              <b>01</b> اجمع 10 كروت مستخدمة
            </span>
            <span>
              <b>02</b> تحقق من أرقام الكروت
            </span>
            <span>
              <b>03</b> لفّ العجلة واستلم كرتك الجديد
            </span>
          </div>

          <div className="availability-note">
            <ShieldCheck size={17} />
            <span>نظام طلقة نت الذكي يتحقق من الكروت ويضمن مكافأة كل مشترك وفي.</span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowForm(!showForm)}
          >
            <Ticket />
            {showForm ? 'إخفاء خانات الكروت' : 'إدخال كروتي العشرة'}
            <ArrowDown />
          </Button>

          {showForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleRealSubmit();
              }}
              style={{ marginTop: '16px' }}
            >
              <div className="card-inputs">
                {codes.map((c, i) => (
                  <label key={i}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <input
                      aria-label={`رقم الكرت ${i + 1}`}
                      placeholder="رقم الكرت"
                      dir="ltr"
                      value={c}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCodes((old) =>
                          old.map((v, j) => (i === j ? val : v))
                        );
                      }}
                    />
                    {c.trim() && <Check size={14} />}
                  </label>
                ))}
              </div>

              <div className="entry-count">
                <span>الكروت المُدخلة</span>
                <b>{codes.filter((c) => c.trim()).length} / 10</b>
              </div>

              <Button className="w-full" disabled={spinning} type="submit">
                <Zap />
                {spinning ? 'جارٍ التحقق…' : 'تحقق وابدأ اللعب'}
              </Button>
            </form>
          )}

          {message && (
            <p role="alert" className="form-message">
              {message}
            </p>
          )}

          <div className="reward-trust">
            <CircleHelp size={17} />
            <span>كل مجموعة كروت صالحة تُستخدم مرة واحدة فقط.</span>
          </div>
        </section>
      </div>
    </>
  );
}

export function SpeedPage() {
  return (
    <>
      <PageHeading
        eyebrow="فحص السرعة الفعلي"
        title="قوة اتصالك، بالأرقام."
        description="قياس دقيق لسرعة التنزيل والرفع الفعلي وزمن الاستجابة لاتصالك الحالي."
      />
      <div className="py-2">
        <SpeedTestView />
      </div>
    </>
  );
}

const memorySymbols = ['⚡', '🎮', '🏆', '🎯', '⚡', '🎮', '🏆', '🎯'];

export function LoungePage() {
  const [deck, setDeck] = useState(memorySymbols);
  const [opened, setOpened] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function choose(i: number) {
    if (opened.length === 2 || opened.includes(i) || matched.includes(i)) return;
    const next = [...opened, i];
    setOpened(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (
        next[0] !== undefined &&
        next[1] !== undefined &&
        deck[next[0]] === deck[next[1]]
      ) {
        setMatched((m) => [...m, ...next]);
        setOpened([]);
      } else {
        timer.current = setTimeout(() => setOpened([]), 800);
      }
    }
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setDeck([...memorySymbols].sort(() => Math.random() - 0.5));
    setOpened([]);
    setMatched([]);
    setMoves(0);
  }

  return (
    <>
      <PageHeading
        eyebrow="الاستراحة"
        title="خذ لك بريك. غيّر جو."
        description="دقائق خفيفة، تحديات لطيفة، ومزاج أحلى."
      />

      <div className="lounge-layout">
        <section className="memory-game">
          <div className="game-tag">
            <Gamepad2 size={17} /> تحدي الذاكرة
          </div>
          <div className="section-heading">
            <h2>لقّط المتشابه!</h2>
            <span>{moves} محاولات</span>
          </div>

          <div className="memory-grid">
            {deck.map((symbol, i) => (
              <Button
                key={i}
                variant="secondary"
                aria-label={`بطاقة ${i + 1}`}
                onClick={() => choose(i)}
                className={
                  matched.includes(i) ? 'memory-card matched' : 'memory-card'
                }
                disabled={matched.includes(i)}
              >
                {matched.includes(i) || opened.includes(i) ? symbol : <Zap />}
              </Button>
            ))}
          </div>

          {matched.length === 8 && (
            <div className="win-result" role="status">
              <Trophy />
              <h3>يا سلام! ذاكرة من ذهب</h3>
              <p>أنهيت التحدي في {moves} محاولات.</p>
            </div>
          )}

          <Button variant="outline" onClick={reset}>
            <RotateCcw /> جولة جديدة
          </Button>
        </section>

        <div className="lounge-aside">
          <div className="lounge-mark">
            <Gamepad2 />
          </div>
          <span className="eyebrow">استراحة طلقة</span>
          <h2>
            متصلين…
            <br />
            حتى في وقت الراحة.
          </h2>
          <p>
            جرّب تحدي الذاكرة، أو استمتع بأجواء المباريات وأحدث الأخبار.
          </p>
          <Button asChild>
            <Link href="/live">
              إلى ملعبك <ArrowLeft />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
