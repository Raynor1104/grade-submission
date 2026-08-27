# UI Documentation — Grade Submission

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

Folder này chứa đặc tả UI theo platform cho **Grade Submission System**.

- Web UI: `web/`
- Nguồn wireframe canonical: `web/grade_submission/references/wireframe.md`
- Chỉ mục visual handoff: `web/grade_submission/design_pack.md`
- Đặc tả từng màn hình: `web/grade_submission/screens/`

## Nguyên tắc nguồn sự thật

1. Wireframe quyết định bố cục, nhãn và hành trình người dùng.
2. Backend docs quyết định endpoint và behavior hiện có.
3. Khi wireframe yêu cầu chức năng backend chưa hỗ trợ, screen doc phải gắn trạng thái **Blocked/Backlog**, không giả lập bằng API khác.
4. `birthDate` là field Student canonical; `score` là chuỗi tự do.
