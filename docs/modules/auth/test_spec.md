# Auth — Đặc tả test

**Cập nhật lần cuối:** 2026-07-22

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| CT-AUTH-FE-001 | Component | Submit thiếu username/password | Hiển thị required errors, không gọi API | AC-AUTH-FE-01 |
| IT-AUTH-FE-002 | Integration | Credentials hợp lệ | Lưu token, redirect Dashboard | AC-AUTH-FE-02 |
| SEC-AUTH-FE-003 | Unit | Inspect storage/log calls | Password không được lưu/log | AC-AUTH-FE-03 |
| UT-AUTH-FE-004 | Unit | Khởi tạo store có session token | Token được restore | AC-AUTH-FE-04 |
| IT-AUTH-FE-005 | Integration | Gọi protected API | Bearer header đúng | AC-AUTH-FE-05 |
| IT-AUTH-FE-006 | Integration | API trả 401 | Clear token/cache, redirect login một lần | AC-AUTH-FE-06 |
| CT-AUTH-FE-007 | Component | Click Logout | Không gọi server logout; state được xóa | AC-AUTH-FE-07 |
| CT-AUTH-FE-008 | Component | Login 401 hoặc generic failure | Thông báo an toàn, không lộ exception | AC-AUTH-FE-08 |
| E2E-AUTH-FE-009 | E2E | Login demo → refresh → logout | Phiên tồn tại qua refresh rồi bị xóa khi logout | AC-AUTH-FE-02,04,07 |
