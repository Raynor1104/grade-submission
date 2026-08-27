# Mục lục kiến trúc — Grade Submission Frontend Wireframe

**Phụ trách:** Frontend team  
**Trạng thái:** Proposed frontend architecture + implementation-aligned backend contract  
**Cập nhật lần cuối:** 2026-07-22

## Nguyên tắc đọc tài liệu

Mỗi nội dung được phân loại theo ba trạng thái:

| Trạng thái | Ý nghĩa |
|---|---|
| **Backend-supported** | Có endpoint hoặc hành vi được tài liệu backend xác nhận |
| **Frontend-proposed** | Quyết định thiết kế frontend được đề xuất từ mẫu kiến trúc Vue 3 |
| **Gap / Planned** | Wireframe yêu cầu nhưng backend hiện chưa hỗ trợ hoặc chưa có contract ổn định |

Khi có mâu thuẫn, thứ tự ưu tiên là:

1. Backend source/test và tài liệu implementation-aligned.
2. API contract của backend.
3. Wireframe cho mục tiêu giao diện.
4. Các quyết định đề xuất trong folder này.

## Nội dung

### Tài liệu kiến trúc chính

- `system_context.md` — actor, boundary và dependency hệ thống
- `wireframe_scope.md` — phạm vi 12 màn hình
- `wireframe_alignment.md` — các điểm khớp, lệch và quyết định canonical
- `source_structure.md` — cấu trúc source Vue 3 đề xuất
- `api_integration.md` — endpoint, payload, authentication và error mapping
- `data_model.md` — DTO backend và view model frontend
- `requirements.md` — yêu cầu chức năng, validation và phi chức năng
- `assumptions_constraints.md` — giả định và ràng buộc hiện tại
- `authentication_journey.md` — đăng nhập, route guard, logout cục bộ và 401
- `dashboard_journey.md` — cách tổng hợp dữ liệu dashboard
- `student_journey.md` — danh sách, tạo, chi tiết và xóa sinh viên
- `course_journey.md` — danh sách, tạo, chi tiết và xóa khóa học
- `grade_journey.md` — lọc, tạo, cập nhật và xóa điểm
- `edge_cases.md` — failure modes và cách UI phản ứng
- `traceability.md` — ánh xạ wireframe → API → trạng thái hỗ trợ
- `decision_log.md` — danh sách quyết định và trạng thái
- `rollout_migration.md` — lộ trình prototype → MVP → production
- `open_questions.md` — câu hỏi cần chốt với backend/product

### Architecture Decision Records

Xem `adr/README.md`.

### Tài liệu tham chiếu

- `references/wireframe.md` — bản sao nguyên trạng của file wireframe do người dùng cung cấp; không được âm thầm chỉnh sửa trong quá trình tạo architecture.

## Cách đọc đề xuất

1. Đọc `system_context.md` và `assumptions_constraints.md`.
2. Đọc `wireframe_alignment.md` trước khi triển khai UI.
3. Dùng `api_integration.md` và các journey để viết feature.
4. Dùng `traceability.md` để xác định màn hình nào có thể hoàn thiện ngay.
5. Dùng `open_questions.md` và `rollout_migration.md` cho phần còn thiếu.
