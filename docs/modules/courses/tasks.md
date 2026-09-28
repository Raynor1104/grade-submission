# Courses — Tasks

**Cập nhật lần cuối:** 2026-09-28

| Task ID | Công việc | AC refs | Trạng thái |
| --- | --- | --- | --- |
| T-COURSE-FE-001 | Tạo Course list/search/pagination | 01,02 | ready |
| T-COURSE-FE-002 | Tạo shared Create/Edit Course form và mapper | 03,07,09,10 | done |
| T-COURSE-FE-003 | Tạo Course Detail + student grades | 04,05,08 | ready |
| T-COURSE-FE-004 | Tạo delete confirmation/invalidation | 06 | ready |
| T-COURSE-FE-005 | Enable Edit route/action sau khi Update flow hoàn chỉnh | 07,10 | done |
| T-COURSE-BE-006 | Chuẩn hóa duplicate-code error | 09 | backlog |
| T-COURSE-BE-007 | Xác nhận `PUT /course/{id}` qua OpenAPI | 10 | done |
| T-COURSE-BE-008 | Thêm search/pagination API | 11 | backlog |

## Implementation notes

- Form label “Course Name” phải serialize thành `subject`.
- Không dùng delete + create để mô phỏng update.
- Create và Update trả Course với HTTP 200 theo OpenAPI local xác nhận ngày 2026-09-28.
- Không hiển thị raw database constraint name khi duplicate code.
- Sau delete phải invalidate grade queries vì cascade có thể thay đổi dữ liệu grade.
