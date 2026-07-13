// ====================================================
// BARCODE.JS — QUÉT BARCODE & QR CODE (html5-qrcode)
// ====================================================

const readerDiv = document.querySelector("#reader");
const adminScanPanel = document.querySelector("#admin-scan-panel");
const adminScanTitle = document.querySelector("#admin-scan-title");
const adminScanClose = document.querySelector("#admin-scan-close");

async function openScanner(onSuccess) {
  readerDiv.classList.remove("hidden");
  html5QrCode = new Html5Qrcode("reader");

  const config = {
    fps: 10,
    // Khung chữ nhật ngang, hợp cả QR (vuông) lẫn mã vạch (dài ngang)
    qrbox: { width: 280, height: 140 },
  };

  // Khai báo rõ các định dạng cần đọc: QR + các loại mã vạch phổ biến trên bao bì
  if (window.Html5QrcodeSupportedFormats) {
    config.formatsToSupport = [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
    ];
  }

  await html5QrCode.start({ facingMode: "environment" }, config, onSuccess);
}

async function closeScanner() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
    } catch (e) {}
    html5QrCode = null;
  }
  readerDiv.classList.add("hidden");
}

// ====================================================
// QUÉT MÃ ĐỂ TRA THÔNG TIN SẢN PHẨM (dành cho người dùng thường)
// ====================================================
async function startPublicScan() {
  mode = "public-scan";
  await openScanner(async (decodedText) => {
    const product = Object.values(products).find((p) => p.code === decodedText);
    if (product) {
      publicResult.innerHTML = `<strong>${product.name}</strong><br/>Mã: ${product.code}`;
      toast(`Tìm thấy: ${product.name}`);
    } else {
      publicResult.textContent = `Không tìm thấy sản phẩm với mã "${decodedText}".`;
    }
  });
  publicResult.textContent = "Đưa mã vào khung hình để quét...";
}

// ====================================================
// ADMIN - GÁN MÃ (QUÉT BARCODE/QR) CHO 1 SẢN PHẨM
// ====================================================
async function startAdminScan(product) {
  await stopAllModes();
  mode = "admin-scan";
  activeProductId = product.id;
  adminScanPanel.classList.remove("hidden");
  adminScanTitle.textContent = `Quét mã để gán cho: ${product.name}`;
  try {
    await openScanner(async (decodedText) => {
      product.code = decodedText;
      renderProductList();
      renderDashboard();
      toast(`Đã gán mã "${decodedText}" cho "${product.name}"`);
      await stopAllModes();
    });
  } catch (err) {
    toast(friendlyCameraError(err), true);
    adminScanPanel.classList.add("hidden");
    mode = "idle";
  }
}

adminScanClose.addEventListener("click", async () => {
  await stopAllModes();
});
