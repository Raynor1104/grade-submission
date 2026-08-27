# Grades — Tasks

**Cập nhật lần cuối:** 2026-07-22

| Task ID | Công việc | AC refs | Trạng thái |
| --- | --- | --- | --- |
| T-GRADE-FE-001 | Tạo Grade list và filter query selection | 01…03 | ready |
| T-GRADE-FE-002 | Tạo Submit Grade form | 04,07,08 | ready/partial |
| T-GRADE-FE-003 | Tạo Update Grade form | 05,07 | ready |
| T-GRADE-FE-004 | Tạo Delete Grade confirmation | 06 | ready |
| T-GRADE-FE-005 | Tạo cache invalidation matrix | 09 | ready |
| T-GRADE-BE-006 | Chuẩn hóa duplicate pair error | 08,10 | backlog |
| T-GRADE-BE-007 | Chốt score policy/validation | 07 | backlog |
| T-GRADE-BE-008 | Thêm server pagination | 10 | backlog |

## Cache invalidation matrix

| Mutation | Invalidate |
| --- | --- |
| Create | `grades.all`, byStudent, byCourse, pair, dashboard |
| Update | `grades.all`, byStudent, byCourse, pair |
| Delete | `grades.all`, byStudent, byCourse, pair, dashboard |

## Implementation notes

- Selector labels: `Student Name - ID`, `Course Code - Course Name`.
- Update form không cho đổi Student/Course.
- Score input dùng text, không dùng `type=number`.
- Pair 404 khi filter là empty result; pair 404 khi mở edit route là not-found page.
