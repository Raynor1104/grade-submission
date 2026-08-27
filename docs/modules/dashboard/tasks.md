# Dashboard — Tasks

**Cập nhật lần cuối:** 2026-07-22

| Task ID | Công việc | AC refs | Trạng thái |
| --- | --- | --- | --- |
| T-DASH-001 | Tạo count cards từ query cache/list API | 01,02,04 | ready |
| T-DASH-002 | Tạo independent loading/error states | 03 | ready |
| T-DASH-003 | Kết nối invalidation từ domain mutations | 05 | ready |
| T-DASH-004 | Thay Recent Activities bằng unsupported/session notice | 06 | ready |
| T-DASH-005 | Backend audit/activity API | 07 | blocked/backlog |

## T-DASH-004 — Activity policy

Mặc định khuyến nghị cho MVP: hiển thị panel với nội dung:

> Recent Activities chưa có dữ liệu từ backend hiện tại.

Nếu nhóm chọn session-local activity:

- Gắn nhãn “Trong phiên trình duyệt này”.
- Không persist qua logout.
- Không gọi đó là lịch sử hệ thống.
