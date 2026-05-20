# Tech Stack — InventoryPro

A quick reference for every tool and technology used in this project, and why it was chosen.

---

## Backend

### Spring Boot 3.2
The application framework. Handles HTTP routing, dependency injection, lifecycle management, and auto-configuration. Version 3.x requires Java 17+ and brings native support for Jakarta EE 10 namespaces.

### Java 21
LTS release used for this project. Key feature in use: records (clean DTOs without Lombok boilerplate in some places). Java 21 also brings virtual threads (Project Loom) — not yet enabled here, but supported by Spring Boot 3.2 out of the box.

### Maven
Build tool. Manages dependencies via `pom.xml`, handles compilation, packaging, and the Spring Boot fat-jar creation used in Docker.

### Spring Security 6
Handles the entire security filter chain. Configured to be stateless (no sessions). Every request goes through `JwtAuthFilter` before reaching any controller. Method-level security via `@PreAuthorize` enforces role checks.

### JWT — jjwt 0.12
JSON Web Tokens for stateless authentication. Two tokens issued on login:
- **Access token** — short-lived (15 min), stored in memory on the client
- **Refresh token** — long-lived (7 days), stored in `httpOnly` cookie

`jjwt` is the standard Java library for JWT creation, signing, and validation. Version 0.12 uses the builder pattern with HMAC-SHA256 signing.

### BCrypt (strength 12)
Password hashing algorithm. Spring Security's `BCryptPasswordEncoder` hashes passwords before storage. Strength 12 means 2^12 = 4096 hash rounds — slow enough to resist brute force, fast enough for normal login latency.

### Spring Data JPA + Hibernate 6
ORM layer. `JpaRepository` interfaces provide standard CRUD operations without writing SQL. Hibernate is the JPA implementation — it generates and executes the actual SQL. Custom queries written using JPQL or the `Specification` API for dynamic filtering.

### Pessimistic Locking
`LockModeType.PESSIMISTIC_WRITE` used in `OrderService` when reading a product's stock before deducting. Issues `SELECT ... FOR UPDATE` at the DB level — locks the row so no other transaction can read or write it until the current one commits. Prevents overselling under concurrent load.

### `@Transactional`
Spring's transaction management annotation on `OrderService.create()`. Ensures stock deduction and order record creation happen atomically — either both succeed and commit, or both fail and roll back. No partial state ever persists.

### MySQL 8.0
Relational database. Chosen for strong ACID compliance, support for `SELECT ... FOR UPDATE` (required for pessimistic locking), and wide production adoption. InnoDB storage engine handles all tables.

### Flyway
Database migration tool. Schema changes are written as versioned SQL files (`V1__init.sql`, `V2__seed_data.sql`, etc.) in `db/migration/`. Flyway runs these in order on startup and tracks which have been applied. `ddl-auto: validate` is set — Hibernate only checks the schema, never modifies it. Safe for production.

### Springdoc OpenAPI (Swagger UI)
Auto-generates API documentation from Spring MVC annotations. Accessible at `/swagger-ui.html`. Lets you explore and test all endpoints interactively without a separate tool.

### Spring Boot Actuator
Exposes operational endpoints like `/actuator/health` — used by Docker Compose health checks to know when the backend is ready to accept traffic.

---

## Frontend

### React 18
UI library. Component-based architecture. Uses the new concurrent rendering features available in v18. All state managed with `useState` / `useContext` — no external state library.

### Vite
Frontend build tool and dev server. Replaces Create React App. Significantly faster cold starts and HMR (Hot Module Replacement) due to native ES module handling. Produces optimized static assets for production.

### React Router v6
Client-side routing. `PrivateRoute` wraps protected pages and checks `AuthContext` before rendering — redirects to login if unauthenticated or if the user's role doesn't have access.

### Axios
HTTP client for API calls. A shared `axiosConfig.js` instance attaches the `Authorization: Bearer <token>` header to every outgoing request via an interceptor. A response interceptor catches `401` responses and automatically calls `/auth/refresh` before retrying the original request.

### Recharts
React charting library built on D3. Used on the dashboard for the sales line chart and top products bar chart. Chosen for clean React integration (components, not imperative D3 calls).

### AuthContext
React Context that holds the current user, their roles, and the access token in memory (never in `localStorage`). Provides `login()` and `logout()` functions consumed by any component that needs auth state.

---

## Infrastructure

### Docker
Containerizes each service (MySQL, Spring Boot backend, React/Nginx frontend) into isolated, reproducible environments. Each service has its own `Dockerfile`.

### Docker Compose
Orchestrates all three containers locally with a single `docker compose up -d --build`. Handles networking between containers (backend talks to MySQL via the internal Docker network, not `localhost`), volume mounts for MySQL data persistence, and health checks.

### Nginx
Serves the compiled React static files in production (inside the frontend container). Also acts as a reverse proxy — forwards `/api/**` requests to the backend container, avoiding CORS issues in the deployed setup.

---

## Patterns & Concepts

| Pattern | Where used | Why |
|---|---|---|
| DTO (Data Transfer Object) | All controller inputs/outputs | Decouples API contract from DB schema. Prevents over-posting. |
| Soft delete | `Product.status = INACTIVE` | Preserves order history. You can always see what was ordered. |
| Repository pattern | `JpaRepository` interfaces | Abstracts DB access. Services never write raw SQL. |
| Global exception handling | `@ControllerAdvice` | All errors return a consistent JSON shape with HTTP status codes. |
| Role-based access control | `@PreAuthorize` on controllers | Fine-grained permissions per endpoint, not just per route. |
| Stateless auth | JWT, no server sessions | Horizontally scalable — any backend instance can validate any token. |
| Environment-based config | `application-dev.yml` / `application-prod.yml` | Different DB URLs, logging levels, and mail settings per environment. |
