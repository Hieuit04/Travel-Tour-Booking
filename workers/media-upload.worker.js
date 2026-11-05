const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Đảm bảo tất cả các Mongoose Model đã được nạp sẵn vào danh bạ Mongoose
require('../models/tour.model');
require('../models/category.model');
require('../models/blog.model');
require('../models/accounts-admin.model');
require('../models/accounts-clients.model');
require('../models/setting-website-info.model');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm hỗ trợ xóa file tạm an toàn
const safeDeleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Đã xóa file tạm: ${filePath}`);
    } catch (err) {
      console.error(`Không thể xóa file tạm ${filePath}:`, err.message);
    }
  }
};

const startMediaWorker = async () => {
  try {
    // 1. Kết nối MongoDB nếu chưa kết nối
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DATABASE);
      console.log('[Media Worker] Đã kết nối MongoDB thành công');
    }

    // 2. Kết nối RabbitMQ
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();
    const queue = 'media_upload_queue';

    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1); // Xử lý tuần tự từng lượt để tối ưu băng thông và RAM
    console.log(`[Media Worker] Đang lắng nghe hàng đợi [${queue}]...`);

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString());
      const { model, id, files, statusSuccess, statusFail } = data;
      console.log(`\n[Media Worker] Đang xử lý tải ảnh cho [${model}] ID: ${id}`);

      try {
        const updateData = {};

        // 3. Xử lý tải từng mục file lên Cloudinary
        if (files && Array.isArray(files)) {
          for (const item of files) {
            // Trường hợp 1: Mảng nhiều ảnh (Ví dụ: images của Tour)
            if (item.isArray && Array.isArray(item.paths)) {
              const validPaths = item.paths.filter((p) => p && fs.existsSync(p));
              if (validPaths.length > 0) {
                console.log(`Đang tải ${validPaths.length} ảnh cho trường [${item.field}] vào thư mục [${item.folder}]...`);
                const uploadPromises = validPaths.map((p) =>
                  cloudinary.uploader.upload(p, { folder: item.folder || 'general' })
                );
                const results = await Promise.all(uploadPromises);
                updateData[item.field] = results.map((r) => r.secure_url);
              }
            }
            // Trường hợp 2: Ảnh đơn lẻ (Ví dụ: avatar, logo, favicon)
            else if (item.path && fs.existsSync(item.path)) {
              console.log(`Đang tải ảnh cho trường [${item.field}] vào thư mục [${item.folder}]...`);
              const uploadRes = await cloudinary.uploader.upload(item.path, {
                folder: item.folder || 'general',
              });
              updateData[item.field] = uploadRes.secure_url;
            }
          }
        }

        // Nếu có cấu hình đổi trạng thái khi thành công (như status: 'active')
        if (statusSuccess) {
          updateData.status = statusSuccess;
        }

        // 4. DÙNG DYNAMIC MODEL ĐỂ UPDATE VÀO ĐÚNG BẢNG
        const TargetModel = mongoose.model(model);
        await TargetModel.findByIdAndUpdate(id, updateData);

        console.log(`[Media Worker] Cập nhật thành công cho [${model}] ID: ${id}`);

        // 5. Xóa sạch tất cả các file tạm trên ổ cứng
        if (files && Array.isArray(files)) {
          files.forEach((item) => {
            if (item.path) safeDeleteFile(item.path);
            if (Array.isArray(item.paths)) item.paths.forEach(safeDeleteFile);
          });
        }

        // Xác nhận đã hoàn tất bản tin
        channel.ack(msg);
      } catch (error) {
        console.error(`[Media Worker] Lỗi xử lý cho [${model}] ID: ${id}:`, error);

        // Nếu có cấu hình trạng thái lỗi (như status: 'upload_failed')
        if (statusFail) {
          try {
            const TargetModel = mongoose.model(model);
            await TargetModel.findByIdAndUpdate(id, { status: statusFail });
          } catch (e) {
            console.error('Không thể cập nhật trạng thái lỗi:', e.message);
          }
        }

        // Vẫn xóa file tạm để không đầy ổ cứng
        if (files && Array.isArray(files)) {
          files.forEach((item) => {
            if (item.path) safeDeleteFile(item.path);
            if (Array.isArray(item.paths)) item.paths.forEach(safeDeleteFile);
          });
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('[Media Worker] Khởi động thất bại:', error.message);
  }
};

// Cho phép chạy độc lập bằng lệnh node hoặc require từ index.js
if (require.main === module) {
  startMediaWorker().catch(console.error);
}

module.exports = startMediaWorker;
