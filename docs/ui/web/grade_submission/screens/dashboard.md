# Dashboard

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/dashboard.md` — `E2E-DASH-007` đến `011`.

## Route và access

- Route: `/dashboard`
- Access: authenticated

## API aggregation

- `GET /student/all` → Total Students.
- `GET /course/all` → Total Courses.
- `GET /grade/all` → Total Grades.
- Mọi request có `Authorization: Bearer <jwt>`.

Không có activity/audit endpoint.

## Layout

```text
+----------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                     Hello, Tanaka   [User] |
+----------------------------------------------------------------------------------------------------+
| [Dashboard]      [Students]        [Courses]          [Grades]                        [Logout]     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  Dashboard                                                                                         |
|                                                                                                    |
|  +----------------------------+   +----------------------------+   +----------------------------+  |
|  |                            |   |                            |   |                            |  |
|  |  [Students] Total Students |   |  [Course] Total Courses    |   |  [Grade] Total Grades      |  |
|  |                            |   |                            |   |                            |  |
|  |             120            |   |              18            |   |             450            |  |
|  |                            |   |                            |   |                            |  |
|  +----------------------------+   +----------------------------+   +----------------------------+  |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  |                                                                                              |  |
|  |  Recent Activities                                                                           |  |
|  |                                                                                              |  |
|  |                                         (i)                                                  |  |
|  |                                                                                              |  |
|  |                           No activity data source available.                                 |  |
|  |                                                                                              |  |
|  |                  Recent activities are unavailable in the current                            |  |
|  |                              backend capability.                                             |  |
|  |                                                                                              |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                                                                    |
|  ------------------------------------------------------------------------------------------------  |
|                          © 2025 Grade Submission System. All rights reserved.                      |
+----------------------------------------------------------------------------------------------------+
```

## Behavior

- Ba card query độc lập; partial error không che card khác.
- Mutation ở domain invalidate collection và count liên quan.
- Empty collection hiển thị `0`.
- Recent Activities: ẩn panel hoặc hiển thị informative unavailable state; không dùng các dòng ví dụ wireframe như dữ liệu production.

## States

Loading per-card, loaded, partial error, all-error, empty counts.
