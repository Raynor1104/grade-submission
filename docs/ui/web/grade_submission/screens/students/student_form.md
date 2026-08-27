# Add / Edit Student Form

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/students.md` — `E2E-STUDENT-012`, `018`, `019`.

## Modes

| Mode | Route | Capability |
|---|---|---|
| Create | `/students/new` | Current |
| Edit | Không mount route | Blocked — backend không có update |

## API create

```http
POST /student
Authorization: Bearer <jwt>
```

```json
{ "name": "Nguyễn Văn A", "birthDate": "1980-07-31" }
```

## Layout

```text
+--------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                   Hello, Tanaka   [User] |
+--------------------------------------------------------------------------------------------------+
| [Dashboard]        [Students]      [Courses]          [Grades]                    [Logout]       |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  Student Management  |  Add Student                                                              |
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

## Current implementation rule

Create screen title nên là `ADD STUDENT`; nếu giữ template `ADD / EDIT`, Edit state phải hiển thị unavailable notice, không submit.

## Validation

- Name required sau trim.
- Birth Date required, parse được, không future theo frontend guard.
- Submit payload dùng ISO `yyyy-MM-dd`.
- Không gửi `id`.

## Success

Sau `201`, điều hướng Student Detail hoặc List và invalidate `/student/all` + Dashboard count.

## Error

Giữ input. Map 401, network/5xx và unknown response theo foundation.
