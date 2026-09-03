const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config()
const tourController = require('./controllers/client/tour.controller');
const homeController = require('./controllers/client/home.controller');
const app = express();
const port = 3000;

mongoose.connect(process.env.DATABASE);

// Cấu hình thư mục mặc định chứa giao diện 
app.set('views', path.join(__dirname, 'views'));
// Cấu hình sử dụng Pug làm engine để render giao diện
app.set('view engine', 'pug');
// Cấu hình thư mục chứa các file tĩnh 
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', homeController.home);

app.get('/tour', tourController.list);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
}); 