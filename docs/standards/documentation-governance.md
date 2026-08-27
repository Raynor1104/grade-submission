# Documentation Governance

**Phụ trách:** Frontend lead / Technical reviewer  
**Trạng thái:** Normative  
**Cập nhật lần cuối:** 2026-07-22

## 1. Vai trò

| Vai trò | Trách nhiệm |
| --- | --- |
| Author | Cập nhật code, spec, task và test mapping cùng change set |
| Product/domain reviewer | Xác nhận Student, Course, Grade và hành vi xóa cascade |
| Backend reviewer | Xác nhận endpoint, payload, status và gap |
| Security reviewer | Review JWT storage, login, 401, logging và secret handling |
| Maintainer | Ngăn tài liệu drift khỏi wireframe/backend |

## 2. Hierarchy

- `modules/*/spec.md`: yêu cầu canonical.
- `architecture/*`: context, journeys, decisions và gap.
- `standards/*`: quy tắc cross-cutting.
- `references/*`: snapshot nguồn, không tự động là implementation truth.

## 3. Thay đổi bắt buộc cập nhật tài liệu

| Thay đổi | Tài liệu cần review |
| --- | --- |
| Endpoint/path/method | API integration, module spec, tests, traceability |
| Đổi `birthDate` hoặc `score` type | Domain mapping, validation, wireframe docs, test data |
| Thêm update Student/Course | Module spec/tasks/tests, route/action state, backlog |
| Thêm pagination server-side | API integration, state management, list tests |
| Đổi authentication | Security, auth module, error codes, E2E |
| Chuẩn hóa error response | Error contract, error codes, API client tests |
| Thay H2/persistence | Assumptions, runbook, test isolation |

## 4. Review rules

- Không khẳng định backend có capability chỉ dựa trên wireframe.
- Không dùng mock data để kết luận API đã hỗ trợ.
- Mỗi example payload phải khớp field thực tế.
- Không đưa JWT, secret hoặc password ngoài demo placeholder vào tài liệu.
- Link nội bộ phải tồn tại trước khi merge.

## 5. Deprecation

1. Announced: ghi replacement và phạm vi ảnh hưởng.
2. Deprecated: frontend vẫn tương thích trong migration window.
3. Removed: chỉ sau khi client đã chuyển và contract release cho phép.

Route hiện chưa version hóa nên mọi đổi path/field bắt buộc phải có migration note.
