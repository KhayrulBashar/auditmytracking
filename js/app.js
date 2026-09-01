// ============================================================================
// app.js — Notification Modal + Boot/Session Init
// guest হলেও dashboard (অডিট বক্স) দেখাবে; audit চালাতে গেলে signup গেট (পথ A)
// ============================================================================

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

// guest কিনা তা সহজে জানার হেল্পার (audit.js এ audit gating-এ ব্যবহার হয়)
window.isUserLoggedIn = async function () {
  return await window.requireSessionForDashboard();
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

  // OAuth redirect হলে token সেট হতে একটু সময় দাও
  const hash = window.location.hash;
  const isFreshOAuth = hash && hash.includes("access_token");
  if (isFreshOAuth) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    // নতুন OAuth লগইন = সফল sign in, তাই logout flag মুছে দাও
    localStorage.removeItem("user_logged_out");
  }

  const { data: { session }, error } = await window.sbClient.auth.getSession();

  // session পড়া হয়ে গেছে — এখন URL থেকে hash (#access_token / #) পরিষ্কার করো।
  // getSession এর পরে করায় token পড়া নিশ্চিত, তারপর পরিষ্কার URL থাকে।
  // replaceState তাই reload হয় না, history তে বাড়তি entry পড়ে না।
 if (window.location.href.indexOf("#") !== -1) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }

  // ── GUEST অবস্থা: session নেই ──────────────────────────────────────────
  // পথ A: guest কেও dashboard (অডিট বক্স) দেখাবো, শুধু audit চালাতে গেলে গেট
  if (error || !session || !session.user) {
    window.showView("dashboard"); // guest dashboard (nav auto guest হবে)
    // fallback: typewriter নিশ্চিতভাবে চালু আছে কিনা
    setTimeout(() => {
      const el = document.getElementById("typewriterText");
      if (el && !el.innerText.trim() && typeof window.startTypewriterSafe === "function") {
        window.startTypewriterSafe();
      }
    }, 300);
    return;
  }

  // ── LOGOUT অবস্থা: session আছে কিন্তু ইউজার আগে logout করেছে ──────────
  // পথ ক: session রাখা হয় (OTP ছাড়া re-login এর জন্য), কিন্তু dashboard
  // খুলবে না — login পেজ দেখাবে যাতে ইউজার নিজে sign in করে
  if (localStorage.getItem("user_logged_out") === "true") {
    window.showView("login");
    return;
  }

  // ── LOGGED-IN অবস্থা: আসল session আছে ─────────────────────────────────
  const user = session.user;
  const email = (user.email || "").trim().toLowerCase();
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0] || "User";
  const phone = user.user_metadata?.phone || "";
  const country = user.user_metadata?.country || "";

  // এই Google ইউজার কি আগে profile সম্পূর্ণ করেছে? (phone আছে কিনা)
  const alreadySynced = localStorage.getItem(`google_synced_${email}`) === "true";
  const hasCompleteProfile = alreadySynced || (phone && phone !== "Google OAuth");

  if (!hasCompleteProfile) {
    // ── নতুন Google ইউজার — phone/country নেই ──────────────────────────
    // Sheet এ এখনো পাঠাব না। আগে "Complete Profile" screen দেখাই যেখানে
    // ইউজার phone + country দেবে, তারপর সম্পূর্ণ ডেটা Sheet এ যাবে।
    localStorage.setItem("verified_user_email", email);
    window.showView("completeProfile");

    // name + email auto-fill (email locked)
    setTimeout(() => {
      const cpName = document.getElementById("cpName");
      const cpEmail = document.getElementById("cpEmail");
      if (cpName) cpName.value = fullName;
      if (cpEmail) cpEmail.value = email;
    }, 100);
    return;
  }

  // ── profile আগে সম্পূর্ণ — সরাসরি dashboard ─────────────────────────
  // auto-fill ও returning-login UI-র জন্য hint সেভ (dashboard access নয়)
  localStorage.setItem("verified_user_email", email);
  localStorage.setItem("signup_fullName", fullName);
  if (country) localStorage.setItem("signup_country", country);
  if (phone) localStorage.setItem("signup_phone", phone);

  window.showView("dashboard");

  // fallback: dashboard দেখানোর পর typewriter নিশ্চিতভাবে চালু আছে কিনা
  setTimeout(() => {
    if (typeof window.startTypewriterSafe === "function") {
      const el = document.getElementById("typewriterText");
      // লেখা খালি থাকলে (animation চলছে না) তবেই আবার চালু করো
      if (el && !el.innerText.trim()) {
        window.startTypewriterSafe();
      }
    }
  }, 300);
});
