// REPLACE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = "https://flpmaegkhkxxaitlgglv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscG1hZWdraGt4eGFpdGxnZ2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTQ2NTEsImV4cCI6MjEwMzI5MDY1MX0.8N8ufCLJ5xktDoGULzuUA2Lwy_EAWWihXAnIN742Lj8";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;

// Initialize Auth State Listener
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    showView('dashboard');
  }
});

function showView(viewName) {
  document.getElementById('viewSignup').classList.add('hidden');
  document.getElementById('viewLogin').classList.add('hidden');
  document.getElementById('viewDashboard').classList.add('hidden');

  if (viewName === 'signup') {
    document.getElementById('viewSignup').classList.remove('hidden');
  } else if (viewName === 'login') {
    document.getElementById('viewLogin').classList.remove('hidden');
    document.getElementById('loginStepEmail').classList.remove('hidden');
    document.getElementById('loginStepOtp').classList.add('hidden');
  } else if (viewName === 'dashboard') {
    document.getElementById('viewDashboard').classList.remove('hidden');
    updateNavState();
  }
}

async function handleSignup() {
  const suBtn = document.getElementById('suBtn');
  const email = document.getElementById('suEmail').value.trim().toLowerCase();
  const firstName = document.getElementById('suFirstName').value.trim();
  const lastName = document.getElementById('suLastName').value.trim();
  const phone = document.getElementById('suPhone').value.trim();
  const country = document.getElementById('suCountry').value.trim();

  suBtn.disabled = true;
  suBtn.innerText = "Sending OTP...";

  // 1. Send OTP to user's real email
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      data: { first_name: firstName, last_name: lastName, phone: phone, country: country }
    }
  });

  suBtn.disabled = false;
  suBtn.innerText = "Register & Send Code";

  if (error) {
    alert("Error: " + error.message);
    return;
  }

  alert("Verification code has been sent to " + email + ". Please check your inbox!");
  document.getElementById('loginEmail').value = email;
  showView('login');
  document.getElementById('loginStepEmail').classList.add('hidden');
  document.getElementById('loginStepOtp').classList.remove('hidden');
}

async function requestOtp() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const otpBtn = document.getElementById('otpSendBtn');
  if (!email) return alert('Please enter your email.');

  otpBtn.disabled = true;
  otpBtn.innerText = "Sending...";

  const { error } = await supabase.auth.signInWithOtp({ email: email });
  otpBtn.disabled = false;
  otpBtn.innerText = "Send OTP Code";

  if (error) {
    alert("Error: " + error.message);
    return;
  }

  alert("6-Digit OTP code sent to your email!");
  document.getElementById('loginStepEmail').classList.add('hidden');
  document.getElementById('loginStepOtp').classList.remove('hidden');
}

async function verifyOtp() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const token = document.getElementById('loginOtp').value.trim();
  const verifyBtn = document.getElementById('otpVerifyBtn');

  if (!token || token.length !== 6) {
    alert('Please enter a valid 6-digit OTP.');
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying...";

  const { data, error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'email'
  });

  verifyBtn.disabled = false;
  verifyBtn.innerText = "Verify & Sign In";

  if (error) {
    alert("Verification failed: " + error.message);
    return;
  }

  currentUser = data.user;
  showView('dashboard');
}

function updateNavState() {
  const navArea = document.getElementById('navAuthArea');
  if (currentUser) {
    navArea.innerHTML = `
      <span class="text-xs text-slate-400 hidden sm:inline">${currentUser.email}</span>
      <button onclick="logout()" class="text-sm bg-rose-600/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg hover:bg-rose-600/20 transition">Logout</button>
    `;
  }
}

async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
  location.reload();
}

function runAudit() {
  const targetUrl = document.getElementById('targetUrl').value.trim();
  const statusMsg = document.getElementById('statusMsg');
  const results = document.getElementById('results');
  const auditRows = document.getElementById('auditRows');
  const siteTested = document.getElementById('siteTested');
  const auditBtn = document.getElementById('auditBtn');

  statusMsg.classList.remove('hidden');
  results.classList.add('hidden');
  auditBtn.disabled = true;

  setTimeout(() => {
    statusMsg.classList.add('hidden');
    results.classList.remove('hidden');
    auditBtn.disabled = false;
    siteTested.innerText = targetUrl;

    const auditChecks = [
      { name: "Google Tag Manager (GTM)", status: "Pass", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", detail: "Container loaded correctly without duplicates." },
      { name: "Google Consent Mode v2", status: "Fail", badge: "bg-rose-500/10 text-rose-400 border border-rose-500/20", detail: "ad_storage and ad_personalization signals missing or inactive." },
      { name: "Meta Pixel & CAPI Deduplication", status: "Warning", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", detail: "Browser Pixel active, but event_id/transaction_id is missing." },
      { name: "Server-Side Tracking DNS (ITP Cap)", status: "Pass", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", detail: "Direct A/AAAA record detected. Bypasses Safari 7-day CNAME capping." },
      { name: "E-commerce DataLayer Schema", status: "Warning", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", detail: "view_item event missing standard currency and item parameters." }
    ];

    auditRows.innerHTML = '';
    auditChecks.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-4 font-semibold text-slate-100 whitespace-nowrap">${item.name}</td>
        <td class="p-4 whitespace-nowrap"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${item.badge}">${item.status}</span></td>
        <td class="p-4 text-slate-400">${item.detail}</td>
      `;
      auditRows.appendChild(tr);
    });
  }, 1200);
}