# ADR-0008: Dashboard Client Aggregation và Không Giả Activity Feed

**Trạng thái:** Temporary

## Quyết định

- count lấy từ ba `/all` endpoint và chia sẻ Vue Query cache;
- từng card có partial-error state;
- Recent Activities bị ẩn hoặc hiển thị unsupported empty state.

## Hệ quả

**Tích cực:** triển khai được không đổi backend.  
**Tiêu cực:** ba request, tải payload đầy đủ, không có activity thật.

## Exit criteria

Dùng summary/activity endpoint khi backend cung cấp.
