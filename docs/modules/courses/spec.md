# Courses — Đặc tả frontend

**Phụ trách:** Frontend team  
**Trạng thái:** Partial — create/read/delete supported  
**Cập nhật lần cuối:** 2026-07-22

## 1. Phạm vi

- Course Management list.
- Search theo code hoặc name.
- Client-side pagination.
- Add Course.
- Course Detail.
- Students Taking This Course.
- Delete Course với confirmation.
- Edit Course bị chặn do backend chưa có update endpoint.

## 2. Field mapping

| UI label | Backend field |
| --- | --- |
| Course ID | `id` |
| Course Code | `code` |
| Course Name | `subject` |
| Description | `description` |

View model có thể dùng `name`, nhưng API mapper phải chuyển đúng sang `subject`.

## 3. API contract

| Method | Endpoint | UI usage |
| --- | --- | --- |
| GET | `/course/all` | List, selector, dashboard count |
| GET | `/course/{id}` | Course Detail |
| POST | `/course` | Add Course |
| DELETE | `/course/{id}` | Delete Course |
| GET | `/grade/course/{courseId}` | Students Taking This Course |

Create body:

```json
{
  "subject": "Software Architecture",
  "code": "SA-401",
  "description": "Architecture fundamentals"
}
```

## 4. Course Management

- Search không phân biệt hoa thường trên `code` và `subject`.
- Pagination phía client, mặc định 10 items/page.
- View và Delete supported.
- Edit hidden/disabled.
- Duplicate code được DB enforce nhưng backend error chưa thân thiện; frontend chỉ hiển thị generic save failure nếu không nhận được stable conflict.

## 5. Add Course

Required fields theo database:

- Course Code.
- Course Name/Subject.
- Description.

Frontend nên trim và validate required fields. Uppercase code có thể là UX convenience nhưng không được tự coi là server rule nếu chưa được chốt.

## 6. Course Detail

Tải song song:

- `GET /course/{id}`.
- `GET /grade/course/{id}`.

Grade response chứa nested student, cho phép hiển thị:

- Student ID.
- Student Name.
- Grade string.

## 7. Delete behavior

- Confirm modal hiển thị Course code/name.
- Cảnh báo grade liên quan có thể bị xóa do cascade mapping.
- Success `204`: quay list và invalidate courses/grades/dashboard.
- Unknown delete behavior chưa ổn định.

## 8. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-COURSE-FE-01 | List hiển thị ID, Code, Name và actions | ready |
| AC-COURSE-FE-02 | Search code/name và pagination phía client | ready |
| AC-COURSE-FE-03 | Create map Course Name sang `subject` và xử lý 201 | ready |
| AC-COURSE-FE-04 | Detail hiển thị course và grades theo course | ready |
| AC-COURSE-FE-05 | Grade trong detail giữ nguyên string | ready |
| AC-COURSE-FE-06 | Delete confirm và xử lý 204 | ready |
| AC-COURSE-FE-07 | Edit không gọi API unsupported | ready |
| AC-COURSE-FE-08 | GET unknown course hiển thị 404 | ready |
| AC-COURSE-FE-09 | Duplicate code có error message ổn định | partial/blocked |
| AC-COURSE-FE-10 | Backend update Course | blocked |
| AC-COURSE-FE-11 | Server-side search/pagination | backlog |
