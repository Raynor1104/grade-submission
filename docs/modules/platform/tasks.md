# Platform — Tasks

**Cập nhật lần cuối:** 2026-07-22

| Task ID | Công việc | AC refs | Trạng thái |
| --- | --- | --- | --- |
| T-PLATFORM-FE-001 | Tạo API client và environment config | 01…04 | ready |
| T-PLATFORM-FE-002 | Tạo DTO mapper/view model | 05…07 | ready |
| T-PLATFORM-FE-003 | Tạo list search/pagination utilities | 08 | ready |
| T-PLATFORM-FE-004 | Tạo query keys và invalidation policy | 09 | ready |
| T-PLATFORM-FE-005 | Tạo shared feedback components | 03,04 | ready |
| T-PLATFORM-FE-006 | Cấu hình proxy/CORS deployment | 10 | partial |
| T-PLATFORM-FE-007 | Theo dõi migration sang server pagination | 08 | backlog |

## T-PLATFORM-FE-001 — API client

- Environment variable cho base URL.
- Bearer interceptor.
- JSON và 204 parsing.
- AbortController/cancellation cho list/detail request.
- 401 event de-duplication.

## T-PLATFORM-FE-002 — Mapping

- `mapStudent`, `mapCourse`, `mapGrade`.
- Reject hoặc report payload thiếu field thiết yếu ở development.
- `subject` phải map thành `name` chỉ ở presentation model.
- `score` không đổi kiểu.

## T-PLATFORM-FE-003 — List utilities

- Search không phân biệt hoa thường.
- Match Student theo ID hoặc name.
- Match Course theo code hoặc subject/name.
- Pagination dựa trên filtered total.
- Clamp page khi xóa item làm giảm số trang.

## T-PLATFORM-FE-004 — Cache

- Query key factory tập trung.
- Invalidate dashboard sau mọi mutation domain.
- Invalidate detail/list tương ứng.
- Không giữ dữ liệu của phiên trước sau logout.

## T-PLATFORM-FE-005 — Feedback

- Loading skeleton.
- Empty state.
- Inline field/form error.
- Retry notice.
- Confirm Delete modal.

## T-PLATFORM-FE-006 — Proxy

- Dev proxy path đến port 9090.
- Same-origin reverse proxy cho demo.
- Ghi tài liệu biến môi trường và lỗi CORS thường gặp.
