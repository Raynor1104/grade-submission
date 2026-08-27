# Shared system states

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

## Loading

- Page initial load: skeleton/card placeholder.
- Table load: skeleton rows hoặc progress label.
- Form submit: disable primary action, `aria-busy=true`, chống double submit.
- Không che navigation toàn cục khi chỉ một card Dashboard lỗi.

## Empty

- Collection rỗng: giải thích và CTA Create nếu capability Current.
- Filter rỗng: `Không tìm thấy kết quả`; CTA Clear filters.
- Student/Course không có grades: empty row trong related table.
- Recent Activities: hiển thị `Chưa có nguồn dữ liệu hoạt động` hoặc ẩn panel; không dùng mock data runtime.

## Partial data

Dashboard có ba request độc lập. Một request lỗi không che hai count thành công.

## Success

- Create/update/delete: toast/inline notice ngắn, sau khi server trả thành công.
- `204 No Content`: không parse JSON; invalidate/refetch rồi điều hướng phù hợp.

## Error routing

| Tình huống | UI |
|---|---|
| 400/client validation | Field/form error |
| 401 | Login/Unauthorized flow |
| 404 detail | Resource Not Found |
| Duplicate DB constraint | Conflict-safe generic message |
| 5xx/unexpected body | Generic retry state |
| Network failure | Retry, giữ context |
