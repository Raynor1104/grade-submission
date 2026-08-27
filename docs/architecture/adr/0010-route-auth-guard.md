# ADR-0010: Route-level authentication guard

## Bối cảnh
Tất cả endpoint nghiệp vụ cần JWT; chỉ login là public.

## Quyết định
Dùng auth layout/route guard, đồng thời xử lý 401 trong HTTP client.

## Hệ quả
### Tích cực
- tránh render trang bảo vệ khi không có token
- xử lý hết hạn token tập trung

### Tiêu cực
- có token không đồng nghĩa token hợp lệ vì backend không có `/me`
