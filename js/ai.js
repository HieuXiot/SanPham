// ====================================================
// AI.JS — NHẬN DIỆN ẢNH (MobileNet + KNN Classifier)
// ====================================================

const modeRecognizeBtn = document.querySelector("#mode-recognize-btn");

const adminCapturePanel = document.querySelector("#admin-capture-panel");
const adminCaptureTitle = document.querySelector("#admin-capture-title");
const adminCaptureBtn = document.querySelector("#admin-capture-btn");
const adminUndoBtn = document.querySelector("#admin-undo-btn");
const adminCaptureClose = document.querySelector("#admin-capture-close");

// ====================================================
// NHẬN DIỆN QUA ẢNH (dành cho người dùng thường)
// ====================================================
modeRecognizeBtn.addEventListener("click", async () => {
  await stopAllModes();
  showCameraView();
  publicResult.textContent = "Đang mở camera...";
  try {
    mode = "public-recognize";
    await openCamera();
    recognizeLoopRunning = true;
    publicResult.textContent = "Đang nhận diện...";
    recognizeLoop();
  } catch (err) {
    publicResult.textContent = "";
    toast(friendlyCameraError(err), true);
    showHome();
  }
});

async function recognizeLoop() {
  if (!recognizeLoopRunning || mode !== "public-recognize") return;

  if (classifier.getNumClasses() > 0) {
    const result = await tf.tidy(() => {
      const activation = mobilenetModel.infer(video, true);
      return classifier.predictClass(activation);
    });
    const confidence = Math.round(result.confidences[result.label] * 100);
    const product = products[result.label];
    const name = product ? product.name : result.label;
    publicResult.textContent = `➡️ ${name} (${confidence}% chắc chắn)`;
  } else {
    publicResult.textContent = "Chưa có sản phẩm nào được train trong Admin.";
  }

  requestAnimationFrame(recognizeLoop);
}

// ====================================================
// ADMIN - CHỤP ẢNH TRAIN CHO 1 SẢN PHẨM
// ====================================================
async function startAdminCapture(product) {
  await stopAllModes();
  mode = "admin-capture";
  activeProductId = product.id;
  adminCapturePanel.classList.remove("hidden");
  adminCaptureTitle.textContent = `Chụp ảnh cho: ${product.name}`;
  updateAdminCaptureBtn();
  try {
    await openCamera();
  } catch (err) {
    toast(friendlyCameraError(err), true);
    adminCapturePanel.classList.add("hidden");
    mode = "idle";
  }
}

function updateAdminCaptureBtn() {
  const product = products[activeProductId];
  if (!product) return;
  adminCaptureBtn.textContent = `📸 Chụp (${product.photoCount}/${MAX_PHOTOS_PER_PRODUCT})`;
  adminCaptureBtn.disabled = product.photoCount >= MAX_PHOTOS_PER_PRODUCT;
  adminUndoBtn.disabled = product.photoCount <= 0;
}

// Chụp ảnh KHÔNG lưu ngay - trực tiếp thêm vector đặc trưng vào classifier
// (không lưu ảnh gốc, chỉ lưu "đặc điểm nhận diện" của ảnh)
adminCaptureBtn.addEventListener("click", () => {
  const product = products[activeProductId];
  if (!product || product.photoCount >= MAX_PHOTOS_PER_PRODUCT) return;

  tf.tidy(() => {
    const activation = mobilenetModel.infer(video, true);
    classifier.addExample(activation, product.id);
  });
  product.photoCount++;
  updateAdminCaptureBtn();
  renderProductList();
  markTrained();
  addNotification(`📸 Đã lưu ảnh cho "${product.name}"`, "success");
  if (product.photoCount >= MAX_PHOTOS_PER_PRODUCT) {
    addNotification(`🤖 Train thành công cho "${product.name}"`, "success");
  }
  renderDashboard();
  toast(
    `Đã chụp cho "${product.name}" (${product.photoCount}/${MAX_PHOTOS_PER_PRODUCT})`,
  );
});

// Xoá đúng tấm ảnh (vector) chụp gần nhất của sản phẩm đang chọn,
// không ảnh hưởng các sản phẩm khác — dùng cho nút "Chụp lại"
adminUndoBtn.addEventListener("click", () => {
  const product = products[activeProductId];
  if (!product || product.photoCount <= 0) return;

  const dataset = classifier.getClassifierDataset();
  const tensor = dataset[product.id];
  if (!tensor) return;

  const totalRows = tensor.shape[0];
  if (totalRows <= 1) {
    // Chỉ còn 1 ảnh -> xoá luôn nhãn này khỏi classifier
    tensor.dispose();
    delete dataset[product.id];
  } else {
    // Cắt bỏ dòng cuối cùng (ảnh chụp gần nhất), giữ lại các ảnh trước đó
    const trimmed = tf.tidy(() =>
      tensor.slice([0, 0], [totalRows - 1, tensor.shape[1]]),
    );
    tensor.dispose();
    dataset[product.id] = trimmed;
  }
  classifier.setClassifierDataset(dataset);

  product.photoCount--;
  updateAdminCaptureBtn();
  renderProductList();
  renderDashboard();
  toast(`Đã hoàn tác ảnh vừa chụp cho "${product.name}" (còn ${product.photoCount}/${MAX_PHOTOS_PER_PRODUCT})`);
});

adminCaptureClose.addEventListener("click", async () => {
  const product = products[activeProductId];
  await stopAllModes();
  checkProductWarnings(product);
});

// ====================================================
// HUẤN LUYỆN LẠI (làm mới model từ dữ liệu ảnh đang có)
// ====================================================
const retrainBtn = document.querySelector("#retrain-btn");
if (retrainBtn) {
  retrainBtn.addEventListener("click", () => {
    if (classifier.getNumClasses() === 0) {
      toast("Chưa có ảnh nào để train!", true);
      return;
    }
    markTrained();
    addNotification("🤖 Train thành công", "success");
    renderDashboard();
    toast("Đã huấn luyện lại model thành công!");
  });
}
