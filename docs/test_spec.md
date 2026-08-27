# Đặc tả test — Grade Submission Frontend

**Phụ trách:** Frontend + QA teams  
**Trạng thái:** Specification-ready; automated source pending  
**Cập nhật lần cuối:** 2026-07-29

## 1. Boundary và nguồn chuẩn

- Canonical requirements: `docs/spec.md` và `docs/modules/*/spec.md`.
- UI behavior: `docs/ui/web/grade_submission/screens/`.
- E2E inventory: `docs/e2e_spec.md` và `docs/e2e/*.md`.
- Backend contract: companion Spring Boot API.
- Khi source được thêm, repo-local `*.spec.ts` và Playwright `*.spec.ts` trở thành bằng chứng chính.

## 2. Test pyramid

### 2.1 Unit tests

Dùng cho:

- DTO/view-model mapper.
- Date parse/format.
- Error normalizer.
- JWT/token storage helpers.
- Search/filter/pagination utilities.
- Query keys và cache invalidation rules.
- Form validation.

### 2.2 Component tests

Dùng cho:

- Login form.
- Student/Course/Grade forms.
- Data tables và pagination.
- Loading, empty, error states.
- Confirm Delete modal.
- 401/404 pages.
- Unsupported Edit action.

### 2.3 Feature integration tests

Dùng mocked HTTP/test server để kiểm tra:

- API client gắn Bearer token.
- 401 interceptor clear session.
- Create/delete mutation và cache invalidation.
- `204 No Content` không bị parse JSON.
- Course `subject` mapping.
- Grade `score` giữ string.
- Dashboard partial failure.

### 2.4 Browser E2E

Dùng backend thật cho happy paths:

- Login/auth boundary.
- Dashboard.
- Students.
- Courses.
- Grades.
- Confirm Delete.
- 401 và system states quan trọng.

## 3. Coverage matrix

| Capability | AC canonical | Unit/Component evidence mục tiêu | E2E canonical | Backend evidence khi cần |
| --- | --- | --- | --- | --- |
| Auth/token/401 | `modules/auth/spec.md`, `AC-PROD-01..04` | auth store, API interceptor, Login form | `E2E-AUTH-FE-009`, `010`, `011`, `012` | `/authenticate`, protected API |
| App shell/navigation | `modules/grade_submission/spec.md` | route/guard/layout tests | `E2E-GS-007` | — |
| Dashboard | `modules/dashboard/spec.md` | aggregation + partial state | `E2E-DASH-007`…`011` | list endpoints |
| Students | `modules/students/spec.md` | mapper/form/list/dialog | `E2E-STUDENT-012`…`019` | Student API/cascade |
| Courses | `modules/courses/spec.md` | `subject` mapper/form/list | `E2E-COURSE-011`…`018` | Course API/unique code |
| Grades | `modules/grades/spec.md` | string score/filter/cache | `E2E-GRADE-011`…`019` | Grade pair API/constraint |
| Shared errors | `standards/api-response-and-error-contract.md` | normalizer/error components | `E2E-STATE-FE-001`…`010` | unstable backend errors |
| Proxy/API integration | `modules/platform/spec.md` | env/client config | `E2E-PLATFORM-FE-011` | CORS/proxy runtime |
| Accessibility | `ui/.../_foundation/10_accessibility.md` | axe/component checks | selected journeys | manual keyboard review |
| Performance | `e2e/performance.md` | bundle check | `E2E-PERF-FE-001`…`005` | API timing smoke |

## 4. Critical case catalog

### Auth

- Valid login.
- Invalid credentials: không tạo session và không rò chi tiết.
- Protected route không token.
- API trả 401 sau khi token đã lưu.
- Refresh tab giữ session theo storage policy.
- Logout clear token/cache.

### Student

- List và hiển thị Birth Date.
- Client search theo name/ID.
- Client pagination.
- Create gửi ISO date.
- Detail kết hợp student và grades.
- Delete confirm/cancel/cascade warning.
- Edit hidden/disabled và không gửi request.

### Course

- List và map `subject` thành Course Name.
- Search theo code/name.
- Create.
- Duplicate code safe error.
- Detail kết hợp course và student grades.
- Delete confirm/cancel.
- Edit hidden/disabled.

### Grade

- List và filter theo Student/Course.
- Create bằng alphabetic score và numeric-looking string.
- Update score.
- Duplicate pair safe error.
- Delete.
- Missing Student/Course/Grade.

## 5. Backend error assertions

### Success entity/list

Không giả định shared envelope. Assert entity hoặc array trực tiếp.

### `204 No Content`

```ts
expect(response.status()).toBe(204)
expect(await response.text()).toBe('')
```

### `401`

UI phải clear auth/cache và chuyển auth surface. Không phụ thuộc exact message nếu backend chưa ổn định.

### `404`

Có thể assert `status=404` và message nghiệp vụ khi custom handler được dùng.

### Duplicate/validation/default errors

- Request không thành công.
- Không có success feedback.
- Không rò SQL, stack trace hoặc vendor details.
- Input được giữ khi an toàn.

## 6. Test data

- Không hard-code generated ID.
- Seed có thể được discover qua list API.
- Tạo unique names/codes cho test destructive.
- Chỉ xóa resource do test tạo.
- Grade cleanup trước Student/Course cleanup nếu cần.
- Chạy E2E tuần tự khi dùng chung một H2 instance.
- Restart backend để reset baseline nếu chưa có reset harness.

## 7. Selector policy

Ưu tiên:

1. Role và accessible name.
2. Label.
3. Stable `data-testid` cho composite widgets.
4. Text ổn định.

Không dựa vào CSS class styling hoặc `nth-child` cho assertion nghiệp vụ.

## 8. Command contract mục tiêu

```bash
npm run test
npm run test:coverage
npm run e2e
npm run lint
npm run typecheck
npm run build
```

Các command chỉ được coi là implementation-aligned sau khi có trong `package.json`.

## 9. Quality gates đề xuất

- Critical mapper/auth/error branches được bao phủ.
- Không có focused/skipped test không giải trình.
- Core E2E chạy ổn định 10 lần trước khi trở thành blocking gate.
- Không dùng retry để che test flaky hoặc dữ liệu nhiễm chéo.
- Lint, typecheck, unit/component tests và build phải pass.
- E2E artifacts phải redact password/JWT.
