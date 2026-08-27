# Assumptions and Constraints

**Trạng thái:** Backend implementation-aligned + frontend assumptions

## 1. Giả định

- Dự án dùng cho demo/học tập.
- Chỉ có tài khoản `username` / `password`.
- Mọi authenticated user có cùng quyền.
- Dataset nhỏ nên client có thể tải endpoint `/all`.
- Score là chuỗi tự do như `A`, `B+`, `85` hoặc `8.5`.
- Backend chạy local tại `http://localhost:9090`.

## 2. Ràng buộc backend

### Authentication

- JWT stateless, HS256, TTL 24 giờ.
- Không có `/me`, logout, refresh token hoặc revocation.
- Không có role/permission.
- Sai credentials chưa có error contract ổn định.

### API

- Chưa version hóa.
- Student/Course không có update.
- List không có search, sort, pagination.
- Error envelope không thống nhất.
- Không có dashboard/activity endpoint.

### Persistence

- H2 in-memory; mất dữ liệu khi restart.
- Seed data chạy lúc startup.
- Không có migration tool.
- Student/Course có cascade tới Grade.
- Không có optimistic locking.

### Browser/runtime

- Port backend mặc định `9090`.
- Không có CORS policy tập trung.
- Không có health/metrics endpoint.
- Không có production profile hoặc container config trong baseline.

## 3. Ràng buộc frontend

- Route guard dựa vào token phía client chỉ là UX boundary; API `401` là nguồn xác nhận thực tế.
- Token storage trong browser có XSS risk; lựa chọn sessionStorage chỉ phù hợp demo.
- Client-side pagination yêu cầu tải toàn bộ dữ liệu.
- Dashboard thực hiện ba request thay vì một summary request.
- Greeting chỉ có thể dùng username đã nhập hoặc JWT subject vì không có profile endpoint.

## 4. Ngoài phạm vi MVP

- user registration và account management;
- role-based authorization;
- offline/PWA;
- activity feed thật;
- production-grade token lifecycle;
- persistent production database;
- server-side pagination;
- update Student/Course.
