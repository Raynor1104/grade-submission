# ADR-0007: Disable Unsupported Student/Course Edits

**Trạng thái:** Accepted

## Bối cảnh

Wireframe có Add/Edit Student và Add/Edit Course, nhưng backend chỉ hỗ trợ create/read/list/delete.

## Quyết định

- không triển khai mutation edit;
- ẩn hoặc disable nút/route Edit trong integrated MVP;
- không dùng delete + create để mô phỏng update.

## Hệ quả

Tránh đổi ID, mất Grade liên quan và hành vi không atomic. Wireframe cần cập nhật hoặc backend cần bổ sung endpoint.
