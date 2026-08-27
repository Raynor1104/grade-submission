# Component Patterns

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

## 1. Phân loại

- Shared primitives: Button, Input, Select, Table, Pagination, Dialog, Alert.
- Feature components: StudentTable, CourseForm, GradeForm.
- Pages: route-level orchestration.
- Layouts: LoginLayout, MainLayout.

Không đưa business API calls trực tiếp vào shared primitive.

## 2. List page pattern

Mỗi list page phải có:

- loading skeleton/state;
- error + retry;
- empty state;
- search/filter state;
- client pagination;
- action availability;
- delete confirmation.

Pagination phải reset khi search/filter thay đổi.

## 3. Form pattern

- Form model tách khỏi API DTO.
- Disable submit khi đang gửi.
- Giữ giá trị khi lỗi.
- Field error và form error tách biệt.
- Cancel quay lại mà không mutation.
- Student ID server-managed.
- Grade score dùng text input, không `type=number`.

## 4. Action pattern

- `Edit Student`/`Edit Course`: hidden hoặc disabled + explanation vì backend thiếu update.
- Delete: luôn có confirm dialog; message nêu ảnh hưởng grade liên quan.
- Grade Edit: dùng PUT theo pair student-course.

## 5. Detail page pattern

- Lấy entity chính và dữ liệu liên quan độc lập.
- Student detail: student + grades theo student.
- Course detail: course + grades theo course.
- Không giả định parent detail nhúng grade.

## 6. Accessibility

Dialog có focus trap, label, Escape behavior; table actions có accessible name; errors liên kết với field bằng `aria-describedby`.
