# 🏢 Grazia Formisano — Enterprise Business Directory & Booking Platform

![Architecture Banner](./assets/banner.jpg)

<p align="center">
  <a href="https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-15dd4458-11a6-4cca-891b-8c596fed6157" target="_blank">
    <img src="https://run.pstmn.io/button.svg" alt="View in Postman" />
  </a>
  <a href="https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-15dd4458-11a6-4cca-891b-8c596fed6157" target="_blank">
    <img src="https://img.shields.io/badge/Postman-Instant_Live_API_Docs-FF6C37?style=for-the-badge&logo=postman&logoColor=white" alt="Live API Documentation" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare_R2" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT_Auth" />
  
</p>

---

## 📌 Executive Overview

Grazia Formisano is an enterprise-grade directory and consultation scheduling platform. Engineered with a scalable clean architecture, it features business profile management, dynamic category filtering, calendar booking slots, Stripe payment checkout, and high-performance digital asset storage via Cloudflare R2 / S3.

---

## 🚀 Key Architectural Highlights

- **Consultation Scheduling**: Timezone-aware booking engine with real-time slot availability validation.
- **Cloud Asset Storage**: High-speed multipart uploads and image optimization via Cloudflare R2.
- **Stripe Payment Gateway**: Secure checkout sessions, refund management, and automated webhook reconciliation.
- **Type-Safe Persistence**: Prisma ORM schema indexing and transaction isolation.
- **Security First**: Role-based access control (Admin, Business Owner, Client), bcrypt password hashing, and Zod input validation.

---

## 📬 API Documentation & Interactive Postman Collection

The complete REST API specification is published in our public Postman showcase workspace:

* 🌐 **Instant Live API Documentation**: [Explore graziaformisano_backend in Postman (Instant Web View)](https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-15dd4458-11a6-4cca-891b-8c596fed6157)
* 📁 **Local Postman File**: [`docs/postman_collection.json`](./docs/postman_collection.json) (import directly into Postman Desktop or Newman CLI).

### Core Endpoint Modules

| Module | Base Route | Key Capabilities |
|---|---|---|
| **Authentication** | `/api/v1/auth` | User signup, login, password recovery, JWT token refresh |
| **Business Profiles** | `/api/v1/business` | Create, update, and discover verified business listings |
| **Appointments** | `/api/v1/booking` | Reserve consultation slots, cancel/reschedule, calendar sync |
| **Payments** | `/api/v1/payment` | Stripe checkout session creation and webhook listener |
| **Reviews & Ratings** | `/api/v1/review` | Customer feedback, verified star ratings, and moderation |
| **Uploads** | `/api/v1/upload` | Direct multipart asset uploads to Cloudflare R2 |

---

## 📂 Project Architecture

```plaintext
graziaformisano_backend/
├── assets/
│   └── banner.*                 # Project architecture visual banner
├── docs/
│   └── postman_collection.json  # Full Postman API collection v2.1
├── src/
│   ├── app/
│   │   ├── middlewares/         # Global error handlers, auth & validation guards
│   │   ├── modules/             # Domain-driven feature modules
│   │   └── routes/              # Centralized route aggregator
│   ├── config/                  # Environment & external service configurations
│   └── server.ts                # Application bootstrapper & HTTP server
├── prisma/
│   └── schema.prisma            # Database schema definition
├── .env.example                 # Sanitized environment template
├── package.json
└── tsconfig.json
```

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **Database**: MongoDB or PostgreSQL (as specified in `schema.prisma`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shahjalal-labs/graziaformisano_backend.git
cd graziaformisano_backend
npm install
```

### 2. Environment Configuration
Copy the provided `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 👨‍💻 Engineering & Authorship

Developed and maintained by **Md. Shahjalal**.

* **GitHub**: [@shahjalal-labs](https://github.com/shahjalal-labs)
* **Email**: [muhommodshahjalal@gmail.com](mailto:muhommodshahjalal@gmail.com)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
