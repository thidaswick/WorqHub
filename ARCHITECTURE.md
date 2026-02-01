# Worqhub — Multi-Tenant SaaS Architecture

Production-ready MERN stack architecture for Worqhub: work orders, inventory, customers, billing, and reports for SMEs with strict tenant isolation.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Auth      │  │   Layout    │  │   Pages     │  │   API Services      │ │
│  │   Context   │  │   & Routes  │  │   (views)   │  │   (axios + JWT)     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │ HTTPS / JWT
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Express.js)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   CORS      │  │   Auth      │  │   Tenant    │  │   Error Handler     │ │
│  │   Parser    │  │   (JWT)     │  │   Resolver  │  │   & Validation      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │ tenantId on every request
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LAYER (Controllers)                         │
│  Auth │ Tenants │ WorkOrders │ Inventory │ Customers │ Billing │ Reports     │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB — Shared Database)                    │
│  All collections include tenantId; queries always filtered by tenantId        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenant Strategy: Shared DB + tenantId

- **Approach:** Single MongoDB database, all tenant-scoped collections include a `tenantId` field.
- **Isolation:** Every read/write is filtered (and validated) by `tenantId`. No cross-tenant data access.
- **Tenant resolution:** `tenantId` is taken from the JWT after login (user belongs to one tenant). It is attached to `req.tenantId` by middleware and used in all services/repositories.

### Tenant isolation rules

1. **JWT payload** includes `userId`, `tenantId`, `role`.
2. **Middleware** validates JWT and sets `req.user`, `req.tenantId`, `req.role`.
3. **All tenant-scoped queries** use `{ tenantId: req.tenantId, ... }`.
4. **Tenant-scoped models** enforce `tenantId` as required; indexes include `tenantId` for performance.
5. **Admin-only** operations (e.g. tenant CRUD) live in separate routes/middleware and are not tenant-scoped by `req.tenantId` (platform admin only).

---

## 3. Authentication & RBAC

- **Auth:** JWT (access token). Optional: short-lived access + refresh token stored in DB per user/session.
- **Roles:** `Admin` (platform/tenant), `Manager`, `Staff`.
- **RBAC:** Middleware `requireRole(['Admin','Manager'])` checks `req.role`. Permissions can be extended later (e.g. permissions table per role).

| Role   | Scope        | Typical permissions                                      |
|--------|--------------|----------------------------------------------------------|
| Admin  | Tenant/Platform | Full tenant settings, users, billing, all modules       |
| Manager| Tenant       | Work orders, inventory, customers, reports; no tenant settings |
| Staff  | Tenant       | Limited to assigned work orders / day-to-day operations |

---

## 4. Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Env validation (NODE_ENV, PORT, JWT_SECRET, MONGO_URI)
│   ├── middleware/
│   │   ├── auth.js            # JWT verify, attach user/tenantId/role
│   │   ├── tenant.js          # Ensure tenantId present; optional tenant context
│   │   ├── rbac.js            # requireRole(['Admin', 'Manager'])
│   │   ├── validate.js        # Request validation (e.g. express-validator)
│   │   └── errorHandler.js    # Central error handler
│   ├── models/
│   │   ├── User.js            # userId, tenantId, email, role, passwordHash
│   │   ├── Tenant.js          # tenantId, name, plan, settings
│   │   ├── WorkOrder.js       # tenantId, customerId, status, items, etc.
│   │   ├── Customer.js        # tenantId, name, contact, billing
│   │   ├── Inventory.js       # tenantId, sku, quantity, etc.
│   │   ├── Invoice.js         # tenantId, customerId, lineItems, status
│   │   └── index.js           # Re-export models
│   ├── routes/
│   │   ├── auth.js            # POST /login, /register, /refresh
│   │   ├── tenants.js         # Tenant CRUD (Admin only)
│   │   ├── users.js           # User CRUD scoped by tenantId
│   │   ├── workOrders.js      # Work order CRUD
│   │   ├── customers.js       # Customer CRUD
│   │   ├── inventory.js       # Inventory CRUD
│   │   ├── billing.js         # Invoices, payments
│   │   ├── reports.js         # Aggregations, dashboards
│   │   └── index.js           # Mount all routes under /api
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tenantController.js
│   │   ├── workOrderController.js
│   │   ├── customerController.js
│   │   ├── inventoryController.js
│   │   ├── billingController.js
│   │   └── reportController.js
│   ├── services/
│   │   ├── authService.js     # Login, token generation, password hash
│   │   └── tenantService.js  # Tenant resolution helpers
│   ├── utils/
│   │   ├── ApiError.js        # Custom error class (statusCode, message)
│   │   └── asyncHandler.js   # Wrap async route handlers
│   └── validators/
│       ├── authValidator.js
│       ├── workOrderValidator.js
│       └── index.js
├── app.js                     # Express app (middleware, routes)
├── server.js                  # DB connect + app.listen
├── .env.example
├── package.json
└── README.md
```

---

## 5. Frontend Folder Structure

```
frontend/src/
├── api/
│   ├── client.js              # Axios instance (baseURL, interceptors for JWT + tenant)
│   ├── auth.js                # login, logout, refresh, getCurrentUser
│   ├── workOrders.js
│   ├── customers.js
│   ├── inventory.js
│   ├── billing.js
│   └── reports.js
├── components/
│   ├── common/                 # Button, Input, Modal, Table, Spinner
│   ├── layout/                 # Header, Sidebar, MainLayout
│   └── features/               # WorkOrderForm, CustomerCard, etc.
├── context/
│   └── AuthContext.js         # user, tenantId, role, login, logout
├── hooks/
│   ├── useAuth.js
│   └── useTenant.js
├── pages/
│   ├── auth/                   # Login, Register
│   ├── dashboard/
│   ├── work-orders/
│   ├── customers/
│   ├── inventory/
│   ├── billing/
│   ├── reports/
│   └── settings/               # Tenant & user settings (role-gated)
├── routes/
│   ├── AppRoutes.js            # Route definitions + ProtectedRoute
│   └── ProtectedRoute.js      # Redirect if not authenticated; optional role check
├── utils/
│   ├── constants.js            # ROLES, ROUTES, API_BASE
│   └── helpers.js
├── App.js
├── App.css
└── index.js
```

---

## 6. Security Checklist

- **Secrets:** JWT secret and MongoDB URI from environment variables only (never in code).
- **Passwords:** Bcrypt (or similar) with salt; never store plain text.
- **Queries:** Never build queries from user input without validation/sanitization; always inject `tenantId` from `req.tenantId`.
- **CORS:** Restrict origin in production to your frontend domain(s).
- **Rate limiting:** Apply to auth and public endpoints.
- **HTTPS:** Enforce in production.

---

## 7. Scalability & Maintainability

- **API versioning:** Prefix routes with `/api/v1` for future versions.
- **Logging:** Structured logs (e.g. requestId, tenantId) for debugging and auditing.
- **Validation:** Centralize with express-validator (or similar) in middleware.
- **Testing:** Unit tests for services and integration tests for critical API routes (always with a test tenantId).
- **Indexes:** Compound indexes on (tenantId, ...) for all tenant-scoped collections.

---

## 8. Summary

| Layer    | Responsibility |
|----------|----------------|
| **React** | UI, auth context, role-based routing, API calls with JWT |
| **Express** | Auth middleware (JWT), tenant resolution, RBAC, routes, validation, error handling |
| **MongoDB** | Single DB; tenantId on every document; compound indexes for tenant-scoped queries |

Worqhub uses a **shared-database, tenantId-based** multi-tenant model with **JWT + RBAC** to keep the stack simple, secure, and ready to scale (e.g. read replicas, caching, or splitting DB later if needed).
