# Grade Submission — Đặc tả test

**Cập nhật lần cuối:** 2026-07-22

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| CT-GS-001 | Component | Render app shell ở route Students | Students active, các menu còn lại inactive | AC-GS-03 |
| RT-GS-002 | Router | Truy cập protected route không có token | Redirect `/login` | AC-GS-01 |
| IT-GS-003 | Integration | Protected request có token | Header Bearer được gửi | AC-GS-02 |
| IT-GS-004 | Integration | API trả 401 | Token/cache bị xóa, redirect login | AC-GS-04 |
| CT-GS-005 | Component | Click Logout | Client state bị xóa, không gọi endpoint logout giả | AC-GS-05 |
| CT-GS-006 | Component | List loading/empty/error | Render đúng state, layout không vỡ | AC-GS-06 |
| E2E-GS-007 | E2E | Login → Dashboard → Students → Courses → Grades | Navigation hoạt động xuyên module | AC-GS-01…06 |
| CT-GS-008 | Component | Student table/detail | Chỉ hiển thị Birth Date theo canonical model | AC-GS-08 |
| UT-GS-009 | Unit | Map grade `A`, `B+`, `8.5` | Giá trị giữ nguyên string | AC-GS-09 |
| CT-GS-010 | Component | Backend chưa có update Student/Course | Edit hidden/disabled; không phát request | AC-GS-07 |
