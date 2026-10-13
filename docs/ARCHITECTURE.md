# الهيكل المعماري للنظام (System Architecture) — شبكة طلقة نت

> **الهدف:** توثيق هيكل المشروع، خريطة الشاشات، طبقة البيانات، إستراتيجيات PWA، وطريقة التشغيل لضمان استمرارية التطوير بين الوكلاء.

---

## 1) هيكل المجلدات (Directory Structure)

```
/
├── app/                          # Next.js 15 App Router
│   ├── admin/                    # لوحة الإدارة والتحكم السحابية للمشرفين (/admin)
│   │   └── page.tsx
│   ├── api/                      # مسارات الخادم (Route Handlers) المحمية
│   │   ├── admin/                # مسارات عمليات الإدارة وصندوق الجوائز
│   │   │   ├── content/route.ts
│   │   │   └── loyalty/{vault,tiers,cards,transactions,config}/route.ts
│   │   ├── loyalty/              # مسارات مسابقة الانتماء السحابية (Server-Authoritative)
│   │   │   ├── config/route.ts
│   │   │   ├── verify-card/route.ts
│   │   │   └── redeem/route.ts
│   │   └── speed/{down,up}/      # خوادم قياس السرعة الاحتياطية
│   ├── design/                   # صفحة دليل نظام التصميم للمطورين (/design)
│   ├── live/                     # بث المباريات المشغل المباشر (/live)
│   ├── lounge/                   # الاستراحة والتنزيلات المحلية (/lounge)
│   ├── packages/                 # باقات الكروت وخريطة مأرب (/packages)
│   ├── rewards/                  # مسابقة الانتماء وعجلة الحظ الرسمية (/rewards)
│   ├── speed/                    # فحص السرعة الشامل (/speed)
│   ├── globals.css               # متغيرات التصميم ورموز Design Tokens ونظام RTL
│   ├── layout.tsx                # الترويسة الجذرية، الميتا، PWA Tags، والخطوط
│   └── page.tsx                  # صدفة التطبيق الرئيسية (App Shell) ومبدل الشاشات
├── docs/                         # الذاكرة المشتركة وبروتوكول التسليم والتوثيق
│   ├── AGENT_LOG.md              # سجل الإنجازات والالتزامات (Append-Only)
│   ├── ARCHITECTURE.md           # هذا الملف (الهيكل المعماري والمسارات)
│   ├── DECISIONS.md              # سجل القرارات التقنية والبدائل وأسبابها
│   ├── DESIGN_SYSTEM.md          # دليل الرموز والمكونات وحركات الواجهة
│   ├── HANDOFF.md                # وثيقة التسليم النهائية للإنتاج
│   ├── PROJECT_BRIEF.md          # موجز المشروع والقواعد الصارمة والروابط
│   ├── RELEASE_CHECKLIST.md      # قائمة التحقق ما قبل الإطلاق
│   └── TASKS.md                  # قائمة المهام الإجمالية
├── public/                       # الأصول الثابتة وملفات PWA
│   ├── apple-touch-icon.png      # أيقونة iOS بدقة 180x180
│   ├── favicon.png               # أيقونة المفضلة
│   ├── icon.svg                  # الأيقونة المتجهة بدقة عالية
│   ├── manifest.webmanifest      # بيان PWA الرسمي وفق أحدث المعايير
│   ├── offline.html              # صفحة السقوط النظيف عند انقطاع الاتصال
│   └── sw.js                     # مشغل Service Worker المخصص
├── src/
│   ├── components/
│   │   ├── admin/                # مكونات لوحة الإدارة (AdminDashboardView)
│   │   ├── layout/               # ترويسة التطبيق وشريط التصفح السفلي
│   │   ├── loyalty/              # مسابقة الانتماء (LoyaltyContestView, FortuneWheelCanvas, QRScannerModal)
│   │   ├── map/                  # خريطة نقاط التوزيع بـ Leaflet
│   │   ├── media/                # مشغل HlsVideoPlayer مع Screen Wake Lock
│   │   ├── modals/               # النوافذ المنبثقة (SpeedTestModal, LoyaltyPreviewModal)
│   │   ├── pwa/                  # أدوات PWA (OfflineIndicator, PWAInstallBanner, ServiceWorkerManager)
│   │   ├── speed/                # فحص السرعة التفاعلي (SpeedTestView)
│   │   ├── ui/                   # مكتبة المكونات النيتف (Badge, Button, Card, Chip, Sheet, Toast, etc.)
│   │   └── views/                # الشاشات الرئيسية (HomeView, PackagesView, LoungeView, MatchesView, MoreView)
│   ├── config/
│   │   └── links.ts              # مصدر الحقيقة الموحد للروابط الرسمية
│   ├── data/                     # بذور البيانات الثابتة (Packages, Distributors, Announcements, Lounge, Channels)
│   ├── hooks/                    # خطافات React المخصصة (useOnlineStatus, usePWAInstall, useIsClient)
│   ├── lib/
│   │   ├── audio/                # مركب الأصوات عبر Web Audio API (soundManager)
│   │   ├── data/                 # طبقة البيانات المزدوجة (ContentRepository, FirestoreRepository, StaticSeedRepository)
│   │   ├── firebase/             # اتصال Firebase Client SDK
│   │   ├── loyalty/              # محرك الولاء السحابي واختبارات الوحدة (serverLoyaltyEngine)
│   │   ├── server/               # أدوات الخادم الإدارية (firebaseAdmin, adminAuth)
│   │   └── speedtest/            # محرك فحص السرعة الفعلي واختبارات الرياضيات
│   └── types/                    # العقود والأنماط المعرفة بدقة (index.ts, loyalty.ts)
├── firestore.rules               # قواعد أمان Firestore الصارمة
├── .env.example                  # نموذج متغيرات البيئة بدون أسرار
├── package.json                  # التبعيات الخفيفة وحزمة التشغيل
├── tsconfig.json                 # ضبط التايب سكريبت الصارم
└── vercel.json                   # ترويسات الأمان وسياسات الكاش لـ Vercel
```

---

## 2) مسابقة الانتماء: البنية المعتمدة (Server-Authoritative Loyalty Architecture)

```
[ متصفح المشترك (PWA) ]
      │
      ├─ 1. إدخال 10 كروت (لصق / كتابة / مسح QR)
      ├─ 2. فحص لحظي للكرت: POST /api/loyalty/verify-card
      │
      └─ 3. طلب الاستبدال والسحب: POST /api/loyalty/redeem
            (مصحوباً بـ Idempotency Key)
                  │
                  ▼
      [ خادم التطبيق (Next.js Route Handler) ]
            │
            ├─ فحص معدل الطلبات (Rate Limiting) وتأخير تصاعدي
            ├─ التحقق من الكروت الـ 10 (منع التكرار، التأكد أنها مستهلكة وليست جديدة)
            ├─ فحص Idempotency: إذا كان مكرراً يُعاد نفس الفوز فوراً
            ├─ سحب الجائزة عبر crypto.randomInt مرجحاً بنسب الفئات
            │
            ├─ معاملة ذرية في Firestore:
            │     ├─ حرق الكروت الـ 10 في /consumed_vouchers
            │     ├─ خصم كرت الجائزة من /reward_vault وتعليمه claimed
            │     └─ تسجيل المعاملة في /reward_claims
            │
            └─ تسليم الكود الفائز للعميل فقط بعد نجاح العملية بالكامل
                  │
                  ▼
      [ متصفح المشترك ]
            ├─ دوران عجلة الحظ 60fps على Canvas لتهبط بدقة على الفئة المسحوبة
            ├─ أصوات ميكانيكية + اهتزاز + قصاصات احتفال Confetti
            └─ عرض الكود الفائز، زر النسخ، زر الانتقال لـ t.net، وحفظه في المحفظة
```

---

## 3) قواعد أمان Firestore (Firestore Security Hardening)

- **المحتوى العام (`packages`, `distributors`, `announcements`, `channels`, `lounge_items`, `app_settings`):**
  `allow read: if true;` و `allow write: if request.auth != null;`.
- **المجموعات الحساسة للمسابقة (`reward_vault`, `consumed_vouchers`, `reward_claims`, `network_cards_ledger`, `loyalty_idempotency`):**
  `allow read, write: if request.auth != null;`.
  لا يمكن لأي متصفح عادي قراءة أكواد الجوائز أو الكروت المحروقة مباشرة؛ كافة التعاملات تمر وجوباً عبر مسارات الخادم `/api/loyalty/*`.

---

## 4) كيفية تشغيل وبناء المشروع

```bash
# تشغيل خادم التطوير المحلي
npm run dev

# فحص واختبارات الجودة
npm test
npm run lint

# بناء نسخة الإنتاج المستقلة
npm run build
```
