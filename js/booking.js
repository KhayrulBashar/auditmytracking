// ── website URL যাচাই (audit box এর মতোই লজিক) ─────────────────────────────
// ইউজার যেভাবেই দিক (domain / www / http / https) স্বাভাবিক করে নেয়,
// তারপর বৈধ domain ফরম্যাট (অন্তত একটা dot + TLD) আছে কিনা দেখে।
// return: { valid: bool, normalized: "https://..." }
window.normalizeAndCheckUrl = function (raw) {
  let url = (raw || "").replace(/\s+/g, "");
  if (!url) return { valid: false, normalized: "" };
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url.replace(/^\/+/, "");
  }
  let valid = false;
  try {
    const u = new URL(url);
    valid =
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(u.hostname) &&
      /\.[a-z]{2,}$/i.test(u.hostname);
  } catch (e) {
    valid = false;
  }
  return { valid: valid, normalized: url };
};

// live warning — booking website field এ টাইপ করার সময় চলে
window.validateSiteUrlLive = function () {
  const input = document.getElementById("bmSiteUrl");
  const warning = document.getElementById("bmSiteUrlWarning");
  if (!input || !warning) return true;

  const raw = input.value.trim();
  // খালি থাকলে warning দেখাব না (required নয়, submit এ ধরা হবে দরকারে)
  if (!raw) {
    warning.classList.add("hidden");
    return false;
  }
  const check = window.normalizeAndCheckUrl(raw);
  if (!check.valid) {
    warning.innerText = "Please enter a valid website address (e.g. example.com).";
    warning.classList.remove("hidden");
    return false;
  }
  warning.classList.add("hidden");
  return true;
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

  // booking country dropdown reset (custom searchable — signup এর মতো)
  if (window.resetCountryDropdown) {
    window.resetCountryDropdown("booking");
  }

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
      notesInput.placeholder = "Mention What Is Not Working (e.g. Purchases Not Tracking in GA4...)";
    } else {
      notesLabel.innerText = "Issue Description / Requirements (Optional)";
      notesInput.placeholder = "Tell Us About Your Tracking Goals or Issues...";
    }
  }

  if (siteUrlInput) {
    // scan করা হয়ে থাকলে যে service ই হোক আগের audited URL auto-fill হবে
    // (ইউজার চাইলে edit করতে পারবে — field খোলা/editable)
    siteUrlInput.value = window.currentAuditedUrl ? window.currentAuditedUrl : "";
    siteUrlInput.placeholder = "Your Website Address";
    // auto-fill এর পর পুরনো warning থাকলে মুছে দাও
    const siteWarn = document.getElementById("bmSiteUrlWarning");
    if (siteWarn) siteWarn.classList.add("hidden");
  }

  if (goalSelect) goalSelect.selectedIndex = 0;
  if (platformSelect) {
    platformSelect.innerHTML = '<option value="" disabled selected>Choose Goal First</option>';
  }

  if (objectiveInput) objectiveInput.value = "";
  if (marketingInput) marketingInput.value = "";

  // ── লগইন ইউজারের সেভ করা তথ্য থাকলে auto-fill, নাহলে placeholder ──
  const savedEmail = localStorage.getItem("verified_user_email") || "";
  const savedName = localStorage.getItem("signup_fullName") || "";
  const savedCountry = localStorage.getItem("signup_country") || "";
  const savedPhone = localStorage.getItem("signup_phone") || "";

  if (emailInput) emailInput.value = savedEmail;
  if (nameInput) nameInput.value = savedName;

  const phoneInput = document.getElementById("bmWhatsApp");

  // country ম্যাচ: আসল phone নাম্বারের dial code-কে অগ্রাধিকার দাও।
  // কারণ Google OAuth এ signup_country ভুল হতে পারে ("United States"), কিন্তু
  // ইউজার নিজে যে WhatsApp নাম্বার দিয়েছে (+880) সেটাই সঠিক country নির্দেশ করে।
  let matchedCountry = null;

  // ধাপ ১ (অগ্রাধিকার): সেভ করা phone এর dial code (+880) দিয়ে ম্যাচ
  // সবচেয়ে লম্বা code আগে মেলাও (+1 এর আগে +1876 যাতে ভুল না হয়)
  // savedPhone "https://wa.me/8801..." আকারে থাকে (+ ছাড়া), তাই ডিজিট বের করে
  // সামনে "+" বসিয়ে normalize করি — নাহলে "+880" এর সাথে কখনো ম্যাচ হয় না।
  if (savedPhone && typeof COUNTRY_LIST !== "undefined") {
    let phoneDigits = savedPhone.replace(/[^0-9]/g, ""); // শুধু ডিজিট
    const normalized = phoneDigits ? "+" + phoneDigits : ""; // সামনে + বসাও
    let bestLen = 0;
    COUNTRY_LIST.forEach((c) => {
      if (c.c && normalized.startsWith(c.c) && c.c.length > bestLen) {
        matchedCountry = c;
        bestLen = c.c.length;
      }
    });
  }

  // ধাপ ২ (fallback): phone না থাকলে, সেভ করা country name দিয়ে ম্যাচ
  if (!matchedCountry && savedCountry && typeof COUNTRY_LIST !== "undefined") {
    matchedCountry = COUNTRY_LIST.find((c) => c.n === savedCountry) || null;
  }

  // ম্যাচ পেলে custom dropdown এ সিলেক্ট করাও (label + hidden input সেট হবে)
  if (matchedCountry) {
    window.selectCountry("booking", matchedCountry.n, matchedCountry.c, matchedCountry.mn, matchedCountry.mx);
  }

  // phone: সেভ থাকলে বসাও; নাহলে selectCountry prefix বসিয়ে দিয়েছে
  if (phoneInput) {
    if (matchedCountry) {
      // country ম্যাচ হয়েছে → ফিল্ড enable করো
      phoneInput.disabled = false;
      if (savedPhone) {
        const digits = savedPhone.replace(/[^0-9]/g, "");
        phoneInput.value = digits ? "+" + digits : "";
      }
    } else {
      // country ম্যাচ হয়নি → ফিল্ড লক রাখো, placeholder দেখাও
      phoneInput.disabled = true;
      phoneInput.value = "";
      phoneInput.placeholder = "Choose Country First";
    }
  }

  // auto-fill এর পর warning পরিষ্কার করো — সঠিক ডেটা থাকলে ভুল warning দেখাবে না।
  // country + phone দুটোই সেভ থেকে এলে খোলার সময় কোনো error state থাকা উচিত নয়।
  const bmWarn = document.getElementById("bmPhoneWarning");
  if (bmWarn) {
    bmWarn.innerText = "";
    bmWarn.classList.add("hidden");
  }

  if (modal) modal.classList.remove("hidden");
};

window.closeBookingModal = function () {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.classList.add("hidden");
};

window.handleBookingSubmit = async function () {
  const isEmailValid = window.validateEmailLive("bmEmail", "bmEmailWarning");
  if (!isEmailValid) {
    window.showNotificationModal("warning", "Invalid Email", "Please enter a valid business email.");
    return;
  }

  const isPhoneValid = window.validatePhoneLive("booking");
  if (!isPhoneValid) {
    const cSel = window.getSelectedCountry("booking");
    const countryName = cSel ? cSel.name : "your country";
    window.showNotificationModal("warning", "Invalid WhatsApp", `Please select a country and enter a valid WhatsApp contact number for ${countryName}.`);
    return;
  }

  // website URL যাচাই — খালি থাকলে আটকাবে, ভুল ফরম্যাট হলে আটকাবে
  const siteRaw = document.getElementById("bmSiteUrl").value.trim();
  if (!siteRaw) {
    window.showNotificationModal("warning", "Website Required", "Please enter your website address so our team can review it.");
    return;
  }
  const siteCheck = window.normalizeAndCheckUrl(siteRaw);
  if (!siteCheck.valid) {
    window.showNotificationModal("warning", "Invalid Website", "That does not look like a valid website address. Please enter a correct link (e.g. example.com) and try again.");
    return;
  }

  const name = document.getElementById("bmName").value.trim();
  const email = document.getElementById("bmEmail").value.trim().toLowerCase();
  const fullWhatsApp = document.getElementById("bmWhatsApp").value.trim();
  const bookingCountry = window.getSelectedCountry("booking");
  const countryName = bookingCountry ? bookingCountry.name : "Not Specified";
  const formattedWhatsApp = toWhatsAppLink(fullWhatsApp);

  const siteUrl = siteCheck.normalized;
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

