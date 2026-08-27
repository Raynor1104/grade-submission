# Date and Time Handling

**Phụ trách:** Frontend + Backend teams  
**Trạng thái:** Normative  
**Cập nhật lần cuối:** 2026-07-22

## 1. Birth Date là pure date

- Backend dùng `LocalDate`.
- JSON canonical: `yyyy-MM-dd`, ví dụ `1980-07-31`.
- UI wireframe hiển thị `yyyy/MM/dd`, ví dụ `1980/07/31`.
- Không biến birth date thành midnight UTC timestamp.
- Không để timezone làm lệch ngày.

## 2. Form

Ưu tiên `<input type="date">` hoặc date picker trả ISO date. Khi submit phải gửi `yyyy-MM-dd`.

## 3. Display

Formatter nhận ISO date và tạo label. Sort phải dựa vào ISO/canonical value, không dựa vào label đã format.

## 4. Error timestamp

Current backend not-found dùng `LocalDateTime` không offset. Frontend chỉ dùng để hiển thị/debug; không suy luận timezone chắc chắn.

Target event timestamps nên ISO-8601 có `Z` hoặc offset.

## 5. Tests

- Leap day.
- Month/day padding.
- Locale render không thay đổi payload.
- Round-trip input → payload → response → label.
