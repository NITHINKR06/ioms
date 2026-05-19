# 📦 InventoryPro — Inventory & Order Management System

A full-stack, production-grade Inventory and Order Management System built with Spring Boot 3, MySQL, and React 18.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 21, Maven |
| Security | Spring Security 6, JWT (jjwt 0.12) |
| Database | MySQL 8.0, Flyway migrations |
| ORM | Spring Data JPA, Hibernate 6 |
| Frontend | React 18, Vite, React Router v6 |
| Charts | Recharts |
| Containerization | Docker, Docker Compose, Nginx |
| API Docs | Springdoc OpenAPI (Swagger UI) |

---

## ✨ Features

- [x] JWT authentication with role-based access (Admin / Manager / Staff)
- [x] Full product CRUD with SKU auto-generation and soft delete
- [x] Stock movement tracking (in / out / adjustment / return) with pessimistic locking
- [x] Order lifecycle management (Pending → Confirmed → Processing → Shipped → Delivered)
- [x] Automatic stock deduction on order creation with transactional rollback
- [x] Stock restoration on order cancellation
- [x] Dashboard with KPIs, sales charts, and top products
- [x] Customer and Supplier management
- [x] Pagination, filtering, and search on all list endpoints
- [x] Flyway database migrations with seed data
- [x] Global exception handling with consistent JSON error responses
- [x] Docker Compose full-stack deployment

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (recommended on Windows; WSL2 backend)
- (For local dev without Docker) Java 21, Maven, Node 20, MySQL 8

### One-Command Docker Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd <repo-folder>

# 2. (Optional) Copy and configure env (.env is recommended)
cp .env.example .env

# Windows PowerShell alternative:
# Copy-Item .env.example .env
# Windows CMD alternative:
# copy .env.example .env

# 3. Start everything
docker compose up -d --build

# 4. Wait ~60 seconds for MySQL + backend to start
docker compose logs -f backend
```

Visit:
- **App**: http://localhost:3000
- **API Swagger**: http://localhost:8080/swagger-ui.html
- **Backend Health**: http://localhost:8080/actuator/health
- **phpMyAdmin** (optional): `docker compose --profile tools up -d phpmyadmin` → http://localhost:8081

To reset everything (including the database volume):

```bash
docker compose down -v
```

### Local Development (without Docker)

```bash
# Start MySQL (or use Docker for just MySQL)
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

## 🔐 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Admin — full access |
| manager | Manager@123 | Manager — create/edit/reports |
| staff | Staff@123 | Staff — view and create orders |

> Click any credential row on the login page to auto-fill.

---

## 📡 API Endpoints

All endpoints prefixed with `/api/v1/`. Full interactive docs at `/swagger-ui.html`.

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /auth/login | Public |
| POST | /auth/register | Public |
| POST | /auth/refresh | Public |
| POST | /auth/logout | Public |
| GET | /products | Auth |
| POST | /products | Admin/Manager |
| GET | /orders | Auth |
| POST | /orders | Auth |
| PUT | /orders/{id}/status | Admin/Manager |
| GET | /stock/movements | Auth |
| POST | /stock/movement | Admin/Manager |
| GET | /dashboard/stats | Auth |

---

## 🏗 Project Structure

```
ioms/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/inventory/
│   │   ├── config/             # Security, JWT, OpenAPI config
│   │   ├── controller/         # REST controllers
│   │   ├── service/            # Business logic
│   │   ├── repository/         # Spring Data JPA repos
│   │   ├── entity/             # JPA entities + enums
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── security/           # JWT filter + provider
│   │   └── exception/          # Global exception handler
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/       # Flyway SQL migrations
├── frontend/                   # React application
│   └── src/
│       ├── api/                # Axios config + API calls
│       ├── context/            # AuthContext
│       ├── components/         # Layout, Sidebar
│       └── pages/              # All page components
├── docker-compose.yml
└── .env.example
```

---

## 🔑 Key Design Decisions

**JWT (stateless auth)** — No server-side session storage. Scales horizontally.

**Pessimistic locking on stock** — `SELECT ... FOR UPDATE` prevents race conditions when multiple orders are placed simultaneously for the same product.

**@Transactional on OrderService.create()** — Stock deduction and order creation happen atomically. If stock deduction fails, the order is rolled back entirely.

**Flyway migrations** — Schema versioned in SQL files. Never auto-create in production. Safe to run repeatedly.

**DTO pattern** — Entities never exposed directly in API responses. Prevents over-posting, hides internal structure.

**Soft delete on products** — Setting status=INACTIVE rather than DELETE preserves order history integrity.

---

## 📈 Resume Talking Points

- Implemented JWT authentication with BCrypt-12 password hashing and role-based access control
- Used pessimistic locking (LockModeType.PESSIMISTIC_WRITE) to prevent stock race conditions
- Built transactional order processing with automatic stock deduction and rollback on failure
- Designed RESTful APIs with consistent response envelopes and RFC-compliant error responses
- Containerized with Docker Compose (MySQL + Spring Boot + React/Nginx) for one-command deployment
- Applied Flyway database migrations for reproducible, versioned schema management

---

## 📄 License
No license file is included yet. Add a `LICENSE` file (e.g., MIT) if you plan to share or reuse this code publicly.
