# Standards — Grade Submission Frontend Wireframe

**Phụ trách:** Frontend team  
**Trạng thái:** Wireframe-aligned, backend-aware  
**Cập nhật lần cuối:** 2026-07-22

## 1. Nguyên tắc phân loại

| Nhãn | Ý nghĩa |
| --- | --- |
| **Current** | Hành vi được tài liệu backend xác nhận đang tồn tại |
| **Frontend-proposed** | Quy ước triển khai frontend đề xuất từ mẫu tài liệu Vue 3 |
| **Target** | Chuẩn nên áp dụng khi frontend được xây dựng |
| **Backlog** | Cần thay đổi backend hoặc quyết định sản phẩm trước khi triển khai |

Không được mô tả một chuẩn **Target/Backlog** như thể backend đã hỗ trợ.

## 2. Current backend baseline

- Java 17, Spring Boot 3.5.14, Maven Wrapper.
- Base URL local: `http://localhost:9090`.
- Login: `POST /authenticate`.
- Protected API: `Authorization: Bearer <jwt>`.
- JWT stateless HS256, thời hạn 24 giờ.
- API chưa có `/api/v1`.
- Success trả entity hoặc JSON array trực tiếp.
- Not-found và unauthenticated có hai error shape khác nhau.
- H2 in-memory; restart làm mất dữ liệu và chạy seed lại.
- Student/Course không có update; list không có server pagination/search.
- Grade unique theo `(studentId, courseId)` và `score` là chuỗi.
- Backend chưa có CSRF, ETag, idempotency, RBAC, refresh token hoặc logout endpoint.

## 3. Wireframe contract

- Student dùng `Birth Date` ở list, form và detail.
- API trao đổi ngày theo `yyyy-MM-dd`; UI có thể hiển thị `yyyy/MM/dd`.
- Grade là chuỗi; `A` và `8.5` đều là string hợp lệ theo contract hiện tại.
- `Course Name` trên UI ánh xạ vào field backend `subject`.
- Search và pagination của MVP thực hiện phía client.
- `Edit Student` và `Edit Course` phải ẩn/disable cho đến khi backend có update endpoint.
- Dashboard counts được tổng hợp từ ba endpoint `/all`.
- `Recent Activities` là placeholder/backlog vì backend chưa có activity API.

## 4. Danh mục

### Documentation và governance

- [Conventions](conventions.md)
- [Documentation governance](documentation-governance.md)
- [Glossary](glossary.md)
- [Traceability](traceability.md)
- [Definition of Done](definition_of_done.md)
- [Record architecture decisions](record-architecture-decisions.md)

### API và dữ liệu

- [API integration](api-integration.md)
- [API domain mapping](api-domain-mapping.md)
- [API naming conventions](api-naming-conventions.md)
- [API response and error contract](api-response-and-error-contract.md)
- [API versioning strategy](api-versioning-strategy.md)
- [Validation rules](validation-rules.md)
- [Error codes](error-codes.md)
- [Date and time handling](date-and-time-handling.md)

### Frontend engineering

- [Security architecture](security-architecture.md)
- [Component patterns](component-patterns.md)
- [State management](state-management.md)
- [Clean architecture import rules](clean-architecture-import-rules.md)
- [Layer public API imports](layer-public-api-imports.md)
- [Repository naming](repository-naming.md)
- [Adapter/facade evaluation](adapter-facade-pattern-evaluation.md)
- [Service composition and config validation](service-composition-and-config-validation.md)
- [Environment configuration](environment-specific-configuration.md)
- [Accessibility and responsive](accessibility-and-responsive.md)

### Quality và testing

- [Build quality and source hygiene](build-quality-and-source-hygiene.md)
- [Testing strategy](testing-strategy.md)
- [Bundle-size monitoring](bundle-size-monitoring.md)
- [Allure reporting](allure-reporting.md)

### Templates

- [Spec pack](templates/spec-pack.template.md)
- [Implementation plan](templates/impl-plan.template.md)
- [Test plan](templates/test-plan.template.md)
- [Black-box test cases](templates/blackbox-testcases.template.md)
- [Review checklist](templates/review-checklist.template.md)
- [Self review](templates/self-review.template.md)
- [Final report](templates/report.template.md)

## 5. Thứ tự đọc

```text
README
  → conventions + glossary
  → API integration + security + validation
  → component/state/import rules
  → testing + Definition of Done
  → templates
```
