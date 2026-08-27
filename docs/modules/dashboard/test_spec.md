# Dashboard — Đặc tả test

**Cập nhật lần cuối:** 2026-07-22

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| CT-DASH-001 | Component | 3/2/5 entities | Cards hiển thị 3, 2, 5 | AC-DASH-01 |
| IT-DASH-002 | Integration | Mount Dashboard | Ba query có thể chạy song song hoặc dùng cache | AC-DASH-02 |
| CT-DASH-003 | Component | Student query lỗi, hai query thành công | Chỉ Student card báo lỗi | AC-DASH-03 |
| CT-DASH-004 | Component | Ba list rỗng | Hiển thị 0 cho cả ba | AC-DASH-04 |
| IT-DASH-005 | Integration | Create Student thành công | Student count được invalidate/refetch | AC-DASH-05 |
| CT-DASH-006 | Component | Không có activity API | Không render activity hard-code như dữ liệu thật | AC-DASH-06 |
| E2E-DASH-007 | E2E | Login và mở Dashboard | Count khớp response backend | AC-DASH-01…04 |
