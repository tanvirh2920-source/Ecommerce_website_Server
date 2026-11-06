# Daily Bazar — Backend Server

REST API for **Daily Bazar**, a full-stack Bangladeshi e-commerce platform. Built with Node.js and Express, backed by PostgreSQL. Handles auth (OTP + JWT), products with Cloudinary image storage, SSLCommerz payment, order lifecycle, 7-day return system, newsletter, and contact messages.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v5 |
| Database | PostgreSQL (`pg`) |
| Authentication | JWT (HTTP-only cookie) + OTP email |
| Password Hashing | Bcrypt |
| Image Storage | Cloudinary |
| Payment Gateway | SSLCommerz (`sslcommerz-lts`) |
| Email | Nodemailer |
| File Upload | express-fileupload |
| AI Search | Google Gemini API |
| Config | dotenv |

---

## Features

### Auth
- OTP-based email verification on registration (6-digit, 10-min expiry)
- Resend OTP support
- JWT sent as HTTP-only cookie, prevents email enumeration on forgot password
- Secure password reset via tokenized email link (SHA-256 hashed token in DB)
- Profile update with local avatar upload
- BD phone validation (`/^01[3-9]\d{8}$/`)

### Products
- Full CRUD (Admin only for create/update/delete)
- Multi-image upload to Cloudinary with selective deletion on update
- Filters: availability (in/limited/out-of-stock), price range, category (ILIKE), rating threshold, full-text search
- Pagination with configurable `limit` and `page`
- Response includes `newProducts` (last 30 days) and `topRatedProducts` (ratings ≥ 4.5)
- Reviews: only users with a paid order for that product can review; average rating auto-recalculated on post/delete
- Newsletter subscribers notified by email when a discount is added or changed (fire-and-forget)

### AI Search
- Endpoint: `POST /api/v1/products/ai-search`
- Keyword pre-filter fetches up to 100 candidate products from PostgreSQL
- Gemini does semantic re-ranking on the candidates
- Falls back to keyword results if Gemini is unavailable

### Orders
- Supports **SSLCommerz** (online) and **Cash on Delivery**
- Order total: `subtotal + 5% tax + ৳100 shipping` (free shipping over ৳5000)
- Stock deducted at payment confirmation (online) or at delivery mark (COD)
- Status flow: `Processing → Shipped → Delivered → (Returned | Cancelled)`
- On `Cancelled`: restores stock + marks payment `Refunded` (online paid) or `Cancelled` (COD pending)
- On `Delivered` for COD: marks payment `Paid`, sets `paid_at`, deducts stock
- IDOR protection: users can only fetch their own orders

### Payments (SSLCommerz)
- Initiates session, saves `tran_id` as `payment_intent_id`
- Callbacks: `success` (validates `val_id` with SSLCommerz API — never fails open), `fail`, `cancel`, `ipn`
- Idempotent success handler — skips re-processing already-paid transactions

### Returns
- 7-day return window from `paid_at` (falls back to `created_at`)
- One return request per order, only for `Delivered` orders
- Approval runs a PostgreSQL transaction: sets order → `Returned`, payment → `Refunded`, restores stock; rolls back on error

### Newsletter
- Public subscribe endpoint (email dedup)
- Admin: view all subscribers

### Contact
- Auth-required; submitted email must match `req.user.email`
- Admin: list, mark as read, delete messages

---

## API Reference

### Auth — `/api/v1/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register + send OTP |
| POST | `/register/verify-otp` | — | Verify OTP, issue JWT |
| POST | `/register/resend-otp` | — | Resend OTP |
| POST | `/login` | — | Login, issue JWT |
| GET | `/me` | User | Get current user |
| GET | `/logout` | User | Clear JWT cookie |
| POST | `/password/forgot` | — | Send reset email |
| PUT | `/password/reset/:token` | — | Reset password |
| PUT | `/password/update` | User | Change password |
| PUT | `/profile/update` | User | Update name/email/phone/avatar |

### Products — `/api/v1/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List products (filters + pagination) |
| GET | `/singleProduct/:id` | — | Product detail with reviews |
| POST | `/admin/create` | Admin | Create product (multipart) |
| PUT | `/admin/update/:id` | Admin | Update product (multipart) |
| DELETE | `/admin/delete/:id` | Admin | Delete product + Cloudinary images |
| PUT | `/post-new/review/:id` | User | Post or update review |
| DELETE | `/delete/review/:id` | User | Delete own review |
| POST | `/ai-search` | User | Gemini AI semantic search |

### Orders — `/api/v1/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/new` | User | Place order (Online or COD) |
| GET | `/me` | User | Fetch own orders |
| GET | `/:orderId` | User | Fetch single order (IDOR-safe) |
| GET | `/admin/getall` | Admin | All orders |
| PUT | `/admin/update/:orderId` | Admin | Update order status |
| DELETE | `/admin/delete/:orderId` | Admin | Delete order |

### Payments — `/api/v1/payment`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/initiate` | User | Start SSLCommerz session |
| POST/GET | `/success` | — | Payment success callback |
| POST/GET | `/fail` | — | Payment fail callback |
| POST/GET | `/cancel` | — | Payment cancel callback |
| POST | `/ipn` | — | Instant Payment Notification |

### Returns — `/api/v1/returns`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/:orderId` | User | Submit return request |
| GET | `/my/requests` | User | Own return requests |
| GET | `/admin/all` | Admin | All return requests |
| PUT | `/admin/:returnId` | Admin | Approve or reject return |

### Admin — `/api/v1/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/getallusers` | Admin | Paginated user list |
| DELETE | `/deleteuser/:id` | Admin | Delete user + Cloudinary avatar |
| GET | `/fetch/dashboard-stats` | Admin | Full analytics payload |
| GET | `/fetch/report?from=&to=` | Admin | Date-range report |

### Newsletter — `/api/v1/newsletter`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/subscribe` | — | Subscribe email |
| GET | `/subscribers` | Admin | List all subscribers |

### Contact — `/api/v1/contact`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/submit` | User | Submit contact message |
| GET | `/admin/all` | Admin | All messages |
| PUT | `/admin/:messageId/read` | Admin | Mark as read |
| DELETE | `/admin/:messageId` | Admin | Delete message |

---

## Project Structure

```
Server/
├── config/           # cloudinaryConfig.js, config.env (gitignored)
├── controllers/      # authController, productController, orderControllers
│                     # paymentController, adminController, returnController
│                     # newsletterController, contactController
├── database/         # db.js (PostgreSQL pool)
├── middlewares/      # authMiddlewares (isAuthenticated, authorizeRoles)
│                     # errorMiddlewares, catchAsyncError
├── models/           # newsletterTable.js (table creation)
├── router/           # one file per resource
├── utils/            # createTables, jwtToken, generatePaymentUrl
│                     # generateResetPasswordToken, sendemail
│                     # getAIRecommendation, email templates
├── uploads/          # temp files (gitignored)
├── app.js            # Express setup, route mounting
└── server.js         # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (local or hosted, e.g. Neon / Supabase / Railway)

### Installation

```bash
cd "ECommerce(SERVER)/Server"
npm install
npm run dev        # nodemon server.js
```

Server runs at `http://localhost:5000`

### Environment Variables

Create `config/config.env`:

```env
# Server
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
DASHBOARD_URL=http://localhost:5174

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true      # false for production

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

---

## Database Tables

Tables are auto-created on server startup via `createTables()`:

| Table | Description |
|---|---|
| `users` | Registered users with OTP, reset token, role, avatar |
| `products` | Products with JSONB images, sizes, discount_price, ratings |
| `reviews` | Per-product user reviews |
| `orders` | Order header with status, total, tax, shipping, paid_at |
| `order_items` | Line items with title, image, size, price snapshot |
| `shipping_info` | Delivery address per order |
| `payments` | Payment record with type, status, transaction ID |
| `return_requests` | Return requests with 7-day window enforcement |
| `contact_messages` | User contact form submissions |
| `newsletter_subscribers` | Email subscribers |

---

## Related Repositories

- 🌐 [Client (Frontend)](../../E-Commerce\(CLIENT\)/Client/README.md)
- 📊 [Admin Dashboard](../../ECommerce\(Dashboard\)/ecommerce-dashboard-template/README.md)
