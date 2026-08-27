# Authentication journeys

> Môi trường và helper nằm trong [`e2e_spec.md`](e2e_spec.md).

## E2E-AUTH-FE-009 — Login demo → refresh tab → client logout

**Loại:** Current UI + backend contract  
**AC:** `AC-AUTH-FE-02`, `AC-AUTH-FE-04`, `AC-AUTH-FE-07`

**Điều kiện:** Backend mới khởi động; frontend ở Login page.

**Các bước**

1. Điền `username` và `password`.
2. Nhấn **Login**.
3. Chờ `POST /authenticate` trả `200` với non-empty `token`.
4. Assert điều hướng Dashboard và lời chào chứa `username`.
5. Reload tab.
6. Assert vẫn ở protected app do token được restore từ `sessionStorage`.
7. Nhấn **Logout**.
8. Thử mở trực tiếp `/app/students`.

**Kết quả mong đợi**

- Login thành công và Dashboard xuất hiện.
- Password không được giữ lại trong input sau navigation/reload.
- Refresh giữ authenticated state trong tab.
- Logout xóa token/username/cache phía client.
- Không có request tới endpoint logout không tồn tại.
- Deep-link sau logout quay về Login.

---

## E2E-AUTH-FE-010 — Invalid credentials hiển thị lỗi an toàn

**Loại:** Observed backend gap  
**AC:** `AC-AUTH-FE-08`

**Các bước**

1. Nhập username đúng và password sai.
2. Submit.
3. Lặp lại với username không tồn tại.

**Kết quả mong đợi**

- Không điều hướng Dashboard.
- Không lưu token.
- Hiển thị thông báo chung an toàn.
- Không render raw exception, stack trace hoặc framework error body.

**Lưu ý**

Backend hiện có thể trả generic `500` thay vì `401`. E2E frontend không được đổi assertion thành “500 là contract đúng”; chỉ assert login thất bại được xử lý an toàn.

---

## E2E-AUTH-FE-011 — Protected response 401 làm sạch phiên một lần

**Loại:** Current UI contract

**Các bước**

1. Đăng nhập thành công.
2. Intercept một protected request hoặc dùng token không hợp lệ.
3. Mở Students.
4. Backend trả `401 {"error":"Unauthenticated"}`.

**Kết quả mong đợi**

- Token, username và domain cache bị xóa.
- Chỉ phát một redirect về Login/401.
- Không tạo vòng lặp retry.
- UI không còn hiển thị greeting/authenticated navigation sau cleanup.

---

## E2E-AUTH-FE-012 — Bearer header được gửi cho protected API

**Loại:** Current contract  
**AC:** `AC-AUTH-FE-05`, `AC-GS-02`

**Các bước**

1. Login qua UI.
2. Mở Dashboard, Students, Courses và Grades.
3. Quan sát request protected.

**Kết quả mong đợi**

- Mỗi request nghiệp vụ có `Authorization: Bearer <token>`.
- `POST /authenticate` không yêu cầu Bearer token.
- Full token không xuất hiện trong browser log do ứng dụng tạo.

---

## E2E-AUTH-FE-013 — Token không hợp lệ không mở protected content

**Loại:** Current/Observed gap

**Các bước**

1. Ghi một chuỗi token không hợp lệ vào storage theo contract frontend.
2. Mở `/app/dashboard`.
3. Đợi protected request đầu tiên.

**Kết quả mong đợi**

- Protected data không được hiển thị như thành công.
- Khi backend trả 401, frontend làm sạch session và chuyển Login.
- Nếu backend trả 500 cho một biến thể JWT do gap hiện tại, UI vẫn hiển thị server error an toàn và không coi session là hợp lệ.

---

## E2E-AUTH-FE-014 — Login form required validation

**Loại:** Frontend-controlled  
**AC:** `AC-AUTH-FE-01`

**Các bước**

1. Để trống cả hai field và nhấn Login.
2. Chỉ nhập username rồi submit.
3. Chỉ nhập password rồi submit.

**Kết quả mong đợi**

- Required message xuất hiện đúng field.
- Không gửi request `/authenticate`.
- Focus được đưa tới field lỗi đầu tiên.
