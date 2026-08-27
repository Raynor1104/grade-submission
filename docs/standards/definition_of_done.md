# Definition of Done

**Phụ trách:** Frontend team  
**Trạng thái:** Normative  
**Cập nhật lần cuối:** 2026-07-22

Một thay đổi chỉ Done khi:

## Specification

- AC canonical đã cập nhật.
- Wireframe/backend mapping đúng.
- Current/Target/Backlog được phân biệt.

## Implementation

- API đi qua client chung.
- Không gọi endpoint không tồn tại.
- Birth Date và Course subject mapping đúng.
- Score không bị ép number.
- Loading/empty/error/401 được xử lý.
- Accessibility cơ bản đạt.

## Verification

- Unit/component tests cho logic mới.
- E2E cho critical flow khi khả thi.
- Lint, typecheck, test, build pass.
- Không `.only`, secret, token hoặc debug logging.

## Documentation

- Task/test/traceability cập nhật.
- Link không hỏng.
- Breaking contract có migration note/ADR.

## Backend gaps

Task có dependency backend chưa hoàn tất không được đánh dấu Done; phải là `blocked` hoặc scope UI disabled đã được chấp nhận.
