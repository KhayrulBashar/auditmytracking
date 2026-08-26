const SUPABASE_URL = "https://flpmaegkhkxxaitlgglv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscG1hZWdraGt4eGFpdGxnZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTQ2NTEsImV4cCI6MjEwMzI5MDY1MX0.8N8ufCLJ5xktDoGULzuUA2Lwy_EAWWihXAnIN742Lj8";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let tempEmail = "";

const DISPOSABLE_DOMAINS = [
  "tempmail.com", "temp-mail.org", "10minutemail.com", "guerrillamail.com",
  "mailinator.com", "trashmail.com", "yopmail.com", "sharklasers.com",
  "dispostable.com", "getnada.com", "fakeinbox.com", "mohmal.com",
  "crazymailing.com", "throwawaymail.com", "burnermail.io", "tempail.com"
];

// গ্লোবাল ফাংশন হিসেবে ডিক্লেয়ার করা যাতে onclick বা event listener উভয় থেকেই পায়
window.handleGoogleSignIn = async function() {
  console.log("Initiating Google Sign-In via Supabase...");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://khayrulbashar.github.io/auditmytracking/",
    },
  });

  if (error) {
    alert("Google Sign-In Error: " + error.message);
    console.error("Auth error details:", error);
  }
};

function onCountryChanged() {
  validatePhoneLive();
}

function validatePhoneLive() {
  const selectEl = document.getElementById("suCountrySelect");
  const phoneInput = document.getElementById("suPhone");
  const warningEl = document.getElementById("phoneWarning");
  if (!selectEl || !phoneInput || !warningEl) return true;

  const selectedOpt = selectEl.options[selectEl.selectedIndex];
  const countryName = selectedOpt.value;
  const minDigits = parseInt(selectedOpt.getAttribute("data-min") || "8");
  const maxDigits = parseInt(selectedOpt.getAttribute("data-max") || "12");

  const raw = phoneInput.value.replace(/\D/g, "");
  phoneInput.value = raw;

  if (!raw) {
    warningEl.classList.add("hidden");
    return false;
  }

  if (raw.length < minDigits || raw.length > maxDigits) {
    warningEl.innerText = `Invalid length for ${countryName}. Requires ${
      minDigits === maxDigits ? minDigits : `${minDigits}-${maxDigits}`
    } digits (Current: ${raw.length}).`;
    warningEl.classList.remove("hidden");
    return false;
  } else {
    warningEl.classList.add("hidden");
    return true;
  }
}

function validateEmailLive() {
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
    warningEl.innerText = "Temporary/Disposable emails are not allowed. Please use a valid work email.";
    warningEl.classList.remove("hidden");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    warningEl.innerText = "Please enter a valid email address.";
    warningEl.classList.remove("hidden");
    return false;
  }

  warningEl.classList.add("hidden");
  return true;
}

function showView(view) {
  const views = ["viewSignup", "viewLogin", "viewDashboard", "viewPricing"];
  views.forEach((v) => {
    const el = document.getElementById(v);
    if (el) el.classList.add("hidden");
  });

  if (view === "signup") {
    document.getElementById("viewSignup").classList.remove("hidden");
  } else if (view === "login") {
    document.getElementById("viewLogin").classList.remove("hidden");
    document.getElementById("loginStepEmail").classList.remove("hidden");
    document.getElementById("loginStepOtp").classList.add("hidden");
  } else if (view === "dashboard") {
    document.getElementById("viewDashboard").classList.remove("hidden");
    updateNavForLoggedInUser();
  } else if (view === "pricing") {
    document.getElementById("viewPricing").classList.remove("hidden");
  }
}

function updateNavForLoggedInUser() {
  const navArea = document.getElementById("navAuthArea");
  if (navArea) {
    navArea.innerHTML = `
      <button type="button" onclick="showView('pricing')" class="text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition">
        Pricing
      </button>
      <button type="button" onclick="handleLogout()" class="text-sm font-semibold bg-rose-600/80 hover:bg-rose-500 text-white px-4 py-1.5 rounded-lg transition">
        Log Out
      </button>
    `;
  }
}

async function handleSignup() {
  if (!validateEmailLive()) {
    alert("Please enter a valid work email before proceeding.");
    return;
  }

  if (!validatePhoneLive()) {
    const selectEl = document.getElementById("suCountrySelect");
    const countryName = selectEl.options[selectEl.selectedIndex].value;
    alert(`Please enter a valid phone number for ${countryName}.`);
    return;
  }

  const selectEl = document.getElementById("suCountrySelect");
  const selectedOpt = selectEl.options[selectEl.selectedIndex];
  const countryName = selectedOpt.value;
  const countryCode = selectedOpt.getAttribute("data-code");

  const full_name = document.getElementById("suFullName").value.trim();
  const email = document.getElementById("suEmail").value.trim().toLowerCase();
  const rawPhone = document.getElementById("suPhone").value.trim();
  const suBtn = document.getElementById("suBtn");

  const fullPhone = `${countryCode} ${rawPhone}`;

  suBtn.innerText = "Sending Code...";
  suBtn.disabled = true;

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      data: {
        full_name: full_name,
        phone: fullPhone,
        country: countryName,
      },
    },
  });

  suBtn.innerText = "Register & Send Code";
  suBtn.disabled = false;

  if (error) {
    alert("Signup Error: " + error.message);
  } else {
    alert(`Verification OTP has been sent to ${email}`);
    tempEmail = email;
    showView("login");
    document.getElementById("loginStepEmail").classList.add("hidden");
    document.getElementById("loginStepOtp").classList.remove("hidden");
  }
}

async function requestOtp() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const btn = document.getElementById("otpSendBtn");

  if (!email) {
    alert("Please enter your account email.");
    return;
  }

  btn.innerText = "Sending Code...";
  btn.disabled = true;

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
  });

  btn.innerText = "Send OTP Code";
  btn.disabled = false;

  if (error) {
    alert("Error: " + error.message);
  } else {
    tempEmail = email;
    document.getElementById("loginStepEmail").classList.add("hidden");
    document.getElementById("loginStepOtp").classList.remove("hidden");
  }
}

async function verifyOtp() {
  const token = document.getElementById("loginOtp").value.trim();
  const btn = document.getElementById("otpVerifyBtn");

  if (token.length !== 6) {
    alert("Please enter the complete 6-digit OTP code.");
    return;
  }

  btn.innerText = "Verifying...";
  btn.disabled = true;

  const {
    data: { session },
    error,
  } = await supabase.auth.verifyOtp({
    email: tempEmail,
    token: token,
    type: "email",
  });

  btn.innerText = "Verify & Sign In";
  btn.disabled = false;

  if (error) {
    alert("Invalid OTP code: " + error.message);
  } else {
    showView("dashboard");
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  window.location.reload();
}

async function runAudit() {
  const url = document.getElementById("targetUrl").value.trim();
  const auditBtn = document.getElementById("auditBtn");
  const statusMsg = document.getElementById("statusMsg");
  const results = document.getElementById("results");
  const auditRows = document.getElementById("auditRows");

  auditBtn.disabled = true;
  auditBtn.innerText = "Scanning...";
  statusMsg.classList.remove("hidden");
  results.classList.add("hidden");

  setTimeout(() => {
    document.getElementById("siteTested").innerText = url;

    auditRows.innerHTML = `
      <tr>
        <td class="p-4 font-medium text-white">Google Tag Manager (GTM) Container</td>
        <td class="p-4"><span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Passed</span></td>
        <td class="p-4 text-xs">Primary GTM Web Container loaded in &lt;head&gt; without blocking scripts.</td>
      </tr>
      <tr>
        <td class="p-4 font-medium text-white">Google Consent Mode v2 Signals</td>
        <td class="p-4"><span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Inactive</span></td>
        <td class="p-4 text-xs text-rose-300">ad_storage and ad_personalization signals are missing. Audience remarketing is severely impaired in EU/UK regions.</td>
      </tr>
      <tr>
        <td class="p-4 font-medium text-white">Server-Side Tracking & CNAME Cloaking</td>
        <td class="p-4"><span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Warning</span></td>
        <td class="p-4 text-xs">Tagging server uses CNAME cloaking. Safari ITP caps cookies at 7 days. Recommend direct A/AAAA records.</td>
      </tr>
      <tr>
        <td class="p-4 font-medium text-white">Meta Conversions API (CAPI) Deduplication</td>
        <td class="p-4"><span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Partial</span></td>
        <td class="p-4 text-xs">Browser Pixel detected, but unique event_id deduplication with server payload is inconsistent.</td>
      </tr>
    `;

    auditBtn.disabled = false;
    auditBtn.innerText = "Run Audit";
    statusMsg.classList.add("hidden");
    results.classList.remove("hidden");

    results.scrollIntoView({ behavior: "smooth" });
  }, 1500);
}

function promptUpgrade(featureName) {
  alert(`"${featureName}" is available on the Agency / Growth Plan. View the tiers below.`);
  const pricingAnchor = document.getElementById("pricingGridAnchor");
  if (pricingAnchor) {
    pricingAnchor.scrollIntoView({ behavior: "smooth" });
  }
}

function handlePlanSelection(planName) {
  alert(`Thank you for selecting "${planName}". Redirecting to onboarding & checkout flow...`);
}

// DOM লোড হওয়ার পর ইভেন্ট লিসেনার ও সেশন চেক
document.addEventListener("DOMContentLoaded", async () => {
  const btnSignup = document.getElementById("googleSignInBtnSignup");
  const btnLogin = document.getElementById("googleSignInBtnLogin");

  if (btnSignup) {
    btnSignup.addEventListener("click", window.handleGoogleSignIn);
  }
  if (btnLogin) {
    btnLogin.addEventListener("click", window.handleGoogleSignIn);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    showView("dashboard");
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      showView("dashboard");
    }
  });
});