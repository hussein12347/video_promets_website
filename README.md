# AI Video Studio — استوديو الفيديو الذكي

تطبيق ويب في ملف واحد (`index.html`) لصناعة الفيديو والمونتاج بالذكاء الاصطناعي، يشمل ريلز القرآن الكريم
(خط حفص الذكي، توقيت كلمات رسمي من Quran.com، أنماط خلفيات ثابتة ومتحركة، صورك وفيديوهاتك كخلفية بصوت مكتوم).
الواجهة بـ 9 لغات (العربية، English, Français, Español, Türkçe, اردو, فارسی, Bahasa Indonesia, Deutsch).

A single-file web app (`index.html`) for AI-assisted video making and montage, including Quran reels
(Hafs Smart font, official Quran.com word timing, static and animated backgrounds, your own images/videos as muted backgrounds).

## Run locally
Open `dist/index.html` in a recent Chrome/Edge, or serve the folder:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Build
```bash
python3 build/build.py   # src/ -> dist/index.html (needs only Python 3)
```
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layout and design patterns.

## Deploy on GitHub Pages
1. Create a repository and push these files to the `main` branch.
2. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/pages.yml`) publishes the site on every push.

## Notes
- Quran text/translation come from api.alquran.cloud; recitation + word timing from Quran.com (or EveryAyah as an alternative source). Internet is needed for these.
- Whisper (optional) downloads its model once from the internet, then runs in the browser.
- API keys (e.g. ElevenLabs) are stored only in your browser's localStorage and are never sent anywhere except the service you choose.
- Recitation audio and Quran text belong to their respective owners; check the terms of each source before publishing videos.

## ✨ جديد: تبويب «أدوات ذكية» (مونتاج ← 🧰)
- 🥁 **Beat Sync**: تحليل إيقاع أي موسيقى محليًا (BPM + شبكة beats) وضبط قطعات المشاهد عليها (أقرب beat أو عدد ثابت من الـbeats).
- 🎬 **مراجعة المخرج بالـAI**: لوحة مشاهد PNG + برومبت جاهز ← الصق رد النموذج (JSON) فتتطبّق التعديلات (مدة/انتقال/نص/تأثيرات/حذف/ترتيب) بخطوة تراجع واحدة.
- 🩺 **فحص الجودة** بإصلاح تلقائي، 💬 **تصدير SRT/VTT**، 🕘 **سجل نسخ** تلقائي ويدوي.
- ⌨️ **لوحة الأوامر `Ctrl+K`** للوصول لأي أداة أو مشهد.
- 📝 **تعديل بالنص**: امسح كلمات من النص فيتقص الصوت والفيديو + زر حذف كلمات التردد (اااا · امم · um · uh).
- 💓 **نبض الصورة على الإيقاع**، 🎚️ **موازنة مستوى الصوت** (صوت فوق الموسيقى)، 🖼️ **اقتراح صورة غلاف**، ⌨️ اضغط `?` لاختصارات الكيبورد.
- ✏️ **علامات متعددة الأشكال**: 20 نوع علامة (7 جديدة: نجمة · قلب · لمعة · استفهام · تعجب · هدف · برق) ولكل نوع 2–6 أشكال (متموج · مزدوج · فرشاة · كبسولة · زوايا · برأسين …) في معرض بمعاينات، ويمكن تغيير الشكل من الـInspector أو من JSON بالحقل `variant`.

## 🎬 جديد: «طرق احترافية» (مونتاج ← 🎬) + تمديد سلس في التايم لاين
- **تمديد حيّ**: سحب حافة أي مشهد أو عنصر في التايم لاين يتحدّث لحظيًا (المشاهد التالية والمعاينة تتبع الماوس) بدل أن يتحدّث بعد ترك الماوس.
- **منحنى الاحتفاظ** يحسب أماكن الملل ويقترح **مقاطعات نمط** (زووم/تأثير) في الفجوات.
- **مختبر الهوك**: بطاقة افتتاحية + تعزيز أول ثانيتين، **B-roll بالـAI** (قطع/فوق/خلفية)، **إعادة ترتيب القصة**، **فصول بعناوين ولوير ثيرد**، و4 **قوالب** (سوشيال · وثائقي · سينمائي · نظيف).

## ⚡ جديد: توليد المشاهد تلقائيًا + «صف شكل المونتاج بكلامك»
- **زر «ولّد المشاهد من الفيديو»** بجوار «نسخ البرومبت» في كل جزء (مونتاج AI): يبني المشاهد على جهازك من الكلام والسكتات بدون أي AI (قطع على السكتات، عبارة مفتاحية بتظهر مع نطقها، زووم/انتقالات/تأثيرات حسب وصفك، فيديو ظاهر أو أنيميشن حسب اختيارك).
- **خانة «صف شكل المونتاج بكلامك»** في قسم المونتاج وفي «طرق احترافية»: اكتب مثلًا «سريع ولاهث بزووم وقطع حاد وخلفية داكنة ولون أصفر كل 3 ثواني» فيظهر لك ما فُهم، ويُطبَّق على التوليد المحلي أو على المشاهد الموجودة، ويُضاف تلقائيًا لكل البرومبتات.
