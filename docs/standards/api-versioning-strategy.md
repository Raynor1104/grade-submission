# API Versioning Strategy

**Phụ trách:** Backend owner + Frontend owner  
**Trạng thái:** Current unversioned; target backlog  
**Cập nhật lần cuối:** 2026-07-22

## Current

Frontend phải gọi route root hiện tại. Không thêm `/api/v1` vào client khi backend chưa cung cấp.

## Target

Backend có thể cung cấp `/api/v1/**` song song route cũ. Migration:

1. Phát hành route version mới song song.
2. Cập nhật OpenAPI và ghi deprecated route cũ.
3. Frontend hỗ trợ base-path switch bằng cấu hình.
4. Chuyển E2E/contract tests.
5. Xóa route cũ trong release có thông báo.

## Breaking changes

- Đổi/xóa field (`subject`, `birthDate`, `score`).
- Đổi type, đặc biệt `score` string thành numeric/enum.
- Đổi route hoặc HTTP method.
- Thêm field request bắt buộc.
- Đổi login/token shape.
- Chuyển direct response sang envelope mà không có migration.

## Non-breaking candidates

- Thêm field response optional và client bỏ qua field lạ.
- Thêm endpoint mới.
- Thêm pagination opt-in trong route/query mới mà giữ route cũ.
