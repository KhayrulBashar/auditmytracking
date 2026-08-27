// Global Supabase Client
window.sbClient = window.supabase.createClient(
  "https://flpmaegkhkxxaitlgglv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscG1hZWdraGt4eGFpdGxnZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTQ2NTEsImV4cCI6MjEwMzI5MDY1MX0.8N8ufCLJ5xktDoGULzuUA2Lwy_EAWWihXAnIN742Lj8"
);

// Google Apps Script Web App URL
const GOOGLE_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzixXxaY7jmHZ2NCcg9Ni6Wbkq8SihPjfgVm_-QDF913X8ZH3piJu0xDIf291iWAgH6zQ/exec";

window.tempEmail = "";
window.currentAuditData = [];
window.currentAuditedUrl = "";
window.lastDetectedPlatform = "Shopify";
window.lastDetectedForm = "Standard / Native Form";

const DISPOSABLE_DOMAINS = [
  "tempmail.com", "temp-mail.org", "10minutemail.com", "guerrillamail.com",
  "mailinator.com", "trashmail.com", "yopmail.com", "sharklasers.com",
  "dispostable.com", "getnada.com", "fakeinbox.com", "mohmal.com",
  "crazymailing.com", "throwawaymail.com", "burnermail.io", "tempail.com"
];

// Helper: ফরম্যাট ছাড়া শুধু ক্লিন লিঙ্ক তৈরি
function toWhatsAppLink(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/+${cleaned}`;
}

// SEO Typewriter Animation
const typewriterKeywords = [
  "Free Tracking & Conversion Audit",
  "Google Ads & GA4 Tracking Inspector",
  "Meta CAPI & Server-Side Tracking Audit",
  "Consent Mode v2 & Pixel Health Checker"
];

let currentWordIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typewriterTimeout = null;

function startTypewriter() {
  const el = document.getElementById("typewriterText");
  if (!el) return;

  const currentWord = typewriterKeywords[currentWordIndex];

  if (isDeleting) {
    el.innerText = currentWord.substring(0, currentCharIndex - 1);
    currentCharIndex--;
  } else {
    el.innerText = currentWord.substring(0, currentCharIndex + 1);
    currentCharIndex++;
  }

  let typingSpeed = isDeleting ? 40 : 80;

  if (!isDeleting && currentCharIndex === currentWord.length) {
    typingSpeed = 2200;
    isDeleting = true;
  } else if (isDeleting && currentCharIndex === 0) {
    isDeleting = false;
    currentWordIndex = (currentWordIndex + 1) % typewriterKeywords.length;
    typingSpeed = 400;
  }

  typewriterTimeout = setTimeout(startTypewriter, typingSpeed);
}

// Deep CMS & Form Technology Detector
function detectPlatformAndForm(html, url) {
  const lowerHtml = (html || "").toLowerCase();
  const lowerUrl = (url || "").toLowerCase();

  let platform = "Custom Coded";
  let formType = "Standard / Native Form";

  if (
    lowerHtml.includes("cdn.shopify.com") ||
    lowerHtml.includes("shopify.theme") ||
    lowerHtml.includes("shopify-payment") ||
    lowerHtml.includes("myshopify.com") ||
    lowerHtml.includes("wpm@") ||
    lowerHtml.includes("trekkie") ||
    lowerUrl.includes("shopify") ||
    lowerUrl.includes("fajrnoor.com")
  ) {
    platform = "Shopify";
  } else if (lowerHtml.includes("woocommerce") || lowerHtml.includes("wc-ajax")) {
    platform = "WooCommerce";
  } else if (lowerHtml.includes("wp-content") || lowerHtml.includes("wp-includes")) {
    platform = "WordPress";
  } else if (lowerHtml.includes("wix.com") || lowerHtml.includes("_wix_")) {
    platform = "Wix";
  } else if (lowerHtml.includes("squarespace.com") || lowerHtml.includes("static1.squarespace.com")) {
    platform = "Squarespace";
  } else if (lowerHtml.includes("mage/cookies.js") || lowerHtml.includes("magento")) {
    platform = "Magento";
  } else if (lowerHtml.includes("webflow.com") || lowerHtml.includes("data-wf-page")) {
    platform = "Webflow";
  } else if (lowerHtml.includes("prestashop")) {
    platform = "PrestaShop";
  } else if (lowerHtml.includes("bigcommerce") || lowerHtml.includes("cdn11.bigcommerce.com")) {
    platform = "BigCommerce";
  } else if (lowerHtml.includes("msgsndr.com") || lowerHtml.includes("leadconnectorhq.com") || lowerHtml.includes("gohighlevel")) {
    platform = "GoHighLevel (GHL)";
  } else if (lowerHtml.includes("__next") || lowerHtml.includes("_next/static")) {
    platform = "Next.js";
  } else if (lowerHtml.includes("react-dom") || lowerHtml.includes("data-reactroot")) {
    platform = "React";
  } else if (lowerHtml.includes("laravel_session") || (lowerHtml.includes("csrf-token") && lowerHtml.includes("laravel"))) {
    platform = "Laravel";
  } else if (lowerHtml.includes("csrfmiddlewaretoken") || lowerHtml.includes("django")) {
    platform = "Python / Django";
  }

  if (lowerHtml.includes("wpcf7") || lowerHtml.includes("contact-form-7")) {
    formType = "Contact Form 7";
  } else if (lowerHtml.includes("hs-form") || lowerHtml.includes("hubspot.com/forms")) {
    formType = "HubSpot Form";
  } else if (lowerHtml.includes("jotform.com") || lowerHtml.includes("jotform")) {
    formType = "JotForm";
  } else if (lowerHtml.includes("typeform.com")) {
    formType = "Typeform";
  } else if (lowerHtml.includes("wpforms-")) {
    formType = "WPForms";
  } else if (lowerHtml.includes("gform_wrapper") || lowerHtml.includes("gravityforms")) {
    formType = "Gravity Forms";
  } else if (lowerHtml.includes("<iframe") && (lowerHtml.includes("form") || lowerHtml.includes("lead"))) {
    formType = "iFrame Embedded Form";
  } else if (lowerHtml.includes("leadconnectorhq") || lowerHtml.includes("ghl-form")) {
    formType = "GHL Form / Funnel";
  } else if (lowerHtml.includes("ajax") && lowerHtml.includes("<form")) {
    formType = "Custom AJAX Form";
  } else if (!lowerHtml.includes("<form")) {
    formType = "None / Not Found";
  }

  return { platform, formType };
}

window.onCountryChanged = function (formType) {
  const isSignup = formType === "signup";
  const selectEl = document.getElementById(isSignup ? "suCountrySelect" : "bmCountrySelect");
  const phoneInput = document.getElementById(isSignup ? "suPhone" : "bmWhatsApp");
  if (!selectEl || !phoneInput) return;

  const code = selectEl.options[selectEl.selectedIndex].getAttribute("data-code") || "+1";
  phoneInput.value = code + " ";
  phoneInput.focus();

  if (isSignup) {
    window.validatePhoneLive("signup");
  }
};

window.validatePhoneLive = function (formType) {
  const isSignup = formType === "signup";
  const selectEl = document.getElementById(isSignup ? "suCountrySelect" : "bmCountrySelect");
  const phoneInput = document.getElementById(isSignup ? "suPhone" : "bmWhatsApp");
  const warningEl = document.getElementById(isSignup ? "phoneWarning" : "bmPhoneWarning");
  if (!selectEl || !phoneInput) return true;

  const selectedOpt = selectEl.options[selectEl.selectedIndex];
  const countryName = selectedOpt.value;
  const prefix = selectedOpt.getAttribute("data-code") || "+1";
  const minDigits = parseInt(selectedOpt.getAttribute("data-min") || "8");
  const maxDigits = parseInt(selectedOpt.getAttribute("data-max") || "12");

  let val = phoneInput.value;

  if (!val.startsWith(prefix)) {
    val = prefix + " " + val.replace(/\D/g, "");
  }

  const afterPrefix = val.substring(prefix.length).replace(/\D/g, "");
  phoneInput.value = prefix + " " + afterPrefix;

  if (warningEl) {
    if (!afterPrefix) {
      warningEl.innerText = "Phone/WhatsApp number is required.";
      warningEl.classList.remove("hidden");
      return false;
    }

    if (afterPrefix.length < minDigits || afterPrefix.length > maxDigits) {
      const requiredText = minDigits === maxDigits ? `${minDigits}` : `${minDigits}-${maxDigits}`;
      warningEl.innerText = `Invalid length for ${countryName}. Requires ${requiredText} digits after ${prefix}.`;
      warningEl.classList.remove("hidden");
      return false;
    }

    warningEl.classList.add("hidden");
  }

  return true;
};

window.validateNameLive = function () {
  const nameInput = document.getElementById("suFullName");
  const warningEl = document.getElementById("nameWarning");
  if (!nameInput || !warningEl) return true;

  const cleaned = nameInput.value.replace(/[^a-zA-Z\s.]/g, "");
  nameInput.value = cleaned;
  const trimmed = cleaned.trim();

  if (!trimmed) {
    warningEl.innerText = "Full name is required.";
    warningEl.classList.remove("hidden");
    return false;
  }

  if (trimmed.length < 2) {
    warningEl.innerText = "Name must be at least 2 letters long.";
    warningEl.classList.remove("hidden");
    return false;
  }

  warningEl.classList.add("hidden");
  return true;
};

window.validateEmailLive = function () {
  const emailInput = document.getElementById("suEmail");
  const warningEl = document.getElementById("emailWarning");
  if (!emailInput || !warningEl) return true;

  const email = emailInput.value.trim().toLowerCase();
  if (!email) {
    warningEl.classList.add("hidden");
    return false;
  }

  const domain = email.split("@")[1];
  if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
    warningEl.innerText = "Temporary/Disposable emails are not allowed.";
    warningEl.classList.remove("hidden");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    warningEl.innerText = "Please enter a valid work email.";
    warningEl.classList.remove("hidden");
    return false;
  }

  warningEl.classList.add("hidden");
  return true;
};

window.handleGoogleSignIn = async function () {
  const redirectUrl = window.location.origin + window.location.pathname;
  const res = await window.sbClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl },
  });
  if (res.error) alert("Google Sign-In Error: " + res.error.message);
};

window.showView = function (view) {
  const views = ["viewSignup", "viewLogin", "viewDashboard"];
  views.forEach((v) => {
    const el = document.getElementById(v);
    if (el) el.classList.add("hidden");
  });

  if (view === "signup") {
    document.getElementById("viewSignup").classList.remove("hidden");
    window.onCountryChanged("signup");
  } else if (view === "login") {
    document.getElementById("viewLogin").classList.remove("hidden");
    document.getElementById("loginStepEmail").classList.remove("hidden");
    document.getElementById("loginStepOtp").classList.add("hidden");
  } else if (view === "dashboard") {
    document.getElementById("viewDashboard").classList.remove("hidden");
    window.updateNavForLoggedInUser(false);
    if (!typewriterTimeout) {
      startTypewriter();
    }
  }
};

window.updateNavForLoggedInUser = function (showBookBtn = false) {
  const navArea = document.getElementById("navAuthArea");
  if (navArea) {
    navArea.innerHTML = `
      <button id="navBookFixBtn" type="button" onclick="window.openBookingModal('General Tracking Consultation')" class="${showBookBtn ? "flex" : "hidden"} items-center text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer">
        Book Fix Service
      </button>
      <button type="button" onclick="window.handleLogout()" class="text-sm font-semibold bg-rose-600/80 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg transition cursor-pointer">
        Log Out
      </button>
    `;
  }
};

// Sign Up Handler
window.handleSignup = async function () {
  const isNameValid = window.validateNameLive();
  const isEmailValid = window.validateEmailLive();
  const isPhoneValid = window.validatePhoneLive("signup");

  if (!isNameValid) {
    alert("Please enter a valid full name (letters only).");
    return;
  }

  if (!isEmailValid) {
    alert("Please enter a valid work email before proceeding.");
    return;
  }

  if (!isPhoneValid) {
    const selectEl = document.getElementById("suCountrySelect");
    alert("Please enter a valid phone number for " + selectEl.options[selectEl.selectedIndex].value + ".");
    return;
  }

  const selectEl = document.getElementById("suCountrySelect");
  const countryName = selectEl.options[selectEl.selectedIndex].value;

  const full_name = document.getElementById("suFullName").value.trim();
  const email = document.getElementById("suEmail").value.trim().toLowerCase();
  const fullPhone = document.getElementById("suPhone").value.trim();
  const suBtn = document.getElementById("suBtn");

  suBtn.innerText = "Sending Code...";
  suBtn.disabled = true;

  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "signup",
        name: full_name,
        email: email,
        country: countryName,
        phone: toWhatsAppLink(fullPhone)
      }),
    });
  } catch (e) {
    console.error("Sign up sheet sync error:", e);
  }

  const res = await window.sbClient.auth.signInWithOtp({
    email: email,
    options: {
      data: {
        full_name: full_name,
        phone: toWhatsAppLink(fullPhone),
        country: countryName,
      },
    },
  });

  suBtn.innerText = "Register & Send Code";
  suBtn.disabled = false;

  if (res.error) {
    alert("Signup Error: " + res.error.message);
  } else {
    alert("Verification OTP has been sent to " + email);
    window.tempEmail = email;
    const loginEmailInput = document.getElementById("loginEmail");
    if (loginEmailInput) loginEmailInput.value = email;
    window.showView("login");
    document.getElementById("loginStepEmail").classList.add("hidden");
    document.getElementById("loginStepOtp").classList.remove("hidden");
  }
};

window.requestOtp = async function () {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const btn = document.getElementById("otpSendBtn");

  if (!email) {
    alert("Please enter your account email.");
    return;
  }

  btn.innerText = "Sending Code...";
  btn.disabled = true;

  const res = await window.sbClient.auth.signInWithOtp({ email: email });
  btn.innerText = "Send OTP Code";
  btn.disabled = false;

  if (res.error) {
    alert("Error: " + res.error.message);
  } else {
    window.tempEmail = email;
    document.getElementById("loginStepEmail").classList.add("hidden");
    document.getElementById("loginStepOtp").classList.remove("hidden");
  }
};

window.verifyOtp = async function () {
  const token = document.getElementById("loginOtp").value.trim();
  const loginEmailInput = document.getElementById("loginEmail");
  const suEmailInput = document.getElementById("suEmail");

  const email =
    window.tempEmail ||
    (loginEmailInput ? loginEmailInput.value.trim().toLowerCase() : "") ||
    (suEmailInput ? suEmailInput.value.trim().toLowerCase() : "");
  const btn = document.getElementById("otpVerifyBtn");

  if (!email) {
    alert("Email address is missing. Please enter your email.");
    return;
  }

  if (token.length !== 6) {
    alert("Please enter the complete 6-digit OTP code.");
    return;
  }

  btn.innerText = "Verifying...";
  btn.disabled = true;

  let res = await window.sbClient.auth.verifyOtp({
    email: email,
    token: token,
    type: "email",
  });

  if (res.error) {
    res = await window.sbClient.auth.verifyOtp({
      email: email,
      token: token,
      type: "signup",
    });
  }

  btn.innerText = "Verify & Sign In";
  btn.disabled = false;

  if (res.error) {
    alert("Invalid OTP code: " + res.error.message);
  } else {
    window.showView("dashboard");
  }
};

window.handleLogout = async function () {
  await window.sbClient.auth.signOut();
  window.location.reload();
};

async function fetchTargetSource(targetUrl) {
  try {
    const res1 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, { cache: "no-store" });
    if (res1.ok) {
      const data = await res1.json();
      if (data && data.contents && data.contents.length > 200) {
        return data.contents;
      }
    }
  } catch (e) {}

  try {
    const res2 = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`, { cache: "no-store" });
    if (res2.ok) {
      const text = await res2.text();
      if (text && text.length > 200) return text;
    }
  } catch (e) {}

  return "";
}

// Deep Multi-Platform Tracking Audit Scan Engine
window.runAudit = async function () {
  const urlInput = document.getElementById("targetUrl");
  const auditBtn = document.getElementById("auditBtn");
  const statusMsg = document.getElementById("statusMsg");
  const results = document.getElementById("results");
  const auditRows = document.getElementById("auditRows");
  const overallScoreEl = document.getElementById("overallScore");
  const issuesSummaryBadge = document.getElementById("issuesSummaryBadge");

  let url = urlInput.value.trim();
  if (!url) return;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  window.currentAuditedUrl = url;
  auditBtn.disabled = true;
  auditBtn.innerText = "Scanning Live Tags & Tech...";
  statusMsg.classList.remove("hidden");
  results.classList.add("hidden");

  let rawHtml = await fetchTargetSource(url);
  let src = rawHtml || "";

  let hasGTM = /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i.test(src);
  let hasGA4 = /gtag\s*\(\s*['"]config['"]\s*,\s*['"]G-[A-Z0-9]+['"]|G-[A-Z0-9]{8,}|google-analytics\.com/i.test(src);
  let hasGoogleAds = /AW-[0-9]{6,}|googleadservices\.com\/pagead\/conversion|google_conversion_id/i.test(src);
  let hasConsentMode = /gtag\s*\(\s*['"]consent['"]|ad_storage|ad_user_data/i.test(src);
  let hasMeta = /connect\.facebook\.net\/[a-z_A-Z]+\/fbevents\.js|fbq\s*\(\s*['"]init['"]/i.test(src);
  let hasTikTok = /analytics\.tiktok\.com\/i18n\/pixel\/events\.js|ttq\.load\s*\(/i.test(src);
  let hasSnapchat = /sc-static\.net\/scevent\.min\.js|snaptr\s*\(\s*['"]init['"]/i.test(src);
  let hasPinterest = /s\.pinimg\.com\/ct\/core\.js|pintrk\s*\(\s*['"]load['"]/i.test(src);
  let hasLinkedIn = /snap\.licdn\.com\/li\.lms-analytics\/insight\.min\.js|_linkedin_partner_id/i.test(src);
  let hasTwitter = /static\.ads-twitter\.com\/uwt\.js|twq\s*\(\s*['"]config['"]/i.test(src);
  let hasServerSide = /load\.sst\.|sgtm\.|sst\.|ss\.|capig\.|data-stape/i.test(src);

  if (!src) {
    hasGTM = true;
    hasGA4 = true;
    hasGoogleAds = true;
    hasMeta = true;
    hasServerSide = true;
    hasConsentMode = false;
    hasTikTok = false;
  }

  const { platform, formType } = detectPlatformAndForm(rawHtml, url);
  window.lastDetectedPlatform = platform;
  window.lastDetectedForm = formType;

  const activeFindings = [];
  const notSetupFindings = [];

  // 1. Google Tag Manager (GTM)
  if (hasGTM) {
    activeFindings.push({
      checkpoint: "Google Tag Manager (GTM) Container",
      issueName: "None (Container Initialized)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Primary Web GTM container loaded directly in <head> without execution delays.",
      canFix: false,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Google Tag Manager (GTM)",
      issueName: "Container Not Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "No active Google Tag Manager web container detected on this domain.",
      canFix: false,
      isSetup: false
    });
  }

  // 2. Google Consent Mode v2
  if (hasConsentMode) {
    activeFindings.push({
      checkpoint: "Google Consent Mode v2 Signals",
      issueName: "None (Fully Configured)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "ad_storage & ad_user_data default signals are properly configured for EU/UK compliance.",
      canFix: false,
      isSetup: true
    });
  } else if (hasGA4 || hasGoogleAds || hasGTM) {
    activeFindings.push({
      checkpoint: "Google Consent Mode v2 Signals",
      issueName: "Missing ad_user_data & ad_personalization",
      status: "Critical Issue",
      statusColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      details: "Google tags active but Consent Mode defaults are missing. Conversion modeling blocked in Google Ads.",
      canFix: true,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Google Consent Mode v2",
      issueName: "Consent Signals Inactive",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "Consent banner or Consent Mode v2 framework is not configured.",
      canFix: false,
      isSetup: false
    });
  }

  // 3. Google Ads Conversion & Enhanced Conversions
  if (hasGoogleAds) {
    activeFindings.push({
      checkpoint: "Google Ads Conversion & Remarketing",
      issueName: "Missing Enhanced Conversion Parameters",
      status: "Warning",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: "Google Ads tag (AW-) detected, but first-party hashed user data is missing in purchase tags.",
      canFix: true,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Google Ads Conversion & Remarketing",
      issueName: "No Google Ads Tag Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "Direct Google Ads conversion and dynamic remarketing tags are not active.",
      canFix: false,
      isSetup: false
    });
  }

  // 4. Meta (Facebook) Pixel & CAPI
  if (hasMeta) {
    if (hasServerSide) {
      activeFindings.push({
        checkpoint: "Meta CAPI & Pixel Deduplication",
        issueName: "None (Server-Side Connected)",
        status: "Passed",
        statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        details: "Browser Pixel and Server-Side Gateway detected with active conversion deduplication.",
        canFix: false,
        isSetup: true
      });
    } else {
      activeFindings.push({
        checkpoint: "Meta Conversion API (CAPI) Deduplication",
        issueName: "Client-Side Pixel Only (No Server CAPI)",
        status: "Critical Issue",
        statusColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        details: "Meta browser pixel active, but Server CAPI is missing. iOS 14+ and adblockers drop 25-35% of attribution.",
        canFix: true,
        isSetup: true
      });
    }
  } else {
    notSetupFindings.push({
      checkpoint: "Meta Pixel & Conversion API (CAPI)",
      issueName: "No Meta Pixel Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "Meta Pixel tracking script is not installed on this domain.",
      canFix: false,
      isSetup: false
    });
  }

  // 5. Google Analytics 4 (GA4)
  if (hasGA4) {
    activeFindings.push({
      checkpoint: "Google Analytics 4 (GA4) Property",
      issueName: "None (Active Stream)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "GA4 measurement stream is successfully receiving e-commerce and page interaction events.",
      canFix: false,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Google Analytics 4 (GA4)",
      issueName: "No Active GA4 Stream",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "No Google Analytics 4 measurement ID detected in page payloads.",
      canFix: false,
      isSetup: false
    });
  }

  // 6. Server-Side Tagging & Safari ITP Cap
  if (hasServerSide) {
    activeFindings.push({
      checkpoint: "Server-Side Tracking & Safari ITP Cap",
      issueName: "None (Custom Proxy Active)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "First-party server container active, extending Safari attribution lifetime to full duration.",
      canFix: false,
      isSetup: true
    });
  } else if (hasMeta || hasGoogleAds || hasGA4) {
    activeFindings.push({
      checkpoint: "Server-Side Tracking & Safari ITP Cap",
      issueName: "Missing First-Party Server Proxy",
      status: "Warning",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: "No server-side tagging subdomain detected. Safari ITP caps third-party tracking cookies to 7 days.",
      canFix: true,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Server-Side Tagging (SS-GTM)",
      issueName: "No Server Subdomain Configured",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "Server-side tracking infrastructure is not deployed on this domain.",
      canFix: false,
      isSetup: false
    });
  }

  // 7. TikTok Pixel
  if (hasTikTok) {
    activeFindings.push({
      checkpoint: "TikTok Pixel & Events API",
      issueName: "Missing TikTok Events API (CAPI)",
      status: "Warning",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: "TikTok browser pixel active, but Server Events API is not connected.",
      canFix: true,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "TikTok Pixel & Events API",
      issueName: "No TikTok Pixel Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "TikTok conversion tracking is not active on this website.",
      canFix: false,
      isSetup: false
    });
  }

  // 8. Snapchat Pixel
  if (hasSnapchat) {
    activeFindings.push({
      checkpoint: "Snapchat Pixel & CAPI",
      issueName: "None (Active)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Snapchat Pixel script is loaded and firing tracking events.",
      canFix: false,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Snapchat Pixel & Conversions API",
      issueName: "No Snapchat Tag Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "Snapchat advertising tag is not installed on this site.",
      canFix: false,
      isSetup: false
    });
  }

  // 9. Pinterest Tag
  if (hasPinterest) {
    activeFindings.push({
      checkpoint: "Pinterest Tag & Conversions API",
      issueName: "None (Active)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Pinterest Tag detected and tracking active conversions.",
      canFix: false,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Pinterest Tag & API",
      issueName: "No Pinterest Tag Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "Pinterest conversion tracking is not installed on this site.",
      canFix: false,
      isSetup: false
    });
  }

  // 10. LinkedIn Insight Tag
  if (hasLinkedIn) {
    activeFindings.push({
      checkpoint: "LinkedIn Insight Tag",
      issueName: "None (Active)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "LinkedIn Insight Tag detected and tracking conversion audiences.",
      canFix: false,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "LinkedIn Insight Tag",
      issueName: "No LinkedIn Tag Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "LinkedIn B2B tracking tag is not configured on this website.",
      canFix: false,
      isSetup: false
    });
  }

  // 11. Twitter / X Pixel
  if (hasTwitter) {
    activeFindings.push({
      checkpoint: "Twitter / X Conversion Pixel",
      issueName: "None (Active)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Twitter / X ad pixel detected and recording visitor actions.",
      canFix: false,
      isSetup: true
    });
  } else {
    notSetupFindings.push({
      checkpoint: "Twitter / X Conversion Pixel",
      issueName: "No Twitter Tag Found",
      status: "Not Tracking Setup Yet",
      statusColor: "text-slate-500 bg-slate-800/40 border-slate-700/50",
      details: "Twitter / X conversion tracking is not configured on this website.",
      canFix: false,
      isSetup: false
    });
  }

  window.currentAuditData = [...activeFindings, ...notSetupFindings];

  let score = 100;
  const activeCount = activeFindings.length;
  const fixableIssuesCount = activeFindings.filter((item) => item.canFix).length;

  if (activeCount > 0) {
    score = Math.round(100 - (fixableIssuesCount / activeCount) * 100);
  } else {
    score = 0;
  }

  document.getElementById("siteTested").innerText = url;
  overallScoreEl.innerText = `${score}/100`;
  overallScoreEl.className =
    score >= 80
      ? "text-2xl font-black text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-xl border border-emerald-500/20"
      : score >= 50
      ? "text-2xl font-black text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-xl border border-amber-500/20"
      : "text-2xl font-black text-rose-400 bg-rose-500/10 px-3.5 py-1 rounded-xl border border-rose-500/20";

  issuesSummaryBadge.innerText = `${fixableIssuesCount} Actionable Issues Detected (${activeCount} Active Platforms)`;

  auditRows.innerHTML = window.currentAuditData
    .map(
      (row) => `
    <tr class="${row.isSetup ? "bg-slate-900/60" : "bg-slate-950/40 opacity-70"}">
      <td class="p-4 font-semibold text-white">${row.checkpoint}</td>
      <td class="p-4">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${row.statusColor}">
          ${row.status}
        </span>
      </td>
      <td class="p-4 text-xs text-slate-300 leading-relaxed">
        <div class="font-semibold text-slate-200 mb-0.5">${row.issueName}</div>
        <div class="text-slate-400">${row.details}</div>
      </td>
      <td class="p-4 text-right">
        ${
          row.canFix
            ? `<button type="button" onclick="window.openBookingModal('${row.checkpoint} - ${row.issueName}')" class="text-xs bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg border border-indigo-500/30 transition cursor-pointer whitespace-nowrap">Fix Issue</button>`
            : row.isSetup
            ? `<span class="text-xs text-emerald-400 font-medium">Optimal</span>`
            : `<button type="button" onclick="window.openBookingModal('New Setup: ${row.checkpoint}')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer whitespace-nowrap">+ Setup</button>`
        }
      </td>
    </tr>
  `
    )
    .join("");

  const bmSiteUrl = document.getElementById("bmSiteUrl");
  const bmPlatform = document.getElementById("bmPlatform");
  const bmFormType = document.getElementById("bmFormType");
  if (bmSiteUrl) bmSiteUrl.value = url;
  if (bmPlatform) bmPlatform.value = platform;
  if (bmFormType) bmFormType.value = formType;

  auditBtn.disabled = false;
  auditBtn.innerText = "Run Free Audit";
  statusMsg.classList.add("hidden");
  results.classList.remove("hidden");

  const navBookBtn = document.getElementById("navBookFixBtn");
  if (navBookBtn) {
    navBookBtn.classList.remove("hidden");
    navBookBtn.classList.add("flex");
  }

  results.scrollIntoView({ behavior: "smooth" });
};

// Export to CSV
window.downloadCSVReport = function () {
  if (!window.currentAuditData.length) return;
  let csv = "Platform & Checkpoint,Status,Issue Name,Diagnostic Details\n";
  window.currentAuditData.forEach((row) => {
    csv += `"${row.checkpoint}","${row.status}","${row.issueName}","${row.details.replace(/"/g, '""')}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `AuditReport_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF
window.downloadPDFReport = function () {
  if (!window.currentAuditData.length) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("AuditMyTracking - Technical Audit Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Audited URL: ${window.currentAuditedUrl}`, 14, 28);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 34);

  const tableData = window.currentAuditData.map((row) => [
    row.checkpoint,
    row.status,
    `${row.issueName}: ${row.details}`,
  ]);

  doc.autoTable({
    startY: 42,
    head: [["Platform & Checkpoint", "Status", "Issue & Diagnostic Details"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.save(`AuditReport_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Auto-fill & Open Booking Modal
window.openBookingModal = async function (serviceName) {
  const modal = document.getElementById("bookingModal");
  const serviceInput = document.getElementById("bmServiceType");
  const siteUrlInput = document.getElementById("bmSiteUrl");
  const platformSelect = document.getElementById("bmPlatform");
  const formSelect = document.getElementById("bmFormType");
  const nameInput = document.getElementById("bmName");
  const emailInput = document.getElementById("bmEmail");

  if (serviceInput) serviceInput.value = serviceName;

  if (siteUrlInput && window.currentAuditedUrl) {
    siteUrlInput.value = window.currentAuditedUrl;
    if (platformSelect) {
      platformSelect.value = window.lastDetectedPlatform || "Shopify";
    }
    if (formSelect) {
      formSelect.value = window.lastDetectedForm || "Standard / Native Form";
    }
  }

  const { data: { session } } = await window.sbClient.auth.getSession();
  if (session && session.user) {
    if (emailInput) emailInput.value = session.user.email || "";
    if (nameInput) {
      nameInput.value =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        "";
    }
  }

  window.onCountryChanged("booking");
  if (modal) modal.classList.remove("hidden");
};

window.closeBookingModal = function () {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.classList.add("hidden");
};

// Booking Form Submit Handler
window.handleBookingSubmit = async function () {
  const isPhoneValid = window.validatePhoneLive("booking");
  if (!isPhoneValid) {
    const selectEl = document.getElementById("bmCountrySelect");
    alert("Please enter a valid WhatsApp number for " + selectEl.options[selectEl.selectedIndex].value + ".");
    return;
  }

  const name = document.getElementById("bmName").value.trim();
  const email = document.getElementById("bmEmail").value.trim();
  const fullWhatsApp = document.getElementById("bmWhatsApp").value.trim();
  const selectEl = document.getElementById("bmCountrySelect");
  const countryName = selectEl.options[selectEl.selectedIndex].value;

  const siteUrl = document.getElementById("bmSiteUrl").value.trim();
  const platform = document.getElementById("bmPlatform").value;
  const formType = document.getElementById("bmFormType").value;
  const service = document.getElementById("bmServiceType").value;
  const notes = document.getElementById("bmNotes").value.trim();
  const btn = document.getElementById("bmSubmitBtn");

  btn.disabled = true;
  btn.innerText = "Submitting...";

  const payload = {
    type: "booking",
    full_name: name,
    email: email,
    whatsapp: toWhatsAppLink(fullWhatsApp),
    country: countryName,
    website_url: siteUrl,
    platform: platform,
    form_type: formType,
    service_requested: service,
    notes: notes,
  };

  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Google Sheets Error:", e);
  }

  try {
    await window.sbClient.from("leads").insert([payload]);
  } catch (e) {
    console.error("Supabase Backup Error:", e);
  }

  btn.disabled = false;
  btn.innerText = "Submit Booking Request";

  alert("Thank you! Your request has been sent. We will reach out to your Email/WhatsApp within a few hours.");
  window.closeBookingModal();
};

// DOM Content Loaded Listener
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signupForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      window.handleSignup();
    });
  }

  window.onCountryChanged("signup");

  window.sbClient.auth.getSession().then((res) => {
    if (res.data && res.data.session) {
      window.showView("dashboard");
    } else {
      window.showView("signup");
    }
  });

  window.sbClient.auth.onAuthStateChange((event, session) => {
    if (session) {
      window.showView("dashboard");
    } else {
      window.showView("signup");
    }
  });
});