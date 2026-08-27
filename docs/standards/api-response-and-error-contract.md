# API Response and Error Contract

**Phụ trách:** Frontend + Backend teams  
**Trạng thái:** Current heterogeneous contract; target standardized errors  
**Cập nhật lần cuối:** 2026-07-22

## 1. Current success

- GET detail: entity trực tiếp.
- GET `/all`: array trực tiếp.
- POST: entity đã persist, thường `201`.
- PUT Grade: entity Grade, `200`.
- DELETE: `204 No Content`.

Frontend không được giả định có `{data, success, message}` envelope.

## 2. Current errors

Not-found:

```json
{
  "message": "The student id '999' does not exist in our records",
  "status": 404,
  "timestamp": "2026-07-07T10:30:00"
}
```

Unauthenticated:

```json
{"error":"Unauthenticated"}
```

Validation, duplicate key, malformed JWT và bad credentials chưa có schema ổn định.

## 3. Frontend normalization

```ts
interface NormalizedError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  retryable: boolean;
}
```

Fallback code phía frontend:

- `NETWORK_ERROR`
- `UNAUTHENTICATED`
- `RESOURCE_NOT_FOUND`
- `REQUEST_FAILED`
- `SERVER_ERROR`

Không parse ID hoặc logic nghiệp vụ từ message text.

## 4. Target backend error

Backend nên chọn direct success + standardized error DTO/ProblemDetail. Target code registry nằm trong `error-codes.md`.

## 5. Status rules

| Status | UI behavior |
| --- | --- |
| 400 | Field/form error khi có details; nếu không thì generic invalid request |
| 401 | Clear token, redirect login |
| 403 | Access denied; hiện ít khả năng vì chưa có RBAC |
| 404 | Detail not found hoặc empty pair result tùy endpoint/context |
| 409 | Duplicate course/grade hoặc resource in use khi backend chuẩn hóa |
| 500 | Không lộ SQL/stack trace; cho retry có kiểm soát |
