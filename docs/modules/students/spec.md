# Students — Đặc tả frontend

**Phụ trách:** Frontend team  
**Trạng thái:** Partial — create/read/delete supported  
**Cập nhật lần cuối:** 2026-07-22

## 1. Phạm vi

- Student Management list.
- Search theo ID hoặc tên.
- Client-side pagination.
- Add Student.
- Student Detail.
- Enrolled Courses & Grades trong detail.
- Delete Student với confirmation.
- Edit Student chỉ là wireframe/backlog vì backend chưa có update endpoint.

## 2. Data model

```ts
interface StudentVm {
  id: number;
  name: string;
  birthDate: string;
}
```

Canonical field là `birthDate`. Wireframe mới dùng Birth Date nhất quán ở list, form và detail; frontend hiển thị định dạng thân thiện nhưng gửi payload ISO `yyyy-MM-dd`.

## 3. API contract

| Method | Endpoint | UI usage |
| --- | --- | --- |
| GET | `/student/all` | List, selector, dashboard count |
| GET | `/student/{id}` | Student Detail |
| POST | `/student` | Add Student |
| DELETE | `/student/{id}` | Delete Student |
| GET | `/grade/student/{studentId}` | Enrolled Courses & Grades |

Không có `PUT/PATCH /student/{id}`.

Create body:

```json
{
  "name": "Luna Lovegood",
  "birthDate": "1981-02-13"
}
```

## 4. Student Management

### Search

- Match ID theo string chính xác hoặc substring đã thống nhất.
- Match name không phân biệt hoa thường.
- Search thực hiện trên array đã tải.
- Thay đổi từ khóa reset page về 1.

### Pagination

- Mặc định 10 items/page để khớp wireframe.
- “Showing x - y of z students” dùng filtered total.
- Previous/Next disable đúng boundary.

### Actions

- View: supported.
- Delete: supported.
- Edit: hidden/disabled với tooltip “Backend hiện chưa hỗ trợ cập nhật sinh viên”.

## 5. Add Student

- Student ID là server-generated; không hiển thị input editable.
- Required: Full Name, Birth Date.
- Ngày gửi backend phải là ISO `yyyy-MM-dd`.
- Frontend có thể ngăn ngày tương lai như UX validation, nhưng phải ghi rõ backend chưa enforce ổn định.
- Thành công: chuyển Student Detail hoặc Students List và invalidate cache.

## 6. Student Detail

Tải song song:

- `GET /student/{id}`.
- `GET /grade/student/{id}`.

Grade response đã chứa nested course; bảng detail hiển thị:

- Course Code.
- Course Name từ `course.subject`.
- Grade string.

Nếu student tồn tại nhưng chưa có grade, hiển thị empty state.

## 7. Delete behavior

- Confirm modal phải nêu Student target.
- Cảnh báo grade liên quan có thể bị xóa do cascade mapping.
- Thành công `204`: quay lại list, invalidate students/grades/dashboard.
- Delete unknown ID chưa có error contract ổn định; xử lý generic failure hoặc coi 404 nếu backend được harden sau này.

## 8. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-STUDENT-FE-01 | List hiển thị ID, Name, Birth Date | ready |
| AC-STUDENT-FE-02 | Search ID/name và pagination chạy trên filtered array | ready |
| AC-STUDENT-FE-03 | Create gửi name + ISO birthDate và xử lý 201 | ready |
| AC-STUDENT-FE-04 | Detail hiển thị student và grades theo student | ready |
| AC-STUDENT-FE-05 | Grade trong detail giữ nguyên string | ready |
| AC-STUDENT-FE-06 | Delete yêu cầu confirmation và xử lý 204 | ready |
| AC-STUDENT-FE-07 | Edit không phát request unsupported | ready |
| AC-STUDENT-FE-08 | GET unknown student hiển thị 404 state | ready |
| AC-STUDENT-FE-09 | Server-side update Student | blocked |
| AC-STUDENT-FE-10 | Server-side search/pagination | backlog |
