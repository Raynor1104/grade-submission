# Login

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-30

**Test coverage:** `docs/e2e/auth.md` — `E2E-AUTH-FE-009`, `010`, `014`.

## Mục đích

Xác thực tài khoản demo và nhận JWT để truy cập toàn bộ business APIs.

## Route và access

- Route: `/login`
- Access: Public
- Authenticated user mở route này có thể chuyển `/dashboard`.

## API

```http
POST /authenticate
Content-Type: application/json
```

```json
{ "username": "username", "password": "password" }
```

Success `200`: `{"token":"<jwt>"}`.

## Layout

```text
+-----------------------------------------------------------------------------------------------------+
|                                                                                                     |
|  [BOOK] GRADE SUBMISSION SYSTEM                                                                     |
|         ----------- Learning Management System -----------                                          |
|                                                                                                     |
|                                                                                                     |
|        Submit grades more                       +----------------------------------------------+    |
|        accurately and more securely.            |                                              |    |
|                                                 |                   [LOCK]                     |    |
|        A safe and reliable system that          |                                              |    |
|        faculty and staff can use with           |                   Login                      |    |
|        confidence.                              |                   -----                      |    |
|                                                 |                                              |    |
|                                                 |  Username                                    |    |
|                                                 |  +---------------------------------------+   |    |
|                                                 |  | Enter your username                   |   |    |
|                                                 |  +---------------------------------------+   |    |
|                                                 |                                              |    |
|                                                 |  Password                                    |    |
|                                                 |  +---------------------------------------+   |    |
|                                                 |  | Enter your password              [Eye]|   |    |
|                                                 |  +---------------------------------------+   |    |
|                                                 |                                              |    |
|                                                 |  +---------------------------------------+   |    |
|                                                 |  |                 Login                 |   |    |
|                                                 |  +---------------------------------------+   |    |
|                                                 |                                              |    |
|                                                 |  (i) Demo account: username / password       |    |
|                                                 |                                              |    |
|                                                 |  ---------------------------------------     |    |
|                                                 |                                              |    |
|                                                 |  [LOCK] Access restricted to authorized      |    |
|                                                 |         faculty and staff only               |    |
|                                                 |                                              |    |
|                                                 +----------------------------------------------+    |
|                                                                                                     |
+-----------------------------------------------------------------------------------------------------+
```

## Behavior

- Required validation trước request.
- Disable Login khi submitting.
- Không lưu password.
- Success: lưu token + username trong store và `sessionStorage`, chuyển Dashboard.
- Error: vì backend error chưa ổn định, hiển thị generic safe copy.
- Demo account chỉ hiển thị trong demo environment.

## States

Default, invalid fields, submitting, invalid credentials, network/server error.

## Accessibility

- Username `autocomplete=username`.
- Password `autocomplete=current-password`.
- Error summary có live region.

## Logout

## Capability

**Frontend-only.** Backend không có logout hoặc token revocation endpoint.

## Flow

1. Người dùng chọn `Logout`.
2. Xóa JWT và username khỏi memory/store và `sessionStorage`.
3. Clear Student/Course/Grade query cache.
4. Điều hướng `/login`.
5. Không tuyên bố token đã bị thu hồi.

## UI states

- Action có thể thực hiện ngay, không cần confirm dialog.
- Sau logout, Back browser không được render cached protected data.
- Login page không tự hiển thị password cũ.

## Security note

Nếu token đã bị sao chép, token đó vẫn có thể dùng đến khi hết hạn 24 giờ. Đây là giới hạn backend hiện tại.

**Test coverage:** `docs/e2e/auth.md`, scenario `E2E-AUTH-FE-009`.
