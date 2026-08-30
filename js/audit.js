// ============================================================================
// audit.js — Real Tracking Audit (Supabase Edge Function powered)
// আগের CORS-proxy + fake fallback পুরো বাদ। এখন backend থেকে আসল detection আসে।
// ============================================================================

const typewriterKeywords = [
  "Is your GA4 tracking set up correctly?",
  "Find missing Google Ads conversions in seconds",
  "Check your Meta Pixel & Conversions API",
  "Detect Consent Mode v2 problems instantly",
  "See what tracking your website really runs"
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
  // স্থির অংশ + ডটের জন্য সংরক্ষিত fixed-width span।
  // ডট বাড়লেও span এর প্রস্থ একই থাকে (inline-block + fixed ch width),
  // তাই পুরো লাইন কখনো নড়ে না — সব ডিভাইসে।
  el.innerHTML =
    baseText +
    '<span id="procDots" style="display:inline-block;width:1.6em;text-align:left"></span>';
  const dotsEl = document.getElementById("procDots");

  processingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    if (dotsEl) dotsEl.textContent = ".".repeat(dots);
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

// গার্ডেড স্টার্টার — চলমান loop বন্ধ করে শুরু থেকে একটাই animation চালায়
window.startTypewriterSafe = function () {
  // চলমান typewriter loop বন্ধ করো
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }
  // "processing..." animation চললে typewriter চালু করব না (audit চলাকালীন)
  if (processingInterval) {
    return;
  }
  // index reset করে পরিষ্কার শুরু (আধা-অবস্থা থেকে আটকে যাওয়া রোধ)
  currentCharIndex = 0;
  isDeleting = false;
  startTypewriter();
};

// Supabase Edge Function থেকে আসল detection আনে
async function fetchAuditResult(targetUrl) {
  try {
    const res = await fetch(AUDIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": "Bearer " + SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ url: targetUrl }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Audit endpoint error:", e);
    return null;
  }
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
  if (!url) {
    window.showNotificationModal(
      "warning",
      "Website URL Required",
      "Please enter a website address to run the audit."
    );
    return;
  }

  // ইউজার যেভাবেই দিক (domain / www / http / https) — স্বাভাবিক করে নাও
  // অতিরিক্ত space সরাও, শুরুতে http/https না থাকলে https:// যোগ করো
  url = url.replace(/\s+/g, "");
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url.replace(/^\/+/, "");
  }

  // বৈধ domain ফরম্যাট যাচাই: অন্তত একটা dot + TLD (.com/.io/.net ইত্যাদি) থাকতে হবে।
  // এতে "asdf", "hello world" জাতীয় ভুল input Edge Function কল করার আগেই আটকায়।
  let validHost = false;
  try {
    const u = new URL(url);
    // host এ অন্তত একটা dot আর TLD এ ২+ অক্ষর থাকতে হবে (example.com)
    validHost = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(u.hostname) &&
                /\.[a-z]{2,}$/i.test(u.hostname);
  } catch (e) {
    validHost = false;
  }

  if (!validHost) {
    window.showNotificationModal(
      "warning",
      "Invalid Website URL",
      "That does not look like a valid website address. Please enter a correct link (e.g. example.com or https://example.com) and try again."
    );
    return;
  }

  // পথ A: guest হলে audit চালানোর আগে signup পেজে পাঠাও (আসল session যাচাই)
  const loggedIn = await window.requireSessionForDashboard();
  if (!loggedIn) {
    window.showNotificationModal(
      "warning",
      "Create a Free Account",
      "Please sign up (free) to run your tracking audit and view the full report.",
      () => {
        window.showView("signup");
        const suEmail = document.getElementById("suEmail");
        if (suEmail) suEmail.focus();
      },
      "Sign Up Free"
    );
    return;
  }

  window.currentAuditedUrl = url;

  // নিজের কনভার্সন ট্র্যাকিং — অডিট শুরু হলো
  window.dataLayer.push({
    event: "run_audit",
    audit_url: url,
  });

  auditBtn.disabled = true;
  auditBtn.innerText = "Scanning Live Tags & Tech...";
  auditBtn.classList.add("animate-brand-wave");
  statusMsg.classList.remove("hidden");
  results.classList.add("hidden");

  // অপশন ১: audit কমপক্ষে এই সময় ধরে "processing" দেখাবে (ms), দ্রুত শেষ হলেও
  const MIN_AUDIT_MS = 12000; // 12 সেকেন্ড
  const auditStartTime = Date.now();

  startProcessingAnimation();

  // ===== আসল backend audit =====
  const auditResp = await fetchAuditResult(url);

  // সাইট রিচ করা না গেলে — জোর করে "পাস" নয়, সৎ error দেখাও
  if (!auditResp || auditResp.ok === false) {
    auditBtn.disabled = false;
    auditBtn.innerText = "Run Free Audit";
    auditBtn.classList.remove("animate-brand-wave");
    statusMsg.classList.add("hidden");
    stopProcessingAnimation();

    window.dataLayer.push({
      event: "audit_failed",
      audit_url: url,
    });

    window.showNotificationModal(
      "error",
      "Website Not Reachable",
      (auditResp && auditResp.message) ||
        "We couldn't reach that website. It may not exist, may be offline, or the address may be incorrect. Please enter a valid, live website link and try again."
    );
    return;
  }

  const d = auditResp.detect || {};
  const hasGTM = !!d.gtm;
  const hasGA4 = !!d.ga4;
  const hasGoogleAds = !!d.googleAds;
  const hasConsentMode = !!d.consentMode;
  const hasMeta = !!d.meta;
  const hasTikTok = !!d.tiktok;
  const hasSnapchat = !!d.snapchat;
  const hasPinterest = !!d.pinterest;
  const hasLinkedIn = !!d.linkedin;
  const hasTwitter = !!d.twitter;
  const hasServerSide = !!d.serverSide;

  const platform = window.lastDetectedPlatform || "Custom Coded";
  const formType = window.lastDetectedForm || "Standard / Native Form";

  const activeFindings = [];
  const notSetupFindings = [];

  if (hasGTM) {
    activeFindings.push({
      checkpoint: "Google Tag Manager (GTM) Container",
      issueName: "None (Container Initialized)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Primary Web GTM container detected and loading on this domain.",
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
      issueName: "None (Configured)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Consent Mode v2 signals (ad_user_data / ad_personalization) detected for EU/UK compliance.",
      canFix: false,
      isSetup: true
    });
  } else if (hasGA4 || hasGoogleAds || hasGTM) {
    activeFindings.push({
      checkpoint: "Google Consent Mode v2 Signals",
      issueName: "Missing ad_user_data & ad_personalization",
      status: "Critical Issue",
      statusColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      details: "Google tags active but Consent Mode v2 signals were not detected. Conversion modeling may be blocked in Google Ads.",
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
      issueName: "Verify Enhanced Conversions",
      status: "Warning",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: "Google Ads tag (AW-) detected. Confirm Enhanced Conversions with first-party hashed data is enabled on purchase/lead tags.",
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
        issueName: "None (Server-Side Detected)",
        status: "Passed",
        statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        details: "Meta Pixel and a server-side gateway were detected. Confirm event deduplication (event_id) is active.",
        canFix: false,
        isSetup: true
      });
    } else {
      activeFindings.push({
        checkpoint: "Meta Conversion API (CAPI) Deduplication",
        issueName: "Client-Side Pixel Only (No Server CAPI)",
        status: "Critical Issue",
        statusColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        details: "Meta browser pixel active, but no server CAPI detected. iOS 14+ and adblockers can drop 25-35% of attribution.",
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
      details: "GA4 measurement stream detected on this domain.",
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
      checkpoint: "Server-Side Tracking & Safari ITP",
      issueName: "None (Server Container Detected)",
      status: "Passed",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "A first-party server-side tagging setup was detected, helping extend Safari attribution lifetime.",
      canFix: false,
      isSetup: true
    });
  } else if (hasMeta || hasGoogleAds || hasGA4) {
    activeFindings.push({
      checkpoint: "Server-Side Tracking & Safari ITP",
      issueName: "Missing First-Party Server Proxy",
      status: "Warning",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: "No server-side tagging subdomain detected. Safari ITP caps client-side tracking cookies to 7 days.",
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
      issueName: "Verify TikTok Events API (CAPI)",
      status: "Warning",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: "TikTok browser pixel detected. Confirm the server-side Events API is connected for full attribution.",
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
      details: "Snapchat Pixel script detected on this domain.",
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
      details: "Pinterest Tag detected on this domain.",
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
      details: "LinkedIn Insight Tag detected on this domain.",
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
      details: "Twitter / X ad pixel detected on this domain.",
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
      <td class="p-2 sm:p-4 font-semibold text-white">${row.checkpoint}</td>
      <td class="p-2 sm:p-4">
        <span class="inline-block px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full border ${row.statusColor}">
          ${row.status}
        </span>
      </td>
      <td class="p-2 sm:p-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div class="font-semibold text-slate-200 mb-0.5">${row.issueName}</div>
        <div class="text-slate-400">${row.details}</div>
      </td>
      <td class="p-2 sm:p-4 text-right">
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

  // অপশন ১: রেজাল্ট দ্রুত এলে বাকি সময় "processing" দেখাও (কমপক্ষে MIN_AUDIT_MS)
  const elapsed = Date.now() - auditStartTime;
  if (elapsed < MIN_AUDIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_AUDIT_MS - elapsed));
  }

  auditBtn.disabled = false;
  auditBtn.innerText = "Run Free Audit";
  auditBtn.classList.remove("animate-brand-wave");
  statusMsg.classList.add("hidden");
  results.classList.remove("hidden");

  stopProcessingAnimation();

  // নিজের কনভার্সন ট্র্যাকিং — অডিট সম্পন্ন
  window.dataLayer.push({
    event: "audit_complete",
    audit_url: url,
    audit_score: score,
    issues_found: fixableIssuesCount,
    active_platforms: activeCount,
  });

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

  window.dataLayer.push({
    event: "download_report",
    report_type: "csv",
    audit_url: window.currentAuditedUrl,
  });
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

  window.dataLayer.push({
    event: "download_report",
    report_type: "pdf",
    audit_url: window.currentAuditedUrl,
  });
};
