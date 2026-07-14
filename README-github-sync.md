# Hướng dẫn thiết lập đồng bộ GitHub (cho cả nhà dùng chung)

## Bước 1: Tạo repo GitHub
1. Vào github.com → tạo repo mới, đặt tên (VD: `nha-data`), chọn **Public**.
2. Tạo 1 file trong repo tên `data/products.json`, nội dung ban đầu:
```json
{"products": {}, "nextProductId": 1, "classifierDataset": {}}
```

## Bước 2: Sửa cấu hình trong js/app.js
Mở `js/app.js`, sửa 4 dòng đầu phần CẤU HÌNH GITHUB:
```js
const GITHUB_OWNER = "ten-tai-khoan-cua-ban";
const GITHUB_REPO = "nha-data";
const GITHUB_PATH = "data/products.json";
const GITHUB_BRANCH = "main";
```

## Bước 3: Tạo Personal Access Token (chỉ admin cần)
1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Chọn đúng repo `nha-data` (không chọn "All repositories").
3. Ở phần Permissions, chọn **Contents: Read and write**.
4. Tạo token, copy lại (chỉ hiện 1 lần).

## Bước 4: Sử dụng
- **Admin**: đăng nhập admin → thêm/sửa/xoá sản phẩm, chụp ảnh train, gán mã → dán token vào ô "GitHub token" → bấm **☁️ Đồng bộ lên GitHub**.
- **Người nhà khác**: chỉ cần mở app, dữ liệu tự động tải về từ GitHub, không cần token, không cần đăng nhập.
- Nếu người nhà đang mở app mà admin vừa cập nhật, bấm **🔄 Tải mới nhất từ GitHub** (hoặc F5 lại trang) để lấy bản mới nhất.

## Lưu ý quan trọng
- KHÔNG bao giờ dán token vào code rồi commit lên GitHub — ai xem code cũng thấy được.
- Token chỉ nên đưa cho người bạn tin tưởng làm admin.
- App cần chạy qua HTTPS hoặc localhost thì trình duyệt mới cho mở camera (dùng `npx serve`, live-server, hoặc host lên GitHub Pages).

---

# Hướng dẫn cài đặt thành app (PWA)

App đã được cấu hình để cài đặt trực tiếp từ trình duyệt, không cần CH Play/App Store.

## Điều kiện bắt buộc
- Phải chạy qua **HTTPS** (hoặc `localhost` khi test) — trình duyệt sẽ KHÔNG cho cài PWA nếu chạy qua HTTP thường.
- Cách dễ nhất: đẩy code lên **GitHub Pages** (miễn phí, tự có HTTPS):
  1. Tạo 1 repo mới (hoặc dùng repo `nha-data` luôn cũng được, tách thư mục riêng).
  2. Đẩy toàn bộ file trong `object_JS/` (index.html, js/app.js, manifest.json, sw.js, icon-192.png, icon-512.png) lên repo đó.
  3. Vào Settings → Pages → chọn nhánh `main` → Save. Sau ~1 phút sẽ có link dạng `https://ten-tai-khoan.github.io/ten-repo/`.

## Cài đặt trên điện thoại (Android)
1. Mở link app bằng Chrome.
2. Sẽ thấy nút **⬇️ Cài đặt app** hiện ra trên đầu trang (hoặc menu ⋮ → "Cài đặt ứng dụng" / "Thêm vào Màn hình chính").
3. Bấm cài → app xuất hiện như app thật, có icon riêng, mở full màn hình.

## Cài đặt trên iPhone (Safari)
- Safari không hiện nút cài tự động như Chrome. Cách làm: mở link bằng Safari → bấm nút Chia sẻ (hình vuông có mũi tên) → **"Thêm vào MH chính"**.

## Cài đặt trên máy tính (Windows/Mac, dùng Chrome/Edge)
1. Mở link app.
2. Nhìn thanh địa chỉ, có icon **⊕ Cài đặt** (hoặc menu ⋮ → "Cài đặt [tên app]").
3. Bấm cài → app mở trong 1 cửa sổ riêng, có icon trên Desktop/Start Menu, không có thanh địa chỉ trình duyệt nữa.
