// ============================================================================
// auth.js — Auth, Validation, View Control (Supabase session ভিত্তিক, হ্যাক-প্রুফ)
// পথ ক: logout করলেও Supabase session রাখা হয়, তাই re-login OTP ছাড়া হয়।
// dashboard access-এর একমাত্র সত্য = Supabase session (localStorage flag নয়)।
// ============================================================================

// Supabase Auth State Change Listener
window.sbClient.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    // শুধু session না থাকলে guest hint অনুযায়ী view দেখাবে (data মুছবে না)
    if (typeof window.showView === "function" && !window.suppressAuthRedirect) {
      const hint = localStorage.getItem("verified_user_email");
      window.showView(hint ? "login" : "signup");
    }
  }
});

// ইউজারের অডিট-সম্পর্কিত অস্থায়ী ডেটা পরিষ্কার (session/verified email রাখে)
window.clearAuditState = function () {
  window.currentAuditData = [];
  window.currentAuditedUrl = "";
  const targetUrlInput = document.getElementById("targetUrl");
  const resultsDiv = document.getElementById("results");
  const auditRows = document.getElementById("auditRows");
  if (targetUrlInput) targetUrlInput.value = "";
  if (resultsDiv) resultsDiv.classList.add("hidden");
  if (auditRows) auditRows.innerHTML = "";
};

// সম্পূর্ণ সেশন ডেটা মুছে ফেলা (শুধু অ্যাকাউন্ট ডিলিট বা হার্ড রিসেটে ব্যবহার্য)
window.clearSessionData = function () {
  localStorage.clear();
  window.clearAuditState();
};

// dashboard খোলার আগে সবসময় আসল Supabase session যাচাই করে (হ্যাক-প্রুফ গেট)
window.requireSessionForDashboard = async function () {
  try {
    const { data: { session } } = await window.sbClient.auth.getSession();
    return !!(session && session.user);
  } catch (e) {
    return false;
  }
};

// custom dropdown reset (signup view আবার খুললে "Choose Country" তে ফেরাও)
window.resetCountryDropdown = function (formType) {
  const prefix = formType === "signup" ? "su" : formType === "complete" ? "cp" : "bm";
  const hidden = document.getElementById(prefix + "CountrySelect");
  const label = document.getElementById(prefix + "CountryLabel");
  const panel = document.getElementById(prefix + "CountryPanel");
  if (hidden && hidden.tagName === "INPUT") {
    hidden.value = "";
    hidden.setAttribute("data-code", "");
    hidden.setAttribute("data-min", "");
    hidden.setAttribute("data-max", "");
  }
  if (label) {
    label.innerText = "Choose Country";
    label.classList.add("text-slate-400");
    label.classList.remove("text-white");
  }
  if (panel) panel.classList.add("hidden");

  // country রিসেট হলে phone ফিল্ডও লক করো (country না বাছা অবস্থায় ফিরে যাক)
  const phoneId = prefix === "su" ? "suPhone" : prefix === "cp" ? "cpPhone" : "bmWhatsApp";
  const phoneInput = document.getElementById(phoneId);
  if (phoneInput) {
    phoneInput.value = "";
    phoneInput.placeholder = "Choose Country First";
    phoneInput.disabled = true;
  }
};

// ── custom searchable country dropdown ─────────────────────────────────────
// signup এ native <select> এর বদলে custom panel ব্যবহার হয় (search সহ)।
// booking/complete এখনো native select — তাই helper দুই structure ই পড়ে।

// একটা form এর নির্বাচিত country data পড়ে: { name, code, min, max }
// signup: hidden input (data-* attribute) থেকে; booking/complete: select option থেকে
window.getSelectedCountry = function (formType) {
  // তিন form ই এখন custom dropdown — hidden input এ data-* attribute রাখে
  const prefix = formType === "signup" ? "su" : formType === "complete" ? "cp" : "bm";
  const h = document.getElementById(prefix + "CountrySelect");
  if (!h || !h.value) return null;
  return {
    name: h.value,
    code: h.getAttribute("data-code") || "",
    min: parseInt(h.getAttribute("data-min") || "6"),
    max: parseInt(h.getAttribute("data-max") || "14"),
  };
};

// dropdown panel খোলা/বন্ধ (আপাতত signup এই ব্যবহার হয়)
window.toggleCountryDropdown = function (formType) {
  const prefix = formType === "signup" ? "su" : formType === "complete" ? "cp" : "bm";
  const panel = document.getElementById(prefix + "CountryPanel");
  const search = document.getElementById(prefix + "CountrySearch");
  if (!panel) return;
  const isOpen = !panel.classList.contains("hidden");
  if (isOpen) {
    panel.classList.add("hidden");
    return;
  }
  // list এখনো render না হলে render করো
  window.renderCountryList(formType);
  panel.classList.remove("hidden");
  if (search) {
    search.value = "";
    window.filterCountryList(formType);
    setTimeout(() => search.focus(), 30);
  }
};

// COUNTRY_LIST থেকে option গুলো render করে
window.renderCountryList = function (formType, filter) {
  const prefix = formType === "signup" ? "su" : formType === "complete" ? "cp" : "bm";
  const box = document.getElementById(prefix + "CountryOptions");
  if (!box || typeof COUNTRY_LIST === "undefined") return;

  const q = (filter || "").trim().toLowerCase();
  const items = COUNTRY_LIST.filter((c) => {
    if (!q) return true;
    return c.n.toLowerCase().includes(q) || c.c.toLowerCase().includes(q);
  });

  if (items.length === 0) {
    box.innerHTML = '<div class="px-3 py-3 text-xs text-slate-500 text-center">No country found</div>';
    return;
  }

  box.innerHTML = items
    .map(
      (c) =>
        `<button type="button" class="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between gap-2"
          onclick="window.selectCountry('${formType}', ${JSON.stringify(c.n).replace(/"/g, "&quot;")}, '${c.c}', ${c.mn}, ${c.mx})">
          <span class="truncate">${c.n}</span>
          <span class="text-slate-400 flex-shrink-0">${c.c}</span>
        </button>`
    )
    .join("");
};

// search box এ টাইপ করলে filter
window.filterCountryList = function (formType) {
  const prefix = formType === "signup" ? "su" : formType === "complete" ? "cp" : "bm";
  const search = document.getElementById(prefix + "CountrySearch");
  window.renderCountryList(formType, search ? search.value : "");
};

// একটা country বাছাই করলে
window.selectCountry = function (formType, name, code, min, max) {
  const prefix = formType === "signup" ? "su" : formType === "complete" ? "cp" : "bm";
  const hidden = document.getElementById(prefix + "CountrySelect");
  const label = document.getElementById(prefix + "CountryLabel");
  const panel = document.getElementById(prefix + "CountryPanel");

  if (hidden) {
    hidden.value = name;
    hidden.setAttribute("data-code", code);
    hidden.setAttribute("data-min", String(min));
    hidden.setAttribute("data-max", String(max));
  }
  if (label) {
    label.innerText = `${code} (${name})`;
    label.classList.remove("text-slate-400");
    label.classList.add("text-white");
  }
  if (panel) panel.classList.add("hidden");

  window.onCountryChanged(formType);
};

// বাইরে ক্লিক করলে খোলা dropdown বন্ধ হবে
document.addEventListener("click", function (e) {
  ["su", "cp", "bm"].forEach((p) => {
    const wrap = document.getElementById(p + "CountryWrap");
    const panel = document.getElementById(p + "CountryPanel");
    if (wrap && panel && !panel.classList.contains("hidden") && !wrap.contains(e.target)) {
      panel.classList.add("hidden");
    }
  });
});

window.onCountryChanged = function (formType) {
  // তিন context: signup (su), booking (bm), complete profile (cp)
  let phoneId;
  if (formType === "signup") {
    phoneId = "suPhone";
  } else if (formType === "complete") {
    phoneId = "cpPhone";
  } else {
    phoneId = "bmWhatsApp";
  }
  const phoneInput = document.getElementById(phoneId);
  if (!phoneInput) return;

  const country = window.getSelectedCountry(formType);

  // country না বাছলে → ফিল্ড disabled, placeholder দেখাও, খালি
  if (!country) {
    phoneInput.value = "";
    phoneInput.placeholder = "Choose Country First";
    phoneInput.disabled = true;
    return;
  }

  // country বাছা হলে → enable করো, placeholder সরাও, country code বসাও, cursor code এর পরে
  const code = country.code || "";
  phoneInput.disabled = false;
  phoneInput.placeholder = "";
  phoneInput.value = code ? code : "";
  phoneInput.focus();
  const len = phoneInput.value.length;
  try { phoneInput.setSelectionRange(len, len); } catch (e) {}

  window.validatePhoneLive(formType);
};

window.validatePhoneLive = function (formType) {
  // তিন context: signup (su), booking (bm), complete profile (cp)
  let phoneId, warnId;
  if (formType === "signup") {
    phoneId = "suPhone"; warnId = "phoneWarning";
  } else if (formType === "complete") {
    phoneId = "cpPhone"; warnId = "cpPhoneWarning";
  } else {
    phoneId = "bmWhatsApp"; warnId = "bmPhoneWarning";
  }
  const phoneInput = document.getElementById(phoneId);
  const warningEl = document.getElementById(warnId);
  if (!phoneInput) return true;

  const country = window.getSelectedCountry(formType);
  if (!country) {
    // country না বাছলে ফোন ভ্যালিডেশন এখানে আটকাবে না (country চেক আলাদা)
    return true;
  }

  const countryName = country.name;
  const prefix = country.code || "+1";
  const minDigits = country.min;
  const maxDigits = country.max;

  let val = phoneInput.value;

  if (!val.startsWith(prefix)) {
    val = prefix + val.replace(/\D/g, "");
  }

  const afterPrefix = val.substring(prefix.length).replace(/\D/g, "");
  phoneInput.value = prefix + afterPrefix;

  if (warningEl) {
    if (afterPrefix.length < minDigits || afterPrefix.length > maxDigits) {
      const requiredText = minDigits === maxDigits ? `${minDigits}` : `${minDigits}-${maxDigits}`;
      warningEl.innerText = `Invalid length for ${countryName}. Requires valid ${requiredText} digits after ${prefix}`;
      warningEl.classList.remove("hidden");
      return false;
    }

    warningEl.classList.add("hidden");
  }

  return true;
};

// নাম ভ্যালিডেশন — junk keyword (test/fake/demo ...) ব্লক করে (পথ A)
window.validateNameLive = function () {
  const nameInput = document.getElementById("suFullName");
  const warningEl = document.getElementById("nameWarning");
  if (!nameInput || !warningEl) return true;

  const cleaned = nameInput.value.replace(/[^a-zA-Z\s.]/g, "");
  nameInput.value = cleaned;
  const trimmed = cleaned.trim();

  if (!trimmed) {
    warningEl.innerText = "Full name is required";
    warningEl.classList.remove("hidden");
    return false;
  }

  if (trimmed.length < 2) {
    warningEl.innerText = "Name must be at least 2 letters long";
    warningEl.classList.remove("hidden");
    return false;
  }

  // junk keyword চেক — নামের শব্দগুলোর সাথে মেলালে ব্লক
  const words = trimmed.toLowerCase().split(/\s+/);
  const junkHit = words.find((w) => JUNK_KEYWORDS.includes(w));
  if (junkHit) {
    warningEl.innerText = "Please enter your real full name";
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
    warningEl.innerText = "Please enter a valid work email format";
    warningEl.classList.remove("hidden");
    return false;
  }

  if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
    warningEl.innerText = "Temporary/Disposable emails are strictly not allowed";
    warningEl.classList.remove("hidden");
    return false;
  }

  warningEl.classList.add("hidden");
  return true;
};

// লোগো ক্লিক — logout অবস্থায় dashboard খুলবে না, login/signup এ পাঠাবে
window.handleLogoClick = async function () {
  // ইউজার logout করেছে? (session থাকলেও dashboard access বন্ধ)
  const loggedOut = localStorage.getItem("user_logged_out") === "true";
  const verifiedSavedEmail = localStorage.getItem("verified_user_email");

  if (loggedOut) {
    // logout অবস্থা: verified থাকলে login পেজ (dashboard নয়)
    window.showView(verifiedSavedEmail ? "login" : "signup");
    return;
  }

  const hasSession = await window.requireSessionForDashboard();
  if (hasSession) {
    // logged-in ইউজার → dashboard
    window.showView("dashboard");
  } else if (verifiedSavedEmail) {
    // আগে signup করেছে কিন্তু এখন session নেই → login পেজ
    window.showView("login");
  } else {
    // fresh guest (কখনো signup করেনি) → dashboard এই থাকবে, কিছু খুলবে না।
    // শুধু উপরের Sign Up আর নিচের Run Free Audit signup এ পাঠাবে।
    window.showView("dashboard");
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
  const views = ["viewSignup", "viewCompleteProfile", "viewLogin", "viewDashboard"];
  views.forEach((v) => {
    const el = document.getElementById(v);
    if (el) el.classList.add("hidden");
  });

  const verifiedSavedEmail = localStorage.getItem("verified_user_email");

  if (view === "signup") {
    document.getElementById("viewSignup").classList.remove("hidden");
    window.resetCountryDropdown("signup");
    window.onCountryChanged("signup");
    window.updateNavHeader("guest");
  } else if (view === "completeProfile") {
    document.getElementById("viewCompleteProfile").classList.remove("hidden");
    window.updateNavHeader("guest");
    window.resetCountryDropdown("complete");
    window.onCountryChanged("complete");
  } else if (view === "login") {
    document.getElementById("viewLogin").classList.remove("hidden");
    // verified email থাকলে "returning" (Log In বাটন), নাহলে "guest" (Sign Up)
    window.updateNavHeader(verifiedSavedEmail ? "returning" : "guest");

    const loginGoogleArea = document.getElementById("loginGoogleArea");
    const loginEmailInput = document.getElementById("loginEmail");
    const loginEmailLabel = document.getElementById("loginEmailLabel");
    const loginFormEmail = document.getElementById("loginFormEmail");
    const loginFormOtp = document.getElementById("loginFormOtp");
    const loginTitle = document.getElementById("loginTitle");
    const loginSubtitle = document.getElementById("loginSubtitle");
    const loginSignupPrompt = document.getElementById("loginSignupPrompt");

    // পথ ক: verified email থাকলে "returning user" login — শুধু email, OTP ছাড়া
    if (verifiedSavedEmail) {
      if (loginGoogleArea) loginGoogleArea.classList.add("hidden");
      if (loginSignupPrompt) loginSignupPrompt.classList.add("hidden");
      // email storage থেকে নেওয়া হলো — ইউজার logout করে এসেছে, তাই edit করার
      // দরকার নেই। field locked রাখা হলো (readonly + বদলানো যাবে না)।
      if (loginEmailInput) {
        loginEmailInput.value = verifiedSavedEmail;
        loginEmailInput.setAttribute("readonly", "readonly");
        loginEmailInput.classList.add("cursor-not-allowed", "opacity-90");
      }
      if (loginTitle) loginTitle.innerText = "Welcome Back";
      if (loginSubtitle) {
        loginSubtitle.innerText = "You're all set. Just confirm to securely access your workspace.";
      }
      if (loginEmailLabel) loginEmailLabel.innerText = "Email";
    } else {
      if (loginGoogleArea) loginGoogleArea.classList.remove("hidden");
      if (loginSignupPrompt) loginSignupPrompt.classList.remove("hidden");
      // fresh visitor — email টাইপ করতে হবে, তাই field খোলা রাখো
      if (loginEmailInput) {
        loginEmailInput.removeAttribute("readonly");
        loginEmailInput.classList.remove("cursor-not-allowed", "opacity-90");
        if (!window.tempAuthData) loginEmailInput.value = "";
      }
      if (loginTitle) loginTitle.innerText = "Welcome Back";
      if (loginSubtitle) {
        loginSubtitle.innerText = "Enter your registered business email to access your workspace.";
      }
      if (loginEmailLabel) loginEmailLabel.innerText = "Email";
    }

    if (loginFormEmail && loginFormOtp) {
      loginFormEmail.classList.remove("hidden");
      loginFormOtp.classList.add("hidden");
    }
  } else if (view === "dashboard") {
    document.getElementById("viewDashboard").classList.remove("hidden");
    // guest নাকি logged-in তা session দিয়ে ঠিক হয় (async, নিচে updateNavHeader এ)
    window.refreshDashboardNav();
    // গার্ডেড স্টার্টার (audit.js এ) — overlap/দ্রুত হওয়া রোধ করে
    if (typeof window.startTypewriterSafe === "function") {
      window.startTypewriterSafe();
    }
  }
};

// dashboard-এ nav ঠিক করা — session থাকলে logged-in nav, নাহলে guest nav
window.refreshDashboardNav = async function () {
  const hasSession = await window.requireSessionForDashboard();
  window.updateNavHeader(hasSession ? "user" : "guest");
};

// nav header — states: "user" (logged in), "returning" (logged out, known), "guest"
window.updateNavHeader = function (state) {
  const navArea = document.getElementById("navAuthArea");
  if (!navArea) return;

  if (state === "user") {
    navArea.innerHTML = `
      <button type="button" onclick="window.openBookingModal('Book Tracking Setup')" class="flex items-center text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl transition shadow-lg shadow-cyan-500/20 cursor-pointer whitespace-nowrap">
        <span class="sm:hidden">Book Setup</span>
        <span class="hidden sm:inline">Book Tracking Setup</span>
      </button>
      <button type="button" onclick="window.handleLogout()" class="text-xs sm:text-sm font-semibold bg-rose-600/80 hover:bg-rose-500 text-white px-2.5 sm:px-3.5 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap">
        Log Out
      </button>
    `;
  } else if (state === "returning") {
    // logout অবস্থা: verified ইউজার — Log In দেখাও (Sign Up নয়)
    navArea.innerHTML = `
      <button type="button" onclick="window.showView('login')" class="text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 px-3.5 sm:px-4 py-1.5 rounded-lg transition shadow-lg shadow-cyan-500/20 cursor-pointer whitespace-nowrap">
        Log In
      </button>
    `;
  } else {
    // fresh guest: Sign Up দেখাও
    navArea.innerHTML = `
      <button type="button" onclick="window.showView('signup')" class="text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 sm:px-4 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap">
        Sign Up
      </button>
    `;
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

  // country বাছাই বাধ্যতামূলক (placeholder "Choose Country" থাকলে আটকাবে)
  const chosenCountry = window.getSelectedCountry("signup");

  if (!chosenCountry) {
    const warn = document.getElementById("phoneWarning");
    if (warn) {
      warn.innerText = "Please choose your country";
      warn.classList.remove("hidden");
    }
    return;
  }

  const isPhoneValid = window.validatePhoneLive("signup");
  if (!isNameValid || !isEmailValid || !isPhoneValid) return;

  const countryName = chosenCountry.name;
  const full_name = document.getElementById("suFullName").value.trim();
  const email = document.getElementById("suEmail").value.trim().toLowerCase();
  const fullPhone = document.getElementById("suPhone").value.trim();
  const cleanPhoneLink = toWhatsAppLink(fullPhone);

  const existingVerifiedEmail = (localStorage.getItem("verified_user_email") || "").trim().toLowerCase();

  // ইউজারকে login এ পাঠানোর সাধারণ helper (duplicate ধরা পড়লে)
  const sendToLoginAsRegistered = () => {
    window.showNotificationModal(
      "warning",
      "Account Already Exists",
      `An account is already registered with ${email}. Please log in to access your workspace.`,
      () => {
        localStorage.setItem("verified_user_email", email);
        window.showView("login");
      },
      "Go to Log In"
    );
  };

  // ধাপ ১ (দ্রুত, একই browser): localStorage এ verified email মিললে সাথে সাথে আটকাও
  if (existingVerifiedEmail && existingVerifiedEmail === email) {
    sendToLoginAsRegistered();
    return;
  }

  const suBtn = document.getElementById("suBtn");

  // ধাপ ২ (নিখুঁত, অন্য browser/device ও): server-side এ auth.users যাচাই
  // Edge Function { exists: true/false } দেয়। exists হলে signup আটকাও।
  suBtn.innerText = "Checking your email...";
  suBtn.disabled = true;

  try {
    const chkRes = await fetch(CHECK_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": "Bearer " + SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email: email }),
    });
    if (chkRes.ok) {
      const chk = await chkRes.json();
      if (chk && chk.exists === true) {
        suBtn.innerText = "Register & Send Verification Code";
        suBtn.disabled = false;
        sendToLoginAsRegistered();
        return;
      }
    }
    // chkRes ok না হলে বা exists:false — signup চালিয়ে যাও
    // (server অনুপলব্ধ হলেও Apps Script duplicate-prevention শেষ রক্ষাকবচ)
  } catch (e) {
    // network fail হলে signup আটকাব না — flow চালু রাখি
    console.error("check-email call failed:", e);
  }

  suBtn.innerText = "Sending Verification OTP...";
  suBtn.disabled = true;

  // ⚠️ নিরাপত্তা: এখানে Sheet এ Sign_Up পাঠানো হয় না।
  // OTP verify সফল হলে তবেই verifyOtp() থেকে Sheet এ যাবে — যাতে
  // ভুয়া/unverified ইমেইল কখনো Sheet এ না ঢোকে।
  const otpPromise = window.sbClient.auth.signInWithOtp({
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

  const res = await otpPromise;

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

// পথ ক: returning user login — Supabase session যাচাই করে, OTP ছাড়া
window.handleDirectLogin = async function () {
  const emailInput = document.getElementById("loginEmail");
  const inputEmail = (emailInput ? emailInput.value : "").trim().toLowerCase();

  if (!inputEmail) {
    window.showNotificationModal("warning", "Email Required", "Please enter your registered work email.");
    return;
  }

  // আসল Supabase session আছে কিনা যাচাই — এটাই হ্যাক-প্রুফ গেট
  const { data: { session } } = await window.sbClient.auth.getSession();
  const sessionEmail = (session?.user?.email || "").trim().toLowerCase();

  if (session && session.user && sessionEmail === inputEmail) {
    // session আছে, email মিলেছে → OTP ছাড়াই ঢুকবে (নিরাপদ)
    localStorage.removeItem("user_logged_out"); // logout flag মুছে দাও
    window.dataLayer.push({
      event: "login_success",
      user_data: {
        email: inputEmail,
        name: localStorage.getItem("signup_fullName") || ""
      }
    });
    window.showView("dashboard");
  } else if (session && session.user && sessionEmail !== inputEmail) {
    // session আছে কিন্তু অন্য email দিয়েছে
    window.showNotificationModal(
      "warning",
      "Email Mismatch",
      `This device is signed in as ${sessionEmail}. Please use that email, or log out first.`
    );
  } else {
    // কোনো session নেই → নিরাপত্তার জন্য নতুন করে verify করতে হবে (OTP পাঠাও)
    window.showNotificationModal(
      "warning",
      "Verification Needed",
      "For your security, please verify with a one-time code sent to your email.",
      async () => {
        const suBtn = document.getElementById("loginBtn");
        if (suBtn) { suBtn.disabled = true; suBtn.innerText = "Sending Code..."; }

        const res = await window.sbClient.auth.signInWithOtp({
          email: inputEmail,
          options: { shouldCreateUser: false },
        });

        if (suBtn) { suBtn.disabled = false; suBtn.innerText = "Log In to Workspace"; }

        if (res.error) {
          window.showNotificationModal(
            "warning",
            "Account Not Found",
            "No verified account found with this email. Please create an account first.",
            () => {
              window.showView("signup");
              const suEmail = document.getElementById("suEmail");
              if (suEmail) suEmail.value = inputEmail;
            }
          );
        } else {
          window.tempAuthData = { type: "login", email: inputEmail };
          activateOtpScreen(inputEmail);
        }
      },
      "Send Login Code"
    );
  }
};

window.verifyOtp = async function () {
  const tokenInput = document.getElementById("loginOtp");
  const token = (tokenInput ? tokenInput.value : "").trim();
  const email = window.tempAuthData?.email || "";
  // signup নাকি login flow — Sheet এ Sign_Up পাঠানোর সিদ্ধান্তে লাগবে
  // (tempAuthData পরে null হয়ে যায়, তাই এখনই ধরে রাখি)
  const wasSignup = window.tempAuthData?.type === "signup";
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

  // verified email hint রাখা হয় (returning-user login UI-র জন্য), কিন্তু
  // dashboard access তবু session দিয়েই যাচাই হবে
  localStorage.removeItem("user_logged_out"); // login সফল → logout flag মুছে দাও
  localStorage.setItem("verified_user_email", email);
  if (window.tempAuthData?.fullName) {
    localStorage.setItem("signup_fullName", window.tempAuthData.fullName);
  }
  if (window.tempAuthData?.country) {
    localStorage.setItem("signup_country", window.tempAuthData.country);
  }
  if (window.tempAuthData?.phone) {
    localStorage.setItem("signup_phone", window.tempAuthData.phone);
  }
  window.tempAuthData = null;

  // ✅ নিরাপত্তা: OTP verify সফল হয়েছে — এখন তবেই Sheet এ Sign_Up পাঠাও।
  // শুধু signup flow এর জন্য (login এর সময় নয়, কারণ login মানে আগেই signup হয়েছে)।
  if (wasSignup) {
    fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        form_name: "Sign_Up",
        full_name: localStorage.getItem("signup_fullName") || "",
        email: email,
        whatsapp: localStorage.getItem("signup_phone") || "",
        country: localStorage.getItem("signup_country") || "",
        remarks: "Lead"
      }),
    }).catch((e) => console.error("Sheet Sync Error:", e));
  }

  window.dataLayer.push({
    event: "login_success",
    user_data: { email: email, name: localStorage.getItem("signup_fullName") || "" }
  });

  window.showNotificationModal(
    "success",
    "Verification Successful!",
    "Your email has been verified. Directing to your workspace...",
    () => {
      window.showView("dashboard");
    }
  );
};

// পথ ক: logout করলে session রাখা হয় (signOut করা হয় না), শুধু view পাল্টায়।
// তাই একই ডিভাইসে email দিয়ে OTP ছাড়া আবার ঢোকা যায়।
window.handleLogout = async function () {
  window.clearAuditState();
  // logout flag সেট — logo ক্লিকে/reload এ dashboard খুলবে না, login চাইবে
  localStorage.setItem("user_logged_out", "true");
  // Note: signOut করা হচ্ছে না — session persist থাকে (returning login OTP ছাড়া)
  window.showView("login");
};

// সম্পূর্ণ signout (dropdown/menu থেকে "Sign out completely" চাইলে ব্যবহার্য)
window.handleFullSignOut = async function () {
  window.suppressAuthRedirect = true;
  try { await window.sbClient.auth.signOut(); } catch (e) {}
  window.suppressAuthRedirect = false;
  window.clearSessionData();
  window.showView("signup");
};

// ============================================================================
// COMPLETE PROFILE (Google OAuth এর পর phone + country সংগ্রহ)
// ============================================================================

// name validation — signup এর validateNameLive এর মতোই (junk keyword সহ)
window.validateCompleteProfileName = function () {
  const nameInput = document.getElementById("cpName");
  const warningEl = document.getElementById("cpNameWarning");
  if (!nameInput || !warningEl) return true;

  const cleaned = nameInput.value.replace(/[^a-zA-Z\s.]/g, "");
  nameInput.value = cleaned;
  const trimmed = cleaned.trim();

  if (!trimmed) {
    warningEl.innerText = "Full name is required";
    warningEl.classList.remove("hidden");
    return false;
  }
  if (trimmed.length < 2) {
    warningEl.innerText = "Name must be at least 2 letters long";
    warningEl.classList.remove("hidden");
    return false;
  }
  const words = trimmed.toLowerCase().split(/\s+/);
  const junkHit = words.find((w) => JUNK_KEYWORDS.includes(w));
  if (junkHit) {
    warningEl.innerText = "Please enter your real full name";
    warningEl.classList.remove("hidden");
    return false;
  }
  warningEl.classList.add("hidden");
  return true;
};

// profile submit — সব যাচাই করে Sheet এ Sign_Up পাঠায়, তারপর dashboard
window.handleCompleteProfile = async function () {
  const nameInput = document.getElementById("cpName");
  const emailInput = document.getElementById("cpEmail");
  const phoneInput = document.getElementById("cpPhone");
  const phoneWarning = document.getElementById("cpPhoneWarning");
  const submitBtn = document.getElementById("cpSubmitBtn");

  // ১. name যাচাই
  if (!window.validateCompleteProfileName()) {
    nameInput.focus();
    return;
  }

  // ২. country বাছা হয়েছে কিনা (custom dropdown → hidden input)
  const selectedCountry = window.getSelectedCountry("complete");
  if (!selectedCountry) {
    if (phoneWarning) {
      phoneWarning.innerText = "Please choose your country";
      phoneWarning.classList.remove("hidden");
    }
    return;
  }

  // ৩. phone যাচাই (signup এর মতোই digit count — খালি/ভুল দৈর্ঘ্য দুটোই এখানে ধরা পড়ে)
  if (!window.validatePhoneLive("complete")) {
    phoneInput.focus();
    return;
  }

  const fullName = nameInput.value.trim();
  const email = (emailInput.value || "").trim().toLowerCase();
  const countryName = selectedCountry.name;
  const cleanPhone = phoneInput.value.replace(/\s+/g, "");
  const cleanPhoneLink = "https://wa.me/" + cleanPhone.replace(/[^0-9]/g, "");

  submitBtn.disabled = true;
  submitBtn.innerText = "Logging in to Dashboard...";

  // localStorage এ সেভ (auto-fill ও returning login এর জন্য)
  localStorage.setItem("verified_user_email", email);
  localStorage.setItem("signup_fullName", fullName);
  localStorage.setItem("signup_country", countryName);
  localStorage.setItem("signup_phone", cleanPhoneLink);

  // Supabase user_metadata তেও phone/country আপডেট (ভবিষ্যতে কাজে লাগবে)
  try {
    await window.sbClient.auth.updateUser({
      data: { full_name: fullName, phone: cleanPhoneLink, country: countryName },
    });
  } catch (e) {
    console.error("updateUser error:", e);
  }

  // Sheet এ Sign_Up পাঠাও (এখন সম্পূর্ণ ডেটা সহ)
  const googleSignupSyncedKey = `google_synced_${email}`;
  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        form_name: "Sign_Up",
        full_name: fullName,
        email: email,
        whatsapp: cleanPhoneLink,
        country: countryName,
        remarks: "Lead"
      }),
    });
    localStorage.setItem(googleSignupSyncedKey, "true");
  } catch (err) {
    console.error("Complete profile sheet sync error:", err);
  }

  // conversion ট্র্যাকিং
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "login_success",
    user_data: { email: email, name: fullName },
  });

  submitBtn.disabled = false;
  submitBtn.innerText = "Continue to Dashboard";
  window.showView("dashboard");
};
