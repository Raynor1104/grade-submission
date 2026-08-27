# Error Code Registry

**Phụ trách:** Frontend + Backend teams  
**Trạng thái:** Frontend normalization current; backend registry target  
**Cập nhật lần cuối:** 2026-07-22

## 1. Current source behavior

Backend chưa trả `code` ổn định cho mọi lỗi. Frontend dùng mã nội bộ để điều khiển UI, nhưng phải lưu raw status/details để debug an toàn.

## 2. Frontend internal codes

| Status | Code | UI meaning |
| --- | --- | --- |
| 0 | `NETWORK_ERROR` | Không kết nối được backend |
| 400 | `BAD_REQUEST` | Request không hợp lệ |
| 401 | `UNAUTHENTICATED` | Token thiếu/sai/hết hạn |
| 403 | `FORBIDDEN` | Không có quyền |
| 404 | `RESOURCE_NOT_FOUND` | Detail hoặc resource không tồn tại |
| 409 | `CONFLICT` | Duplicate/resource conflict |
| 500+ | `SERVER_ERROR` | Lỗi server không dự kiến |

## 3. Target backend registry

| HTTP | Code |
| --- | --- |
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHENTICATED` |
| 404 | `STUDENT_NOT_FOUND` |
| 404 | `COURSE_NOT_FOUND` |
| 404 | `GRADE_NOT_FOUND` |
| 409 | `COURSE_CODE_EXISTS` |
| 409 | `GRADE_ALREADY_EXISTS` |
| 409 | `RESOURCE_IN_USE` |
| 500 | `INTERNAL_SERVER_ERROR` |

## 4. Rules

- Client logic dựa vào status/code, không parse English message.
- Message hiển thị có thể i18n.
- Không hiển thị stack trace, SQL, JWT hoặc secret.
- Mỗi code mới cần contract test và mapping UI.
