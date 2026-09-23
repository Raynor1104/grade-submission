# Student Management — Implementation Plan

> Ghi chú 2026-09-22: Những đoạn Edit disabled và mock-data override bên dưới là lịch sử của đợt triển khai trước. Source hiện dùng Student API query; Edit được triển khai theo `student-form.implementation-plan.md`.

**Phụ trách:** Frontend team  
**Trạng thái:** Implemented — mock-data override áp dụng ngày 2026-09-09  
**Cập nhật lần cuối:** 2026-09-09

## 1. Mục tiêu và phạm vi

Kế hoạch này triển khai màn hình danh sách **Student Management** tại `/students` theo `student-management.spec-pack.md`, thay thế placeholder hiện tại và kết nối backend thật.

### In scope

- Tải danh sách bằng `GET /student/all` qua API client dùng chung.
- Hiển thị Student table với ID, Student Name, Birth Date và Actions.
- Search theo name/ID và pagination 10 bản ghi/trang ở client.
- Đồng bộ search/page với URL query.
- Điều hướng Add và View.
- Hiển thị Edit ở trạng thái disabled/unsupported.
- Delete có confirmation, pending, success, error và chống gửi trùng request.
- Loading, empty collection, no-result, load error + Retry.
- Accessibility, keyboard và responsive behavior.
- Unit, component, integration và E2E coverage cho các AC chính.

### Out of scope

- Implement form `/students/new` hoặc detail `/students/:id`.
- Student update/edit API hoặc route edit giả.
- Server-side search/pagination, sorting, bulk action, import/export.
- Thay đổi backend hoặc tự giả lập CORS bằng `mode: no-cors`.
- Hoàn thiện toàn bộ auth/dashboard/grades; feature này chỉ tích hợp với contract dùng chung của các module đó.

## 2. Hiện trạng và điều kiện tiên quyết

| Hạng mục | Hiện trạng source | Hành động trước/kèm implementation |
| --- | --- | --- |
| `/students` | `StudentsPage.vue` chỉ render `Student Page` | Thay bằng page container hoàn chỉnh |
| Shared UI | Có `PageHeader`, `BaseCard`, `BaseInput`, `BaseButton`, `Pagination` | Reuse; mở rộng nhỏ theo hướng backward-compatible |
| Student model/API | Chưa có | Tạo DTO, ViewModel, mapper và feature API |
| API client/error normalization | Chưa có `src/core/api` | Platform prerequisite bắt buộc; component không gọi `fetch` trực tiếp |
| Auth token bridge | Chưa có auth source trong repo | API client nhận token từ auth/token provider; live API/E2E cần auth slice hoàn thành |
| Query/cache | Chưa cài TanStack Vue Query dù ADR-0005 đã chọn | Bổ sung provider/query-key factory trước khi tạo Student query/mutation |
| Dev proxy | `vite.config.ts` chưa cấu hình proxy | Bổ sung `/api` proxy tới `http://localhost:9090`, rewrite bỏ prefix `/api` |
| Test runner | `package.json` chỉ có `dev`, `build`, `preview` | Bổ sung test harness/scripts trước khi đóng task |
| Delete dialog | Chưa có shared dialog | Tạo `StudentDeleteDialog.vue`; chỉ nâng thành shared khi có consumer thứ hai |

Các prerequisite platform có thể được làm trong cùng nhánh hoặc một nhánh phụ thuộc đi trước. Không được bỏ qua chúng bằng cách gọi `fetch` trực tiếp, hardcode token hoặc bind raw response vào page.

## 3. Quyết định implementation đã chốt

1. URL query dùng `q` cho search và `page` cho số trang.
2. `q` rỗng/whitespace-only và `page=1` được bỏ khỏi URL; page không hợp lệ được normalize về `1`, page vượt giới hạn được clamp sau khi có dữ liệu.
3. Thay đổi search dùng `router.replace()` và reset page về `1`; chuyển trang dùng `router.push()` để Back/Forward khôi phục trang trước.
4. Edit vẫn hiển thị để khớp design nhưng luôn `disabled`, có `title="Edit is currently unavailable"` và note tương ứng ở footer.
5. Search dùng substring cho cả `String(id)` và `name.toLocaleLowerCase()`, sau khi trim keyword; không phát network request khi gõ.
6. Birth Date được giữ dưới dạng date-only string. `yyyy-MM-dd` hiển thị thành `yyyy/MM/dd`; dữ liệu malformed hiển thị `—`, không parse qua `Date` và không làm crash page.
7. Delete dialog dùng native `<dialog>` để có modal/focus containment cơ bản mà không thêm thư viện UI. Component vẫn phải xử lý accessible title/description, Escape, pending lock và focus restore.
8. Chỉ cập nhật UI sau khi DELETE thành công. Sau `204`, remove record khỏi cache đã xác nhận thành công rồi invalidate/refetch các query liên quan.
9. Chưa thêm toast riêng cho feature. Success được thể hiện bằng dialog đóng và row biến mất; lỗi delete hiển thị inline trong dialog. Có thể chuyển sang notification chung khi platform cung cấp.
10. Không coi DELETE `404` là success cho tới khi backend contract ổn định; giữ row, hiển thị normalized error và cho Retry/Close.

## 4. AC mapping

| Workstream | AC được đáp ứng | Deliverable chính |
| --- | --- | --- |
| Page shell và API list | 001–004, 022, 025 | Header/card, query list, mapper, loading/error/retry |
| Search và URL state | 005–008, 031 | `q`, normalization, route sync, reset page |
| Pagination và summary | 009–011, 021, 024 | Filter → clamp → slice, page size 10, shared Pagination |
| Navigation/actions | 012–015, 032–033 | Add/View routes, Edit disabled, không có unsupported request |
| Delete flow | 016–021, 026 | Dialog, mutation, invalidation, pending/error, clamp |
| Empty/system states | 022–026 | Phân biệt loading/error/empty/no-result/delete error |
| Accessibility/responsive | 027–030 | Accessible search, semantic table, dialog focus, horizontal scroll |

AC 032 là unsupported guard và AC 033 là backlog marker; chúng được xác minh bằng việc **không** tạo update endpoint hay server-side list parameters.

## 5. Backend và platform dependency

### Backend contract không thay đổi

```text
GET    /student/all       -> 200 + StudentDto[]
DELETE /student/{id}      -> 204 No Content
Authorization             -> Bearer <jwt>
```

`StudentDto` tối thiểu:

```ts
interface StudentDto {
  id: number
  name: string
  birthDate: string
}
```

### Platform contract cần có

- API base URL từ environment; local browser gọi `/api` qua Vite proxy.
- HTTP client tự gắn Bearer token, xử lý JSON/204, AbortSignal và normalize mọi failure thành `ApiError`.
- `401` đi qua global auth-expired flow; Student page không tự biến nó thành empty/error nghiệp vụ.
- Query keys tập trung, tối thiểu:

```ts
studentKeys.all()
studentKeys.detail(id)
gradeKeys.all()
dashboardKeys.summary()
```

- Query provider được mount một lần ở app bootstrap.
- Không sao chép server response vào Pinia; Pinia chỉ thuộc auth boundary.

Nếu token provider/auth flow chưa được merge, component và integration tests vẫn có thể chạy bằng mocked HTTP; live-backend test và E2E authenticated phải được đánh dấu dependency, không được giả token trong production code.

## 6. Files/modules bị ảnh hưởng

### Tạo mới cho Student feature

```text
src/features/students/
├── api/
│   └── student.api.ts
├── components/
│   ├── StudentDeleteDialog.vue
│   ├── StudentTable.vue
│   └── StudentToolbar.vue
├── model/
│   ├── student-list.ts
│   ├── student.mapper.ts
│   └── student.types.ts
└── pages/
    └── StudentsPage.vue              # thay nội dung placeholder
```

Vai trò:

- `student.types.ts`: `StudentDto`, `StudentViewModel` và payload/error type liên quan nếu feature sở hữu.
- `student.mapper.ts`: validate/map DTO → ViewModel; không format timezone.
- `student-list.ts`: pure functions cho normalize search, filter, paginate và clamp để unit test độc lập.
- `student.api.ts`: typed wrapper cho GET/DELETE; không chứa UI state.
- `StudentToolbar.vue`: accessible search + Add action.
- `StudentTable.vue`: semantic table + View/Edit/Delete emits.
- `StudentDeleteDialog.vue`: target context, cascade warning, pending/error và focus behavior.
- `StudentsPage.vue`: orchestration của query, URL state, derived list và actions.

### Tạo mới/hoàn thiện ở platform nếu chưa được task khác cung cấp

```text
src/app/providers/query-client.ts
src/core/api/error-normalizer.ts
src/core/api/http-client.ts
src/core/api/query-keys.ts
src/core/api/types.ts
src/core/config/env.ts
```

Token storage/provider thuộc auth slice; chỉ thêm adapter interface tại API boundary nếu cần, không triển khai login trong Student task.

### Chỉnh sửa hiện có

| File | Thay đổi dự kiến |
| --- | --- |
| `src/main.ts` | Mount query provider nếu platform chưa làm |
| `src/shared/ui/BaseInput.vue` | Thêm prop/binding accessible name (`ariaLabel`) mà không phá API hiện tại |
| `src/shared/ui/Pagination.vue` | Thêm navigation label và optional note slot để đặt unsupported-edit note; giữ tương thích Courses/Grades |
| `src/shared/utils/date.ts` | Harden formatter cho date-only malformed fallback |
| `vite.config.ts` | Dev proxy `/api` → backend 9090 và rewrite path |
| `package.json` | Query dependency và test scripts/devDependencies nếu chưa có |
| `docs/modules/students/test_spec.md` | Bổ sung mapping test chi tiết từ spec pack |
| `docs/e2e/students.md` | Bổ sung URL restore, list error/retry và delete failure khi E2E harness hỗ trợ |

### Test files dự kiến

```text
src/core/api/__tests__/error-normalizer.spec.ts
src/core/api/__tests__/http-client.spec.ts
src/features/students/model/__tests__/student-list.spec.ts
src/features/students/model/__tests__/student.mapper.spec.ts
src/features/students/components/__tests__/StudentTable.spec.ts
src/features/students/components/__tests__/StudentDeleteDialog.spec.ts
src/features/students/pages/__tests__/StudentsPage.spec.ts
e2e/students/student-management.spec.ts
```

Tên/thư mục test có thể điều chỉnh theo test harness chung, nhưng mapping AC không được mất.

## 7. Implementation steps

Luồng phụ thuộc:

```text
Platform API/auth/query/proxy
        ↓
Student types + mapper + API
        ↓
Pure list logic + URL state
        ↓
Toolbar + table + page states
        ↓
Delete dialog + mutation/invalidation
        ↓
A11y/responsive hardening
        ↓
Tests + docs + build verification
```

### Bước 0 — Baseline và guardrails

1. Giữ nguyên routes `/students`, `/students/new`, `/students/:id`; không cần sửa router record.
2. Chụp baseline `npm run build` trước thay đổi và ghi nhận repo hiện chưa có lint/test script.
3. Không sửa hoặc xóa các thay đổi tài liệu chưa commit của người dùng.
4. Chốt contract trong mục 3 của kế hoạch này trước khi code để tests dùng cùng query keys/copy.

**Exit criteria:** baseline build được ghi nhận; không có ambiguity về `q`, `page`, Edit và delete success UI.

### Bước 1 — Hoàn thiện platform slice tối thiểu

1. Tạo environment reader có default an toàn cho local `/api`; validate config thay vì rải base URL trong feature.
2. Tạo typed HTTP client bằng `fetch`:
   - ghép base URL/path an toàn;
   - nhận/gắn token qua auth provider;
   - chỉ đặt JSON headers khi có JSON body;
   - trả `undefined` cho 204;
   - normalize backend/network/client error;
   - forward `AbortSignal`;
   - phát auth-expired flow một lần cho 401.
3. Tạo query client/provider và query-key factory theo ADR-0005/0012.
4. Cấu hình Vite proxy `/api` và rewrite thành path backend không có `/api/v1`.
5. Thiết lập Vitest + Vue Test Utils + DOM environment; thêm MSW hoặc fetch mock ở HTTP boundary. Thiết lập Playwright riêng cho E2E nếu repo chưa có.

**Exit criteria:** API client có tests cho 200 JSON, 204, 401, 404/default error và network failure; dev request `/api/student/all` tới đúng backend path.

### Bước 2 — Student domain boundary và API adapters

1. Khai báo `StudentDto` và `StudentViewModel` tách biệt dù field hiện giống nhau.
2. Implement `mapStudentDto()` và `mapStudentList()`:
   - giữ nguyên numeric `id`, `name`, date-only string;
   - payload không phải array hoặc thiếu field thiết yếu trở thành normalized client/data error;
   - malformed `birthDate` không làm page crash.
3. Implement `getStudents({ signal })` gọi `GET /student/all`.
4. Implement `deleteStudent(id)` gọi đúng `DELETE /student/{encodedId}` và chấp nhận 204 mà không parse JSON.
5. Feature component chỉ import API adapter/types, không biết base URL/header/token.

**Exit criteria:** mapper/API unit tests pass; không có mock Student data trong production path.

### Bước 3 — Pure list logic và URL query state

1. Implement/test các pure functions:
   - `normalizeStudentSearch(value)`;
   - `filterStudents(students, keyword)`;
   - `getTotalPages(total, pageSize)`;
   - `clampPage(page, totalPages)`;
   - `paginateStudents(students, page, pageSize)`.
2. Trong page, lấy initial `search` từ `route.query.q`, page từ `route.query.page`.
3. Đồng bộ Back/Forward từ route query về UI mà không tạo watch loop.
4. Khi search thay đổi: reset page 1, cập nhật URL bằng `replace`, filter array đang cache; không gọi API.
5. Khi user đổi page: cập nhật URL bằng `push`.
6. Sau load, filter hoặc delete: clamp page; normalize query bằng `replace` nếu URL vượt range.

**Exit criteria:** reload và Back/Forward khôi phục đúng state; whitespace/casing/ID substring và page edge cases có unit/integration tests.

### Bước 4 — Toolbar, table và read-only page states

1. `StudentToolbar.vue`:
   - dùng `BaseInput` với placeholder đúng design;
   - truyền `aria-label="Search students by name or ID"` qua prop mới;
   - emit `update:search` và `create`;
   - layout column trên mobile, row trên desktop.
2. `StudentTable.vue`:
   - semantic table với đúng thứ tự cột;
   - format date qua shared utility;
   - View/Delete là button có text + icon;
   - Edit disabled, có title, tuyệt đối không emit/navigate;
   - wrapper `overflow-x-auto` và min-width phù hợp design.
3. `StudentsPage.vue`:
   - luôn render `PageHeader` và `BaseCard` shell;
   - initial loading dùng `role="status"`/live text `Loading students...`;
   - load error khác empty và có Retry;
   - empty collection dùng `No students yet.`;
   - active search không match dùng `No students found.`;
   - Add vẫn khả dụng trong loading/error/empty;
   - View/Add push đúng canonical routes.
4. Render `Pagination` chỉ khi `filteredTotal > 0`, truyền `item-label="students"` và note slot cho Edit.

**Exit criteria:** AC 001–015, 022–025, 027–028 và 030 pass ở component/integration level.

### Bước 5 — Delete flow

1. Khi Delete được kích hoạt, lưu `deleteTarget` và trigger element, chưa gọi API.
2. Mở `StudentDeleteDialog` với:
   - title `Delete student?`;
   - name + ID của target;
   - cảnh báo related grade records có thể bị xóa;
   - Cancel và Delete.
3. Dialog behavior:
   - focus vào action an toàn khi mở;
   - trap focus qua native modal;
   - Escape/Cancel đóng khi không pending;
   - pending disable action cần thiết và hiển thị loading;
   - guard không cho confirm lần hai;
   - đóng xong trả focus về đúng row trigger.
4. On success 204:
   - remove row khỏi `students.all` cache **sau** success;
   - invalidate/refetch students list/detail, grade queries và dashboard summary;
   - clear target/error, đóng dialog;
   - clamp page/query nếu record cuối trang bị xóa.
5. On failure:
   - không remove row;
   - giữ target/dialog context;
   - render normalized generic message bằng text/live region;
   - cho Retry hoặc Close, mỗi retry chỉ tạo một request.

**Exit criteria:** AC 016–021, 026 và 029 pass; Network panel/test spy xác minh Cancel = 0 request, Confirm = đúng 1 request.

### Bước 6 — Accessibility và responsive hardening

1. Kiểm tra keyboard order cho search, Add, từng row action, pagination và dialog.
2. Đảm bảo focus ring không bị CSS loại bỏ; current page có `aria-current="page"`.
3. Pagination controls nằm trong navigation có accessible label.
4. Loading/delete error được announce; loading không đồng thời render false empty state.
5. Test viewport desktop, tablet và mobile:
   - toolbar stack hợp lý;
   - table scroll ngang, không mất cột;
   - footer/note/pagination wrap;
   - dialog không vượt viewport;
   - tên Unicode/dài không phá actions.

**Exit criteria:** keyboard-only flow hoàn tất; automated accessibility smoke không có lỗi critical; viewport checks pass.

### Bước 7 — Verification, docs và handoff

1. Chạy unit/component/integration tests, sau đó build/typecheck.
2. Chạy E2E với backend/auth thật cho list → search → View → Back và create/find/delete journey khi các page phụ thuộc đã sẵn sàng.
3. Cập nhật `test_spec.md`, `docs/e2e/students.md` và task status/traceability theo coverage thực tế.
4. Không đánh dấu Done nếu live protected API chưa xác minh do auth/proxy dependency; ghi rõ blocked item còn lại.
5. Review diff để loại debug logging, hardcoded data/token, `.only` và endpoint unsupported.

## 8. Data mapping và derived state

```text
GET /student/all
  → validate StudentDto[]
  → map StudentViewModel[]
  → normalize q
  → filter by lowercase name OR String(id)
  → calculate filteredTotal/totalPages
  → clamp page
  → slice pageSize=10
  → render rows + summary
```

State ownership:

| State | Owner/source of truth |
| --- | --- |
| Students array, loading, load error | TanStack Query cache |
| `q`, `page` | Vue Router query |
| Filtered/paginated/summary | Vue computed + pure list functions |
| Delete target, trigger, dialog open state | Local refs in `StudentsPage`/dialog |
| Delete pending/error | Mutation state + local normalized display context |
| JWT/authenticated state | Auth provider/Pinia, ngoài Student feature |

Không tạo bản sao mutable thứ hai của students trong local refs. Cache update sau delete chỉ diễn ra sau server success.

## 9. Error/loading/state matrix

| Điều kiện | Table region | Footer/pagination | User action |
| --- | --- | --- | --- |
| Initial query pending | `Loading students...` | Hidden | Add vẫn enabled |
| GET success + `[]` + no query | `No students yet.` | Hidden | Add enabled |
| GET success + data + no match | `No students found.` | Hidden | Search/clear search |
| GET/network fail | Generic load error, không raw payload | Hidden | Retry + Add |
| GET 401 | Global auth-expired flow | Hidden | Login flow xử lý |
| GET success + rows | Student table | Summary + note + pagination | Full actions |
| DELETE pending | Row chưa bị xóa; dialog locked | Giữ nguyên | Không cho duplicate submit |
| DELETE success 204 | Cache update rồi refetch | Clamp nếu cần | Dialog đóng |
| DELETE fail | Row giữ nguyên | Giữ nguyên | Inline error + Retry/Close |

## 10. Test plan

### Unit

| Test | Coverage |
| --- | --- |
| Mapper giữ `id/name/birthDate` và reject payload thiết yếu sai | AC 002–004 |
| Date ISO → display và malformed → `—` | AC 004 |
| Search name mixed-case/Unicode, trim/whitespace, ID substring | AC 005–007 |
| Filter rồi paginate 10 items/page, exact 10/11 records | AC 008–011 |
| Clamp invalid URL page và page cuối sau delete | AC 021, 031 |
| HTTP client parse JSON/204 và normalize network/401/404/5xx | AC 002, 019, 025–026 |

### Component

| Test | Coverage |
| --- | --- |
| Toolbar có accessible search và emit Add | AC 012, 027 |
| Table headers/rows/date/actions đúng; Edit disabled | AC 003–004, 013–015 |
| Delete click chỉ emit target, chưa gọi API | AC 016 |
| Dialog copy/cascade warning/Cancel/focus restore | AC 017–018, 029 |
| Dialog pending chống double submit; error giữ context | AC 019, 026 |
| Pagination current/disabled/summary và note slot | AC 009–011, 028 |

### Integration

| Test | Coverage |
| --- | --- |
| GET success render header/table | AC 001–004 |
| Search/page không tạo thêm GET và sync URL | AC 005–011, 031 |
| Loading → success, empty, no-result, error → Retry → recover | AC 022–025 |
| Add/View navigation đúng route | AC 012–013 |
| Confirm DELETE đúng ID đúng một lần, 204 remove + clamp | AC 019–021 |
| DELETE fail giữ row và Retry thành công | AC 026 |

### E2E

- `/students?q=...&page=...` reload và Back/Forward giữ/clamp state.
- Open list → search theo name/ID → View → Back giữ list state.
- Create Student từ page phụ thuộc → quay list tìm record → Delete → verify record biến mất.
- Narrow viewport giữ đủ dữ liệu/actions qua horizontal scroll.
- Auth 401 đi đúng global flow khi auth/platform sẵn sàng.

### Commands dự kiến

```text
npm run test:unit
npm run test:e2e
npm run build
```

Hiện repo chỉ có `npm run build`; test commands phải được thêm trong Bước 1. Chỉ chạy lint nếu dự án bổ sung lint script, không báo pass cho script không tồn tại.

## 11. Rủi ro và phương án giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
| --- | --- | --- |
| Auth/API/query foundation chưa tồn tại | Không verify backend thật hoặc invalidation | Tách prerequisite rõ, mock HTTP chỉ cho test, không hardcode token |
| Backend CORS business endpoint | Browser request fail dù API đúng | Dùng `/api` dev proxy; production same-origin/reverse proxy |
| Watch URL tạo loop/history noise | Search/page giật hoặc Back sai | Một nguồn URL state, search dùng replace, pagination dùng push, integration test history |
| Delete cascade hoặc concurrent delete | Grade/dashboard stale, target không còn | Cảnh báo, invalidate rộng, generic error + refetch sau contract ổn định |
| Shared component regression | Courses/Grades bị đổi layout/behavior | Chỉ thêm optional prop/slot, giữ defaults, chạy smoke/build các consumer |
| Malformed/duplicate backend data | Crash hoặc key collision | Defensive mapper/formatter; không tự sửa ID, report data quality trong dev/test |
| Test stack mở rộng scope | Chậm hoàn tất feature | Land harness như platform prerequisite và reuse cho module sau |

## 12. Rollback strategy

- Chia commit theo platform, Student data layer, read UI, delete flow và tests để có thể revert độc lập.
- Thay đổi `BaseInput`/`Pagination` phải backward-compatible; nếu gây regression, giữ API cũ và chuyển phần Student-specific về wrapper component tạm thời.
- Nếu live API bị chặn bởi proxy/auth, không quay lại hardcoded production data; giữ feature sau flag/branch chưa merge hoặc đánh dấu integration blocked.
- Nếu delete mutation có lỗi production, có thể tạm ẩn/disable riêng Delete action trong khi vẫn giữ list/search/View hoạt động; không thay bằng optimistic delete.
- Không rollback bằng cách khôi phục placeholder sau khi read-only list đã đạt AC; ưu tiên cô lập capability lỗi.

## 13. Definition of Done checks

- [x] `/students` không còn placeholder và khớp intent của design.
- [x] GET/DELETE đi qua typed API client, Bearer/auth và 204 handling dùng chung.
- [x] Không có hardcoded Student production data hoặc raw `fetch` trong component.
- [x] Mapper/date display đúng và malformed data không crash page.
- [x] Search name/ID, page size 10, summary, reset/clamp hoạt động trên filtered array.
- [x] `q`/`page` restore đúng qua reload và Back/Forward.
- [x] Add/View đúng route; Edit disabled và không có update request/route giả.
- [x] Delete có target + cascade warning, Cancel = 0 request, Confirm không gửi trùng.
- [x] Delete 204 cập nhật list/invalidate liên quan; failure giữ row và cho Retry/Close.
- [x] Loading, empty collection, no-result và load error không bị lẫn nhau; auth-expired event đã có ở API boundary.
- [x] Search/table/pagination/dialog đạt keyboard, semantic và focus requirements ở automated coverage.
- [ ] Desktop/tablet/mobile không mất dữ liệu hoặc action.
- [x] Unit/component/integration tests map đủ AC chính và pass.
- [ ] E2E critical flow pass, hoặc dependency auth/page phụ trợ được ghi blocked rõ ràng.
- [x] `npm run build` pass; lint/test scripts hiện hữu đều pass.
- [x] Shared component consumers Courses/Grades vẫn typecheck/build pass.
- [x] Student test mapping được cập nhật theo implementation thực tế.
- [x] Không có secret, raw JWT, debug log, `.only` hoặc endpoint ngoài contract.

## 14. Implementation result — 2026-09-09

Đã hoàn thành frontend source cho list/search/pagination/navigation/delete, shared API/query foundation, dev proxy và automated test harness. Các kiểm tra local hiện có:

```text
npm run test:unit
npm run build
```

Live E2E chưa thể chạy trong repository hiện tại vì login/auth UI, Student Create/Detail và backend runtime không thuộc implementation này hoặc vẫn là placeholder. Đây là dependency verification còn lại, không được thay bằng production mock data hay hardcoded JWT.

## 15. Mock-data override — 2026-09-09

Theo yêu cầu mới, Student Management hiển thị `mockStudents` giống cách Courses/Grades đang hoạt động, thay vì gọi `GET /student/all`.

- Search, pagination và URL state tiếp tục chạy trên array mock.
- Confirm Delete chỉ xóa record khỏi state cục bộ của page; không gọi `DELETE /student/{id}`.
- API adapter và platform foundation được giữ lại cho lần chuyển về backend integration sau này, nhưng không nằm trên runtime path của Student Management hiện tại.
- Loading/network error/Retry không hiển thị trong mock mode vì không có list request.
