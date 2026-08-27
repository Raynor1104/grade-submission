# Course Management — List

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/courses.md` — `E2E-COURSE-012`, `013`, `018`.

## Route và access

- Route: `/courses`
- Access: authenticated

## API

`GET /course/all`; search/pagination phía client.

## Layout

```text
+--------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                   Hello, Tanaka   [User] |
+--------------------------------------------------------------------------------------------------+
| [Dashboard]        [Students]        [Courses]        [Grades]                      [Logout]     |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  Course Management  |  List                                                                      |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |  +-------------------------------------------+                       +------------------+  |  |
|  |  | Search by course name or code             |                       |  + Add Course    |  |  |
|  |  +-------------------------------------------+                       +------------------+  |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  | ID   | Course Code | Course Name                        | Actions                          |  |
|  |------+-------------+------------------------------------+----------------------------------|  |
|  | 1    | JAVA101     | Java Programming                   | [ View ] [ Edit ] [ Delete ]     |  |
|  |------+-------------+------------------------------------+----------------------------------|  |
|  | 2    | DBI202      | Database Systems                   | [ View ] [ Edit ] [ Delete ]     |  |
|  |------+-------------+------------------------------------+----------------------------------|  |
|  | 3    | SWT301      | Software Testing                   | [ View ] [ Edit ] [ Delete ]     |  |
|  |------+-------------+------------------------------------+----------------------------------|  |
|  | 4    | NET205      | Computer Networks                  | [ View ] [ Edit ] [ Delete ]     |  |
|  |------+-------------+------------------------------------+----------------------------------|  |
|  | 5    | SE302       | Software Engineering               | [ View ] [ Edit ] [ Delete ]     |  |
|  |------+-------------+------------------------------------+----------------------------------|  |
|  | 6    | UIX210      | UX Fundamentals                    | [ View ] [ Edit ] [ Delete ]     |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|  Showing 1-10 of 18 courses                  (i) Edit is currently unavailable.                  |
|                                                     [ Previous ] [1] [2] [3] [...] [ Next ]      |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

## Mapping

- UI `Course Name` ← API `subject`.
- Search case-insensitive trên `code`, `subject`; có thể hỗ trợ ID như enhancement nhưng placeholder chỉ cam kết name/code.

## Actions

- Add → `/courses/new`.
- View → `/courses/:id`.
- Delete → confirm + `DELETE /course/{id}`.
- Edit → Blocked; hide/disable.

## States

Loading, empty, no filter results, duplicate/list error, delete success/error.
