# Edge Cases and Failure Modes

**Trạng thái:** Backend-aligned review + frontend response policy

## Authentication

### EC-001 — Sai credentials

Backend có thể trả generic exception/500 thay vì 401 ổn định. UI hiển thị thông báo chung “Đăng nhập không thành công”, không lộ stack trace.

### EC-002 — JWT hết hạn hoặc sai

Khi protected API trả 401: xóa token, clear cache và redirect Login. Không retry vô hạn.

### EC-003 — Token còn trong sessionStorage nhưng backend từ chối

Route guard có thể cho vào tạm thời; HTTP client 401 interceptor là lớp xử lý cuối.

### EC-004 — Logout không revoke token

Xóa token chỉ đăng xuất trên thiết bị hiện tại. Token bị sao chép vẫn có thể dùng đến lúc hết hạn.

## Browser/network

### EC-005 — CORS

Login có thể hoạt động nhưng business endpoints có thể bị browser chặn khi khác origin. Dùng proxy/same-origin hoặc sửa backend CORS.

### EC-006 — Dashboard partial failure

Một endpoint count lỗi không làm mất hai card còn lại.

### EC-007 — Backend restart

H2 reset; detail route cũ có thể thành 404. UI phải có Not Found state và đường quay lại list.

## Student/Course

### EC-008 — Edit action không có API

Ẩn/disable; không dùng delete + create.

### EC-009 — Delete unknown ID

Behavior chưa ổn định; coi cả 204 và 404 là kết quả có thể gặp, sau đó refetch list.

### EC-010 — Cascade delete

Xóa Student/Course có thể xóa Grade liên quan. Confirm dialog phải cảnh báo và invalidate Grade cache.

### EC-011 — Duplicate Course code

Có thể thành database/default error. Giữ form, hiển thị lỗi chung và cho sửa code.

### EC-012 — Empty hoặc invalid fields

Backend validation chưa đầy đủ. Frontend guard giảm lỗi nhưng không được xem là security/business enforcement.

## Grade

### EC-013 — Duplicate Grade pair

Unique constraint chặn nhưng error chưa ổn định. UI nên kiểm tra cache/dữ liệu hiện có và vẫn xử lý server error.

### EC-014 — Score tự do

Không tự ép kiểu. Blank string bị chặn ở client; mọi policy khác cần quyết định nghiệp vụ.

### EC-015 — List theo parent không tồn tại

Backend có thể trả array rỗng thay vì 404.

### EC-016 — Concurrent update

Không có version/ETag; last-write-wins. Sau update phải refetch Grade pair.

## Search/pagination

### EC-017 — Dataset lớn

Client-side search/page có thể chậm và tốn mạng. Cần server pagination trước khi dữ liệu tăng đáng kể.

### EC-018 — Filter làm trang hiện tại vượt giới hạn

Khi search/filter thay đổi, reset page về 1.

## Wireframe consistency

### EC-019 — Birth Date khác định dạng giữa UI và API

Wireframe hiển thị ngày theo `yyyy/MM/dd`, trong khi payload backend dùng `yyyy-MM-dd`. Frontend phải parse/format có kiểm soát và luôn gửi ngày ISO về API.

### EC-020 — Điểm numeric-looking

`8.5` được truyền và lưu dưới dạng chuỗi, không phải number.
