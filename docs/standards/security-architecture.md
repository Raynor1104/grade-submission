# Security Architecture

**Phụ trách:** Frontend + Backend security reviewers  
**Trạng thái:** Current JWT contract + frontend target  
**Cập nhật lần cuối:** 2026-07-22

## 1. Current authentication

- Public: `POST /authenticate`.
- JWT HS256, subject=username, TTL 24 giờ.
- Protected API dùng Bearer header.
- Stateless; CSRF disabled.
- Không refresh/revoke/logout server-side.
- Không role/permission.

## 2. Token storage

Backend chỉ cung cấp Bearer token; frontend demo phải chọn storage có ghi chú rủi ro.

- Không lưu token trong URL.
- Không log token.
- Không đưa token vào analytics/error reports.
- `sessionStorage` được ưu tiên cho demo để giảm persistence; vẫn có XSS risk.
- Production cần threat-model lại và cân nhắc BFF/HttpOnly cookie nếu contract thay đổi.

## 3. Route guard

Guard chỉ kiểm tra auth state/token để điều hướng UX. Mọi response `401` từ backend vẫn là nguồn xác nhận cuối cùng.

## 4. Login

- Password field không log, không persist.
- Disable double submit khi request đang chạy.
- Generic error không tiết lộ username tồn tại hay không.
- Demo credentials chỉ hiển thị trong môi trường demo đã chấp nhận.

## 5. CSRF, ETag, idempotency

Không gửi hoặc mô tả các header này là current contract. Bearer token không tự động được browser gắn như cookie; backend hiện tắt CSRF.

## 6. XSS và output

- Render text bằng binding an toàn; tránh raw HTML.
- Không dùng `v-html` cho dữ liệu backend nếu chưa sanitize.
- Cấu hình CSP là production target.

## 7. Transport và CORS

- Production dùng HTTPS.
- CORS allowlist phải ở backend/reverse proxy.
- Dev dùng same-origin proxy khi có thể.

## 8. Logging

Được log: status, endpoint template, timing, correlation client-side.  
Không log: password, JWT, Authorization header, full sensitive payload.
