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