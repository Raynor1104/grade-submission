# Đặc tả E2E — Grade Submission Frontend

**Phụ trách:** Frontend + QA teams  
**Trạng thái:** Specification-ready; Playwright source pending  
**Cập nhật lần cuối:** 2026-07-29

> File này là inventory canonical cho browser journeys cần tự động hóa. Khi repository có Playwright source, mỗi hàng phải được bổ sung đường dẫn `*.spec.ts` và chuyển trạng thái phù hợp.

## 1. Boundary và môi trường

| Thành phần | Contract |
| --- | --- |
| Browser runner | Playwright đề xuất |
| Frontend base URL | `http://localhost:5173` đề xuất |
| Backend base URL | `http://localhost:9090` |
| Auth | `username/password` qua `/authenticate` |
| Database | H2 in-memory |
| Reset endpoint | Chưa có |
| Parallel | Không an toàn với một backend/H2 dùng chung |

Happy paths phải dùng backend thật. Route interception chỉ dùng để tạo lỗi UI có kiểm soát và phải được gắn nhãn `Frontend-controlled`.

## 2. Canonical core journeys

| Canonical ID | Journey | Detail doc | Automation status |
| --- | --- | --- | --- |
| `E2E-AUTH-FE-009` | Login → refresh tab → client logout | `e2e/auth.md` | Planned |
| `E2E-GS-007` | Login → Dashboard → Students → Courses → Grades | `e2e/access_control.md` | Planned |
| `E2E-DASH-007` | Dashboard hiển thị ba count | `e2e/dashboard.md` | Planned |
| `E2E-STUDENT-012` | Create → detail → delete Student | `e2e/students.md` | Planned |
| `E2E-COURSE-011` | Create → detail → delete Course | `e2e/courses.md` | Planned |
| `E2E-GRADE-011` | Create → update → delete Grade | `e2e/grades.md` | Planned |
| `E2E-PLATFORM-FE-011` | Frontend gọi backend qua proxy/same-origin | `e2e/system_states.md` | Planned |

## 3. Supporting journey inventory

### Authentication và access control

| ID | Mục tiêu |
| --- | --- |
| `E2E-AUTH-FE-010` | Invalid credentials không tạo session |
| `E2E-AUTH-FE-011` | Protected route không token chuyển Login/401 |
| `E2E-AUTH-FE-012` | API 401 clear token/cache |
| `E2E-AUTH-FE-013` | Login double-submit bị chặn |
| `E2E-AUTH-FE-014` | Token không xuất hiện trong UI/log artifact |
| `E2E-ACCESS-FE-001` | Guest bị chặn khỏi Dashboard |
| `E2E-ACCESS-FE-002` | Navigation active state đúng route |
| `E2E-ACCESS-FE-003` | Deep link protected hoạt động sau login |
| `E2E-ACCESS-FE-004` | Unknown route hiển thị Not Found an toàn |

### Dashboard

| ID | Mục tiêu |
| --- | --- |
| `E2E-DASH-008` | Count thay đổi sau mutation và invalidation |
| `E2E-DASH-009` | Một request fail không làm mất toàn bộ shell |
| `E2E-DASH-010` | Empty collections hiển thị count 0 |
| `E2E-DASH-011` | Recent Activities không giả lập server data |

### Students

| ID | Mục tiêu |
| --- | --- |
| `E2E-STUDENT-013` | List hiển thị Birth Date đúng format |
| `E2E-STUDENT-014` | Search name/ID phía client |
| `E2E-STUDENT-015` | Pagination phía client |
| `E2E-STUDENT-016` | Create gửi `birthDate` ISO |
| `E2E-STUDENT-017` | Detail hiển thị courses/grades |
| `E2E-STUDENT-018` | Confirm Delete: Cancel và Confirm |
| `E2E-STUDENT-019` | Edit Student bị khóa, không có request |

### Courses

| ID | Mục tiêu |
| --- | --- |
| `E2E-COURSE-012` | List map `subject` thành Course Name |
| `E2E-COURSE-013` | Search code/name phía client |
| `E2E-COURSE-014` | Pagination phía client |
| `E2E-COURSE-015` | Create Course |
| `E2E-COURSE-016` | Duplicate code hiển thị safe error |
| `E2E-COURSE-017` | Detail hiển thị students/grades |
| `E2E-COURSE-018` | Edit Course bị khóa, không có request |

### Grades

| ID | Mục tiêu |
| --- | --- |
| `E2E-GRADE-012` | List/filter theo Student |
| `E2E-GRADE-013` | List/filter theo Course |
| `E2E-GRADE-014` | Create alphabetic score |
| `E2E-GRADE-015` | Create numeric-looking string score |
| `E2E-GRADE-016` | Update score |
| `E2E-GRADE-017` | Duplicate pair safe error |
| `E2E-GRADE-018` | Delete Grade |
| `E2E-GRADE-019` | Missing pair hiển thị 404 state |

### System states

Inventory `E2E-STATE-FE-001`…`010` bao phủ:

- 401.
- 404.
- 204 parsing.
- Backend 5xx.
- Network failure.
- Duplicate constraints.
- Missing required fields.
- Unsupported Student/Course edit.
- H2 reset behavior.
- CORS/proxy integration.

### Performance smoke

`E2E-PERF-FE-001`…`005` là regression budgets đề xuất cho Login, Dashboard và các list route. Chỉ trở thành blocking sau khi CI environment ổn định.

## 4. Startup orchestration mục tiêu

```text
build/start backend
→ wait /v3/api-docs
→ start frontend
→ wait /login
→ run Playwright serially
→ collect trace/screenshot/video/report
→ cleanup test data
→ stop processes
```

## 5. Test-data rules

1. Không hard-code JWT.
2. Không hard-code generated ID nếu có thể discover.
3. Dùng unique name/code theo test run.
4. Chỉ xóa data do test tạo.
5. Cleanup Grade trước Student/Course.
6. Suite chạy `workers: 1` khi dùng chung H2.
7. Restart backend khi cần baseline sạch tuyệt đối.

## 6. Assertion rules

- Success response là entity/array trực tiếp, không shared envelope.
- `204` phải có empty body.
- Grade được assert như string.
- Student dùng canonical `birthDate`.
- Course Name lấy từ `subject`.
- Error chưa chuẩn hóa chỉ assert ở mức an toàn.
- Không chụp/log password, Authorization header hoặc full JWT.

## 7. Exit criteria

E2E baseline được coi là sẵn sàng khi:

- Bảy core journeys có Playwright source và AC refs.
- Setup/cleanup deterministic.
- Chạy ổn định 10 lần liên tiếp.
- Không phụ thuộc test order.
- Failure artifacts đủ chẩn đoán và đã redact secret.
- Unsupported capability được test là hidden/disabled, không giả lập thành happy path.
