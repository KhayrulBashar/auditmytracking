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

// Supabase Publishable Key (নতুন key সিস্টেম — ব্রাউজারে ব্যবহার নিরাপদ)
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_wWGc69H8LTBhNjDg77ANIw_A0WWdTvB";

// Supabase JS Client
window.sbClient = window.supabase.createClient(
  "https://flpmaegkhkxxaitlgglv.supabase.co",
  SUPABASE_PUBLISHABLE_KEY
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
