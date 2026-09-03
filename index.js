const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Cấu himhf thư mục mặc định chứa giao diện 
app.set('views', path.join(__dirname, 'views'));
// Cấu hình sử dụng Pug làm engine để render giao diện
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('client/pages/home.pug', {
    pageTitle: 'Trang chủ',
  });
});

app.get('/tour', (req, res) => {
  res.render('client/pages/tour.pug', {
    pageTitle: 'Danh sách tour',
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
}); 