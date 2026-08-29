# index.html — ২টা ছোট পরিবর্তন

JS ফাইলগুলোর সাথে কাজ করতে index.html এ মাত্র ২টা বদল লাগবে।

---

## পরিবর্তন ১: Signup Country তে "Choose Country" placeholder যোগ

লাইন ~183 এ `suCountrySelect` এর প্রথম option এখন United States (selected)।
এর আগে একটা placeholder option বসাতে হবে, আর United States থেকে `selected` সরাতে হবে।

**খুঁজো** (লাইন ~183-195):
```html
              <select
                id="suCountrySelect"
                onchange="window.onCountryChanged('signup')"
                class="w-48 bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 cursor-pointer"
              >
                <option
                  value="United States"
                  data-code="+1"
                  data-min="10"
                  data-max="10"
                  selected
                >
                  +1 (United States)
```

**বদলে দাও এভাবে** (placeholder যোগ + United States থেকে selected সরানো):
```html
              <select
                id="suCountrySelect"
                onchange="window.onCountryChanged('signup')"
                class="w-48 bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 cursor-pointer"
              >
                <option value="" disabled selected>Choose Country</option>
                <option
                  value="United States"
                  data-code="+1"
                  data-min="10"
                  data-max="10"
                >
                  +1 (United States)
```

> শুধু ২টা জিনিস: (১) নতুন `Choose Country` option লাইন যোগ, (২) United States
> থেকে `selected` শব্দটা মুছে ফেলা। বাকি সব country option অপরিবর্তিত থাকবে।

---

## পরিবর্তন ২: (ঐচ্ছিক) Login বাটনের টেক্সট

লাইন ~618 এ login বাটন এখন লেখা "Sign In to Workspace" — এটা ঠিক আছে,
auth.js এর সাথে মেলে। কিছু করতে হবে না।

---

## যা করতে হবে না (গুরুত্বপূর্ণ)

- `navAuthArea` (লাইন ~79) খালি `<div>` — ঠিক আছে, JS এটা পূরণ করে। হাত দিও না।
- viewDashboard, viewLogin, viewSignup structure — অপরিবর্তিত।
- সব form onsubmit handler — অপরিবর্তিত।
