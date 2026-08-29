# AuditMyTracking — Master Project Notes

সর্বশেষ আপডেট: 29 August 2026

---

## ১. প্রজেক্ট পরিচিতি

- **নাম:** AuditMyTracking
- **কী করে:** যেকোনো ওয়েবসাইটের tracking/conversion setup অডিট করে
  (GTM, GA4, Google Ads, Meta Pixel/CAPI, Consent Mode v2, sGTM,
  TikTok, Snapchat, Pinterest, LinkedIn, Twitter/X detection)
- **মালিক:** Abdullah Al Masum (Web Analytics Solution — WAS)
- **লক্ষ্য:** ফ্রি অডিট টুল → লিড জেনারেশন → পরে subscription মডেল

---

## ২. হোস্টিং ও ডোমেইন

- **হোস্টিং:** GitHub Pages (static)
- **রিপো:** github.com/KhayrulBashar/auditmytracking (branch: main)
- **কাস্টম ডোমেইন:** auditmytracking.com (CNAME ফাইল দিয়ে সেট)
- **ডেপ্লয়:** git push origin main → GitHub Pages অটো রিডিপ্লয় (১-২ মিনিট)
- **লোকাল ডেভ:** VS Code + Live Server (http://127.0.0.1:5500/)

### ⚠️ Launch Checklist (লাইভ করার আগে অবশ্যই)
- [ ] index.html এর `<head>` থেকে এই দুই লাইন মুছতে হবে:
      `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />`
      `<meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet" />`
      (এখন Testing Mode-এ crawl বন্ধ রাখা আছে — ইচ্ছাকৃত)

---

## ৩. ফাইল স্ট্রাকচার

```
auditmytracking/
├── index.html          # মূল পেজ (GTM snippet, meta, সব view)
├── style.css
├── CNAME               # auditmytracking.com (custom domain)
├── robots.txt
└── js/
    ├── config.js       # গ্লোবাল কনফিগ, Supabase client, key, endpoint
    ├── app.js          # notification modal, DOMContentLoaded init
    ├── audit.js        # আসল অডিট লজিক (Edge Function কল করে)
    ├── auth.js         # signup/login/OTP (Supabase auth)
    └── booking.js      # booking modal + Google Sheet submit
```

---

## ৪. Supabase সেটআপ (গুরুত্বপূর্ণ)

- **Project ref:** flpmaegkhkxxaitlgglv
- **Project URL:** https://flpmaegkhkxxaitlgglv.supabase.co
- **Dashboard:** supabase.com/dashboard/project/flpmaegkhkxxaitlgglv

### API Key (নতুন সিস্টেম — গুরুত্বপূর্ণ!)
- এই প্রজেক্ট **নতুন publishable key সিস্টেম** ব্যবহার করে, পুরনো JWT anon key নয়।
- **Publishable key (default):** `sb_publishable_wWGc69H8LTBhNjDg77ANIw_A0WWdTvB`
- এই key ব্রাউজারে ব্যবহার নিরাপদ (পাবলিক)।
- পুরনো legacy anon key (eyJ... দিয়ে শুরু) দিয়ে Edge Function কল করলে
  **401 INVALID_CREDENTIALS** আসে — এটাই বড় সমস্যা ছিল, publishable key দিয়ে সমাধান।

### Edge Function: audit-scan
- **URL:** https://flpmaegkhkxxaitlgglv.supabase.co/functions/v1/audit-scan
- **কাজ:** টার্গেট সাইটের HTML + ভেতরের external <script> ও GTM container fetch করে
  আসল tag detection করে। কোনো fake/জোর করে true সেট নেই।
- **Method:** POST, body: { "url": "https://example.com" }
- **Setting:** "Verify JWT with legacy secret" = OFF (কিন্তু publishable key
  header তবু পাঠাতে হয়)
- **সঠিক response:** { ok: true, url, detect: {...}, found: {...}, scannedScripts }

### Edge Function কল করার সঠিক header (audit.js এ ব্যবহৃত)
```js
headers: {
  "Content-Type": "application/json",
  "apikey": "sb_publishable_wWGc69H8LTBhNjDg77ANIw_A0WWdTvB",
  "Authorization": "Bearer sb_publishable_wWGc69H8LTBhNjDg77ANIw_A0WWdTvB"
}
```

---

## ৫. অডিট আর্কিটেকচার

```
GitHub Pages (frontend)
      │  POST + publishable key
      ▼
Supabase Edge Function (audit-scan)
      │  HTML + external scripts + GTM container fetch
      ▼
আসল tag detection → JSON ফেরত
```

- **বর্তমান মডেল: Option B (ফ্রি)** — raw HTML + external script স্ক্যান।
  Browser render করে না, তাই ৭০-৮০% কেস ধরে।
- **সীমাবদ্ধতা:** বড় সাইট (Shopify, Facebook) bot ব্লক করে, তখন
  scannedScripts: 0 আসতে পারে, detection কম হয়।
- **ভবিষ্যৎ: Option A (পেইড)** — Browserless/ScrapingBee/Cloudflare Browser
  Rendering দিয়ে সত্যিকারের render → ৯৫%+ নির্ভুলতা। ট্রাফিক বাড়লে,
  subscription income দিয়ে যোগ করা হবে।

---

## ৬. Auth সিস্টেম (Supabase)

- signup → Google Sheet এ লিড যায় → Supabase OTP email পাঠায়
- OTP verify → dashboard এ ঢোকে
- Google OAuth ও আছে
- OTP email এখন **ইনবক্সে** আসছে (আগে spam এ যেত) — ঠিক হয়েছে
- সেন্ডার: contact@auditmytracking.com

---

## ৭. dataLayer Events (নিজের কনভার্সন ট্র্যাকিং)

- `run_audit` — অডিট শুরু হলে
- `audit_complete` — রিপোর্ট তৈরি হলে (score, issues, platforms সহ)
- `audit_failed` — সাইট রিচ না হলে
- `download_report` — CSV/PDF ডাউনলোডে (report_type সহ)
- `book_tracking_success` / `fix_tracking_success` — booking submit এ (booking.js)
- `login_success` — লগইনে (auth.js)

---

## ৮. যা যা সম্পন্ন হয়েছে ✅

1. আসল অডিট ইঞ্জিন (Edge Function) — আগের fake CORS-proxy detection বাদ
2. config.js — নতুন publishable key, GTM ID, endpoint এক জায়গায়
3. audit.js — Edge Function integration, নিজের dataLayer tracking
4. fake fallback মুছে ফেলা (আগে সাইট রিচ না হলেও "সব পাস" দেখাতো)
5. CNAME পুনরুদ্ধার (একবার ভুলে delete হয়েছিল)
6. crawl blocking নিশ্চিত (noindex meta tags)

---

## ৯. যা এখনো বাকি ⏳ (প্রায়োরিটি অনুযায়ী)

### 🔴 CRITICAL — Security
1. **নকল লগইন:** এখন login শুধু localStorage চেক করে
   (`user_logged_in=true`)। যে কেউ browser console এ
   `localStorage.setItem("user_logged_in","true")` লিখে বাইপাস করতে পারে।
   কোনো সার্ভার ভেরিফিকেশন নেই। → Supabase session-নির্ভর করতে হবে।
2. **খোলা Google Sheet webhook:** GOOGLE_SHEET_WEBHOOK_URL ক্লায়েন্ট কোডে
   উন্মুক্ত। যে কেউ POST করে ফেক লিড ঢোকাতে পারে। ফিল্টার শুধু client-side।
3. **Supabase RLS:** Row Level Security policy ঠিকমতো আছে কিনা চেক করা দরকার।

### 🟡 প্রফেশনাল করা
4. **OTP Email template** — এখন প্লেইন টেক্সট। ব্র্যান্ডেড HTML template
   (cyan/indigo, লোগো) বানানো হবে। → *পরবর্তী কাজ*
   - দরকার: লোগোর পাবলিক URL (email এ লোকাল ফাইল কাজ করে না)
5. **অডিট গভীরতা** — Consent Mode, dataLayer পড়া আরও নিখুঁত করা
6. **UI/UX পলিশ** — loading state, error handling, রিপোর্ট টেবিল ডিজাইন

---

## ১০. গুরুত্বপূর্ণ সিদ্ধান্ত (কেন এভাবে করা হলো)

- **Option B আগে কেন:** ফ্রি, GitHub Pages এ backend নেই, Supabase Edge
  Function দিয়ে করা যায়। ট্রাফিক ও income এলে Option A পেইড নেওয়া হবে।
- **publishable key কেন:** প্রজেক্ট নতুন key সিস্টেমে; legacy anon key 401 দেয়।
- **crawl বন্ধ কেন:** প্রোডাক্ট সিকিউর ও প্রফেশনাল না হওয়া পর্যন্ত Google index
  করলে অসম্পূর্ণ ভার্সন সার্চে চলে আসবে।
