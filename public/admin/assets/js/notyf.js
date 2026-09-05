// Khởi tạo Notyf
var notyf = new Notyf({
  duration: 3000,
  dismissible: true,
  position: {
    x: 'right',
    y: 'top',
  },
});
// Thông báo khi load lại trang
let dataNotyf = sessionStorage.getItem('notyf');
if (dataNotyf) {
  dataNotyf = JSON.parse(dataNotyf);
  if (dataNotyf.code === 'error') {
    notyf.error(dataNotyf.message);
  }
  if (dataNotyf.code === 'success') {
    notyf.success(dataNotyf.message);
  }
  sessionStorage.removeItem('notyf');
}
// Hàm vẽ ra thông báo khi laod lại trang
const drawNotyf = (code, message) => {
  sessionStorage.setItem('notyf', JSON.stringify({
    code: code,
    message: message
  }))
}