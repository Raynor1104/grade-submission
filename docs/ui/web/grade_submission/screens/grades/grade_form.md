# Submit / Update Grade

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/grades.md` — `E2E-GRADE-011`, `016`, `017`, `018`, `019`.

## Routes

- Create: `/grades/new`.
- Update: `/grades/:studentId/:courseId/edit`.

## APIs

Create:

```http
POST /grade/student/{studentId}/course/{courseId}
```

Update:

```http
PUT /grade/student/{studentId}/course/{courseId}
```

Body: `{"score":"A"}`.

Delete: `DELETE /grade/student/{studentId}/course/{courseId}`.

## Layout

```text
+--------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                   Hello, Tanaka   [User] |
+--------------------------------------------------------------------------------------------------+
| [Dashboard]        [Students]        [Courses]          [Grades]                    [Logout]     |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  Grade Management  |  Submit / Update Grade                                                      |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |                                                                                            |  |
|  |  [Grade] Grade Information                                                                 |  |
|  |                                                                                            |  |
|  |  Student *                                                                                 |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | Nguyen Van A - ID: 1                                                               v |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Read-only. Student cannot be changed.                                                     |  |
|  |                                                                                            |  |
|  |  Course *                                                                                  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | JAVA101 - Java Programming                                                         v |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Read-only. Course cannot be changed.                                                      |  |
|  |                                                                                            |  |
|  |  Grade *                                                                                   |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  | 8.5                                                                                  |  |  |
|  |  +--------------------------------------------------------------------------------------+  |  |
|  |  Enter the grade as text (e.g., A, B+, Pass, 8.5).                                         |  |
|  |                                                                                            |  |
|  |  ----------------------------------------------------------------------------------------  |  |
|  |                                             [ Save Grade ] [ Delete Grade ] [ Cancel ]     |  |
|  |                                                                                            |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                                                                  |
|                          © 2025 Grade Submission System. All rights reserved.                    |
+--------------------------------------------------------------------------------------------------+
```

## Mode behavior

### Create

- Student/Course selectable từ collection endpoints.
- Delete button hidden.
- Duplicate pair error giữ values.

### Update

- Student/Course read-only theo path pair.
- Load current grade bằng pair GET.
- Chỉ gửi `score` trong update body.
- Delete button visible và mở confirm dialog.

## Validation

- Student, Course, score required.
- Score trim và non-empty.
- Không parse number, không enforce letter-grade allowlist.

## Success

Invalidate grade queries, related Student/Course detail và Dashboard grade count. Delete `204` không parse body.
