# Design System: Tokens, Timing and Animation

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-08-03

## Nguyên tắc

Wireframe là grayscale; implementation có thể dùng design tokens nhưng không hard-code style rời rạc.

## Token groups

```text
color.background.page
color.background.surface
color.text.primary
color.text.muted
color.border.default
color.action.primary
color.action.danger
color.feedback.success|warning|error|info
space.1|2|3|4|6|8
radius.sm|md
shadow.card|dialog
```

## Typography

- Page title: 24–28px.
- Section title: 18–20px.
- Body/table: 14–16px.
- Monospace chỉ cho ID/code kỹ thuật khi cần.

## States

- Primary: Login, Save, Add, Submit New Grade.
- Secondary: Back, Cancel, Search.
- Danger: Confirm Delete, Delete Grade.
- Disabled capability: giảm emphasis + tooltip/text giải thích, không chỉ đổi màu.

## Date and score

- Birth Date display: `yyyy/MM/dd`.
- API payload: `yyyy-MM-dd`.
- Grade render như text, không thêm numeric progress/color scale tự suy diễn.


# Timing and Animation

## Search

Student/Course search là client-side trên collection đã tải:

- Debounce 250–400ms hoặc filter đồng bộ nếu collection nhỏ.
- Enter áp dụng ngay.
- Clear reset page về 1.

## Loading

- Tránh skeleton chớp nếu response rất nhanh.
- Form submit disable ngay và chỉ re-enable khi promise kết thúc.
- Count cards tải độc lập.

## Feedback

- Success toast 3–5 giây, nhưng không là bằng chứng duy nhất; list/detail phải phản ánh dữ liệu.
- Error cần đủ lâu hoặc persistent cho tới khi user hành động.
- Delete dialog không tự đóng trước response success.

## Animation

- Route/content transition ngắn, không chặn thao tác.
- Dialog 150–250ms.
- Reduced-motion: tắt chuyển động không cần thiết.
