# Inventory & Order Management System
### Spring Boot + MySQL + JWT + React

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Spring Boot 3.x |
| Security | Spring Security + JWT (jjwt) |
| ORM | Spring Data JPA + Hibernate |
| Database | MySQL 8 |
| Mail | Spring Mail (JavaMailSender) |
| PDF Reports | iText 7 |
| Frontend | React 18 + Axios + React Router v6 |
| Charts | Recharts |
| Build | Maven (backend) + Vite (frontend) |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
inventory-order-system/
│
├── backend/                          # Spring Boot app
│   ├── src/main/java/com/inventory/
│   │   │
│   │   ├── InventoryApplication.java
│   │   │
│   │   ├── config/
│   │   │   ├── SecurityConfig.java         # Spring Security + JWT filter chain
│   │   │   ├── JwtConfig.java              # JWT secret, expiry config
│   │   │   ├── CorsConfig.java             # Allow React dev server
│   │   │   └── MailConfig.java             # JavaMailSender config
│   │   │
│   │   ├── entity/                         # JPA Entities (see Entity Design below)
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   ├── Category.java
│   │   │   ├── Supplier.java
│   │   │   ├── Product.java
│   │   │   ├── StockMovement.java
│   │   │   ├── Customer.java
│   │   │   ├── Order.java
│   │   │   ├── OrderItem.java
│   │   │   └── AuditLog.java
│   │   │
│   │   ├── repository/                     # Spring Data JPA Repositories
│   │   │   ├── UserRepository.java
│   │   │   ├── CategoryRepository.java
│   │   │   ├── SupplierRepository.java
│   │   │   ├── ProductRepository.java
│   │   │   ├── StockMovementRepository.java
│   │   │   ├── CustomerRepository.java
│   │   │   ├── OrderRepository.java
│   │   │   └── AuditLogRepository.java
│   │   │
│   │   ├── service/
│   │   │   ├── AuthService.java            # Login, register, token refresh
│   │   │   ├── UserService.java
│   │   │   ├── CategoryService.java
│   │   │   ├── SupplierService.java
│   │   │   ├── ProductService.java         # Stock check, low stock alert
│   │   │   ├── StockService.java           # Stock in/out movements
│   │   │   ├── OrderService.java           # Create order, update status
│   │   │   ├── CustomerService.java
│   │   │   ├── ReportService.java          # PDF + CSV generation
│   │   │   └── AlertService.java           # Low stock email alerts
│   │   │
│   │   ├── controller/
│   │   │   ├── AuthController.java         # /api/auth/**
│   │   │   ├── UserController.java         # /api/users/**
│   │   │   ├── CategoryController.java     # /api/categories/**
│   │   │   ├── SupplierController.java     # /api/suppliers/**
│   │   │   ├── ProductController.java      # /api/products/**
│   │   │   ├── StockController.java        # /api/stock/**
│   │   │   ├── OrderController.java        # /api/orders/**
│   │   │   ├── CustomerController.java     # /api/customers/**
│   │   │   ├── ReportController.java       # /api/reports/**
│   │   │   └── DashboardController.java    # /api/dashboard/stats
│   │   │
│   │   ├── dto/                            # Request/Response DTOs
│   │   │   ├── request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── ProductRequest.java
│   │   │   │   ├── OrderRequest.java
│   │   │   │   └── StockMovementRequest.java
│   │   │   └── response/
│   │   │       ├── AuthResponse.java       # JWT token + user info
│   │   │       ├── ProductResponse.java
│   │   │       ├── OrderResponse.java
│   │   │       └── DashboardStatsResponse.java
│   │   │
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java       # Generate + validate JWT
│   │   │   ├── JwtAuthFilter.java          # OncePerRequestFilter
│   │   │   └── CustomUserDetailsService.java
│   │   │
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java # @ControllerAdvice
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── InsufficientStockException.java
│   │   │   └── UnauthorizedException.java
│   │   │
│   │   └── util/
│   │       ├── PdfGenerator.java           # iText PDF reports
│   │       └── EmailTemplates.java         # HTML email templates
│   │
│   ├── src/main/resources/
│   │   ├── application.yml                 # DB, JWT, mail config
│   │   ├── application-dev.yml
│   │   └── application-prod.yml
│   │
│   └── pom.xml
│
├── frontend/                         # React app (Vite)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                         # Routes
│   │   │
│   │   ├── api/                            # Axios instances + API calls
│   │   │   ├── axiosConfig.js              # Base URL, JWT interceptor
│   │   │   ├── authApi.js
│   │   │   ├── productApi.js
│   │   │   ├── orderApi.js
│   │   │   └── dashboardApi.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Global auth state
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── PrivateRoute.jsx        # Role-based guard
│   │   │   └── common/
│   │   │       ├── Table.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Badge.jsx               # Status badge
│   │   │       └── StatsCard.jsx
│   │   │
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx           # KPI cards + charts
│   │       ├── products/
│   │       │   ├── ProductListPage.jsx
│   │       │   ├── ProductFormPage.jsx
│   │       │   └── ProductDetailPage.jsx
│   │       ├── orders/
│   │       │   ├── OrderListPage.jsx
│   │       │   ├── OrderFormPage.jsx
│   │       │   └── OrderDetailPage.jsx
│   │       ├── stock/
│   │       │   └── StockMovementPage.jsx
│   │       ├── suppliers/
│   │       │   └── SupplierPage.jsx
│   │       ├── customers/
│   │       │   └── CustomerPage.jsx
│   │       └── reports/
│   │           └── ReportsPage.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml                # MySQL + backend + frontend
└── README.md
```

---

## Entity Design & Relationships

### 1. User & Role (Auth)

```java
// Role.java
@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue
    private Long id;

    @Enumerated(EnumType.STRING)
    private RoleName name;  // ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF
}

// User.java
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;  // BCrypt hashed

    private String fullName;
    private boolean enabled = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;
}
```

### 2. Category

```java
@Entity
@Table(name = "categories")
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @OneToMany(mappedBy = "category")
    private List<Product> products;
}
```

### 3. Supplier

```java
@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String contactPerson;
    private String email;
    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    private SupplierStatus status;  // ACTIVE, INACTIVE

    @OneToMany(mappedBy = "supplier")
    private List<Product> products;

    @CreatedDate
    private LocalDateTime createdAt;
}
```

### 4. Product (Core Entity)

```java
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku;              // e.g. PRD-001

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(nullable = false)
    private Integer quantityInStock;

    @Column(nullable = false)
    private Integer reorderLevel;    // triggers low stock alert

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;    // ACTIVE, INACTIVE, DISCONTINUED

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @OneToMany(mappedBy = "product")
    private List<StockMovement> stockMovements;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### 5. StockMovement

```java
@Entity
@Table(name = "stock_movements")
public class StockMovement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    private MovementType type;      // STOCK_IN, STOCK_OUT, ADJUSTMENT, RETURN

    @Column(nullable = false)
    private Integer quantity;

    private Integer quantityBefore;
    private Integer quantityAfter;

    private String referenceNo;     // linked order ID or manual reference
    private String notes;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreatedDate
    private LocalDateTime createdAt;
}
```

### 6. Customer

```java
@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    private CustomerType type;      // RETAIL, WHOLESALE

    @OneToMany(mappedBy = "customer")
    private List<Order> orders;

    @CreatedDate
    private LocalDateTime createdAt;
}
```

### 7. Order

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderNumber;     // e.g. ORD-20240518-001

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    // PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount;

    @Column(precision = 10, scale = 2)
    private BigDecimal tax;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;  // UNPAID, PAID, PARTIAL, REFUNDED

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;  // CASH, CARD, UPI, BANK_TRANSFER

    private String shippingAddress;
    private String notes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### 8. OrderItem

```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;   // price at time of order (snapshot)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;  // quantity * unitPrice
}
```

### 9. AuditLog

```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;          // CREATE_ORDER, UPDATE_STOCK, DELETE_PRODUCT
    private String entityType;      // Order, Product, User
    private Long entityId;
    private String details;         // JSON string of what changed
    private String ipAddress;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User performedBy;

    @CreatedDate
    private LocalDateTime timestamp;
}
```

---

## Database Schema (ER Summary)

```
users ──────────────── user_roles ──── roles
  │
  ├── creates ──────── orders ─────── order_items ─── products
  │                       │                                │
  │                    customers                       categories
  │                                                        │
  ├── records ──── stock_movements ── products ─── suppliers
  │
  └── generates ── audit_logs
```

---

## REST API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login → returns JWT |
| POST | /api/auth/refresh | Public | Refresh access token |
| POST | /api/auth/logout | Auth | Invalidate token |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/products | Auth | List all (paginated, filterable) |
| GET | /api/products/{id} | Auth | Get by ID |
| GET | /api/products/low-stock | ADMIN/MANAGER | Products below reorder level |
| POST | /api/products | ADMIN/MANAGER | Create product |
| PUT | /api/products/{id} | ADMIN/MANAGER | Update product |
| DELETE | /api/products/{id} | ADMIN | Soft delete |

### Stock
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/stock/movements | Auth | All movements (paginated) |
| GET | /api/stock/movements/{productId} | Auth | Movements for a product |
| POST | /api/stock/in | ADMIN/MANAGER | Record stock in |
| POST | /api/stock/out | ADMIN/MANAGER | Record stock out |
| POST | /api/stock/adjust | ADMIN | Manual adjustment |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/orders | Auth | List all orders (paginated) |
| GET | /api/orders/{id} | Auth | Get order detail |
| POST | /api/orders | Auth | Create new order |
| PUT | /api/orders/{id}/status | ADMIN/MANAGER | Update order status |
| PUT | /api/orders/{id}/payment | ADMIN/MANAGER | Update payment status |
| DELETE | /api/orders/{id} | ADMIN | Cancel order |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/dashboard/stats | Auth | KPI summary |
| GET | /api/dashboard/sales-chart | Auth | Sales by day/week/month |
| GET | /api/dashboard/top-products | Auth | Best selling products |

### Reports
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/reports/inventory/pdf | ADMIN/MANAGER | PDF inventory report |
| GET | /api/reports/sales/pdf | ADMIN/MANAGER | PDF sales report |
| GET | /api/reports/orders/csv | ADMIN/MANAGER | CSV order export |

---

## JWT Auth Flow

```
1. POST /api/auth/login  { username, password }
        ↓
2. Spring Security authenticates via CustomUserDetailsService
        ↓
3. JwtTokenProvider generates:
   - accessToken  (expires: 15 min)
   - refreshToken (expires: 7 days, stored in DB)
        ↓
4. Client stores accessToken in memory, refreshToken in httpOnly cookie
        ↓
5. Every request: Authorization: Bearer <accessToken>
        ↓
6. JwtAuthFilter validates token → sets SecurityContext
        ↓
7. On 401 → client calls /api/auth/refresh → new accessToken issued
```

---

## Role Permissions Matrix

| Feature | ADMIN | MANAGER | STAFF |
|---------|-------|---------|-------|
| View products | ✅ | ✅ | ✅ |
| Create/Edit products | ✅ | ✅ | ❌ |
| Delete products | ✅ | ❌ | ❌ |
| Create orders | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ❌ |
| Stock movements | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |

---

## application.yml

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/inventory_db
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate.dialect: org.hibernate.dialect.MySQL8Dialect
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties.mail.smtp.starttls.enable: true

app:
  jwt:
    secret: ${JWT_SECRET}
    access-token-expiry: 900000      # 15 min
    refresh-token-expiry: 604800000  # 7 days
  low-stock:
    alert-enabled: true
    cron: "0 0 8 * * *"             # daily 8AM check
```

---

## pom.xml Dependencies

```xml
<!-- Spring Boot Starters -->
<dependency>spring-boot-starter-web</dependency>
<dependency>spring-boot-starter-security</dependency>
<dependency>spring-boot-starter-data-jpa</dependency>
<dependency>spring-boot-starter-mail</dependency>
<dependency>spring-boot-starter-validation</dependency>

<!-- MySQL -->
<dependency>mysql-connector-j</dependency>

<!-- JWT -->
<dependency>io.jsonwebtoken:jjwt-api:0.12.3</dependency>
<dependency>io.jsonwebtoken:jjwt-impl:0.12.3</dependency>
<dependency>io.jsonwebtoken:jjwt-jackson:0.12.3</dependency>

<!-- PDF Generation -->
<dependency>com.itextpdf:itext7-core:7.2.5</dependency>

<!-- Lombok -->
<dependency>org.projectlombok:lombok</dependency>

<!-- OpenCSV for CSV export -->
<dependency>com.opencsv:opencsv:5.8</dependency>
```

---

## React Frontend Structure

```
AuthContext  →  stores user, token, roles
     ↓
PrivateRoute  →  checks auth + role before rendering page
     ↓
axiosConfig  →  attaches Bearer token to every request
              →  intercepts 401, calls /refresh, retries
```

### Key React Pages

| Page | Features |
|------|----------|
| Dashboard | KPI cards (total products, orders, revenue, low stock count), sales line chart (Recharts), top 5 products table |
| Products | Searchable + filterable table, add/edit modal, stock badge (low/ok), category filter |
| Orders | Order list with status color badge, create order with product picker + qty, status update dropdown |
| Stock | Movement history table, stock-in / stock-out form, product autocomplete |
| Reports | Date range picker, generate PDF/CSV buttons |

---

## Docker Compose

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: inventory_db
      MYSQL_ROOT_PASSWORD: rootpass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_PASSWORD: rootpass
      JWT_SECRET: your-secret-key
      MAIL_USERNAME: your@gmail.com
      MAIL_PASSWORD: app-password
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

## What Makes This Resume-Worthy

| Concept | Where it appears |
|---------|-----------------|
| JWT with refresh token rotation | AuthService + JwtTokenProvider |
| Role-based access control | @PreAuthorize on controllers |
| Soft deletes | Product.status = INACTIVE |
| Stock integrity | @Transactional in OrderService |
| Audit trail | AuditLog entity + AOP |
| Low stock alerts | Spring @Scheduled + JavaMailSender |
| PDF report generation | iText7 in ReportService |
| Pagination + filtering | Pageable + Specification API |
| DTO pattern | Separate request/response objects |
| Global exception handling | @ControllerAdvice |
| Environment-based config | application-dev/prod.yml |
| Containerization | Docker Compose |
