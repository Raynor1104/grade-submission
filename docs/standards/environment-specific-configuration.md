# Environment-Specific Configuration

**Phụ trách:** Frontend + DevOps teams  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

## Suggested variables

```env
VITE_API_BASE_URL=http://localhost:9090
VITE_APP_ENV=local
VITE_ENABLE_DEMO_CREDENTIALS=true
VITE_ENABLE_RECENT_ACTIVITIES=false
```

## Rules

- Mọi `VITE_*` có thể xuất hiện trong browser bundle; không chứa secret.
- Demo credentials chỉ bật trong local/demo.
- `Recent Activities` mặc định false cho đến khi có backend API.
- Production base URL ưu tiên same-origin/reverse proxy.
- Test config deterministic.

## Backend reference

Backend current chạy port `9090`, H2 in-memory và JWT secret trong properties. Đây là server concern; frontend không sao chép secret.

## Precedence đề xuất

```text
runtime injected config (nếu có)
  → mode-specific env
  → safe defaults
```
