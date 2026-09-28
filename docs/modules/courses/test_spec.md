# Courses — Đặc tả test

**Cập nhật lần cuối:** 2026-09-28

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| CT-COURSE-001 | Component | Render Course rows | ID, Code, Name, actions đúng | AC-COURSE-FE-01 |
| UT-COURSE-002 | Unit | Search code/subject | Case-insensitive, total đúng | AC-COURSE-FE-02 |
| CT-COURSE-003 | Component | Submit shared Course form | Trim values, giữ casing code và dùng `subject`, `code`, `description` | AC-COURSE-FE-03, AC-COURSE-FE-07 |
| CT-COURSE-004 | Component | Required field trống | Không gửi API | AC-COURSE-FE-03 |
| IT-COURSE-005 | Integration | Load detail | Gọi course + grades-by-course | AC-COURSE-FE-04 |
| CT-COURSE-006 | Component | Grade là A/B+/8.5 | Không parse số | AC-COURSE-FE-05 |
| IT-COURSE-007 | Integration | Confirm delete 204 | Redirect + invalidate course/grade/dashboard | AC-COURSE-FE-06 |
| CT-COURSE-008 | Component | Edit action | Điều hướng `/courses/:id/edit` | AC-COURSE-FE-07 |
| CT-COURSE-009 | Component | Detail 404 | Not-found state | AC-COURSE-FE-08 |
| CT-COURSE-010 | Component | Duplicate code generic error | Không lộ SQL/constraint detail | AC-COURSE-FE-09 |
| E2E-COURSE-011 | E2E | Login → create → view → delete | Luồng supported hoàn tất | AC-COURSE-FE-01…09 |
| IT-COURSE-012 | Integration | Create Course success/failure | Một POST; cache/navigation đúng; lỗi giữ values | AC-COURSE-FE-03,09 |
| IT-COURSE-013 | Integration | Edit preload/system states | Invalid ID không request; loading/404/retry đúng | AC-COURSE-FE-07,08,10 |
| IT-COURSE-014 | Integration | Update Course | Một PUT; list/detail/grade cache refresh; về detail | AC-COURSE-FE-07,10 |
| E2E-COURSE-015 | E2E | Login → edit → update → detail | Course metadata mới được lưu và hiển thị | AC-COURSE-FE-07,10 |
