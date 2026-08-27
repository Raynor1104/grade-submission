# Architecture Requirements

**Trạng thái:** Mixed — backend-supported, frontend-proposed và gaps

## 1. Functional requirements

### Authentication

- **FR-AUTH-01:** Login gửi username/password tới `/authenticate`.
- **FR-AUTH-02:** Token được gắn dưới dạng Bearer cho mọi request nghiệp vụ.
- **FR-AUTH-03:** Protected route không render nội dung khi không có token.
- **FR-AUTH-04:** Logout hiện tại chỉ xóa token phía client.
- **FR-AUTH-05:** Nhận `401` phải xóa auth state và điều hướng về Login/Unauthorized.

### Dashboard

- **FR-DASH-01:** Total Students lấy từ độ dài `/student/all`.
- **FR-DASH-02:** Total Courses lấy từ độ dài `/course/all`.
- **FR-DASH-03:** Total Grades lấy từ độ dài `/grade/all`.
- **FR-DASH-04:** Recent Activities chỉ hiển thị khi có nguồn dữ liệu thật; backend hiện chưa có.

### Students

- **FR-STU-01:** List Student từ `/student/all`.
- **FR-STU-02:** Search theo ID/name và pagination được thực hiện ở client cho MVP.
- **FR-STU-03:** Create Student với `name`, `birthDate`.
- **FR-STU-04:** Detail kết hợp `/student/{id}` và `/grade/student/{id}`.
- **FR-STU-05:** Delete Student có confirm dialog.
- **FR-STU-06:** Edit Student là gap, không được giả lập.

### Courses

- **FR-COURSE-01:** List Course từ `/course/all`.
- **FR-COURSE-02:** Search theo code/subject và pagination ở client.
- **FR-COURSE-03:** Create Course với `subject`, `code`, `description`.
- **FR-COURSE-04:** Detail kết hợp `/course/{id}` và `/grade/course/{id}`.
- **FR-COURSE-05:** Delete Course có confirm dialog.
- **FR-COURSE-06:** Edit Course là gap, không được giả lập.

### Grades

- **FR-GRADE-01:** List all hoặc lọc theo Student/Course.
- **FR-GRADE-02:** Khi chọn cả Student và Course, có thể gọi endpoint pair.
- **FR-GRADE-03:** Create Grade bằng POST theo pair.
- **FR-GRADE-04:** Update Grade chỉ thay đổi `score` bằng PUT.
- **FR-GRADE-05:** Delete Grade theo pair.
- **FR-GRADE-06:** `score` luôn là chuỗi.

## 2. Validation requirements

### Backend-confirmed tối thiểu

- Student: `name`, `birthDate` không null ở database.
- Course: `subject`, `code`, `description` không null; code unique.
- Grade: `score` không null; pair Student/Course unique.

### Frontend-proposed guard

- trim và yêu cầu trường text không rỗng;
- ngày phải parse được theo `yyyy-MM-dd`;
- score không rỗng, nhưng không áp dụng numeric parser hoặc allowlist;
- không gửi `id` trong create body;
- disable submit khi request đang chạy để giảm duplicate click.

Các guard phía client không thay thế validation backend.

## 3. State requirements

| State | Owner đề xuất |
|---|---|
| Student/Course/Grade API data | TanStack Vue Query |
| Token và trạng thái login | Pinia + memory/sessionStorage adapter |
| Search/filter/page | URL query params |
| Modal/form local state | Vue `ref/reactive` hoặc form library |

## 4. Non-functional requirements

- API base URL cấu hình qua environment.
- Không log JWT hoặc password.
- 401 xử lý tập trung.
- Query cache phải invalidate sau create/update/delete.
- UI có loading, empty, partial-error và retry state.
- Route và keyboard focus phải hỗ trợ accessibility cơ bản.
- Không dùng source seed IDs làm assumption.
