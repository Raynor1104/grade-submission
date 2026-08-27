# Shared system-state journeys

## E2E-STATE-FE-001 — 401 Unauthorized

**Nguồn:** Security entry point  
**Body hiện tại:** `{"error":"Unauthenticated"}`

**Mong đợi UI**

- Clear auth/cache.
- Chuyển Login hoặc trang 401.
- Go to Login hoạt động.
- Không retry vô hạn.

---

## E2E-STATE-FE-002 — Domain 404 detail

Áp dụng Student, Course và Grade pair detail.

**Mong đợi UI**

- Hiển thị Not Found theo ngữ cảnh.
- Có Back CTA.
- Không render raw `timestamp`/JSON.
- Grade pair 404 trong filter là ngoại lệ: hiển thị no-results.

---

## E2E-STATE-FE-003 — `204 No Content`

Áp dụng delete Student, Course, Grade.

**Mong đợi**

- API client không JSON parse.
- Success chỉ hiển thị sau status 204.
- Redirect và invalidate cache đúng.

---

## E2E-STATE-FE-004 — Network failure

**Loại:** Frontend-controlled

Intercept request bị abort/offline.

- Giữ app shell.
- Hiển thị thông báo mất kết nối.
- Có Retry.
- Không xóa token chỉ vì network error.
- Không hiển thị empty state như thể response `[]`.

---

## E2E-STATE-FE-005 — Generic 5xx/default Spring error

Áp dụng invalid credentials hoặc database constraint gap.

**Mong đợi UI**

- Thông báo server error an toàn.
- Không lộ stack trace, SQL, package/class name.
- Không hiển thị success.
- Form input được giữ khi phù hợp.

---

## E2E-STATE-FE-006 — Malformed/unexpected success body

**Loại:** Frontend-controlled

Intercept `200` với body sai shape.

- Error adapter báo “Dữ liệu phản hồi không hợp lệ”.
- Không crash toàn trang.
- Có retry hoặc quay lại.
- Không render `undefined` vào table.

---

## E2E-STATE-FE-007 — Serialization không tạo vòng lặp

**Loại:** Current backend contract

- Student/Course list không có `grades`.
- Grade có nested Student/Course nhưng nested objects không quay lại grade list.
- Browser parse JSON thành công.
- Không có stack overflow hoặc response phình bất thường.

---

## E2E-STATE-FE-008 — H2 reset sau restart

**Loại:** Demo environment behavior

1. Tạo dữ liệu động.
2. Restart backend.
3. Login và reload lists.

**Mong đợi**

- Dữ liệu động biến mất.
- 4 Students và 6 Courses được seed lại.
- Grades trở về rỗng.
- Frontend không tuyên bố dữ liệu demo là persistent production data.

---

## E2E-STATE-FE-009 — Confirm Delete modal

**Nguồn:** Wireframe screen 12

Kiểm tra:

- Dialog có accessible name.
- Hiển thị đúng target.
- Có cảnh báo quan hệ grade.
- Cancel đóng dialog và không gửi request.
- Confirm bị disable khi request đang chạy.
- Escape/focus behavior theo accessibility standard.

---

## E2E-STATE-FE-010 — Unsupported capability state

Student/Course Edit:

- Hiển thị hidden/disabled hoặc “Not supported by current API”.
- Không chuyển vào form có Save hoạt động giả.
- Không gửi endpoint không tồn tại.
