const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const path = require('path');
require('dotenv').config();
const connectDB = require('./configs/database.config');
const adminRouter = require('./routes/admin/index.route');
const clientRouter = require('./routes/client/index.route');

const app = express();
const port = 3000;

connectDB(); // Kết nối đến cơ sở dữ liệu MongoDB

// Cấu hình thư mục mặc định chứa giao diện 
app.set('views', path.join(__dirname, 'views'));
// Cấu hình sử dụng Pug làm engine để render giao diện
app.set('view engine', 'pug');
// Cấu hình thư mục chứa các file tĩnh 
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/', clientRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
}); 