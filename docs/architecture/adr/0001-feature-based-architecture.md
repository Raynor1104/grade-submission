# ADR-0001: Feature-based frontend architecture

## Bối cảnh
Wireframe có các miền auth, student, course, grade và dashboard.

## Quyết định
Tổ chức source theo feature, dùng `core` và `shared` cho phần dùng chung.

## Hệ quả
### Tích cực
- dễ tìm code theo nghiệp vụ
- feature có thể test độc lập
- giảm component khổng lồ

### Tiêu cực
- cần quy tắc public API giữa feature
- có nguy cơ trùng component nếu quản trị kém
