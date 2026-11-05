const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads luôn tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu file tạm trên ổ cứng
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Đặt tên file tránh trùng lặp: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

module.exports.uploadDisk = multer({ storage: diskStorage });
module.exports.uploadDir = uploadDir;

