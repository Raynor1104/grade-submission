# ADR-0011: Dev Proxy hoặc Same-origin cho đến khi CORS được Chuẩn hóa

**Trạng thái:** Required for current backend

## Bối cảnh

Backend không có CORS policy tập trung; chỉ auth controller được ghi nhận có `@CrossOrigin`.

## Quyết định

- local: dev-server proxy tới `localhost:9090`;
- demo deployment: reverse proxy frontend/backend cùng origin;
- cross-origin production chỉ sau khi backend có allowlist CORS rõ ràng.

## Hệ quả

Tránh tình trạng login thành công nhưng business API bị browser chặn. Cần cấu hình proxy và environment đúng.
