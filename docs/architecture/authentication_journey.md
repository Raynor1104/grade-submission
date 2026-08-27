# Authentication Journey

**Trạng thái:** Backend-aligned flow + proposed frontend handling

## 1. Đăng nhập

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page
    participant Store as Auth Store
    participant API as POST /authenticate

    User->>UI: Nhập username/password
    UI->>API: Gửi credentials
    alt Thành công
        API-->>UI: 200 {token}
        UI->>Store: Lưu token + username
        UI-->>User: Điều hướng Dashboard
    else Non-2xx
        API-->>UI: Error shape có thể không ổn định
        UI-->>User: Hiển thị thông báo đăng nhập thất bại chung
    end
```

## 2. Protected request

```mermaid
sequenceDiagram
    participant Page
    participant Client as HTTP Client
    participant API
    participant Router

    Page->>Client: Gọi business API
    Client->>API: Authorization: Bearer token
    alt 2xx
        API-->>Client: Data
        Client-->>Page: Parsed DTO
    else 401
        API-->>Client: {error: Unauthenticated}
        Client->>Client: Xóa token + query cache
        Client->>Router: Redirect /login hoặc /unauthorized
    end
```

## 3. Route guard

- Public: `/login`.
- Protected: mọi route `/app/*`.
- Không có token: redirect Login trước khi mount page.
- Có token: cho phép route, nhưng request đầu tiên vẫn có thể trả 401.
- Có thể đọc `exp` từ JWT để logout sớm cho UX, nhưng không dùng payload JWT như authorization source.

## 4. Token storage đề xuất cho demo

- runtime source: Pinia/in-memory;
- reload persistence: `sessionStorage`;
- không dùng `localStorage` mặc định;
- không log hoặc đưa token vào URL;
- xóa token khi logout, 401 hoặc decode thấy hết hạn.

## 5. Logout

Backend không có logout endpoint. Nút Logout:

1. xóa token và username;
2. clear query cache;
3. điều hướng Login.

Token cũ vẫn có thể hoạt động đến lúc hết hạn nếu bị sao chép; đây là ràng buộc backend.

## 6. Greeting

Vì không có `/me`, dòng “Xin chào, username” lấy từ:

1. username vừa đăng nhập; hoặc
2. JWT subject được decode chỉ để hiển thị.
