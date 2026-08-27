# Course Detail

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/courses.md` — `E2E-COURSE-014`, `015`, `017`.

## Route và access

- Route: `/courses/:courseId`
- Access: authenticated

## API composition

- `GET /course/{courseId}` — course info.
- `GET /grade/course/{courseId}` — students taking this course.

Grade response nhúng Student; rows dùng `grade.student.id`, `grade.student.name`, `grade.score`.

## Layout

```text
+--------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                   Hello, Tanaka   [User] |
+--------------------------------------------------------------------------------------------------+
| [Dashboard]        [Students]        [Courses]        [Grades]                      [Logout]     |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  Course Management  |  Detail                                                                    |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |                                                                                            |  |
|  |  (i) Course Information                                                                    |  |
|  |                                                                                            |  |
|  |  Course Code *                                                                             |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | JAVA101                                                                              |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Enter a unique code for the course (e.g., JAVA101)                                        |  |
|  |                                                                                            |  |
|  |  Course Name (Subject) *                                                                   |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | Java Programming                                                                     |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Enter the name of the course                                                              |  |
|  |                                                                                            |  |
|  |  Description *                                                                             |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | Basic Java programming course                                                        |  |  |
|  |  |                                                                                      |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Enter a brief description of the course                                                   |  |
|  |                                                                                            |  |
|  |  ----------------------------------------------------------------------------------------  |  |
|  |                                                        [ Save Course ]    [ Cancel ]       |  |
|  |                                                                                            |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|                          © 2025 Grade Submission System. All rights reserved.                    |
+--------------------------------------------------------------------------------------------------+
```

## Actions

- Back → `/courses`.
- Edit Course → Blocked/disabled.
- Delete nếu đặt ở detail phải dùng confirm + cascade warning.

## States

Course 404, empty grades, partial grades error, loaded. Grade string render nguyên bản.
