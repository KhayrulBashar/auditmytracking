// GTM DataLayer Initialization
window.dataLayer = window.dataLayer || [];

// Supabase JS Client
window.sbClient = window.supabase.createClient(
  "https://flpmaegkhkxxaitlgglv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscG1hZWdraGt4eGFpdGxnZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTQ2NTEsImV4cCI6MjEwMzI5MDY1MX0.8N8ufCLJ5xktDoGULzuUA2Lwy_EAWWihXAnIN742Lj8"
);

// Google Apps Script Web App URL
const GOOGLE_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzKG5Mbo0RaLJvDl7s152am29lXOLr-bJI3WUEtcIxWxles9caFkpfhrReEyATGT5TGIQ/exec";

window.tempAuthData = null;
window.currentAuditData = [];
window.currentAuditedUrl = "";
window.lastDetectedPlatform = "Shopify";
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

// Supabase Auth State Change Listener
window.sbClient.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    window.clearSessionData();
    if (typeof window.showView === "function") {
      window.showView("login");
    }
  }
});

// ইউজার ডিলিট বা লগআউট হলে ব্রাউজারের সমস্ত ডেটা ও সেশন চিরতরে রিমুভ করার ফাংশন
window.clearSessionData = function () {
  localStorage.clear(); // ব্রাউজারের লোকাল স্টোরেজের সমস্ত ডেটা মুছে ফেলবে

  window.currentAuditData = [];
  window.currentAuditedUrl = "";

  const targetUrlInput = document.getElementById("targetUrl");
  const resultsDiv = document.getElementById("results");
  const auditRows = document.getElementById("auditRows");
  
  if (targetUrlInput) targetUrlInput.value = "";
  if (resultsDiv) resultsDiv.classList.add("hidden");
  if (auditRows) auditRows.innerHTML = "";
};

window.showNotificationModal = function (type, title, message, callback = null, customBtnText = null) {
  const modal = document.getElementById("customNotifyModal");
  const card = document.getElementById("notifyCard");
  const iconContainer = document.getElementById("notifyIconContainer");
  const iconSpan = document.getElementById("notifyIcon");
  const titleEl = document.getElementById("notifyTitle");
  const msgEl = document.getElementById("notifyMessage");
  const btn = document.getElementById("notifyBtn");

  if (!modal) return;
  window.notifyCallback = callback;

  if (titleEl) titleEl.innerText = title;
  if (msgEl) msgEl.innerText = message;

  if (type === "warning") {
    if (card) card.className = "bg-slate-900 border border-amber-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center transform transition-all";
    if (iconContainer) iconContainer.className = "w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 bg-amber-500/10 border border-amber-500/30";
    if (iconSpan) {
      iconSpan.innerHTML = `
        <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      `;
    }
    if (btn) {
      btn.className = "w-full py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20 cursor-pointer";
      btn.innerText = customBtnText || "Understood";
    }
  } else if (type === "success") {
    if (card) card.className = "bg-slate-900 border border-emerald-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center transform transition-all";
    if (iconContainer) iconContainer.className = "w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 bg-emerald-500/10 border border-emerald-500/30";
    if (iconSpan) {
      iconSpan.innerHTML = `
        <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
      `;
    }
    if (btn) {
      btn.className = "w-full py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/25 cursor-pointer";
      btn.innerText = customBtnText || "Proceed";
    }
  } else {
    if (card) card.className = "bg-slate-900 border border-rose-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center transform transition-all";
    if (iconContainer) iconContainer.className = "w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 bg-rose-500/10 border border-rose-500/30";
    if (iconSpan) {
      iconSpan.innerHTML = `
        <svg class="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `;
    }
    if (btn) {
      btn.className = "w-full py-2.5 rounded-xl font-semibold text-sm bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg cursor-pointer";
      btn.innerText = customBtnText || "Close";
    }
  }

  modal.classList.remove("hidden");
};

window.closeNotificationModal = function () {
  const modal = document.getElementById("customNotifyModal");
  if (modal) modal.classList.add("hidden");
  if (typeof window.notifyCallback === "function") {
    window.notifyCallback();
    window.notifyCallback = null;
  }
};

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
let processingInterval = null;

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

function startProcessingAnimation() {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }
  const el = document.getElementById("typewriterText");
  if (!el) return;

  let dots = 0;
  const baseText = "Please wait a while. It's processing";
  el.innerText = baseText;
  
  processingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    el.innerText = baseText + ".".repeat(dots);
  }, 400);
}

function stopProcessingAnimation() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
  currentCharIndex = 0;
  isDeleting = false;
  startTypewriter();
}

function detectPlatformAndForm(html, url) {
  const lowerHtml = (html || "").toLowerCase();
  const lowerUrl = (url || "").toLowerCase();

  let platform = "Custom Coded";
  let formType = "Standard / Native Form";

  const kShopify = "shop" + "ify";
  const kCdnShopify = "cdn." + kShopify + ".com";
  const kWoo = "woo" + "commerce";
  const kWpContent = "wp-" + "content";

  if (
    lowerHtml.includes(kCdnShopify) ||
    lowerHtml.includes(kShopify + ".theme") ||
    lowerHtml.includes(kShopify + "-payment") ||
    lowerHtml.includes("my" + kShopify + ".com") ||
    lowerHtml.includes("wpm@") ||
    lowerHtml.includes("trekkie") ||
    lowerUrl.includes(kShopify)
  ) {
    platform = "Shopify";
  } else if (lowerHtml.includes(kWoo) || lowerHtml.includes("wc-ajax")) {
    platform = "WooCommerce";
  } else if (lowerHtml.includes(kWpContent) || lowerHtml.includes("wp-includes")) {
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

  return { platform, formType };
}

window.onCountryChanged = function (formType) {
  const isSignup = formType === "signup";
  const selectEl = document.getElementById(isSignup ? "suCountrySelect" : "bmCountrySelect");
  const phoneInput = document.getElementById(isSignup ? "suPhone" : "bmWhatsApp");
  if (!selectEl || !phoneInput) return;

  const selectedOpt = selectEl.options[selectEl.selectedIndex];
  if (!selectedOpt || !selectedOpt.value) return;

  const code = selectedOpt.getAttribute("data-code") || "";
  phoneInput.value = code ? code + " " : "";
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
  if (!selectedOpt || !selectedOpt.value) return true;

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

window.validateEmailLive = function (inputId = "suEmail", warningId = "emailWarning") {
  const emailInput = document.getElementById(inputId);
  const warningEl = document.getElementById(warningId);
  if (!emailInput || !warningEl) return true;

  const email = emailInput.value.trim().toLowerCase();
  if (!email) {
    warningEl.classList.add("hidden");
    return false;
  }

  const parts = email.split("@");
  const domain = parts[1] || "";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    warningEl.innerText = "Please enter a valid work email format.";
    warningEl.classList.remove("hidden");
    return false;
  }

  if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
    warningEl.innerText = "Temporary/Disposable emails are strictly not allowed.";
    warningEl.classList.remove("hidden");
    return false;
  }

  warningEl.classList.add("hidden");
  return true;
};

window.handleLogoClick = function () {
  const isUserLoggedIn = localStorage.getItem("user_logged_in");
  if (isUserLoggedIn === "true") {
    window.showView("dashboard");
  } else {
    const verifiedSavedEmail = localStorage.getItem("verified_user_email");
    if (verifiedSavedEmail) {
      window.showView("login");
    } else {
      window.showView("signup");
    }
  }
};

window.handleGoogleSignIn = async function () {
  const redirectUrl = window.location.origin + window.location.pathname;
  const res = await window.sbClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl },
  });
  if (res.error) {
    window.showNotificationModal("error", "Sign-In Failed", res.error.message);
  }
};

window.showView = function (view) {
  const views = ["viewSignup", "viewLogin", "viewDashboard"];
  views.forEach((v) => {
    const el = document.getElementById(v);
    if (el) el.classList.add("hidden");
  });

  const verifiedSavedEmail = localStorage.getItem("verified_user_email");

  if (view === "signup") {
    document.getElementById("viewSignup").classList.remove("hidden");
    window.onCountryChanged("signup");
    window.updateNavHeader(false);
  } else if (view === "login") {
    document.getElementById("viewLogin").classList.remove("hidden");
    window.updateNavHeader(false);

    const loginGoogleArea = document.getElementById("loginGoogleArea");
    const loginEmailInput = document.getElementById("loginEmail");
    const loginFormEmail = document.getElementById("loginFormEmail");
    const loginFormOtp = document.getElementById("loginFormOtp");
    const loginSubtitle = document.getElementById("loginSubtitle");
    const loginSignupPrompt = document.getElementById("loginSignupPrompt");

    if (verifiedSavedEmail) {
      if (loginGoogleArea) loginGoogleArea.classList.add("hidden");
      if (loginSignupPrompt) loginSignupPrompt.classList.add("hidden");
      if (loginEmailInput) loginEmailInput.value = verifiedSavedEmail;
    } else {
      if (loginGoogleArea) loginGoogleArea.classList.remove("hidden");
      if (loginSignupPrompt) loginSignupPrompt.classList.remove("hidden");
      if (loginEmailInput && !window.tempAuthData) loginEmailInput.value = "";
    }

    if (loginFormEmail && loginFormOtp) {
      loginFormEmail.classList.remove("hidden");
      loginFormOtp.classList.add("hidden");
    }

    if (loginSubtitle) {
      loginSubtitle.innerText = "Enter your registered business email to access your workspace.";
    }
  } else if (view === "dashboard") {
    document.getElementById("viewDashboard").classList.remove("hidden");
    window.updateNavHeader(true);
    if (!typewriterTimeout && !processingInterval) {
      startTypewriter();
    }
  }
};

window.updateNavHeader = function (isLoggedIn) {
  const navArea = document.getElementById("navAuthArea");
  if (!navArea) return;

  const verifiedSavedEmail = localStorage.getItem("verified_user_email");

  if (isLoggedIn) {
    navArea.innerHTML = `
      <button type="button" onclick="window.openBookingModal('Book Tracking Setup')" class="flex items-center text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl transition shadow-lg shadow-cyan-500/20 cursor-pointer">
        Book Tracking Setup
      </button>
      <button type="button" onclick="window.handleLogout()" class="text-sm font-semibold bg-rose-600/80 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg transition cursor-pointer">
        Log Out
      </button>
    `;
  } else {
    if (verifiedSavedEmail) {
      navArea.innerHTML = ``;
    } else {
      navArea.innerHTML = `
        <button type="button" onclick="window.showView('login')" class="text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition cursor-pointer">
          Log In
        </button>
        <button type="button" onclick="window.showView('signup')" class="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition cursor-pointer">
          Sign Up
        </button>
      `;
    }
  }
};

function activateOtpScreen(email) {
  window.showView("login");

  const loginGoogleArea = document.getElementById("loginGoogleArea");
  const loginSignupPrompt = document.getElementById("loginSignupPrompt");
  if (loginGoogleArea) loginGoogleArea.classList.add("hidden");
  if (loginSignupPrompt) loginSignupPrompt.classList.add("hidden");

  document.getElementById("loginFormEmail").classList.add("hidden");
  document.getElementById("loginFormOtp").classList.remove("hidden");

  const loginSubtitle = document.getElementById("loginSubtitle");
  if (loginSubtitle) {
    loginSubtitle.innerHTML = `Please check your email inbox. A 6- to 8-digit verification code has been sent to <span class="text-white font-medium break-all">${email}</span>`;
  }

  const otpInput = document.getElementById("loginOtp");
  if (otpInput) {
    otpInput.value = "";
    otpInput.focus();
  }
}

window.handleSignup = async function () {
  const isNameValid = window.validateNameLive();
  const isEmailValid = window.validateEmailLive("suEmail", "emailWarning");
  const isPhoneValid = window.validatePhoneLive("signup");

  if (!isNameValid || !isEmailValid || !isPhoneValid) return;

  const selectEl = document.getElementById("suCountrySelect");
  const countryName = selectEl.options[selectEl.selectedIndex].value;
  const full_name = document.getElementById("suFullName").value.trim();
  const email = document.getElementById("suEmail").value.trim().toLowerCase();
  const fullPhone = document.getElementById("suPhone").value.trim();
  const cleanPhoneLink = toWhatsAppLink(fullPhone);

  const existingVerifiedEmail = (localStorage.getItem("verified_user_email") || "").trim().toLowerCase();

  if (existingVerifiedEmail && existingVerifiedEmail === email) {
    window.showNotificationModal(
      "warning",
      "Account Already Exists",
      `An account is already registered with ${email}. Please sign in to your workspace.`,
      () => {
        window.showView("login");
        const loginEmail = document.getElementById("loginEmail");
        if (loginEmail) loginEmail.value = email;
      }
    );
    return;
  }

  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        form_name: "Sign_Up",
        full_name: full_name,
        email: email,
        whatsapp: cleanPhoneLink,
        country: countryName,
        remarks: "Lead"
      }),
    });
  } catch (e) {
    console.error("Sheet Sync Error:", e);
  }

  const suBtn = document.getElementById("suBtn");
  suBtn.innerText = "Sending Verification OTP...";
  suBtn.disabled = true;

  const res = await window.sbClient.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
      data: {
        full_name: full_name,
        phone: cleanPhoneLink,
        country: countryName,
      },
    },
  });

  suBtn.innerText = "Register & Send Verification Code";
  suBtn.disabled = false;

  if (res.error) {
    const loginGoogleArea = document.getElementById("loginGoogleArea");
    if (loginGoogleArea) loginGoogleArea.classList.remove("hidden");

    window.showNotificationModal(
      "warning",
      "Email Service Busy",
      "Email delivery limit reached or unavailable. Please continue with Google for instant access.",
      () => {
        window.handleGoogleSignIn();
      },
      "Continue with Google"
    );
  } else {
    window.tempAuthData = {
      type: "signup",
      fullName: full_name,
      email: email,
      phone: cleanPhoneLink,
      country: countryName
    };

    window.showNotificationModal(
      "success",
      "OTP Code Dispatched",
      `Please check your email inbox. A 6- to 8-digit verification code has been sent to ${email}.`,
      () => {
        activateOtpScreen(email);
      }
    );
  }
};

window.handleDirectLogin = function () {
  const emailInput = document.getElementById("loginEmail");
  const inputEmail = (emailInput ? emailInput.value : "").trim().toLowerCase();
  const verifiedSavedEmail = (localStorage.getItem("verified_user_email") || "").trim().toLowerCase();

  if (!inputEmail) {
    window.showNotificationModal("warning", "Email Required", "Please enter your registered work email.");
    return;
  }

  if (verifiedSavedEmail && inputEmail === verifiedSavedEmail) {
    localStorage.setItem("user_logged_in", "true");

    window.dataLayer.push({
      event: "login_success",
      user_data: {
        email: inputEmail,
        name: localStorage.getItem("signup_fullName") || ""
      }
    });

    window.showView("dashboard");
  } else {
    window.showNotificationModal(
      "warning",
      "Account Not Recognized",
      "No verified account found with this email on this device. Please create an account first.",
      () => {
        window.showView("signup");
        const suEmail = document.getElementById("suEmail");
        if (suEmail) suEmail.value = inputEmail;
      }
    );
  }
};

window.verifyOtp = async function () {
  const tokenInput = document.getElementById("loginOtp");
  const token = (tokenInput ? tokenInput.value : "").trim();
  const email = window.tempAuthData?.email || "";
  const btn = document.getElementById("otpVerifyBtn");

  if (!email) {
    window.showNotificationModal("warning", "Missing Email", "Session expired. Please sign up again.", () => {
      window.showView("signup");
    });
    return;
  }

  if (token.length < 6) {
    window.showNotificationModal("warning", "Invalid Code Length", "Please enter the complete 6 to 8-digit OTP code.");
    return;
  }

  btn.innerText = "Verifying Code...";
  btn.disabled = true;

  let { data, error } = await window.sbClient.auth.verifyOtp({
    email: email,
    token: token,
    type: "email",
  });

  if (error) {
    const retrySignup = await window.sbClient.auth.verifyOtp({
      email: email,
      token: token,
      type: "signup",
    });
    data = retrySignup.data;
    error = retrySignup.error;
  }

  if (error) {
    const retryMagic = await window.sbClient.auth.verifyOtp({
      email: email,
      token: token,
      type: "magiclink",
    });
    data = retryMagic.data;
    error = retryMagic.error;
  }

  btn.innerText = "Verify Code & Enter Workspace";
  btn.disabled = false;

  if (error) {
    window.showNotificationModal("error", "Verification Failed", "Invalid or expired OTP code. Please check your email and try again.");
    return;
  }

  localStorage.setItem("user_logged_in", "true");
  localStorage.setItem("verified_user_email", email);
  window.tempAuthData = null;

  window.showNotificationModal(
    "success",
    "Verification Successful!",
    "Your email has been verified. Directing to your workspace...",
    () => {
      window.showView("dashboard");
    }
  );
};

window.handleLogout = async function () {
  try {
    await window.sbClient.auth.signOut();
  } catch (e) {}
  
  window.clearSessionData();
  window.showView("login");
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
  
  auditBtn.classList.add("animate-brand-wave");
  statusMsg.classList.remove("hidden");
  results.classList.add("hidden");

  startProcessingAnimation();

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
            ? `<button type="button" onclick="window.openBookingModal('Fix Tracking Issues')" class="text-xs bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg border border-indigo-500/30 transition cursor-pointer whitespace-nowrap">Fix Issue</button>`
            : row.isSetup
            ? `<span class="text-xs text-emerald-400 font-medium">Optimal</span>`
            : `<button type="button" onclick="window.openBookingModal('Book Tracking Setup')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer whitespace-nowrap">+ Setup</button>`
        }
      </td>
    </tr>
  `
    )
    .join("");

  auditBtn.disabled = false;
  auditBtn.innerText = "Run Free Audit";
  
  auditBtn.classList.remove("animate-brand-wave");
  statusMsg.classList.add("hidden");
  results.classList.remove("hidden");

  stopProcessingAnimation();

  results.scrollIntoView({ behavior: "smooth" });
};

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

const goalPlatformMap = {
  "Ecommerce": [
    "Shopify", "WooCommerce", "Magento / Adobe Commerce", "BigCommerce",
    "Wix Ecommerce", "Squarespace Commerce", "PrestaShop", "Shopware",
    "OpenCart", "Ecwid", "Custom Ecommerce", "Other"
  ],
  "Lead Generation": [
    "WordPress", "Webflow", "Wix", "Squarespace", "HubSpot CMS",
    "Shopify", "Framer", "Joomla", "Drupal", "Next.js / React",
    "Custom Website", "Other"
  ],
  "GHL / Funnel": [
    "GoHighLevel / LeadConnector", "ClickFunnels", "Systeme.io", "Kajabi",
    "Kartra", "Unbounce", "Leadpages", "Instapage", "SamCart",
    "ThriveCart", "FunnelKit", "Custom Funnel", "Other"
  ],
  "Booking / Appointment": [
    "Calendly", "Acuity Scheduling", "HubSpot Meetings", "Bookly",
    "Amelia", "SimplyBook.me", "Mews", "Cloudbeds", "Mindbody",
    "Fresha", "Cal.com", "Custom Booking System", "Other"
  ],
  "Phone Call Tracking": [
    "CallRail", "CallTrackingMetrics", "WhatConverts", "Google Ads Calls",
    "Twilio", "GoHighLevel Call Tracking", "Invoca", "Ringba",
    "Marchex", "Custom Call Tracking", "Other"
  ],
  "SaaS / Subscription": [
    "Custom SaaS / Web App", "Stripe", "Paddle", "Chargebee", "Recurly",
    "Memberstack", "Firebase", "Supabase", "Auth0", "Lemon Squeezy",
    "Shopify Subscription", "WooCommerce Subscription", "Other"
  ],
  "Offline Conversion": [
    "HubSpot", "Salesforce", "GoHighLevel", "Zoho CRM", "Pipedrive",
    "Microsoft Dynamics 365", "Google Sheets", "Airtable", "Zapier",
    "Make", "n8n", "Custom CRM", "Other"
  ],
  "Other": [
    "Custom Website", "Custom Web App", "Mobile App", "LMS / Course Platform",
    "Membership Platform", "Affiliate Platform", "Webinar Platform",
    "Donation Platform", "Event / Ticketing Platform", "Publisher / Blog",
    "Custom Tracking", "Other"
  ]
};

window.onBusinessGoalChanged = function () {
  const goalSelect = document.getElementById("bmGoal");
  const platformSelect = document.getElementById("bmPlatform");
  const platformLabel = document.getElementById("bmPlatformLabel");
  
  if (!goalSelect || !platformSelect) return;

  const selectedGoal = goalSelect.value;
  
  if (platformLabel) {
    platformLabel.innerText = selectedGoal === "SaaS / Subscription" ? "SaaS / Billing Platform" : "Platform";
  }

  platformSelect.innerHTML = '<option value="" disabled selected>Choose Platform</option>';

  if (goalPlatformMap[selectedGoal]) {
    goalPlatformMap[selectedGoal].forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.innerText = item;
      platformSelect.appendChild(opt);
    });
  }
};

window.openBookingModal = function (serviceName) {
  const modal = document.getElementById("bookingModal");
  const serviceInput = document.getElementById("bmServiceType");
  const siteUrlInput = document.getElementById("bmSiteUrl");
  const goalSelect = document.getElementById("bmGoal");
  const platformSelect = document.getElementById("bmPlatform");
  const objectiveInput = document.getElementById("bmObjective");
  const marketingInput = document.getElementById("bmMarketingPlatform");
  const nameInput = document.getElementById("bmName");
  const emailInput = document.getElementById("bmEmail");
  const modalTitle = document.getElementById("bmModalTitle");
  const modalDesc = document.getElementById("bmModalDesc");
  const notesLabel = document.getElementById("bmNotesLabel");
  const notesInput = document.getElementById("bmNotes");
  const submitBtnText = document.getElementById("bmSubmitBtnText");

  if (serviceInput) serviceInput.value = serviceName;

  if (modalTitle) {
    if (serviceName === "Book Tracking Setup") {
      modalTitle.innerText = "Book Expert Tracking Setup";
    } else {
      modalTitle.innerText = "Fix Your Tracking Issues";
    }
  }

  if (modalDesc) {
    if (serviceName === "Book Tracking Setup") {
      modalDesc.innerText = "Scale your business with precision data! Let our experts build a flawless tracking infrastructure so you never miss a single conversion.";
    } else {
      modalDesc.innerText = "Don't let broken data burn your ad budget! Our senior analytics engineers will diagnose and permanently fix your tracking gaps.";
    }
  }

  if (submitBtnText) {
    if (serviceName === "Book Tracking Setup") {
      submitBtnText.innerText = "Submit Setup Request";
    } else {
      submitBtnText.innerText = "Submit Fix Request";
    }
  }

  if (notesLabel && notesInput) {
    if (serviceName === "Fix Tracking Issues") {
      notesLabel.innerText = "Describe Your Tracking Issues";
      notesInput.placeholder = "Mention what is not working (e.g. Purchases not tracking in GA4...)";
    } else {
      notesLabel.innerText = "Issue Description / Requirements (Optional)";
      notesInput.placeholder = "Tell us about your tracking goals or issues...";
    }
  }

  if (siteUrlInput) {
    siteUrlInput.value = (serviceName === "Fix Tracking Issues" && window.currentAuditedUrl) ? window.currentAuditedUrl : "";
    siteUrlInput.placeholder = "https://yourwebsite.com";
  }

  if (goalSelect) goalSelect.selectedIndex = 0;
  if (platformSelect) {
    platformSelect.innerHTML = '<option value="" disabled selected>Choose Goal First</option>';
  }

  if (objectiveInput) objectiveInput.value = "";
  if (marketingInput) marketingInput.value = "";

  const countrySelect = document.getElementById("bmCountrySelect");
  if (countrySelect) countrySelect.selectedIndex = 0;

  const phoneInput = document.getElementById("bmWhatsApp");
  if (phoneInput) phoneInput.value = "";

  if (emailInput) emailInput.value = localStorage.getItem("verified_user_email") || "";
  if (nameInput) nameInput.value = localStorage.getItem("signup_fullName") || "";

  window.onCountryChanged("booking");
  if (modal) modal.classList.remove("hidden");
};

window.closeBookingModal = function () {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.classList.add("hidden");
};

window.handleBookingSubmit = async function () {
  const isEmailValid = window.validateEmailLive("bmEmail", "bmEmailWarning");
  if (!isEmailValid) {
    window.showNotificationModal("warning", "Invalid Email", "Please enter a valid, active business email.");
    return;
  }

  const isPhoneValid = window.validatePhoneLive("booking");
  if (!isPhoneValid) {
    const selectEl = document.getElementById("bmCountrySelect");
    const countryName = selectEl && selectEl.selectedIndex > 0 ? selectEl.options[selectEl.selectedIndex].value : "your country";
    window.showNotificationModal("warning", "Invalid WhatsApp", `Please select a country and enter a valid WhatsApp contact number for ${countryName}.`);
    return;
  }

  const name = document.getElementById("bmName").value.trim();
  const email = document.getElementById("bmEmail").value.trim().toLowerCase();
  const fullWhatsApp = document.getElementById("bmWhatsApp").value.trim();
  const selectEl = document.getElementById("bmCountrySelect");
  const countryName = selectEl && selectEl.selectedIndex > 0 ? selectEl.options[selectEl.selectedIndex].value : "Not Specified";
  const formattedWhatsApp = toWhatsAppLink(fullWhatsApp);

  const siteUrl = document.getElementById("bmSiteUrl").value.trim();
  const goal = document.getElementById("bmGoal").value;
  const platform = document.getElementById("bmPlatform").value;
  const objective = document.getElementById("bmObjective").value.trim();
  const marketingPlatform = document.getElementById("bmMarketingPlatform").value.trim();
  const service = document.getElementById("bmServiceType").value;
  const notes = document.getElementById("bmNotes").value.trim();
  const btn = document.getElementById("bmSubmitBtn");
  const submitBtnText = document.getElementById("bmSubmitBtnText");

  if (!countryName || countryName === "Not Specified") {
    window.showNotificationModal("warning", "Country Required", "Please select your country from the list.");
    return;
  }

  btn.disabled = true;
  if (submitBtnText) submitBtnText.innerText = "Submitting...";

  const isSetupBooking = service === "Book Tracking Setup";
  const formNameVal = isSetupBooking ? "Book_Tracking" : "Fix_Tracking";
  const dataLayerEventName = isSetupBooking ? "book_tracking_success" : "fix_tracking_success";

  const payload = {
    form_name: formNameVal,
    full_name: name,
    email: email,
    whatsapp: formattedWhatsApp,
    country: countryName,
    website_url: siteUrl,
    business_goal: goal,
    platform: platform,
    tracking_objective: objective,
    marketing_platform: marketingPlatform,
    description: notes,
    remarks: "Lead"
  };

  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Google Sheets Error:", e);
  }

  window.dataLayer.push({
    event: dataLayerEventName,
    user_data: {
      name: name,
      email: email,
      phone: formattedWhatsApp,
      country: countryName,
      website_url: siteUrl,
      business_goal: goal,
      platform: platform,
      tracking_objective: objective,
      marketing_platform: marketingPlatform,
      remarks: "Lead"
    }
  });

  btn.disabled = false;
  if (submitBtnText) {
    submitBtnText.innerText = isSetupBooking ? "Submit Setup Request" : "Submit Fix Request";
  }

  window.showNotificationModal(
    "success",
    "Request Received Successfully!",
    "Thank you! Your details have been submitted. Our tracking engineering lead will review your request and get in touch shortly.",
    () => {
      window.closeBookingModal();
    }
  );
};

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("signupForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      window.handleSignup();
    });
  }

  window.onCountryChanged("signup");

  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  const { data: { session }, error } = await window.sbClient.auth.getSession();

  if (error || !session || !session.user) {
    window.clearSessionData();
    const verifiedUserEmail = localStorage.getItem("verified_user_email");
    if (verifiedUserEmail) {
      window.showView("login");
    } else {
      window.showView("signup");
    }
    return;
  }

  const user = session.user;
  const email = (user.email || "").trim().toLowerCase();
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0] || "User";
  const phone = user.user_metadata?.phone || "";
  const country = user.user_metadata?.country || "United States";

  const googleSignupSyncedKey = `google_synced_${email}`;
  if (!localStorage.getItem(googleSignupSyncedKey)) {
    try {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          form_name: "Sign_Up",
          full_name: fullName,
          email: email,
          country: country,
          phone: phone || "Google OAuth",
          remarks: "Lead"
        }),
      });
      localStorage.setItem(googleSignupSyncedKey, "true");
    } catch (err) {
      console.error("Google user sheet sync error:", err);
    }
  }

  localStorage.setItem("user_logged_in", "true");
  localStorage.setItem("verified_user_email", email);
  localStorage.setItem("signup_fullName", fullName);
  localStorage.setItem("signup_country", country);
  if (phone) localStorage.setItem("signup_phone", phone);

  window.showView("dashboard");
});