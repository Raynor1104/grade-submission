# Login — Implementation Plan

**Phụ trách:** Frontend team  
**Trạng thái:** Implemented — live E2E/visual verification pending  
**Cập nhật lần cuối:** 2026-09-15

## 1. Mục tiêu và phạm vi

Kế hoạch này triển khai Login MVP tại `/login` theo `login.spec-pack.md` và thiết kế `auth.png`, đồng thời hoàn thiện auth boundary dùng chung để tất cả business route chỉ render khi client có token.

### In scope

- Login page responsive theo thiết kế desktop hai cột và mobile một cột.
- Form username/password, required validation, password visibility, Enter submit, pending và safe error states.
- `POST /authenticate` không gửi Bearer token.
- Chỉ chấp nhận response có `token` là string non-empty.
- Auth session reactive, lưu token và username trong `sessionStorage`, không lưu password.
- Public `/login`, root redirect theo auth state và guard cho toàn bộ business route.
- Safe `returnTo` cho protected deep-link.
- 401 cleanup tập trung, idempotent và redirect `/login?reason=expired`.
- Client-side logout, clear protected query cache và chặn Back mở lại protected content.
- Greeting dùng username của auth session thay cho giá trị hard-code.
- Component, unit, integration/router và security tests cho các AC chính.

### Out of scope

- Registration, forgot password, SSO/OAuth/OIDC và MFA.
- Refresh token, server logout/revocation hoặc `/me`.
- Role/permission authorization và dùng JWT payload làm authority.
- Remember me hoặc `localStorage`.
- Tự động điền demo credentials hay authentication bypass.
- Thay đổi contract backend khỏi `POST /authenticate`.

## 2. Hiện trạng và baseline

| Hạng mục | Hiện trạng source | Hành động |
| --- | --- | --- |
| Login UI/route | Chưa có `LoginPage.vue` hoặc `/login` | Tạo feature và public route riêng ngoài `MainLayout` |
| Protected routes | Tất cả business route ở dưới `/` nhưng chưa có metadata/guard | Đánh dấu protected parent và thêm global guard |
| Root route | Luôn redirect `/dashboard` | Redirect `/dashboard` khi có token, `/login` khi không có token |
| Token storage | Có key, getter và clearer cho `sessionStorage` | Thêm setter; thêm username key/get/set/clear |
| Runtime auth | Chưa có | Tạo singleton reactive session, bootstrap đồng bộ từ storage |
| HTTP client | Có GET/DELETE, tự gắn Bearer và phát event khi 401 | Thêm POST cùng auth mode `include/omit`; login dùng `omit` |
| 401 lifecycle | Event đã có nhưng chưa có listener | Cài một app-level listener để clear session/cache và redirect |
| Query cache | TanStack Query đã được mount | Dùng `cancelQueries()` + `clear()` khi logout/expired |
| Logout UI | Có nút nhưng chưa có handler | `AppNav` emit action; app layer chạy cleanup và navigate |
| Greeting | Hard-code `Hello, Tanaka` | Bind username từ auth session, có fallback trung tính |
| Test/build | Vitest đã có; HTTP client đã có unit tests | Mở rộng test suite; baseline 22/22 unit tests và `npm.cmd run build` pass ngày 2026-09-15 |

Lưu ý: `docs/modules/auth/login.spec-pack.md` đang có thay đổi chưa commit của người dùng; implementation không được ghi đè hay format lại file này.

## 3. Quyết định implementation đã chốt

1. Giữ canonical route hiện tại là `/dashboard`; không migration sang `/app/dashboard` trong Login MVP.
2. Không thêm Pinia chỉ cho auth. Dùng một `reactive()` singleton nhỏ tại core auth, có API đọc/ghi/clear rõ ràng và dễ mock trong test.
3. Token và username được lưu bằng hai key `sessionStorage`. Username phục vụ greeting sau refresh; không decode JWT và không lưu password.
4. Implement `returnTo` ngay trong MVP. Chỉ chấp nhận một internal `fullPath` bắt đầu bằng `/`, không bắt đầu `//`, không có origin/protocol và resolve tới route protected đã biết; mọi giá trị khác fallback `/dashboard`.
5. Guest vào protected route được chuyển tới `/login?returnTo=<to.fullPath>`. Logout đi `/login`; 401 đi `/login?reason=expired` để không tạo redirect/retry loop.
6. Copy của Login dùng English đồng nhất với design và spec (`Login`, required errors, safe server errors).
7. Demo hint fail-closed: dùng `VITE_AUTH_DEMO_ENABLED=true` cùng `VITE_AUTH_DEMO_USERNAME` và `VITE_AUTH_DEMO_PASSWORD`; chỉ render trong Vite dev mode hoặc build `--mode demo` khi có đủ ba giá trị. Normal production build luôn ẩn.
8. Login request đi qua shared HTTP client với `auth: 'omit'`. Không gửi stale Bearer và response 401 của `/authenticate` không phát global auth-expired event.
9. 401/logout cùng gọi một client cleanup action. Action clear auth ngay, cancel/clear protected queries, rồi `router.replace`; có re-entry guard để nhiều response 401 đồng thời chỉ tạo một logical redirect.
10. Không đặt auth credential logic trong shared UI. Form có thể dùng native fields/auth-owned markup để hỗ trợ input icon, eye button, ref focus và autocomplete mà không làm phức tạp `BaseInput` cho các consumer khác.
11. Không thêm request timeout ở MVP. Login request nhận `AbortSignal` và bị abort khi page unmount; pending state vẫn chặn duplicate submit.

## 4. AC mapping

| Workstream | AC được đáp ứng | Deliverable chính |
| --- | --- | --- |
| Route và page shell | 001–002, 019–020, 034 | `/login`, protected parent, root redirect, responsive UI |
| Form semantics/validation | 003–009, 031–033 | Labels, autocomplete, eye toggle, focus lỗi, Enter/live region |
| API và submit flow | 010–013, 021–023 | POST public auth mode, duplicate guard, safe errors, token validation |
| Session và navigation | 014–018, 035–036 | Reactive session, sessionStorage, username, safe `returnTo` |
| Protected API/expiry | 024–026 | Bearer cho protected request, centralized 401 cleanup/dedup |
| Logout/security/demo | 027–030 | Client cleanup, cache clear, no secret leak, env-gated hint |

## 5. Backend và client contracts

### Backend contract giữ nguyên

```text
POST /authenticate
Content-Type: application/json

Request:  { "username": string, "password": string }
Success:  200 { "token": string }
```

Frontend trim username đúng một lần tại submit boundary nhưng giữ nguyên password. HTTP 200 chỉ thành công khi payload là object và `token.trim()` non-empty.

### Auth session contract

```ts
interface AuthSessionState {
  token: string | null
  username: string | null
  readonly isAuthenticated: boolean
}
```

Storage keys:

```text
grade-submission.auth.token
grade-submission.auth.username
```

`isAuthenticated` chỉ biểu thị token presence phía client. Backend vẫn xác thực JWT qua protected request đầu tiên.

### HTTP client contract mở rộng

```ts
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  auth?: 'include' | 'omit'
}

httpClient.post<T>(path, body, { signal, auth: 'omit' })
```

Default là `auth: 'include'` để giữ behavior hiện tại cho business API. Chỉ request có auth và token liên quan mới được phát `AUTH_EXPIRED_EVENT` khi nhận 401.

### Demo environment contract

```text
VITE_AUTH_DEMO_ENABLED=true
VITE_AUTH_DEMO_USERNAME=<public demo username>
VITE_AUTH_DEMO_PASSWORD=<public demo password>
```

Ba biến này chỉ điều khiển hint hiển thị; chúng không auto-fill và không bypass authentication. Vì `VITE_*` được bundle ra client, chúng chỉ được dùng cho tài khoản demo công khai, không dùng cho secret thật.

## 6. Files/modules bị ảnh hưởng

### Tạo mới

```text
src/
├── app/
│   └── auth/
│       └── auth-actions.ts
├── core/
│   └── auth/
│       └── auth-session.ts
└── features/
    └── auth/
        ├── api/
        │   └── auth.api.ts
        ├── model/
        │   ├── auth.types.ts
        │   └── return-to.ts
        ├── components/
        │   └── LoginForm.vue
        └── pages/
            └── LoginPage.vue
```

Vai trò:

- `auth-session.ts`: bootstrap synchronous từ storage, reactive state, set/clear session và token provider.
- `auth-actions.ts`: orchestration dùng chung cho logout/expired: clear session, cancel/clear query cache, navigate; cài/gỡ 401 listener idempotently.
- `auth.types.ts`: `LoginRequest`, `LoginResponse` và validation/result types thuộc feature.
- `auth.api.ts`: gọi đúng `/authenticate`, omit Bearer và validate response token.
- `return-to.ts`: pure validator/normalizer cho internal protected path.
- `LoginForm.vue`: credential form, field/global errors, pending, eye toggle và focus behavior.
- `LoginPage.vue`: layout brand/card, demo hint, route reason, submit orchestration và redirect success.

### Chỉnh sửa hiện có

| File | Thay đổi dự kiến |
| --- | --- |
| `src/core/auth/token-storage.ts` | Thêm controlled token setter và username storage API; SSR/window guards; trim token/username nhưng không nhận password |
| `src/core/api/http-client.ts` | Expose POST, auth mode include/omit, không phát expiry cho login, reset dedupe khi phiên mới bắt đầu |
| `src/core/config/env.ts` | Parse demo-auth flag/config theo fail-closed policy |
| `src/vite-env.d.ts` | Khai báo type cho các `VITE_*` demo variables nếu cần |
| `src/app/router/routes.ts` | Thêm public login sibling; protected metadata trên `MainLayout`; root behavior theo auth state |
| `src/app/router/index.ts` | Global guard cho guest/authenticated-login và safe `returnTo` |
| `src/main.ts` | Cài auth-expired listener trước mount; bảo đảm bootstrap auth trước navigation |
| `src/app/layouts/MainLayout.vue` | Bind username và điều phối logout action |
| `src/shared/ui/AppHeader.vue` | Nhận/display greeting từ auth session thay hard-code |
| `src/shared/ui/AppNav.vue` | Emit `logout`; giữ component presentational và accessible |
| `src/styles/_tokens.scss` | Chỉ bổ sung token màu/shadow cần cho Login nếu token hiện tại chưa đủ |
| `tests/setup.ts` | Reset sessionStorage/listener/mocks dùng chung nếu test auth cần |
| `tests/unit/http-client.spec.ts` | Test POST body, auth omit và 401 behavior |

### Test files dự kiến

```text
tests/unit/token-storage.spec.ts
tests/unit/auth-session.spec.ts
tests/unit/auth-api.spec.ts
tests/unit/return-to.spec.ts
tests/unit/login-form.spec.ts
tests/unit/login-page.spec.ts
tests/unit/auth-router.spec.ts
tests/unit/auth-actions.spec.ts
tests/unit/http-client.spec.ts
```

E2E auth tiếp tục theo scenario IDs trong `docs/e2e/auth.md`; chỉ thêm Playwright source khi repo có E2E harness/runtime phù hợp.

## 7. Implementation sequence

```text
Storage + reactive auth session
          ↓
HTTP public POST + auth API
          ↓
Router topology + guards + safe returnTo
          ↓
Login form/page + responsive design
          ↓
401 lifecycle + logout + greeting
          ↓
Security/a11y hardening
          ↓
Unit/integration/E2E verification
```

### Bước 0 — Baseline và guardrails

1. Giữ nguyên user change trong `login.spec-pack.md` và mọi unrelated change.
2. Ghi nhận baseline ngày 2026-09-15: 22/22 unit tests pass và `npm.cmd run build` pass.
3. Dùng `/dashboard`, English auth copy, `reason=expired` và safe `returnTo` như các quyết định trong mục 3.
4. Không thêm endpoint, JWT decode, demo bypass, raw credential logging hoặc persistent storage ngoài `sessionStorage`.

**Exit criteria:** baseline và contract decisions rõ ràng; không còn open question chặn core flow.

### Bước 1 — Storage và reactive auth session

1. Mở rộng `token-storage.ts` bằng setter có validation; thêm username getter/setter/clearer với key riêng.
2. Tạo `auth-session.ts`, khởi tạo token/username đồng bộ ngay khi module load để router không flash guest state.
3. Expose API tối thiểu: `setAuthenticatedSession(token, username)`, `clearAuthenticatedSession()`, `getAccessToken()` và readonly/computed state cho UI.
4. Set session ghi token + username atomically theo thứ tự an toàn; nếu storage write fail thì không để runtime/storage ở trạng thái nửa phiên.
5. Clear luôn idempotent và xóa cả hai key; không có API nào nhận/lưu password.

**Exit criteria:** reload restore đúng token/username; empty token không tạo phiên; clear gọi nhiều lần không lỗi.

### Bước 2 — HTTP POST và auth API boundary

1. Thêm `auth` option cho internal request và `httpClient.post<T>()`.
2. Với `auth: 'omit'`, không đọc/attach token và không phát auth-expired event cho 401.
3. Giữ nguyên GET/DELETE default protected behavior để không regression Student API/tests.
4. Implement `authenticate(request, signal)` tại feature API:
   - gửi JSON đúng shape tới `/authenticate`;
   - validate response là record và token là string non-empty;
   - trả token đã trim;
   - convert malformed success thành client/auth response error không chứa payload/token.
5. Bổ sung hook/reset cho expiry dedupe khi login thành công để một phiên mới luôn xử lý được 401, kể cả token string trùng trong môi trường test/demo.

**Exit criteria:** request login không có Authorization dù storage có stale token; protected GET vẫn có Bearer; login 401 không kích hoạt global cleanup.

### Bước 3 — Router topology, root resolution và safe `returnTo`

1. Đặt `/login` là route sibling public, không nằm trong `MainLayout`.
2. Đánh dấu protected parent chứa Dashboard/Students/Courses/Grades bằng `meta.requiresAuth = true`; child tự inherit qua `to.matched`.
3. Cho `/` resolve trực tiếp theo auth state: token → `/dashboard`, guest → `/login`.
4. Thêm global `beforeEach`:
   - guest → protected: redirect login với `returnTo: to.fullPath`;
   - authenticated → login: redirect safe `returnTo` hoặc `/dashboard`;
   - token presence không decode/authorize JWT.
5. Implement pure returnTo validator và test `/students?page=2`, nested/dynamic paths, `https://…`, `//evil`, encoded variants, unknown/public/login routes.
6. Dùng replace cho auth redirects để Back không hiển thị route protected đã logout; guard vẫn là lớp chặn cuối nếu history còn entry cũ.

**Exit criteria:** direct deep-link guest không mount business page; login thành công quay lại đúng internal route; external redirect bị từ chối.

### Bước 4 — Login form và page UI

1. Tạo full-viewport `LoginPage` độc lập app shell:
   - desktop hai cột gần tỷ lệ design;
   - brand/logo/hero bên trái và card bên phải;
   - mobile một cột, card xuất hiện sớm, decoration ẩn/giảm và không overflow.
2. Dùng icon hiện có từ `@lucide/vue`; mọi decoration `aria-hidden="true"`.
3. Tạo semantic `<form novalidate>` với:
   - visible labels;
   - username `autocomplete="username"`, autocapitalize off;
   - password `autocomplete="current-password"`, masked mặc định;
   - eye button `type="button"`, accessible name đổi Show/Hide password;
   - Login button `type="submit"` full-width.
4. Submit validation:
   - trim username only;
   - giữ nguyên password;
   - không gọi API nếu invalid;
   - focus username trước password theo lỗi đầu tiên;
   - field errors nối `aria-describedby` và `aria-invalid`.
5. Pending state disable submit, đổi copy/progress ổn định layout và guard trong handler để Enter/double click chỉ tạo một request.
6. Error mapping:
   - credentials failure xác định được → `Invalid username or password.`;
   - network/server → `Unable to sign in right now. Please try again.`;
   - malformed success/unknown → `Login failed. Please try again.`;
   - không render raw backend message/stack/body.
7. Global error/session-expired notice dùng một live region; `reason=expired` hiển thị safe informational copy và được announce một lần.
8. Success: set token+username, reset expiry dedupe, clear errors, redirect safe `returnTo` hoặc Dashboard; password chỉ tồn tại trong component runtime và bị dispose khi unmount.
9. Abort request khi page unmount; aborted request không ghi session hoặc hiển thị lỗi trên component đã rời trang.

**Exit criteria:** AC 002–018, 021–023 và 030–034 pass ở component/integration level.

### Bước 5 — 401 lifecycle, logout, cache và greeting

1. Tạo một app-level handler cho `AUTH_EXPIRED_EVENT`, install đúng một lần trước app mount và có teardown hook cho tests/HMR.
2. Khi expired:
   - re-entry guard chặn handler song song;
   - clear auth session ngay;
   - cancel protected in-flight queries rồi `queryClient.clear()`;
   - `router.replace('/login?reason=expired')` nếu chưa ở đúng destination;
   - reset guard sau khi lifecycle hoàn tất mà không tạo retry loop.
3. Tạo logout action dùng cùng cleanup primitive nhưng đi `/login`, không gọi HTTP và không hiển thị claim server revocation.
4. `AppNav` chỉ emit `logout`; `MainLayout` gọi action. Nút có accessible name và keyboard native behavior.
5. Bind `AppHeader` với username từ session; nếu username không có, dùng `Hello` hoặc `Hello, User`, không decode JWT.
6. Verify Back/Forward sau logout: protected guard redirect trước khi `MainLayout`/business child render; cache cũ không còn.

**Exit criteria:** một hoặc nhiều 401 đồng thời tạo một logical cleanup/redirect; logout không có network call; username restore sau reload.

### Bước 6 — Demo config, security và accessibility hardening

1. Thêm env parser fail-closed cho demo account; chỉ enable khi explicit flag và mode là dev/demo, đồng thời có đủ config values.
2. Không đưa credential/token vào URL, exception text, app log, analytics hoặc DOM ngoài demo hint được phép.
3. Search source/test snapshots để bảo đảm không có password persistence, raw JWT log hay endpoint logout/refresh giả.
4. Keyboard-only check theo order Username → Password → Eye → Login; Enter submit; focus ring rõ; không keyboard trap.
5. Kiểm tra contrast, live region không spam và touch target của eye/login.
6. Test desktop theo `auth.png`, tablet và mobile hẹp; xác minh không horizontal scroll, zoom/virtual keyboard vẫn dùng được form.

**Exit criteria:** AC 029–034 pass; production-mode render không có demo account hint.

### Bước 7 — Verification và handoff

1. Chạy unit/component/router/integration tests.
2. Chạy `npm.cmd run build` để typecheck và production bundle.
3. Chạy các E2E auth scenarios với backend thật khi runtime/harness có sẵn:
   - login → Dashboard → refresh → logout;
   - invalid credentials;
   - required validation;
   - protected request 401;
   - Bearer header;
   - stale/invalid token deep-link.
4. Review diff để loại `.only`, debug log, credential literals, external return redirect và API ngoài contract.
5. Cập nhật status/checkbox theo kết quả thật; không đánh dấu E2E pass nếu chỉ chạy mock/component tests.

## 8. State ownership và flow

| State | Owner/source of truth |
| --- | --- |
| Token, username, isAuthenticated | `core/auth/auth-session.ts` reactive singleton |
| Token/username qua reload tab | `sessionStorage` adapters |
| Username/password input | Local refs trong `LoginForm`; password không đi vào global state |
| Field/global error, password visibility, pending | Local component state |
| `returnTo`, `reason` | Vue Router query, được validate trước khi dùng |
| Business server data | TanStack Query cache, clear khi logout/401 |
| 401 de-duplication | HTTP event token key + app auth-action re-entry guard |

Normal login flow:

```text
form submit
  → local validation
  → POST /authenticate (auth omitted)
  → validate non-empty token
  → persist token + username / update reactive session
  → reset expired-event dedupe
  → router.replace(safe returnTo || /dashboard)
```

Expired session flow:

```text
protected request + Bearer
  → HTTP 401
  → one AUTH_EXPIRED_EVENT for current token
  → clear session + cancel/clear query cache
  → router.replace(/login?reason=expired)
```

## 9. Error/loading matrix

| Điều kiện | Session/storage | UI/action |
| --- | --- | --- |
| Initial login | Không đổi | Empty fields, password masked, no premature errors |
| Missing/whitespace username | Không đổi; 0 request | Username required, focus username |
| Missing password | Không đổi; 0 request | Password required, focus password nếu username valid |
| Request pending | Không đổi | Disable submit, show `Logging in...`, preserve values |
| Valid 200 token | Ghi token + username | Clear errors, replace tới safe destination |
| 200 missing/empty token | Không ghi | Generic safe login failure, enable retry |
| Credential 401/403 | Không ghi; không global-expire | Invalid credential safe copy |
| Network/5xx/malformed JSON | Không ghi | Safe retry copy; keep fields only in runtime |
| Protected API 401 | Clear auth + cache | One redirect, session-expired notice |
| Logout | Clear auth + cache | Replace `/login`; no logout request |

## 10. Test plan

### Unit

| Test | Coverage |
| --- | --- |
| Token/username storage set/get/clear, SSR guard và empty normalization | 014,016,018 |
| Auth session bootstrap, set, atomic failure cleanup và idempotent clear | 013–018 |
| Username trim nhưng password giữ byte-for-byte | 007–010,015 |
| Auth API đúng URL/body, omit Bearer, token shape validation | 010–013,023 |
| Safe returnTo chấp nhận internal protected fullPath và reject external/public/unknown | 017,035 |
| HTTP 401 protected de-dup nhưng login 401 không emit | 011,024–026 |
| Demo env parser fail closed | 030 |

### Component

| Test | Coverage |
| --- | --- |
| Render branding/card/labels/autocomplete/default mask | 002–005 |
| Eye toggle đổi type/name nhưng giữ value và không submit | 006,033 |
| Empty submit: two errors, no API, focus first invalid | 007–009 |
| Enter submit và pending double-click/Enter chỉ gọi một request | 012,031 |
| Field/global errors liên kết và live region announce | 009,021–023,032 |
| Success lưu session, không lưu password và navigate | 014–017 |
| Session-expired reason và demo hint gating | 025,030,032 |
| Mobile layout không overflow | 034 |

### Router/integration

| Test | Coverage |
| --- | --- |
| Guest `/` → Login; token `/` → Dashboard | 001,018–020 |
| Guest deep-link → Login before protected component mount | 019 |
| Authenticated `/login` → Dashboard/safe returnTo | 020,035 |
| External/protocol-relative/unknown returnTo fallback Dashboard | 035 |
| Protected request attaches Bearer | 024 |
| Concurrent 401 clears session/cache và redirects một lần | 025–026 |
| Logout clears session/cache, creates no request, Back remains guarded | 027–028 |
| Header greeting uses current/restored username | 016,018 |

### E2E

- Reuse `E2E-AUTH-FE-009` đến `E2E-AUTH-FE-014` trong `docs/e2e/auth.md`.
- Bổ sung visual snapshots desktop/mobile chỉ khi project chốt browser/viewport baseline.
- Live E2E là dependency của backend và E2E harness; unit mocked fetch không thay thế verification này.

### Verification commands

```text
npm.cmd run test:unit
npm.cmd run build
```

## 11. Rủi ro và giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
| --- | --- | --- |
| Auth session và router import vòng | App bootstrap/guard lỗi | Core session không import router; app auth actions mới import router/query client |
| Login 401 kích hoạt expired handler | Error login bị redirect/reset sai | `auth: 'omit'`; chỉ protected authenticated request emit event |
| Nhiều protected request cùng 401 | Redirect/cache cleanup lặp | Dedupe theo token ở client + re-entry guard ở app action |
| Clear cache nhưng request cũ hoàn tất sau logout | Dữ liệu protected tái xuất hiện | Cancel queries trước clear; guard chặn layout khi Back/reload |
| `returnTo` gây open redirect | Phishing/external navigation | Pure allowlist validator bằng resolved internal protected routes; fallback Dashboard |
| sessionStorage throw/quota/security mode | Runtime/storage lệch nhau | Storage adapter try/catch; fail closed và rollback/clear partial write |
| Demo credentials lọt production | Security/exposure sai môi trường | Explicit flag + dev/demo mode + production test |
| Mở rộng shared input gây regression | Student/Course/Grade UI lỗi | Dùng auth-owned composite fields; chỉ mở shared component nếu API backward-compatible |
| Backend error shape không ổn định | Sai copy hoặc leak raw exception | Map theo status/source hữu hạn, fallback generic, không render backend message |
| Không có Playwright harness | Chưa chứng minh browser critical flow | Ghi rõ E2E dependency; không báo Done cho E2E dựa trên unit tests |

## 12. Rollback strategy

- Chia implementation theo session/storage, HTTP/auth API, router, UI, lifecycle và tests để revert độc lập.
- Nếu auth UI gặp regression, có thể revert public Login route cùng guard trong một commit; không để trạng thái guard bật nhưng không có đường đăng nhập.
- Nếu `returnTo` có lỗi, fallback tạm thời luôn `/dashboard` mà vẫn giữ route protection.
- Nếu demo config chưa được pipeline hỗ trợ, giữ hint disabled; không hard-code credentials vào component.
- Nếu logout/401 cache cleanup có lỗi, ưu tiên clear toàn bộ query client thay vì allowlist chưa đầy đủ; không giữ stale protected cache để bảo toàn UX.
- Không rollback bằng cách bypass guard, hard-code token hoặc dùng `localStorage`.

## 13. Definition of Done checks

- [x] `/login` tồn tại, public và không render trong `MainLayout`.
- [x] `/` resolve theo token presence; tất cả business routes được guard trước render.
- [ ] Login UI bám `auth.png` trên desktop, dùng được trên tablet/mobile và không overflow ngang.
- [x] Form có labels, autocomplete, Enter submit, focus error và live-region behavior đúng spec.
- [x] Eye toggle accessible, không làm mất password value hoặc submit form.
- [x] Invalid form tạo 0 request; pending state chặn duplicate request.
- [x] Login gọi đúng `POST /authenticate`, JSON body đúng và không có Authorization header.
- [x] Chỉ token string non-empty mới tạo authenticated session.
- [x] Token + username restore từ `sessionStorage`; password không được persist/log/đưa vào URL.
- [x] Success redirect safe `returnTo` hoặc `/dashboard`; external returnTo bị chặn.
- [x] Protected request tiếp tục gắn Bearer; client không dùng JWT decode làm authorization.
- [x] Protected 401 clear auth/query cache và redirect một lần với safe expired message.
- [x] Logout chỉ cleanup client, không gọi endpoint và Back không render cached protected content.
- [x] App greeting không còn hard-code username.
- [x] Demo hint chỉ xuất hiện trong explicit dev/demo environment; production build xác nhận hidden mặc định.
- [x] Unit/component/router/integration tests quan trọng pass.
- [ ] E2E auth critical flows pass, hoặc dependency backend/harness được ghi rõ là chưa verify.
- [x] `npm.cmd run build` pass và không regression existing tests.
- [x] Auth implementation không có debug log, raw JWT, credential literal, `.only`, refresh/logout endpoint giả hoặc unrelated file changes.

## 14. Implementation result — 2026-09-15

Đã hoàn thành Login UI và client auth flow theo kế hoạch, gồm public route, protected guard, safe `returnTo`, session restore, public authentication request, 401 lifecycle, logout/cache cleanup và session greeting.

Automated verification hiện tại:

```text
npm.cmd run test:unit  → 8 files, 43 tests passed
npm.cmd run build      → passed
```

Live E2E với backend và visual regression snapshots chưa chạy vì repository hiện không có Playwright/browser E2E harness. Responsive CSS đã được implement theo desktop/tablet/mobile breakpoints nhưng checklist visual vẫn để mở cho browser review thực tế.
