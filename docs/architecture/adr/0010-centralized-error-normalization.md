# ADR-0010: Centralized Error Normalization

**Trạng thái:** Proposed / Accepted

## Bối cảnh

404, 401 và Spring/default errors có schema khác nhau.

## Quyết định

HTTP client chuyển mọi failure thành:

```ts
interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}
```

- 401 kích hoạt auth invalidation;
- 404 detail hiển thị Not Found;
- login failure dùng message chung;
- unknown 5xx dùng retry/general error.

## Hệ quả

Component đơn giản hơn, nhưng không được invent field-level details khi backend không trả.
