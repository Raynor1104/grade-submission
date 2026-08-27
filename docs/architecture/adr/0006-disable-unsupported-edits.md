# ADR-0006: Disable unsupported student/course edits

## Bối cảnh
Wireframe có Edit nhưng backend không có update endpoint.

## Quyết định
Không mô phỏng update bằng create/delete. Ẩn hoặc disable action có giải thích.

## Hệ quả
### Tích cực
- tránh mất dữ liệu và hành vi sai contract
- minh bạch với người dùng

### Tiêu cực
- MVP chưa đạt đủ wireframe
