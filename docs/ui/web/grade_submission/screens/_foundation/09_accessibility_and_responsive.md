# Accessibility and Responsive Design

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-08-03

## Landmarks và navigation

- Dùng `header`, `nav`, `main` và heading hierarchy hợp lệ.
- Có `Skip to main content`.
- Active navigation dùng `aria-current="page"`.

## Forms

- Label luôn hiển thị, placeholder không thay label.
- Error liên kết bằng `aria-describedby`; input lỗi có `aria-invalid=true`.
- Date field có hướng dẫn format nếu không dùng native date input.
- Password có `autocomplete="current-password"`.

## Tables

- Header dùng `<th>` và scope phù hợp.
- Action có accessible name đầy đủ: `Xem sinh viên Nguyễn Văn A`, không chỉ `View`.
- Pagination thông báo trang hiện tại.

## Dialog

- Confirm Delete dùng `role=dialog`, `aria-modal=true`, focus trap.
- Focus vào Cancel mặc định hoặc destructive action theo risk review.
- Đóng xong trả focus về trigger.

## Keyboard và motion

- Tất cả actions dùng được bằng keyboard.
- Focus visible rõ.
- Tôn trọng `prefers-reduced-motion`.
- Không dùng màu là tín hiệu duy nhất.


# Responsive Design

## Breakpoint guidance

- Mobile: `< 768px`.
- Tablet/Desktop: `≥ 768px`.
- Không xem breakpoint là contract framework; ưu tiên content fit.

## App Shell

- Desktop: navigation ngang như wireframe.
- Mobile: menu drawer hoặc navigation wrap; giữ thứ tự Dashboard → Students → Courses → Grades → Logout.

## Tables

- Ưu tiên horizontal scroll thay vì xóa cột quan trọng.
- Mobile có thể chuyển actions vào overflow menu.
- Birth Date, Course Code và Grade không được ẩn đồng thời với identity chính.

## Forms

- Desktop: card max-width, field xếp dọc theo wireframe.
- Mobile: full-width, actions wrap; primary Save vẫn dễ truy cập.

## Dashboard

- Ba count cards: 3 cột desktop, 1 cột mobile.
- Recent Activities nếu bị ẩn do capability không được thay bằng khoảng trắng lớn.

## Dialog

- Desktop: modal max-width.
- Mobile: gần full-width, nội dung scroll nội bộ.
