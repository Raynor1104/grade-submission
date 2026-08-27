# Service Composition and Configuration Validation

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

## 1. Composition root

Khởi tạo API client, query client, router, stores và logger tại app bootstrap; không tự tạo client mới trong mỗi component.

## 2. Dependency injection nhẹ

Các service thuần có thể nhận dependency qua factory:

```ts
const studentService = createStudentService({
  gateway: studentGateway,
  logger,
});
```

Không bắt buộc dùng DI container.

## 3. Config validation

Startup phải kiểm tra:

- `VITE_API_BASE_URL` là URL hợp lệ hoặc cho phép proxy-relative path.
- environment name thuộc tập được hỗ trợ.
- feature flags parse được.

Nếu config thiếu, fail sớm với message không lộ secret.

## 4. Rules

- Không đọc `import.meta.env` rải rác; map vào typed config một lần.
- Không đưa backend JWT secret/database credentials vào frontend env.
