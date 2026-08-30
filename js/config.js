// ============================================================================
// config.js — Global Config & Init
// ============================================================================

// GTM DataLayer Initialization (GTM snippet এর আগে অবশ্যই লোড হতে হবে)
window.dataLayer = window.dataLayer || [];

// GTM Container ID — এক জায়গায় রাখা হলো যাতে সহজে ম্যানেজ করা যায়
const GTM_CONTAINER_ID = "GTM-PRN6TH9J";

// Supabase Edge Function — আসল অডিট ইঞ্জিনের endpoint
const AUDIT_ENDPOINT =
  "https://flpmaegkhkxxaitlgglv.supabase.co/functions/v1/audit-scan";

// Supabase Edge Function — email আগে থেকে রেজিস্টার্ড কিনা যাচাই (duplicate signup রোধ)
const CHECK_EMAIL_ENDPOINT =
  "https://flpmaegkhkxxaitlgglv.supabase.co/functions/v1/check-email";

// Supabase Publishable Key (নতুন key সিস্টেম — ব্রাউজারে ব্যবহার নিরাপদ)
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_wWGc69H8LTBhNjDg77ANIw_A0WWdTvB";

// Supabase JS Client
window.sbClient = window.supabase.createClient(
  "https://flpmaegkhkxxaitlgglv.supabase.co",
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // OAuth redirect এর hash (#access_token) থেকে session পড়বে,
      // পড়ার পর Supabase নিজেই URL পরিষ্কার করার চেষ্টা করবে
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Google Apps Script Web App URL
const GOOGLE_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzKG5Mbo0RaLJvDl7s152am29lXOLr-bJI3WUEtcIxWxles9caFkpfhrReEyATGT5TGIQ/exec";

window.tempAuthData = null;
window.currentAuditData = [];
window.currentAuditedUrl = "";
window.lastDetectedPlatform = "Custom Coded";
window.lastDetectedForm = "Standard / Native Form";
window.notifyCallback = null;

const DISPOSABLE_DOMAINS = [
  "tempmail.com", "temp-mail.org", "10minutemail.com", "guerrillamail.com",
  "mailinator.com", "trashmail.com", "yopmail.com", "sharklasers.com",
  "dispostable.com", "getnada.com", "fakeinbox.com", "mohmal.com",
  "crazymailing.com", "throwawaymail.com", "burnermail.io", "tempail.com"
];

const JUNK_KEYWORDS = [
  "test", "testing", "fake", "demo", "sample", "temp", "dummy",
  "trash", "spam", "user", "admin", "null", "abcd", "1234", "qwerty"
];

function toWhatsAppLink(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/+${cleaned}`;
}

// ============================================================================
// সম্পূর্ণ বিশ্বের দেশ তালিকা (A-Z sorted) — country dropdown এর master source
// n=নাম, c=dial code, mn=phone min length, mx=phone max length
// signup / booking / complete-profile তিন dropdown ই এখান থেকে generate হয়।
// ============================================================================
const COUNTRY_LIST = [
  { n: "Afghanistan", c: "+93", mn: 9, mx: 9 },
  { n: "Albania", c: "+355", mn: 9, mx: 9 },
  { n: "Algeria", c: "+213", mn: 9, mx: 9 },
  { n: "Andorra", c: "+376", mn: 6, mx: 14 },
  { n: "Angola", c: "+244", mn: 6, mx: 14 },
  { n: "Antigua and Barbuda", c: "+1268", mn: 6, mx: 14 },
  { n: "Argentina", c: "+54", mn: 10, mx: 10 },
  { n: "Armenia", c: "+374", mn: 6, mx: 14 },
  { n: "Australia", c: "+61", mn: 9, mx: 9 },
  { n: "Austria", c: "+43", mn: 10, mx: 11 },
  { n: "Azerbaijan", c: "+994", mn: 6, mx: 14 },
  { n: "Bahamas", c: "+1242", mn: 6, mx: 14 },
  { n: "Bahrain", c: "+973", mn: 8, mx: 8 },
  { n: "Bangladesh", c: "+880", mn: 10, mx: 10 },
  { n: "Barbados", c: "+1246", mn: 6, mx: 14 },
  { n: "Belarus", c: "+375", mn: 6, mx: 14 },
  { n: "Belgium", c: "+32", mn: 8, mx: 9 },
  { n: "Belize", c: "+501", mn: 6, mx: 14 },
  { n: "Benin", c: "+229", mn: 6, mx: 14 },
  { n: "Bhutan", c: "+975", mn: 6, mx: 14 },
  { n: "Bolivia", c: "+591", mn: 6, mx: 14 },
  { n: "Bosnia and Herzegovina", c: "+387", mn: 6, mx: 14 },
  { n: "Botswana", c: "+267", mn: 6, mx: 14 },
  { n: "Brazil", c: "+55", mn: 10, mx: 11 },
  { n: "Brunei", c: "+673", mn: 6, mx: 14 },
  { n: "Bulgaria", c: "+359", mn: 6, mx: 14 },
  { n: "Burkina Faso", c: "+226", mn: 6, mx: 14 },
  { n: "Burundi", c: "+257", mn: 6, mx: 14 },
  { n: "Cambodia", c: "+855", mn: 6, mx: 14 },
  { n: "Cameroon", c: "+237", mn: 6, mx: 14 },
  { n: "Canada", c: "+1", mn: 10, mx: 10 },
  { n: "Cape Verde", c: "+238", mn: 6, mx: 14 },
  { n: "Central African Republic", c: "+236", mn: 6, mx: 14 },
  { n: "Chad", c: "+235", mn: 6, mx: 14 },
  { n: "Chile", c: "+56", mn: 6, mx: 14 },
  { n: "China", c: "+86", mn: 11, mx: 11 },
  { n: "Colombia", c: "+57", mn: 6, mx: 14 },
  { n: "Comoros", c: "+269", mn: 6, mx: 14 },
  { n: "Congo (Brazzaville)", c: "+242", mn: 6, mx: 14 },
  { n: "Congo (Kinshasa)", c: "+243", mn: 6, mx: 14 },
  { n: "Costa Rica", c: "+506", mn: 6, mx: 14 },
  { n: "Croatia", c: "+385", mn: 6, mx: 14 },
  { n: "Cuba", c: "+53", mn: 6, mx: 14 },
  { n: "Cyprus", c: "+357", mn: 6, mx: 14 },
  { n: "Czech Republic", c: "+420", mn: 6, mx: 14 },
  { n: "Denmark", c: "+45", mn: 8, mx: 8 },
  { n: "Djibouti", c: "+253", mn: 6, mx: 14 },
  { n: "Dominica", c: "+1767", mn: 6, mx: 14 },
  { n: "Dominican Republic", c: "+1809", mn: 6, mx: 14 },
  { n: "Ecuador", c: "+593", mn: 6, mx: 14 },
  { n: "Egypt", c: "+20", mn: 10, mx: 10 },
  { n: "El Salvador", c: "+503", mn: 6, mx: 14 },
  { n: "Equatorial Guinea", c: "+240", mn: 6, mx: 14 },
  { n: "Eritrea", c: "+291", mn: 6, mx: 14 },
  { n: "Estonia", c: "+372", mn: 6, mx: 14 },
  { n: "Eswatini", c: "+268", mn: 6, mx: 14 },
  { n: "Ethiopia", c: "+251", mn: 6, mx: 14 },
  { n: "Fiji", c: "+679", mn: 6, mx: 14 },
  { n: "Finland", c: "+358", mn: 9, mx: 10 },
  { n: "France", c: "+33", mn: 9, mx: 9 },
  { n: "Gabon", c: "+241", mn: 6, mx: 14 },
  { n: "Gambia", c: "+220", mn: 6, mx: 14 },
  { n: "Georgia", c: "+995", mn: 6, mx: 14 },
  { n: "Germany", c: "+49", mn: 10, mx: 11 },
  { n: "Ghana", c: "+233", mn: 6, mx: 14 },
  { n: "Greece", c: "+30", mn: 6, mx: 14 },
  { n: "Grenada", c: "+1473", mn: 6, mx: 14 },
  { n: "Guatemala", c: "+502", mn: 6, mx: 14 },
  { n: "Guinea", c: "+224", mn: 6, mx: 14 },
  { n: "Guinea-Bissau", c: "+245", mn: 6, mx: 14 },
  { n: "Guyana", c: "+592", mn: 6, mx: 14 },
  { n: "Haiti", c: "+509", mn: 6, mx: 14 },
  { n: "Honduras", c: "+504", mn: 6, mx: 14 },
  { n: "Hong Kong", c: "+852", mn: 8, mx: 8 },
  { n: "Hungary", c: "+36", mn: 6, mx: 14 },
  { n: "Iceland", c: "+354", mn: 6, mx: 14 },
  { n: "India", c: "+91", mn: 10, mx: 10 },
  { n: "Indonesia", c: "+62", mn: 9, mx: 12 },
  { n: "Iran", c: "+98", mn: 6, mx: 14 },
  { n: "Iraq", c: "+964", mn: 6, mx: 14 },
  { n: "Ireland", c: "+353", mn: 9, mx: 9 },
  { n: "Israel", c: "+972", mn: 6, mx: 14 },
  { n: "Italy", c: "+39", mn: 9, mx: 10 },
  { n: "Ivory Coast", c: "+225", mn: 6, mx: 14 },
  { n: "Jamaica", c: "+1876", mn: 6, mx: 14 },
  { n: "Japan", c: "+81", mn: 10, mx: 10 },
  { n: "Jordan", c: "+962", mn: 6, mx: 14 },
  { n: "Kazakhstan", c: "+7", mn: 6, mx: 14 },
  { n: "Kenya", c: "+254", mn: 6, mx: 14 },
  { n: "Kiribati", c: "+686", mn: 6, mx: 14 },
  { n: "Kosovo", c: "+383", mn: 6, mx: 14 },
  { n: "Kuwait", c: "+965", mn: 8, mx: 8 },
  { n: "Kyrgyzstan", c: "+996", mn: 6, mx: 14 },
  { n: "Laos", c: "+856", mn: 6, mx: 14 },
  { n: "Latvia", c: "+371", mn: 6, mx: 14 },
  { n: "Lebanon", c: "+961", mn: 6, mx: 14 },
  { n: "Lesotho", c: "+266", mn: 6, mx: 14 },
  { n: "Liberia", c: "+231", mn: 6, mx: 14 },
  { n: "Libya", c: "+218", mn: 6, mx: 14 },
  { n: "Liechtenstein", c: "+423", mn: 6, mx: 14 },
  { n: "Lithuania", c: "+370", mn: 6, mx: 14 },
  { n: "Luxembourg", c: "+352", mn: 6, mx: 14 },
  { n: "Macau", c: "+853", mn: 6, mx: 14 },
  { n: "Madagascar", c: "+261", mn: 6, mx: 14 },
  { n: "Malawi", c: "+265", mn: 6, mx: 14 },
  { n: "Malaysia", c: "+60", mn: 9, mx: 10 },
  { n: "Maldives", c: "+960", mn: 6, mx: 14 },
  { n: "Mali", c: "+223", mn: 6, mx: 14 },
  { n: "Malta", c: "+356", mn: 6, mx: 14 },
  { n: "Marshall Islands", c: "+692", mn: 6, mx: 14 },
  { n: "Mauritania", c: "+222", mn: 6, mx: 14 },
  { n: "Mauritius", c: "+230", mn: 6, mx: 14 },
  { n: "Mexico", c: "+52", mn: 6, mx: 14 },
  { n: "Micronesia", c: "+691", mn: 6, mx: 14 },
  { n: "Moldova", c: "+373", mn: 6, mx: 14 },
  { n: "Monaco", c: "+377", mn: 6, mx: 14 },
  { n: "Mongolia", c: "+976", mn: 6, mx: 14 },
  { n: "Montenegro", c: "+382", mn: 6, mx: 14 },
  { n: "Morocco", c: "+212", mn: 6, mx: 14 },
  { n: "Mozambique", c: "+258", mn: 6, mx: 14 },
  { n: "Myanmar", c: "+95", mn: 6, mx: 14 },
  { n: "Namibia", c: "+264", mn: 6, mx: 14 },
  { n: "Nauru", c: "+674", mn: 6, mx: 14 },
  { n: "Nepal", c: "+977", mn: 6, mx: 14 },
  { n: "Netherlands", c: "+31", mn: 9, mx: 9 },
  { n: "New Zealand", c: "+64", mn: 8, mx: 10 },
  { n: "Nicaragua", c: "+505", mn: 6, mx: 14 },
  { n: "Niger", c: "+227", mn: 6, mx: 14 },
  { n: "Nigeria", c: "+234", mn: 6, mx: 14 },
  { n: "North Korea", c: "+850", mn: 6, mx: 14 },
  { n: "North Macedonia", c: "+389", mn: 6, mx: 14 },
  { n: "Norway", c: "+47", mn: 8, mx: 8 },
  { n: "Oman", c: "+968", mn: 8, mx: 8 },
  { n: "Pakistan", c: "+92", mn: 10, mx: 10 },
  { n: "Palau", c: "+680", mn: 6, mx: 14 },
  { n: "Palestine", c: "+970", mn: 6, mx: 14 },
  { n: "Panama", c: "+507", mn: 6, mx: 14 },
  { n: "Papua New Guinea", c: "+675", mn: 6, mx: 14 },
  { n: "Paraguay", c: "+595", mn: 6, mx: 14 },
  { n: "Peru", c: "+51", mn: 6, mx: 14 },
  { n: "Philippines", c: "+63", mn: 6, mx: 14 },
  { n: "Poland", c: "+48", mn: 6, mx: 14 },
  { n: "Portugal", c: "+351", mn: 6, mx: 14 },
  { n: "Qatar", c: "+974", mn: 8, mx: 8 },
  { n: "Romania", c: "+40", mn: 6, mx: 14 },
  { n: "Russia", c: "+7", mn: 6, mx: 14 },
  { n: "Rwanda", c: "+250", mn: 6, mx: 14 },
  { n: "Saint Kitts and Nevis", c: "+1869", mn: 6, mx: 14 },
  { n: "Saint Lucia", c: "+1758", mn: 6, mx: 14 },
  { n: "Saint Vincent and the Grenadines", c: "+1784", mn: 6, mx: 14 },
  { n: "Samoa", c: "+685", mn: 6, mx: 14 },
  { n: "San Marino", c: "+378", mn: 6, mx: 14 },
  { n: "Sao Tome and Principe", c: "+239", mn: 6, mx: 14 },
  { n: "Saudi Arabia", c: "+966", mn: 9, mx: 9 },
  { n: "Senegal", c: "+221", mn: 6, mx: 14 },
  { n: "Serbia", c: "+381", mn: 6, mx: 14 },
  { n: "Seychelles", c: "+248", mn: 6, mx: 14 },
  { n: "Sierra Leone", c: "+232", mn: 6, mx: 14 },
  { n: "Singapore", c: "+65", mn: 8, mx: 8 },
  { n: "Slovakia", c: "+421", mn: 6, mx: 14 },
  { n: "Slovenia", c: "+386", mn: 6, mx: 14 },
  { n: "Solomon Islands", c: "+677", mn: 6, mx: 14 },
  { n: "Somalia", c: "+252", mn: 6, mx: 14 },
  { n: "South Africa", c: "+27", mn: 9, mx: 9 },
  { n: "South Korea", c: "+82", mn: 6, mx: 14 },
  { n: "South Sudan", c: "+211", mn: 6, mx: 14 },
  { n: "Spain", c: "+34", mn: 9, mx: 9 },
  { n: "Sri Lanka", c: "+94", mn: 6, mx: 14 },
  { n: "Sudan", c: "+249", mn: 6, mx: 14 },
  { n: "Suriname", c: "+597", mn: 6, mx: 14 },
  { n: "Sweden", c: "+46", mn: 7, mx: 9 },
  { n: "Switzerland", c: "+41", mn: 9, mx: 9 },
  { n: "Syria", c: "+963", mn: 6, mx: 14 },
  { n: "Taiwan", c: "+886", mn: 6, mx: 14 },
  { n: "Tajikistan", c: "+992", mn: 6, mx: 14 },
  { n: "Tanzania", c: "+255", mn: 6, mx: 14 },
  { n: "Thailand", c: "+66", mn: 6, mx: 14 },
  { n: "Timor-Leste", c: "+670", mn: 6, mx: 14 },
  { n: "Togo", c: "+228", mn: 6, mx: 14 },
  { n: "Tonga", c: "+676", mn: 6, mx: 14 },
  { n: "Trinidad and Tobago", c: "+1868", mn: 6, mx: 14 },
  { n: "Tunisia", c: "+216", mn: 6, mx: 14 },
  { n: "Turkey", c: "+90", mn: 10, mx: 10 },
  { n: "Turkmenistan", c: "+993", mn: 6, mx: 14 },
  { n: "Tuvalu", c: "+688", mn: 6, mx: 14 },
  { n: "Uganda", c: "+256", mn: 6, mx: 14 },
  { n: "Ukraine", c: "+380", mn: 6, mx: 14 },
  { n: "United Arab Emirates", c: "+971", mn: 9, mx: 9 },
  { n: "United Kingdom", c: "+44", mn: 10, mx: 10 },
  { n: "United States", c: "+1", mn: 10, mx: 10 },
  { n: "Uruguay", c: "+598", mn: 6, mx: 14 },
  { n: "Uzbekistan", c: "+998", mn: 6, mx: 14 },
  { n: "Vanuatu", c: "+678", mn: 6, mx: 14 },
  { n: "Vatican City", c: "+379", mn: 6, mx: 14 },
  { n: "Venezuela", c: "+58", mn: 6, mx: 14 },
  { n: "Vietnam", c: "+84", mn: 6, mx: 14 },
  { n: "Yemen", c: "+967", mn: 6, mx: 14 },
  { n: "Zambia", c: "+260", mn: 6, mx: 14 },
  { n: "Zimbabwe", c: "+263", mn: 6, mx: 14 }
];
