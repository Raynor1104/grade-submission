# UI capability matrix

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

| Capability | Wireframe | Backend | UI quyết định hiện tại |
|---|---|---|---|
| Login | Có | Có | Enabled |
| Dashboard counts | Có | Có primitive lists | Enabled, client aggregate |
| Recent Activities | Có | Không | Hidden/Unavailable state |
| Student list/search/page | Có | List all | Enabled, client-side |
| Create Student | Có | Có | Enabled |
| Edit Student | Có | Không | Disabled/hidden; no request |
| Delete Student | Có | Có | Enabled + cascade warning |
| Course list/search/page | Có | List all | Enabled, client-side |
| Create Course | Có | Có | Enabled |
| Edit Course | Có | Không | Disabled/hidden; no request |
| Delete Course | Có | Có | Enabled + cascade warning |
| Grade list/filter | Có | Có | Enabled |
| Create/Update/Delete Grade | Có | Có | Enabled |
| Server logout | UI có Logout | Không | Client cleanup only |
| Role/permission UI | Không | Không | Không triển khai |

## Presentation rule

- **Hidden** khi action sẽ gây hiểu lầm hoặc không có route.
- **Disabled** khi cần giữ fidelity với wireframe/demo; phải có tooltip/copy `Chưa được backend hỗ trợ`.
- Không mô phỏng Edit Student/Course bằng delete + create.
