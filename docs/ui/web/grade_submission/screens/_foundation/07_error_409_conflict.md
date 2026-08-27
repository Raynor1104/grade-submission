# Duplicate or conflict state

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

## Current limitation

Backend chưa chuẩn hóa duplicate constraint thành HTTP 409 ổn định. UI vẫn cần một presentation contract an toàn.

## Các trường hợp

- Course `code` đã tồn tại.
- Grade pair `(studentId, courseId)` đã tồn tại.
- Constraint/framework response không có error envelope chuẩn.

## UI behavior

- Không hiển thị SQL, class name hoặc stack trace.
- Giữ form values.
- Copy ưu tiên:
  - `Mã khóa học đã tồn tại.`
  - `Sinh viên đã có điểm cho khóa học này.`
- Nếu không phân loại được: `Không thể lưu vì dữ liệu xung đột. Vui lòng kiểm tra và thử lại.`
- Không retry create tự động.

## Không áp dụng

Student/Course chưa có optimistic version/ETag; không mô tả stale-version conflict như current behavior.
