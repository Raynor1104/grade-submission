# ADR-0003: Stateless Bearer JWT integration

## Bối cảnh
Backend cấp JWT qua `/authenticate`, không dùng session và không có logout endpoint.

## Quyết định
Frontend lưu token phía client, thêm Bearer header, xóa token khi logout/401.

## Hệ quả
### Tích cực
- khớp backend hiện tại
- triển khai đơn giản

### Tiêu cực
- token không revoke được
- web storage cần bảo vệ khỏi XSS
- không có `/me` để bootstrap danh tính
