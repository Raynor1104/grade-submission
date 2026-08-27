# Security — Grade Submission Frontend

**Phụ trách:** Frontend + Backend security reviewers  
**Trạng thái:** Current JWT contract + frontend security baseline  
**Cập nhật lần cuối:** 2026-07-29

## 1. Security boundary

Frontend là public client chạy trong browser. Không thể giữ bí mật và không thay thế authorization phía server.

Backend hiện tại:

- JWT stateless, HS256, TTL khoảng 24 giờ.
- Public `POST /authenticate`.
- Business APIs yêu cầu Bearer token.
- CSRF disabled.
- Không refresh token, revocation, server logout hoặc RBAC.
- Một demo account `username/password`.

## 2. Token handling

### Baseline demo

- Ưu tiên `sessionStorage` nếu sản phẩm chấp nhận mất session khi đóng tab.
- Không lưu token trong URL, query string hoặc cookie không được thiết kế rõ.
- Không log token hoặc Authorization header.
- Không gửi token tới analytics, error tracking hoặc third-party script.
- Clear token và server-state cache khi nhận `401` hoặc logout.

`sessionStorage` vẫn có rủi ro XSS. Production cần threat-model lại; BFF/HttpOnly cookie chỉ là target nếu backend contract được thay đổi.

## 3. Login security

- Password input dùng `type="password"`.
- Không persist password.
- Không đưa password vào state devtools lâu hơn cần thiết.
- Disable double submit.
- Error copy không tiết lộ username có tồn tại hay không.
- Demo credentials chỉ hiển thị khi `VITE_ENABLE_DEMO_CREDENTIALS=true` trong môi trường được phép.

## 4. Route guard và authorization

- Route guard chỉ là UX boundary.
- Backend `401` là nguồn xác nhận cuối cùng.
- Không có role/permission nên frontend không được giả lập RBAC như security guarantee.
- Deep link protected phải được kiểm tra trước khi render dữ liệu nhạy cảm.

## 5. API client rules

- Chỉ gửi token tới trusted API origin/path.
- Không tự động follow redirect sang origin không tin cậy cùng Authorization header.
- Timeout và abort request hợp lý.
- Không retry mutation mù quáng.
- `204` xử lý empty body.
- Error normalizer phải loại bỏ stack trace, SQL và vendor details khỏi UI.

## 6. CSRF, ETag và idempotency

Không mô tả các cơ chế sau như current backend contract:

- CSRF token.
- ETag/`If-Match`.
- Idempotency key.

Backend dùng Bearer token và hiện tắt CSRF. Chỉ thêm header mới khi backend đã hỗ trợ và contract được cập nhật.

## 7. XSS và output encoding

- Dùng Vue text binding mặc định.
- Tránh `v-html` cho dữ liệu backend.
- Nếu buộc render HTML, sanitize bằng thư viện được review.
- Không tạo HTML từ error message thô.
- Course description và names phải được render như text.
- Cân nhắc CSP nghiêm ngặt cho production.

## 8. Environment và secrets

- Không commit `.env` chứa dữ liệu nhạy cảm.
- Chỉ commit `.env.example` với giá trị an toàn.
- Mọi `VITE_*` được coi là public.
- JWT signing key, database password và backend credential không thuộc frontend.
- Secret scanning nên chạy pre-commit và CI.

## 9. Dependency và supply-chain

- Dùng lockfile và `npm ci` trong CI.
- Review package mới trước khi thêm.
- Chạy vulnerability audit định kỳ.
- HIGH/CRITICAL vulnerability phải được triage trước merge/release.
- Hạn chế third-party scripts trên Login và protected pages.
- Không tải dependency runtime từ CDN không kiểm soát nếu build có thể bundle local.

## 10. Logging và telemetry

Có thể log:

- Request method và endpoint template.
- Status code.
- Timing.
- Client correlation/test run ID.
- Sanitized error category.

Không log:

- Password.
- JWT/full Authorization header.
- Raw sensitive request body.
- Full backend stack trace/SQL.
- Dữ liệu cá nhân không cần thiết.

## 11. Data privacy

Dữ liệu Student gồm tên và ngày sinh. Dù dự án là demo, frontend phải:

- Chỉ hiển thị dữ liệu cần thiết.
- Không lưu list response lâu hơn cache policy.
- Clear domain cache khi logout/401.
- Không đưa dữ liệu Student vào analytics.
- Không tạo public share URL chứa ID/data nhạy cảm ngoài scope.

## 12. Transport và deployment

- Production dùng HTTPS.
- Ưu tiên same-origin reverse proxy.
- Cross-origin cần backend CORS allowlist cụ thể.
- Không dùng wildcard origin với credential-bearing design tương lai.
- Source maps production phải có policy rõ ràng.

## 13. Security test checklist

- [ ] Guest không mở protected route.
- [ ] 401 clear session/cache.
- [ ] JWT không xuất hiện trong DOM, URL, console hoặc report.
- [ ] Password không persist.
- [ ] Error UI không rò SQL/stack trace.
- [ ] Text từ backend không thực thi HTML/script.
- [ ] Delete có confirmation.
- [ ] Unsupported Edit không tạo workaround nguy hiểm.
- [ ] Dependency audit pass theo policy.
- [ ] Env/bundle không chứa secret.

## 14. Incident response tối thiểu

1. **Phát hiện:** ghi nhận thời gian, version, route, sanitized evidence.
2. **Cô lập:** tắt release/feature hoặc revoke credential phía backend nếu có.
3. **Điều tra:** kiểm tra frontend bundle, logs đã redact và backend logs.
4. **Khắc phục:** patch, rotate secret phía backend, clear affected sessions nếu có cơ chế.
5. **Xác minh:** regression test và security review.
6. **Post-mortem:** nguyên nhân, phạm vi ảnh hưởng, action owner và deadline.

## 15. Known risks

- JWT signing secret hiện là backend configuration concern và baseline backend chưa production-ready.
- `sessionStorage` không bảo vệ khỏi XSS.
- Không có revocation/logout server-side.
- Không có RBAC.
- Error contract chưa ổn định có thể làm rò chi tiết nếu UI render raw body.
- H2 và demo account không phù hợp production.
