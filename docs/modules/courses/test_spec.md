# Courses — Đặc tả test

**Cập nhật lần cuối:** 2026-07-22

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| CT-COURSE-001 | Component | Render Course rows | ID, Code, Name, actions đúng | AC-COURSE-FE-01 |
| UT-COURSE-002 | Unit | Search code/subject | Case-insensitive, total đúng | AC-COURSE-FE-02 |
| CT-COURSE-003 | Component | Submit Add Course | Request dùng `subject`, `code`, `description` | AC-COURSE-FE-03 |
| CT-COURSE-004 | Component | Required field trống | Không gửi API | AC-COURSE-FE-03 |
| IT-COURSE-005 | Integration | Load detail | Gọi course + grades-by-course | AC-COURSE-FE-04 |
| CT-COURSE-006 | Component | Grade là A/B+/8.5 | Không parse số | AC-COURSE-FE-05 |
| IT-COURSE-007 | Integration | Confirm delete 204 | Redirect + invalidate course/grade/dashboard | AC-COURSE-FE-06 |
| CT-COURSE-008 | Component | Edit action | Hidden/disabled | AC-COURSE-FE-07 |
| CT-COURSE-009 | Component | Detail 404 | Not-found state | AC-COURSE-FE-08 |
| CT-COURSE-010 | Component | Duplicate code generic error | Không lộ SQL/constraint detail | AC-COURSE-FE-09 |
| E2E-COURSE-011 | E2E | Login → create → view → delete | Luồng supported hoàn tất | AC-COURSE-FE-01…09 |
