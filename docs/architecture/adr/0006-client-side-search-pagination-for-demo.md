# ADR-0006: Client-side Search và Pagination cho Demo

**Trạng thái:** Temporary

## Bối cảnh

Backend chỉ có `/all`, không có query search/page/sort. Tài liệu backend giả định dataset nhỏ.

## Quyết định

MVP tải list rồi filter/sort/page tại client. Page reset về 1 khi filter thay đổi.

## Giới hạn

- không phù hợp dataset lớn;
- total chỉ phản ánh dữ liệu đã tải;
- request payload và memory tăng theo dữ liệu.

## Exit criteria

Thay bằng server pagination khi dataset hoặc performance budget không còn phù hợp.
