// ====================================================
// ADMIN.JS — ĐĂNG NHẬP ADMIN + QUẢN LÝ SẢN PHẨM (CRUD)
// ====================================================

const adminLoginToggle = document.querySelector("#admin-login-toggle");
const adminLogoutBtn = document.querySelector("#admin-logout-btn");
const gotoAdminBtn = document.querySelector("#goto-admin-btn");
const loginBox = document.querySelector("#login-box");
const adminUsernameInput = document.querySelector("#admin-username");
const adminPasswordInput = document.querySelector("#admin-password");
const adminLoginBtn = document.querySelector("#admin-login-btn");
const adminLoginCancel = document.querySelector("#admin-login-cancel");
const adminBackBtn = document.querySelector("#admin-back-btn");

const adminTab = document.querySelector("#admin-tab");

const newProductName = document.querySelector("#new-product-name");
const newProductCode = document.querySelector("#new-product-code");
const addProductBtn = document.querySelector("#add-product-btn");
const productList = document.querySelector("#product-list");

// ====================================================
// ĐĂNG NHẬP / ĐĂNG XUẤT ADMIN
// ====================================================
adminLoginToggle.addEventListener("click", () => {
  loginBox.classList.toggle("hidden");
});
adminLoginCancel.addEventListener("click", () => {
  loginBox.classList.add("hidden");
});

adminLoginBtn.addEventListener("click", () => {
  const u = adminUsernameInput.value.trim();
  const p = adminPasswordInput.value.trim();
  if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
    isAdmin = true;
    loginBox.classList.add("hidden");
    adminLoginToggle.classList.add("hidden");
    adminLogoutBtn.classList.remove("hidden");
    gotoAdminBtn.classList.remove("hidden");
    adminUsernameInput.value = "";
    adminPasswordInput.value = "";
    toast("Đăng nhập admin thành công!");
    closeMenu();
    showAdmin();
  } else {
    toast("Sai tài khoản hoặc mật khẩu!", true);
  }
});

adminLogoutBtn.addEventListener("click", async () => {
  isAdmin = false;
  await stopAllModes();
  adminLoginToggle.classList.remove("hidden");
  adminLogoutBtn.classList.add("hidden");
  gotoAdminBtn.classList.add("hidden");
  closeMenu();
  showHome();
  toast("Đã đăng xuất.");
});

gotoAdminBtn.addEventListener("click", () => {
  closeMenu();
  showAdmin();
});

adminBackBtn.addEventListener("click", async () => {
  await stopAllModes();
  showHome();
});

// ====================================================
// QUẢN LÝ SẢN PHẨM (THÊM / SỬA / XOÁ)
// ====================================================
addProductBtn.addEventListener("click", () => {
  const name = newProductName.value.trim();
  const code = newProductCode.value.trim();
  if (!name) {
    toast("Nhập tên sản phẩm đã!", true);
    return;
  }
  const id = "product_" + nextProductId++;
  products[id] = { id, name, code: code || "", photoCount: 0 };
  newProductName.value = "";
  newProductCode.value = "";
  renderProductList();
  toast(`Đã thêm sản phẩm "${name}"`);
});

function renderProductList() {
  productList.innerHTML = "";
  renderDashboard();
  const entries = Object.values(products);
  if (entries.length === 0) {
    productList.innerHTML =
      "<li>Chưa có sản phẩm nào. Thêm sản phẩm ở form phía trên.</li>";
    return;
  }
  for (const product of entries) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="info">
        <strong>${product.name}</strong>
        — mã: ${product.code || "(chưa có)"}
        — ${product.photoCount}/${MAX_PHOTOS_PER_PRODUCT} ảnh đã train
      </div>
      <div class="actions">
        <button class="small" data-action="capture" data-id="${product.id}">📸 Chụp ảnh</button>
        <button class="small" data-action="scan" data-id="${product.id}">🔗 Gán mã</button>
        <button class="small secondary" data-action="edit" data-id="${product.id}">✏️ Sửa</button>
        <button class="small danger" data-action="delete" data-id="${product.id}">🗑️ Xoá</button>
      </div>
    `;
    productList.appendChild(li);
  }
}

productList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const product = products[id];
  if (!product) return;

  if (action === "capture") {
    await startAdminCapture(product);
  } else if (action === "scan") {
    await startAdminScan(product);
  } else if (action === "edit") {
    editProduct(product);
  } else if (action === "delete") {
    deleteProduct(product);
  }
});

function editProduct(product) {
  const newName = prompt("Tên sản phẩm mới:", product.name);
  if (newName === null) return;
  const newCode = prompt(
    "Mã sản phẩm mới (để trống nếu chưa có):",
    product.code,
  );
  if (newCode === null) return;
  product.name = newName.trim() || product.name;
  product.code = newCode.trim();
  renderProductList();
  toast("Đã cập nhật sản phẩm.");
}

function deleteProduct(product) {
  const ok = confirm(
    `Xoá sản phẩm "${product.name}"? Toàn bộ ảnh đã train của sản phẩm này cũng sẽ bị xoá.`,
  );
  if (!ok) return;

  const dataset = classifier.getClassifierDataset();
  if (dataset[product.id]) {
    dataset[product.id].dispose();
    delete dataset[product.id];
    classifier.setClassifierDataset(dataset);
  }

  delete products[product.id];
  renderProductList();
  toast("Đã xoá sản phẩm.");
}
