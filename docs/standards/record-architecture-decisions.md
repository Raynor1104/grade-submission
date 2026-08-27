# Record Architecture Decisions

**Phụ trách:** Technical lead  
**Trạng thái:** Normative  
**Cập nhật lần cuối:** 2026-07-22

Tạo ADR khi quyết định ảnh hưởng nhiều module, khó đảo ngược hoặc có trade-off đáng kể.

Các chủ đề cần ADR nếu thay đổi:

- JWT storage/BFF/cookie strategy.
- State/query library.
- Client-side → server-side pagination.
- API version migration.
- Standard error contract.
- Score chuyển từ string sang enum/numeric.
- Frontend framework/build tool.
- Recent Activities data source.

ADR gồm: Context, Decision, Alternatives, Consequences, Status, Evidence. Draft không được ghi như implementation current.
