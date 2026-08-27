# Traceability

**Phụ trách:** Frontend + QA teams  
**Trạng thái:** Normative  
**Cập nhật lần cuối:** 2026-07-22

## Mapping

| AC group | Canonical module | Standards chính | Evidence target |
| --- | --- | --- | --- |
| `AC-GS-*` | `../modules/grade_submission/spec.md` | component, accessibility, security | routes/layout/E2E |
| `AC-PLATFORM-FE-*` | `../modules/platform/spec.md` | API, mapping, state, errors | apiClient/unit tests |
| `AC-AUTH-FE-*` | `../modules/auth/spec.md` | security, errors | auth store/login/E2E |
| `AC-DASH-*` | `../modules/dashboard/spec.md` | state, adapter | count aggregation tests |
| `AC-STUDENT-FE-*` | `../modules/students/spec.md` | date, validation, mapping | student feature tests |
| `AC-COURSE-FE-*` | `../modules/courses/spec.md` | mapping, validation | course feature tests |
| `AC-GRADE-FE-*` | `../modules/grades/spec.md` | score validation, mapping | grade feature tests |

## Change table template

| AC | Task | Code | Test | Backend dependency | Status |
| --- | --- | --- | --- | --- | --- |
| `AC-...` | `T-...` | path | test ID | endpoint/gap | Planned/Done |

## Minimum evidence

- Mapper/formatter: unit test.
- Component behavior: component test.
- HTTP contract: integration/contract test.
- User journey: E2E.
- Backend-only gap: link tài liệu backend và mark blocked/backlog.
