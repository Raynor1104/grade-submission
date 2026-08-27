# API Integration Guide

**Phụ trách:** Frontend team  
**Trạng thái:** Normative, backend-aligned  
**Cập nhật lần cuối:** 2026-07-22

## 1. Luồng gọi API đề xuất

```text
Page / Component
  → feature query or service
    → centralized apiClient
      → browser fetch
        → Spring Boot API
```

Mọi request phải đi qua một API client chung.

## 2. Base URL

- Local backend: `http://localhost:9090`.
- Frontend đọc từ `VITE_API_BASE_URL` hoặc biến tương đương.
- Ưu tiên dev proxy/same-origin để tránh CORS drift.
- Không dùng `mode: no-cors`.

## 3. Authentication

Login:

```http
POST /authenticate
Content-Type: application/json
```

```json
{"username":"username","password":"password"}
```

Protected requests:

```http
Authorization: Bearer <jwt>
```

- Không gửi Bearer header cho `/authenticate`.
- Không log raw token.
- Khi nhận `401`, clear auth state một lần và chuyển về login.
- Logout hiện là client-side clear token; không gọi endpoint logout không tồn tại.

## 4. Parsing rules

- `200/201`: parse JSON theo endpoint.
- `204`: không gọi `response.json()`.
- List hiện trả array trực tiếp.
- Error có thể là not-found DTO, `{error: ...}` hoặc Spring default; phải normalize.

```ts
interface ApiError {
  status: number;
  message: string;
  source: 'backend' | 'network' | 'client';
  code?: string;
  details?: unknown;
}
```

## 5. List strategy

Backend chưa pagination/search. MVP:

1. Fetch endpoint `/all`.
2. Map DTO sang view model.
3. Search/filter phía client.
4. Tính `total` sau filter.
5. Slice theo page.
6. Reset về page 1 khi filter đổi.

## 6. Mutation và cache

- Create/delete Student: invalidate students, grades liên quan và dashboard.
- Create/delete Course: invalidate courses, grades liên quan và dashboard.
- Create/update/delete Grade: invalidate grades, student detail, course detail và dashboard.
- Không áp dụng ETag, If-Match hoặc idempotency header khi backend chưa hỗ trợ.

## 7. Retry

- GET network/5xx: retry giới hạn.
- POST/PUT/DELETE: không retry tự động nếu không thể bảo đảm idempotency.
- 400/401/403/404/409: không retry tự động.

## 8. Endpoint constants

Không viết URL string lặp lại trong component. Dùng một module endpoint builder có typed path parameters.
