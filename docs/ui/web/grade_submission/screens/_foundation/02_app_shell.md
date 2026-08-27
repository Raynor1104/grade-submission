# App Shell

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

## Mục đích

Cung cấp header/navigation nhất quán sau khi đăng nhập.

## Layout

```text
+--------------------------------------------------------------------------------+
| GRADE SUBMISSION SYSTEM                                     Xin chào, username |
|--------------------------------------------------------------------------------|
| [Dashboard] [Students] [Courses] [Grades]                         [Logout]     |
|--------------------------------------------------------------------------------|
| Main route content                                                             |
+--------------------------------------------------------------------------------+
```

## Username source

Backend không có `/me`. Greeting lấy từ:

1. username vừa đăng nhập và lưu cùng auth state; hoặc
2. JWT subject được decode **chỉ để hiển thị**, không dùng làm authorization proof.

## Navigation behavior

- Active item có trạng thái `aria-current="page"`.
- Navigation không biến mất khi page query lỗi.
- Logout luôn ở cuối thanh điều hướng.
- Mọi protected request đi qua HTTP client gắn Bearer token.

## Loading và auth bootstrap

- Restore token từ `sessionStorage` trước khi mount protected page.
- Có token không đồng nghĩa token hợp lệ; server 401 là nguồn xác nhận cuối cùng.
- Không render dữ liệu protected cũ trong lúc xử lý 401.

## Responsive

- Desktop: navigation dạng hàng ngang.
- Mobile: hamburger/drawer hoặc wrap có thứ tự không đổi.
- Greeting có thể rút gọn nhưng Logout vẫn truy cập được.
