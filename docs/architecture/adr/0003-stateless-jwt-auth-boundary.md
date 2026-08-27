# ADR-0003: Stateless JWT Auth Boundary

**Trạng thái:** Backend-aligned

## Bối cảnh

Backend cấp JWT từ `/authenticate`, không tạo session, không có logout/refresh/revocation.

## Quyết định

- auth layout bảo vệ `/app/*`;
- token ở Pinia memory và sessionStorage cho demo;
- mọi request gửi `Authorization: Bearer`;
- 401 xóa token/cache và redirect;
- Logout chỉ dọn client state.

## Hệ quả

**Tích cực:** khớp backend hiện tại.  
**Rủi ro:** token storage chịu XSS risk; logout không revoke token; route guard không xác minh server cho đến khi gọi API.

## Thay thế

- secure HttpOnly cookie — chưa thể dùng nếu backend chưa cung cấp cookie auth/CSRF contract.
