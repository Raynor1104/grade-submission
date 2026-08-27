# ADR-0004: Separate backend DTO and UI view model

## Bối cảnh
Tên field backend `subject` được hiển thị bằng nhãn thân thiện `Course Name`; `birthDate` được giữ nhất quán giữa backend và wireframe.

## Quyết định
Dùng adapter chuyển DTO thành view model; không sửa dữ liệu bằng mapping ngầm hoặc tạo field giả.

## Hệ quả
### Tích cực
- UI ít phụ thuộc serialization
- mismatch được thể hiện rõ

### Tiêu cực
- thêm code mapping và test
