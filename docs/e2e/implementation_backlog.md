# E2E implementation backlog

Folder này là specification. Tài liệu đầu vào không chứa frontend source hoặc Playwright suite.

## P0 — Runner và môi trường

### E2E-FE-001 — Tạo Playwright project

- Base URL configurable.
- Chromium project.
- HTML/JUnit report.
- Trace/screenshot/video on failure.
- Serial execution.

### E2E-FE-002 — Startup orchestration

```text
build backend
→ start backend
→ wait /v3/api-docs
→ start frontend
→ wait /login
→ run browser E2E
→ collect artifacts
→ stop processes
```

### E2E-FE-003 — Auth fixture

- UI login helper.
- API login helper.
- Không hard-code JWT.
- Redact secrets.

## P0 — Core journeys

Tự động hóa trước:

- `E2E-AUTH-FE-009`.
- `E2E-GS-007`.
- `E2E-DASH-007`.
- `E2E-STUDENT-012`.
- `E2E-COURSE-011`.
- `E2E-GRADE-011`.
- `E2E-PLATFORM-FE-011`.

## P1 — Data isolation

### E2E-FE-010 — Dynamic fixture registry

Theo dõi Student/Course/Grade do mỗi test tạo và cleanup đúng thứ tự.

### E2E-FE-011 — E2E backend profile

- Configurable port.
- JWT secret từ env.
- H2 database theo run.
- Token expiration configurable cho expired-token test.

### E2E-FE-012 — Reset harness

Test-only reset/seed capability, chỉ bật profile E2E và không expose production.

## P1 — Contract hardening

### E2E-FE-020 — Stable auth error

Invalid credentials và invalid JWT trả 401 với error schema ổn định.

### E2E-FE-021 — Validation contract

Missing/invalid fields trả 400 với field errors.

### E2E-FE-022 — Constraint contract

- Duplicate Course code → stable 409/400.
- Duplicate Grade pair → stable 409.
- Không rò SQL details.

## P1 — Frontend testability

- Accessible labels.
- Stable test IDs cho composite widgets.
- Global error boundary.
- Deterministic loading/empty/error states.
- API client events có thể quan sát.

## P2 — CI và chất lượng

- Cross-browser non-blocking → blocking.
- Accessibility scan.
- Performance smoke.
- Flake tracking.
- Allure hoặc report portal.
- Database-per-worker nếu cần parallel.

## Product gaps

- Update Student/Course endpoints.
- Recent Activities API.
- RBAC.
- Server-side pagination/search.
- Logout/revocation/refresh.
- API versioning và shared error contract.
- Health/readiness endpoint.

## Definition of Done cho scenario

- Có scenario ID và AC ref.
- Setup/cleanup deterministic.
- Không hard-code generated ID/JWT.
- Happy path dùng backend thật.
- Controlled interception được gắn nhãn.
- Không log secret.
- Failure artifact đủ chẩn đoán.
- Chạy ổn định 10 lần liên tiếp trên CI trước khi thành blocking gate.
