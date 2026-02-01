🚀 WorkHub – Multi-Tenant MERN SaaS Platform

WorkHub is a multi-tenant SaaS platform built using the MERN stack that helps SMEs manage work orders, inventory, customers, invoicing, and reports from a single shared system with strict tenant isolation.

The system is designed to be secure, scalable, and enterprise-ready, supporting thousands of tenants on shared infrastructure with a future upgrade path for dedicated enterprise deployments.

🧩 Key Features

🔐 Multi-Tenancy with Strong Isolation

👥 Role-Based Access Control (Admin, Manager, Staff)

📦 Inventory Management with Audit Trail

🧾 Tamper-Proof Invoice Generation

⚙️ Asynchronous Background Processing

📊 Reporting & Analytics

☁️ Cloud-Ready Architecture

🏢 Enterprise Isolation Upgrade Path

🏗️ Tech Stack
Frontend

React.js

Axios

React Router

Context API

Backend

Node.js

Express.js

JWT Authentication

Role-Based Access Control (RBAC)

Database

MongoDB

Mongoose ODM

Infrastructure (Optional / Cloud)

AWS S3 (File Storage)

Redis / BullMQ (Background Jobs)

CDN (CloudFront / Vercel)

🧠 System Architecture Overview

WorkHub follows a layered backend architecture:

routes/
middlewares/
controllers/
services/
engines/
models/

Architecture Principles

Controllers handle HTTP requests only

Services coordinate workflows

Domain Engines contain pure business logic

Middleware enforces security & tenant isolation

Models handle database access

🏢 Multi-Tenancy Design

Single shared MongoDB database

Every document contains a mandatory tenantId

Tenant resolved via:

Subdomain (clientA.workhub.com)

JWT token

tenantId is injected server-side and never trusted from the client

✅ Prevents cross-tenant data access
✅ Safe for shared infrastructure

🔐 Authentication & Authorization

JWT-based authentication

Tokens contain:

userId

tenantId

role

Role-Based Access Control (RBAC) enforced at route level

Secure middleware-based authorization

📦 Inventory & Financial Integrity

Inventory changes recorded as immutable transactions

No direct stock manipulation

Invoices generated strictly from:

Inventory transactions

Labor entries

Prevents financial tampering and ensures auditability

⚙️ Asynchronous Processing

Heavy tasks are processed in the background using job queues:

Invoice PDF generation

Email notifications

Low stock alerts

Report aggregation

This ensures a fast and responsive UI.

🧪 Environment Variables

Create a .env file in the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/workhub.git
cd workhub

2️⃣ Backend Setup
cd backend
npm install
npm run dev

3️⃣ Frontend Setup
cd frontend
npm install
npm start

📁 Project Structure
workhub/
│
├── backend/
│   ├── routes/
│   ├── middlewares/
│   ├── controllers/
│   ├── services/
│   ├── engines/
│   ├── models/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md

🏢 Enterprise Isolation Path

For enterprise customers, WorkHub supports:

Dedicated database

Dedicated backend services

Same codebase (config-driven)

Higher SLA & performance guarantees

📚 Use Cases

Small & Medium Enterprises (SMEs)

Service-based businesses

Inventory-driven operations

Multi-branch organizations

🧑‍💻 Author

WorkHub Development Team
Built as a scalable MERN-based SaaS platform.

📄 License

This project is licensed under the MIT License.
