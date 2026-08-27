# Grade Submission — UI Design Pack (Web)

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

- **Platform:** Web
- **Application:** Grade Submission System
- **Audience:** Frontend, Backend, QA, BA
- **Authentication:** JWT Bearer
- **Current backend base URL:** `http://localhost:9090`
- **Intent:** chuyển 12 màn hình wireframe thành đặc tả triển khai có kiểm soát capability.

## Screen inventory

| Nhóm | Màn hình | Screen doc | Backend support |
|---|---|---|---|
| Auth | Login | `screens/auth/auth_login.md` | Current |
| Dashboard | Dashboard | `screens/dashboard.md` | Counts current; activities blocked |
| Students | List | `screens/students/students_list.md` | Current + client filter/page |
| Students | Add/Edit form | `screens/students/student_form.md` | Create current; edit blocked |
| Students | Detail | `screens/students/student_detail.md` | Current, composed view |
| Courses | List | `screens/courses/courses_list.md` | Current + client filter/page |
| Courses | Add/Edit form | `screens/courses/course_form.md` | Create current; edit blocked |
| Courses | Detail | `screens/courses/course_detail.md` | Current, composed view |
| Grades | List/filter | `screens/grades/grades_list.md` | Current |
| Grades | Submit/Update | `screens/grades/grade_form.md` | Current |
| Shared | 401 Unauthorized | `screens/_foundation/05_error_401_unauthorized.md` | Current |
| Shared | Confirm Delete | `screens/Shared/confirm_delete_modal.md` | Current UI pattern |

## Capability differences from wireframe

- `Edit Student` và `Edit Course` xuất hiện trong wireframe nhưng backend không có `PUT/PATCH`; UI production phải ẩn/disable entry point và ghi rõ lý do.
- `Recent Activities` chưa có API; không hiển thị dữ liệu giả như activity thật.
- Search và pagination của Student/Course chạy trên collection `/all` ở client.
- Dashboard counts là độ dài của ba collection; không có statistics endpoint.
- Logout chỉ xóa token/caches phía client; JWT không bị revoke trên server.

## Visual handoff status

| Màn hình | ASCII source | Hi-fi | Runtime screenshot |
|---|---|---|---|
| Login | Available | Pending | Pending |
| Dashboard | Available | Pending | Pending |
| Students List/Form/Detail | Available | Pending | Pending |
| Courses List/Form/Detail | Available | Pending | Pending |
| Grades List/Form | Available | Pending | Pending |
| 401 / Confirm Delete | Available | Pending | Pending |

Không ghi link Figma hoặc screenshot placeholder như artifact đã tồn tại.
