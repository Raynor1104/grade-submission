# ADR-0012: Confirm Delete và Related Cache Invalidation

**Trạng thái:** Proposed / Accepted

## Bối cảnh

Xóa Student/Course có thể cascade Grade; delete unknown ID chưa ổn định.

## Quyết định

- mọi delete mở confirm dialog;
- Student/Course hiển thị cảnh báo Grade liên quan;
- disable nút trong lúc request;
- success hoặc resource-already-gone dẫn tới refetch list;
- invalidate cả parent list/detail, Grade queries và dashboard counts.

## Hệ quả

Giảm xóa nhầm và stale UI; cần quản lý query keys tập trung.
