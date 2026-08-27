# ADR-0002: Centralized Typed API Client

**Trạng thái:** Proposed / Accepted

## Bối cảnh

Mọi business endpoint cần Bearer token và backend có nhiều error shape.

## Quyết định

Mọi request đi qua một HTTP client tập trung chịu trách nhiệm:

- base URL;
- JSON serialization;
- Authorization header;
- timeout/abort;
- parse response;
- normalize error;
- xử lý 401;
- typed endpoint adapters.

Component không gọi `fetch` trực tiếp.

## Hệ quả

**Tích cực:** tránh lặp logic, dễ đổi API version, test tập trung.  
**Tiêu cực:** client có thể thành god-object nếu không tách transport, auth và adapter.
