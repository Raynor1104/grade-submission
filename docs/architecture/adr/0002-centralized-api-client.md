# ADR-0002: Centralized typed API client

## Bối cảnh
Mọi endpoint cần Bearer JWT và backend có nhiều dạng lỗi.

## Quyết định
Mọi HTTP request đi qua một client tập trung có adapter, error normalization và xử lý 401.

## Hệ quả
### Tích cực
- không lặp auth/error code
- dễ đổi base URL và version API
- test tập trung

### Tiêu cực
- client là thành phần quan trọng cần thiết kế cẩn thận
