# Testing Strategy

**Phụ trách:** Frontend + QA teams  
**Trạng thái:** Normative target  
**Cập nhật lần cuối:** 2026-07-22

## 1. Test pyramid

- Unit: formatter, mapper, validation, pagination, error normalizer.
- Component: form/table/dialog/states.
- Integration: feature với mocked HTTP hoặc test server.
- E2E: login và journeys Student/Course/Grade.
- Backend contract: kiểm tra endpoint thực với JWT.

## 2. Critical E2E journeys

1. Login hợp lệ → dashboard.
2. Missing/expired token → 401/login.
3. Create Student với `birthDate` ISO.
4. View Student detail + grades.
5. Delete Student qua confirm; kiểm tra effect theo backend.
6. Create Course với `subject` mapping.
7. Create/update/delete Grade bằng score string.
8. Filter grade theo student/course.
9. Client pagination/search.

## 3. Unsupported UI

Edit Student/Course test phải xác minh action hidden/disabled, không cố gọi endpoint chưa có.

## 4. Test data

- Không phụ thuộc ID seed cố định nếu có thể.
- H2 restart seed lại; test phải cô lập hoặc reset.
- Score examples gồm alphabetic và numeric-looking string.
- Birth date gồm ISO và display conversion.

## 5. Network/error tests

- 204 parsing.
- 401 normalization.
- 404 not-found shape.
- Spring/default 500 fallback.
- network failure + retry.

## 6. Coverage

Coverage là signal, không thay thế AC mapping. Critical mapper/auth/error code cần branch coverage phù hợp.
