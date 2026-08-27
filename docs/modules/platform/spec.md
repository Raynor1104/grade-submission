# Platform — Đặc tả cross-cutting frontend

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned  
**Cập nhật lần cuối:** 2026-07-22

> Module này mô tả các cam kết dùng chung của toàn bộ portal. Nó không thay đổi contract backend hiện tại.

## 1. Phạm vi

- Cấu hình API base URL.
- HTTP client và Bearer token.
- Mapping entity sang view model.
- Error normalization.
- Loading, empty và retry behavior.
- Search/filter/pagination phía client.
- Date và score formatting.
- Cache invalidation sau mutation.
- Browser integration qua proxy/CORS.

## 2. Backend baseline

| Hạng mục | Contract hiện tại |
| --- | --- |
| Base URL | `http://localhost:9090` |
| API version | Chưa có `/api/v1` |
| Authentication | JWT Bearer stateless |
| Success body | Entity hoặc array trực tiếp |
| Not-found body | `{message,status,timestamp}` |
| Unauthorized body | `{"error":"Unauthenticated"}` |
| Pagination | Không có |
| Concurrency | Không có ETag/If-Match |
| Idempotency | Không có |
| CSRF | Disabled |

Frontend không được gửi hoặc phụ thuộc vào CSRF token, idempotency key hay ETag vì backend hiện không hỗ trợ các contract này.

## 3. API client

API client tập trung phải:

- Dùng base URL từ environment.
- Thêm `Authorization: Bearer <token>` khi token tồn tại.
- Đặt `Content-Type: application/json` cho body JSON.
- Parse response `204` mà không cố đọc JSON.
- Chuẩn hóa lỗi về kiểu nội bộ.
- Khi nhận `401`, phát auth-expired event một lần.
- Không log password hoặc raw JWT.

Kiểu lỗi đề xuất:

```ts
interface ApiError {
  status: number;
  message: string;
  source: 'backend' | 'network' | 'client';
  details?: unknown;
}
```

## 4. View model boundary

### Student

```ts
interface StudentVm {
  id: number;
  name: string;
  birthDate: string; // ISO yyyy-MM-dd
}
```

### Course

```ts
interface CourseVm {
  id: number;
  code: string;
  name: string;        // map từ API subject
  description: string;
}
```

### Grade

```ts
interface GradeVm {
  id: number;
  score: string;
  student: StudentVm;
  course: CourseVm;
}
```

Không truyền trực tiếp entity object vào form nếu form chỉ cần một tập field nhỏ.

## 5. Date policy

- API request/response: `yyyy-MM-dd`.
- Input nên dùng `<input type="date">` hoặc date picker trả ISO date.
- UI có thể hiển thị theo locale, nhưng không được đổi nghĩa ngày do timezone.
- Không dùng JavaScript `Date` UTC conversion cho pure date nếu có thể tránh; giữ chuỗi ISO.

## 6. Score policy

- `score` là chuỗi tự do theo backend.
- Không dùng `parseFloat`, numeric input constraint hoặc range validation chưa được server xác nhận.
- Trim khoảng trắng ở UI có thể thực hiện nếu quyết định UX được chốt, nhưng không tự uppercase hoặc chuyển thang điểm.
- Ví dụ hợp lệ theo contract hiện tại: `A`, `B+`, `Pass`, `85`, `8.5`.

## 7. Client-side list operations

Backend trả toàn bộ dữ liệu qua `/all`. Với MVP dataset nhỏ:

1. Fetch toàn bộ array.
2. Normalize view model.
3. Filter/search phía client.
4. Tính total sau filter.
5. Slice theo page hiện tại.
6. Reset page về 1 khi filter thay đổi.

Đây là giải pháp tạm thời. Không phù hợp dataset lớn.

## 8. Cache strategy

Query keys đề xuất:

```text
students.all
students.detail:{id}
courses.all
courses.detail:{id}
grades.all
grades.byStudent:{id}
grades.byCourse:{id}
grades.pair:{studentId}:{courseId}
```

Sau create/delete/update phải invalidate các key liên quan và dashboard counts.

## 9. Error mapping

| Trường hợp | UI behavior |
| --- | --- |
| Network error | Notice + Retry |
| 401 | Clear auth, redirect login |
| 404 detail | Resource not found |
| 404 grade pair khi filter cả hai | Có thể biểu diễn “không có kết quả” |
| Duplicate course/grade chưa chuẩn hóa | Generic conflict/save failure; không hiển thị SQL details |
| 5xx/default Spring error | Generic server error + retry phù hợp |

## 10. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-PLATFORM-FE-01 | Mọi request đi qua API client chung | ready |
| AC-PLATFORM-FE-02 | Bearer token được gắn cho protected API | ready |
| AC-PLATFORM-FE-03 | `204 No Content` được xử lý không lỗi parse | ready |
| AC-PLATFORM-FE-04 | Backend error được chuẩn hóa, không lộ nội dung nhạy cảm | partial |
| AC-PLATFORM-FE-05 | Student/Course/Grade được map sang view model chuẩn | ready |
| AC-PLATFORM-FE-06 | Date round-trip đúng `yyyy-MM-dd` | ready |
| AC-PLATFORM-FE-07 | Score giữ nguyên string | ready |
| AC-PLATFORM-FE-08 | Search/pagination client-side phản ánh tập đã lọc | ready |
| AC-PLATFORM-FE-09 | Mutation invalidate đúng cache phụ thuộc | ready |
| AC-PLATFORM-FE-10 | Browser gọi được backend qua proxy/same-origin | partial |
