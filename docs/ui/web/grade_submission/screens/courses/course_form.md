# Add / Edit Course Form

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/courses.md` — `E2E-COURSE-011`, `016`, `018`.

## Modes

| Mode | Route | Capability |
|---|---|---|
| Create | `/courses/new` | Current |
| Edit | Không mount route | Blocked |

## API create

```http
POST /course
```

```json
{
  "code": "JAVA101",
  "subject": "Java Programming",
  "description": "Basic Java programming course"
}
```

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

## Validation

- Code, Course Name/subject, Description required sau trim.
- Code unique do database enforce; duplicate error chưa ổn định.
- Không tự đổi uppercase nếu chưa có product rule.

## Success

`201` → detail/list; invalidate Course list và Dashboard count.

## Edit rule

Không dùng form để gửi PUT/PATCH không tồn tại và không giả lập bằng delete-create.
