# Validation Rules

**Phụ trách:** Frontend + Backend teams  
**Trạng thái:** Current DB constraints + frontend target  
**Cập nhật lần cuối:** 2026-07-22

## 1. Nguyên tắc

Frontend validation cải thiện UX nhưng backend validation mới là ranh giới tin cậy. Không phát minh giới hạn business chưa được product/backend xác nhận.

## 2. Student

Current chắc chắn:

- `name` không null ở database.
- `birthDate` không null và JSON ISO `yyyy-MM-dd`.

Frontend target:

- name trim và không rỗng.
- birthDate bắt buộc, parse được, không phải future date.
- ID trong create form là read-only/ẩn; server sinh ID.

Giới hạn độ dài là backlog nếu backend chưa chốt.

## 3. Course

Current:

- `subject`, `code`, `description` không null.
- `code` unique ở database.

Frontend target:

- ba field bắt buộc và trim.
- không tự uppercase code nếu chưa thống nhất; có thể cảnh báo format.
- duplicate code cần map thành conflict khi backend có error contract.

## 4. Grade

Current:

- `score` string non-null.
- unique `(studentId, courseId)`.

Frontend target:

- student/course bắt buộc.
- score trim và không rỗng.
- không numeric range validation.
- không uppercase/normalize thang điểm ngoài quyết định sản phẩm.

## 5. IDs

Path IDs phải là số nguyên dương ở client trước khi gọi API. Invalid route param dẫn tới not-found/validation state, không gửi `NaN`.

## 6. Error presentation

- Field-level error đặt cạnh field nếu xác định được.
- Server/global error đặt ở form alert.
- Không xóa dữ liệu người dùng khi submit thất bại.
