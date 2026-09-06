// --- 1. Theme Toggling Logic ---
const htmlElement = document.documentElement;
const themeToggleDesktop = document.getElementById("themeToggle");
const themeToggleMobile = document.getElementById("themeToggleMobile");

function toggleTheme() {
  if (htmlElement.classList.contains("dark")) {
    htmlElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    htmlElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
}

// Check local storage or system preference on load
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  htmlElement.classList.add("dark");
} else {
  htmlElement.classList.remove("dark");
}

themeToggleDesktop.addEventListener("click", toggleTheme);
themeToggleMobile.addEventListener("click", toggleTheme);

// --- 2. Mobile Menu Logic ---
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", !isExpanded);

  if (isExpanded) {
    mobileMenu.classList.add("hidden");
    menuBtn.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  } else {
    mobileMenu.classList.remove("hidden");
    menuBtn.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }
});

// --- 3. Live Demo Logic ---
// State
let demoState = {
  fileName: "",
  pages: 0,
  copies: 1,
  paperSize: "A4",
  colorType: "bw", // bw or color
  rates: {
    A4: { bw: 2, color: 10 },
    A3: { bw: 5, color: 20 },
  },
};

const uploadStep = document.getElementById("uploadStep");
const fileOptions = document.getElementById("fileOptions");
const demoOrderStatus = document.getElementById("demoOrderStatus");

function handleDemoFile(event) {
  const file = event.target.files[0];
  if (file) {
    demoState.fileName = file.name;
    // Fake page count based on filename length just for demo
    demoState.pages = Math.max(1, file.name.length % 15);

    document.getElementById("demoFileName").textContent = demoState.fileName;
    document.getElementById("demoFilePages").textContent =
      demoState.pages + (demoState.pages > 1 ? " pages" : " page");

    uploadStep.classList.add("hidden");
    fileOptions.classList.remove("hidden");

    calculateDemoTotal();
  }
}

function setDemoColor(type) {
  demoState.colorType = type;
  const btnBw = document.getElementById("btnDemoBw");
  const btnColor = document.getElementById("btnDemoColor");

  if (type === "bw") {
    btnBw.className =
      "py-2.5 rounded-md bg-white text-ink-900 font-semibold text-sm shadow-sm transition-all focus-ring";
    btnColor.className =
      "py-2.5 rounded-md text-ink-700 hover:text-ink-900 font-semibold text-sm transition-all focus-ring";
  } else {
    btnColor.className =
      "py-2.5 rounded-md bg-white text-ink-900 font-semibold text-sm shadow-sm transition-all focus-ring";
    btnBw.className =
      "py-2.5 rounded-md text-ink-700 hover:text-ink-900 font-semibold text-sm transition-all focus-ring";
  }
  calculateDemoTotal();
}

function calculateDemoTotal() {
  demoState.copies = parseInt(document.getElementById("demoCopies").value) || 1;
  demoState.paperSize = document.getElementById("demoPaper").value;

  const ratePerPage = demoState.rates[demoState.paperSize][demoState.colorType];
  const total = demoState.pages * demoState.copies * ratePerPage;

  document.getElementById("demoRate").textContent =
    `₹${ratePerPage} (${demoState.colorType === "bw" ? "B&W" : "Color"})`;
  document.getElementById("demoTotal").textContent = `₹${total}`;
}

function submitDemoOrder(paymentType) {
  fileOptions.classList.add("hidden");
  demoOrderStatus.classList.remove("hidden");

  const badge = document.getElementById("demoPayBadge");
  if (paymentType === "online") {
    badge.textContent = "Paid (UPI)";
    badge.className =
      "text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-semibold";
  } else {
    badge.textContent = "Pay at Counter";
    badge.className =
      "text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-semibold";
  }

  // Simulate progress
  setTimeout(() => {
    const list = document.getElementById("demoStatusList");
    list.innerHTML = `
                    <li class="flex gap-3 text-sm text-ink-900 font-medium">
                        <span class="text-green-600">✓</span> File received
                    </li>
                    <li class="flex gap-3 text-sm text-ink-900 font-medium">
                        <span class="text-green-600">✓</span> Printer line mein lag gayi
                    </li>
                    <li class="flex gap-3 text-sm text-ink-900 font-medium animate-pulse-fast">
                        <span class="text-stamp">🖨️</span> Print nikal raha hai...
                    </li>
                `;

    setTimeout(() => {
      list.innerHTML = `
                        <li class="flex gap-3 text-sm text-ink-900 font-medium">
                            <span class="text-green-600">✓</span> File received
                        </li>
                        <li class="flex gap-3 text-sm text-ink-900 font-medium">
                            <span class="text-green-600">✓</span> Printer line mein lag gayi
                        </li>
                        <li class="flex gap-3 text-sm text-ink-900 font-medium">
                            <span class="text-green-600">✓</span> Print nikal gaya!
                        </li>
                        <li class="mt-4 p-3 bg-stamp/10 text-stamp rounded-lg text-sm font-semibold text-center">
                            Dukaan wale bhaiya se apna print le lijiye!
                        </li>
                    `;
    }, 3000);
  }, 2000);
}

function resetDemo() {
  demoOrderStatus.classList.add("hidden");
  uploadStep.classList.remove("hidden");
  document.getElementById("fileInput").value = ""; // clear file
  document.getElementById("demoStatusList").innerHTML = `
                <li class="flex gap-3 text-sm text-ink-900 font-medium">
                    <span class="text-green-600">✓</span> File received
                </li>
                <li class="flex gap-3 text-sm text-ink-700 animate-pulse-fast">
                    <span class="text-stamp">↻</span> Printer line mein hai...
                </li>
            `;
}

// --- 4. FAQ Logic ---
const faqs = [
  {
    q: "Kya mujhe koi App download karni padegi?",
    a: "Nahi, bilkul nahi. Aapko sirf dukaan par laga QR code scan karna hai aur ek website aapke phone mein khul jayegi.",
  },
  {
    q: "Agar dukaan mein bheed ho toh?",
    a: "Bheed hone par aap baahar se hi code scan karke file aur paise bhej sakte hain. Aapka order list mein lag jayega, jab baari aayegi print nikal jayega.",
  },
  {
    q: "Paise kaise dene hote hain?",
    a: "Aap phone pe UPI (PhonePe, GPay, Paytm) se de sakte hain, ya phir option chun sakte hain ki 'Dukaan wale ko Cash dunga'.",
  },
  {
    q: "Mera Adhaar card ya private photo leak toh nahi hogi?",
    a: "Nahi. WhatsApp ya dukaan ke computer pe bhejne se file save reh jati hai. PhonePrint mein print nikalne ke baad file server se apne aap delete ho jati hai. Ye 100% safe hai.",
  },
  {
    q: "Dukaan wale bhaiya, iske liye kon sa printer chahiye?",
    a: "Aapke paas jo bhi chalu printer hai (HP, Canon, Epson), jisko aap apne Windows computer ya laptop se chalate hain, ye ussi par kaam karega. Nayi machine lene ki zarurat nahi.",
  },
];

const faqContainer = document.getElementById("faqList");
faqs.forEach((faq, index) => {
  const id = `faq-${index}`;
  faqContainer.innerHTML += `
                <div class="py-6">
                    <button onclick="toggleFaq('${id}')" class="flex w-full items-start justify-between text-left focus-ring rounded" aria-expanded="false" aria-controls="${id}-ans">
                        <span class="font-display font-semibold text-lg text-ink-900">${faq.q}</span>
                        <span class="ml-6 flex h-7 items-center text-stamp transform transition-transform" id="${id}-icon">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" /></svg>
                        </span>
                    </button>
                    <div class="mt-4 hidden" id="${id}-ans">
                        <p class="text-base text-ink-700 leading-relaxed">${faq.a}</p>
                    </div>
                </div>
            `;
});

function toggleFaq(id) {
  const ans = document.getElementById(`${id}-ans`);
  const icon = document.getElementById(`${id}-icon`);
  const btn = ans.previousElementSibling;

  if (ans.classList.contains("hidden")) {
    ans.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
    icon.classList.add("rotate-45"); // Turn + into x
  } else {
    ans.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
    icon.classList.remove("rotate-45");
  }
}

// --- 5. Contact Form Logic ---
function submitContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerHTML = '<span class="animate-pulse">Bhej rahe hain...</span>';
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById("contactConfirm").classList.remove("hidden");
    btn.innerHTML = "Message Bhejein";
    btn.disabled = false;
    e.target.reset();
  }, 1500);
  return false;
}
// --- 6. Modal Logic ---

const modalRoot = document.getElementById("modalRoot");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalContentBox = document.getElementById("modalContentBox");

const DASHBOARD_URL = "http://127.0.0.1:5500/dashboard.html";

const modalContents = {
  login: {
    title: "Dukaan Login",

    body: `
      <p class="mb-4 text-ink-700">
        PhonePrint Dashboard mein swagat hai.
      </p>

      <div
        id="loginError"
        class="hidden mb-4 text-sm font-medium text-red-700
        bg-red-50 border border-red-200 rounded-lg
        px-4 py-2.5"
        role="alert"
      ></div>

      <form
        id="loginForm"
        onsubmit="return submitLogin(event);"
        class="space-y-4"
        novalidate
      >

        <!-- Mobile Number -->
        <div>
          <label
            class="text-sm font-semibold text-ink-900 block mb-1"
            for="loginMobile"
          >
            Mobile Number
          </label>

          <input
            id="loginMobile"
            type="tel"
            inputmode="numeric"
            maxlength="10"
            autocomplete="tel"
            class="w-full rounded-lg border border-ink-800/20
            px-4 py-2.5 focus-ring"
            placeholder="9876543210"
          />

          <p
            id="loginMobileHint"
            class="hidden text-xs text-red-600 mt-1.5"
          ></p>
        </div>


        <!-- Shop ID -->
        <div>
          <label
            class="text-sm font-semibold text-ink-900 block mb-1"
            for="loginPassword"
          >
            Shop ID / Password
          </label>

          <input
            id="loginPassword"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-ink-800/20
            px-4 py-2.5 focus-ring"
            placeholder="DEMO_XXXXXXXX"
          />

          <p
            id="loginPasswordHint"
            class="hidden text-xs text-red-600 mt-1.5"
          ></p>
        </div>


        <!-- Login Button -->
        <button
          id="loginSubmitBtn"
          type="submit"
          class="w-full py-3 rounded-lg bg-stamp
          text-white font-semibold mt-2 focus-ring
          disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Login Karein
        </button>

      </form>


      <p class="text-xs text-center mt-3 text-ink-700">
        Aapka Shop ID hi initial password hai.
      </p>
    `,
  },

  legal: {
    title: "Legal Information",

    body: `
      <h4 class="font-semibold text-ink-900 mb-2">
        Priya Grahak,
      </h4>

      <p class="mb-3">
        PhonePrint aapki privacy ka pura dhyaan rakhta hai.
        Humara lakshya gramin bharat aur chhote shaharo mein
        surakshit digital suvidhayein pahunchana hai.
      </p>

      <ul class="list-disc pl-5 space-y-2 mb-3">
        <li>
          Aapka data kisi 3rd party ko nahi becha jata.
        </li>

        <li>
          Print nikalne ke kuch ghanton baad server se
          files delete kar di jati hain.
        </li>

        <li>
          Payments RBI dwara manyata prapt gateways ke
          zariye hoti hain.
        </li>
      </ul>

      <p>
        Adhik jankari ke liye contact form ke zariye
        sampark karein.
      </p>
    `,
  },
};

// --- Open Modal ---

function openModal(type, titleOverride) {
  const content = modalContents[type] || modalContents.legal;

  modalTitle.textContent = titleOverride || content.title;

  modalBody.innerHTML = content.body;

  modalRoot.classList.remove("hidden");

  setTimeout(() => {
    modalRoot.classList.remove("opacity-0");

    modalContentBox.classList.remove("scale-95");

    modalContentBox.classList.add("scale-100");
  }, 10);

  // Login inputs are created dynamically
  if (type === "login") {
    wireLoginInputs();
  }
}

// --- Close Modal ---

function closeModal() {
  modalRoot.classList.add("opacity-0");

  modalContentBox.classList.remove("scale-100");

  modalContentBox.classList.add("scale-95");

  setTimeout(() => {
    modalRoot.classList.add("hidden");
  }, 300);
}

// =====================================================
// LOGIN LOGIC
// =====================================================

// --- Connect login inputs ---

function wireLoginInputs() {
  const mobileInput = document.getElementById("loginMobile");

  const passwordInput = document.getElementById("loginPassword");

  // Mobile input
  if (mobileInput) {
    mobileInput.addEventListener("input", () => {
      mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 10);

      if (mobileInput.value.length === 10) {
        clearFieldError("loginMobileHint");
      }
    });
  }

  // Shop ID input
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      if (passwordInput.value.trim().length >= 4) {
        clearFieldError("loginPasswordHint");
      }
    });
  }
}

// --- Show field error ---

function showFieldError(hintId, message) {
  const el = document.getElementById(hintId);

  if (!el) return;

  el.textContent = message;

  el.classList.remove("hidden");
}

// --- Clear field error ---

function clearFieldError(hintId) {
  const el = document.getElementById(hintId);

  if (!el) return;

  el.textContent = "";

  el.classList.add("hidden");
}

// --- Show login error ---

function showLoginError(message) {
  const box = document.getElementById("loginError");

  if (!box) return;

  box.textContent = message;

  box.classList.remove("hidden");
}

// --- Hide login error ---

function hideLoginError() {
  const box = document.getElementById("loginError");

  if (!box) return;

  box.textContent = "";

  box.classList.add("hidden");
}

// --- Validate Login ---

function validateLoginForm(mobile, shopId) {
  let isValid = true;

  clearFieldError("loginMobileHint");

  clearFieldError("loginPasswordHint");

  // Mobile validation
  if (!mobile) {
    showFieldError("loginMobileHint", "Mobile number dalna zaroori hai.");

    isValid = false;
  } else if (!/^\d{10}$/.test(mobile)) {
    showFieldError("loginMobileHint", "Sahi 10-digit mobile number dalein.");

    isValid = false;
  }

  // Shop ID validation
  if (!shopId) {
    showFieldError("loginPasswordHint", "Shop ID dalna zaroori hai.");

    isValid = false;
  } else if (shopId.length < 4) {
    showFieldError("loginPasswordHint", "Valid Shop ID dalein.");

    isValid = false;
  }

  return isValid;
}

// --- Supabase error handling ---

function mapAuthError(error) {
  const msg = (error?.message || "").toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Mobile number ya Shop ID galat hai.";
  }

  if (msg.includes("email not confirmed")) {
    return "Account verify nahi hua hai. Support se sampark karein.";
  }

  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Bahut zyada attempts ho gaye. Thodi der baad try karein.";
  }

  if (msg.includes("network") || msg.includes("fetch")) {
    return "Internet connection check karein aur dobara try karein.";
  }

  return "Login nahi ho paaya. Kripya dobara try karein.";
}

// =====================================================
// SUBMIT LOGIN
// =====================================================

async function submitLogin(event) {
  event.preventDefault();

  hideLoginError();

  const mobileInput = document.getElementById("loginMobile");
  const passwordInput = document.getElementById("loginPassword");
  const submitBtn = document.getElementById("loginSubmitBtn");

  const mobile = mobileInput.value.trim();
  const shopId = passwordInput.value.trim();

  if (!validateLoginForm(mobile, shopId)) {
    return false;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Login ho raha hai...";

  try {

    // Supabase database request
    const { data, error } = await supabaseClient
      .from("shops")
      .select("*")
      .eq("whatsapp_number", mobile)
      .eq("shop_id", shopId)
      .single();

    console.log("Supabase response:", data);

    if (error || !data) {
      console.error("Login Error:", error);

      showLoginError(
        "Mobile number ya Shop ID galat hai."
      );

      submitBtn.disabled = false;
      submitBtn.textContent = "Login Karein";

      return false;
    }

    // Shop found
    console.log("Shop Login Successful:", data);

    // Save shop information for dashboard
    localStorage.setItem(
      "loggedInShop",
      JSON.stringify({
        id: data.id,
        shop_id: data.shop_id,
        shop_name: data.shop_name,
        whatsapp_number: data.whatsapp_number
      })
    );

    submitBtn.textContent =
      "Login safal! Redirect ho raha hai...";

    window.location.href = DASHBOARD_URL;

  } catch (err) {

    console.error("Login error:", err);

    showLoginError(
      "Kuch galat ho gaya. Dobara try karein."
    );

    submitBtn.disabled = false;
    submitBtn.textContent = "Login Karein";
  }

  return false;
}
