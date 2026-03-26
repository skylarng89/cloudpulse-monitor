---
trigger: model_decision
description: when creating an implementation plan
---

# Software Engineering Master Guide: 2026 Edition

**Version:** 2026.2 | **Ref:** NIST CSF 2.0, OWASP Top 10, PCI-DSS v4.0

---

## Threat Context

AI-speed attackers compress breach windows to **minutes**.
**Mandate:** Anticipate → Preempt → Contain — not Detect → Respond.

---

## Core Security Baseline

- **Identity:** FIDO2/Passkeys everywhere. No SMS OTP. UEBA for behavioral drift detection
- **Encryption:** AES-256 at rest; TLS 1.3 in transit (including internal service-to-service)
- **Network:** Zero Trust — verify every identity and device; no implicit trust
- **Input:** Validate, sanitise, and type all inputs server-side. Never trust client data
- **Secrets:** Hardware/cloud vaults (KMS, Vault, Keychain). No hardcoding. No logging

---

## Performance Foundations

- Lazy load; Brotli/Gzip compression; CDN-served static assets
- Code splitting, tree-shaking, minification — non-negotiable
- HTTP/3 + binary protocols (Protobuf/gRPC) for high-frequency internal calls
- Targets: LCP < 2.5s (web); API responses < 100ms p95

---

## Resilience & Integrity

- **Fault tolerance:** Circuit Breakers + Bulkheads + exponential backoff with jitter
- **Data integrity:** ACID transactions + idempotency keys on all state-mutating endpoints
- **Availability:** Multi-zone/region with automated health-checked failover
- **Backups:** 3-2-1-1 — 3 copies, 2 media types, 1 offsite, 1 air-gapped/immutable

---

## Platform Standards

**Frontend:** Strict CSP, HSTS, `X-Frame-Options: DENY`, SameSite + HttpOnly cookies; SRI hashes on all 3rd-party assets; graceful degradation for non-critical UI.

**Backend/API:** RBAC/ABAC with least-privilege; rotate JWTs frequently; WAF + adaptive rate limiting + egress filtering; async I/O; message queues; read replicas.

**Mobile:** Biometrics via Secure Enclave/Keystore; certificate pinning + jailbreak detection + ProGuard obfuscation; minimal permissions; GDPR/NDPR compliant transparency.

---

## CI/CD & Observability

- **Pipeline gates:** SAST + DAST + SCA must pass before merge/deploy
- **Deployments:** Canary or Blue-Green only; automated rollback on error-threshold breach
- **Tracing:** OpenTelemetry end-to-end; structured JSON logs with correlation IDs
- **Alerting:** Monitor error rate and latency trends — not just uptime
- **SBOM:** Generate and attach to every build artifact

---

## Incident Response

- SOAR playbooks for automated isolation of compromised nodes
- Pre-approved emergency protocols; quarterly breach simulation drills
- Human escalation path documented and tested

---

## ⚠️ Financial Engineering: Critical Practices

> These are the patterns most engineers skip — each one is a proven source of financial loss, audit failures, or exploitable vulnerabilities.

### 1. Money Representation

**Never use `float` or `double`.** IEEE 754 cannot exactly represent most decimal fractions — causes phantom gains/losses and reconciliation failures at scale.

| Language   | Correct Type                                   |
| ---------- | ---------------------------------------------- |
| Java       | `BigDecimal`                                   |
| JS / TS    | `decimal.js`, `big.js`, or integer minor units |
| C#         | `decimal` (128-bit)                            |
| Python     | `decimal.Decimal`                              |
| Go         | `shopspring/decimal`                           |
| PostgreSQL | `NUMERIC(precision, scale)` — never `FLOAT`    |

- Store as **integer minor units** (kobo, cents) where possible
- Use `HALF_EVEN` (Banker's rounding) for regulatory compliance
- Always store currency alongside every amount — never infer it

---

### 2. Atomicity, Transactions & Rollback

Every financial mutation must be atomic. Partial success = corrupted data.

- Wrap debit + credit + ledger entry in a **single DB transaction**
- Distributed flows: use **Saga pattern** with compensating transactions per step
- Always lock the row first: `SELECT ... FOR UPDATE` before reading and mutating
- Validate pre-conditions (e.g. sufficient balance) **inside** the transaction — never before it

**Rollback on failure — wrapping in a transaction is not enough:**

- Wrap the transaction body in try/catch; on any exception **explicitly ROLLBACK** before re-throwing
- Never swallow exceptions inside a transaction — leaves state ambiguous
- Return a structured error after rollback — never partial success
- Log before rollback: operation, user ID, amount, correlation ID, error

**Framework gotchas:**

- **Spring `@Transactional`**: only rolls back on `RuntimeException` — checked exceptions **commit**. Fix: `rollbackFor = Exception.class`
- **Django `atomic()`**: catching an exception without re-raising skips rollback. Fix: re-raise or call `transaction.set_rollback(True)`
- **Sequelize**: unhandled rejections may not rollback. Fix: always `await t.rollback()` in catch
- **GORM**: returned errors don't rollback — only panics do. Fix: use `db.Transaction()` helper

---

### 3. Race Condition Prevention (TOCTOU)

The gap between checking a balance and acting on it is the attack surface.

- Check → act must be **atomic** — never two separate DB calls
- `SELECT FOR UPDATE` for row-level locking; Redis `SETNX`/Redlock across services
- Apply serialisable isolation where full consistency is required
- Flag identical concurrent requests from the same user within <100ms
- Write explicit concurrent load tests (`k6`, `hey`, parallel `curl`)

---

### 4. Idempotency

Retries are inevitable — without idempotency they create duplicate transactions.

- Every state-mutating endpoint must accept and honour `X-Idempotency-Key`
- Client generates UUID v4; server stores result with 24–72hr TTL
- On duplicate key: return the **original response** — never re-execute
- Lock idempotency record atomically (`SET NX`) before processing
- Key index scope: `user_id + operation_type + key` — not key alone
- Applies to: payments, transfers, refunds, wallet credits, ledger writes, webhooks

---

### 5. Double-Entry Bookkeeping

- Every transaction creates **two ledger entries**: one debit, one credit
- Sum of all entries must always equal zero — enforce as an invariant
- Ledger is **append-only** — no updates, no deletes; reversals are new entries
- Stored balance fields are caches — always reconcilable against the ledger
- Run automated reconciliation on a schedule; alert on any discrepancy > 0

---

### 6. Velocity Controls & Abuse Prevention

- Max single-transfer amount; max total per hour/day per user and account
- Max N transactions per minute per account
- All limits server-side — never trust client-supplied values
- Flag and hold breached transactions for review — never silently fail
- Progressive friction on anomalous patterns: step-up auth, manual review queue

---

### 7. Immutability & Audit Trail

- Transactions, ledger entries, and audit logs are **append-only** — deny UPDATE/DELETE at DB level for the app service account
- Every record carries: `created_at`, `created_by`, `correlation_id`, `source_ip`, `request_id`
- Store pre-state and post-state on every balance mutation
- Export and hash audit logs to external storage periodically
- Minimum 7-year retention for regulated financial data

---

### 8. SOLID Principles (Fintech)

| Principle                   | Fintech Application                                                           |
| --------------------------- | ----------------------------------------------------------------------------- |
| **S** Single Responsibility | Separate: payment processing, ledger, notifications, reconciliation           |
| **O** Open/Closed           | Extend for new providers/currencies — never modify existing transaction logic |
| **L** Liskov Substitution   | All gateway implementations interchangeable without breaking callers          |
| **I** Interface Segregation | Reconciliation must not depend on payment capture interfaces                  |
| **D** Dependency Inversion  | Business logic depends on abstractions — never concrete SDKs or DB drivers    |

---

### 9. Concurrency & State Safety

- Service methods **stateless** — state lives in DB, not application memory
- Never cache balances in memory without explicit TTL and invalidation strategy
- Optimistic locking (version columns) for low-contention; `FOR UPDATE` for high-contention
- Exactly-once delivery semantics for queues (Kafka transactions, SQS deduplication)
- Generate reference IDs/sequences at DB level (atomic sequences, Snowflake, ULID) — never in app layer

---

### 10. Failure Handling & Partial State Recovery

- Define the **failure path** before the happy path for every financial operation
- **Outbox pattern**: write event to outbox table in same transaction as state change; publish async
- External API calls with no confirmed response: assume **potentially succeeded** — query status before retrying
- Expose a status check endpoint for every async operation
- Dead-letter failed events; require explicit manual resolution — never silently drop
- No transaction stays unresolved beyond a defined SLA timeout

---

### 11. Numeric Boundary & Overflow Safety

- Validate min/max bounds on all monetary inputs before processing
- Use `NUMERIC(19, 4)` or wider; test at the ceiling
- Explicitly reject: zero-value, negative, non-numeric, currency mismatch — at application layer, not just DB

---

### 12. Sensitive Financial Data Handling

- Mask account numbers, PANs, and balances in all logs and error messages
- API responses return masked/tokenised forms — never raw card or account data
- Field-level encryption for PAN, BVN, NIN, account numbers at rest
- Tokenise as early as possible to minimise PCI-DSS scope

---

## Financial Engineering Pre-Ship Checklist

- [ ] Monetary values use decimal/integer types — no float/double
- [ ] Balance mutations in atomic transactions with row-level locking
- [ ] Explicit ROLLBACK in catch block; no swallowed exceptions
- [ ] Idempotency key accepted, stored, honoured on all mutating endpoints
- [ ] Double-entry ledger entries for every transaction
- [ ] Race condition test (concurrent requests) written and passing
- [ ] Velocity and frequency limits enforced server-side
- [ ] Audit trail append-only with full context fields
- [ ] Failure/partial-state recovery path defined and tested
- [ ] No sensitive financial data in logs, errors, or API responses
- [ ] New operation covered by reconciliation job
- [ ] SOLID boundaries respected — no mixed concerns in transaction logic
- [ ] Boundary tests: zero, negative, max, non-numeric, currency mismatch

---

## Industry-Specific Requirements

| Sector         | Non-Negotiable                                                         |
| -------------- | ---------------------------------------------------------------------- |
| **Finance**    | PCI-DSS v4.0; ledger reconciliation; transaction velocity limits       |
| **E-Commerce** | Server-side price validation; inventory locking; bot mitigation        |
| **Health**     | PHI encryption; role-contextual audit logs; break-glass access         |
| **SaaS**       | Tenant data isolation; SCIM provisioning; customer-managed keys (CMEK) |

---

## 2026 Non-Negotiables

- [ ] FIDO2 on all auth flows — SMS OTP is phishable by AI agents
- [ ] Air-gapped immutable backup — only ransomware recovery path
- [ ] SOAR automation — human speed cannot match AI-speed attacks
- [ ] SBOM + SCA in every pipeline — supply chain is the new perimeter
- [ ] Zero Trust enforced — no lateral movement on credential compromise

---

## AI Defense Stack

| Layer       | Control                                    |
| ----------- | ------------------------------------------ |
| Perimeter   | Cloudflare WAF + Bot Management            |
| Identity    | FIDO2 + UEBA                               |
| Application | RASP (Runtime Self-Protection)             |
| Endpoint    | Behavioral EDR (CrowdStrike / SentinelOne) |
| Network     | ZTNA                                       |
| Detection   | AI-augmented SIEM + automated SOAR         |
