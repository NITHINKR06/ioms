<div align="center">

<img src="https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
<img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

<br /><br />

# 📦 InventoryPro

### Production-grade Inventory & Order Management System

*Spring Boot 3 · Java 21 · MySQL 8 · React 18 · Docker*

</div>

---

## Overview

InventoryPro is a full-stack, production-ready inventory and order management system. It handles the complete product lifecycle — from stock tracking with race-condition-safe pessimistic locking, to multi-step order management with transactional rollback, all secured behind JWT-based RBAC.

Built to demonstrate real-world backend engineering: not just CRUD, but atomic transactions, concurrency control, soft deletes, database migrations, and containerized deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Java 21, Maven |
| Security | Spring Security 6, JWT (jjwt 0.12), BCrypt-12 |
| ORM | Spring Data JPA, Hibernate 6 |
| Database | MySQL 8.0, Flyway migrations |
| Frontend | React 18, Vite, React Router v6 |
| Charts | Recharts |
| API Docs | Springdoc OpenAPI (Swagger UI) |
| Containerization | Docker, Docker Compose, Nginx |

---

## Features

### 🔐 Authentication & Authorization
- JWT with short-lived access tokens (15 min) + refresh tokens (7 days)
- Access token stored in memory; refresh token in `httpOnly` cookie
- Role-based access control: **Admin / Manager / Staff**
- `@PreAuthorize` guards on all sensitive endpoints

### 📦 Product Management
- Full CRUD with auto-generated SKUs (`PRD-001`, `PRD-002`, ...)
- Soft delete — sets `status=INACTIVE` to preserve order history integrity
- Category and supplier linking
- Pagination, filtering, and search on all list endpoints

### 🔄 Stock Tracking
- Movement types: `STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, `RETURN`
- **Pessimistic locking** (`SELECT ... FOR UPDATE`) — prevents race conditions when concurrent orders hit the same product
- Before/after quantity snapshots on every movement
- Reference numbers link movements back to orders

### 🛒 Order Lifecycle
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                              ↕
                                          CANCELLED
```
- `@Transactional` on order creation — stock deduction and order record are atomic
- Stock automatically restored on cancellation
- Payment status tracking: `UNPAID / PAID / PARTIAL / REFUNDED`

### 📊 Dashboard
- KPI cards: total products, orders today, revenue, low-stock count
- Sales charts (Recharts) by day/week/month
- Top 5 best-selling products

### 👥 Customer & Supplier Management
- Customer types: `RETAIL / WHOLESALE`
- Supplier status tracking with product linkage

---

## Quick Start

### Prerequisites

- Docker Desktop (WSL2 backend recommended on Windows)
- *Or* for local dev: Java 21, Maven, Node 20, MySQL 8

### One-Command Docker Start

```bash
# Clone
git clone https://github.com/NITHINKR06/ioms.git
cd ioms

# Configure env
cp .env.example .env

# Start everything
docker compose up -d --build

# Tail backend logs (wait ~60s for MySQL + backend init)
docker compose logs -f backend
```

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health check | http://localhost:8080/actuator/health |
| phpMyAdmin *(optional)* | `docker compose --profile tools up -d phpmyadmin` → http://localhost:8081 |

To reset everything including the DB volume:
```bash
docker compose down -v
```

### Local Dev (without Docker)

```bash
# Start only MySQL via Docker
docker compose up -d mysql

# Backend
cd backend
mvn spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Default Credentials

> Click any credential row on the login page to auto-fill.

| Username | Password | Role |
|---|---|---|
| `admin` | `Admin@123` | Admin — full access |
| `manager` | `Manager@123` | Manager — create/edit/reports |
| `staff` | `Staff@123` | Staff — view and create orders |

> If these fail, try `password` for each account (seed data fallback).

---

## API Reference

All endpoints are prefixed with `/api/v1/`. Full interactive docs at `/swagger-ui.html`.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Login → returns JWT |
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/refresh` | Public | Refresh access token |
| `POST` | `/auth/logout` | Auth | Invalidate token |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Auth | List all (paginated, filterable) |
| `GET` | `/products/{id}` | Auth | Get by ID |
| `GET` | `/products/low-stock` | Admin/Manager | Below reorder level |
| `POST` | `/products` | Admin/Manager | Create product |
| `PUT` | `/products/{id}` | Admin/Manager | Update product |
| `DELETE` | `/products/{id}` | Admin | Soft delete |

### Stock
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stock/movements` | Auth | All movements (paginated) |
| `POST` | `/stock/movement` | Admin/Manager | Record movement |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/orders` | Auth | List all (paginated) |
| `GET` | `/orders/{id}` | Auth | Order detail |
| `POST` | `/orders` | Auth | Create order |
| `PUT` | `/orders/{id}/status` | Admin/Manager | Update status |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/dashboard/stats` | Auth |

---

## Project Structure

```
ioms/
├── backend/
│   └── src/main/java/com/inventory/
│       ├── config/          # Security, JWT, OpenAPI, CORS
│       ├── controller/      # REST controllers
│       ├── service/         # Business logic
│       ├── repository/      # Spring Data JPA repos
│       ├── entity/          # JPA entities + enums
│       ├── dto/             # Request/Response DTOs
│       ├── security/        # JWT filter + provider
│       └── exception/       # Global exception handler (@ControllerAdvice)
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/    # Flyway SQL migrations + seed data
│
├── frontend/
│   └── src/
│       ├── api/             # Axios config + API calls
│       ├── context/         # AuthContext
│       ├── components/      # Layout, Sidebar, PrivateRoute
│       └── pages/           # Dashboard, Products, Orders, Stock, etc.
│
├── docker-compose.yml
└── .env.example
```

---

## Role Permissions

| Feature | Admin | Manager | Staff |
|---|:---:|:---:|:---:|
| View products/orders | ✅ | ✅ | ✅ |
| Create orders | ✅ | ✅ | ✅ |
| Create/edit products | ✅ | ✅ | ❌ |
| Update order status | ✅ | ✅ | ❌ |
| Stock movements | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ |
| Delete products | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |

---

## Key Design Decisions

**Pessimistic locking on stock**
`LockModeType.PESSIMISTIC_WRITE` on the product row during order creation. Prevents overselling when concurrent requests hit the same product simultaneously.

**Atomic order creation**
`@Transactional` on `OrderService.create()` — stock deduction and order record write happen in a single transaction. If anything fails, both roll back. No partial state.

**Soft deletes on products**
Setting `status=INACTIVE` instead of `DELETE FROM`. Preserves referential integrity on historical orders — you can always see what was ordered, even if the product no longer exists.

**Flyway migrations**
Schema versioned in SQL files under `db/migration/`. `ddl-auto: validate` in production — Hibernate never auto-creates or alters tables. Safe, repeatable, and auditable.

**DTO pattern**
Entities are never returned directly from API responses. Separate `Request` and `Response` DTOs prevent over-posting attacks and decouple the API contract from the database schema.

**JWT stateless auth**
No server-side session storage. Scales horizontally — any instance can validate any token using the shared secret.

---

## Environment Variables

```bash
# .env (copy from .env.example)
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_min_32_chars
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
```

---

## License

No license file included. Add a `LICENSE` file (e.g. MIT) before sharing or reusing publicly.
