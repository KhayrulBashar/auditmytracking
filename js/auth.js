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

window.onCountryChanged = function (formType) {
  const isSignup = formType === "signup";
  const selectEl = document.getElementById(isSignup ? "suCountrySelect" : "bmCountrySelect");
  const phoneInput = document.getElementById(isSignup ? "suPhone" : "bmWhatsApp");
  if (!selectEl || !phoneInput) return;

  const selectedOpt = selectEl.options[selectEl.selectedIndex];

  // "Choose Country" (খালি value) সিলেক্ট থাকলে → placeholder দেখাও, ফিল্ড খালি
  if (!selectedOpt || !selectedOpt.value) {
    phoneInput.value = "";
    phoneInput.placeholder = "123456789";
    return;
  }

  // country বাছা হলে → placeholder সরিয়ে country code বসাও, cursor code এর পরে
  const code = selectedOpt.getAttribute("data-code") || "";
  phoneInput.placeholder = "";
  phoneInput.value = code ? code : "";
  phoneInput.focus();
  // cursor কে code এর পরে নিয়ে যাও যাতে ইউজার সরাসরি নাম্বার টাইপ করতে পারে
  const len = phoneInput.value.length;
  try { phoneInput.setSelectionRange(len, len); } catch (e) {}

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
  if (!selectedOpt || !selectedOpt.value) {
    // country না বাছলে ফোন ভ্যালিডেশন এখানে আটকাবে না (country চেক আলাদা)
    return true;
  }

  const countryName = selectedOpt.value;
  const prefix = selectedOpt.getAttribute("data-code") || "+1";
  const minDigits = parseInt(selectedOpt.getAttribute("data-min") || "8");
  const maxDigits = parseInt(selectedOpt.getAttribute("data-max") || "12");

  let val = phoneInput.value;

  if (!val.startsWith(prefix)) {
    val = prefix + val.replace(/\D/g, "");
  }

  const afterPrefix = val.substring(prefix.length).replace(/\D/g, "");
  phoneInput.value = prefix + afterPrefix;

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

// নাম ভ্যালিডেশন — junk keyword (test/fake/demo ...) ব্লক করে (পথ A)
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

  // junk keyword চেক — নামের শব্দগুলোর সাথে মেলালে ব্লক
  const words = trimmed.toLowerCase().split(/\s+/);
  const junkHit = words.find((w) => JUNK_KEYWORDS.includes(w));
  if (junkHit) {
    warningEl.innerText = "Please enter your real full name.";
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

// লোগো ক্লিক — logout অবস্থায় dashboard খুলবে না, login/signup এ পাঠাবে
window.handleLogoClick = async function () {
  // ইউজার logout করেছে? (session থাকলেও dashboard access বন্ধ)
  const loggedOut = localStorage.getItem("user_logged_out") === "true";
  const verifiedSavedEmail = localStorage.getItem("verified_user_email");

  if (loggedOut) {
    // logout অবস্থা: verified থাকলে login, নাহলে signup — dashboard নয়
    window.showView(verifiedSavedEmail ? "login" : "signup");
    return;
  }

  const hasSession = await window.requireSessionForDashboard();
  if (hasSession) {
    window.showView("dashboard");
  } else {
    window.showView(verifiedSavedEmail ? "login" : "signup");
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
    window.updateNavHeader("guest");
  } else if (view === "login") {
    document.getElementById("viewLogin").classList.remove("hidden");
    // verified email থাকলে "returning" (Log In বাটন), নাহলে "guest" (Sign Up)
    window.updateNavHeader(verifiedSavedEmail ? "returning" : "guest");

    const loginGoogleArea = document.getElementById("loginGoogleArea");
    const loginEmailInput = document.getElementById("loginEmail");
    const loginFormEmail = document.getElementById("loginFormEmail");
    const loginFormOtp = document.getElementById("loginFormOtp");
    const loginSubtitle = document.getElementById("loginSubtitle");
    const loginSignupPrompt = document.getElementById("loginSignupPrompt");

    // পথ ক: verified email থাকলে "returning user" login — শুধু email, OTP ছাড়া
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
      <button type="button" onclick="window.openBookingModal('Book Tracking Setup')" class="flex items-center text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl transition shadow-lg shadow-cyan-500/20 cursor-pointer">
        Book Tracking Setup
      </button>
      <button type="button" onclick="window.handleLogout()" class="text-sm font-semibold bg-rose-600/80 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg transition cursor-pointer">
        Log Out
      </button>
    `;
  } else if (state === "returning") {
    // logout অবস্থা: verified ইউজার — Log In দেখাও (Sign Up নয়)
    navArea.innerHTML = `
      <button type="button" onclick="window.showView('login')" class="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition shadow-lg shadow-cyan-500/20 cursor-pointer">
        Log In
      </button>
    `;
  } else {
    // fresh guest: Sign Up দেখাও
    navArea.innerHTML = `
      <button type="button" onclick="window.showView('signup')" class="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition cursor-pointer">
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
  const selectEl = document.getElementById("suCountrySelect");
  const selectedOpt = selectEl ? selectEl.options[selectEl.selectedIndex] : null;
  const countryChosen = selectedOpt && selectedOpt.value;

  if (!countryChosen) {
    const warn = document.getElementById("phoneWarning");
    if (warn) {
      warn.innerText = "Please choose your country.";
      warn.classList.remove("hidden");
    }
    return;
  }

  const isPhoneValid = window.validatePhoneLive("signup");
  if (!isNameValid || !isEmailValid || !isPhoneValid) return;

  const countryName = selectedOpt.value;
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

  const suBtn = document.getElementById("suBtn");
  suBtn.innerText = "Sending Verification OTP...";
  suBtn.disabled = true;

  // ⚡ স্পিড ফিক্স: Sheet sync আর OTP একসাথে (parallel) চালানো হয়,
  // আগে Sheet শেষ হওয়ার জন্য অপেক্ষা করত (ধীর ছিল)
  const sheetSync = fetch(GOOGLE_SHEET_WEBHOOK_URL, {
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
  }).catch((e) => console.error("Sheet Sync Error:", e));

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

  const [res] = await Promise.all([otpPromise, sheetSync]);

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
