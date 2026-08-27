# Browser and API performance journeys

**Trạng thái:** Target budgets; chưa có benchmark runner hoặc frontend bundle evidence

Các ngưỡng sau là smoke thresholds, không phải production SLO.

## Điều kiện đo

- Backend và frontend đã warm up.
- CI runner tương đối cố định.
- H2 in-memory.
- Không bật debugger.
- Chạy ít nhất 10 browser iterations cho route và 20 API samples cho endpoint.
- Báo cáo p50, p95, max và error rate.

## E2E-PERF-FE-001 — Login to Dashboard

Đo từ click Login tới khi:

- Dashboard shell hiển thị.
- Ba count request hoàn tất hoặc card có trạng thái cuối.

Target đề xuất:

- p95 < 2.5 s trên CI.
- Không có failed resource.
- `POST /authenticate` p95 < 750 ms.

## E2E-PERF-FE-002 — List route interactive

Routes:

```text
/app/students
/app/courses
/app/grades
```

Target đề xuất:

- Shell/heading visible < 1 s.
- Data table ready p95 < 2 s với seed dataset.
- Student/Course API list p95 < 300 ms sau warm-up.

## E2E-PERF-FE-003 — Grade CRUD browser round trip

```text
Create
→ Detail/list reflected
→ Update
→ Delete
```

Target đề xuất:

- Mỗi mutation UI settled p95 < 1.5 s.
- Backend operation p95 < 400 ms.
- Không có stale row sau settled state.

## E2E-PERF-FE-004 — Client search responsiveness

Với dataset fixture lớn hơn baseline:

- Gõ search không block main thread dài.
- Filter + pagination update p95 < 100 ms cho dataset MVP.
- Không gửi request server cho mỗi keystroke vì search là client-side.

## E2E-PERF-FE-005 — Bundle/navigation smoke

Target:

- Route-level lazy loading khi source frontend áp dụng.
- Không tải toàn bộ test/dev library vào production.
- Không có console long-task nghiêm trọng trong navigation cơ bản.

## Báo cáo

Ghi:

- Commit SHA.
- Browser/version.
- Java/Node version.
- CPU/RAM runner.
- Sample count.
- p50/p95/max.
- Error count.
- Frontend build mode.
- Backend warm-up policy.
