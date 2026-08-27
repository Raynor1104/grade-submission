# Bundle Size Monitoring

**Phụ trách:** Frontend team  
**Trạng thái:** Target  
**Cập nhật lần cuối:** 2026-07-22

## Strategy

- Lazy-load route pages: dashboard, students, courses, grades.
- Không import toàn bộ icon/date library nếu chỉ dùng một phần.
- Tách vendor chunk theo bundler khi có lợi.
- Theo dõi compressed và uncompressed output.

## CI

Lưu baseline và cảnh báo/fail khi main bundle hoặc route chunk tăng vượt ngưỡng đã chốt. Ngưỡng cụ thể phải được đo từ implementation; tài liệu này không phát minh số khi chưa có build.

## Review questions

- Dependency mới có alternative nhẹ hơn không?
- Có duplicate version không?
- Date formatting có cần library lớn không hay dùng native APIs?
- Dashboard có kéo theo code của mọi form không?
