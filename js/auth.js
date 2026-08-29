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

