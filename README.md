# 🌐 Grazia Formisano — Professional Networking, Event Hosting & 24h Multimedia Story Social API

![Architecture Banner](./assets/banner.svg)

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
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Social_Network-8B5CF6?style=for-the-badge&logo=users&logoColor=white" alt="Social_Network" />
  
</p>

---

## 📌 Executive Overview

**Grazia Formisano Backend** is an enterprise social networking and event hosting platform engine. Engineered with **Node.js, TypeScript, Express, Prisma ORM, and Stripe**, the platform powers professional communities: rich career profile curation, skills verification, **conference and meetup event hosting with agendas and RSVP ticketing**, **ephemeral 24-hour multimedia Stories (video/image/text)**, public and private feed posts with comment threads, bi-directional follow relationships, 1-on-1 and event group chat rooms, and premium Stripe membership tiers.

---

## 🚀 Key Architectural & Domain Capabilities

- **Event Hosting & Agenda Coordination**: Create conferences and meetups with timezone-aware agendas, venue geolocations, capacity caps, and attendee RSVPs.
- **Ephemeral 24h Story Engine**: Ephemeral video, image, and text stories with view tracking, like counters, and automated expiration.
- **Professional Networking & Followers**: Skill endorsements, career bios, company affiliations, and follower/following graph relationships.
- **Multimedia Feed & Engagement**: Rich media posts with nested comments, replies, like reactions, and privacy visibility toggles.
- **Stripe Subscription Billing**: Monetized membership tiers (Free, Pro, VIP) with automated renewal webhooks and access guards.

---

## 📬 API Documentation & Interactive Postman Collection

The complete REST API specification is published in our public Postman showcase workspace:

* 🌐 **Instant Live API Documentation**: [Explore graziaformisano_backend in Postman (Instant Web View)](https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-15dd4458-11a6-4cca-891b-8c596fed6157)
* 📁 **Local Postman File**: [`docs/postman_collection.json`](./docs/postman_collection.json) (ready for Postman Desktop or Newman CLI).

### Core Endpoint Modules

| Module | Base Route | Key Capabilities |
|---|---|---|
| **Authentication** | `/api/v1/auth` | User registration, Apple/Google sign-in, JWT rotation |
| **Profiles & Skills** | `/api/v1/userProfile` | Career profession, bio, company, verified skills, profile photos |
| **Events & RSVPs** | `/api/v1/event` | Event creation, agenda items, geolocation, attendee ticketing |
| **Ephemeral Stories** | `/api/v1/story` | Upload 24h stories (video/image/text), track views, like reactions |
| **Posts & Threads** | `/api/v1/post` | Feed publications, multimedia attachments, comments and replies |
| **Networking Graph** | `/api/v1/follower` | Follow/unfollow connections, follower lists, network discovery |
| **Chat & Rooms** | `/api/v1/room` | 1-on-1 private messaging and event attendee group discussions |

---

## 📂 Project Architecture

```plaintext
graziaformisano_backend/
├── assets/
│   └── banner.svg               # Architectural visual banner
├── docs/
│   └── postman_collection.json  # Full Postman API collection v2.1
├── src/
│   ├── app/
│   │   ├── middlewares/         # Global error handlers, auth & validation guards
│   │   ├── modules/             # Domain feature modules
│   │   └── routes/              # Centralized route registration
│   ├── config/                  # Environment & external service configurations
│   └── server.ts                # Application bootstrapper
├── prisma/
│   └── schema.prisma            # Prisma database schema definition
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

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 👨‍💻 Engineering & Authorship

Developed and engineered by **Md. Shahjalal**.

* **GitHub**: [@shahjalal-labs](https://github.com/shahjalal-labs)
* **Email**: [muhommodshahjalal@gmail.com](mailto:muhommodshahjalal@gmail.com)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
