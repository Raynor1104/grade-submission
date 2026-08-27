# 401 Unauthorized / chưa đăng nhập

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

## Trigger

- Protected request thiếu Bearer token.
- Token hết hạn, sai signature hoặc malformed và backend trả 401.
- Guest deep-link protected route.

## Layout

```text
+--------------------------------------------------------------------------------+
|                            GRADE SUBMISSION SYSTEM                             |
|--------------------------------------------------------------------------------|
|                                                                                |
|                              401 UNAUTHORIZED                                  |
|                                                                                |
|                      Bạn cần đăng nhập để truy cập chức năng này.              |
|                                                                                |
|                         +-----------------------------+                        |
|                         |        Go to Login          |                        |
|                         +-----------------------------+                        |
|                                                                                |
+--------------------------------------------------------------------------------+
```

## Behavior

- Clear token, username và protected caches đúng một lần.
- Không vòng lặp redirect/retry.
- CTA điều hướng `/login` và có thể giữ `returnTo` an toàn.
- Không logout người dùng do lỗi 404/500 không liên quan auth.
- Không hiển thị raw token error.

**Test coverage:** `docs/e2e/system_states.md`, `E2E-STATE-FE-001`.
