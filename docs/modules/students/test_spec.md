# Students — Đặc tả test

**Cập nhật lần cuối:** 2026-09-22

| Test ID | Level | Scenario | Mong đợi | AC ref |
| --- | --- | --- | --- | --- |
| CT-STUDENT-001 | Component | Render Student rows | Có ID, Name và Birth Date đúng dữ liệu/định dạng | AC-STUDENT-FE-01 |
| UT-STUDENT-002 | Unit | Search name/id | Kết quả đúng, case-insensitive cho name | AC-STUDENT-FE-02 |
| UT-STUDENT-003 | Unit | Filter ở page 3 | Reset page 1, total đúng | AC-STUDENT-FE-02 |
| CT-STUDENT-004 | Component | Submit valid create form | Body chỉ có name/birthDate ISO | AC-STUDENT-FE-03 |
| CT-STUDENT-005 | Component | Submit future/invalid date | Frontend notice, không gửi request | AC-STUDENT-FE-03 |
| IT-STUDENT-006 | Integration | Load detail | Gọi student + grades-by-student và render join | AC-STUDENT-FE-04 |
| CT-STUDENT-007 | Component | Scores A/B+/8.5 | Hiển thị nguyên chuỗi | AC-STUDENT-FE-05 |
| CT-STUDENT-008 | Component | Click Delete rồi Cancel | Không gọi API | AC-STUDENT-FE-06 |
| IT-STUDENT-009 | Integration | Confirm Delete 204 | Redirect list và invalidate caches | AC-STUDENT-FE-06 |
| CT-STUDENT-010 | Component | Render Edit action | Điều hướng Edit đúng Student | AC-STUDENT-FE-07 |
| CT-STUDENT-011 | Component | Detail API 404 | Not-found state + Back | AC-STUDENT-FE-08 |
| E2E-STUDENT-012 | E2E | Login → create → view → delete | Luồng supported hoàn tất | AC-STUDENT-FE-01…08 |

## Student Management implementation coverage — 2026-09-09

| Test source | Level | Coverage chính | AC ref |
| --- | --- | --- | --- |
| `tests/unit/student-list.spec.ts` | Unit | Search name/ID, whitespace, filter → paginate, parse/clamp page | AC-STUDENT-MGMT-005…011, 021, 031 |
| `tests/unit/student-mapper-and-date.spec.ts` | Unit | DTO mapping, invalid payload, date-only display/fallback | AC-STUDENT-MGMT-002…004 |
| `tests/unit/http-client.spec.ts` | Unit | Bearer header, JSON/204, 401 de-dup, backend/network error normalization | AC-STUDENT-MGMT-002, 019, 025, 026 |
| `tests/unit/student-components.spec.ts` | Component | Toolbar, semantic table, actions, Edit disabled, dialog copy/pending/error | AC-STUDENT-MGMT-003, 004, 012…019, 026…030 |
| `tests/unit/students-page.spec.ts` | Integration | Mock list không gọi HTTP, URL state, no-result, Add/View, Cancel/focus, local delete/dedup/clamp | Current mock-data override |

Ghi chú: bảng coverage 2026-09-09 là snapshot cũ. Student Management hiện dùng API query và Edit đã được bật.

## Student Form implementation coverage — 2026-09-22

| Test source | Level | Coverage chính | AC ref |
| --- | --- | --- | --- |
| `tests/unit/student-form.spec.ts` | Unit/component/integration | Trim, calendar/date-only, shared form Create/Edit, POST payload, Create error/success | AC-STUDENT-FORM-001…018, 023–025, 033–035 |
| `tests/unit/student-edit-page.spec.ts` | Integration | ID validation, GET preload/404/retry, route đổi ID, PUT một lần, error giữ draft | AC-STUDENT-FORM-019…022, 026–030, 036–038 |
| `tests/unit/student-components.spec.ts` | Component | Edit action emit đúng Student | AC-STUDENT-FORM-027 |

Live E2E Create/Edit với backend/auth vẫn cần chạy trong môi trường trình duyệt; unit/integration tests dùng mocked HTTP.
