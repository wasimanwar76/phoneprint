(function () {
  "use strict";

  const CUSTOMER_PAGE = "https://www.quick2print.in/qrcode.html";
  const QR_LIBRARIES = [
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
    "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js",
  ];

  let qrLibraryPromise = null;
  let qrReady = false;
  let customerUrl = "";
  let shopData = null;

  function getSessionShop() {
    let shop = null;

    try {
      shop = JSON.parse(localStorage.getItem("loggedInShop") || "null");
    } catch (e) {
      console.error("Quick2Print: invalid loggedInShop", e);
    }

    // Fallback to the dashboard's existing variable if available.
    if (!shop && typeof currentShop !== "undefined" && currentShop) {
      shop = currentShop;
    }

    return shop;
  }

  function getShopData() {
    const shop = getSessionShop();

    const shopId = String(shop?.shop_id || "").trim();
    const shopName = String(shop?.shop_name || "").trim();

    if (!shopId) {
      throw new Error("Shop ID localStorage.loggedInShop me nahi mila.");
    }

    return {
      shopId,
      shopName: shopName || "Quick2Print Shop",
    };
  }

  function setStatus(message, type) {
    const el = document.getElementById("qrStatus");
    if (!el) return;

    const styles = {
      loading: "border-blue-200 bg-blue-50 text-blue-700",
      ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
      error: "border-red-200 bg-red-50 text-red-700",
    };

    const dots = {
      loading: "bg-blue-500 animate-pulse",
      ready: "bg-emerald-500",
      error: "bg-red-500",
    };

    el.className =
      "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold " +
      (styles[type] || styles.loading);

    el.innerHTML = `<span class="h-2 w-2 rounded-full ${
      dots[type] || dots.loading
    }"></span>${message}`;
  }

  function updateShopUI(shop) {
    const nameEl = document.getElementById("qrShopName");
    const idEl = document.getElementById("qrShopId");
    const urlEl = document.getElementById("qrUrl");
    const a4NameEl = document.getElementById("a4ShopName");
    const a4UrlEl = document.getElementById("a4Url");

    customerUrl = `${CUSTOMER_PAGE}?shop_id=${encodeURIComponent(shop.shopId)}`;

    if (nameEl) nameEl.textContent = shop.shopName;
    if (idEl) idEl.textContent = shop.shopId;
    if (urlEl) urlEl.textContent = customerUrl;
    if (a4NameEl) a4NameEl.textContent = shop.shopName;
    if (a4UrlEl) a4UrlEl.textContent = customerUrl;
  }

  function loadQRLibrary() {
    if (typeof window.QRCode === "function") return Promise.resolve();
    if (qrLibraryPromise) return qrLibraryPromise;

    qrLibraryPromise = new Promise((resolve, reject) => {
      let index = 0;

      function tryNext() {
        if (typeof window.QRCode === "function") {
          resolve();
          return;
        }

        if (index >= QR_LIBRARIES.length) {
          reject(new Error("QR library load nahi hui."));
          return;
        }

        const script = document.createElement("script");
        script.src = QR_LIBRARIES[index++];
        script.async = true;

        script.onload = function () {
          if (typeof window.QRCode === "function") {
            resolve();
          } else {
            tryNext();
          }
        };

        script.onerror = tryNext;
        document.head.appendChild(script);
      }

      tryNext();
    });

    return qrLibraryPromise;
  }

  function renderQR(container, size) {
    if (!container) throw new Error("QR container nahi mila.");

    container.innerHTML = "";

    new window.QRCode(container, {
      text: customerUrl,
      width: size,
      height: size,
      colorDark: "#17135F",
      colorLight: "#FFFFFF",
      correctLevel: window.QRCode.CorrectLevel.H,
    });
  }

  async function generateShopQRCode() {
    const preview = document.getElementById("qrPreview");
    const a4 = document.getElementById("a4QrCode");

    if (!preview || !a4) {
      console.warn("Quick2Print QR: QR containers not found.");
      return false;
    }

    try {
      setStatus("Loading shop details...", "loading");

      // IMPORTANT: Read directly from localStorage instead of depending on
      // the dashboard's top-level `let currentShop` lexical variable.
      shopData = getShopData();
      updateShopUI(shopData);

      setStatus("Generating QR...", "loading");
      await loadQRLibrary();

      renderQR(preview, 230);
      renderQR(a4, 300);

      // qrcodejs creates the canvas/image synchronously, but give the DOM a tick.
      await new Promise((resolve) => setTimeout(resolve, 50));

      const previewImage = preview.querySelector("canvas, img");
      const a4Image = a4.querySelector("canvas, img");

      if (!previewImage || !a4Image) {
        throw new Error("QR canvas/image generate nahi hua.");
      }

      qrReady = true;
      setStatus("QR Ready", "ready");

      if (typeof window.lucide !== "undefined" && window.lucide.createIcons) {
        window.lucide.createIcons();
      }

      console.log("Quick2Print QR generated:", {
        shopId: shopData.shopId,
        shopName: shopData.shopName,
        url: customerUrl,
      });

      return true;
    } catch (error) {
      qrReady = false;
      console.error("Quick2Print QR generation error:", error);
      setStatus("QR Failed", "error");

      preview.innerHTML = `
        <div class="px-5 text-center">
          <p class="text-sm font-extrabold text-red-600">QR generate nahi hua</p>
          <p class="mt-1 text-xs font-medium text-slate-400">${String(
            error.message || "Please refresh and try again.",
          )}</p>
        </div>
      `;

      return false;
    }
  }

  function getQRDataURL(container) {
    const canvas = container?.querySelector("canvas");
    if (canvas) return canvas.toDataURL("image/png");

    const img = container?.querySelector("img");
    if (img?.src) return img.src;

    throw new Error("QR image available nahi hai.");
  }

  window.generateShopQRCode = generateShopQRCode;

  window.downloadShopQRCode = async function () {
    try {
      if (!qrReady && !(await generateShopQRCode())) return;

      const shop = shopData || getShopData();
      const dataURL = getQRDataURL(document.getElementById("qrPreview"));

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `Quick2Print-QR-${shop.shopId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("QR download error:", error);
      alert("QR download failed. Please try again.");
    }
  };

  window.printShopA4QRCode = async function () {
    try {
      if (!qrReady && !(await generateShopQRCode())) return;

      const poster = document.getElementById("qrA4Poster");
      const qr = document.getElementById("a4QrCode");

      if (!poster || !qr) throw new Error("A4 QR poster incomplete hai.");

      const qrImage = getQRDataURL(qr);
      const clone = poster.cloneNode(true);
      const cloneQR = clone.querySelector("#a4QrCode");

      if (!cloneQR) throw new Error("A4 QR container nahi mila.");

      // about:blank does not reliably resolve relative asset paths.
      const logo = clone.querySelector(
        'img[src="assets/logo.png"], img[src="./assets/logo.png"]',
      );
      if (logo) {
        logo.src = new URL("assets/logo.png", window.location.href).href;
      }

      // Lucide icons are not needed for printing; remove them so the
      // popup does not depend on the dashboard's Lucide runtime.
      clone.querySelectorAll("[data-lucide]").forEach((el) => el.remove());

      cloneQR.innerHTML = `
        <img
          src="${qrImage}"
          alt="Quick2Print QR Code"
          style="width:300px;height:300px;display:block;"
        />
      `;

      const win = window.open("", "_blank", "width=900,height=1100");
      if (!win) {
        alert("Please allow pop-ups to print the A4 QR poster.");
        return;
      }

      const tailwindUrl = "https://cdn.tailwindcss.com";

      win.document.open();
      win.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Quick2Print QR Poster</title>
  <script src="${tailwindUrl}"><\/script>
  <style>
    @page { size: A4 portrait; margin: 0; }

    * { box-sizing: border-box; }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm;
      min-height: 297mm;
      background: #fff;
    }

    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    #qrA4Poster {
      position: relative !important;
      width: 210mm !important;
      min-width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 14mm 12mm !important;
      overflow: hidden !important;
      box-shadow: none !important;
      border: 0 !important;
    }

    /* Custom dashboard utility not available in Tailwind CDN */
    .font-heading { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
</head>
<body>
  ${clone.outerHTML}

  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        window.focus();
        window.print();
        setTimeout(function () { window.close(); }, 1000);
      }, 500);
    });
  <\/script>
</body>
</html>`);
      win.document.close();
    } catch (error) {
      console.error("A4 print error:", error);
      alert("Unable to print the A4 QR poster.");
    }
  };

  function initQR() {
    if (!document.getElementById("tab-qr")) return;
    generateShopQRCode();
  }

  // Generate once on page load.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQR, { once: true });
  } else {
    initQR();
  }

  // Also retry when the QR tab is opened. This makes the feature reliable
  // even if the QR CDN was temporarily unavailable during initial page load.
  document.addEventListener("click", function (event) {
    const nav = event.target.closest && event.target.closest("#qqhms3");
    if (!nav) return;

    setTimeout(function () {
      const preview = document.getElementById("qrPreview");
      if (!qrReady || !preview?.querySelector("canvas, img")) {
        generateShopQRCode();
      }
    }, 100);
  });
})();
