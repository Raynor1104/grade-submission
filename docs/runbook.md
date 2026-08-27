# Runbook — Grade Submission Frontend

**Phụ trách:** Frontend + QA + DevOps  
**Trạng thái:** Specification-ready; commands must be verified against source  
**Cập nhật lần cuối:** 2026-07-29

## 1. Mục tiêu

Runbook hướng dẫn cài đặt, chạy local, kết nối backend, build, kiểm thử, smoke check và xử lý lỗi phổ biến cho Grade Submission Frontend.

## 2. Yêu cầu

### Frontend

- Node.js version được pin bằng `.nvmrc`, `.node-version` hoặc `package.json#engines`.
- npm tương thích với lockfile.
- Browser hiện đại.

### Companion backend

- JDK 17+.
- Spring Boot backend source.
- Port mặc định `9090`.

Không lưu JWT secret hoặc production credential trong frontend env.

## 3. Environment variables đề xuất

`.env.example`:

```env
VITE_API_BASE_URL=http://localhost:9090
VITE_APP_ENV=local
VITE_ENABLE_DEMO_CREDENTIALS=true
VITE_ENABLE_RECENT_ACTIVITIES=false
```

Quy tắc:

- Mọi `VITE_*` có thể xuất hiện trong browser bundle.
- Không đặt password, JWT signing key hoặc database credential trong `VITE_*`.
- Production ưu tiên same-origin/reverse proxy.
- Demo credentials chỉ bật ở local/demo.

## 4. Chạy backend local

Linux/macOS, nếu Maven Wrapper cần chuẩn hóa:

```bash
sed -i 's/\r$//' mvnw
chmod +x mvnw
./mvnw spring-boot:run
```

Windows:

```bat
mvnw.cmd spring-boot:run
```

Kiểm tra readiness tạm thời:

```bash
curl -fsS http://localhost:9090/v3/api-docs > /dev/null
```

Swagger:

```text
http://localhost:9090/swagger-ui/index.html
```

## 5. Chạy frontend local

> Đây là command contract mục tiêu; xác nhận với `package.json` khi source có sẵn.

```bash
npm ci
cp .env.example .env
npm run dev
```

Frontend đề xuất chạy tại:

```text
http://localhost:5173
```

Nếu dùng dev proxy, browser gọi relative path và dev server chuyển request tới `http://localhost:9090`.

## 6. Smoke test API

### Login

```bash
TOKEN=$(curl -fsS -X POST http://localhost:9090/authenticate \
  -H 'Content-Type: application/json' \
  -d '{"username":"username","password":"password"}' \
  | jq -r '.token')
```

Không in full token vào CI log.

### Protected API

```bash
curl -fsS http://localhost:9090/student/all \
  -H "Authorization: Bearer ${TOKEN}"

curl -fsS http://localhost:9090/course/all \
  -H "Authorization: Bearer ${TOKEN}"

curl -fsS http://localhost:9090/grade/all \
  -H "Authorization: Bearer ${TOKEN}"
```

## 7. Build và preview

Command contract mục tiêu:

```bash
npm run typecheck
npm run build
npm run preview
```

Build phải fail nếu:

- Thiếu biến môi trường bắt buộc.
- Typecheck lỗi.
- Import rule bị vi phạm.
- Bundle vượt budget đã chốt.

## 8. Test và quality gates

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run e2e
```

Playwright cài browser khi cần:

```bash
npx playwright install --with-deps
```

E2E sử dụng backend thật, chạy tuần tự nếu dùng chung H2.

## 9. Manual smoke checklist

1. Mở `/login`.
2. Login bằng demo account.
3. Dashboard hiển thị ba count hoặc degraded state rõ ràng.
4. Mở Students, Courses, Grades.
5. Tạo Student và Course test với unique data.
6. Tạo, cập nhật rồi xóa Grade.
7. Xóa record test qua Confirm Delete.
8. Refresh tab và kiểm tra storage policy.
9. Logout và xác minh protected route bị chặn.
10. Thử mobile width và keyboard navigation.

## 10. Dữ liệu và reset

Backend dùng H2 in-memory:

- Restart application làm mất dữ liệu runtime.
- Startup seed xuất hiện lại.
- Không dựa vào generated ID cố định.
- Test destructive chỉ dùng record do test tạo.

## 11. Deployment posture

### Khuyến nghị demo

```text
Browser
  → reverse proxy cùng origin
      ├── /        → frontend static assets
      └── API paths → Spring Boot :9090
```

### Cross-origin

Chỉ dùng khi backend có CORS allowlist rõ ràng. Không dùng `mode: no-cors`.

### HTTPS

Production phải dùng HTTPS. Frontend không chịu trách nhiệm giữ JWT signing secret.

## 12. Troubleshooting

### Login không thành công

- Kiểm tra backend đang chạy.
- Kiểm tra request body dùng `username/password`.
- Kiểm tra endpoint là `/authenticate`, không phải `/api/v1/auth/login`.
- Inspect status/body nhưng không log password.

### Protected API trả 401

- Kiểm tra `Authorization: Bearer <token>`.
- Token có thể hết hạn sau 24 giờ.
- Clear session và login lại.
- Không retry vô hạn.

### Browser báo CORS

- Dùng Vite/dev proxy hoặc same-origin reverse proxy.
- Không sửa bằng `no-cors`.
- Nếu bắt buộc cross-origin, cấu hình allowlist phía backend.

### Danh sách không cập nhật sau mutation

- Kiểm tra query key và invalidation matrix.
- Kiểm tra mutation thực sự thành công trước khi hiển thị toast.
- Refetch Dashboard counts nếu cần.

### Delete trả 204 nhưng UI báo parse error

- Không gọi `response.json()` cho status `204`.

### Duplicate Course/Grade trả lỗi khó hiểu

- Frontend phải hiển thị generic conflict error.
- Không hiển thị raw SQL/stack trace.
- Ghi lại response đã redact để backend chuẩn hóa sau.

### Dữ liệu biến mất

- Backend restart đã reset H2; đây là baseline hiện tại.

### Edit Student/Course không hoạt động

- Đây là capability bị chặn; backend chưa có update endpoint.

## 13. Release checklist

- [ ] Lint/typecheck/test/build pass.
- [ ] Core E2E pass.
- [ ] Không bật demo credentials ngoài môi trường được phép.
- [ ] API base URL đúng môi trường.
- [ ] HTTPS và CORS/reverse proxy được kiểm tra.
- [ ] Không có secret trong bundle hoặc source map công khai.
- [ ] Bundle budget đạt.
- [ ] Docs và changelog cập nhật.
