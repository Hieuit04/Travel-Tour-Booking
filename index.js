const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser')
require('dotenv').config();
const connectDB = require('./configs/database.config');
const adminRouter = require('./routes/admin/index.route');
const clientRouter = require('./routes/client/index.route');
const { pathAdmin } = require('./configs/variable.config');

const app = express();
const port = 3000;

connectDB(); // Kết nối đến cơ sở dữ liệu MongoDB

// Cấu hình thư mục mặc định chứa giao diện 
app.set('views', path.join(__dirname, 'views'));
// Cấu hình sử dụng Pug làm engine để render giao diện
app.set('view engine', 'pug');
// Cấu hình thư mục chứa các file tĩnh 
app.use(express.static(path.join(__dirname, 'public')));
// Thêm biến dùng trong pug
app.locals.pathAdmin = pathAdmin; 
// Thêm biết toàn cục dùng bên back end 
global.pathAdmin = pathAdmin;
// Cho phép data gửi lên dưới dạng JSON, chuyển dữ liệu từ JSON sang JS
app.use(express.json())

// Thêm cookie-parser vào middleware để lấy đc token trong cookie
app.use(cookieParser())

app.use(`/${pathAdmin}`, adminRouter);
app.use('/', clientRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
}); 