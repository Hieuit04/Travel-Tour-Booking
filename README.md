# Travel Tour Booking – Admin & Client Platform

> **AI CONTEXT INSTRUCTION:**
> File README này được xây dựng theo cơ chế **Modular Checkpoint**. Khi có commit mới trong tương lai, AI chỉ cần đọc file này kết hợp với các commit kể từ `Last-Processed-Commit` để cập nhật tiếp mà **không cần đọc lại toàn bộ mã nguồn cũ**.
>
> **Quy ước cập nhật:** Tìm `<!-- NEW_PHASE_HOOK -->` để chèn giai đoạn mới. Cập nhật `Last-Processed-Commit` sau mỗi lần xử lý.

---

## 1. Metadata Quản lý Phiên bản

<!-- DEV_METADATA_START -->
- **Trạng thái:** Đang phát triển (Active)
- **Last-Processed-Commit:** `7f3b3e7`
- **Last-Updated:** 2026-09-19
- **Nhánh chính:** `main` / `master`
- **Node.js yêu cầu:** >= 18.x
- **Package Manager:** Yarn 1.x
<!-- DEV_METADATA_END -->

---

## 2. Tổng quan Dự án & Luồng Dữ liệu

### Bài toán giải quyết

Nền tảng quản lý và đặt tour du lịch trực tuyến, bao gồm:
- **Admin Panel** (`/admin/*`): Quản trị viên quản lý danh mục tour, tour, đơn hàng, tài khoản, cài đặt hệ thống.
- **Client Site** (`/*`): Người dùng xem danh sách tour, xem chi tiết, thêm vào giỏ hàng và đặt tour.

### Luồng dữ liệu tổng quát (Data Flow)

```
Browser / Client
     |
     |  HTTP Request (GET/POST/PATCH/DELETE)
     v
Express Router (routes/admin/ | routes/client/)
     |
     |  Middleware chain:
     |  +-- verifyToken (JWT cookie auth) -> chi ap dung cho /admin/*
     |  +-- upload.single() (Multer + Cloudinary) -> ap dung khi co file upload
     |  +-- validate middleware (Joi) -> kiem tra req.body
     v
Controller (controllers/admin/ | controllers/client/)
     |
     +-- Query / Mutation --> MongoDB Atlas (via Mongoose)
     |                          models/*.model.js
     |
     +-- Upload anh ---------> Cloudinary CDN
     |                          helpers/cloundinary.helper.js
     |
     +-- Gui mail OTP --------> Gmail SMTP (via Nodemailer)
                                helpers/mail.helper.js
     |
     v
res.render() -> Pug Template Engine (views/) -> HTML tra ve Browser
res.json()   -> JSON API Response (cho fetch() o Frontend JS)
```

---

## 3. Bản đồ Cấu trúc Thư mục (Directory Architecture)

```
project-5/
|
+-- index.js                        # Entry point: khoi tao Express, ket noi DB, dang ky router
|
+-- configs/
|   +-- database.config.js          # Ket noi MongoDB Atlas bang Mongoose
|   +-- variable.config.js          # Bien toan cuc (pathAdmin = 'admin')
|
+-- controllers/
|   +-- admin/
|   |   +-- account.controller.js   # Dang ky, dang nhap, OTP, doi mat khau
|   |   +-- category.controller.js  # CRUD danh muc tour (co soft-delete)
|   |   +-- dashboard.controller.js # Trang tong quan
|   |   +-- order.controller.js     # Quan ly don hang
|   |   +-- profile.controller.js   # Chinh sua ho so admin
|   |   +-- setting.controller.js   # Cai dat he thong, roles, website
|   |   +-- tour.controller.js      # Quan ly tour
|   |   +-- contact.controller.js   # Quan ly lien he
|   |   +-- user.controller.js      # Quan ly nguoi dung
|   +-- client/
|       +-- home.controller.js      # Trang chu client
|       +-- tour.controller.js      # Danh sach & chi tiet tour
|       +-- cart.controller.js      # Gio hang
|
+-- helpers/
|   +-- categoryTree.helper.js      # Thuat toan de quy xay dung cay danh muc phan cap
|   +-- cloundinary.helper.js       # Cau hinh CloudinaryStorage (multer-storage-cloudinary)
|   +-- generate.helper.js          # Sinh ma OTP ngau nhien
|   +-- mail.helper.js              # Gui email OTP qua Nodemailer + Gmail SMTP
|
+-- middlewares/
|   +-- admin/
|       +-- auth.middleware.js      # verifyToken: xac thuc JWT, gan res.locals.account
|
+-- models/
|   +-- accounts-admin.model.js     # Schema tai khoan Admin
|   +-- category.model.js           # Schema danh muc (slug auto, soft-delete, avatar)
|   +-- forgot-password.model.js    # Schema luu OTP quen mat khau
|   +-- tour.model.js               # Schema tour (dang mo rong)
|
+-- routes/
|   +-- admin/
|   |   +-- index.route.js          # Router goc /admin, ap dung verifyToken
|   |   +-- account.route.js        # /admin/account
|   |   +-- category.route.js       # /admin/category (CRUD + Cloudinary upload)
|   |   +-- [other routes...]
|   +-- client/
|       +-- index.route.js
|       +-- home.route.js
|       +-- tour.route.js
|       +-- cart.route.js
|
+-- validates/
|   +-- admin/
|       +-- account.validate.js     # Joi schema cho auth
|       +-- category.validate.js    # Joi schema cho category
|
+-- views/                          # Pug templates (SSR)
|   +-- admin/
|   |   +-- layouts/                # default.pug, account.pug
|   |   +-- mixins/                 # checkbox.pug, select-tree.pug
|   |   +-- pages/                  # Tat ca trang admin
|   |   +-- partials/               # header.pug, sider.pug
|   +-- client/
|       +-- layouts/ pages/ partials/
|
+-- public/
|   +-- admin/assets/
|   |   +-- css/style.css
|   |   +-- js/
|   |       +-- script.js           # JS chinh (FilePond, TinyMCE, JustValidate, fetch)
|   |       +-- account.js          # JS auth pages
|   |       +-- notyf.js            # Toast notification helper
|   +-- client/assets/
|
+-- .env                            # Bien moi truong (KHONG commit)
+-- .env.example                    # Mau bien moi truong
+-- package.json
```

---

## 4. Tech Stack & Thư viện Sử dụng (Dependencies Matrix)

### Backend (Server-side)

| Thư viện / Package | Phiên bản | Mục đích & Nghiệp vụ |
| :--- | :--- | :--- |
| `express` | `^5.2.1` | Framework HTTP chính. Routing, middleware, request/response cho Admin và Client. |
| `mongoose` | `^9.9.4` | ODM kết nối MongoDB Atlas. Schema, CRUD (find, save, updateOne...). |
| `pug` | `^3.0.4` | Template engine SSR. Render HTML từ controller truyền data xuống views. |
| `jsonwebtoken` | `^9.0.3` | Tạo/xác thực JWT token. Lưu vào Cookie để duy trì phiên đăng nhập Admin. |
| `bcryptjs` | `^3.0.3` | Hash mật khẩu khi đăng ký. So sánh bằng `bcrypt.compare()` khi đăng nhập. |
| `cookie-parser` | `^1.4.7` | Parse cookie từ request để lấy JWT token trong middleware `verifyToken`. |
| `dotenv` | `^17.4.2` | Nạp biến môi trường từ `.env` vào `process.env`. |
| `joi` | `^18.2.8` | Validate dữ liệu `req.body` phía Backend trước khi vào controller. |
| `multer` | `1.4.5-lts.1` | Xử lý multipart/form-data. **QUAN TRỌNG: phải dùng v1.4.x, v2.x không tương thích với multer-storage-cloudinary@4.** |
| `cloudinary` | `1.41.3` | SDK Cloudinary. **QUAN TRỌNG: phải dùng v1.x, v2.x không tương thích với multer-storage-cloudinary@4.** |
| `multer-storage-cloudinary` | `^4.0.0` | CloudinaryStorage Engine cho Multer. Upload stream ảnh, trả về `req.file.path` là URL online. |
| `nodemailer` | `^10.0.0` | Gửi email OTP qua Gmail SMTP khi admin quên mật khẩu. |
| `mongoose-slug-updater` | `^3.3.0` | Plugin tự động sinh `slug` từ `categoryName` qua `pre-save` hook. Không cần code trong controller. |
| `moment` | *(via yarn)* | Format ngày giờ trong danh sách (createdAt, updatedAt). |
| `slugify` | `^1.6.9` | Chuẩn hóa từ khóa tìm kiếm thành slug trước khi tạo regex query MongoDB. Dùng trong tìm kiếm Tour và Category. |
| `nodemon` | `^3.1.14` | Dev tool: tự restart server khi thay đổi file. |

### Frontend (Browser-side, CDN)

| Thư viện | Nguồn | Mục đích |
| :--- | :--- | :--- |
| **FilePond** | unpkg CDN | Upload ảnh có preview. Instance: `filePond[name]`, lấy file: `filePond.avatar?.getFile()?.file`. |
| **TinyMCE** | tiny.cloud CDN | WYSIWYG editor cho `description`. Lấy nội dung: `tinymce.get('description')?.getContent()`. |
| **JustValidate** | unpkg CDN | Validate form phía client. Dùng `.onSuccess()` callback thay cho `submit` event. |
| **Notyf** | jsdelivr CDN | Toast notification. `drawNotyf()` lưu `sessionStorage` để hiện sau `window.location.reload()`. |
| **SortableJS** | jsdelivr CDN | Kéo thả sắp xếp lịch trình tour. |
| **Chart.js** | jsdelivr CDN | Biểu đồ doanh thu Dashboard admin. |
| **Font Awesome 6** | cdnjs CDN | Icon set toàn bộ giao diện admin. |

---

## 5. Nhật ký Tính năng & Tiến trình Phát triển (Changelog by Phase)

---

### [Giai đoạn 1] – Khởi tạo & Setup Kiến trúc Core

- **Phạm vi Commit:** `f003b3d` → `ce56441`
- **Tính năng & Module hoàn thành:**
  - Khởi tạo project Express từ đầu (không dùng scaffolding).
  - Tích hợp Pug template engine, phục vụ static files từ `public/`.
  - Kết nối MongoDB Atlas qua Mongoose.
  - Tách cấu trúc MVC: `models/`, `controllers/`, `routes/`, `configs/`.
- **Ghi chú kỹ thuật:**
  - `pathAdmin` expose lên `global` (backend) và `app.locals` (Pug) từ `configs/variable.config.js`.

---

### [Giai đoạn 2] – Tích hợp Giao diện Tĩnh (Frontend Integration)

- **Phạm vi Commit:** `42a6e6c` → `298caeb`
- **Tính năng & Module hoàn thành:**
  - Client Site: header, footer, box-contact, Home, Tour List, Tour Detail, Cart.
  - Admin Panel: toàn bộ trang (Login, Register, OTP, Dashboard, Category, Tour, Order, User, Contact, Setting, Profile).
  - Đường dẫn Admin linh động qua biến `pathAdmin`.
- **Ghi chú kỹ thuật:**
  - Giai đoạn đổ HTML/CSS tĩnh vào Pug. Logic backend chưa nối.
  - Layout `default.pug` và `account.pug` tách riêng.

---

### [Giai đoạn 3] – Hệ thống Xác thực Admin (Authentication System)

- **Phạm vi Commit:** `bf4d3da` → `6d6f664`
- **Tính năng & Module hoàn thành:**
  - **Đăng ký:** Hash bcrypt, validate Joi, thông báo Notyf.
  - **Đăng nhập:** Xác thực email+password, tạo JWT, lưu Cookie.
  - **Đăng xuất:** Xóa cookie token.
  - **Ghi nhớ đăng nhập:** Cookie `maxAge` dài hạn.
  - **Quên mật khẩu → OTP:** Sinh OTP, gửi Gmail (Nodemailer), lưu `forgot-passwords` collection.
  - **Nhập OTP & Đổi mật khẩu:** Validate OTP, hash + cập nhật mật khẩu.
  - **Middleware `verifyToken`:** Bảo vệ tất cả `/admin/*` (trừ `/admin/account/*`). Gắn `res.locals.account`.
  - Hiển thị thông tin tài khoản admin trên header.
- **Ghi chú kỹ thuật:**
  - JWT payload: `{ id, email }`. Secret: `process.env.JWT_SECRET`.
  - `res.locals.account` là Mongoose Document – dùng `.id` (getter string) hoặc `._id`.

---

### [Giai đoạn 4] – Module Quản lý Danh mục (Category CRUD)

- **Phạm vi Commit:** `b93bfb2` → `2688575`
- **Tính năng & Module hoàn thành:**
  - **Tạo danh mục:** Validate FE (JustValidate) + BE (Joi). Upload: FilePond → Multer → Cloudinary → `req.file.path` → trường `avatar`.
  - **Tự động sinh slug:** `mongoose-slug-updater` plugin, config `slug: "categoryName"`.
  - **Danh mục cha phân cấp:** Helper đệ quy `categoryTree.helper.js` + Mixin Pug `select-tree.pug`.
  - **Hiển thị danh sách:** Join `accounts-admin`, format thời gian Moment.js.
  - **Sửa danh mục:** `if (req.file) { update avatar } else { delete req.body.avatar }` để giữ ảnh cũ.
  - **Xóa mềm:** `deleted: true`, `deletedBy`, `deletedAt`. Nút xóa: `[button-delete]` + `data-api` → `fetch PATCH`.
- **Ghi chú kỹ thuật:**
  - **Bộ 3 thư viện bắt buộc:** `multer@1.4.5-lts.1` + `cloudinary@1.41.3` + `multer-storage-cloudinary@4.0.0`.
  - Cloudinary 403: dùng Root API Key, đã Verify Email tài khoản.
  - `slug: null` duplicate key: config sai field nguồn. Đúng: `slug: "categoryName"`.
  - `script.js` là Browser JS – không dùng `require()` (VS Code auto-import nhầm → crash toàn bộ JS).
  - Selector JS `[button-delete]` phải khớp với attribute trong Pug.

<!-- NEW_PHASE_HOOK: AI chen Giai doan tiep theo ngay duoi dong nay khi cap nhat -->

---

### [Giai đoạn 5] – Module Quản lý Tour (Tour CRUD Full) & Bổ sung Category

- **Phạm vi Commit:** `2688575` → `7f3b3e7`
- **Tính năng & Module hoàn thành:**
  - **Giai đoạn 4 (bổ sung Category):** Lọc theo trạng thái, người tạo, ngày tạo (startDate/endDate `$gte/$lte`); tìm kiếm theo slug dùng `slugify` + `RegExp`; phân trang (`skip/limit/totalPages`); thay đổi trạng thái & xóa nhiều danh mục (`changeMultiPatch` với `updateMany()`).
  - **Tạo Tour:** Form đầy đủ giá vé (NL/TE/EB cả giá cũ/giá mới), số lượng vé, địa điểm (checkbox city), ngày khởi hành, lịch trình kéo thả (SortableJS + TinyMCE nhiều editor). Xử lý `JSON.parse` cho `loaction[]` và `schedule[]` từ FormData.
  - **Danh sách Tour:** Bộ lọc theo trạng thái, người tạo, ngày tạo, danh mục; tìm kiếm theo slug; phân trang. Join tên admin (`createdByName`, `updatedByName`), format thời gian Moment.
  - **Sửa Tour (`tour-edit`):** Load sẵn data cũ vào form, gán `departureDateFormat = moment(...).format('YYYY-MM-DD')` cho input date. Nếu không upload ảnh mới thì giữ nguyên avatar cũ (`delete req.body.avatar`).
  - **Xóa mềm Tour:** `PATCH /delete/:id` → `deleted:true`, `deletedBy`, `deletedAt`.
  - **Thùng rác Tour:** Hiển thị tour đã xóa, tìm kiếm, phân trang, sắp xếp theo `deletedAt`.
  - **Khôi phục Tour:** `PATCH /restore/:id` → `deleted:false`.
  - **Xóa vĩnh viễn Tour:** `PATCH /delete-destroy/:id` → `Tour.deleteOne()`.
  - **Hành động hàng loạt Tour (`changeMultiPatch`):** Nhận `{listId[], option}` → xử lý `active`, `inactive`, `delete`, `restore`, `delete-destroy` bằng `updateMany()`/`deleteMany()`.
- **Ghi chú kỹ thuật:**
  - `slugify` import riêng trong controller để chuẩn hóa keyword trước khi tạo `new RegExp(slug, "i")` query MongoDB.
  - `editPatch` phải kiểm tra `if (req.file)` trước khi gán `req.body.avatar` để tránh xóa ảnh cũ khi không upload mới.
  - Route `GET /edit/:id` **không cần** `upload.single()` — chỉ route `PATCH /edit/:id` mới cần middleware Multer.
  - `module.exports.editPatch` phải được export trong controller trước khi khai báo route, nếu không Express ném lỗi `argument handler must be a function`.
  - TinyMCE có thể chưa khởi tạo xong khi bấm submit → dùng `tinymce.get(id)?.getContent()` (optional chaining) để tránh crash JS ngầm khiến nút bị kẹt.

---

## 6. Hướng dẫn Chạy & Cấu hình Môi trường

### Biến môi trường (`.env`)

```env
# MongoDB Atlas
DATABASE="mongodb+srv://<username>:<password>@cluster0.lvqcog2.mongodb.net/<database_name>?retryWrites=true&w=majority"

# JWT
JWT_SECRET="your_secret_key_here"

# Cloudinary (lay tu console.cloudinary.com -> Settings -> API Keys -> Root environment)
CLOUDINARY_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_root_api_key"
CLOUDINARY_API_SECRET="your_root_api_secret"

# Gmail SMTP (tao App Password 16 ky tu tai myaccount.google.com/apppasswords)
GMAIL_USER="your_email@gmail.com"
GMAIL_PASS="xxxx xxxx xxxx xxxx"
```

### Cài đặt & Chạy

```bash
yarn install
cp .env.example .env
# Dien bien moi truong vao .env
yarn start

# Client:  http://localhost:3000
# Admin:   http://localhost:3000/admin/account/login
```

---

## 7. Kiến trúc Xác thực (Authentication Flow)

```
POST /admin/account/login
  |
  +-- Joi validate -> req.body { email, password }
  +-- bcrypt.compare(password, hashedPassword)
  +-- jwt.sign({ id, email }, JWT_SECRET, { expiresIn })
  +-- res.cookie('token', jwt, { httpOnly: true, maxAge })

GET/POST /admin/* (cac request tiep theo)
  |
  +-- middleware verifyToken
       +-- req.cookies.token -> jwt.verify() -> { id, email }
       +-- AccountAdmin.findOne({ _id: id, email, status: 'active' })
       +-- res.locals.account = existAccount
       +-- next()
```

---

## 8. Các Điểm Kỹ thuật Quan trọng (Known Issues & Gotchas)

| Vấn đề | Nguyên nhân | Giải pháp đã áp dụng |
| :--- | :--- | :--- |
| `multer` v2 + `cloudinary` v2 lỗi 500 | Không tương thích với `multer-storage-cloudinary@4` | Dùng `multer@1.4.5-lts.1` + `cloudinary@1.41.3` |
| Cloudinary lỗi 403 | Dùng sub-API Key hoặc chưa Verify Email tài khoản | Dùng Root API Key, xác nhận email Cloudinary |
| `require()` crash toàn bộ JS | VS Code auto-import `require()` vào Browser JS file | Xóa dòng `require()` khỏi `script.js` |
| `E11000 duplicate key {slug: null}` | Config `slug: "name"` thay vì `slug: "categoryName"` | Đổi đúng tên field, xóa documents `slug:null` cũ trong DB |
| `tinymce.get('description')` null | TinyMCE chưa load hoặc bị AdBlock chặn | `tinymce.get('description')?.getContent()` |
| `req.file` undefined dù đã chọn file | `filePond.avatar?.files?.[0]` crash khi `files` undefined | `filePond.avatar?.getFile()?.file \|\| null` |
| Avatar bị xóa khi edit không upload ảnh | `req.body.avatar = ""` ghi đè DB | `if (req.file) {...} else { delete req.body.avatar }` |
| Nút xóa không có phản hồi | Selector JS không khớp Pug hoặc `require()` crash script | Dùng `[button-delete]` nhất quán, xóa `require()` sai |
