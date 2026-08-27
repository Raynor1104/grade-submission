# Dashboard — Đặc tả

**Phụ trách:** Frontend team  
**Trạng thái:** Partial — aggregation client-side  
**Cập nhật lần cuối:** 2026-07-22

## 1. Phạm vi

Dashboard hiển thị:

- Total Students.
- Total Courses.
- Total Grades.
- Recent Activities theo wireframe, nhưng backend chưa có audit/activity API.

## 2. Data sources

| Card | API | Cách tính |
| --- | --- | --- |
| Total Students | `GET /student/all` | `students.length` |
| Total Courses | `GET /course/all` | `courses.length` |
| Total Grades | `GET /grade/all` | `grades.length` |

Ba request có thể chạy song song. Không cần tải lại nếu cache list tương ứng còn fresh.

## 3. Recent Activities

Backend hiện không có:

- Audit entity.
- Created/updated timestamps.
- Activity endpoint.
- Event stream.

Vì vậy MVP phải chọn một trong hai cách:

1. Ẩn section Recent Activities và hiển thị notice “Chưa được backend hỗ trợ”; hoặc
2. Hiển thị **Recent actions in this browser session**, ghi nhãn rõ là hoạt động cục bộ và không phải lịch sử hệ thống.

Không dùng danh sách hard-code như thể là dữ liệu thật từ server.

## 4. Error behavior

- Nếu một card lỗi, các card còn lại vẫn hiển thị.
- Card lỗi có Retry riêng hoặc nút Retry All.
- 401 được Auth xử lý tập trung.
- Dữ liệu rỗng hiển thị `0`, không hiển thị placeholder giả như `120`.

## 5. Refresh behavior

Dashboard count phải được invalidate/refetch sau:

- Create/delete Student.
- Create/delete Course.
- Create/delete Grade.

Update Grade không làm đổi count.

## 6. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-DASH-01 | Dashboard lấy ba list và hiển thị count thực | ready |
| AC-DASH-02 | Các request được thực hiện song song/cached | ready |
| AC-DASH-03 | Một card lỗi không che các card thành công | ready |
| AC-DASH-04 | Dataset rỗng hiển thị 0 | ready |
| AC-DASH-05 | Count refresh sau mutation làm đổi số bản ghi | ready |
| AC-DASH-06 | Recent Activities không giả lập dữ liệu server | ready |
| AC-DASH-07 | Activity lịch sử toàn hệ thống từ backend | blocked |
