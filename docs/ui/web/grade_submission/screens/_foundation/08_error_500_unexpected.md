# 500 and Network Error States

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-08-03

## Server and network errors

## Trigger

- Bad credentials hiện có thể đi qua generic exception/500.
- Malformed JWT có thể đi vào container error flow.
- Database constraint/error chưa chuẩn hóa.
- Network offline, timeout hoặc response success body không đúng schema.

## UI contract

- Thông báo chung, không lộ implementation detail.
- Login failure: `Đăng nhập thất bại. Kiểm tra thông tin và thử lại.`
- Domain page: `Không thể tải dữ liệu. Vui lòng thử lại.`
- Form: giữ input và cho submit lại.
- Table/card: có Retry tại đúng vùng lỗi.
- Ghi log kỹ thuật chỉ gồm endpoint template, status và timing; không log JWT/password.

## Retry

- GET có thể retry thủ công hoặc giới hạn tự động.
- POST/DELETE không tự retry để tránh mutation lặp; backend không có idempotency contract.
