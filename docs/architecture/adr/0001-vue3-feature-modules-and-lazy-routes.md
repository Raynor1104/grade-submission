# ADR-0001: Vue 3 Feature Modules và Lazy Routes

**Trạng thái:** Proposed / Accepted

## Bối cảnh

Wireframe chia rõ Auth, Dashboard, Students, Courses và Grades. Tài liệu frontend tham chiếu sử dụng feature modules và lazy route loading.

## Quyết định

- dùng Vue 3 + TypeScript;
- mỗi nghiệp vụ là một feature module;
- page route được lazy load;
- code dùng chung đặt trong `core` hoặc `shared`, không tạo module tổng hợp quá lớn.

## Hệ quả

**Tích cực:** dễ tìm code, test độc lập, bundle ban đầu nhỏ hơn.  
**Tiêu cực:** cần quy tắc dependency để tránh feature import chéo.

## Thay thế

- chia theo loại file toàn cục (`components/`, `services/`) — loại vì khó mở rộng theo nghiệp vụ.
