# Tech Reference — InventoryPro

Quick lookup: every tool/technology used, what it does here, and exactly which file(s) it lives in.

---

## Backend

---

### Spring Boot 3.2
Core application framework. Auto-configures the web server, dependency injection, and all Spring integrations.

```
backend/src/main/java/com/inventory/InventoryApplication.java   ← entry point (@SpringBootApplication)
backend/src/main/resources/application.yml                       ← all app config (DB, JWT, mail, JPA)
backend/src/main/resources/application-dev.yml                   ← dev overrides
backend/src/main/resources/application-prod.yml                  ← prod overrides
```

---

### Spring Security 6
Secures all HTTP endpoints. Configures the filter chain, sets which routes are public vs protected, and integrates the JWT filter.

```
backend/src/main/java/com/inventory/config/SecurityConfig.java
```

Key things in this file:
- `http.authorizeHttpRequests(...)` — defines public routes (`/api/auth/**`) vs authenticated routes
- Registers `JwtAuthFilter` into the filter chain
- Disables CSRF (stateless JWT API doesn't need it)
- Sets `SessionCreationPolicy.STATELESS`

---

### JWT — jjwt 0.12
Generates and validates JSON Web Tokens for stateless auth.

```
backend/src/main/java/com/inventory/security/JwtTokenProvider.java   ← generate + validate tokens
backend/src/main/java/com/inventory/security/JwtAuthFilter.java       ← OncePerRequestFilter, reads Bearer token from headers
backend/src/main/java/com/inventory/config/JwtConfig.java             ← secret + expiry config (from application.yml)
```

Flow:
1. `JwtAuthFilter` intercepts every request, reads `Authorization: Bearer <token>`
2. Passes to `JwtTokenProvider.validateToken()`
3. On success, sets `SecurityContextHolder` with the user's identity + roles

---

### Spring Data JPA + Hibernate 6
ORM layer. All DB operations go through repository interfaces — no raw SQL except Flyway migrations.

```
backend/src/main/java/com/inventory/entity/          ← all @Entity classes
backend/src/main/java/com/inventory/repository/      ← all JpaRepository interfaces
```

Entity files:
| File | Table |
|---|---|
| `User.java` | `users` |
| `Role.java` | `roles` |
| `Category.java` | `categories` |
| `Supplier.java` | `suppliers` |
| `Product.java` | `products` |
| `StockMovement.java` | `stock_movements` |
| `Customer.java` | `customers` |
| `Order.java` | `orders` |
| `OrderItem.java` | `order_items` |
| `AuditLog.java` | `audit_logs` |

Pessimistic locking (used in `OrderService` to prevent stock race conditions):
```java
// ProductRepository.java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
Optional<Product> findByIdWithLock(@Param("id") Long id);
```

---

### Flyway
Database migration tool. Versions the schema in SQL files. Spring Boot auto-runs them on startup.

```
backend/src/main/resources/db/migration/
  V1__create_tables.sql      ← initial schema
  V2__seed_data.sql          ← default users + roles
```

Config in `application.yml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate   # never auto-create; Flyway owns the schema
  flyway:
    enabled: true
```

---

### BCrypt (Spring Security Crypto)
Password hashing. Used at register time and verified at login.

```
backend/src/main/java/com/inventory/service/AuthService.java
```

```java
// AuthService.java
passwordEncoder.encode(request.getPassword())      // on register
passwordEncoder.matches(password, user.getPassword()) // on login
```

BCrypt work factor is 12 — set in `SecurityConfig.java`:
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

---

### @Transactional
Ensures stock deduction + order creation happen atomically. If anything fails mid-way, both roll back.

```
backend/src/main/java/com/inventory/service/OrderService.java   ← @Transactional on create()
backend/src/main/java/com/inventory/service/StockService.java   ← @Transactional on movement recording
```

```java
// OrderService.java
@Transactional
public OrderResponse create(OrderRequest request) {
    // 1. Lock product row (pessimistic)
    // 2. Check stock availability
    // 3. Deduct stock
    // 4. Create order record
    // 5. If any step throws → entire TX rolls back
}
```

---

### Spring MVC (REST Controllers)
Handles all HTTP routing. Each controller maps to a domain area.

```
backend/src/main/java/com/inventory/controller/
  AuthController.java        ← /api/v1/auth/**
  ProductController.java     ← /api/v1/products/**
  StockController.java       ← /api/v1/stock/**
  OrderController.java       ← /api/v1/orders/**
  CustomerController.java    ← /api/v1/customers/**
  SupplierController.java    ← /api/v1/suppliers/**
  DashboardController.java   ← /api/v1/dashboard/**
  UserController.java        ← /api/v1/users/**
```

Role-based endpoint protection:
```java
// ProductController.java
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@PostMapping
public ResponseEntity<ProductResponse> create(@RequestBody ProductRequest request) { ... }
```

---

### DTO Pattern
Entities are never returned directly. Separate request/response objects decouple the API from the DB schema.

```
backend/src/main/java/com/inventory/dto/
  request/
    LoginRequest.java
    RegisterRequest.java
    ProductRequest.java
    OrderRequest.java
    StockMovementRequest.java
  response/
    AuthResponse.java          ← JWT token + user info
    ProductResponse.java
    OrderResponse.java
    DashboardStatsResponse.java
```

---

### Global Exception Handler
Single `@ControllerAdvice` catches all exceptions and returns consistent JSON error responses.

```
backend/src/main/java/com/inventory/exception/GlobalExceptionHandler.java
backend/src/main/java/com/inventory/exception/ResourceNotFoundException.java
backend/src/main/java/com/inventory/exception/InsufficientStockException.java
backend/src/main/java/com/inventory/exception/UnauthorizedException.java
```

Every error response follows the same envelope:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 42",
  "timestamp": "2024-05-18T10:30:00"
}
```

---

### Springdoc OpenAPI (Swagger UI)
Auto-generates interactive API docs from controller annotations.

```
backend/src/main/java/com/inventory/config/OpenApiConfig.java   ← sets title, version, JWT auth scheme
```

Accessible at: `http://localhost:8080/swagger-ui.html`

---

### Spring Boot Actuator
Exposes health + metrics endpoints. Used by Docker healthcheck.

```
backend/src/main/resources/application.yml
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
```

Used in `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
```

---

### CORS Config
Allows the React dev server (`localhost:5173`) and production frontend (`localhost:3000`) to call the API.

```
backend/src/main/java/com/inventory/config/CorsConfig.java
```

In Docker, `CORS_ORIGINS` env var is passed in:
```yaml
# docker-compose.yml
CORS_ORIGINS: http://localhost:3000,http://localhost:5173
```

---

### JavaMailSender (Spring Mail)
Sends low-stock alert emails on a daily schedule.

```
backend/src/main/java/com/inventory/config/MailConfig.java
backend/src/main/java/com/inventory/service/AlertService.java     ← @Scheduled cron job
backend/src/main/java/com/inventory/util/EmailTemplates.java      ← HTML email templates
```

Cron schedule in `application.yml`:
```yaml
app:
  low-stock:
    alert-enabled: true
    cron: "0 0 8 * * *"   # runs daily at 8AM
```

---

## Frontend

---

### React 18 + Vite
UI framework. Vite replaces CRA for fast dev builds.

```
frontend/src/main.jsx          ← ReactDOM.createRoot entry
frontend/src/App.jsx           ← route definitions (React Router v6)
frontend/vite.config.js        ← dev server proxy config
frontend/package.json          ← all frontend dependencies
```

---

### React Router v6
Client-side routing between pages.

```
frontend/src/App.jsx                              ← all <Route> definitions
frontend/src/components/layout/PrivateRoute.jsx   ← role-based route guard
```

`PrivateRoute` checks `AuthContext` — redirects to login if unauthenticated, or shows 403 if role insufficient.

---

### Axios + Interceptors
HTTP client. A single configured instance attaches the JWT to every request and handles 401 auto-refresh.

```
frontend/src/api/axiosConfig.js    ← base URL, request interceptor (attaches Bearer token), response interceptor (catches 401, calls /refresh, retries)
frontend/src/api/authApi.js        ← login, register, refresh, logout
frontend/src/api/productApi.js     ← product CRUD
frontend/src/api/orderApi.js       ← order CRUD + status updates
frontend/src/api/dashboardApi.js   ← stats + chart data
```

---

### AuthContext
Global auth state. Stores the current user, access token, and roles. Consumed by `PrivateRoute` and all pages.

```
frontend/src/context/AuthContext.jsx
```

Provides: `user`, `token`, `login()`, `logout()`, `hasRole()`

---

### Recharts
Data visualization library. Used on the dashboard for sales trends and KPI charts.

```
frontend/src/pages/DashboardPage.jsx
```

Components used: `<LineChart>`, `<BarChart>`, `<XAxis>`, `<YAxis>`, `<Tooltip>`, `<ResponsiveContainer>`

---

### Page Components

```
frontend/src/pages/
  LoginPage.jsx                       ← login form, credential auto-fill
  DashboardPage.jsx                   ← KPI cards + Recharts sales chart + top products table
  products/
    ProductListPage.jsx               ← searchable/filterable product table, low-stock badge
    ProductFormPage.jsx               ← create/edit product modal
    ProductDetailPage.jsx             ← single product + stock movement history
  orders/
    OrderListPage.jsx                 ← order list with status color badges
    OrderFormPage.jsx                 ← create order with product picker + qty
    OrderDetailPage.jsx               ← order summary + status update dropdown
  stock/
    StockMovementPage.jsx             ← movement history table + stock-in/out form
  suppliers/
    SupplierPage.jsx                  ← supplier CRUD
  customers/
    CustomerPage.jsx                  ← customer CRUD
```

---

### Common Components

```
frontend/src/components/
  layout/
    Sidebar.jsx       ← nav links, role-aware (hides restricted items)
    Navbar.jsx        ← top bar, user info, logout
    PrivateRoute.jsx  ← auth + role guard wrapper
  common/
    Table.jsx         ← reusable paginated table
    Modal.jsx         ← reusable modal wrapper
    Badge.jsx         ← status/stock level badges (color by value)
    StatsCard.jsx     ← KPI card used on dashboard
```

---

## Infrastructure

---

### Docker + Docker Compose
Containerizes all three services. Single `docker compose up` starts everything.

```
docker-compose.yml                 ← service definitions
backend/Dockerfile                 ← multi-stage: Maven build → JRE runtime image
frontend/Dockerfile                ← Node build → Nginx static serving
```

Service dependency order:
```
mysql (healthcheck: mysqladmin ping)
  → backend (healthcheck: /actuator/health)
    → frontend
```

`phpmyadmin` is in a separate `tools` profile — opt-in only:
```bash
docker compose --profile tools up -d phpmyadmin
```

---

### Nginx
Serves the React build in production. Also acts as a reverse proxy — forwards `/api` calls to the backend container so the frontend doesn't need to know the backend URL.

```
frontend/Dockerfile     ← copies build output into nginx:alpine image
```

---

### Flyway (repeated for infra context)
On every `docker compose up`, Spring Boot runs Flyway migrations before the app starts serving requests. New migration files are picked up automatically.

```
backend/src/main/resources/db/migration/   ← V1__, V2__, ... files
```

---

## Maven Dependencies (pom.xml)

| Dependency | What it provides |
|---|---|
| `spring-boot-starter-web` | REST controllers, embedded Tomcat |
| `spring-boot-starter-security` | Filter chain, RBAC, BCrypt |
| `spring-boot-starter-data-jpa` | JPA repos, Hibernate ORM |
| `spring-boot-starter-mail` | JavaMailSender for email alerts |
| `spring-boot-starter-validation` | `@Valid`, `@NotBlank`, etc. on DTOs |
| `spring-boot-starter-actuator` | `/actuator/health` endpoint |
| `mysql-connector-j` | MySQL JDBC driver |
| `flyway-mysql` | DB migrations |
| `io.jsonwebtoken:jjwt-api/impl/jackson 0.12` | JWT generation + validation |
| `org.projectlombok:lombok` | `@Data`, `@Builder`, `@RequiredArgsConstructor` |
| `springdoc-openapi-starter-webmvc-ui` | Swagger UI auto-generation |

---

## NPM Dependencies (package.json)

| Package | What it provides |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom v6` | Client-side routing |
| `axios` | HTTP client with interceptors |
| `recharts` | Dashboard charts |
| `vite` | Build tool + dev server |
