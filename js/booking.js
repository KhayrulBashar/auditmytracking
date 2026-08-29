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

