# سجل الوكلاء والتغييرات (Agent Change Log) — شبكة طلقة نت

> **القاعدة:** سجل إضافة فقط (Append-Only). كل إنجاز رئيسي يتم تدوينه بتفاصيله وملفاته وقراراته.

---

## [2026-10-13 01:45] المرحلة 1 — الأساس: تنظيف المستودع، نظام التصميم، صدفة التطبيق، وبنية PWA

- **ما تم:**
  1. استنساخ ودراسة الكود القديم للمشروع وعزله بالكامل في مجلد `legacy/` واستبعاده من `tsconfig.json` وفاحص ESLint.
  2. إنشاء ملف الثوابت والروابط المركزية `src/config/links.ts` ليكون مصدر الحقيقة الوحيد.
  3. تعريف عقود الأنواع الصارمة في `src/types/index.ts` وتجهيز بيانات الباقات الرسمية (200، 500، 1000، 4000 ريال يمني) ونقاط التوزيع الأولية مع علم `isPlaceholder: true`.
  4. بناء نظام تصميم عربي RTL كامل في `app/globals.css` مع مكتبة مكونات أصلية تضم 11 مكوناً تفاعلياً (`Button`, `Card`, `Chip`, `Badge`, `Sheet`, `Tabs`, `Skeleton`, `Toast`, `EmptyState`, `ListItem`, `IconButton`).
  5. إنشاء صفحة دليل نظام التصميم للمطورين `/design`.
  6. بناء صدفة التطبيق (App Shell) في `app/page.tsx` بشريط تنقل سفلي 5 تبويبات وترويسة متقدمة مع أزرار الدخول إلى `t.net` وفحص الرصيد، وتنبيه الواي فاي الذكي.
  7. بناء شاشات الباقات، الاستراحة (حالة فارغة صادقة ومحترمة للمرحلة 2)، المباريات (حالة فارغة صادقة للمرحلة 2)، والمزيد مع تذييل المطور الرسمي.
  8. بناء نوافذ فحص السرعة الحقيقي (Real Ping) ومسابقة الانتماء (المرحلة 3).
  9. تنفيذ بنية PWA المتقدمة: `manifest.webmanifest`, `sw.js` باستراتيجيات Precache وNetworkFirst وCacheFirst، صفحة `offline.html`، خطاف `usePWAInstall` مع بطاقة تثبيت iOS، وأيقونات بدقة 192 و512 و180.
  10. إعداد ملفات التوثيق السبعة في `docs/` وحفظ لقطات الشاشة التوثيقية.
  11. التحقق التام من نجاح `npm run build` و`npm run lint` بنسبة 100%.

- **الملفات الرئيسية:**
  - `src/config/links.ts`
  - `src/data/packages.ts`, `src/data/distributors.ts`, `src/data/announcements.ts`
  - `src/types/index.ts`
  - `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/design/page.tsx`
  - `src/components/ui/*` (11 مكوناً)
  - `src/components/layout/AppHeader.tsx`, `src/components/layout/BottomNav.tsx`
  - `src/components/views/*` (`HomeView`, `PackagesView`, `LoungeView`, `MatchesView`, `MoreView`)
  - `src/components/pwa/*` (`OfflineIndicator`, `PWAInstallBanner`, `ServiceWorkerManager`)
  - `public/manifest.webmanifest`, `public/sw.js`, `public/offline.html`, `public/icon.svg`
  - `docs/*` (`PROJECT_BRIEF.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `TASKS.md`, `AGENT_LOG.md`, `DECISIONS.md`, `HANDOFF.md`)

- **القرارات:** تم توثيق القرارات DEC-001 إلى DEC-006 في `docs/DECISIONS.md`.
- **المتبقي/المشاكل للمرحلة 2:** ربط قاعدة بيانات Firestore الحية، إضافة الخريطة التفاعلية لنقاط التوزيع بعد تأكيدها، دمج مشغل HLS للمباريات وسيرفر Jellyfin المحلي مع فاحص اتصال LAN، ومحرك فحص سرعة التحميل والرفع.
- **الالتزام (commit):** `b37c701` (phase1(docs): handoff - finalize build and handoff documentation)

---

## [2026-10-13 06:05] المرحلة 1-ب — إعادة تصميم الواجهة بتوجيه فني صارم (نظام «مدار» Orbit)

- **ما تم:**
  1. استبدال الهوية البصرية الزرقاء بالكامل بنظام «مدار» (Orbit) المستوحى من أقمار ومدارات ستارلينك في مأرب.
  2. صياغة رموز ألوان CSS الصارمة: `--bg` (#F4F6F8), `--surface` (#FFFFFF), `--ink` (#0B1220), `--ink-2` (#5B6676), `--line` (#E3E8EE), `--signal` (#C6F24E), `--signal-soft` (#EEF9CF), `--sky` (#E6EEFB).
  3. استضافة خطوط Readex Pro (للعناوين والأرقام والأسعار) و IBM Plex Sans Arabic (للنصوص) محلياً في `public/fonts/` لضمان استقلالية كاملة عن الشبكات الخارجية.
  4. بناء شعار المتجهات الأصلي `BrandLogo.tsx` وحلقة الإشارة المدارية `SignalRing.tsx` بدون بهرجة أو تدرجات لونية عشوائية.
  5. معالجة كافة العيوب المرفوضة:
     - إزالة جميع رموز الإيموجي في العناوين والبطاقات واستبدالها بأيقونات `lucide-react` (stroke 1.75).
     - منع انكسار وحدات القياس (ms, Mbps) برمجياً عبر `whitespace-nowrap`.
     - فصل شريط التنبيه عن الترويسة ودمجه داخل انسيابية الصفحة مع نافذة إرشادية سفلية `Sheet`.
     - تنويع بطاقات الشبكة عبر شبكة Bento متوازنة تجمع بطاقة الولاء (Signal-Soft) وبطاقة المباريات (Sky).
  6. بناء شريط التنقل السفلي الطائف بكبسولة إشارة ليمونية تفاعلية مدعومة بـ Motion.
  7. توثيق الهوية الجديدة بالكامل في `/design` وتحديث `docs/DESIGN_SYSTEM.md`، `docs/DECISIONS.md` (DEC-007)، `docs/TASKS.md`، و `docs/HANDOFF.md`.
  8. التحقق التام من اجتياز البناء `compile_applet` بنجاح بنسبة 100%.

- **الملفات الرئيسية المعدلة:**
  - `app/globals.css`, `app/page.tsx`, `app/design/page.tsx`
  - `src/components/ui/BrandLogo.tsx`, `src/components/ui/SignalRing.tsx`, `src/components/ui/*`
  - `src/components/layout/AppHeader.tsx`, `src/components/layout/BottomNav.tsx`
  - `src/components/views/HomeView.tsx`, `src/components/views/PackagesView.tsx`
  - `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, `docs/TASKS.md`, `docs/AGENT_LOG.md`, `docs/HANDOFF.md`
- **القرارات:** تم توثيق DEC-007 في `docs/DECISIONS.md`.

---

## [2026-10-13 06:14] تصحيح توافق الترطيب وحفظ الاستقرار (Fix Hydration Mismatch)
- **المشكلة:** حدوث خطأ `Hydration failed because the server rendered text didn't match the client` الناتج عن قراءة `localStorage` و `window`/`navigator` المتزامنة في دورة التهيئة الأولى للمكونات.
- **الحل الجذري:**
  1. ترقية إدارة الحالة الخارجية لقراءة البينج المخزن (`talqa_last_ping`) في `HomeView.tsx` باستخدام معيار React 18/19 الحديث `useSyncExternalStore` مع توفير `getServerSnapshot = () => null`.
  2. تحديث خطاف حالة الاتصال `useOnlineStatus.ts` بالاعتماد على `useSyncExternalStore` لتطابق النص بين الخادم والعميل أثناء عملية الترطيب.
  3. تحديث خطاف تثبيت التطبيق `usePWAInstall.ts` لضمان عدم وجود فروع SSR/Client غير متطابقة قبل اكتمال الترطيب وتفادي تحذيرات `react-hooks/set-state-in-effect`.
  4. إضافة `suppressHydrationWarning` لعنصر `html` في `app/layout.tsx` لتفادي تدخل ملحقات المتصفح.
  5. نجاح الفحص `npm run lint` والتجميع `compile_applet` بنسبة 100%.

---

## [2026-10-13 06:26] تحسين التصميم: الهوية الملكية (اللون الذهبي + الأزرق الشبكي + شعار طلقة نت)
- **ما تم:**
  1. استبدال الأسود الداكن باللون الذهبي الملكي المتدرج (`#C59424` / `#D4AF37`) في الأزرار الأساسية وعناصر الجذب والشعار.
  2. استبدال اللون الليموني بالأزرق الشبكي السيان (`#0284C7`) المخصص لتطبيقات شبكات الإنترنت الفضائي وبث الألياف.
  3. إعادة تصميم شعار طلقة نت `BrandLogo.tsx` ليمثل سهم الطلقة الخارقة وقوس ترددات بث الإنترنت في درع ذهبي ملكي.
  4. تحويل الزر الرئيسي لبوابة `t.net` إلى زر ذهبي مشع فائق الفخامة.
  5. تحديث حلقة الإشارة `SignalRing` بقوس ترددات شبكية بالأزرق السيان وزر فحص ذهبي.
  6. تحديث كبسولة شريط التنقل السفلي والبطاقات وشارات الباقات لتتناغم بدقة مع الهوية الجديدة.
  7. توثيق القرار DEC-008 في `docs/DECISIONS.md` وتحديث `docs/DESIGN_SYSTEM.md`.

---

## [2026-10-13 10:15] المرحلة 2 — الميزات الحية: فحص السرعة الفعلي + الاستراحة + بث المباريات HLS + الخريطة + طبقة البيانات
- **ما تم:**
  1. **محرك فحص السرعة الفعلي (Throughput SpeedTest):**
     - بناء محرك `SpeedTestRunner` بدعم مزودين: خوادم Cloudflare Global Edge ومزود محلي احتياطي عبر Route Handlers (`/api/speed/down` و`/api/speed/up`).
     - قياس زمن الاستجابة والتذبذب بدقة (10 عينات مع استبعاد الإحماء وحساب الوسيط)، وقياس التحميل والرفع بمتوسط مقطوع بالميجابت/ثانية (Mbps).
     - كتابة 11 اختبار وحدة في `src/lib/speedtest/math.test.ts` وتمريرها بنجاح 100% عبر Vitest.
     - واجهة عداد حية 60fps مع خيار مشاركة النتيجة وسجل آخر 10 فحوصات برسم بياني مصغر Sparkline وتنبيه استهلاك بيانات الهاتف.
  2. **خريطة نقاط التوزيع التفاعلية وتفاصيل الباقات:**
     - دمج خريطة Leaflet و OpenStreetMap بدون أي مفتاح API مع تخصيص علامات الخريطة (ذهبية وسيان) ونوافذ المعلومات والتوجيه.
     - حساب حالة فتح وإغلاق المحلات من ساعات مهيكلة وحساب المسافة التقديرية بالكيلومتر عبر Geolocation عند منح الإذن.
     - ورقة تفاصيل سفلية Sheet لكل فئة كرت مع خطوات الاستخدام ومنافذ البيع وزر طلب واتساب المباشر.
  3. **استراحة طلقة نت (Lounge View):**
     - بناء بطاقات الاستراحة المغذاة من طبقة البيانات لسيرفر الأفلام Jellyfin وتنزيلات ألعاب وتطبيقات الشبكة بأحجامها الفعلية.
     - التعامل مع قيود المحتوى المختلط (Mixed Content) بروابط تنقل علوية آمنة وإشعار صادق («تعمل داخل شبكة طلقة فقط»).
     - إبقاء لعبة تحدي الذاكرة كنشاط ترفيهي يعمل بدون اتصال بالإنترنت.
  4. **مشغل بث المباريات HLS:**
     - بناء مشغل `HlsVideoPlayer` المعتمد على `hls.js` مع التشغيل الأصلي على Safari/iOS، ودعم ملء الشاشة، وPicture-in-Picture، وتبديل الجودة، وإعادة المحاولة.
     - دمج Screen Wake Lock لمنع قفل الشاشة أثناء المشاهدة.
     - زرع القنوات الثلاث بحالة `enabled: false` لحين اعتماد تراخيص البث بدون أرقام أو نتائج أو معلقين وهميين.
  5. **طبقة البيانات المزدوجة (ContentRepository):**
     - بناء تنفيذ البذور الثابتة التلقائي وتنفيذ Supabase التلقائي.
     - كتابة ملف ترحيل SQL كامل `supabase/migrations/0001_content_tables.sql` مع سياسات أمان RLS للقراءة العامة الصارمة.
  6. **ترويسات الأمان وPWA:**
     - تحديث `vercel.json` بسياسة Permissions-Policy (`geolocation=(self)`, `camera=(self)`) وCSP مدروسة.
     - ترقية Service Worker إلى النسخة `talqanet-cache-v2` وإضافة كاش لبلاطات OpenStreetMap.
     - إعداد لقطات الشاشة التوثيقية في `docs/screenshots/phase2/`.
- **الملفات الرئيسية:**
  - `src/lib/speedtest/math.ts`, `src/lib/speedtest/math.test.ts`, `src/lib/speedtest/engine.ts`
  - `app/api/speed/down/route.ts`, `app/api/speed/up/route.ts`
  - `src/components/speed/SpeedTestView.tsx`, `src/components/modals/SpeedTestModal.tsx`
  - `src/components/map/DistributorsMap.tsx`, `src/components/media/HlsVideoPlayer.tsx`
  - `src/lib/data/repository.ts`, `supabase/migrations/0001_content_tables.sql`
  - `src/components/views/LoungeView.tsx`, `src/components/views/MatchesView.tsx`, `src/components/views/PackagesView.tsx`
  - `app/packages/page.tsx`, `app/speed/page.tsx`, `app/lounge/page.tsx`, `app/live/page.tsx`
  - `public/sw.js`, `vercel.json`, `vitest.config.ts`, `.env.example`
  - `docs/screenshots/phase2/*`, `docs/*`
- **القرارات:** تم توثيق القرارات DEC-009 إلى DEC-013 في `docs/DECISIONS.md`.
- **الالتزام (commit):** `phase2(features): implement real speedtest, leaflet map, hls player, and dual data layer`

---

## [2026-10-13 17:35] توثيق اعتماد Firebase Firestore & Auth بطلب صاحب المشروع

- **ما تم:**
  1. توثيق قرار DEC-014 في `docs/DECISIONS.md` باعتماد Google Firebase (`talqanet-cf3e1`) بقواعد Cloud Firestore ومصادقة Firebase Auth كقاعدة بيانات رسمية للمشروع بدلاً من Supabase.
  2. تحديث خطة عمل المرحلة 3 في `docs/HANDOFF.md` لنقل مسابقة الولاء، وصندوق الجوائز، والمعاملات الذرية `runTransaction()`، ولوحة الإدارة إلى Firebase Firestore.
  3. تحديث ملف `.env.example` بإضافة متغيرات تهيئة Firebase الرسمية.
  4. تحديد البيانات المطلوبة من مالك المشروع (Web App Config Object) للربط الفوري.

---

## [2026-10-13 19:00] المرحلة 3 — مسابقة الانتماء + لوحة الإدارة + الأمان + الإنهاء (الوكيل 3 — تسليم الإنتاج)

- **ما تم:**
  1. **مسابقة الانتماء ونظام الولاء السحابي (Server-Authoritative Loyalty System):**
     - بناء المحرك السحابي `src/lib/loyalty/serverLoyaltyEngine.ts` مع خوارزمية سحب مشفرة عشوائية بـ `crypto.randomInt` من Node.js مرجحة بنسب الفئات.
     - معالجة الخلل الأمني القديم جذرياً: حظر خروج أكواد الجوائز إلى العميل إلا بعد إتمام المعاملة بنجاح، ومنع قراءة مجموعات الجوائز والكروت المحروقة من المتصفح في `firestore.rules`.
     - تنفيذ العمليات الذرية (Atomicity): التحقق من الكروت، حرقها، سحب الجائزة، وتسجيل المعاملة دفعة واحدة، مع تراجع كامل في حال نفاد المخزون دون حرق كروت المشترك.
     - دعم مفتاح عدم التكرار (Idempotency Key) لإعادة نفس النتيجة عند تذبذب الشبكة بدون حرق مكرر.
     - تطبيق Rate Limiting وبصمة IP hash وتأخير تصاعدي عند المحاولات الفاشلة وحماية الكروت الجديدة من الحرق.
     - بناء واجهة المستخدم `LoyaltyContestView.tsx` بشريط دائري (0/10)، لصق دفعة واحدة، مسح QR بالكاميرا عبر `html5-qrcode`، وعجلة حظ 60fps على Canvas بأصوات ميكانيكية عبر Web Audio API وهزة تفاعلية واحتفال Confetti ومحفظة جوائز محلية.
     - بناء مسارات API: `/api/loyalty/config`, `/api/loyalty/verify-card`, `/api/loyalty/redeem`.
  2. **لوحة الإدارة والتحكم المصغّرة المحمية (`/admin`):**
     - حماية المسار بمصادقة حقيقية عبر Firebase Authentication وصلاحيات المشرفين بدون أي PIN ثابت في الكود.
     - بناء واجهة الإدارة `AdminDashboardView.tsx` المتوافقة مع الجوال والحواسيب:
       - صندوق الجوائز (Prize Vault): استعراض المخزون، تنبيهات انخفاض الرصيد، إضافة فردية وجماعية (CSV)، وإخفاء الأكواد افتراضياً مع كشفها عند الطلب.
       - فئات وأوزان السحب: تعديل النسب المئوية مع التحقق من أن المجموع = 100%.
       - كروت الشبكة: استيراد الكروت المستهلكة من ميكروتك لدعم التحقق السحابي.
       - سجل المعاملات: تتبع الفائزين والكروت المحروقة مع بحث وتصدير ملف CSV.
       - مفتاح إيقاف وتشغيل المسابقة فوري وسقف الاستبدال اليومي.
       - إدارة المحتوى (CMS) للباقات والإعلانات ونقاط التوزيع.
     - مسارات API الإدارية: `/api/admin/loyalty/*` و`/api/admin/content`.
  3. **الأمان والتنظيف وضمان الجودة:**
     - تشديد قواعد `firestore.rules` لحظر قراءة `reward_vault` و`consumed_vouchers` من العميل.
     - كتابة 10 اختبارات وحدة Vitest في `serverLoyaltyEngine.test.ts` (إجمالي 21 اختبار ناجح بنسبة 100%).
     - حذف مجلد `legacy/` ومجلد `lovable-ref/` بالكامل لتسليم مستودع نقي.
     - إنشاء وثيقة `README.md` وقائمة التحقق `docs/RELEASE_CHECKLIST.md` وإعادة كتابة `docs/HANDOFF.md`.
     - اجتياز البناء النهائي `compile_applet` والفحص `eslint .` بنسبة 100%.

- **الملفات الرئيسية:**
  - `src/types/loyalty.ts`, `src/lib/server/firebaseAdmin.ts`, `src/lib/server/adminAuth.ts`
  - `src/lib/loyalty/serverLoyaltyEngine.ts`, `src/lib/loyalty/serverLoyaltyEngine.test.ts`
  - `src/lib/audio/soundManager.ts`, `src/components/loyalty/FortuneWheelCanvas.tsx`, `src/components/loyalty/QRScannerModal.tsx`
  - `src/components/loyalty/LoyaltyContestView.tsx`, `app/rewards/page.tsx`
  - `src/components/admin/AdminDashboardView.tsx`, `app/admin/page.tsx`
  - `app/api/loyalty/config/route.ts`, `app/api/loyalty/verify-card/route.ts`, `app/api/loyalty/redeem/route.ts`
  - `app/api/admin/loyalty/vault/route.ts`, `app/api/admin/loyalty/tiers/route.ts`, `app/api/admin/loyalty/cards/route.ts`, `app/api/admin/loyalty/transactions/route.ts`, `app/api/admin/loyalty/config/route.ts`, `app/api/admin/content/route.ts`
  - `firestore.rules`, `.env.example`, `README.md`, `docs/RELEASE_CHECKLIST.md`, `docs/HANDOFF.md`, `docs/TASKS.md`, `docs/DECISIONS.md`, `docs/AGENT_LOG.md`
- **القرارات:** تم توثيق القرارات DEC-015 إلى DEC-017 في `docs/DECISIONS.md`.
- **الالتزام (commit):** `phase3(release): implement server-authoritative loyalty contest, admin dashboard, secure firestore rules, and release checklist`

