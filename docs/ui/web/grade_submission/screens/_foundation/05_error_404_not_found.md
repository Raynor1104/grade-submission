# 404 Not Found State

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-30

## 404 Not Found

## Phạm vi

- Unknown Student: `GET /student/{id}`.
- Unknown Course: `GET /course/{id}`.
- Unknown Grade pair trong detail/update.
- Unknown client route.

## Copy theo resource

```text
Student not found
Course not found
Grade not found
Page not found
```

## Behavior

- Giữ App Shell nếu user vẫn authenticated.
- CTA `Back` và `Go to List` theo domain.
- Không hiển thị stack trace hoặc response body thô.
- Grade pair GET trả 404 trong chế độ **filter cả Student + Course** được xử lý là `Không có điểm`, không nhất thiết chuyển full-page 404.

## Invalid route ID

Nếu param không phải số nguyên dương, hiển thị 404/invalid route state trước khi gọi backend.
