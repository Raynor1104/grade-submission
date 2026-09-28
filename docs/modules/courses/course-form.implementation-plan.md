# Course Form (Create / Update Course) — Implementation Plan

**Phụ trách:** Frontend team  
**Trạng thái:** Implemented in frontend; live E2E và manual accessibility chưa chạy  
**Cập nhật lần cuối:** 2026-09-28  
**Nguồn yêu cầu:** `docs/modules/courses/course-form.spec-pack.md`

## 1. Mục tiêu và phạm vi

Triển khai Create và Edit Course bằng **một** `CourseForm.vue` dùng chung form state, validation, error rendering, pending state và responsive layout. Page wrapper chịu trách nhiệm parse route, query/mutation, cache và navigation; form không gọi API hoặc router trực tiếp.

Phạm vi gồm:

- Create tại `/courses/new` bằng `POST /course`;
- Edit tại `/courses/:id/edit`, preload bằng `GET /course/{id}` và update bằng `PUT /course/{id}`;
- shared form model/validation cho `code`, `subject`, `description`;
- textarea accessible, loading/error/not-found states, duplicate-submit guard;
- cache synchronization cho Course list/detail, Dashboard và dữ liệu Grade có nested Course metadata;
- bật Edit entry point sau khi toàn bộ Edit flow và tests đã hoàn chỉnh;
- đồng bộ tài liệu cũ đang ghi Course Update chưa được hỗ trợ.

Không thuộc phạm vi: tự đặt regex/max length/uppercase rule, kiểm tra uniqueness bằng Course list phía client, unsaved-changes dialog, hoặc dùng DELETE + POST để giả lập Update.

## 2. Hiện trạng và contract gate

| Hạng mục | Hiện trạng source ngày 2026-09-28 | Việc cần làm |
| --- | --- | --- |
| `/courses/new` | Route đã có; `CourseCreatePage.vue` còn placeholder | Thay bằng Create wrapper và shared form |
| `/courses/:id/edit` | Chưa có route/page | Thêm route/page sau khi detail query và Update hoạt động |
| `/courses/:id` | Route có nhưng `CourseDetailPage.vue` còn placeholder | Dùng làm success destination của Edit; Cancel quay về Course list |
| Course API/query | Chỉ có GET all và DELETE; query chỉ có `all()` | Thêm detail, create và update adapters/query |
| HTTP client | Đã có GET/POST/PUT/DELETE và centralized 401/error handling | Reuse `httpClient.put()`; không dùng raw `fetch()` hoặc tạo HTTP pipeline mới |
| Query keys | Đã có `courseKeys.root`, `all()`, `detail(id)` | Reuse keys hiện có |
| Form UI | `BaseInput` đáp ứng input text; chưa có shared textarea | Thêm `BaseTextarea.vue` theo semantics/style của `BaseInput` |
| Course list | Edit button đang disabled, chưa emit Edit | Chỉ bật sau khi route/preload/update/tests hoàn chỉnh |
| Dashboard | Total Courses và Courses Without Grades dùng `courseQueries.all()` | Invalidate `courseKeys.root` sau Create/Update |
| Grade UI | Grade data chứa nested Course code/subject | Invalidate `gradeKeys.root` sau Update để tránh metadata Course bị stale |
| Tài liệu API | Spec pack mới xác nhận `PUT /course/{id}`; `spec.md`, `tasks.md`, `api_integration.md` vẫn ghi không có Update | Xác minh runtime/OpenAPI rồi đồng bộ tài liệu trước khi bật Edit |

### Backend dependency bắt buộc xác minh

1. Xác nhận `GET /course/{id}`, `POST /course` và `PUT /course/{id}` trên backend mục tiêu.
2. Ghi nhận status/body thật của Create: `201` có Course entity hay success body rỗng.
3. Ghi nhận status/body thật của Update: `200` + entity hay `204`/body rỗng.
4. Xác nhận Update cho phép đổi `code` và payload vẫn là `{ code, subject, description }`.
5. Ghi nhận error contract cho invalid payload, missing Course và duplicate `code`; chỉ map duplicate vào field khi có `409` hoặc machine-readable code ổn định.

Nếu runtime chưa có `PUT /course/{id}`, vẫn có thể hoàn thành shared form và Create, nhưng không mount route Edit và không bật Edit action. Không phỏng đoán method khác và không thay bằng delete/create.

## 3. AC mapping

| Nhóm công việc | AC-COURSE-FORM |
| --- | --- |
| Shared form UI, labels, textarea, responsive và accessibility | 001–003, 024–029, 031, 037 |
| Normalization, required validation và form state | 004–011, 014, 034 |
| Create API, pending/error, cache và navigation | 012–023, 030 |
| Edit route, route ID, preload và system states | 032–036, 040 |
| Update API, pending/error, cache và navigation | 032–033, 037–039 |

## 4. Files/modules bị ảnh hưởng

| File | Thay đổi dự kiến |
| --- | --- |
| `src/features/courses/model/course-form.ts` | Tạo mode, values/errors, empty values, normalize và pure validation dùng chung |
| `src/features/courses/model/course.types.ts` | Thêm typed Create/Update input nếu không alias trực tiếp từ normalized form values |
| `src/features/courses/components/CourseForm.vue` | Tạo shared Create/Edit form, field/error/actions/pending/dirty state |
| `src/shared/ui/BaseTextarea.vue` | Tạo textarea primitive có label, required, helper/error và ARIA giống `BaseInput` |
| `src/features/courses/api/course.api.ts` | Thêm `getCourse`, `createCourse`, `updateCourse`; xử lý response entity hoặc empty theo contract thật |
| `src/features/courses/api/course.queries.ts` | Thêm `detail(id)` với `courseKeys.detail(id)` và retry policy phù hợp |
| `src/features/courses/pages/CourseCreatePage.vue` | Thay placeholder bằng Create orchestration |
| `src/features/courses/pages/CourseEditPage.vue` | Tạo Edit orchestration, route validation, preload/loading/404/retry/update |
| `src/app/router/routes.ts` | Thêm named route `course-edit` trước route detail |
| `src/features/courses/components/CourseTable.vue` | Thêm `edit` emit và bỏ disabled state khi Edit production-ready |
| `src/features/courses/pages/CoursesPage.vue` | Điều hướng Edit tới `/courses/:id/edit` |
| `src/features/courses/pages/CourseDetailPage.vue` | Thêm Edit entry point phù hợp với placeholder hiện tại nếu AC yêu cầu entry point từ Detail |
| `docs/modules/courses/spec.md`, `tasks.md`, `test_spec.md`, `docs/architecture/api_integration.md`, `docs/e2e/courses.md` | Đồng bộ Update contract, capability và test coverage sau khi xác minh |
| `tests/unit/course-form.spec.ts` | Unit model + component behavior của shared form |
| `tests/unit/course-create-page.spec.ts` | Create integration, cache và navigation |
| `tests/unit/course-edit-page.spec.ts` | Edit preload/update/system states/cache/navigation |
| `tests/unit/courses-page.spec.ts` | Bổ sung Edit entry-point/navigation coverage |

Không cần sửa `src/core/api/http-client.ts` nếu signature `put(path, body, signal?)` hiện tại đáp ứng contract. Chỉ thay core client nếu xác minh cho thấy cần request option mà public API hiện chưa hỗ trợ; mọi thay đổi phải giữ nguyên auth-expired và error normalization.

## 5. Implementation steps

### Bước 0 — Xác minh contract và baseline

1. Chạy baseline `npm run test:unit` và `npm run build`; ghi rõ failure có sẵn nếu worktree hiện tại chưa xanh.
2. Kiểm tra OpenAPI/controller hoặc smoke test backend cho ba endpoint detail/create/update và các response ở mục 2.
3. Chốt kiểu trả về adapter:
   - entity body: validate bằng `mapCourseDto()`;
   - empty success: trả `undefined`, không ép mapper lên body rỗng.
4. Chốt navigation Create: entity có ID thì tới named route `course-detail`; success không có ID thì về named route `courses`.
5. Cập nhật tài liệu cũ đang phủ nhận Course Update theo kết quả xác minh.

**Exit criteria:** Có contract được ghi lại đủ để viết adapter/tests; nếu Update chưa tồn tại, Edit vẫn inactive.

### Bước 1 — Shared form model và textarea primitive

1. Tạo `CourseFormMode = 'create' | 'edit'`, `CourseFormValues`, `CourseFormErrors` và `EMPTY_COURSE_FORM` chỉ gồm `code`, `subject`, `description`; không đưa `id` vào editable state.
2. Tạo `normalizeCourseForm()` trim đầu/cuối cả ba field, giữ nguyên casing của `code` và giữ newline nội bộ của `description`.
3. Tạo `validateCourseForm()` chỉ kiểm tra required sau trim với copy trong spec; không thêm regex, max length hoặc uppercase normalization.
4. Tạo `BaseTextarea.vue` theo API/accessibility của `BaseInput`: visible label, native `required`, `aria-describedby`, `aria-invalid`, disabled, helper/error, blur emit và full-width control.

**Exit criteria:** Pure tests cover whitespace-only, leading/trailing spaces, lowercase code và description nhiều dòng; component primitive có label/error/helper association đúng.

### Bước 2 — `CourseForm.vue` dùng chung

1. Form nhận `mode`, `initialValues?`, `pending`, `submitError`; emit `submit(normalizedValues)` và `cancel`.
2. Render đúng thứ tự Course Code → Course Name (Subject) → Description → Save/Update → Cancel, dùng empty values thật ở Create thay vì example trong design.
3. Dùng native `<form @submit.prevent>`; validate toàn form khi submit, chỉ hiện lỗi sau blur/submit và focus field lỗi đầu tiên.
4. Pending disable controls/actions nhất quán với Student form, hiển thị loading và chặn cả click lẫn Enter submit lần hai. Form-level error dùng `role="alert"` và không reset values.
5. Tính pristine bằng normalized values ở Edit; disable `Update Course` khi không có thay đổi. Reset local state có kiểm soát khi entity/initial values thực sự đổi để không ghi đè draft do refetch cùng Course.
6. Layout một cột, action row cuối card; trên mobile buttons stack/wrap, không gây horizontal scroll. Icon có visible text nên đặt decorative.

**Exit criteria:** Component tests cover hai mode, helper/copy, initial values, required errors, focus, normalized emit, pristine, pending, Cancel, Enter ở input và newline ở textarea.

### Bước 3 — Create API và page integration

1. Thêm `createCourse(input)` gọi `POST /course` qua `httpClient.post`; body đúng `{ code, subject, description }`, không dùng field `name`.
2. `CourseCreatePage.vue` render `PageHeader`, `BaseCard`, `CourseForm mode="create"`; mutation dùng `retry: false` và guard đồng bộ để double-click không tạo request thứ hai.
3. Success invalidate `courseKeys.root`; Dashboard dùng cùng `courseQueries.all()` nên không cần key dashboard riêng.
4. Navigation success theo contract đã chốt ở bước 0: `/courses/:id` khi response có entity hợp lệ, nếu không có ID thì `/courses`.
5. Failure giữ route/values, re-enable submit và chỉ hiển thị message an toàn. Không render raw backend/SQL detail. `401` tiếp tục đi qua auth-expired flow của `httpClient`.
6. Cancel về named route `courses`, không gửi mutation; không thêm unsaved-change confirmation.

**Exit criteria:** Integration tests xác nhận một POST, payload normalized/case-preserving, validation không gọi API, success invalidation/navigation và failure giữ form.

### Bước 4 — Detail query và Edit page states

1. Thêm `getCourse(id, signal)` dùng `GET /course/{id}` + `mapCourseDto()` và `courseQueries.detail(id)` với `courseKeys.detail(id)`.
2. Parse route param bằng positive safe-integer rule trước khi enable query; `abc`, `0`, `-1`, `1.5`, `NaN` không được tạo request.
3. `CourseEditPage.vue` giữ header ổn định và render riêng loading, invalid/not-found, load error + Retry. Không mount form rỗng trong khi detail đang load.
4. Map Course entity sang initial values `{ code, subject, description }`; key/reset form theo Course ID để route đổi ID không lộ draft của Course trước.
5. Cancel về named route `courses` và không gửi mutation; invalid/not-found state cũng có Back to Courses.

**Exit criteria:** Tests cover route ID hợp lệ/không hợp lệ, loading, preload, 404, network/5xx Retry và route ID change.

### Bước 5 — Update integration, cache và activation

1. Thêm `updateCourse(id, input)` gọi đúng một `PUT /course/{id}`; encode ID/path nhất quán và không dùng DELETE + POST.
2. Adapter hỗ trợ đúng response đã xác minh: map entity nếu có; chấp nhận empty body khi backend dùng `204`/status-only.
3. Page mutation dùng `retry: false`, guard pending và short-circuit normalized no-op. Update `404` chuyển sang not-found/safe resource state; lỗi khác giữ edited values và không navigate.
4. Success:
   - nếu có entity, `setQueryData(courseKeys.detail(id), entity)`;
   - nếu body rỗng, invalidate `courseKeys.detail(id)`;
   - luôn invalidate `courseKeys.all()` hoặc `courseKeys.root` để list và Dashboard refresh;
   - invalidate `gradeKeys.root` vì Grades và Dashboard Grade Records giữ nested Course code/subject có thể stale;
   - navigate tới named route `course-detail` với `id` từ route, không phụ thuộc response body.
5. Sau khi route/query/mutation/states/tests pass, thêm `course-edit` trước `course-detail`, bật Edit emit/button ở `CourseTable`, nối navigation trong `CoursesPage` và thêm entry point ở Detail theo AC-040.

**Exit criteria:** Edit gửi đúng một PUT, hoạt động với cả entity/empty success contract được backend hỗ trợ, refresh đúng cache và không mất dữ liệu khi lỗi.

### Bước 6 — Verification và handoff

1. Chạy focused tests mới/cập nhật, sau đó `npm run test:unit` và `npm run build`.
2. Kiểm tra keyboard/focus, screen-reader relationships, desktop/tablet/mobile và textarea không gây overflow.
3. Chạy E2E trên backend/auth thật cho Create, Edit, Cancel, validation, 404, duplicate/error và double submit. Repo hiện chưa khai báo E2E runner trong `package.json`; nếu chưa có harness/môi trường, ghi rõ dependency và không đánh dấu E2E hoàn tất.
4. Soát diff để bảo đảm form không import router/API, feature không gọi raw `fetch`, không có token/debug code và không có validation ngoài contract.

## 6. Data mapping và state ownership

```text
Create: empty values → normalize/validate → {code,subject,description}
       → POST /course → invalidate courses → detail nếu có ID, nếu không về list

Edit: route ID → GET /course/{id} → map CourseViewModel
      → initialValues {code,subject,description} → normalize/validate
      → PUT /course/{id} → refresh course/list/grades → /courses/:id
```

| State | Owner |
| --- | --- |
| Editable values, touched/submitted state, field errors, pristine | `CourseForm.vue` + pure `course-form.ts` |
| Course identity và navigation | Page wrapper + Router |
| Detail loading/load error/not found | Vue Query detail query + Edit page |
| Mutation pending/server error | Page mutation, truyền xuống form |
| Course list/detail cache | Vue Query theo `courseKeys` |
| Nested Course metadata trong Grade cache | Vue Query theo `gradeKeys.root` |

Mapping bắt buộc:

| UI | Form/API field | Quy tắc |
| --- | --- | --- |
| Course Code | `code` | Trim đầu/cuối; không uppercase tự động |
| Course Name (Subject) | `subject` | Không serialize thành `name` |
| Description | `description` | Trim đầu/cuối; giữ newline nội bộ |

## 7. Error/loading states

| Tình huống | UI/hành vi |
| --- | --- |
| Edit đang GET | Loading state; không mount editable form rỗng |
| Route ID invalid hoặc GET 404 | Resource Not Found + Back to Courses; không GET/PUT với ID invalid |
| GET network/5xx | Load error + Retry chỉ refetch detail |
| Validation fail | Field errors, focus lỗi đầu tiên, không mutation |
| Mutation pending | Disable fields/actions, `aria-busy`, không request thứ hai |
| Duplicate code chưa có stable contract | Generic safe form error, không lộ SQL/constraint |
| Stable `409`/error code | Map vào Course Code, giữ values và focus field khi phù hợp |
| Update 404 | Chuyển sang resource-not-found behavior; không redirect như success |
| Mutation 4xx/5xx/network khác | Giữ values/route, form-level safe error, user tự retry |
| `401` | Centralized auth-expired flow hiện có |

## 8. Test plan

| Cấp | Case bắt buộc | AC |
| --- | --- | --- |
| Unit model | trim ba field, whitespace required, lowercase code giữ nguyên, description giữ newline, Create/Edit dùng cùng validator | 004–011, 031, 037 |
| Shared primitive/component | textarea label/helper/error ARIA; form copy theo mode, preload, valid/invalid submit, focus, pending, pristine, Cancel, keyboard | 001–003, 013–017, 024–029, 031, 037 |
| API/Create page | một POST đúng payload, entity/empty response theo contract, generic error, 401, invalidate root, detail/list navigation | 010, 012–023, 030 |
| API/Edit page | invalid ID, GET/loading/404/retry, route đổi ID, một PUT, no-op, entity/empty success, error giữ values, cache refresh, detail navigation | 032–039 |
| List/detail activation | Edit còn disabled trước gate; sau gate điều hướng đúng `/courses/:id/edit` | 040 |
| E2E | Login → Add → Save → detail/list; Edit → Update → detail; Cancel; validation; duplicate/error; double submit | 001–040 |

Tests phải kiểm tra cả HTTP method/path/body và query cache effects, không chỉ copy hiển thị.

## 9. Risks và rollback

- **Contract tài liệu mâu thuẫn:** spec pack xác nhận PUT nhưng tài liệu cũ phủ nhận. Runtime/OpenAPI là gate; không bật Edit dựa trên tài liệu mới duy nhất.
- **Create/Update response body không thống nhất:** adapter không ép mapper lên `undefined`; tests khóa riêng entity và status-only behavior thực tế.
- **Course Detail còn placeholder:** Update success vẫn điều hướng về detail theo spec; Cancel quay thẳng về `/courses` theo quyết định sản phẩm ngày 2026-09-28.
- **Stale nested Course data:** Update phải invalidate `gradeKeys.root`; Create không cần vì chưa có Grade nào tham chiếu Course mới.
- **Duplicate code trả generic 500:** chỉ dùng safe form error cho đến khi có stable `409`/error code; không suy luận từ raw message.
- **Shared textarea regression:** component mới tránh sửa behavior của `BaseInput`; test ARIA/style contract độc lập.
- **Dirty state bị reset do refetch:** reset form theo entity ID/initialization event có kiểm soát, không watch sâu và overwrite draft tùy tiện.
- **Rollback production:** có thể disable Edit entry points/route activation trong khi giữ shared form và Create; không rollback bằng cách thay Update thành delete/create.

## 10. Definition of Done checks

- [x] Backend detail/create/update contract đã được xác minh và tài liệu liên quan đã đồng bộ.
- [x] Một `CourseForm.vue` phục vụ Create/Edit; không duplicate field/validation và không gọi API/router.
- [x] Code, Subject, Description required; trim đúng, giữ casing Code và newline nội bộ.
- [x] Course Name serialize thành `subject`; payload không có `id` hoặc `name`.
- [x] `BaseTextarea` và form có label/helper/error ARIA, native keyboard semantics và responsive CSS.
- [x] Create gửi đúng một POST; failure giữ values; success invalidate Course cache và navigate theo response contract.
- [x] Edit không query với ID invalid; preload/loading/404/retry và route ID change hoạt động.
- [x] Update gửi đúng một PUT; no-op/pending guard hoạt động; failure giữ values; success refresh list/detail/Grade metadata và về Course Detail.
- [x] Edit route và entry points chỉ active sau khi full flow/tests hoàn chỉnh.
- [x] Không lộ raw backend/SQL error; duplicate conflict hiện dùng generic safe error do backend chưa có stable contract.
- [ ] Focus/keyboard/mobile đã được kiểm tra thủ công; automated accessibility assertions đã pass.
- [x] Unit/component/integration tests và build pass; live E2E chưa chạy và dependency E2E runner/môi trường đã được ghi rõ.

## 11. Các quyết định cần ghi lại khi bắt đầu implementation

1. Create trả entity hay body rỗng, và success destination tương ứng.
2. Update trả entity hay body rỗng.
3. Update có cho đổi Course Code hay không.
4. Duplicate code có stable `409`/machine-readable code hay chưa.
5. Course Detail placeholder có được chấp nhận làm destination ngay trong release này hay cần fallback tạm về list.

Các quyết định này phải dựa trên backend/product contract thực tế; không được dùng để tự thêm validation hoặc thay đổi behavior đã xác nhận trong spec pack.

## 12. Kết quả triển khai — 2026-09-28

- OpenAPI local tại `http://localhost:9090/v3/api-docs` xác nhận `GET /course/{id}`, `POST /course` và `PUT /course/{id}`. Create/Update đều trả Course với HTTP 200; Update body gồm `code`, `subject`, `description` và cho phép gửi Course Code đã chỉnh sửa.
- Đã triển khai shared `CourseForm.vue`, `BaseTextarea.vue`, Create/Edit pages, detail query, POST/PUT adapters, route Edit và entry points ở Course list/detail.
- Create success điều hướng Course Detail bằng ID trả về. Edit success cập nhật detail cache, invalidate Course list và Grade cache rồi điều hướng `/courses/:id`.
- Cancel ở Edit Course quay về `/courses` và không gửi PUT.
- Duplicate Course Code vẫn dùng generic safe error vì OpenAPI/backend chưa công bố stable `409` hoặc machine-readable code.
- Focus-first-error, ARIA associations, pending/pristine guards và responsive CSS đã có automated coverage; manual browser/screen-reader/mobile verification chưa chạy.
- Unit/component/integration tests và build được chạy local. Repo chưa cấu hình E2E runner trong `package.json`, vì vậy live browser E2E chưa chạy và Definition of Done tương ứng vẫn để mở.
