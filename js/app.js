// ====================================================
// APP.JS — CẤU HÌNH, STATE DÙNG CHUNG & KHỞI ĐỘNG HỆ THỐNG
// (Các file js/khác.js đều dựa vào state khai báo ở đây)
// ====================================================

// ====== CẤU HÌNH ======
const MAX_PHOTOS_PER_PRODUCT = 10; // mỗi sản phẩm train tối đa 10 ảnh
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // DEMO ONLY - không dùng cho sản phẩm thật

// ====== CẤU HÌNH ĐỒNG BỘ GITHUB ======
const GITHUB_OWNER = "HieuXiot";
const GITHUB_REPO = "SanPham";
const GITHUB_PATH = "data/products.json";
const GITHUB_BRANCH = "main";
const GITHUB_CONFIGURED =
  GITHUB_OWNER !== "ten-tai-khoan-github-cua-ban" &&
  GITHUB_REPO !== "ten-repo-luu-du-lieu";

// ====== STATE DÙNG CHUNG (các module khác đọc/ghi trực tiếp biến này) ======
let products = {};
let nextProductId = 1;
let isAdmin = false;
let mobilenetModel;
let classifier;
let html5QrCode;

// mode: "idle" | "public-recognize" | "public-scan" | "admin-capture" | "admin-scan"
let mode = "idle";
let activeProductId = null;
let recognizeLoopRunning = false;
let cameraStream = null;

// ====== DOM DÙNG Ở NHIỀU NƠI ======
const loadingScreen = document.querySelector("#loading-screen");
const loadingText = document.querySelector("#loading-text");
const statusBanner = document.querySelector("#status-banner");

// ====================================================
// KHỞI ĐỘNG: MÀN HÌNH LOADING -> TẢI MODEL -> HIỆN APP
// ====================================================
async function init() {
  try {
    classifier = knnClassifier.create();

    loadingText.textContent = "Đang tải model nhận diện...";
    // Trước đây dùng alpha:0.25 (bản siêu nhẹ) để chạy vừa mọi khung hình liên tục.
    // Giờ chỉ suy luận 1 lần mỗi khi bấm "Chụp" nên dùng bản alpha:1 để nhận diện chính xác hơn.
    mobilenetModel = await mobilenet.load({ version: 1, alpha: 1 });

    loadingText.textContent = "Đang tải dữ liệu cục bộ...";
    loadDataFromLocalStorage();

    if (GITHUB_CONFIGURED) {
      loadingText.textContent = "Đang lấy dữ liệu mới nhất...";
      await pullFromGithub(false);
    }

    loadingScreen.classList.add("hidden");
    modeRecognizeBtn.disabled = false;
  } catch (err) {
    console.error(err);
    loadingText.textContent =
      "Lỗi khi tải model, kiểm tra kết nối mạng rồi tải lại trang (F5).";
  }
}

// ====================================================
// PWA - CÀI ĐẶT APP TỪ TRÌNH DUYỆT
// ====================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .catch((err) => console.error("Lỗi đăng ký service worker:", err));
  });
}

let deferredInstallPrompt = null;
const installAppBtn = document.querySelector("#install-app-btn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installAppBtn.classList.remove("hidden");
});

installAppBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === "accepted") toast("Đã cài đặt app!");
  deferredInstallPrompt = null;
  installAppBtn.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installAppBtn.classList.add("hidden");
  toast("Cài đặt thành công! Mở app từ màn hình chính nhé.");
});

// ====================================================
// CHẠY HỆ THỐNG (đặt cuối cùng, sau khi mọi module đã tải)
// ====================================================
init();
renderProductList();
