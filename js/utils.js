// ====================================================
// UTILS.JS — HÀM DÙNG CHUNG CHO TOÀN APP
// ====================================================

// Hiện toast nhanh góc màn hình
function toast(text, isError) {
  Toastify({
    text,
    style: isError ? { background: "#dc2626" } : undefined,
    duration: isError ? 5000 : 3000,
  }).showToast();
}

// Dịch lỗi camera của trình duyệt sang câu tiếng Việt dễ hiểu
function friendlyCameraError(err) {
  console.error(err);
  const name = err && err.name;
  if (name === "NotAllowedError")
    return "Bạn chưa cấp quyền camera cho trang này. Vào cài đặt trình duyệt để cho phép.";
  if (name === "NotFoundError")
    return "Không tìm thấy camera trên thiết bị này.";
  if (name === "NotReadableError")
    return "Camera đang được ứng dụng khác sử dụng, đóng ứng dụng đó rồi thử lại.";
  return "Không mở được camera: " + (err && err.message ? err.message : err);
}

// Chuỗi UTF-8 -> Base64 (dùng khi đẩy dữ liệu lên GitHub API)
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
