// ====================================================
// BARCODE.JS — QUÉT BARCODE & QR CODE (html5-qrcode)
// ====================================================

const readerDiv = document.querySelector("#reader");
const readerDefaultParent = readerDiv.parentElement; // #camera-view (vị trí gốc)
const adminScanReaderWrap = document.querySelector("#admin-scan-reader-wrap");

// Di chuyển khung quét (video của html5-qrcode) vào khung Admin đang mở,
// rồi trả lại đúng vị trí gốc khi đóng.
function moveReaderTo(container) {
  if (container) container.appendChild(readerDiv);
}
function restoreReaderToDefault() {
  if (readerDefaultParent) readerDefaultParent.appendChild(readerDiv);
}

const adminScanPanel = document.querySelector("#admin-scan-panel");
const adminScanTitle = document.querySelector("#admin-scan-title");
const adminScanClose = document.querySelector("#admin-scan-close");
const adminScanPreview = document.querySelector("#admin-scan-preview");
const adminScanDecoded = document.querySelector("#admin-scan-decoded");
const adminScanConfirmBtn = document.querySelector("#admin-scan-confirm-btn");
const adminScanRetryBtn = document.querySelector("#admin-scan-retry-btn");

const publicScanRetryRow = document.querySelector("#public-scan-retry-row");
const publicScanRetryBtn = document.querySelector("#public-scan-retry-btn");

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
// Quét được 1 mã -> TẠM DỪNG ngay (giống luồng Admin), hiện kết quả,
// tránh việc camera bắt lại đúng mã đó liên tục 10 lần/giây gây spam
// hàng loạt thông báo toast chồng lên nhau.
// ====================================================
async function startPublicScan() {
  mode = "public-scan";
  publicScanRetryRow.classList.add("hidden");
  await openScanner(async (decodedText) => {
    if (mode !== "public-scan") return; // đã rời màn hình, bỏ qua kết quả trễ

    try {
      await html5QrCode.pause(true);
    } catch (e) {}

    const product = Object.values(products).find((p) => p.code === decodedText);
    if (product) {
      publicResult.innerHTML = `
        <div style="font-size:15px;line-height:1.6;">
          <strong>${product.name}</strong><br/>
          <strong>Giá:</strong> ${product.price || "Chưa có"}<br/>
          <strong>Danh mục:</strong> ${product.category || "Chưa có"}<br/>
          <strong>Ghi chú:</strong> ${product.notes || "Không có"}<br/>
          <strong>Mã:</strong> ${product.code}
        </div>
      `;
      toast(`Tìm thấy: ${product.name}`);
    } else {
      publicResult.textContent = `Không tìm thấy sản phẩm với mã "${decodedText}".`;
    }
    publicScanRetryRow.classList.remove("hidden");
  });
  publicResult.textContent = "Đưa mã vào khung hình để quét...";
}

// Quét tiếp mã khác sau khi đã có kết quả
publicScanRetryBtn.addEventListener("click", async () => {
  if (mode !== "public-scan" || !html5QrCode) return;
  publicScanRetryRow.classList.add("hidden");
  publicResult.textContent = "Đưa mã vào khung hình để quét...";
  try {
    await html5QrCode.resume();
  } catch (e) {}
});

// ====================================================
// ADMIN - GÁN MÃ (QUÉT BARCODE/QR) CHO 1 SẢN PHẨM
// Có bước xác nhận trước khi gán, tránh quét nhầm mã
// ====================================================
let pendingScanCode = null;

async function startAdminScan(product) {
  await stopAllModes();
  mode = "admin-scan";
  activeProductId = product.id;
  adminScanPanel.classList.remove("hidden");
  adminScanTitle.textContent = `Quét mã để gán cho: ${product.name}`;
  adminScanPreview.classList.add("hidden");
  moveReaderTo(adminScanReaderWrap);
  try {
    await openScanner(async (decodedText) => {
      // Quét được -> tạm dừng, hỏi xác nhận trước khi gán thật
      pendingScanCode = decodedText;
      try {
        await html5QrCode.pause(true);
      } catch (e) {}
      adminScanDecoded.textContent = decodedText;
      adminScanPreview.classList.remove("hidden");
    });
  } catch (err) {
    toast(friendlyCameraError(err), true);
    adminScanPanel.classList.add("hidden");
    mode = "idle";
  }
}

adminScanConfirmBtn.addEventListener("click", async () => {
  const product = products[activeProductId];
  if (!product || !pendingScanCode) return;
  product.code = pendingScanCode;
  pendingScanCode = null;
  renderProductList();
  renderDashboard();
  toast(`Đã gán mã "${product.code}" cho "${product.name}"`);
  await stopAllModes();
});

adminScanRetryBtn.addEventListener("click", async () => {
  pendingScanCode = null;
  adminScanPreview.classList.add("hidden");
  try {
    await html5QrCode.resume();
  } catch (e) {}
});

adminScanClose.addEventListener("click", async () => {
  pendingScanCode = null;
  await stopAllModes();
});
