# Grades — Đặc tả frontend

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned  
**Cập nhật lần cuối:** 2026-07-22

## 1. Phạm vi

- Grade Management list.
- Filter theo Student và Course.
- Client-side pagination.
- Submit New Grade.
- Update Grade.
- Delete Grade.
- Hiển thị grade trong Student/Course detail.

## 2. Data model

```ts
interface GradeVm {
  id: number;
  score: string;
  student: StudentVm;
  course: CourseVm;
}
```

Mỗi cặp `(studentId, courseId)` chỉ có tối đa một grade ở database.

## 3. API contract

| Method | Endpoint | UI usage |
| --- | --- | --- |
| GET | `/grade/all` | List all |
| GET | `/grade/student/{studentId}` | Filter Student / Student Detail |
| GET | `/grade/course/{courseId}` | Filter Course / Course Detail |
| GET | `/grade/student/{studentId}/course/{courseId}` | Pair detail/precheck |
| POST | `/grade/student/{studentId}/course/{courseId}` | Create |
| PUT | `/grade/student/{studentId}/course/{courseId}` | Update score |
| DELETE | `/grade/student/{studentId}/course/{courseId}` | Delete |

Body create/update:

```json
{
  "score": "A"
}
```

## 4. List và filter strategy

Ưu tiên endpoint chuyên biệt:

| Filter | Endpoint |
| --- | --- |
| Không chọn gì | `/grade/all` |
| Chỉ Student | `/grade/student/{studentId}` |
| Chỉ Course | `/grade/course/{courseId}` |
| Cả Student + Course | `/grade/student/{studentId}/course/{courseId}` |

Khi cả hai filter được chọn và pair trả 404, list có thể hiển thị “Không có điểm cho lựa chọn này”, không cần chuyển sang global 404 page.

Pagination vẫn thực hiện phía client trên response array hoặc array gồm một pair result.

## 5. Submit New Grade

- Student selector lấy từ `/student/all`.
- Course selector lấy từ `/course/all`.
- Score là text input.
- Student và Course bắt buộc.
- Create dùng POST pair endpoint.
- Có thể precheck pair bằng GET để cải thiện UX, nhưng không thay thế unique constraint và không loại bỏ race condition.
- Duplicate pair error chưa được backend chuẩn hóa; hiển thị save failure an toàn.

## 6. Update Grade

- Route định danh bằng `studentId` và `courseId`.
- Student và Course hiển thị read-only.
- Chỉ score được phép sửa.
- PUT body chỉ cần `{score}`.
- Không đổi pair trong update form; muốn chuyển pair phải xóa và tạo mới bằng hành động người dùng rõ ràng.

## 7. Delete Grade

- Confirm Delete chỉ rõ Student + Course.
- Success `204`: quay về Grade list và invalidate all/student/course/pair/dashboard queries.
- Delete unknown pair hiện có thể là no-op + 204; UI không được phụ thuộc vào 404 cho nhánh này.

## 8. Score semantics

- Score là string tự do.
- Không áp dụng numeric min/max.
- Không đổi `A` thành số hoặc `8.5` thành number.
- UI có thể yêu cầu non-empty vì database `NOT NULL`; blank policy backend chưa rõ.

## 9. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-GRADE-FE-01 | List hiển thị Student, Course và Grade string | ready |
| AC-GRADE-FE-02 | Filter chọn endpoint phù hợp | ready |
| AC-GRADE-FE-03 | Pair 404 trong filter hiển thị no-results | ready |
| AC-GRADE-FE-04 | Create gửi POST pair + `{score}` | ready |
| AC-GRADE-FE-05 | Update giữ pair read-only và chỉ PUT score | ready |
| AC-GRADE-FE-06 | Delete confirm và xử lý 204 | ready |
| AC-GRADE-FE-07 | Score giữ nguyên string ở mọi màn hình | ready |
| AC-GRADE-FE-08 | Duplicate pair không lộ DB error | partial |
| AC-GRADE-FE-09 | Query cache liên quan được invalidate sau mutation | ready |
| AC-GRADE-FE-10 | Server-side pagination và stable duplicate error | backlog |
