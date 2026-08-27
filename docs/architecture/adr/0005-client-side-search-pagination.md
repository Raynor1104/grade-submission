# ADR-0005: Client-side search and pagination for MVP

## Bối cảnh
Backend chỉ có endpoint `/all`; giả định dataset nhỏ.

## Quyết định
MVP tải toàn bộ rồi lọc và phân trang phía client.

## Hệ quả
### Tích cực
- không cần đổi backend
- đáp ứng wireframe nhanh

### Tiêu cực
- không phù hợp dữ liệu lớn
- dashboard/list có thể tải thừa

## Ghi chú
Phải thay bằng server-side pagination khi quy mô tăng.
