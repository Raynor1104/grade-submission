# Platform — Đặc tả test

**Cập nhật lần cuối:** 2026-07-22

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| UT-PLATFORM-FE-001 | Unit | API client có token | Gửi Bearer header | AC-PLATFORM-FE-01,02 |
| UT-PLATFORM-FE-002 | Unit | Response 204 | Trả `undefined`, không JSON parse error | AC-PLATFORM-FE-03 |
| UT-PLATFORM-FE-003 | Unit | Body `{message,status,timestamp}` | Map đúng ApiError | AC-PLATFORM-FE-04 |
| UT-PLATFORM-FE-004 | Unit | Body `{error:"Unauthenticated"}` | Map status/message và phát auth event | AC-PLATFORM-FE-04 |
| UT-PLATFORM-FE-005 | Unit | Course entity có `subject` | CourseVm có `name` tương ứng | AC-PLATFORM-FE-05 |
| UT-PLATFORM-FE-006 | Unit | Birth date `1980-07-31` | Không lệch ngày sau format/submit | AC-PLATFORM-FE-06 |
| UT-PLATFORM-FE-007 | Unit | Scores `A`, `B+`, `8.5` | Giữ nguyên string | AC-PLATFORM-FE-07 |
| UT-PLATFORM-FE-008 | Unit | Search + page | Total/page dựa trên filtered list | AC-PLATFORM-FE-08 |
| UT-PLATFORM-FE-009 | Unit | Filter thay đổi ở page > 1 | Reset page về 1 | AC-PLATFORM-FE-08 |
| IT-PLATFORM-FE-010 | Integration | Mutation thành công | Invalidate đúng list/detail/dashboard keys | AC-PLATFORM-FE-09 |
| E2E-PLATFORM-FE-011 | E2E | Portal gọi backend qua proxy | Không có CORS failure | AC-PLATFORM-FE-10 |
