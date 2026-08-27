# Student Management — List

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/students.md` — `E2E-STUDENT-013`, `014`, `019`.

## Route và access

- Route: `/students`
- Access: authenticated

## API

`GET /student/all` trả toàn bộ Student. Search, sort mặc định và pagination chạy phía client.

## Layout

```text
+------------------------------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                                       Hello, Tanaka   [User] |
+------------------------------------------------------------------------------------------------------+
| [Dashboard]        [Students]      [Courses]          [Grades]                          [Logout]     |
+------------------------------------------------------------------------------------------------------+
|                                                                                                      |
|  Student Management  |  List                                                                         |
|                                                                                                      |
|  +------------------------------------------------------------------------------------------------+  |
|  |  +-------------------------------------------+                          +-------------------+  |  |
|  |  | Search by student name or ID              |                          |  + Add Student    |  |  |
|  |  +-------------------------------------------+                          +-------------------+  |  |
|  |                                                                                                |  |
|  |  +------------------------------------------------------------------------------------------+  |  |
|  |  | ID   | Student Name                    | Birth Date     | Actions                        |  |  |
|  |  |------+---------------------------------+----------------+--------------------------------|  |  |
|  |  | 1    | Nguyen Van A                    | 1980/07/31     | [ View ] [ Edit ] [ Delete ]   |  |  |
|  |  |------+---------------------------------+----------------+--------------------------------|  |  |
|  |  | 2    | Tran Thi B                      | 1980/07/30     | [ View ] [ Edit ] [ Delete ]   |  |  |
|  |  |------+---------------------------------+----------------+--------------------------------|  |  |
|  |  | 3    | Le Van C                        | 1980/07/29     | [ View ] [ Edit ] [ Delete ]   |  |  |
|  |  |------+---------------------------------+----------------+--------------------------------|  |  |
|  |  | 4    | Pham Minh D                     | 1980/07/28     | [ View ] [ Edit ] [ Delete ]   |  |  |
|  |  |------+---------------------------------+----------------+--------------------------------|  |  |
|  |  | 5    | Hoang Lan E                     | 1980/07/27     | [ View ] [ Edit ] [ Delete ]   |  |  |
|  |  |------+---------------------------------+----------------+--------------------------------|  |  |
|  |  | 6    | Sakura Ito                      | 1980/07/26     | [ View ] [ Edit ] [ Delete ]   |  |  |
|  |  +------------------------------------------------------------------------------------------+  |  |
|  |                                                                                                |  |
|  |  Showing 1-10 of 120 students                (i) Edit is currently unavailable.                |  |
|  |                                                      [ Previous ] [1] [2] [3] [...] [ Next ]   |  |
|  +------------------------------------------------------------------------------------------------+  |
|                                                                                                      |
|                          © 2025 Grade Submission System. All rights reserved.                        |
+------------------------------------------------------------------------------------------------------+
```

## Data mapping

- `birthDate` response ISO `yyyy-MM-dd` → display `yyyy/MM/dd`.
- Search case-insensitive trên `name` và string `id`.
- Page size mặc định 10; filter change reset page 1.

## Actions

- Add → `/students/new`.
- View → `/students/:id`.
- Delete → Confirm Delete rồi `DELETE /student/{id}`.
- Edit → **Blocked**; hide hoặc disable, tuyệt đối không gửi request.

## States

Loading, empty collection, no search results, delete pending/error/success, list error retry.

## Cascade warning

Student có relation grades cascade; delete dialog phải cảnh báo điểm liên quan có thể bị xóa.
