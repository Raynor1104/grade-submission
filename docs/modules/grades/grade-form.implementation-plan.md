# Grade Form (Create / Update / Delete Grade) — Implementation Plan

**Phụ trách:** Frontend team  
**Trạng thái:** Implemented in frontend; live mutation E2E và manual accessibility chưa chạy  
**Cập nhật lần cuối:** 2026-09-29  
**Nguồn yêu cầu:** `docs/modules/grades/grade-form.spec-pack.md`

## 1. Mục tiêu và phạm vi

Triển khai Create và Edit Grade bằng **một** `GradeForm.vue` dùng chung form state, validation, pending/error rendering và responsive layout. `GradeForm.vue` chỉ render UI và emit intent; page wrapper chịu trách nhiệm query/mutation, route params, cache invalidation, error mapping và navigation.

Phạm vi gồm:

- Create tại `/grades/new` bằng `POST /grade/student/{studentId}/course/{courseId}`;
- Edit tại `/grades/:studentId/:courseId/edit`, preload bằng pair GET và update bằng pair PUT;
- Delete từ Edit form qua shared `DeleteConfirmDialog` và pair DELETE;
- Student/Course selectable trong Create, read-only trong Edit;
- `score` là string tự do, chỉ trim đầu/cuối và required sau trim;
- dependency loading/error/empty states cho Student/Course collections;
- invalid route, pair 404, stale parent, duplicate pair, network/5xx và centralized 401 behavior;
- cache refresh cho Grade list/pair, Student/Course detail và dữ liệu Dashboard phụ thuộc Grade;
- nối các entry point Create/Edit hiện đang là `console.log`;
- accessibility, responsive behavior và automated tests theo AC-GRADE-FORM-001–048.

Không thuộc phạm vi: đổi Student/Course của Grade hiện có, parse/round/range-check score, letter-grade allowlist, bulk/import, grade history, client-side duplicate preflight bằng `/grade/all`, hoặc unsaved-changes dialog.

## 2. Hiện trạng và contract gate

| Hạng mục | Hiện trạng source ngày 2026-09-29 | Việc cần làm |
| --- | --- | --- |
| Routes | Chỉ có named route `grades` tại `/grades` | Thêm `grade-create` và `grade-edit` trong protected `MainLayout` |
| Grade list entry points | `handleCreate()` và `handleEdit()` chỉ `console.log` | Điều hướng bằng named route; Edit truyền đúng pair IDs |
| Grade API | Có `getGrades()` và `deleteGrade()` | Thêm pair GET, Create và Update; reuse path builder nhất quán |
| HTTP client | Đã expose GET/POST/PUT/DELETE, xử lý empty/204 và centralized 401 | Reuse; spec pack đã cũ ở điểm “thiếu `put()`”; không tạo raw `fetch()` pipeline mới |
| Grade query keys | Chỉ có `root` và `all()` | Thêm `pair`, `byStudent`, `byCourse` để định danh/invalidate đầy đủ |
| Grade queries | Chỉ có `all()` | Thêm `pair(studentId, courseId)` với `retry: false` |
| Grade form model/UI | Chưa có | Tạo pure form model và một `GradeForm.vue` cho cả hai mode |
| Create dependencies | `studentQueries.all()` và `courseQueries.all()` đã tồn tại | Reuse query/cache hiện có, không tạo fetch layer trùng lặp |
| Delete dialog | Shared dialog và list-page delete flow đã có | Reuse ở Edit; thống nhất invalidation của delete list và delete form |
| Dashboard | Dùng `gradeQueries.all()` và `studentQueries.gradeACounts()` | Invalidate `gradeKeys.root` và Grade-A counts sau mọi Grade mutation |
| Student/Course detail | Có detail keys/query; UI hiện chưa chứa full Grade flow | Invalidate đúng detail key theo pair để sẵn sàng cho detail aggregation |
| Tests | Có `grades-page.spec.ts`, mapper/http tests; chưa có form/page tests | Thêm model/component/Create/Edit/delete/cache coverage |

### Backend dependency cần xác minh trước khi khóa adapter

1. Xác nhận pair GET trả Grade entity có `id`, `score`, nested `student` và `course`; missing pair trả `404`.
2. Xác nhận Create trả `201` và có Grade entity trong body như FE function được đề xuất; nếu success body rỗng, adapter/page phải dùng status-only contract đã được ghi lại thay vì ép `mapGradeDto(undefined)`.
3. Xác nhận Update trả `200` + Grade entity; ghi lại nếu runtime dùng empty body.
4. Xác nhận Delete trả `204` và unknown pair có thể vẫn là no-op `204`.
5. Ghi nhận duplicate pair có stable `409`/`GRADE_ALREADY_EXISTS` hay vẫn là generic failure.
6. Ghi nhận parent-404 có machine-readable code phân biệt Student/Course hay không; nếu không có, Create refetch cả hai collections rồi xác định option nào đã biến mất.

Contract đã chốt trong spec vẫn là pair identity và body chỉ `{ score: string }`. Việc xác minh response/error shape không được dùng để tự thêm validation hoặc thay đổi Student/Course trong Update.

| Operation | Method/path | Request body |
| --- | --- | --- |
| Load pair | `GET /grade/student/{studentId}/course/{courseId}` | Không có |
| Create | `POST /grade/student/{studentId}/course/{courseId}` | `{ "score": string }` |
| Update | `PUT /grade/student/{studentId}/course/{courseId}` | `{ "score": string }` |
| Delete | `DELETE /grade/student/{studentId}/course/{courseId}` | Không có |

## 3. AC mapping

| Nhóm công việc | AC-GRADE-FORM |
| --- | --- |
| Routes, shared form và list entry points | 001–003, 047–048 |
| Create dependencies/selectors/validation | 004–013, 043–044 |
| Create POST, pending, success và safe failure | 014–020, 041–042 |
| Edit route parsing, pair GET và read-only identity | 021–027, 031 |
| Update PUT, no-op/pending, success và failure | 028–030, 038–042 |
| Delete visibility, confirm, pair DELETE và 204 | 032–037 |
| Cache invalidation và Dashboard refresh | 038–040 |
| Accessibility và responsive behavior | 045–046 |

## 4. Files/modules bị ảnh hưởng

| File | Thay đổi dự kiến |
| --- | --- |
| `src/features/grades/model/grade-form.ts` | Tạo mode, values/errors, empty values, normalize/validate và positive pair-ID helper |
| `src/features/grades/model/grade.types.ts` | Thêm `GradeInput` nếu không đặt trong API module; giữ `score` là string |
| `src/features/grades/components/GradeForm.vue` | Shared Create/Edit form, native selects/read-only fields, score input, validation và action emits |
| `src/features/grades/api/grade.api.ts` | Thêm `getGrade`, `createGrade`, `updateGrade`; reuse `deleteGrade`; map entity theo contract thật |
| `src/core/api/query-keys.ts` | Mở rộng `gradeKeys` với `pair`, `byStudent`, `byCourse` |
| `src/features/grades/api/grade.queries.ts` | Thêm pair query và helper invalidation dùng chung cho Grade mutations |
| `src/features/grades/pages/GradeCreatePage.vue` | Orchestrate Student/Course queries, POST, stale-parent handling, cache và navigation |
| `src/features/grades/pages/GradeEditPage.vue` | Parse pair route, pair GET, PUT, DELETE dialog, states, cache và navigation |
| `src/features/grades/pages/GradesPage.vue` | Nối Create/Edit navigation; dùng invalidation helper chung cho list delete |
| `src/app/router/routes.ts` | Thêm named routes `grade-create` và `grade-edit` |
| `tests/unit/grade-form.spec.ts` | Pure model + shared component behavior |
| `tests/unit/grade-create-page.spec.ts` | Dependency/Create/error/cache/navigation integration |
| `tests/unit/grade-edit-page.spec.ts` | Pair route/GET/PUT/Delete/system-state integration |
| `tests/unit/grades-page.spec.ts` | Create/Edit navigation và regression delete invalidation |
| `tests/unit/course-and-grade-mappers.spec.ts` | Pair/Create/Update response mapping regressions nếu adapter coverage phù hợp ở đây |
| `tests/unit/http-client.spec.ts` | Chỉ bổ sung PUT JSON regression nếu chưa được coverage gián tiếp; core client không cần đổi |

Không tạo `BaseSelect` mới chỉ cho feature này. `GradeForm.vue` dùng native `<select>` với đầy đủ label/helper/error ARIA; Edit dùng read-only display có semantics rõ ràng thay vì faux select tương tác bằng `div`.

## 5. Implementation steps

### Bước 0 — Xác minh contract và baseline

1. Chạy baseline `npm run test:unit` và `npm run build`; ghi lại failure có sẵn nếu worktree chưa xanh.
2. Kiểm tra OpenAPI/controller hoặc smoke test backend cho pair GET/POST/PUT/DELETE và các response/error ở mục 2.
3. Chốt adapter return type cho Create/Update:
   - response có entity: validate bằng `mapGradeDto()`;
   - status-only success: trả `void` và không gọi mapper trên body rỗng.
4. Chốt duplicate/parent-404 mapping dựa trên status + machine-readable `code`, không đọc raw SQL text để suy luận.
5. Ghi nhận `httpClient.put()` đã tồn tại và `request()` đã xử lý `204`; không triển khai lại hai capability này.

**Exit criteria:** Contract đủ rõ để khóa API tests; baseline được ghi lại; không còn giả định mơ hồ về response body.

### Bước 1 — Form model, API và query foundation

1. Tạo `GradeFormMode = 'create' | 'edit'`, `GradeFormValues`, `GradeFormErrors` và `EMPTY_GRADE_FORM` với `studentId`, `courseId`, `score`.
2. `normalizeGradeForm()` chỉ trim `score`; không parse number, uppercase, round hoặc đổi representation. IDs giữ type `number | null`.
3. `validateGradeForm()`:
   - Create yêu cầu Student/Course là positive safe integer và thuộc option set hiện tại;
   - Edit chỉ validate score vì pair đến từ resource và bị khóa;
   - score whitespace-only lỗi `Grade is required.`.
4. Tạo helper parse route ID chấp nhận duy nhất chuỗi positive safe integer; loại `abc`, `0`, số âm, decimal và overflow trước khi enable query.
5. Thêm `GradeInput = { score: string }`; path params mang identity, body tuyệt đối không chứa `studentId`, `courseId` hoặc Grade `id`.
6. Thêm API adapters dùng URL-encoded pair path và `mapGradeDto()` theo response contract đã xác minh.
7. Mở rộng keys `all/byStudent/byCourse/pair`; thêm `gradeQueries.pair()` dùng `retry: false` để `404` không bị retry tự động.
8. Tạo helper invalidation dùng chung nhận `studentId/courseId` và refresh:
   - `gradeKeys.root` — bao phủ all/pair/byStudent/byCourse và Dashboard Grade records;
   - `studentKeys.detail(studentId)`;
   - `courseKeys.detail(courseId)`;
   - `studentKeys.gradeACounts()` vì Create/Update/Delete có thể thay đổi số Grade A.

**Exit criteria:** Unit tests khóa string semantics, route parsing, exact method/path/body, DTO mapping và query keys.

### Bước 2 — `GradeForm.vue` dùng chung

1. Form nhận `mode`, `initialValues`, `students`, `courses`, dependency/pending state và `submitError`; emit `submit(normalizedValues)`, `cancel`, `delete`.
2. Render đúng thứ tự Student → Course → Grade → action row:
   - Create: native Student/Course selects, placeholder `Select Student`/`Select Course`;
   - Edit: Student/Course read-only từ Grade pair, kèm helper text canonical;
   - score luôn dùng `BaseInput` mặc định `type="text"`.
3. Option copy:
   - Student: `<name> - ID: <id>`;
   - Course: `<code> - <subject>`, fallback `Unnamed course` khi thiếu subject.
4. Dùng native `<form @submit.prevent>`; validate toàn form khi submit, chỉ hiện field error sau blur/submit và focus field lỗi đầu tiên.
5. Required/error semantics gồm visible label, native `required` cho controls editable, `aria-invalid`, `aria-describedby`; form-level mutation error dùng `role="alert"`.
6. Pending/dependency blocked state disable controls và actions, đặt `aria-busy`, hiển thị status phù hợp và chặn cả click lẫn Enter submit lần hai.
7. Edit tính pristine bằng normalized score ban đầu; disable `Update Grade` khi no-op. Reset state theo pair identity có kiểm soát, không để refetch cùng pair ghi đè draft.
8. Khi Create options sau refetch không còn chứa selected ID, clear riêng selection stale và giữ score/selection còn hợp lệ để user chọn lại.
9. Actions:
   - Create: `Save Grade`, `Cancel`; không render Delete;
   - Edit: `Update Grade`, `Delete Grade`, `Cancel`;
   - mobile stack Primary → Delete → Cancel; desktop align phải; không horizontal overflow.

**Exit criteria:** Component tests cover hai mode, exact copy, options/fallback, read-only pair, validation/focus/ARIA, normalized emit, pristine, pending, stale option, keyboard submit, Delete visibility và responsive classes.

### Bước 3 — Create page integration

1. `GradeCreatePage.vue` reuse đồng thời `studentQueries.all()` và `courseQueries.all()`; không fetch `/grade/all` để render form.
2. Trong dependency loading, giữ form không submit được và announce status. Nếu một query lỗi, hiển thị nguồn lỗi + Retry chỉ query lỗi.
3. Empty collection hiển thị guidance canonical, disable Save và cung cấp navigation tới named route `student-create`/`course-create` khi phù hợp.
4. Submit guard dùng cả mutation pending và synchronous in-flight flag; gửi đúng một POST với pair trong path và `{ score: trimmedScore }` trong body; mutation `retry: false`.
5. Success chạy invalidation helper rồi điều hướng named route `grades`.
6. Duplicate/other Create failure giữ toàn bộ draft và hiển thị safe message; chỉ dùng message duplicate cụ thể khi backend có stable `409`/code.
7. Parent `404` giữ score, báo resource không còn tồn tại và refetch collection liên quan. Nếu backend không chỉ ra parent nào, refetch cả hai rồi clear selection chỉ khi option thực sự biến mất.
8. Cancel về named route `grades`, không gửi mutation và bị chặn trong active request để tránh race.

**Exit criteria:** Integration tests xác nhận dependency states, empty/error Retry, một POST đúng pair/body, string score, 404 refetch/reselection, generic duplicate handling, invalidation và navigation.

### Bước 4 — Edit preload và Update integration

1. `GradeEditPage.vue` parse cả `studentId` và `courseId` trước khi tạo enabled query; invalid pair không được gọi backend.
2. Pair query gọi `GET /grade/student/{studentId}/course/{courseId}`. Page render riêng loading, invalid/not-found, load error + Retry; không mount form rỗng trong khi load.
3. Preload `initialValues` từ Grade entity; identity dùng route pair/current entity và được hiển thị read-only. Không load `/student/all` hoặc `/course/all` cho Edit.
4. Key/reset form bằng pair identity để route đổi pair không lộ draft của pair trước.
5. Update guard chặn pending/no-op và gửi đúng một PUT tới pair route với body chỉ `{ score }`; mutation `retry: false`.
6. Success cập nhật pair cache bằng returned entity khi có, hoặc invalidate pair khi status-only; chạy invalidation helper rồi về named route `grades`.
7. PUT `404` chuyển sang “Grade no longer exists”/not-found state, không POST để recreate. Lỗi khác giữ draft/route, hiển thị safe retryable error và không navigate.
8. Cancel về named route `grades`, không gửi PUT.

**Exit criteria:** Tests cover hai route params, invalid values, loading/preload/read-only, 404/retry/route change, one PUT, exact body, no-op, failure giữ draft, cache và navigation.

### Bước 5 — Delete flow và cache consistency

1. Edit page nhận `delete` intent từ form, lưu trigger đang focus và mở shared `DeleteConfirmDialog` với Student name + Course code.
2. Cancel đóng dialog, không gọi API và trả focus về trigger.
3. Confirm guard không cho request lặp; dialog ở lại trong khi pending. Form/update/cancel không tạo mutation cạnh tranh.
4. DELETE dùng pair route hiện tại; `204`/unknown-pair no-op đều được xem là action hoàn tất, không parse JSON body.
5. Success remove exact pair query, chạy invalidation helper, đóng dialog và điều hướng named route `grades`.
6. Failure giữ dialog mở, hiển thị safe error và cho retry; `401` vẫn qua centralized auth-expired flow.
7. Refactor delete hiện có trong `GradesPage.vue` dùng cùng invalidation helper để list-delete cũng refresh Student/Course detail và Grade-A counts nhất quán.

**Exit criteria:** Tests cover message, cancel/focus return, exact DELETE, pending repeat guard, 204, unknown-pair success, retryable failure và cache effects.

### Bước 6 — Routes và entry points

1. Thêm `/grades/new` (`grade-create`) và `/grades/:studentId/:courseId/edit` (`grade-edit`) dưới protected `MainLayout`.
2. Đặt static route `/grades/new` trước dynamic edit route để route matching rõ ràng.
3. `GradesPage.handleCreate()` push named route `grade-create`.
4. `GradesPage.handleEdit(grade)` push named route `grade-edit` với `studentId = grade.student.id`, `courseId = grade.course.id`.
5. Xóa toàn bộ `console.log` placeholder; không thay đổi list/filter/pagination behavior ngoài activation này.

**Exit criteria:** Entry-point tests xác nhận đúng named route/params và cả hai route vẫn chịu auth guard hiện có.

### Bước 7 — Verification và handoff

1. Chạy focused tests mới/cập nhật, sau đó `npm run test:unit` và `npm run build`.
2. Kiểm tra thủ công keyboard/focus, screen-reader relationships, dialog Escape/focus return và desktop/tablet/mobile; đặc biệt long Student/Course text không gây overflow.
3. Chạy E2E Grade journeys `011`, `012`, `015`, `016`, `017`, `018`, `019` trên backend/auth thật. Repo chưa khai báo E2E runner trong `package.json`; nếu chưa có harness/môi trường, ghi rõ dependency và không đánh dấu E2E hoàn tất.
4. Soát diff bảo đảm form không import router/API, feature không gọi raw `fetch`, score không bị numeric conversion và mutation không auto-retry.
5. Nếu runtime contract khác spec, cập nhật spec/module/E2E docs và ghi rõ quyết định; không âm thầm nới hoặc đổi nghiệp vụ.

## 6. Data mapping và state ownership

```text
Create: Student/Course queries → local form {studentId,courseId,score}
        → normalize/validate → pair path + {score}
        → POST → invalidate dependent caches → /grades

Edit: route pair → validate IDs → GET pair → GradeViewModel
      → read-only Student/Course + editable score
      → PUT pair + {score} hoặc DELETE pair
      → invalidate/remove dependent caches → /grades
```

| State | Owner |
| --- | --- |
| Editable values, touched/submitted, field errors, pristine | `GradeForm.vue` + pure `grade-form.ts` |
| Create dependency loading/error/empty | Student/Course Vue Query state + Create page |
| Pair identity, route validation và navigation | Edit page + Router |
| Pair loading/load error/not found | Pair query + Edit page |
| Mutation pending/server error | Page mutation, truyền xuống form/dialog |
| Delete dialog visibility, error và focus return | Edit page + shared dialog |
| Grade/list/pair cache | Vue Query theo `gradeKeys` |
| Related detail/Dashboard data | `studentKeys`, `courseKeys`, Grade root và Grade-A count key |

Mapping bắt buộc:

| UI | Form/API | Quy tắc |
| --- | --- | --- |
| Student | `studentId` trong path | Create chọn positive ID thuộc options; Edit read-only |
| Course | `courseId` trong path | Create chọn positive ID thuộc options; Edit read-only |
| Grade | `score` trong body | Trim đầu/cuối; luôn string; không uppercase/parse/round |

## 7. Error/loading/empty states

| Tình huống | UI/hành vi |
| --- | --- |
| Create dependencies đang GET | Selects/Save disabled, `role="status"`, không mutation |
| Một dependency GET lỗi | Safe error + Retry đúng source lỗi; giữ draft hiện có |
| Students hoặc Courses rỗng | Message + Add action, Save disabled |
| Create validation fail | Field errors, focus lỗi đầu tiên, không POST |
| Duplicate pair chưa có stable code | Generic safe form error; giữ values; không lộ DB/SQL |
| Stable `409 GRADE_ALREADY_EXISTS` | Message duplicate cụ thể; giữ values/pair |
| Create parent `404` | Báo stale/missing, refetch options, giữ score, clear selection biến mất |
| Edit route pair invalid | Grade Not Found/invalid resource + Back to Grades; không GET/PUT |
| Pair GET đang load | Loading state; không mount form rỗng |
| Pair GET `404` | Grade Not Found + Back to Grades; không chuyển Create mode |
| Pair GET network/5xx | Load error + Retry chỉ pair query |
| Update `404` | Resource no longer exists; không recreate |
| Mutation pending | Disable competing actions, `aria-busy`, không request thứ hai |
| Mutation network/5xx/4xx khác | Giữ draft/route; safe retryable error; không auto-retry |
| Delete failure | Dialog vẫn mở, safe error, retry được |
| `401` | Centralized auth-expired flow hiện có |

## 8. Cache invalidation matrix

| Mutation | Grade caches | Student caches | Course caches | Dashboard effect |
| --- | --- | --- | --- | --- |
| Create | Invalidate `gradeKeys.root` | Detail pair student + Grade-A counts | Detail pair course | Grade list/count, missing-data cards và A-count refresh qua shared keys |
| Update | Set/invalidate pair, invalidate root | Detail pair student + Grade-A counts | Detail pair course | Score preview/derived A-count refresh |
| Delete | Remove pair, invalidate root | Detail pair student + Grade-A counts | Detail pair course | Counts/preview/missing-data refresh |

Không cần key Dashboard riêng vì Dashboard đang reuse Student/Course/Grade queries. Không invalidate `studentKeys.all()` hoặc `courseKeys.all()` chỉ vì Grade đổi; master entity collections không thay đổi.

## 9. Test plan

| Cấp | Case bắt buộc | AC |
| --- | --- | --- |
| Unit model | required Student/Course ở Create, whitespace score, trim, numeric-looking/alphabetic score vẫn string, positive pair parser | 008–013, 021–022 |
| Shared component | Create selects/options, Edit read-only pair, Delete visibility, copy/fallback, focus/error ARIA, normalized emit, pristine, pending, stale option và keyboard | 003, 006–013, 016, 025–027, 032–033, 043–046 |
| API/query | Pair GET/POST/PUT/DELETE exact method/path/body, mapper, no 204 parse, keys và retry policy | 014–015, 023, 028–029, 036–037 |
| Create page | loading/error/empty/retry, one POST, duplicate safe error, parent 404 refetch, values retained, cache/navigation, 401 | 004–020, 038–044 |
| Edit page | invalid pair, GET/loading/404/retry/route change, preload, one PUT/no-op, Update 404, Delete confirm/cancel/retry/204, cache/navigation | 021–042 |
| Grades page | Create/Edit entry routes và list-delete cache regression | 038–040, 047–048 |
| E2E | Create → update → delete; free-form scores; related detail refresh; duplicate; missing parent; confirm copy; unknown-pair delete | 001–048 |

Tests phải assert cả HTTP method/path/body, absence của Student/Course trong update body, query invalidation/removal và navigation; không chỉ assert text hiển thị.

## 10. Risks và rollback

- **Spec/source lệch về HTTP PUT:** source đã có `httpClient.put()` dù spec ghi thiếu. Reuse implementation đã chạy với Course Edit; tránh sửa core client ngoài regression coverage cần thiết.
- **Create/Update body có thể rỗng:** `mapGradeDto()` sẽ fail trên `undefined`; khóa adapter theo runtime contract trước khi viết success flow.
- **Duplicate pair chưa có stable error:** không suy luận bằng raw backend/constraint message; dùng generic safe error cho đến khi có `409`/code ổn định.
- **Parent 404 không chỉ rõ Student hay Course:** refetch cả hai collections, sau đó clear đúng option biến mất; không xóa score draft.
- **Stale Dashboard Grade-A count:** `gradeKeys.root` không bao phủ endpoint Grade-A riêng, nên mọi Grade mutation phải invalidate `studentKeys.gradeACounts()`.
- **Hai delete flow lệch nhau:** dùng một invalidation helper cho list và Edit để tránh list-delete bỏ sót detail/Dashboard cache.
- **Draft bị reset do query refetch/route change:** form chỉ reset khi pair identity đổi; không deep-watch initial values và overwrite user input tùy tiện.
- **Read-only identity không rõ semantics:** không dùng faux select; expose label/value/helper để assistive technology hiểu pair không editable.
- **Rollback production:** có thể gỡ entry points/routes Create/Edit trong khi giữ API/model/tests; list/delete hiện tại vẫn hoạt động. Không rollback Update bằng delete + recreate.

## 11. Definition of Done checks

- [x] Backend pair GET và entity schema đã được xác minh trên backend local; success/error caveat còn lại đã được ghi rõ.
- [x] Một `GradeForm.vue` phục vụ Create/Edit, không gọi API/router và không duplicate validation.
- [x] `/grades/new` và `/grades/:studentId/:courseId/edit` hoạt động dưới auth guard.
- [x] Create reuse Student/Course queries, có loading/error/empty/retry states.
- [x] Create gửi đúng một POST pair endpoint; body chỉ `{score}` và failure giữ draft.
- [x] Edit không query với pair invalid; GET preload/loading/404/retry và route-pair change hoạt động.
- [x] Student/Course read-only ở Edit; Update gửi đúng một PUT chỉ `{score}` và no-op bị chặn.
- [x] Score luôn là free-form string; chỉ trim/non-empty, không parse/range/allowlist/uppercase/round.
- [x] Duplicate pair và parent/pair missing dùng safe error behavior, không lộ raw backend/SQL detail.
- [x] Delete chỉ có ở Edit, confirm chứa Student + Course, cancel/focus/pending/retry và success không phụ thuộc response body.
- [x] Create/Update/Delete invalidate Grade, related Student/Course detail, Grade-A count và Dashboard-derived data đúng.
- [x] `401` tiếp tục dùng centralized auth-expired flow; mutation không auto-retry.
- [x] `GradesPage` Create/Edit điều hướng đúng pair và không còn `console.log` placeholder.
- [ ] Manual keyboard/screen-reader/mobile check chưa chạy; automated accessibility/responsive assertions đã pass.
- [x] Focused tests, full `npm run test:unit` và `npm run build` pass.
- [ ] E2E Grade journeys `011`, `012`, `015`, `016`, `017`, `018`, `019` pass hoặc dependency môi trường được ghi rõ và checkbox để mở.

## 12. Các quyết định cần ghi lại khi bắt đầu implementation

1. Create `201` và Update `200` có luôn trả Grade entity hay có success body rỗng.
2. Duplicate pair có stable `409`/`GRADE_ALREADY_EXISTS` hay chưa.
3. Parent `404` có code phân biệt missing Student/Course hay phải refetch cả hai.
4. Read-only Student/Course sẽ dùng styled output hay read-only input; lựa chọn phải giữ semantics và visual hierarchy của design.
5. E2E runner/backend/auth environment nào sẽ dùng để đóng các journey bắt buộc.

Các quyết định trên phải dựa trên backend/product contract thực tế và được đồng bộ về spec/tests nếu khác tài liệu hiện tại.

## 13. Kết quả triển khai — 2026-09-29

- Backend local/OpenAPI xác nhận pair GET, POST và PUT dùng path `/grade/student/{studentId}/course/{courseId}` và trả Grade entity; authenticated smoke GET xác nhận `score` là string và response có nested Student/Course. OpenAPI mô tả POST/DELETE status khác established E2E contract, nên FE chấp nhận mọi success 2xx; Create/Update vẫn validate entity, Delete không phụ thuộc response body.
- Đã tạo pure `grade-form.ts`, shared `GradeForm.vue`, Create/Edit pages, pair API/query, query-key family và invalidation helper dùng chung.
- Create reuse Student/Course queries, xử lý dependency loading/error/empty, duplicate safe error và parent `404` bằng refetch cả hai collection rồi chỉ clear option đã biến mất.
- Edit validate cả hai route IDs trước khi query, preload pair, khóa Student/Course, chỉ PUT `{score}`, chặn no-op/double submit và xử lý mutation `404` mà không recreate.
- Delete từ Edit reuse `DeleteConfirmDialog`, giữ dialog khi lỗi, trả focus khi Cancel, remove pair cache và dùng cùng invalidation contract với Delete từ Grade list.
- Sau mọi Grade mutation, Grade family, related Student/Course detail và Student Grade-A counts được mark stale mà không tạo refetch race trước navigation; Dashboard tự refresh qua shared query keys.
- `GradesPage` đã điều hướng Create/Edit bằng named routes và không còn placeholder logging.
- Automated model/component/page/cache/navigation coverage đã được thêm; full suite pass `134/134` tests và production build pass. Repo chưa có E2E runner trong `package.json`, vì vậy live mutation journeys và manual keyboard/screen-reader/mobile verification vẫn để mở.
