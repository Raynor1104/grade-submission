# E2E traceability matrix

## 1. Wireframe → Journey

| Wireframe | Journey |
| --- | --- |
| 1. Login | `auth.md` |
| 2. Main layout / Dashboard | `access_control.md`, `dashboard.md` |
| 3. Student Management | `students.md` |
| 4. Add/Edit Student | Create trong `students.md`; Edit blocked |
| 5. Course Management | `courses.md` |
| 6. Add/Edit Course | Create trong `courses.md`; Edit blocked |
| 7. Grade Management | `grades.md` |
| 8. Submit/Update Grade | `grades.md` |
| 9. Student Detail | `students.md` |
| 10. Course Detail | `courses.md` |
| 11. 401 | `auth.md`, `system_states.md` |
| 12. Confirm Delete | `system_states.md` và domain journeys |

## 2. Acceptance Criteria → Core E2E

| AC group | Core E2E |
| --- | --- |
| `AC-GS-*` | `E2E-GS-007` |
| `AC-AUTH-FE-*` | `E2E-AUTH-FE-009` đến `014` |
| `AC-DASH-*` | `E2E-DASH-007` đến `011` |
| `AC-STUDENT-FE-*` | `E2E-STUDENT-012` đến `019` |
| `AC-COURSE-FE-*` | `E2E-COURSE-011` đến `018` |
| `AC-GRADE-FE-*` | `E2E-GRADE-011` đến `019` |
| `AC-PLATFORM-FE-*` | Cross-cutting scenarios và `E2E-PLATFORM-FE-011` |

## 3. Journey → Backend endpoint

| Journey | Endpoints |
| --- | --- |
| Auth | `POST /authenticate` |
| Dashboard | `GET /student/all`, `/course/all`, `/grade/all` |
| Students | `GET/POST/DELETE /student/**`, `GET /grade/student/{id}` |
| Courses | `GET/POST/DELETE /course/**`, `GET /grade/course/{id}` |
| Grades | `GET/POST/PUT/DELETE /grade/**` |
| 401 | Mọi protected endpoint không có/invalid Bearer |
| Readiness | `GET /v3/api-docs` |

## 4. Blocked traceability

| UI capability | Lý do |
| --- | --- |
| Edit Student | Không có `PUT/PATCH /student/{id}` |
| Edit Course | Không có `PUT/PATCH /course/{id}` |
| Recent Activities | Không có activity/audit endpoint hoặc timestamp |
| Role-based UI | Backend chỉ dùng `authenticated()` |
| Server-side search/pagination | Backend chỉ có `/all` |
| Server logout | Không có revoke/logout endpoint |
