# Dashboard — A Grades by Student Implementation Plan

**Phụ trách:** Frontend team  
**Trạng thái:** Implemented — automated verification complete; manual viewport/live E2E pending
**Cập nhật lần cuối:** 2026-09-23
**Nguồn yêu cầu:** `docs/modules/dashboard/dashboard.spec-pack(1).md`

## 1. Mục tiêu và phạm vi

Thay riêng panel analytics `Grades by Course` trên `/dashboard` bằng `A Grades by Student`, dùng dữ liệu thật từ `GET /api/v1/students/grade-a-counts`. Giữ nguyên composition, kích thước card, grid, responsive behavior và behavior của Summary Cards, Quick Actions, Data Attention và Grade Records.

Phạm vi triển khai gồm typed contract và runtime mapper cho aggregate response, Students-domain API/query/key, pure ranking cho top 5, component card mới, query độc lập trên Dashboard, cache invalidation từ Student/Grade mutations và automated tests tương ứng.

Không tính lại A-grade từ `/grade/all`, không merge duplicate names, không thêm student detail navigation, không đổi backend, không redesign Dashboard và không thay semantics của Data Attention.

## 2. Hiện trạng source và gap cần xử lý

| Hạng mục | Hiện trạng ngày 2026-09-23 | Thay đổi cần làm |
| --- | --- | --- |
| Dashboard | Đã có 3 queries Students/Courses/Grades và các section hoạt động độc lập | Thêm query thứ tư cho grade-A-count, không block ba query cũ |
| Left analytics card | `GradesByCourseCard.vue` derive từ Courses + Grades | Thay bằng `StudentGradeACountCard.vue` dùng aggregate API |
| Derived model | Có `getCourseGradeCounts()` và `CourseGradeCount` | Thay bằng row/ranking model cho student A count |
| Students boundary | Có API, query, types và strict mapper cho Student CRUD | Thêm aggregate type, list mapper, API function và query option tại Students domain |
| Query keys | `studentKeys` có `root`, `all`, `detail` | Thêm `gradeACounts()` dưới `['students']` |
| Student Create/Delete | Đang invalidate `studentKeys.root` | Key aggregate mới được invalidate nhờ partial matching; thêm test chứng minh |
| Student Edit | Chỉ invalidate `studentKeys.all()` và `gradeKeys.root` | Explicitly invalidate `studentKeys.gradeACounts()` để rename không để stale name |
| Grade Delete | Chỉ update/invalidate Grade cache | Explicitly invalidate `studentKeys.gradeACounts()` sau success |
| Grade Create/Update | UI hiện chưa implement, action còn placeholder | Ghi contract cho mutation tương lai; không mở rộng scope để xây form Grade |
| Tests | Đang cover card/course derivation và Dashboard với 3 requests | Thay coverage cũ bằng aggregate mapper/ranking/card và 4-source page cases |

`GradesByCourseCard`, `getCourseGradeCounts` và `CourseGradeCount` hiện chỉ có consumer trong Dashboard và tests. Có thể remove sau khi đổi consumer; kiểm tra usage lại ngay trước khi xóa để tránh làm hỏng thay đổi song song.

## 3. Quyết định implementation

1. Aggregate thuộc Students domain. Không tạo API hoặc cache key riêng dưới Dashboard.
2. API adapter gọi chính xác `httpClient.get('/api/v1/students/grade-a-counts', signal)`. Với `apiBaseUrl = '/api'`, browser gọi `/api/api/v1/students/grade-a-counts`; Vite proxy strip prefix `/api` đầu tiên và backend nhận `/api/v1/students/grade-a-counts`.
3. Mapper nhận `unknown`, yêu cầu response là array; mỗi item phải có `studentName: string` và `gradeACount` là finite integer `>= 0`. Không coerce string/null/số âm và không trim hoặc merge name.
4. Dashboard dùng `useQuery(studentQueries.gradeACounts())` song song với Students/Courses/Grades. Aggregate loading/error/retry chỉ điều khiển card mới.
5. Presentation ranking tạo bản sao có `sourceIndex` trước khi sort: `gradeACount DESC`, rồi `studentName ASC`, rồi `sourceIndex ASC`; lấy tối đa 5 rows. Không sort trực tiếp array trong Vue Query cache.
6. `barPercent = gradeACount / maxVisibleCount * 100`; toàn bộ bars bằng `0` khi max visible bằng `0`. Giá trị count vẫn là integer, không hiển thị dấu `%`.
7. Duplicate `studentName` là các rows riêng. Vue key kết hợp presentation `sourceIndex` với name/count; tuyệt đối không dùng name một mình và không giả lập `studentId`.
8. Card mới kế thừa visual structure/CSS behavior của card cũ: `BaseCard`, min-height, spacing, bar style, count alignment, state area và CTA placement. Chỉ đổi domain copy/data/state.
9. Empty array hiển thị `No students available.`; danh sách có rows count `0` vẫn render rows và bars `0%`.
10. CTA là `RouterLink` tới `/students` với text `View all students →`.
11. Không dùng aggregate để tính Total Students hoặc Students without grades. Hai metric đó tiếp tục phụ thuộc Students và Grades collections hiện tại.
12. Khi aggregate lỗi, không fallback sang client aggregation từ Grades và không collapse Dashboard.

## 4. AC mapping

| Workstream | Acceptance criteria |
| --- | --- |
| Route, layout, card copy và non-regression | DASH-A-001–005, 028, 032–038 |
| API, auth, ownership và validation | DASH-A-006–010 |
| Ranking, limit, duplicate và bars | DASH-A-011–018, 029 |
| Loading, empty, error và retry isolation | DASH-A-019–025 |
| CTA và accessibility | DASH-A-026–027, 039–041 |
| Mutation freshness | DASH-A-030–031 |
| Quality gates | DASH-A-042 |

## 5. Files/modules bị ảnh hưởng

| File | Thay đổi dự kiến |
| --- | --- |
| `src/core/api/query-keys.ts` | Thêm `studentKeys.gradeACounts()` |
| `src/features/students/model/student.types.ts` | Thêm aggregate DTO/ViewModel type |
| `src/features/students/model/student.mapper.ts` | Thêm strict mapper cho aggregate list |
| `src/features/students/api/student.api.ts` | Thêm `getStudentGradeACounts(signal)` |
| `src/features/students/api/student.queries.ts` | Thêm `gradeACounts()` query option |
| `src/features/dashboard/model/dashboard.types.ts` | Thêm `StudentGradeACountRow`; remove `CourseGradeCount` nếu không còn consumer |
| `src/features/dashboard/model/dashboard.derived.ts` | Thêm `getStudentGradeACountRows`; remove `getCourseGradeCounts` nếu không còn consumer |
| `src/features/dashboard/components/StudentGradeACountCard.vue` | Tạo card mới bằng visual contract của card cũ |
| `src/features/dashboard/components/GradesByCourseCard.vue` | Remove sau khi consumer/test đã migrate |
| `src/features/dashboard/pages/DashboardPage.vue` | Mount query thứ tư, derive rows và nối state/retry độc lập |
| `src/features/students/pages/StudentEditPage.vue` | Invalidate aggregate sau rename success |
| `src/features/grades/pages/GradesPage.vue` | Invalidate aggregate sau delete Grade success |
| `tests/unit/student-mapper-and-date.spec.ts` hoặc test mapper mới | Cover aggregate response validation |
| `tests/unit/dashboard-derived.spec.ts` | Thay course-count cases bằng ranking/bar cases mới; giữ tests attention/preview |
| `tests/unit/dashboard-components.spec.ts` | Thay component card cũ bằng card mới và cover states/a11y/CTA |
| `tests/unit/dashboard-page.spec.ts` | Chuyển từ 3 sang 4 sources, cover cache và isolation |
| Student/Grade page tests hiện có | Assert aggregate invalidation từ mutations đã triển khai |

Không đổi router, layout, Summary/Quick Actions/Data Attention/Grade Records components nếu test không phát hiện regression thực tế.

## 6. Data flow và state ownership

```text
Dashboard mount
├── Students query ───────────────→ Total Students + Student Attention
├── Courses query ────────────────→ Total Courses + Course Attention
├── Grades query ─────────────────→ Total Grades + Attention + Grade Records
└── Student Grade A Counts query ─→ rank/copy/limit/barPercent
                                      └── StudentGradeACountCard
```

```ts
interface StudentGradeACountDto {
  studentName: string
  gradeACount: number
}

interface StudentGradeACountRow {
  studentName: string
  gradeACount: number
  barPercent: number
  sourceIndex: number
}
```

| State | Owner |
| --- | --- |
| Raw aggregate response validation | Students mapper |
| Request/cancellation/cache | Students API + query option + Vue Query |
| Rank, limit, tie-break, bar percentage | Pure Dashboard derived function |
| Loading/error/empty/row rendering | `StudentGradeACountCard.vue` |
| Retry aggregate only | `DashboardPage.vue` via aggregate `refetch` |
| Other Dashboard metrics | Existing collection queries/derived functions |

## 7. Implementation sequence

### Bước 0 — Baseline và guardrails

1. Ghi nhận `git status`; không sửa file spec pack untracked hoặc thay đổi ngoài workstream.
2. Chạy `npm run test:unit` và `npm run build` để có baseline trước code change.
3. Xác nhận endpoint path qua `appEnv`/Vite proxy và shared HTTP client; không dùng raw `fetch` hoặc hard-code host.
4. Re-run usage search cho component/function/type cũ trước khi remove.

**Exit criteria:** baseline được ghi nhận; không có regression sẵn có bị quy cho revision này; scope xóa code cũ đã được xác nhận.

### Bước 1 — Students aggregate contract, mapper và API

1. Thêm type aggregate trong `student.types.ts`; có thể dùng cùng shape làm ViewModel vì không cần transform.
2. Thêm item/list mapper trong `student.mapper.ts`. List mapper reject non-array; item mapper reject object thiếu field, count không phải finite integer hoặc count âm.
3. Không coerce `"3"` thành `3`, `null` thành `0`, không loại rows trùng tên và không bỏ rows count `0`.
4. Thêm `getStudentGradeACounts(signal)` gọi endpoint chính xác và truyền response qua mapper.
5. Test valid array, empty array, duplicate names, zero, non-array, missing/wrong name, string/fraction/NaN/infinite/negative count.

**Exit criteria:** API function trả typed validated array; invalid payload trở thành normalized client error theo convention mapper hiện có.

### Bước 2 — Query key và query option

1. Thêm `studentKeys.gradeACounts: () => ['students', 'grade-a-counts'] as const`.
2. Thêm `studentQueries.gradeACounts()` với `queryOptions`, query function nhận `signal` và gọi Students API.
3. Không tạo `dashboardKeys` hay cache copy thứ hai cho cùng resource.
4. Test key không collision với `all()`/`detail()` và warm cache được Dashboard reuse.

**Exit criteria:** aggregate có một canonical cache entry dưới Students root và hỗ trợ cancellation/reuse như các query hiện tại.

### Bước 3 — Pure ranking và presentation rows

1. Map source array thành rows có `sourceIndex` trước khi sort để giữ identity/tie order trong phạm vi response.
2. Sort trên array mới theo count giảm dần, name tăng dần và sourceIndex tăng dần; không mutate input.
3. Clamp limit bằng `Math.max(0, limit)`, mặc định 5, rồi tính max từ tập visible.
4. Khi max bằng 0 trả toàn bộ `barPercent = 0`; ngược lại tính relative percent trong khoảng `0..100`.
5. Remove course aggregation type/function/test sau khi không còn consumer.

**Exit criteria:** pure tests pass cho unsorted input, ties, duplicate name + same count, hơn 5 rows, empty, all-zero, max scaling, large count và immutability.

### Bước 4 — `StudentGradeACountCard.vue`

1. Copy/refactor visual shell của card cũ mà không đổi card dimensions, grid contract hoặc bar visual language.
2. Render title `A Grades by Student` và subtitle `Number of A grades earned by each student`.
3. Props tối thiểu: `rows`, `isLoading`, `isError`; emit một event `retry` không cần source parameter vì card chỉ có một dependency.
4. State priority: error → loading → empty → rows. Error copy không lộ raw backend detail; Retry là `<button type="button">` có focus state.
5. Mỗi row hiển thị full accessible name/count; visual name dùng ellipsis và `title` khi dài; count có `sr-only` suffix `A grades`; bar track là decorative `aria-hidden="true"`.
6. Dùng key không dựa riêng vào `studentName`; giữ duplicate rows cùng xuất hiện.
7. CTA dùng `RouterLink` `/students` và đúng copy.

**Exit criteria:** component tests cover normal/duplicate/zero rows, 100/50/0 widths, loading, error, retry, empty, CTA và textual accessibility.

### Bước 5 — Compose Dashboard với query thứ tư

1. Thêm aggregate `useQuery` cạnh ba query hiện tại; request bắt đầu độc lập ngay khi page setup.
2. `studentGradeACountRows` là computed từ aggregate data hoặc `[]`; không copy query data vào local ref.
3. Replace import/template của `GradesByCourseCard` bằng card mới.
4. Aggregate pending chỉ đưa card mới vào loading; aggregate error chỉ đưa card mới vào error; retry chỉ gọi aggregate `refetch`.
5. Xóa `courseGradeErrors`, `courseGradeLoading`, `courseGradeRows` vì không còn consumer; giữ Courses/Grades logic cho Summary, Data Attention và Grade Records nguyên vẹn.
6. Xác nhận Students hoặc Grades error không che card mới khi aggregate success; aggregate error không che bất kỳ section cũ nào.

**Exit criteria:** cold mount phát bốn requests; warm cache cả bốn không request lại trong `staleTime`; state matrix mục 9 đạt yêu cầu.

### Bước 6 — Cache invalidation từ mutations

1. Student Create đang invalidate `studentKeys.root`; giữ behavior và thêm test aggregate được marked stale/refetched.
2. Student Delete đang invalidate `studentKeys.root`; giữ behavior và test row aggregate biến mất. Không cần invalidation trùng exact key.
3. Student Edit đang invalidate riêng `studentKeys.all()`; thêm `studentKeys.gradeACounts()` vào `Promise.all` sau update success để refresh name. Giữ detail cache update và Grade cache invalidation hiện tại.
4. Grade Delete thêm exact aggregate invalidation bên cạnh `gradeKeys.root` sau success.
5. Khi Grade Create/Update được implement trong feature riêng, bắt buộc dùng cùng invalidation policy cho mọi score, không chỉ A/A+/A-.
6. Course mutation chỉ invalidate aggregate nếu backend contract xác nhận thao tác đó cascade xóa Grades; không đoán cascade trong revision này.

**Exit criteria:** tests chứng minh create/update/delete Student và delete Grade hiện có không để aggregate stale; policy cho mutation chưa tồn tại được ghi rõ mà không mở rộng scope.

### Bước 7 — Verification và handoff

1. Chạy targeted mapper/derived/component/page/mutation tests, sau đó `npm run test:unit`.
2. Chạy `npm run build` để thực hiện TypeScript/Vue typecheck và production build. Repo chưa có lint script nên ghi rõ thay vì báo lint pass.
3. Manual viewport check desktop/tablet/mobile: analytics giữ 2 cột desktop, stack theo breakpoint cũ, long names/large counts không tạo page overflow.
4. Manual keyboard/a11y check cho heading, retry focus, CTA, loading/error announcements và count text.
5. Nếu backend/auth thật khả dụng, smoke test endpoint và Dashboard; nếu không, giữ live E2E là pending, không đánh dấu pass giả.
6. Soát diff loại bỏ sample names/counts, client-side score aggregation, raw fetch, duplicate cache, debug logs và obsolete course-card imports/tests.

## 8. Cache invalidation matrix

| Mutation | Hiện trạng | Required result |
| --- | --- | --- |
| Create Student | Invalidate `studentKeys.root` | Aggregate tự invalidated qua prefix |
| Update Student | Invalidate `studentKeys.all()` | Thêm exact `studentKeys.gradeACounts()` |
| Delete Student | Invalidate `studentKeys.root` | Aggregate tự invalidated qua prefix |
| Create Grade | Chưa implement | Khi implement: invalidate `gradeKeys.root` + aggregate |
| Update Grade | Chưa implement | Khi implement: invalidate `gradeKeys.root` + aggregate |
| Delete Grade | Chỉ invalidate `gradeKeys.root` | Thêm exact aggregate invalidation |
| Course delete cascade Grades | Contract chưa xác nhận trong scope | Chỉ thêm aggregate invalidation khi cascade được xác nhận |

Không thêm optimistic patch aggregate bằng student name: response không có `studentId`, duplicate names hợp lệ và server aggregate là source of truth.

## 9. UI state matrix

| Students | Courses | Grades | A Counts | Summary | A-grade card | Student Attention | Course Attention | Grade Records |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| loading | loading | loading | loading | loading | loading | loading | loading | loading |
| success | success | success | success | counts | render | render | render | render |
| error | success | success | success | Student error; others count | render | unavailable | render | render |
| success | error | success | success | Course error; others count | render | render | unavailable | render |
| success | success | error | success | Grade error; others count | render | unavailable | unavailable | unavailable |
| success | success | success | error | counts | unavailable + Retry | render | render | render |
| error | error | error | success | errors | render | unavailable | unavailable | unavailable |
| success | success | success | `[]` | counts | `No students available.` | render | render | render |
| empty | empty | empty | empty | `0 / 0 / 0` | empty | `0` | `0` | empty |
| success | success | empty | all-zero rows | counts | render names + `0` | all students | all courses | empty |

`A Counts = []` khác với danh sách có records `gradeACount = 0`; chỉ trường hợp đầu dùng empty state.

## 10. Test plan

### Unit mapper/API boundary

- Valid/empty aggregate arrays map đúng; duplicate names và zero được giữ.
- Non-array, missing/wrong `studentName`, string/fraction/negative/non-finite `gradeACount` bị reject.
- API dùng đúng `/api/v1/students/grade-a-counts` và chuyển `AbortSignal` qua shared HTTP client.

### Unit derived

- Count giảm dần; tie name tăng dần; equal name/count giữ source order.
- Top 5 sau ranking; limit 0/âm trả empty; input không bị mutate.
- Max visible có bar `100`; tỷ lệ trung gian đúng; all-zero không NaN/Infinity.
- Existing Students/Courses without grades và Grade preview tests tiếp tục pass.

### Component

- Title/subtitle, names, integer counts, widths và accessible `A grades` text render đúng.
- Duplicate names đều visible; zero rows không bị coi là empty.
- Loading, error, Retry emit, empty copy và CTA `/students` đúng semantic.
- Long name có truncate visual nhưng full text vẫn accessible; large count không overflow.

### Dashboard page/integration

- Cold mount start đúng 4 sources và endpoint path qua configured base URL.
- All success render full Dashboard; warm cache 4 keys không duplicate request.
- Students fail hoặc Grades fail nhưng aggregate success: card vẫn render.
- Aggregate fail: chỉ card mới error; không fallback từ Grades.
- Retry card chỉ gọi aggregate; `[]` và all-zero có state khác nhau.
- Existing Summary/Quick Actions/Data Attention/Grade Records assertions giữ nguyên.

### Mutation integration

- Create/Delete Student với root invalidation làm aggregate stale/refetch.
- Rename Student invalidates exact aggregate key và refresh name.
- Delete Grade invalidates Grade root và aggregate key.
- Grade Create/Update tests được bổ sung khi các mutation đó thực sự tồn tại.

### Quality commands

```text
npm run test:unit
npm run build
```

## 11. Rủi ro và phương án giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
| --- | --- | --- |
| Endpoint path nhìn như `/api/api/v1/...` ở browser | Dễ “sửa” sai thành `/v1/...` | Test cả adapter path và proxy contract; dùng path canonical từ spec |
| Sort trực tiếp query data | Cache bị mutate, order ảnh hưởng consumer khác | Map/copy trước sort; immutability test |
| Duplicate names làm collision key hoặc merge | Mất row/sai count | Giữ `sourceIndex`, không group theo name, component test duplicates |
| All-zero bị coi là empty | Mất danh sách students hợp lệ | Empty dựa trên `rows.length`, không dựa trên max/count |
| Student rename/Grade delete để stale aggregate | Dashboard sai sau mutation | Explicit invalidation và mutation integration tests |
| Dùng root invalidation quá rộng ở Edit | Refetch detail vừa cập nhật không cần thiết | Giữ invalidation exact cho `all()` và `gradeACounts()` |
| Long Unicode names/large counts phá grid | Horizontal overflow mobile | `min-width: 0`, ellipsis/title, flexible bar column, tabular count |
| Xóa card/derived cũ khi có consumer mới phát sinh | Build regression | `rg` usage check ngay trước remove; full test/build |
| Grade Create/Update chưa tồn tại | Không thể chứng minh toàn bộ mutation matrix live | Ghi contract bắt buộc; chỉ test flows đang tồn tại, không đánh dấu giả |

## 12. Rollback strategy

- Tách thay đổi theo boundary: Students aggregate contract/query, Dashboard derived/component/page, mutation invalidation và tests để dễ review/revert.
- Nếu aggregate endpoint lỗi production, card phải hiển thị unavailable + Retry trong khi phần còn lại vẫn hoạt động; không fallback về `Grades by Course` bằng cách tự aggregate Grades.
- Nếu revision cần rollback toàn bộ, revert component/page/query consumption cùng tests; không để orphan query key/API hoặc hai analytics cards cùng tồn tại.
- Không xóa spec pack hoặc lịch sử kế hoạch cũ khỏi Git; revision này thay target implementation canonical của Dashboard.

## 13. Definition of Done checks

- [x] `Grades by Course` không còn trong target Dashboard và code obsolete không còn consumer.
- [x] `A Grades by Student` nằm đúng vị trí/style/kích thước card cũ theo source contract.
- [x] Aggregate API được tích hợp qua Students domain với shared auth/error behavior.
- [x] Runtime mapper reject mọi response shape/count không hợp lệ.
- [x] Query key canonical là `studentKeys.gradeACounts()`; không có Dashboard cache duplicate.
- [x] Dashboard mount 4 queries độc lập và reuse warm cache.
- [x] Top 5, count/name/source tie-break, duplicate names, zero và bars đúng; input cache không mutate.
- [x] Empty, loading, error và Retry của aggregate độc lập với ba sources cũ.
- [x] CTA `/students`, heading, text count, focus và decorative bar đạt automated accessibility contract.
- [x] Student Create/Update/Delete và Grade Delete hiện có không để aggregate stale.
- [ ] Grade Create/Update áp dụng invalidation contract khi feature đó được triển khai.
- [x] Summary Cards, Quick Actions, Data Attention và Grade Records không regression trong automated tests.
- [ ] Desktop/tablet/mobile không overflow hoặc đổi layout ngoài content intended.
- [x] Targeted và full unit/component/integration tests pass.
- [x] `npm run build` pass; repo không có lint script.
- [ ] Live E2E/manual checks pass hoặc dependency môi trường được ghi rõ là pending.

## 14. Handoff notes

Các cải tiến sau không block revision này: thêm `studentId` vào aggregate response để có stable identity/navigation, full ranking page, server-side sort/limit, tooltip giải thích A group và policy chính thức cho Course delete cascade. Không tự triển khai chúng trong workstream hiện tại.

## 15. Implementation result — 2026-09-23

- Đã thêm aggregate types, strict runtime mapper, API adapter, query key và query option dưới Students domain.
- Đã thay `GradesByCourseCard.vue` bằng `StudentGradeACountCard.vue`; Dashboard dùng query thứ tư độc lập, top 5 deterministic và không fallback sang Grades khi aggregate lỗi.
- Đã remove course-count derived logic/type không còn consumer và giữ nguyên Summary, Quick Actions, Data Attention, Grade Records cùng analytics grid hiện có.
- Đã nối aggregate invalidation cho Student Create/Update/Delete và Grade Delete. Grade Create/Update chưa tồn tại nên chỉ giữ policy bắt buộc cho workstream tương lai.
- Targeted verification: 8 test files, 54 tests passed.
- Full verification: 16 test files, 102 tests passed.
- `npm run build`: passed, gồm Vue/TypeScript typecheck và Vite production build.
- Repo không có lint hoặc Playwright script. Live backend E2E và manual desktop/tablet/mobile review chưa chạy, vì vậy các checklist tương ứng vẫn để pending.
