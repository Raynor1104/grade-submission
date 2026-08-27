# Wireframe Alignment Review

**Trạng thái:** Review against backend contract  
**Cập nhật lần cuối:** 2026-07-22

Tài liệu này không sửa nguồn wireframe. Nó xác định representation canonical để triển khai.

## 1. Các điểm đã khớp backend

- Login dùng `username` và `password`.
- Student list, form và detail đều dùng `Birth Date`.
- Course có `subject/name`, `code`, `description`.
- Grade có thể hiển thị `A`; backend lưu `score` là chuỗi.
- Grade được xác định bởi cặp Student + Course.
- Có màn hình 401 và xác nhận xóa.

## 2. Các điểm còn cần ánh xạ với backend

| Vị trí | Wireframe hiện tại | Backend canonical | Quyết định triển khai |
|---|---|---|---|
| Grade list | Ví dụ `A` | `score: String` | Hợp lệ |
| Grade form/detail | Ví dụ `8.5`, `7.8`, `9.0` | `score: String` | Vẫn xử lý như chuỗi; không parse số |
| Student form/detail | Có Edit | Không có Student update API | Ẩn/disable Edit trong MVP |
| Course form/detail | Có Edit | Không có Course update API | Ẩn/disable Edit trong MVP |
| Dashboard | Recent Activities | Không có audit/activity API | Ẩn hoặc đánh dấu placeholder |

## 3. Canonical UI model

### Student

```ts
interface StudentViewModel {
  id: number;
  name: string;
  birthDate: string; // API yyyy-MM-dd
  birthDateLabel: string; // localized display
}
```

### Course

```ts
interface CourseViewModel {
  id: number;
  code: string;
  courseName: string; // map từ backend field `subject`
  description: string;
}
```

### Grade

```ts
interface GradeViewModel {
  id: number;
  score: string;
  studentId: number;
  studentName: string;
  courseId: number;
  courseCode: string;
  courseName: string;
}
```

## 4. Nguyên tắc

- `birthDate` là trường canonical; UI chỉ định dạng lại khi hiển thị và gửi ISO khi gọi API.
- Không chuyển `score` sang number dù giá trị trông giống số.
- Không mô phỏng update Student/Course bằng xóa và tạo lại.
- Không hiển thị Recent Activities như dữ liệu thật nếu không có endpoint.
