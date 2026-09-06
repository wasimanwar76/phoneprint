// ===== Supabase setup =====
const SUPABASE_URL = "https://gepkipszweqhftwaejbu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_forPZqB40NrPCFGQsdqeZw_4QTxOgBH";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

// ===== Helpers to generate credentials =====
function generateShopId(shopName) {
  const slug =
    shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 6) || "shop";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${slug}-${rand}`;
}

function generateQrToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let token = "";
  for (let i = 0; i < 10; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// ===== Modal open/close =====
function openSignupModal() {
  resetSignupModal();
  const root = document.getElementById("signupModalRoot");
  const box = document.getElementById("signupModalBox");
  root.classList.remove("hidden");
  root.classList.add("flex");
  requestAnimationFrame(() => {
    root.classList.remove("opacity-0");
    box.classList.remove("scale-95");
  });
  document.body.style.overflow = "hidden";
}

function closeSignupModal() {
  const root = document.getElementById("signupModalRoot");
  const box = document.getElementById("signupModalBox");
  root.classList.add("opacity-0");
  box.classList.add("scale-95");
  document.body.style.overflow = "";
  setTimeout(() => {
    root.classList.add("hidden");
    root.classList.remove("flex");
  }, 300);
}

function resetSignupModal() {
  document.getElementById("signupForm").reset();
  document.getElementById("signupError").classList.add("hidden");
  document.getElementById("signupFormView").classList.remove("hidden");
  document.getElementById("signupSuccessView").classList.add("hidden");
  const btn = document.getElementById("signupSubmitBtn");
  btn.disabled = false;
  btn.textContent = "Demo Shuru Karein — Free ›";
}

// ===== Submit → insert into Supabase =====
async function submitSignup(event) {
  event.preventDefault();

  const errorBox = document.getElementById("signupError");
  errorBox.classList.add("hidden");

  const ownerName = document.getElementById("suName").value.trim();
  const whatsapp = document.getElementById("suWhatsapp").value.trim();
  const shopName = document.getElementById("suShopName").value.trim();
  const shopAddress = document.getElementById("suShopAddress").value.trim();
  const email = document.getElementById("suEmail").value.trim();
  const printerName = document.getElementById("suPrinter").value;

  if (!/^\d{10}$/.test(whatsapp)) {
    errorBox.textContent = "Kripya sahi 10-digit WhatsApp number dalein.";
    errorBox.classList.remove("hidden");
    return false;
  }

  const submitBtn = document.getElementById("signupSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Register ho raha hai...";

  const shopId = generateShopId(shopName);
  const qrToken = generateQrToken();

  const { data, error } = await supabaseClient
    .from("shops")
    .insert({
      shop_id: shopId,
      owner_name: ownerName,
      whatsapp_number: whatsapp,
      shop_name: shopName,
      shop_address: shopAddress,
      email: email,
      printer_name: printerName,
      qr_token: qrToken,
      status: "active",
    })
    .select()
    .single();

  submitBtn.disabled = false;
  submitBtn.textContent = "Demo Shuru Karein — Free ›";

  if (error) {
    console.error("Supabase insert error:", error);
    errorBox.textContent = "Kuch galat ho gaya. Dobara try karein.";
    errorBox.classList.remove("hidden");
    return false;
  }

  showSignupSuccess(data);
  return false;
}

function showSignupSuccess(row) {
  document.getElementById("signupFormView").classList.add("hidden");
  document.getElementById("signupSuccessView").classList.remove("hidden");
  document.getElementById("successShopId").textContent = row.shop_id;
  document.getElementById("successQrToken").textContent = row.qr_token;
}

function copyToClipboard(elId) {
  const text = document.getElementById(elId).textContent;
  navigator.clipboard.writeText(text);
}
