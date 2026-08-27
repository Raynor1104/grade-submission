# Grade Submission Frontend — Product Docs Index

**Phụ trách:** Frontend team  
**Trạng thái:** Specification-ready; source verification pending  
**Cập nhật lần cuối:** 2026-07-29

Bộ tài liệu này mô tả frontend cho **Grade Submission System**, được xây dựng từ wireframe và companion backend contract. Tài liệu tổ chức theo cùng mô hình với bộ docs frontend tham chiếu, nhưng không tuyên bố source code hoặc Playwright suite đã tồn tại nếu chưa có bằng chứng trong repository.

## 1. Boundary và nguồn chuẩn

### 1.1 Nguồn đầu vào đã dùng

- Wireframe gồm Login, Dashboard, Students, Courses, Grades, detail pages, 401 và Confirm Delete.
- Companion backend Spring Boot tại `http://localhost:9090`.
- Bộ tài liệu đã chuẩn hóa trong:
  - `docs/architecture/`
  - `docs/modules/`
  - `docs/standards/`
  - `docs/e2e/`
  - `docs/ui/`

### 1.2 Source tree mục tiêu

```text
src/
├── app/                  # bootstrap, router, layouts, providers
├── core/                 # API client, auth, config, domain models
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── students/
│   ├── courses/
│   └── grades/
├── shared/               # UI và utilities dùng chung
└── main.ts

e2e/                      # Playwright project mục tiêu
docs/                     # Product documentation
```

Khi source thật có cấu trúc khác, phải cập nhật tài liệu thay vì ép source theo cây trên một cách máy móc.

### 1.3 Thứ tự ưu tiên khi có mâu thuẫn

1. Frontend source và automated tests trong repository hiện tại.
2. Backend controller, security configuration và runtime OpenAPI.
3. `docs/modules/*/spec.md` và `docs/spec.md`.
4. Screen docs trong `docs/ui/`.
5. Wireframe và planning/backlog documents.

## 2. Trạng thái tài liệu

| Trạng thái | Ý nghĩa |
| --- | --- |
| `Implementation-aligned` | Có source/test để xác minh hành vi |
| `Specification-ready` | Contract đã đủ để triển khai nhưng chưa có source evidence |
| `Partial` | Một phần có thể triển khai, phần còn lại phụ thuộc backend hoặc quyết định sản phẩm |
| `Blocked` | Wireframe có hành vi nhưng backend chưa hỗ trợ |
| `Backlog` | Ngoài MVP hoặc cần nâng cấp sau |

Hiện tại các file gốc dùng trạng thái `Specification-ready; source verification pending`.

## 3. Mục lục nhanh

| Tài liệu | Vai trò |
| --- | --- |
| [`spec.md`](spec.md) | Đặc tả sản phẩm, route, API, data mapping và acceptance criteria cấp hệ thống |
| [`tasks.md`](tasks.md) | Chỉ mục công việc theo dependency và module |
| [`test_spec.md`](test_spec.md) | Chiến lược unit/component/integration/E2E và coverage matrix |
| [`e2e_spec.md`](e2e_spec.md) | Inventory canonical của browser journeys cần tự động hóa |
| [`runbook.md`](runbook.md) | Cài đặt, chạy local, build, test, smoke check và troubleshooting |
| [`security.md`](security.md) | Baseline bảo mật cho JWT, browser, logging, dependency và incident response |
| `modules/` | AC, task và test catalog theo module |
| `ui/` | Screen docs, foundation, responsive và accessibility |
| `standards/` | Quy chuẩn API, component, state, validation và quality |
| `e2e/` | Journey detail, test data, system states và Playwright mapping |
| `architecture/` | System context, source structure, data model và decision log |

## 4. Product boundary hiện tại

### Frontend chịu trách nhiệm

- Login form và lưu JWT cho phiên demo.
- Route guard và xử lý response `401`.
- App shell và navigation Dashboard/Students/Courses/Grades.
- Mapping DTO backend sang view model.
- Search, filter và pagination phía client cho dataset nhỏ.
- Loading, empty, error và confirm-delete states.
- Không gọi API chưa tồn tại.

### Backend chịu trách nhiệm

- `POST /authenticate` và ký JWT.
- Persistence Student, Course và Grade.
- Unique `Course.code` và unique Grade theo cặp Student–Course.
- Bảo vệ business endpoint bằng Bearer token.

### Ngoài MVP

- Update Student và Course.
- Recent Activities thật.
- RBAC.
- Server-side search/pagination.
- Refresh token, logout/revocation phía server.
- Production database và production-grade error envelope.

## 5. Quick start mục tiêu

> Các script dưới đây là command contract đề xuất. Chỉ đánh dấu `Implementation-aligned` sau khi `package.json` thực sự chứa chúng.

```bash
npm ci
cp .env.example .env
npm run dev
```

Frontend local đề xuất: `http://localhost:5173`  
Backend local hiện tại: `http://localhost:9090`

Các quality commands mục tiêu:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

## 6. Cách đọc bộ docs

```text
README.md
  → spec.md
  → modules/*/spec.md
  → ui/**/screens
  → tasks.md
  → test_spec.md
  → e2e_spec.md
  → runbook.md + security.md
```
