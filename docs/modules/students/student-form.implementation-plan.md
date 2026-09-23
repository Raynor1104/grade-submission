# Student Form (Create / Update Student) — Implementation Plan

**Phụ trách:** Frontend team  
**Trạng thái:** Implemented in frontend; live E2E chưa chạy  
**Cập nhật lần cuối:** 2026-09-22  
**Nguồn yêu cầu:** `docs/modules/students/student-form.spec-pack.md`

## 1. Mục tiêu và phạm vi

Triển khai Create và Edit Student bằng **một** `StudentForm.vue` dùng chung field, form state, validation, error rendering và responsive layout. Page wrapper quản lý API, query cache và navigation. Create dùng `POST /student`; Edit preload bằng `GET /student/{id}` và chỉ ghi bằng endpoint Update Student chính thức sau khi xác minh contract backend.

Phạm vi gồm UI Create/Edit, validation, API adapter/query/mutation, route và Edit entry point, cache synchronization, accessibility, responsive behavior và kiểm thử tương ứng. Không tạo hai form độc lập, không dùng DELETE + POST để giả lập Update, không thêm unsaved-change dialog trong đợt này.

## 2. Hiện trạng và điểm cần xác minh

| Hạng mục | Hiện trạng trong source ngày 2026-09-22 | Việc cần làm |
| --- | --- | --- |
| `/students/new` | Đã có route; `StudentCreatePage.vue` còn placeholder | Thay bằng Create wrapper và shared form |
| `/students/:id/edit` | Chưa có route/page | Thêm sau khi preload và mutation Update hoạt động |
| `/students/:id` | `StudentDetailPage.vue` còn placeholder | Edit Cancel/success tạm về `/students`; chuyển sang detail khi page đó hoàn chỉnh |
| Student API/query | `student.api.ts` có GET all, DELETE; `student.queries.ts` chỉ có `all()` | Thêm Create, Detail, Update và detail query |
| Cache | Đã có `studentKeys.root`, `all()`, `detail(id)` | Reuse; không tạo key trùng |
| HTTP client | Có GET/POST/DELETE và xử lý 401; chưa expose PUT/PATCH | Bổ sung đúng method backend xác nhận, giữ auth/error behavior chung |
| Form UI | `BaseInput` chỉ cho `text/password/email`; `BaseButton` đã hỗ trợ submit/loading | Mở rộng `BaseInput` cho date và kiểm tra semantic required/error |
| Student list | Source hiện dùng `studentQueries.all()` và DELETE API; Edit đang disabled | Bật Edit sau khi route/Update đã hoàn tất; bỏ thông báo unavailable |
| Dashboard | Dùng cùng `studentQueries.all()` | Student cache invalidation sẽ cập nhật count khi query refetch |

**Contract cần xác minh trước khi bật Edit:** Spec pack mới khẳng định backend có `PUT/PATCH /student/{id}`, nhưng `docs/modules/students/spec.md`, `student-management.spec-pack.md` và tài liệu E2E cũ vẫn ghi Update chưa được hỗ trợ. Chưa có nguồn trong repo chỉ rõ method, payload/response hoặc mã lỗi. Kiểm tra OpenAPI/controller hoặc thử trên backend mục tiêu, chọn **một** method chính thức và cập nhật docs/tests theo kết quả. Có thể xây shared UI và Create trước; không kích hoạt route/Edit action với một method phỏng đoán.

## 3. AC mapping

| Nhóm công việc | AC-STUDENT-FORM |
| --- | --- |
| Shared UI, labels, ID, responsive và accessibility | 001–005, 016–017, 024–025, 033–035 |
| Shared validation, date-only và form state | 006–009, 018, 023, 036, 038 |
| Create API, pending/error, cache, navigation | 010–015, 032, 037 |
| Edit route, preload và system states | 019–022, 027 |
| Update API, pending/error và cache | 026, 028–031, 032, 037 |

## 4. Files/modules bị ảnh hưởng

| File | Thay đổi dự kiến |
| --- | --- |
| `src/features/students/model/student-form.ts` | Tạo `StudentFormMode`, `StudentFormValues`, normalization và pure validation dùng chung |
| `src/features/students/components/StudentForm.vue` | Tạo form Create/Edit, ID chỉ hiển thị, field/error/actions/pending |
| `src/features/students/pages/StudentCreatePage.vue` | Thay placeholder bằng Create wrapper |
| `src/features/students/pages/StudentEditPage.vue` | Tạo Edit wrapper, route ID, detail query, loading/404/retry và Update |
| `src/features/students/api/student.api.ts` | Thêm `createStudent`, `getStudent`, `updateStudent` |
| `src/features/students/api/student.queries.ts` | Thêm `detail(id)` với `studentKeys.detail(id)` |
| `src/features/students/model/student.types.ts` | Thêm typed Create/Update input theo contract đã xác minh |
| `src/core/api/http-client.ts` | Thêm method PUT hoặc PATCH cần thiết, không nhân bản HTTP logic |
| `src/shared/ui/BaseInput.vue` | Hỗ trợ `type="date"`; bảo đảm required semantic, blur/focus API nếu form cần |
| `src/app/router/routes.ts` | Thêm named route `student-edit` dưới authenticated `MainLayout` |
| `src/features/students/components/StudentTable.vue`, `src/features/students/pages/StudentsPage.vue` | Bật Edit action/navigation và bỏ unavailable note sau khi Edit production-ready |
| `docs/modules/students/spec.md`, `docs/e2e/students.md`, các tài liệu traceability liên quan | Đồng bộ Update contract và trạng thái capability sau khi xác minh |

Test files đặt cạnh model/component/page/API theo cấu trúc test đang dùng trong repo; chỉ thêm E2E khi môi trường backend/auth khả dụng.

## 5. Implementation steps

### Bước 0 — Chốt API contract và baseline

1. Ghi nhận baseline `npm run test:unit` và `npm run build`.
2. Xác minh `GET /student/{id}`, `POST /student` và Update qua backend contract thực tế: method PUT hay PATCH, body `{ name, birthDate }`, response có thể rỗng hay Student DTO, status 404/4xx và auth.
3. Nếu Update hỗ trợ cả hai method, chọn một method canonical; ghi quyết định ở đây, adapter và docs. Không mặc định response Update có body nếu backend chỉ trả 204.
4. Kiểm tra các màn hình nào hiển thị student name từ grade payload để quyết định có cần invalidate `gradeKeys` khi Update hay không.

**Exit criteria:** Có contract đủ để code/test adapter; mọi điểm còn chưa xác minh được ghi rõ, Edit chưa được enable khi thiếu contract.

### Bước 1 — Shared form model và input

1. Tạo form values chỉ gồm `name` và `birthDate`; Student ID thuộc entity/route, không nằm trong editable state hoặc Create payload.
2. Tạo hàm normalize: trim `name` trước validation/submit, giữ nguyên casing và chuỗi `birthDate` dạng `yyyy-MM-dd`.
3. Validate name không rỗng sau trim; birthDate required, đúng calendar date và không sau **ngày hiện tại theo local calendar**. Kiểm tra ngày nhuận bằng calendar parts, không dùng UTC conversion để tính ngày hiện tại.
4. Mở rộng `BaseInput` cho date hoặc dùng field native cùng convention nếu thay đổi shared component gây ảnh hưởng; ưu tiên mở rộng `BaseInput` sau khi kiểm tra consumers.

**Exit criteria:** Pure tests cover whitespace/Unicode, ngày nhuận hợp lệ và không hợp lệ, malformed, future local date và date-only không đổi.

### Bước 2 — `StudentForm.vue` dùng chung

1. Render header trong page và `BaseCard` chứa cùng `StudentForm` cho cả hai mode theo design `student_form.png`.
2. Form nhận `mode`, `studentId?`, `initialValues?`, `pending`, `submitError`; emit `submit(values)` và `cancel`. Create hiển thị `Auto-generated after saving`, Edit hiển thị ID thật không thể sửa.
3. Dùng `<form>` semantic, submit qua `type="submit"`, Cancel `type="button"`; validation khi blur hoặc sau submit đầu, rồi cập nhật lỗi khi sửa. Focus field lỗi đầu tiên khi submit thất bại.
4. Pending khóa mọi đường submit (click lẫn Enter) và Cancel trong lúc ghi; form-level error hiển thị bằng live region nhưng không xóa values. Không gọi API/router trong component.
5. Nếu `initialValues`/student ID đổi, khởi tạo lại form đúng entity mới; page phải tránh overwrite draft bằng refetch của cùng entity ngoài ý muốn.

**Exit criteria:** Component tests cover cả mode, copy, preload, submit hợp lệ/không hợp lệ, lỗi, Cancel, pending và ID không vào payload.

### Bước 3 — Create integration

1. `createStudent(input)` gọi `POST /student` qua `httpClient`; type response phù hợp contract thực tế, không yêu cầu ID nếu điều hướng về list.
2. Create page render empty form, gọi mutation với retry ghi = 0, chặn submit trùng ngay ở page/mutation boundary.
3. Khi thành công, invalidate `studentKeys.root` để list và Dashboard dùng cùng query được làm mới, rồi điều hướng `/students`.
4. Khi lỗi, giữ values và route; 401 dùng centralized auth-expired flow. Cancel về `/students` và không phát request.

**Exit criteria:** Integration tests xác nhận đúng một POST, payload không có ID, pending/error/success/cache/navigation.

### Bước 4 — Detail preload và Edit states

1. Thêm `getStudent(id)` dùng mapper hiện có và `studentQueries.detail(id)`.
2. Parse route ID thành positive safe integer trước khi gọi query; invalid ID vào Not Found/invalid route state, không gọi GET/Update.
3. Edit page có loading, 404 và network/5xx error + Retry GET riêng biệt. Chỉ mount editable form sau khi có Student hợp lệ.
4. Key form theo student ID hoặc đồng bộ values có kiểm soát khi route đổi từ ID 1 sang ID 2 trong cùng lifecycle; không hiển thị draft của Student 1 trên Student 2.

**Exit criteria:** Tests cover invalid ID, preload, loading, 404, Retry và route ID change.

### Bước 5 — Update integration và activation

1. Thêm method HTTP và `updateStudent(id, input)` theo contract ở bước 0. ID lấy từ route/entity, không lấy từ form state; không dùng DELETE + POST.
2. Edit page mutation có retry ghi = 0, pending guard cho click/Enter; no-op normalized values được short-circuit để tránh request thừa.
3. Success cập nhật hoặc invalidate `studentKeys.detail(id)`, invalidate `studentKeys.all()`/root; chỉ invalidate grade cache nếu bước 0 cho thấy grade UI chứa student fields bị stale.
4. Failure giữ edited values và không navigate; 401 tiếp tục qua HTTP client. Cancel về `/students` trong khi Detail còn placeholder; đổi sang `/students/:id` khi Detail production-ready.
5. Sau khi adapter, preload, Update và tests pass, thêm route `student-edit`, bật Edit ở Student table/list, bỏ unavailable note; cập nhật docs đang mâu thuẫn về Update capability.

**Exit criteria:** Edit từ list hoạt động end-to-end; một update tạo đúng một PUT/PATCH; danh sách/detail cache cập nhật và lỗi không mất dữ liệu.

### Bước 6 — Verification và handoff

1. Chạy unit/component/integration tests, `npm run test:unit`, `npm run build`.
2. Kiểm tra keyboard, screen-reader relationships, desktop/tablet/mobile; đặc biệt date picker và action row không gây horizontal overflow.
3. Chạy E2E có backend/auth thật cho Create, Edit name/birthDate, Cancel, 404, failure và double submit. Nếu chưa có môi trường, ghi rõ phần live E2E còn chờ, không đánh dấu hoàn tất giả.
4. Soát diff để bảo đảm không có raw `fetch` trong form/page, hardcoded token, debug code hoặc phương thức Update phỏng đoán.

## 6. Data mapping và state ownership

```text
Create: empty values → shared normalize/validate → {name,birthDate}
       → POST /student → invalidate students → /students

Edit: route ID → GET /student/{id} → map StudentViewModel
      → initialValues {name,birthDate} → shared normalize/validate
      → PUT/PATCH /student/{id} → refresh list + detail → /students
```

| State | Owner |
| --- | --- |
| Editable values, touched/validation errors | `StudentForm.vue` + pure `student-form.ts` |
| Student identity và route navigation | Page wrapper/Router |
| Student detail/loading/load error | Vue Query detail query |
| Mutation pending/server error | Page mutation, truyền xuống form |
| List/detail cached data | Vue Query theo `studentKeys` |

Date-only string không chuyển sang timestamp. Nếu native date input hiển thị theo locale, helper vẫn ghi `Display format: yyyy/MM/dd` theo design, còn value/API luôn là `yyyy-MM-dd`.

## 7. Error/loading states

| Tình huống | UI/hành vi |
| --- | --- |
| Edit đang GET | Hiển thị loading; không mount form rỗng |
| Route ID không hợp lệ hoặc GET 404 | Not Found và action về Students List; không gửi Update |
| GET network/5xx | Load error + Retry chỉ gọi lại GET |
| Validation fail | Field error gắn input, focus lỗi đầu tiên; không mutation |
| Mutation pending | Disable submit/Cancel, `aria-busy`, không request thứ hai |
| Mutation 4xx/5xx/network | Giữ values, render field error nếu server có field contract rõ; còn lại form-level error; user tự retry |
| 401 | Dùng centralized auth-expired flow hiện có |

## 8. Test plan

| Cấp | Các case bắt buộc | AC |
| --- | --- | --- |
| Unit model | trim/name required; Unicode; leap day; malformed; future local date; date-only nguyên dạng; Create/Edit dùng cùng validator | 002, 006–009, 023 |
| Component form | ID/copy theo mode, preload, valid/invalid submit, `aria-invalid`/`aria-describedby`, Cancel, pending và Enter không bypass | 001, 005, 012–013, 016–018, 024–025, 033–035, 037 |
| API/page Create | POST một lần, body không có ID, lỗi giữ values, success invalidate/navigate, 401 | 010–015, 032 |
| API/page Edit | ID invalid, GET/loading/404/retry, route đổi ID, PUT/PATCH một lần, no-op, lỗi giữ values, cache refresh, Cancel | 019–022, 026–032, 036–038 |
| E2E | Add → Save → list; Edit từ list → đổi tên/ngày sinh → list cập nhật; Cancel, failure, double submit trên backend thật | 011, 014, 027–031, 037 |

## 9. Risks và rollback

- **Contract Update chưa thống nhất:** tài liệu cũ phủ nhận endpoint, spec mới khẳng định có nhưng chưa chốt method. Chỉ enable Edit sau khi xác minh backend; nếu contract không sẵn sàng, giữ route/action Edit chưa active và vẫn hoàn thành shared UI/Create.
- **Detail còn placeholder:** Edit success/Cancel về `/students` để user không rơi vào trang chưa hoàn chỉnh; chuyển đích khi Student Detail được triển khai.
- **Input date phụ thuộc browser locale:** test value `yyyy-MM-dd`, calendar validation và mobile layout; không dùng text hiển thị làm payload.
- **Stale cache:** dùng keys hiện có và verify list/Dashboard sau Create, list/detail sau Update; không invalidate toàn bộ app vô điều kiện.
- **Rollback khi Update có lỗi production:** có thể tắt Edit entry point/route activation, giữ shared form và Create hoạt động; không thay Update bằng delete/create.

## 10. Definition of Done checks

- [x] Một `StudentForm.vue` phục vụ Create/Edit, không duplicate field/validation.
- [x] Student ID không editable và không nằm trong Create/Update form payload.
- [ ] Name/date validation đúng, date-only giữ `yyyy-MM-dd`; responsive và accessibility đã có automated checks nhưng chưa xác minh thủ công trên thiết bị/trình đọc màn hình.
- [x] Create POST đúng một lần; pending/error/success, cache và navigation đúng trong integration tests.
- [x] Backend Update method/payload/response đã xác minh qua OpenAPI local và tài liệu cũ được đồng bộ.
- [x] Edit preload, loading/404/retry, đổi route ID và no-op hoạt động trong tests.
- [x] Update dùng endpoint chính thức đúng một lần; failure giữ values; list/detail cache được cập nhật trong tests.
- [x] Edit route và list entry point đã active sau khi Update flow và tests hoàn chỉnh.
- [ ] Unit/component/integration tests và build pass; live E2E pass hoặc dependency môi trường được ghi rõ.

## 11. Kết quả triển khai — 2026-09-22

- OpenAPI local tại `http://localhost:9090/v3/api-docs` xác nhận `PUT /student/{id}`, body `UpdateStudentRequest` gồm `name` và `birthDate`, HTTP 200 trả Student. `POST /student` cũng khai báo HTTP 200.
- Shared `StudentForm.vue`, Create/Edit wrappers, Detail GET query, PUT adapter, route Edit và entry point ở Student list đã được triển khai. Edit success/Cancel về `/students` vì Student Detail còn placeholder.
- `gradeKeys.root` được invalidate sau Update do Grades và Dashboard Grade Records hiển thị nested `grade.student.name`.
- Unit/component/integration tests và build đã được chạy local. Live browser E2E với backend/auth chưa chạy; checklist bên trên giữ nguyên để chỉ được đánh dấu khi từng điều kiện được xác nhận đầy đủ.
- Live API smoke ngày 2026-09-22: đăng nhập backend local, tạo một Student tạm, đọc bằng GET, cập nhật name/birthDate qua PUT, đọc lại giá trị đã lưu và xóa Student tạm thành công. Bổ sung tests cho Edit từ list và Cancel không gửi PUT.
