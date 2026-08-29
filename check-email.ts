// ============================================================================
// AuditMyTracking — Edge Function: check-email
// Deno runtime (Supabase Edge Functions)
//
// এই ফাংশন service_role key দিয়ে auth.users এ একটা email আগে থেকে
// রেজিস্টার্ড কিনা যাচাই করে { exists: true/false } ফেরত দেয়।
//
// কেন দরকার:
//   client-side (publishable key) দিয়ে auth.users পড়া যায় না, আর
//   signInWithOtp নিজে থেকে "already exists" জানায় না। তাই signup এর
//   আগে অন্য browser/device থেকেও duplicate ধরতে এই server-side চেক লাগে।
//
// নিরাপত্তা:
//   - শুধু { exists: boolean } ফেরত দেয় — নাম/phone/id কিছুই ফাঁস করে না।
//   - service_role key শুধু এই ফাংশনের ভেতরে থাকে (browser এ কখনো নয়)।
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// একটা email auth.users এ আছে কিনা দেখে (পেজ ধরে ধরে, case-insensitive)
async function emailExists(admin: any, email: string): Promise<boolean> {
  const target = email.trim().toLowerCase();
  const perPage = 200;
  // সর্বোচ্চ কয়েক পেজ দেখব (হাজার হাজার user হলে অনেক পেজ হতে পারে,
  // কিন্তু বাস্তবে listUsers filter নেই — তাই পেজ করে খুঁজি)
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    if (users.length === 0) break;
    const hit = users.some(
      (u: any) => (u.email || "").trim().toLowerCase() === target,
    );
    if (hit) return true;
    if (users.length < perPage) break; // শেষ পেজ
  }
  return false;
}

Deno.serve(async (req: Request) => {
  // preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, message: "Method not allowed" }),
      {
        status: 405,
        headers: { ...CORS, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").toString().trim().toLowerCase();

    // বৈধ email ফরম্যাট না হলে সরাসরি exists:false (signup flow নিজেই format আটকায়)
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRe.test(email)) {
      return new Response(JSON.stringify({ ok: true, exists: false }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      // env না থাকলে চুপচাপ exists:false — signup flow তবু চলবে,
      // আর Apps Script duplicate-prevention শেষ সুরক্ষা হিসেবে থাকবে।
      return new Response(JSON.stringify({ ok: true, exists: false }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const exists = await emailExists(admin, email);

    return new Response(JSON.stringify({ ok: true, exists }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    // কোনো error হলেও signup আটকাব না — exists:false দিয়ে flow চালু রাখি,
    // (Apps Script duplicate-prevention শেষ রক্ষাকবচ)। error লগ থাকবে।
    console.error("check-email error:", e);
    return new Response(JSON.stringify({ ok: true, exists: false }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
