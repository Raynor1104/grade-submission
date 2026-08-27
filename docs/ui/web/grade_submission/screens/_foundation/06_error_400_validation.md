# Validation and invalid input

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

## Nguyên tắc

Backend validation hiện chưa đồng nhất; frontend cung cấp guard tối thiểu nhưng không phát minh business limit chưa được xác nhận.

## Student

- `name`: required sau trim.
- `birthDate`: required, gửi `yyyy-MM-dd`, không future date theo frontend target.
- `id`: server-managed, không gửi trong create body.

## Course

- `subject`, `code`, `description`: required sau trim.
- Không tự uppercase code khi chưa có quyết định sản phẩm.
- Duplicate code có thể trả framework/database error; map sang form alert an toàn.

## Grade

- Student và Course bắt buộc.
- `score` required sau trim.
- Không dùng numeric input/range; `A`, `B+`, `Pass`, `8.5` đều là chuỗi hợp lệ phía UI.

## Presentation

- Field error đặt ngay dưới field.
- Global/unmapped server error đặt đầu form.
- Focus lỗi đầu tiên sau submit.
- Giữ toàn bộ input khi submit thất bại.
