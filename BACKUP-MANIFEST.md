# AuditMyTracking — ব্যাকআপ ম্যানিফেস্ট

**ব্যাকআপ তারিখ:** 2026-08-30 (রাত ~01:43 UTC)
**অবস্থা:** এই সেশনের সব পরিবর্তন সহ চূড়ান্ত, যাচাই করা (সব JS syntax পাস, index.html tag balance 76/76)

---

## এই ব্যাকআপে কী কী আছে (১৭ ফাইল)

### রুট ফাইল (repo রুটে বসবে → D:\auditmytracking\)
| ব্যাকআপে ফাইল | repo তে কোথায় |
|--------------|----------------|
| index.html | D:\auditmytracking\index.html |
| app-icon.svg | D:\auditmytracking\app-icon.svg |
| app-logo.svg | D:\auditmytracking\app-logo.svg |
| favicon.svg | D:\auditmytracking\favicon.svg |

### JS ফাইল (repo তে js\ ফোল্ডারে বসবে)
| ব্যাকআপে ফাইল | repo তে কোথায় |
|--------------|----------------|
| js/config.js | D:\auditmytracking\js\config.js |
| js/auth.js | D:\auditmytracking\js\auth.js |
| js/booking.js | D:\auditmytracking\js\booking.js |
| js/audit.js | D:\auditmytracking\js\audit.js |
| js/app.js | D:\auditmytracking\js\app.js |

### Supabase Edge Functions (git নয় — Supabase Dashboard এ deploy হয়)
| ব্যাকআপে ফাইল | কী |
|--------------|-----|
| supabase-edge-functions/index.ts | audit-scan ফাংশন (আগে deploy করা) |
| supabase-edge-functions/check-email.ts | check-email ফাংশন (আগে deploy করা, Verify JWT OFF) |

### রেফারেন্স ডকুমেন্ট (repo তে দরকার নেই)
- reference-docs/SEO-and-Copy-Strategy.md
- reference-docs/SEO-Roadmap-Full.md
- reference-docs/PROJECT-NOTES.md
- reference-docs/DEPLOY-GUIDE.md
- reference-docs/INDEX-HTML-CHANGES.md
- reference-docs/audit-js-changes.md

### যাচাই
- CHECKSUMS.txt — প্রতিটা ফাইলের MD5, integrity যাচাইয়ের জন্য

---

## এই সেশনে যা যা পরিবর্তন হয়েছে (এই ব্যাকআপে অন্তর্ভুক্ত)

1. **SEO overhaul (index.html + audit.js)**
   - H1 স্থির: "Free Website Tracking Audit for GA4, Google Ads & Meta" (আগে typewriter H1 এ ছিল)
   - typewriter নিচে সরানো (H1 নয়), নতুন সার্চ-বান্ধব বাক্য (audit.js)
   - meta description, উন্নত title, Open Graph, Twitter Card, JSON-LD, canonical যোগ

2. **Country dropdown submit bug fix (booking.js + auth.js)**
   - booking "Country Required" — পুরনো native-select কোড (.selectedIndex/.options) → getSelectedCountry()
   - complete profile "Continue to Dashboard" crash — একই native-select bug fix

3. **WhatsApp auto-fill false warning fix (booking.js)**
   - phone dial-code ম্যাচিং এ + normalize (savedPhone "wa.me/880..." → +880 ম্যাচ)
   - auto-fill এর পর warning পরিষ্কার

4. **বাটন টেক্সট (auth.js)**
   - complete profile submit: "Saving..." → "Logging in to Dashboard..."

5. **সব ইনলাইন warning মেসেজ (auth.js)**
   - সব এক-বাক্য warning থেকে শেষের ডট বাদ (একরকম)
   - "Please enter your WhatsApp number" পুরোপুরি বাদ → খালি নম্বরেও "Invalid length for [country]. Requires valid [n] digits after [code]" (তিন ফর্মে ডায়নামিক)

6. **ফর্ম লেবেল একীকরণ (index.html + auth.js)**
   - সব ফর্মে: Full Name/Your Name → Name; Work Email/Registered Work Email → Email; Phone Number/WhatsApp Number → Country Code + WhatsApp
   - complete profile লেবেল uppercase বাদ (signup এর মতো স্টাইল)

7. **প্লেসহোল্ডার একীকরণ (index.html + auth.js + booking.js)**
   - Name → "Your Name"; Email → "Your Work or Business Email"; Country search → "Search Country or Code..."; WhatsApp → "Choose Country First"; OTP → "Your Verification Code"; Website → "Your Website Address"; Notes → Title Case
   - "Enter" শব্দ বাদ, Title Case (ছোট শব্দ lowercase)

8. **WhatsApp ফিল্ড disable (index.html + auth.js + booking.js)**
   - তিন ফর্মে country না বাছা পর্যন্ত phone ফিল্ড disabled + "Choose Country First" placeholder
   - country বাছলে enable; booking auto-fill এ country match হলে enable; reset এ আবার lock

(আগের সেশনগুলোর কাজ — 199-country searchable dropdown, check-email edge function, responsive fix, login locked-email — এগুলোও এই ফাইলগুলোতেই আছে)

---

## কীভাবে restore করবে (দরকার হলে)

এই ব্যাকআপ থেকে repo তে ফেরাতে:
1. `index.html` + ৩টা `.svg` → D:\auditmytracking\ রুটে কপি
2. `js/` ফোল্ডারের ৫টা ফাইল → D:\auditmytracking\js\ এ কপি
3. Edge functions দরকার হলে Supabase Dashboard এ redeploy (git নয়)
4. hard refresh (Ctrl+Shift+R)

integrity যাচাই: `md5sum -c CHECKSUMS.txt` (Linux) বা প্রতিটা ফাইলের hash মিলিয়ে দেখা।

---

## এখনও PENDING (এই সেশন শেষে বাকি)

- সব পরিবর্তন git push করা (index.html, auth.js, booking.js, audit.js মূলত)
- Launch এর আগে index.html থেকে noindex meta সরানো
- check-email ফাংশন Supabase Dashboard এ Test button দিয়ে যাচাই
- Apps Script duplicate-prevention deploy
- sitemap.xml, robots.txt যাচাই, Google Search Console
- লোকালে সব ফর্ম টেস্ট (signup/booking/complete — dropdown, disable, warning, লেবেল, placeholder)
