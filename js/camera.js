// ====================================================
// CAMERA.JS — QUẢN LÝ CAMERA DÙNG CHUNG (video stream thô)
// ====================================================

const video = document.querySelector("#video");
const videoWrap = document.querySelector("#video-wrap");

async function openCamera() {
  if (cameraStream) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Trình duyệt không hỗ trợ camera, hoặc trang đang chạy qua HTTP (không phải HTTPS/localhost).",
    );
  }
  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });
  video.srcObject = cameraStream;
  videoWrap.classList.remove("hidden");
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    cameraStream = null;
  }
  videoWrap.classList.add("hidden");
}
