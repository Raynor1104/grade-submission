# Grades — Đặc tả test

**Cập nhật lần cuối:** 2026-07-22

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| CT-GRADE-001 | Component | Render Grade rows | Student/Course/score đúng | AC-GRADE-FE-01 |
| UT-GRADE-002 | Unit | Không filter | Chọn `/grade/all` | AC-GRADE-FE-02 |
| UT-GRADE-003 | Unit | Student-only/Course-only/both | Chọn đúng endpoint | AC-GRADE-FE-02 |
| CT-GRADE-004 | Component | Pair filter trả 404 | Hiển thị no-results, không global 404 | AC-GRADE-FE-03 |
| CT-GRADE-005 | Component | Submit score `A` | POST pair với `{score:"A"}` | AC-GRADE-FE-04 |
| CT-GRADE-006 | Component | Update form | Student/Course read-only; PUT chỉ score | AC-GRADE-FE-05 |
| IT-GRADE-007 | Integration | Delete 204 | Redirect/invalidate đúng | AC-GRADE-FE-06,09 |
| UT-GRADE-008 | Unit | Score `B+`, `Pass`, `8.5` | Không parse/normalize | AC-GRADE-FE-07 |
| CT-GRADE-009 | Component | Duplicate pair lỗi không chuẩn hóa | Generic safe message | AC-GRADE-FE-08 |
| IT-GRADE-010 | Integration | Create/update/delete | Invalidation matrix đúng | AC-GRADE-FE-09 |
| E2E-GRADE-011 | E2E | Login → create grade → update → delete | Luồng hoàn tất | AC-GRADE-FE-01…09 |
