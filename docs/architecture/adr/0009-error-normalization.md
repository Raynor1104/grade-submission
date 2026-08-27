# ADR-0009: Centralized error normalization

## Bối cảnh
Not-found có `message/status/timestamp`, unauthenticated có `error`, lỗi khác có thể là Spring default.

## Quyết định
API client chuẩn hóa tất cả thành `ApiError {status, code?, message, details?}`.

## Hệ quả
### Tích cực
- component có cách xử lý thống nhất
- dễ thay backend contract sau này

### Tiêu cực
- parser phải phòng thủ và được test nhiều dạng response
