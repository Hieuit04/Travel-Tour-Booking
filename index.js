const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config()
const Tour = require('./models/tour.model');
const app = express();
const port = 3000;

mongoose.connect(process.env.DATABASE);

// Cấu hình thư mục mặc định chứa giao diện 
app.set('views', path.join(__dirname, 'views'));
// Cấu hình sử dụng Pug làm engine để render giao diện
app.set('view engine', 'pug');
// Cấu hình thư mục chứa các file tĩnh 
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('client/pages/home.pug', {
    pageTitle: 'Trang chủ',
  });
});

app.get('/tour', async (req, res) => {
  const tourList = await Tour.find({});
  console.log(tourList);
  res.render('client/pages/tour', {
    pageTitle: 'Danh sách tour',
    tourList: tourList
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
}); 