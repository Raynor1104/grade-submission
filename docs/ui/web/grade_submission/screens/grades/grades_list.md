# Grade Management — List and Filter

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/grades.md` — `E2E-GRADE-012` đến `015`.

## Route và access

- Route: `/grades`
- Access: authenticated

## Filter-to-endpoint mapping

| Student | Course | Endpoint |
|---|---|---|
| Không | Không | `GET /grade/all` |
| Có | Không | `GET /grade/student/{studentId}` |
| Không | Có | `GET /grade/course/{courseId}` |
| Có | Có | `GET /grade/student/{studentId}/course/{courseId}` |

Options lấy từ `GET /student/all` và `GET /course/all`.

Pair endpoint trả object hoặc 404; UI chuyển object thành một row, 404 thành no-results trong filter context.

## Layout

```text
+--------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                   Hello, Tanaka   [User] |
+--------------------------------------------------------------------------------------------------+
| [Dashboard]        [Students]        [Courses]          [Grades]                    [Logout]     |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  Grade Management  |  List                                                                       |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |  Filter                                                              +-------------------+ |  |
|  |                                                                      | + Submit New Grade| |  |
|  |  Student                     Course                                  +-------------------+ |  |
|  |  +------------------------+   +------------------------+   +----------+                    |  |
|  |  | Select Student       v |   | Select Course        v |   | Search   |                    |  |
|  |  +------------------------+   +------------------------+   +----------+                    |  |
|  |                                                                                            |  |
|  |  ----------------------------------------------------------------------------------------  |  |
|  |                                                                                            |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | Student | Student Name | Course  | Course Name           | Grade | Action            |  |  |
|  |  | ID      |              | Code    |                       |       |                   |  |  |
|  |  |---------+--------------+---------+-----------------------+-------+-------------------|  |  |
|  |  | 1       | Nguyen Van A | JAVA101 | Java Programming      | A     | [ Edit ]          |  |  |
|  |  |---------+--------------+---------+-----------------------+-------+-------------------|  |  |
|  |  | 2       | Tran Thi B   | DBI202  | Database Systems      | B+    | [ Edit ]          |  |  |
|  |  |---------+--------------+---------+-----------------------+-------+-------------------|  |  |
|  |  | 3       | Le Van C     | SWT301  | Software Testing      | 8.5   | [ Edit ]          |  |  |
|  |  |---------+--------------+---------+-----------------------+-------+-------------------|  |  |
|  |  | 4       | Pham Minh D  | NET205  | Computer Networks     | Pass  | [ Edit ]          |  |  |
|  |  |---------+--------------+---------+-----------------------+-------+-------------------|  |  |
|  |  | 5       | Hoang Lan E  | SE302   | Software Engineering  | A-    | [ Edit ]          |  |  |
|  |  |---------+--------------+---------+-----------------------+-------+-------------------|  |  |
|  |  | 6       | Sakura Ito   | UIX210  | UX Fundamentals       | B     | [ Edit ]          |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |                                                                                            |  |
|  |  Showing 1-6 of 24 grades                          [ Previous ] [1] [2] [3] [...] [ Next ] |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|                          © 2025 Grade Submission System. All rights reserved.                    |
+--------------------------------------------------------------------------------------------------+
```

## Behavior

- Search button áp dụng selected filters.
- Clear filter quay về `/grade/all`.
- Grade score hiển thị string, không numeric formatting.
- Client pagination áp dụng trên response list hiện tại.
- Edit → grade form với pair route.
- Submit New Grade → `/grades/new`.

## States

Option loading/error, list loading, empty, pair-not-found as empty, generic error.
