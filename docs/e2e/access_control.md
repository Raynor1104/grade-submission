# Access control and app-shell journeys

## E2E-GS-007 — Login → Dashboard → Students → Courses → Grades

**Loại:** Current UI + backend contract  
**AC:** `AC-GS-01` đến `AC-GS-06`

**Các bước**

1. Mở `/login` khi chưa có token.
2. Login bằng demo account.
3. Dùng menu mở lần lượt Dashboard, Students, Courses và Grades.
4. Kiểm tra active navigation ở mỗi route.
5. Reload ở route Grades.

**Kết quả mong đợi**

- Guest chỉ thấy Login/public error page.
- App shell hiển thị tên hệ thống, greeting, menu và Logout.
- Active item khớp route.
- Protected data tải qua API có Bearer token.
- Refresh route protected vẫn giữ phiên trong tab.
- Không có menu Roles/Permissions vì backend không có RBAC.

---

## E2E-ACCESS-FE-001 — Guest deep-link protected route

**Loại:** Current UI contract  
**AC:** `AC-GS-01`

**Các route kiểm tra**

```text
/app/dashboard
/app/students
/app/courses
/app/grades
```

**Kết quả mong đợi**

- Chuyển `/login`.
- Không hiển thị chớp nội dung protected có dữ liệu.
- Không tạo token/session như side effect.

---

## E2E-ACCESS-FE-002 — Backend bảo vệ mọi domain endpoint

**Loại:** Current backend contract

Gọi không token:

```text
GET /student/all
GET /course/all
GET /grade/all
POST /student
POST /course
```

**Kết quả mong đợi**

- Mỗi request trả `401`.
- Body chứa `error = "Unauthenticated"`.
- Business success UI không xuất hiện.

---

## E2E-ACCESS-FE-003 — Một authenticated account dùng được mọi module

**Loại:** Current backend limitation

**Các bước**

1. Login bằng account duy nhất.
2. Mở Students, Courses và Grades.
3. Thực hiện một create/read/delete journey hợp lệ.

**Kết quả mong đợi hiện tại**

- Token hợp lệ truy cập được mọi domain endpoint.
- Frontend không hiển thị role-specific navigation.

**Lưu ý**

Đây là authentication-only, không phải RBAC.

---

## E2E-ACCESS-FE-004 — Unsupported Edit Student/Course không phát request

**Loại:** Current UI contract / backend capability gap  
**AC:** `AC-GS-07`, `AC-STUDENT-FE-07`, `AC-COURSE-FE-07`

**Các bước**

1. Mở Students List và Student Detail.
2. Kiểm tra Edit Student.
3. Mở Courses List và Course Detail.
4. Kiểm tra Edit Course.
5. Theo dõi network.

**Kết quả mong đợi**

- Action bị ẩn hoặc disabled với giải thích phù hợp.
- Không gửi `PUT/PATCH /student/{id}`.
- Không gửi `PUT/PATCH /course/{id}`.
- Không dùng delete-create workaround.

---

## E2E-PLATFORM-FE-011 — Portal gọi backend qua proxy/same-origin

**Loại:** Environment contract  
**AC:** `AC-PLATFORM-FE-10`

**Các bước**

1. Chạy browser ở URL frontend.
2. Login và mở mỗi domain list.
3. Quan sát console và network.

**Kết quả mong đợi**

- Không có CORS failure.
- Request đi tới đúng backend/proxy.
- Không trộn HTTP/HTTPS gây mixed-content failure.
- API base URL không bị hard-code sai môi trường.
