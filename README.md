# Travel Tour Booking 🌍

> ⭐ If you find this project helpful, please consider giving it a Star to show your support! 🙏😊

**🔗 Live Demo:** **[https://project-5-bw06.onrender.com](https://project-5-bw06.onrender.com)**

A full-stack online travel tour booking web application built with **Node.js + Express + MongoDB + Pug**, featuring integrated online payment gateways via **ZaloPay** and **VNPAY**.

---

## 📑 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quickstart](#-quickstart)
- [Environment Variables](#-environment-variables)
- [Payment Integration](#-payment-integration)
- [Admin Panel](#-admin-panel)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [License](#-license)
- [Contacts](#️-contacts)

---

## 🚀 About

**Travel Tour Booking** is a comprehensive travel management and booking web application, featuring:

- **Client-Side**: Modern user interface for browsing, filtering, searching, and booking tours.
- **Admin Panel**: Robust dashboard with granular Role-Based Access Control (RBAC).
- **Payment Gateways**: Direct sandbox integration with ZaloPay and VNPAY.
- **Email Notifications**: Automated booking confirmations sent via Gmail / Nodemailer.
- **Cloud Media Storage**: Image upload and asset management powered by Cloudinary.

---

## ✨ Features

### 👤 Client-Side
- Browse tour catalog, filter by categories and destinations
- Search tours by keywords
- Detailed tour information (image galleries, itinerary, pricing, descriptions)
- Shopping cart management and order tracking
- Multiple checkout and payment options

### 🔐 Admin Panel
- **Dashboard**: Revenue overview, monthly statistics charts, and latest orders
- **Tours**: Full CRUD operations, image uploads, soft deletes, and trash bin recovery
- **Categories**: Hierarchical category tree management
- **Orders**: View, update order status, and track payment transactions
- **Promotions**: Create and manage discount codes and promotional vouchers
- **Accounts**: Administrator account management and password reset
- **Roles & Permissions**: Granular permission matrix configuration
- **Website Settings**: Update site metadata, contact info, and branding
- **Contacts**: Review customer inquiries and feedback messages

### 💳 Payment Methods
- **Cash on Delivery (COD)** — Pay upon tour start
- **ZaloPay** — Sandbox gateway (App ID: `2554`)
- **VNPAY** — Sandbox payment gateway
- **Bank Transfer**

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js v24+ |
| **Framework** | Express.js v5 |
| **Database** | MongoDB + Mongoose |
| **Template Engine** | Pug |
| **Authentication** | JWT + Cookie |
| **Password Hashing** | bcryptjs |
| **Media Upload** | Multer + Cloudinary |
| **Email Service** | Nodemailer (Gmail) |
| **Payment Gateways** | ZaloPay API, VNPAY API |
| **Validation** | Joi |
| **Date Utility** | Moment.js |
| **Deployment** | Render.com |
| **Development** | nodemon |

---

## 📂 Project Structure

```
project-5/
├── configs/          # Database & third-party configurations
├── controllers/
│   ├── admin/        # 10 Admin controllers
│   └── client/       # 7 Client controllers
├── middlewares/
│   ├── admin/        # Auth & permission middlewares
│   └── client/       # Site settings & category middlewares
├── models/           # 10 Mongoose schemas & models
├── routes/
│   ├── admin/        # 11 Admin route modules
│   └── client/       # 8 Client route modules
├── views/
│   ├── admin/        # Admin Pug templates
│   └── client/       # Client Pug templates
├── public/           # Static assets (CSS, JS, images)
├── helpers/          # Utility functions & helpers
├── validates/        # Joi validation schemas
├── .env              # Environment variables (DO NOT COMMIT)
├── .env.example      # Environment variables template
└── index.js          # Application entry point
```

---

## ⚡ Quickstart

### 1. Clone repository
```bash
git clone https://github.com/Hieuit04/project-5.git
cd project-5
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Setup environment variables
```bash
cp .env.example .env
# Open .env and fill in your actual credentials
```

### 4. Run application
```bash
yarn start
```

- **Local Client**: http://localhost:3000
- **Local Admin**: http://localhost:3000/admin
- **Live Demo**: https://project-5-bw06.onrender.com
- **Admin Demo Credentials**: `admin@gmail.com` | `Admin@123`

---

## 🔐 Environment Variables

```env
DATABASE="mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>"
JWT_SECRET="your_jwt_secret"
GMAIL_USER="your_email@gmail.com"
GMAIL_PASS="xxxx xxxx xxxx xxxx"
CLOUDINARY_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
ZALOPAY_APPID="2554"
ZALOPAY_KEY1="your_key1"
ZALOPAY_KEY2="your_key2"
ZALOPAY_ENDPOINT="https://sb-openapi.zalopay.vn/v2/create"
VNPAY_TMNCODE="your_tmncode"
VNPAY_SECRET_KEY="your_secret_key"
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
DOMAIN_WEBSITE="https://project-5-bw06.onrender.com"
```

---

## 💳 Payment Integration

### ZaloPay
- Sandbox Portal: https://developers.zalopay.vn | App ID: `2554`
- Webhook Callback: `POST /order/payment-zalopay-callback`

### VNPAY
- Sandbox Portal: https://sandbox.vnpayment.vn
- Return URL: `GET /order/payment-vnpay-result`
- For local testing, tunnel your port with **ngrok**: `ngrok http 3000`

---

## 🖥 Admin Panel

| Environment | URL |
|---|---|
| **Local** | http://localhost:3000/admin |
| **Live Demo** | https://project-5-bw06.onrender.com/admin |

> 🔑 **Demo Admin Account for Recruiters / Reviewers:**
> - **Email:** `admin@gmail.com`
> - **Password:** `Admin@123`

| Module | Permission Key |
|---|---|
| Dashboard | `dashboard-view` |
| Tours | `tour-view/create/edit/delete/trash-*` |
| Categories | `category-view/create/edit/delete` |
| Orders | `order-view/edit/delete` |
| Promotions | `promotion-view/create/edit/delete` |
| Accounts | `account-admin-*` |
| Roles | `role-list-view/create/edit/delete` |
| Website Settings | `website-info-view/edit` |
| Contacts | `contact-view/delete` |

---

## 🗺 API Routes

### Client Routes
| Method | Path | Description |
|---|---|---|
| GET | `/` | Home page |
| GET | `/tour` | Tour catalog |
| GET | `/tour/:slug` | Tour details |
| GET | `/category/:slug` | Tours by category |
| GET | `/search` | Search tours |
| GET/POST | `/cart` | Shopping cart |
| POST | `/order/create` | Create booking order |
| POST | `/order/payment-zalopay` | Initialize ZaloPay payment |
| POST | `/order/payment-zalopay-callback` | ZaloPay callback IPN |
| GET | `/order/payment-vnpay` | Initialize VNPAY payment |
| GET | `/order/payment-vnpay-result` | VNPAY result handler |
| GET/POST | `/contact` | Contact page & message submission |

### Admin Routes (Prefix: `/admin`)
| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Dashboard overview |
| GET/POST/PATCH/DELETE | `/tour` | Manage tours (CRUD) |
| GET/POST/PATCH/DELETE | `/category` | Manage categories (CRUD) |
| GET/PATCH | `/order` | Manage orders |
| GET/POST/PATCH/DELETE | `/promotion` | Manage promotions & coupons |
| GET/PATCH | `/blog` | Review, edit, publish & delete AI blog posts |
| GET/POST/PATCH/DELETE | `/account` | Manage admin accounts |
| GET/POST/PATCH/DELETE | `/role` | Manage roles & permissions |
| GET/POST | `/setting` | Website general settings |
| GET | `/contact` | View contact messages |
| GET/POST | `/profile` | Admin profile & settings |

---

## 📝 AI Blog Automation

`blog_automation/generate_blog.py` uses an LLM (Anthropic API) to write an informative travel guide (history, best time to visit, day-by-day itinerary, food, cost tables, tips, FAQ) for each active tour that has no post yet. It inserts the tour's own images and saves the post to the `blogs` collection with status `pending`. A manager reviews it in the admin page **Quản lý bài viết** (`/admin/blog/list`): edit, save as draft, approve & publish, or delete. Only published posts (`active`) are shown at `/blog`. Permissions: `blog-view`, `blog-edit`, `blog-publish`, `blog-delete`.

```bash
python3 -m venv .venv && .venv/bin/pip install -r blog_automation/requirements.txt
# add ANTHROPIC_API_KEY to .env
.venv/bin/python blog_automation/generate_blog.py               # up to 5 tours without a post
.venv/bin/python blog_automation/generate_blog.py --slug <tour-slug> --dry-run   # preview, no save
.venv/bin/python blog_automation/test_generate_blog.py          # helper tests
```

Run it on a schedule (e.g. cron) to keep the blog filled automatically.

---

## 💰 Competitor Price Scraper

`price_scraper/scrape_prices.py` collects tour prices from Vietravel, PYS Travel, Vietnam Booking, BenThanh Tourist, TUGO, Hanoitourist (requests + BeautifulSoup) and Saigontourist (Selenium, headless Chrome downloaded automatically). Each tour is upserted into the `competitor_prices` collection by `source + url` with name, destination, departure city, duration (days/nights), departure date, price, original price, seats left and `scraped_at`. It waits 2.5 s between requests; run it once a day.

```bash
.venv/bin/pip install -r price_scraper/requirements.txt
.venv/bin/python price_scraper/scrape_prices.py                 # all sources, saves to MongoDB
.venv/bin/python price_scraper/scrape_prices.py --sources pys,tugo --max-pages 2 --dry-run   # writes competitor_prices.json
.venv/bin/python price_scraper/test_scrape_prices.py            # helper tests
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📃 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## 🗨️ Contacts

- **Email**: hieu15904@gmail.com
- **GitHub**: [https://github.com/Hieuit04](https://github.com/Hieuit04)
