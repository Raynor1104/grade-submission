# E2E environment and execution specification

**Phụ trách đề xuất:** Frontend/QA team  
**Trạng thái:** Specification; chưa có runner/source frontend trong tài liệu đầu vào

## 1. Mục tiêu

E2E suite xác nhận chuỗi đầy đủ:

```text
Người dùng trong browser
→ Router và form frontend
→ API client + JWT Bearer
→ Spring Security
→ Controller
→ Service
→ Repository
→ H2
→ HTTP response
→ UI state
```

Không mock router, form validation, API client hoặc backend trong các core journey. Route interception chỉ dùng cho scenario UI khó tạo ổn định bằng backend thật, ví dụ partial Dashboard failure hoặc network outage.

## 2. Phạm vi hiện tại

Bao phủ:

- Login bằng username/password.
- Client-side restore token khi refresh tab.
- Protected route và 401 cleanup.
- App shell: Dashboard, Students, Courses, Grades, Logout.
- Dashboard count từ ba list API.
- Student create/read/delete, Birth Date, detail + grades.
- Course create/read/delete, `subject` mapping, detail + grades.
- Grade create/read/update/delete và filter.
- Confirm delete.
- 404, 204, 5xx/default error và network failure.
- Search/filter/pagination phía frontend.
- Proxy/same-origin browser integration.

Không mô tả như behavior đã triển khai:

- Server logout/revocation.
- Refresh token.
- Current-user API.
- RBAC.
- Update Student.
- Update Course.
- Audit/Recent Activities API.
- Server-side pagination.
- CSRF, ETag, idempotency hoặc rate limiting.
- Persistent production database.
- Test-only reset endpoint.

## 3. Runtime baseline

| Thuộc tính | Giá trị |
| --- | --- |
| Backend | Spring Boot 3.5.14 / Java 17 |
| Backend local URL | `http://localhost:9090` |
| Database | `jdbc:h2:mem:grade-submission` |
| Auth | JWT Bearer, HS256 |
| Token lifetime | 24 giờ |
| Demo account | `username` / `password` |
| Frontend URL | Cấu hình qua `E2E_BASE_URL` |
| API base URL | Cấu hình qua `E2E_API_URL`; mặc định backend `9090` |
| Recommended runner | Playwright browser testing |

## 4. Playwright configuration đề xuất

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});
```

Bắt đầu với Chromium. Firefox và WebKit chỉ chuyển thành blocking sau khi suite ổn định.

## 5. Startup và readiness

### Backend

1. Khởi động Spring Boot.
2. Poll `GET /v3/api-docs` tới khi nhận `200`.
3. Gọi `POST /authenticate` để xác nhận auth subsystem sẵn sàng.

Không dùng `/student/all` làm readiness probe vì cần JWT.

### Frontend

1. Khởi động dev/preview server từ source frontend khi source tồn tại.
2. Poll URL frontend tới khi trả HTML.
3. Mở `/login` và assert form xuất hiện.

Tài liệu đầu vào không cho biết package manager hoặc lệnh chạy frontend; không hard-code lệnh `npm run dev` trong CI trước khi kiểm tra source.

## 6. Authentication helpers

### UI login

Core auth journey phải đi qua Login page:

```text
fill username
→ fill password
→ click Login
→ wait POST /authenticate
→ assert Dashboard
```

### API-assisted setup

Các journey không tập trung vào login có thể:

1. Gọi `POST /authenticate` bằng `APIRequestContext`.
2. Lấy token.
3. Ghi token và username vào `sessionStorage` theo key thật của frontend.
4. Mở protected route.

Chỉ dùng cách này sau khi storage contract của source được xác nhận. Không invent storage key trong test.

## 7. Database lifecycle và isolation

Backend dùng H2 in-memory và seed lại khi application restart.

Baseline:

- `workers: 1`.
- Dữ liệu tạo mới có suffix duy nhất.
- Cleanup theo thứ tự `grade → student → course`.
- Destructive cascade tests dùng entity động.
- Có thể restart backend giữa các file destructive.

Không dùng retry để che race condition hoặc database contamination.

## 8. Assertion rules

### Success entity/list

Backend trả entity hoặc array trực tiếp, không có shared envelope.

```ts
const body = await response.json();
expect(Array.isArray(body)).toBeTruthy();
```

### `204 No Content`

Không gọi `response.json()`.

```ts
expect(response.status()).toBe(204);
expect(await response.text()).toBe('');
```

### Unauthorized

Schema hiện tại:

```json
{ "error": "Unauthenticated" }
```

UI phải clear auth/cache và chuyển Login/401.

### Domain 404

Schema:

```json
{
  "message": "...",
  "status": 404,
  "timestamp": "..."
}
```

### Framework/default errors

Invalid credentials, duplicate constraints và missing required fields chưa có contract ổn định. Core assertion:

- Request không thành công.
- Không có success feedback.
- UI không hiển thị raw backend/SQL details.
- Dữ liệu cũ không bị ghi đè.

## 9. Selector policy

Ưu tiên theo thứ tự:

1. Role và accessible name.
2. Label.
3. Stable `data-testid`.
4. Text chỉ khi là contract hiển thị ổn định.

Ví dụ:

```ts
getByRole('button', { name: 'Login' })
getByLabel('Birth Date')
getByTestId('student-table')
```

Không dùng CSS dựa vào class styling hoặc vị trí `nth-child` cho hành vi nghiệp vụ.

## 10. Evidence

Khi test thất bại, lưu:

- Screenshot.
- Trace.
- Video khi cần.
- Request method/URL/status.
- Response body đã redact.
- Browser console errors.
- Backend log liên quan.
- Unique suffix của test data.

Không lưu:

- Password.
- Full JWT.
- JWT secret.
- Raw SQL stack trace trong report gửi người dùng.

## 11. Tags đề xuất

```text
@current
@frontend-controlled
@observed-gap
@blocked
@destructive
@performance
```

Scenario `@blocked` không chạy trong default suite.
