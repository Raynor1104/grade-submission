# Rollout and Migration

**Trạng thái:** Proposed delivery path

## Phase 0 — Documentation alignment

- giữ nguyên wireframe nguồn trong `references/`;
- xác định Birth Date là canonical Student field;
- xác định score là string;
- đánh dấu Edit Student/Course và Recent Activities là gap;
- chốt route và endpoint mapping.

## Phase 1 — Static prototype

- dựng 12 màn hình và shared layout;
- dùng fixture rõ ràng là mock data;
- kiểm tra responsive, empty, loading, error và confirm dialog;
- không mô tả mock activities là backend data.

## Phase 2 — Integrated MVP

- login JWT;
- route guard và 401 handling;
- dashboard counts;
- Student list/create/detail/delete;
- Course list/create/detail/delete;
- Grade list/filter/create/update/delete;
- client-side search/pagination;
- dev proxy hoặc same-origin deployment.

## Phase 3 — Backend contract improvements

Ưu tiên:

1. chuẩn hóa auth/validation/database errors;
2. thêm update Student và Course;
3. thêm server pagination/search/sort;
4. thêm dashboard summary/activity endpoint nếu sản phẩm cần;
5. thêm DTO + Bean Validation;
6. thêm CORS policy tập trung;
7. thêm API version `/api/v1`;
8. thêm optimistic locking/idempotency nếu có concurrent users.

## Phase 4 — Production readiness

- PostgreSQL + Flyway;
- externalized JWT secret;
- persistent users + roles;
- short-lived token/refresh/revocation policy;
- audit/observability/health;
- production profile, reverse proxy, container và CI/CD.

## Compatibility strategy

Khi backend thêm `/api/v1`, API client giữ endpoint constants ở một nơi. Có thể chạy song song path cũ và mới trong giai đoạn chuyển đổi.

## Rollback

- Frontend: giữ artifact phiên bản trước và feature flag cho feature mới.
- Backend H2 baseline: rollback không giữ được runtime data.
- Sau khi có persistent DB: migration phải backward-compatible và có backup/rehearsal.
