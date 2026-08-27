# ADR-0007: Dashboard counts via client aggregation

## Bối cảnh
Không có dashboard summary endpoint.

## Quyết định
MVP gọi ba endpoint `/all` và lấy độ dài. Recent Activities không hiển thị như dữ liệu thật.

## Hệ quả
### Tích cực
- có dashboard count mà không đổi backend

### Tiêu cực
- ba request và tải toàn bộ dữ liệu
- cần xử lý partial failure
