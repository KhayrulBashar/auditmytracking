// ============================================================================
// contact.js — Contact ফর্মের সম্পূর্ণ লজিক (signup ফর্মের মতোই আচরণ)
// searchable country dropdown + phone disable/validation + Google Sheet এ submit
// form_name: Contact_Form | Message → description
// স্বয়ংসম্পূর্ণ — auth.js এর উপর নির্ভর করে না।
// ============================================================================

// ---------- Country dropdown (ct prefix) ----------
window.ctToggleDropdown = function () {
  const panel = document.getElementById("ctCountryPanel");
  if (!panel) return;
  const isHidden = panel.classList.contains("hidden");
  if (isHidden) {
    panel.classList.remove("hidden");
    ctRenderList("");
    const s = document.getElementById("ctCountrySearch");
    if (s) { s.value = ""; setTimeout(() => s.focus(), 50); }
  } else {
    panel.classList.add("hidden");
  }
};

window.ctRenderList = function (filter) {
  const box = document.getElementById("ctCountryOptions");
  if (!box || typeof COUNTRY_LIST === "undefined") return;
  const f = (filter || "").toLowerCase().trim();
  const list = COUNTRY_LIST.filter(
    (c) => !f || c.n.toLowerCase().includes(f) || c.c.includes(f)
  );
  box.innerHTML = list
    .map(
      (c) =>
        `<button type="button" onclick="window.ctSelectCountry('${c.n.replace(/'/g, "\\'")}','${c.c}',${c.mn},${c.mx})" class="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 flex justify-between gap-2"><span class="truncate">${c.n}</span><span class="text-slate-400 flex-shrink-0">${c.c}</span></button>`
    )
    .join("");
  if (!list.length) {
    box.innerHTML = `<div class="px-3 py-3 text-sm text-slate-500 text-center">No match found</div>`;
  }
};

window.ctFilterList = function () {
  const s = document.getElementById("ctCountrySearch");
  ctRenderList(s ? s.value : "");
};

window.ctSelectCountry = function (name, code, min, max) {
  const hidden = document.getElementById("ctCountrySelect");
  const label = document.getElementById("ctCountryLabel");
  const panel = document.getElementById("ctCountryPanel");
  if (hidden) {
    hidden.value = name;
    hidden.setAttribute("data-code", code);
    hidden.setAttribute("data-min", min);
    hidden.setAttribute("data-max", max);
  }
  if (label) {
    label.innerText = code + " (" + name + ")";
    label.classList.remove("text-slate-400");
    label.classList.add("text-white");
  }
  if (panel) panel.classList.add("hidden");
  // phone enable + prefix বসাও
  const phone = document.getElementById("ctPhone");
  if (phone) {
    phone.disabled = false;
    phone.placeholder = "";
    phone.value = code;
    phone.focus();
    const len = phone.value.length;
    try { phone.setSelectionRange(len, len); } catch (e) {}
  }
  ctValidatePhone();
};

window.ctGetCountry = function () {
  const h = document.getElementById("ctCountrySelect");
  if (!h || !h.value) return null;
  return {
    name: h.value,
    code: h.getAttribute("data-code") || "",
    min: parseInt(h.getAttribute("data-min") || "6"),
    max: parseInt(h.getAttribute("data-max") || "14"),
  };
};

// ---------- Live validation ----------
window.ctValidateName = function () {
  const el = document.getElementById("ctName");
  const w = document.getElementById("ctNameWarning");
  if (!el || !w) return true;
  const v = el.value.trim();
  if (!v) { w.innerText = "Full name is required"; w.classList.remove("hidden"); return false; }
  if (v.length < 2) { w.innerText = "Name must be at least 2 letters long"; w.classList.remove("hidden"); return false; }
  w.classList.add("hidden");
  return true;
};

window.ctValidateEmail = function () {
  const el = document.getElementById("ctEmail");
  const w = document.getElementById("ctEmailWarning");
  if (!el || !w) return true;
  const v = el.value.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(v)) { w.innerText = "Please enter a valid work email format"; w.classList.remove("hidden"); return false; }
  w.classList.add("hidden");
  return true;
};

window.ctValidatePhone = function () {
  const el = document.getElementById("ctPhone");
  const w = document.getElementById("ctPhoneWarning");
  const country = ctGetCountry();
  if (!el || !w) return true;
  if (!country) { w.innerText = "Please choose your country"; w.classList.remove("hidden"); return false; }
  const prefix = country.code || "";
  // শুধু ডিজিট রাখো, prefix সহ
  let val = el.value.trim();
  if (!val.startsWith(prefix)) val = prefix + val.replace(/\D/g, "");
  const afterPrefix = val.substring(prefix.length).replace(/\D/g, "");
  el.value = prefix + afterPrefix;
  const minD = country.min, maxD = country.max;
  if (afterPrefix.length < minD || afterPrefix.length > maxD) {
    const req = minD === maxD ? `${minD}` : `${minD}-${maxD}`;
    w.innerText = `Invalid length for ${country.name}. Requires valid ${req} digits after ${prefix}`;
    w.classList.remove("hidden");
    return false;
  }
  w.classList.add("hidden");
  return true;
};

window.ctValidateMessage = function () {
  const el = document.getElementById("ctMessage");
  const w = document.getElementById("ctMessageWarning");
  if (!el || !w) return true;
  if (!el.value.trim()) { w.innerText = "Please write your message"; w.classList.remove("hidden"); return false; }
  w.classList.add("hidden");
  return true;
};

// ---------- Submit → Google Sheet ----------
window.handleContactSubmit = async function () {
  const nameOk = ctValidateName();
  const emailOk = ctValidateEmail();
  const country = ctGetCountry();
  const phoneOk = ctValidatePhone();
  const msgOk = ctValidateMessage();

  if (!nameOk) { document.getElementById("ctName").focus(); return; }
  if (!emailOk) { document.getElementById("ctEmail").focus(); return; }
  if (!country) { ctValidatePhone(); return; }
  if (!phoneOk) { document.getElementById("ctPhone").focus(); return; }
  if (!msgOk) { document.getElementById("ctMessage").focus(); return; }

  const btn = document.getElementById("ctSubmitBtn");
  const btnText = document.getElementById("ctSubmitBtnText");
  const origText = btnText ? btnText.innerText : "";
  if (btn) btn.disabled = true;
  if (btnText) btnText.innerText = "Sending...";

  // WhatsApp লিংক ফরম্যাট (booking এর মতো)
  const rawPhone = document.getElementById("ctPhone").value.replace(/\D/g, "");
  const formattedWhatsApp = rawPhone ? "https://wa.me/" + rawPhone : "";

  const payload = {
    form_name: "Contact_Form",
    full_name: document.getElementById("ctName").value.trim(),
    email: document.getElementById("ctEmail").value.trim().toLowerCase(),
    whatsapp: formattedWhatsApp,
    country: country.name,
    description: document.getElementById("ctMessage").value.trim(),
    remarks: "Contact"
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

  // GTM dataLayer event
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "contact_form_success" });
  } catch (e) {}

  // success state দেখাও
  const form = document.getElementById("contactForm");
  const success = document.getElementById("ctSuccess");
  if (form) form.classList.add("hidden");
  if (success) success.classList.remove("hidden");
};

// ---------- বাইরে ক্লিক করলে dropdown বন্ধ ----------
document.addEventListener("click", function (e) {
  const wrap = document.getElementById("ctCountryWrap");
  const panel = document.getElementById("ctCountryPanel");
  if (wrap && panel && !wrap.contains(e.target)) {
    panel.classList.add("hidden");
  }
});
