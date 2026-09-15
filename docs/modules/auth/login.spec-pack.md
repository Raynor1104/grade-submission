# Login — Spec Pack

**Phụ trách:** Frontend team  
**Trạng thái:** Target specification / implementation required  
**Cập nhật lần cuối:** 2026-09-15

## 1. Bối cảnh

Màn hình Login là public entry point của Grade Submission System. Người dùng nhập `username` và `password` để gọi backend `POST /authenticate`, nhận JWT, thiết lập authenticated session phía client và truy cập các màn hình nghiệp vụ được bảo vệ.

Source hiện tại chưa có Login page thực thi. Spec pack này định nghĩa target implementation dựa trên:

- backend-aligned auth documentation;
- wireframe/design `docs/ui/web/grade_submission/screens/design/auth.png`;
- `docs/ui/web/grade_submission/screens/auth/auth_login.md`;
- `docs/modules/auth/spec.md`;
- authentication journey, route/auth ADR, API integration và E2E auth docs;
- các auth primitive đang tồn tại trong source.

Mục tiêu là tạo một Login flow hoàn chỉnh nhưng không giả lập capability backend không tồn tại như refresh token, server logout, registration, role/permission hoặc current-user API.

---

## 2. Source và boundary

### 2.1 Route mục tiêu

```text
/login
```

- Access: **Public**.
- Guest truy cập protected route phải được redirect về `/login`.
- Authenticated user mở `/login` nên được chuyển tới Dashboard hoặc `returnTo` hợp lệ nếu product quyết định giữ deep-link.
- Root `/` phải resolve theo auth state:
  - có token → `/dashboard`;
  - không có token → `/login`.

### 2.2 Target source structure

Đề xuất tối thiểu:

```text
src/
├── app/
│   └── router/
│       ├── index.ts
│       └── routes.ts
├── core/
│   ├── api/
│   │   └── http-client.ts
│   └── auth/
│       ├── token-storage.ts
│       └── auth-session.ts          # hoặc auth store tương đương
└── features/
    └── auth/
        ├── api/
        │   └── auth.api.ts
        ├── model/
        │   └── auth.types.ts
        └── pages/
            └── LoginPage.vue
```

Tên file có thể thay đổi theo convention cuối cùng, nhưng boundary phải giữ rõ: API authentication nằm trong auth feature/core auth, không đặt logic credential vào component dùng chung.

### 2.3 Current implementation

Trong source hiện tại:

- **không có** `LoginPage.vue`;
- router **không có** `/login`;
- router **chưa có** auth guard;
- tất cả business routes đang nằm trực tiếp dưới `/` + `MainLayout`;
- `token-storage.ts` hiện có:
  - `AUTH_TOKEN_STORAGE_KEY = 'grade-submission.auth.token'`;
  - `getStoredAccessToken()`;
  - `clearStoredAccessToken()`;
- chưa có setter lưu token;
- chưa thấy username storage/auth store;
- `httpClient` tự gắn Bearer token nếu storage có token;
- `httpClient` phát `AUTH_EXPIRED_EVENT` khi nhận HTTP 401;
- `httpClient` hiện chỉ expose `get()` và `delete()`; chưa có public `post()` để gọi `/authenticate`;
- chưa có listener ở app shell/router để xử lý `AUTH_EXPIRED_EVENT` thành cleanup + redirect.

### 2.4 Target

Target implementation phải bổ sung:

1. Login route/page.
2. Auth request `POST /authenticate` không phụ thuộc Bearer token.
3. Credential form + client validation.
4. Password visibility toggle.
5. Submit/loading/error states.
6. Token persistence trong `sessionStorage`.
7. Username session state phục vụ greeting nếu cần.
8. Route protection cho business pages.
9. 401 centralized cleanup + redirect.
10. Client-side logout flow.
11. Security/accessibility behavior theo spec này.

### 2.5 Backlog / không thuộc Login MVP

- Registration / forgot password.
- Refresh token.
- Server-side logout/revocation.
- Remember me dài hạn.
- User profile hoặc `/me`.
- Role/permission authorization.
- SSO/OAuth/OIDC.
- MFA.
- Persistent auth bằng `localStorage`.

---

## 3. Phạm vi

### 3.1 In scope

- Render Login screen đúng target design.
- Username field.
- Password field.
- Show/hide password.
- Required validation.
- Submit bằng button và Enter.
- `POST /authenticate`.
- Chặn double submit.
- Success flow lưu token + username.
- Redirect sau login.
- Generic safe login errors.
- Network/server error handling.
- Demo account hint chỉ trong demo environment.
- Route guard dựa trên token presence.
- Restore token từ `sessionStorage` khi refresh.
- 401 cleanup behavior.
- Client-side logout contract liên quan đến Login.
- Responsive + accessibility.

### 3.2 Out of scope

- Tự động điền credentials demo trong production.
- Lưu password ở bất kỳ storage nào.
- Parse JWT làm nguồn authorization.
- Xác minh token bằng `/me` vì backend không có endpoint này.
- Refresh/revoke token.
- Login bằng social provider.
- Reset password.

---

## 4. UI specification

### 4.1 Desktop layout

Target design chia màn hình thành hai vùng chính.

#### Left / Brand area

Hiển thị:

```text
[Book icon] GRADE SUBMISSION SYSTEM
Learning Management System

Submit grades more
accurately and more securely.

A safe and reliable system that faculty
and staff can use with confidence.
```

- Branding nằm phía trên/trái.
- Hero copy nằm ở khu vực trung tâm bên trái.
- Có decorative background geometry theo design.
- Decorative elements phải `aria-hidden="true"` và không ảnh hưởng keyboard order.

#### Right / Login card

Card gồm:

1. Lock icon badge.
2. Heading `Login`.
3. Secondary title/tab `Login` + accent underline.
4. Username label + input.
5. Password label + password input + eye toggle.
6. Primary `Login` button full width.
7. Demo account information box nếu demo environment.
8. Divider.
9. Security note:
   `Access restricted to authorized faculty and staff only`.

### 4.2 Mobile/tablet layout

Ở viewport hẹp:

- Không bắt buộc giữ two-column layout.
- Login card là nội dung ưu tiên và phải xuất hiện sớm.
- Brand/logo vẫn hiển thị.
- Marketing/hero copy có thể chuyển lên trên, rút gọn bố cục hoặc ẩn decorative geometry nếu cần.
- Card không được gây horizontal scrolling.
- Input/button phải full-width trong container.
- Không ẩn labels chỉ để tiết kiệm chiều cao.

### 4.3 Suggested component tree

```text
LoginPage
├── AuthBrandPanel
│   ├── BrandLogo
│   ├── ProductName
│   ├── ProductSubtitle
│   └── HeroCopy
└── LoginCard
    ├── LoginHeader
    ├── LoginForm
    │   ├── UsernameField
    │   ├── PasswordField
    │   │   └── PasswordVisibilityToggle
    │   ├── ErrorSummary
    │   └── LoginButton
    ├── DemoAccountHint
    └── RestrictedAccessNotice
```

Việc tách component con là tùy complexity; không bắt buộc tạo component chỉ để khớp sơ đồ.

---

## 5. Data contract

### 5.1 Request

```http
POST /authenticate
Content-Type: application/json
```

```json
{
  "username": "username",
  "password": "password"
}
```

Type đề xuất:

```ts
export interface LoginRequest {
  username: string
  password: string
}
```

### 5.2 Success response

```json
{
  "token": "<jwt>"
}
```

Type đề xuất:

```ts
export interface LoginResponse {
  token: string
}
```

Client phải validate tối thiểu:

- response là object;
- `token` tồn tại;
- `token` là string;
- `token.trim()` không rỗng.

Response `200` nhưng token rỗng/invalid shape phải được coi là failed authentication response, không tạo authenticated session.

### 5.3 Auth session model

Target client session tối thiểu:

```ts
interface AuthSession {
  token: string | null
  username: string | null
  isAuthenticated: boolean
}
```

`isAuthenticated` trong route guard chỉ phản ánh **token presence phía client**, không khẳng định token còn hợp lệ với server.

### 5.4 Storage

Token key hiện có:

```text
grade-submission.auth.token
```

Target policy:

- token runtime có thể nằm trong auth store/memory;
- mirror token vào `sessionStorage` để refresh tab vẫn giữ phiên;
- username có thể được lưu ở session state/storage riêng nếu cần greeting;
- password **không bao giờ** được persist;
- không dùng `localStorage` cho MVP mặc định.

---

## 6. Normal flow

### 6.1 Initial render

Khi guest mở `/login`:

1. Render branding + Login card.
2. Username rỗng.
3. Password rỗng.
4. Password bị mask.
5. Không hiển thị validation error trước interaction/submit.
6. Login button enabled hoặc disabled theo form strategy, nhưng submit invalid luôn phải bị chặn trước network request.
7. Demo account hint chỉ xuất hiện nếu environment cho phép.

### 6.2 Username input

- Input type phù hợp cho text username.
- Không auto-capitalize.
- Có `autocomplete="username"`.
- Trim whitespace ở boundary trước validation/request.
- Không thay đổi casing trừ khi backend contract xác nhận username case-insensitive.

### 6.3 Password input

Mặc định:

```html
<input type="password" autocomplete="current-password">
```

Eye button:

- toggle giữa masked/unmasked;
- không làm mất giá trị;
- không submit form;
- giữ focus/keyboard usability;
- accessible label thay đổi phù hợp, ví dụ `Show password` / `Hide password`.

Không tự động trim hoặc mutate password trừ khi backend contract yêu cầu. Password phải được gửi đúng chuỗi người dùng nhập.

### 6.4 Submit

Khi form hợp lệ và người dùng nhấn Login/Enter:

1. Set submitting state.
2. Disable Login button.
3. Chặn duplicate request.
4. Gửi:

```http
POST /authenticate
Content-Type: application/json
```

5. Không gửi password/token vào console, analytics hoặc URL.

### 6.5 Login success

Khi response `200` có non-empty token:

1. Lưu token vào auth runtime state.
2. Mirror token vào `sessionStorage`.
3. Lưu username cho display/session nếu auth model cần.
4. Xóa credential error trước đó.
5. Không persist password.
6. Redirect:
   - ưu tiên `returnTo` nếu đã implement và URL được xác minh là internal safe route;
   - nếu không có, chuyển `/dashboard`.
7. Password form state phải bị dispose khi rời Login page.

### 6.6 Refresh tab

Khi reload browser tab:

1. Bootstrap auth state từ `sessionStorage` trước khi protected page được render như guest.
2. Nếu có token → route guard cho phép navigation.
3. Protected request đầu tiên vẫn là server validation thực tế.
4. Nếu server trả 401 → cleanup + redirect Login.

### 6.7 Authenticated user opens `/login`

Target behavior:

- Nếu client có token, redirect tới `/dashboard` hoặc safe `returnTo`.
- Không render Login form lâu hơn cần thiết để tránh authenticated user nhập credentials lại không chủ ý.

---

## 7. Error, loading và auth-expiry flow

### 7.1 Required validation

Nếu username/password thiếu:

- không gọi `/authenticate`;
- hiển thị field error phù hợp;
- focus field invalid đầu tiên sau submit;
- error liên kết bằng `aria-describedby`.

Copy đề xuất:

```text
Username is required.
Password is required.
```

Nếu product muốn UI tiếng Việt thì tất cả auth copy cần được chuẩn hóa đồng nhất; không trộn ngôn ngữ trong cùng screen.

### 7.2 Submitting

Trong khi request đang pending:

- disable Login button;
- button có thể hiển thị `Logging in...` hoặc progress indicator;
- giữ layout ổn định;
- username/password không bị clear sớm;
- eye toggle có thể tiếp tục hoạt động nếu không gây race state, nhưng không bắt buộc.

### 7.3 Invalid credentials

Backend error credentials hiện chưa có shape/status ổn định và có thể trả generic error.

Frontend không được render raw backend exception.

Safe copy:

```text
Invalid username or password.
```

chỉ dùng khi có thể nhận diện credentials failure đáng tin cậy.

Fallback an toàn:

```text
Login failed. Please try again.
```

### 7.4 Network/server error

Khi network unavailable, timeout hoặc lỗi server không xác định:

- giữ username;
- giữ password trong form runtime để người dùng có thể retry trong cùng page nếu product chấp nhận;
- không persist password;
- re-enable submit;
- hiển thị safe error copy;
- không lưu token.

Ví dụ:

```text
Unable to sign in right now. Please try again.
```

### 7.5 Malformed success payload

Nếu HTTP success nhưng `{token}` thiếu/rỗng:

- không authenticate;
- không ghi token vào storage;
- hiển thị generic login failure;
- có thể report sanitized diagnostic qua monitoring nếu project có monitoring, nhưng không log credential/response token.

### 7.6 Protected request returns 401

`httpClient` hiện phát event:

```text
grade-submission:auth-expired
```

Target centralized handler phải:

1. Clear auth token.
2. Clear username/auth runtime state.
3. Clear Student/Course/Grade query cache hoặc toàn bộ protected domain cache.
4. Redirect Login một lần.
5. Có thể dùng:

```text
/login?reason=expired
```

hoặc `reason=unauthorized` theo route contract thống nhất.
6. Không tạo redirect/retry loop.
7. Login page có thể hiển thị safe session-expired message.

### 7.7 Logout

Backend không có logout endpoint.

Client logout phải:

1. Clear token + username khỏi memory/sessionStorage.
2. Clear protected query cache.
3. Navigate `/login`.
4. Không gọi endpoint logout giả.
5. Không nói rằng server token đã bị revoked.
6. Browser Back không được render cached protected business data như session hợp lệ.

---

## 8. Validation

### 8.1 Username

Rules MVP:

- required;
- trim leading/trailing whitespace trước request;
- sau trim phải non-empty;
- không tự lowercase/uppercase;
- không áp đặt min/max/pattern không có trong backend contract.

### 8.2 Password

Rules MVP:

- required;
- non-empty;
- không trim/mutate;
- không áp đặt strength policy vì Login không phải registration và backend chưa cung cấp policy đó.

### 8.3 Demo credentials

Design hiển thị:

```text
Demo account: username / password
```

Policy:

- chỉ hiển thị trong demo/dev environment;
- không hard-code auto-fill trên production;
- demo hint không được trở thành một security assertion;
- nếu demo credentials thay đổi, lấy từ documented demo config/source thay vì rải string trong nhiều component.

### 8.4 `returnTo`

Nếu hỗ trợ:

- chỉ nhận internal route/path;
- reject absolute URL/external origin;
- tránh open redirect;
- fallback `/dashboard` khi invalid.

---

## 9. Router và access-control contract

### 9.1 Public route

```text
/login
```

### 9.2 Protected routes

Tất cả business screens hiện có phải protected, bao gồm tối thiểu:

```text
/dashboard
/students
/students/new
/students/:id
/courses
/courses/new
/courses/:id
/grades
```

### 9.3 Route metadata đề xuất

```ts
meta: {
  requiresAuth: true,
}
```

hoặc protected parent route/layout tương đương.

### 9.4 Guard behavior

Guest → protected route:

```text
protected URL
  ↓
no token
  ↓
/login?returnTo=<encoded internal path>
```

Token present:

```text
protected URL
  ↓
allow route
  ↓
first protected API request
  ↓
server validates JWT
```

Route guard không được xem JWT client decode là authorization authority.

---

## 10. API client requirements

Source hiện tại chưa expose POST. Target phải hỗ trợ auth request theo một trong hai cách:

1. bổ sung `httpClient.post<TResponse>()`; hoặc
2. auth-specific request adapter dùng shared error normalization/build URL conventions.

Yêu cầu:

- `/authenticate` không cần Bearer token;
- nếu shared HTTP client tự attach token khi tồn tại, auth request nên chủ động tránh gửi stale Bearer header nếu có thể;
- request body JSON đúng shape;
- dùng existing API base URL config;
- reuse error-normalization policy;
- không leak credentials trong error/logging.

---

## 11. Security requirements

- Không log password.
- Không log full JWT.
- Không đưa token/password vào URL/query/hash.
- Password không lưu `sessionStorage`/`localStorage`.
- Token dùng `sessionStorage` cho demo theo quyết định hiện tại; ghi nhận XSS risk.
- Không render raw backend stack trace/error body.
- Không dùng JWT payload làm authorization source.
- Logout không được mô tả như server revocation.
- Demo credentials không xuất hiện ngoài environment được cho phép.
- External `returnTo` phải bị chặn.
- Auth-expired handler phải idempotent theo một phiên/token để tránh multiple redirects.

---

## 12. Accessibility

### 12.1 Form semantics

- Dùng `<form>` thật.
- Login button dùng `type="submit"`.
- Username/password có `<label>` liên kết bằng `for/id`.
- Placeholder không thay thế label.
- Username: `autocomplete="username"`.
- Password: `autocomplete="current-password"`.

### 12.2 Keyboard

- Tab order tự nhiên:
  1. Username
  2. Password
  3. Show/hide password
  4. Login
- Enter trong form submit khi hợp lệ.
- Password toggle phải keyboard operable.
- Không tạo keyboard trap.

### 12.3 Errors

- Field error có `aria-describedby`.
- Invalid fields có `aria-invalid="true"`.
- Submit error summary/global auth error nằm trong live region (`role="alert"` hoặc `aria-live`).
- Khi submit invalid, focus field lỗi đầu tiên.
- Khi server error, announcement không spam nhiều lần.

### 12.4 Visual

- Focus indicator rõ ràng.
- Text/error/icon contrast đáp ứng chuẩn accessibility của project.
- Eye icon không là accessible name duy nhất; button cần label text cho screen reader.
- Decorative icon/background `aria-hidden`.

---

## 13. Responsive requirements

### Desktop

- Two-column presentation gần design reference.
- Login card không quá rộng so với form controls.
- Brand/hero area và card cân bằng theo viewport.

### Tablet

- Có thể thu hẹp brand column.
- Không làm labels/input bị squeeze.

### Mobile

- Single-column ưu tiên Login card.
- Container có padding đủ cho touch/keyboard.
- Input/button width 100%.
- Không horizontal scroll.
- Minimum touch target cho eye/login controls theo design-system guideline.
- Virtual keyboard không che submit/error theo cách làm form không sử dụng được.

---

## 14. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-LOGIN-001 | `/login` tồn tại và là public route | Target |
| AC-LOGIN-002 | Login page render branding và Login card theo target design | Target |
| AC-LOGIN-003 | Form có Username và Password với accessible labels | Target |
| AC-LOGIN-004 | Username có `autocomplete=username` | Target |
| AC-LOGIN-005 | Password có `autocomplete=current-password` và mặc định bị mask | Target |
| AC-LOGIN-006 | Eye control toggle show/hide password mà không thay đổi value | Target |
| AC-LOGIN-007 | Submit thiếu username không gọi API và hiển thị required error | Target |
| AC-LOGIN-008 | Submit thiếu password không gọi API và hiển thị required error | Target |
| AC-LOGIN-009 | Invalid submit focus field lỗi đầu tiên | Target |
| AC-LOGIN-010 | Form hợp lệ gửi đúng `POST /authenticate` với username/password | Target |
| AC-LOGIN-011 | Login request không phụ thuộc Bearer token | Target |
| AC-LOGIN-012 | Trong lúc submit, Login button bị disable và duplicate request bị chặn | Target |
| AC-LOGIN-013 | Success response phải có non-empty token mới được coi là login thành công | Target |
| AC-LOGIN-014 | Login thành công lưu token vào auth state/sessionStorage | Target |
| AC-LOGIN-015 | Login thành công không lưu password ở bất kỳ persistent storage nào | Target |
| AC-LOGIN-016 | Login thành công giữ username cho display session nếu app cần greeting | Target |
| AC-LOGIN-017 | Login thành công điều hướng Dashboard hoặc safe `returnTo` | Target |
| AC-LOGIN-018 | Refresh tab restore token từ `sessionStorage` | Target |
| AC-LOGIN-019 | Guest mở protected route bị redirect Login trước khi business content render | Target |
| AC-LOGIN-020 | Authenticated user mở `/login` được chuyển khỏi Login page | Target |
| AC-LOGIN-021 | Invalid credentials hiển thị thông báo an toàn, không render raw exception | Target |
| AC-LOGIN-022 | Network/server failure không lưu token và cho phép retry | Target |
| AC-LOGIN-023 | HTTP success với token rỗng/malformed không tạo authenticated session | Target |
| AC-LOGIN-024 | Protected HTTP request tự gắn `Authorization: Bearer <token>` khi có token | Partially current |
| AC-LOGIN-025 | Protected API 401 clear auth state và protected query cache | Target |
| AC-LOGIN-026 | 401 redirect Login tối đa một lần cho cùng expired auth state | Target |
| AC-LOGIN-027 | Logout chỉ cleanup client state và không gọi server logout giả | Target |
| AC-LOGIN-028 | Logout xong Browser Back không render cached protected data như authenticated | Target |
| AC-LOGIN-029 | Password/token không xuất hiện trong app-generated logs hoặc URL | Target |
| AC-LOGIN-030 | Demo account hint chỉ render trong demo/dev environment | Target |
| AC-LOGIN-031 | Login form submit được bằng keyboard Enter | Target |
| AC-LOGIN-032 | Error summary/server error được announce qua live region | Target |
| AC-LOGIN-033 | Password visibility toggle có accessible name tương ứng trạng thái | Target |
| AC-LOGIN-034 | Login layout không gây horizontal scroll ở mobile | Target |
| AC-LOGIN-035 | `returnTo` nếu có chỉ cho internal safe route, chống open redirect | Target |
| AC-LOGIN-036 | Route guard không coi client-side JWT decode là authorization authority | Target |

---

## 15. Edge cases

1. Username/password đều rỗng.
2. Username chỉ có whitespace.
3. Password chứa leading/trailing whitespace hợp lệ — không được tự trim.
4. User double-click Login.
5. User nhấn Enter liên tục trong lúc request pending.
6. Backend trả 401 cho invalid credentials.
7. Backend trả 500/generic error cho invalid credentials.
8. Network offline trong lúc login.
9. Backend trả `200 {}`.
10. Backend trả `200 {"token":""}`.
11. Backend trả JSON malformed.
12. Token còn ở `sessionStorage` nhưng đã expired server-side.
13. Stale token tồn tại khi người dùng điều hướng `/login`.
14. Hai protected API cùng trả 401 gần đồng thời — cleanup/redirect chỉ chạy idempotently.
15. User logout rồi nhấn Back.
16. Refresh trực tiếp một protected deep-link.
17. `returnTo` chứa external URL hoặc protocol-relative URL.
18. Demo account hint vô tình bật trong production build.
19. Password manager/autofill điền credential — form vẫn hoạt động đúng.
20. Slow login request kéo dài — UI vẫn thể hiện pending state và không duplicate request.
21. User toggle password visibility giữa lúc nhập và submit.
22. Tab đóng/mở lại — `sessionStorage` lifecycle tuân browser behavior, không hứa persistent login dài hạn.

---

## 16. Current vs Target gap matrix

| Capability | Current source | Target |
| --- | --- | --- |
| `/login` route | Không có | Public route |
| Login page | Không có | Full target UI |
| Username/password form | Không có | Required + accessible |
| Password visibility | Không có | Show/hide toggle |
| `POST /authenticate` | Chưa có client method | Implement auth API |
| Persist token | Chỉ có getter/clearer | Add controlled write/session bootstrap |
| Username state | Không thấy | Runtime/session display state |
| Bearer header | Có trong `httpClient` nếu token tồn tại | Reuse cho protected API |
| 401 event | `AUTH_EXPIRED_EVENT` đã phát | App-level listener cleanup + redirect |
| Route guard | Không có | Protected routes |
| Logout | Chưa thấy implementation | Client cleanup only |
| Query cache cleanup | Chưa nối auth | Clear khi 401/logout |
| Demo account display | Design/docs only | Environment-gated |
| Safe `returnTo` | Chưa có | Recommended target |
| Refresh token | Backend không có | Out of scope |
| Server logout | Backend không có | Out of scope |

---

## 17. Source traceability

| Requirement area | Source |
| --- | --- |
| Target visual | `docs/ui/web/grade_submission/screens/design/auth.png` |
| Login route/UI behavior | `docs/ui/web/grade_submission/screens/auth/auth_login.md` |
| Auth contract | `docs/modules/auth/spec.md` |
| Auth tasks/DoD | `docs/modules/auth/tasks.md` |
| Auth tests | `docs/modules/auth/test_spec.md` |
| E2E login/error/401 | `docs/e2e/auth.md` |
| Login/401/logout sequence | `docs/architecture/authentication_journey.md` |
| Stateless JWT decision | `docs/architecture/adr/0003-bearer-jwt-auth.md` |
| Route guard decision | `docs/architecture/adr/0010-route-auth-guard.md` |
| API endpoint | `docs/architecture/api_integration.md` |
| Auth functional requirements | `docs/architecture/requirements.md` |
| Auth edge cases | `docs/architecture/edge_cases.md` |
| Existing token key/get/clear | `src/core/auth/token-storage.ts` |
| Existing Bearer + 401 event | `src/core/api/http-client.ts` |
| Missing `/login`/guard evidence | `src/app/router/routes.ts`, `src/app/router/index.ts` |

---

## 18. Suggested implementation tests

| Test ID | Level | Scenario | Expected | AC refs |
| --- | --- | --- | --- | --- |
| CT-LOGIN-001 | Component | Render Login | Labels, fields, button, notices visible | 002–005 |
| CT-LOGIN-002 | Component | Toggle password eye | type toggles password/text, value unchanged | 006,033 |
| CT-LOGIN-003 | Component | Submit empty form | Required errors, no API | 007–009 |
| CT-LOGIN-004 | Component | Submit while pending | Button disabled, one request | 012 |
| UT-LOGIN-005 | Unit | Normalize username | trim boundary only | 010 |
| UT-LOGIN-006 | Unit | Password request value | exact password preserved | 010,015 |
| IT-LOGIN-007 | Integration | Valid credentials | POST, persist token, navigate | 010,013–017 |
| IT-LOGIN-008 | Integration | 200 token empty | no session, safe error | 023 |
| IT-LOGIN-009 | Integration | Invalid credentials | safe copy, no raw error/token | 021 |
| IT-LOGIN-010 | Integration | Network failure | retry possible, no token | 022 |
| UT-LOGIN-011 | Unit | Session bootstrap | token restored from sessionStorage | 018 |
| RT-LOGIN-012 | Router | Guest protected route | redirect Login before page render | 019 |
| RT-LOGIN-013 | Router | Auth user opens Login | redirect Dashboard | 020 |
| RT-LOGIN-014 | Router | External returnTo | reject/fallback Dashboard | 035 |
| IT-LOGIN-015 | Integration | Protected API | Bearer header attached | 024 |
| IT-LOGIN-016 | Integration | First 401 | auth/cache clear + Login redirect | 025,026 |
| IT-LOGIN-017 | Integration | Concurrent 401s | one logical cleanup/redirect | 026 |
| IT-LOGIN-018 | Integration | Logout | clear local session/cache, no server logout | 027,028 |
| SEC-LOGIN-019 | Security | Inspect storage/log/URL | no password/full token leak | 015,029 |
| CT-LOGIN-020 | Accessibility | Keyboard/form errors | Enter submit, focus first error, live error | 009,031,032 |
| E2E-LOGIN-021 | E2E | Login → Dashboard → reload | authenticated session persists in tab | 014,017,018 |
| E2E-LOGIN-022 | E2E | Invalid credentials | stay Login, safe error | 021 |
| E2E-LOGIN-023 | E2E | 401 protected API | cleanup and redirect Login | 025,026 |
| E2E-LOGIN-024 | E2E | Logout + deep link/back | protected content inaccessible | 027,028 |
| VIS-LOGIN-025 | Visual | Desktop/mobile snapshots | target hierarchy + no overflow | 002,034 |

---

## 19. Implementation constraints

1. Không thay đổi backend contract thành `/api/v1/auth/login`; endpoint đúng hiện tại là `/authenticate`.
2. Không phát minh logout/refresh endpoints.
3. Không persist password.
4. Không hard-code authentication bypass cho demo account.
5. Không coi token presence là server validation.
6. Không thêm role-based UI khi backend chưa có role/permission contract.
7. Không gửi Bearer cho login nếu auth adapter có thể kiểm soát việc này.
8. Reuse existing `AUTH_TOKEN_STORAGE_KEY` để tránh phá compatibility với tests/session hiện tại.
9. Reuse centralized `AUTH_EXPIRED_EVENT` hoặc thay thế có migration rõ ràng; không tạo nhiều 401 cleanup path cạnh tranh.
10. Cần mở rộng HTTP client để hỗ trợ POST hoặc auth-specific adapter nhưng vẫn giữ common error normalization.

---

## 20. Definition of Done

Login được xem là hoàn chỉnh khi:

- `/login` tồn tại và public;
- target UI bám design `auth.png` trên desktop và dùng được trên mobile;
- username/password có accessible semantics;
- required validation chạy trước request;
- password visibility toggle hoạt động;
- form gọi đúng `POST /authenticate`;
- successful login chỉ chấp nhận non-empty token;
- token được lưu trong session auth state và `sessionStorage`;
- password không được lưu/log;
- Dashboard/safe `returnTo` được điều hướng sau success;
- protected routes có guard;
- refresh tab restore session trong cùng browser tab;
- Bearer token được gắn cho protected API;
- 401 clear auth/cache + redirect Login một lần;
- logout là client-side cleanup, không gọi API không tồn tại;
- invalid credentials/network/server error hiển thị safe copy;
- demo account hint được environment-gate;
- keyboard/focus/live-region behavior đạt yêu cầu;
- component/integration/router/security/E2E tests quan trọng pass;
- production build và existing tests không regression.

---

## 21. Open questions cần chốt khi implement

Các điểm sau không nên tự suy diễn thành backend contract:

1. Có lưu `username` bằng một key `sessionStorage` riêng hay chỉ giữ memory và decode JWT subject sau refresh để display?
2. Chuẩn route cuối cùng dùng `/dashboard` hay migration sang `/app/dashboard` theo một số architecture docs cũ?
3. `reason` query dùng `expired`, `unauthorized` hay một enum thống nhất?
4. Có implement `returnTo` ngay MVP hay luôn redirect `/dashboard`?
5. Demo account hint được điều khiển bởi env flag nào?
6. Login error copy cuối cùng dùng English theo design hay Vietnamese theo product localization?
7. Có cần timeout/AbortController cho login request hay dùng browser/fetch lifecycle mặc định?

Các open question này không chặn việc implement core login flow; default an toàn là `/dashboard`, generic safe error, sessionStorage token, không external returnTo, không demo hint ở production.
