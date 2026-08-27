# Students — Tasks

**Cập nhật lần cuối:** 2026-07-22

| Task ID | Công việc | AC refs | Trạng thái |
| --- | --- | --- | --- |
| T-STUDENT-FE-001 | Tạo Student list/search/pagination | 01,02 | ready |
| T-STUDENT-FE-002 | Tạo Add Student form | 03 | ready |
| T-STUDENT-FE-003 | Tạo Student Detail + grades | 04,05,08 | ready |
| T-STUDENT-FE-004 | Tạo delete confirmation và invalidation | 06 | ready |
| T-STUDENT-FE-005 | Disable/hide edit flow | 07 | ready |
| T-STUDENT-BE-006 | Thêm update endpoint | 09 | blocked/backlog |
| T-STUDENT-BE-007 | Thêm search/pagination API | 10 | backlog |

## Implementation notes

- Không dùng Student ID input trong create form.
- Dùng `birthDate` nhất quán trong Student list, create form và detail.
- Không dùng delete + create để sửa Student.
- Student list mapper phải chịu được dữ liệu seed và dữ liệu user-created.
- Sau delete, clamp current page nếu page cuối trở thành rỗng.
