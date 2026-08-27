# Glossary

**Phụ trách:** Frontend team  
**Trạng thái:** Normative  
**Cập nhật lần cuối:** 2026-07-22

| Thuật ngữ | Ý nghĩa trong dự án |
| --- | --- |
| Grade Submission | Web portal quản lý Student, Course và Grade |
| Student | `{id, name, birthDate}`; `birthDate` là pure date |
| Course | `{id, subject, code, description}`; UI gọi `subject` là Course Name |
| Grade | Điểm của một Student trong một Course; unique theo cặp student-course |
| Score | Chuỗi tự do như `A`, `B+`, `Pass`, `85`, `8.5` |
| Birth Date | Ngày sinh; API dùng ISO `yyyy-MM-dd`, UI có thể hiển thị `yyyy/MM/dd` |
| JWT | Token HS256 dùng cho stateless authentication |
| Bearer token | Header `Authorization: Bearer <jwt>` |
| Authentication | Xác định người gọi hợp lệ |
| Authorization | Xác định quyền; backend hiện chưa có role/permission |
| Route guard | UX boundary phía client; không thay thế security backend |
| API DTO | Shape request/response từ backend |
| View model | Shape frontend dùng để render/form |
| Client-side pagination | Tải toàn bộ array rồi filter/slice ở trình duyệt |
| Direct response | Success trả resource/list trực tiếp, không có envelope |
| Current | Backend behavior đang tồn tại |
| Frontend-proposed | Quyết định implementation phía frontend |
| Target | Chuẩn mong muốn khi triển khai/chỉnh sửa |
| Backlog | Capability chưa được triển khai |
| SSoT | Single Source of Truth |
| AC | Acceptance Criteria |
| DoD | Definition of Done |
