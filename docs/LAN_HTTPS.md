# توثيق الإعداد الدائم للبث والاستراحة عبر HTTPS المحلي (LAN HTTPS)

> **الهدف:** تمكين تشغيل قنوات البث المباشر (HLS) وسيرفر الأفلام (Jellyfin) وملفات التحميل **مباشرةً داخل واجهة تطبيق طلقة نت عبر HTTPS** دون اعتراض المتصفحات لسياسة المحتوى المختلط (Mixed Content)، ودون استهلاك للإنترنت الخارجي.

---

## 1. الفكرة المعمارية (Architecture)

1. **نطاق فرعي معتمد (Real FQDN):**
   - اختيار نطاق فرعي من نطاق يملكه صاحب المشروع (مثال: `media.samtecai.com` أو `stream.talqanet.com`).
2. **شهادة SSL معتمدة عبر تحدي DNS-01:**
   - إصدار شهادة Let's Encrypt رسمية عبر تحدي `DNS-01` بواسطة `acme.sh` أو `certbot` أو خادم `Caddy`. لا يتطلب فتح أي منافذ خارجية على الميكروتك أو الخادم، ولا يتطلب عنوان IP عام ثنائي الاتجاه على الخادم.
3. **توجيه DNS ثابت في الميكروتك (Split-Horizon DNS):**
   - إضافة سجل DNS ثابت داخل راوتر الميكروتك يوجه النطاق `media.samtecai.com` إلى العنوان الداخلي `192.168.50.2`.
   - النتيجة: كافة أجهزة المشتركين المتصلين بالشبكة ستحل هذا الاسم محلياً إلى `192.168.50.2` بسرعة خارقة ودون الحاجة لاتصال إنترنت خارجي.

---

## 2. خطوات التنفيذ العملي

### الخطوة 1: إضافة السجل الثابت في راوتر MikroTik
من خلال Terminal في WinBox أو SSH:
```routeros
/ip dns static add name="media.samtecai.com" address=192.168.50.2 ttl=1d comment="Local LAN Media & Streaming HTTPS"
```

تأكد أيضاً من إدراج النطاق في Walled Garden لكي يتصفحه المشتركون مجاناً حتى قبل تسجيل الدخول بالكرت:
```routeros
/ip hotspot walled-garden add dst-host="media.samtecai.com" action=allow comment="Talqa Net Free Local Streaming"
/ip hotspot walled-garden ip add dst-address=192.168.50.2 action=accept comment="Talqa Net Local Media Server"
```

---

### الخطوة 2: إصدار شهادة Let's Encrypt بتحدي DNS-01
باستخدام أداة `acme.sh` على سيرفر لينكس (192.168.50.2):
```bash
# مثال باستخدام Cloudflare DNS API (أو أي مزود DNS للمجال)
export CF_Token="your-cloudflare-dns-token"
export CF_Account_ID="your-cloudflare-account-id"

# إصدار الشهادة بتحدي DNS
acme.sh --issue --dns dns_cf -d media.samtecai.com
```

---

### الخطوة 3: إعداد Caddy أو Nginx كـ Reverse Proxy أمام الخدمات
يمكن تشغيل خادم `Caddy` كبوابة HTTPS محلية فائقة البساطة على المنفذ 443:

#### نموذج ملف `Caddyfile` (مثال استرشادي):
```caddy
media.samtecai.com {
    tls /root/.acme.sh/media.samtecai.com/fullchain.cer /root/.acme.sh/media.samtecai.com/media.samtecai.key

    # ترويسات CORS للسماح لتطبيق الويب بقراءة البث
    header {
        Access-Control-Allow-Origin "https://talqanet.vercel.app"
        Access-Control-Allow-Methods "GET, OPTIONS"
        Access-Control-Allow-Headers "*"
    }

    # توجيه البث المباشر (MediaMTX)
    handle_path /live/* {
        reverse_proxy http://127.0.0.1:8888
    }

    # توجيه سيرفر الاستراحة والأفلام (Jellyfin)
    handle_path /jellyfin/* {
        reverse_proxy http://127.0.0.1:8096
    }

    # توجيه ملفات التحديثات والتحميلات
    handle_path /files/* {
        reverse_proxy http://127.0.0.1:8080
    }
}
```

#### ملاحظة إعداد MediaMTX لترويسات CORS:
في ملف `mediamtx.yml`، تأكد من ضبط:
```yaml
hlsAllowOrigin: 'https://talqanet.vercel.app'
```

---

### الخطوة 4: تحديث روابط القنوات في لوحة الإدارة
فور تشغيل الشهادة، قم بتسجيل الدخول للوحة إدارة طلقة نت (`/admin`) وضع الرابط الآمن في حقل `httpsUrl` لكل قناة:
- `beIN Sports 1`: `https://media.samtecai.com/live/bein1/index.m3u8`
- `beIN Sports 2`: `https://media.samtecai.com/live/bein2/index.m3u8`
- `SSC Sports 1`: `https://media.samtecai.com/live/ssc1/index.m3u8`

**النتيجة النهائية:**
سيعمل المشغل المدمج في تطبيق الويب المثبت على الهاتف فوراً وبجودة فائقة وسرعة محلية داخل الشبكة بدون أي حجب.
