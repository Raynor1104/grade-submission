# Auth — Tasks

**Cập nhật lần cuối:** 2026-07-22

| Task ID | Công việc | AC refs | Trạng thái |
| --- | --- | --- | --- |
| T-AUTH-FE-001 | Tạo Login screen và form validation | 01,03 | ready |
| T-AUTH-FE-002 | Tạo auth API/store/session persistence | 02,04,05 | ready |
| T-AUTH-FE-003 | Tạo route guard và 401 interceptor | 05,06 | ready |
| T-AUTH-FE-004 | Tạo client-side logout | 07 | ready |
| T-AUTH-FE-005 | Chuẩn hóa login error adapter | 08 | partial |
| T-AUTH-FE-006 | Backend refresh/logout strategy | ngoài MVP | backlog |

## Definition of Done

- Form có accessible labels và submit bằng Enter.
- Không log credentials/token.
- Double submit bị chặn.
- Token restore chỉ từ sessionStorage.
- 401 handler không tạo redirect loop.
- Logout clear query cache.
- Demo account được thể hiện là dữ liệu hướng dẫn, không hard-code tự động điền trong production build.
