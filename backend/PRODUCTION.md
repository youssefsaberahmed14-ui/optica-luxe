# Optica Luxe — Production Hardening & Operational Guide

## 1. Production Environment Variables Reference

| Variable | Required | Default | Description & Security Policy |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Runtime mode. In `production`, fails fast if PostgreSQL is unavailable; disables in-memory fallbacks; rejects weak secrets and default credentials. |
| `PORT` | No | `5000` | Port on which Express server listens. |
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection URL. Must begin with `postgres://` or `postgresql://`. |
| `TEST_DATABASE_URL` | No | - | Isolated PostgreSQL database URL for running real live concurrency and transaction tests. Database name MUST contain `test`. |
| `JWT_SECRET` | **Yes** | - | Cryptographic secret for signing admin JWTs. Must be **at least 32 characters** with high entropy. Predictable defaults are strictly blocked. |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry (e.g. `1d`, `7d`). |
| `ADMIN_EMAIL` | **Yes** (Prod) | - | Production admin email. Predictable defaults (e.g., `admin@optica-luxe.com`, `admin@example.com`) are rejected in production. |
| `ADMIN_PASSWORD` | **Yes** (Prod) | - | Production admin password. Minimum **12 characters**, hashed with bcrypt (cost factor: 12). Weak passwords rejected. |
| `ADMIN_NAME` | No | `Store Administrator` | Display name of the initial superadmin account. |
| `CORS_ORIGIN` | **Yes** | - | Primary production frontend domain. Localhost is strictly blocked in production. |
| `CORS_ALLOWED_ORIGINS`| No | - | Comma-separated allowlist of authorized client domains (e.g. `https://optica-luxe.com,https://admin.optica-luxe.com`). |
| `RATE_LIMIT_WINDOW_MS`| No | `900000` (15m) | Rate limiting evaluation window in milliseconds. |
| `RATE_LIMIT_MAX_ATTEMPTS` | No | `60` | Max requests per rate-limiting window per IP. |

---

## 2. Database Migration Instructions

Optica Luxe uses Prisma ORM with strict schema versioning and zero-downtime safe migration SQL scripts.

### Applying Migrations in Production:
```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Apply all pending migrations safely to live PostgreSQL
npx prisma migrate deploy
```

### Migration History:
1. `20261120000000_init`: Initial schema containing Product, Order, OrderItem, Coupon, and AdminUser.
2. `20261120000001_production_critical_fixes`: Added `trackingTokenHash`, `idempotencyKey`, cancellation audit fields, and `OrderStatusHistory` table.
3. `20261120000002_monetary_decimal_and_cod_lifecycle`: Replaced all `Float` monetary fields with `DECIMAL(10, 2)` using explicit `USING col::DECIMAL(10, 2)` casts to preserve precision; added `paidAt` and `paidBy` columns to `Order`.

---

## 3. Secure Admin Bootstrap Guide

Never use hardcoded admin credentials or seed predictable passwords into production databases.

### Bootstrap Procedure:
Execute the dedicated bootstrap CLI script:
```bash
NODE_ENV=production \
DATABASE_URL="postgresql://user:pass@host:5432/optica_luxe_prod" \
JWT_SECRET="YOUR_MINIMUM_32_CHARACTERS_HIGH_ENTROPY_SECRET" \
ADMIN_EMAIL="security-admin@your-company.com" \
ADMIN_PASSWORD="YourStrongPassword2026!#" \
npm run bootstrap:admin
```

**Security Guarantees:**
- Passwords are encrypted with `bcrypt` (12 rounds) before storage.
- Passwords and secrets are never printed to console logs or written to disk.
- If the user already exists, it updates role to `SUPERADMIN` and updates the password hash cleanly.

---

## 4. PostgreSQL Integration & Concurrency Testing

Optica Luxe includes automated integration tests verifying real transaction safety directly against a live PostgreSQL database.

### Running Live PostgreSQL Tests:
1. Prepare an isolated test database (e.g., `optica_test_db`).
2. Run Prisma migrations against the test database:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/optica_test_db" npx prisma migrate deploy
   ```
3. Execute the concurrency test suite:
   ```bash
   TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/optica_test_db" npm run test:integration
   ```

**Safety Guard Built-in:**
- The test harness verifies the database name before executing any statement.
- Databases missing `test` in their name or containing `prod` are aborted immediately.

---

## 5. Production Deployment Checklist

- [ ] **Database Setup:** Provisioned PostgreSQL 14+ instance with automated backups and connection pooling.
- [ ] **SSL / TLS:** Enforce HTTPS on both API and Angular frontend.
- [ ] **Environment Configuration:** Configured `.env` matching `.env.example` with 32+ character `JWT_SECRET`.
- [ ] **CORS Verification:** `CORS_ORIGIN` points to production domain; localhost origins forbidden.
- [ ] **Run Migrations:** Executed `npx prisma migrate deploy`.
- [ ] **Admin Bootstrap:** Provisioned superadmin using `npm run bootstrap:admin`.
- [ ] **Health Check Check:** Verify `GET /api/health` returns `readiness: 'ready'` with healthy latency.
- [ ] **Rate Limiting:** Verified rate limiters on checkout (`/api/orders`), tracking (`/api/orders/track`), and authentication (`/api/auth/login`).

---

## 6. Implemented Features vs. Future Manual Integrations

### Implemented & Production-Ready:
- Full Cash on Delivery (COD) payment lifecycle (`UNPAID` -> `PAID` upon confirmed `DELIVERED`).
- Dedicated cash collection endpoint (`POST /api/orders/:id/collect-cash`) with admin audit logging.
- Cryptographic SHA-256 order tracking tokens transmitted exclusively via `X-Tracking-Token` HTTP header.
- Sanitized Checkout DTO completely stripping database UUIDs, customer PII, and token hashes.
- Atomic conditional stock deduction with deadlock-prevention deterministic ordering.
- Idempotency key deduplication with payload conflict detection.
- Exact monetary precision with `Decimal.js` and PostgreSQL `DECIMAL(10, 2)`.
- Helmet HTTP security headers, 100KB request body size limits, and rate limiting.

### Pending External Configuration:
- **Transactional SMS / WhatsApp Notifications:** When an order is shipped or delivered, webhook triggers can be connected to Twilio or WhatsApp Business API.
- **Physical Shipping Carrier Integration:** Auto-generating live courier waybills (e.g. Bosta, Aramex) from the admin dashboard.
