# Student Detail

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/students.md` — `E2E-STUDENT-015`, `016`, `017`.

## Route và access

- Route: `/students/:studentId`
- Access: authenticated

## API composition

- `GET /student/{studentId}` — profile.
- `GET /grade/student/{studentId}` — enrolled courses & grades.

Grade response đã nhúng Course, nên bảng liên quan lấy `grade.course.code`, `grade.course.subject`, `grade.score`.

## Layout

```text
+--------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                   Hello, Tanaka   [User] |
+--------------------------------------------------------------------------------------------------+
| [Dashboard]        [Students]      [Courses]          [Grades]                    [Logout]       |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  Student Management  |  Student Detail                                                           |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |                                                                                            |  |
|  |  [User] Student Information                                                                |  |
|  |                                                                                            |  |
|  |  Student ID                                                                                |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | Auto-generated after saving                                                          |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Student ID is created by the system.                                                      |  |
|  |                                                                                            |  |
|  |  Full Name *                                                                               |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | Nguyen Van A                                                                         |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |                                                                                            |  |
|  |  Birth Date *                                                                              |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | 1980/07/31                                                                [Calendar] |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Display format: yyyy/MM/dd                                                                |  |
|  |                                                                                            |  |
|  |                                                                                            |  |
|  |                                                        [ Save Student ]    [ Cancel ]      |  |
|  |                                                                                            |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|                          © 2025 Grade Submission System. All rights reserved.                    |
+--------------------------------------------------------------------------------------------------+
```

## Actions

- Back → `/students`.
- Edit Student → Blocked/disabled per capability matrix.
- Delete có thể đặt tại detail hoặc list nếu implementation chọn, luôn qua confirm dialog.

## States

- Profile 404 → Student Not Found.
- Grades empty → empty related table, không phải error.
- Grades request error nhưng profile thành công → partial-error section.
- Score render nguyên string.
