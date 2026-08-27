# Grade Submission — Tasks

**Cập nhật lần cuối:** 2026-07-22

| Task ID | Công việc | AC refs | Trạng thái |
| --- | --- | --- | --- |
| T-GS-001 | Tạo Vue app shell và route tree | AC-GS-01,03 | ready |
| T-GS-002 | Tích hợp auth bootstrap và route guard | AC-GS-01,02,04,05 | ready |
| T-GS-003 | Tạo layout states dùng chung | AC-GS-06 | ready |
| T-GS-004 | Tích hợp bốn feature route chính | AC-GS-03 | ready |
| T-GS-005 | Khóa các edit action chưa được backend hỗ trợ | AC-GS-07 | ready |
| T-GS-006 | Chuẩn hóa Student/Grade view model toàn portal | AC-GS-08,09 | ready |
| T-GS-007 | Cấu hình dev proxy và deployment same-origin | AC-GS-10 | partial |

## T-GS-001 — App shell

- Tạo header, navigation và content outlet.
- Tạo active menu state từ router.
- Responsive tối thiểu cho table overflow và form width.
- Không để feature module import trực tiếp component nội bộ của feature khác.

## T-GS-002 — Auth bootstrap

- Dùng auth store quản lý token và username hiển thị.
- Route guard kiểm tra token presence.
- API interceptor xử lý 401 tập trung.
- Logout xóa auth state, query cache và chuyển `/login`.

## T-GS-003 — Shared states

- Loading panel/table skeleton.
- Empty state phân biệt empty dataset và no search results.
- Error notice có Retry cho lỗi mạng/5xx.
- Confirm Delete modal dùng chung, có target label và impact warning.

## T-GS-004 — Feature integration

- Lazy-load Dashboard, Students, Courses và Grades.
- Giữ route name/path trong một cấu hình tập trung.
- Cấu hình breadcrumbs hoặc back navigation cho detail/form.

## T-GS-005 — Unsupported edit safety

- Ẩn hoặc disable Edit Student/Course.
- Không gọi `PUT/PATCH` không tồn tại.
- Không dùng delete + create để mô phỏng update vì làm đổi ID và có thể xóa grade cascade.

## T-GS-006 — Model normalization

- Dùng `birthDate` ở list/form/detail Student.
- Map UI Course Name ↔ API `subject`.
- Giữ `score: string` không parse sang number.

## T-GS-007 — Browser integration

- Dev server proxy đến `http://localhost:9090`.
- Production demo dùng reverse proxy same-origin nếu backend chưa có CORS allowlist.
- Không dùng `no-cors`.
