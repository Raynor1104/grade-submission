# Dashboard — Implementation Plan

**Phụ trách:** Frontend team  
**Trạng thái:** Implemented — live E2E, visual viewport và domain mutation integration pending  
**Cập nhật lần cuối:** 2026-09-15

## 1. Mục tiêu và phạm vi

Kế hoạch này thay placeholder tại `/dashboard` bằng Dashboard hoàn chỉnh theo `dashboard.spec-pack.md` và target design `dashboard.png`. Dashboard lấy dữ liệu thật từ Students, Courses và Grades, tính các metric ở client, giữ từng nguồn dữ liệu độc lập khi loading/error và reuse TanStack Vue Query cache của domain.

### In scope

- Ba summary cards: Total Students, Total Courses, Total Grades.
- Quick Actions cho Add Student, Add Course và trạng thái an toàn của Submit Grade.
- Grades by Course, tối đa 5 course, sort deterministic và có count dạng text.
- Data Attention: Students without grades và Courses without grades.
- Grade Records preview, tối đa 5 record, giữ `score` là string.
- Ba protected GET request chạy độc lập/song song qua shared HTTP client và domain query keys.
- Loading, empty, partial error, all-error và retry không reload browser.
- Cache reuse/invalidation contract với Students, Courses và Grades.
- Responsive desktop/tablet/mobile và accessibility cho headings, links, loading/error, bars và table.
- Unit, component và integration tests map theo acceptance criteria của spec pack.

### Out of scope

- Activity/audit feed, trend theo thời gian, average score hoặc server analytics endpoint.
- Parse/sort/tính toán `score` như số.
- Backend changes hoặc endpoint dashboard summary mới.
- Implement form Create Student, Create Course hoặc Submit Grade trong feature Dashboard.
- Dedicated Data Attention page/filter khi product chưa có route contract.
- Gọi Grade Records là recent/latest khi Grade DTO không có timestamp.

## 2. Hiện trạng và baseline

| Hạng mục | Hiện trạng source | Hành động trong kế hoạch |
| --- | --- | --- |
| Dashboard page | `DashboardPage.vue` chỉ có heading và text `Dashboard content` | Thay bằng composition đầy đủ |
| Router/layout | `/dashboard` đã nằm trong protected `MainLayout`; `/` redirect theo auth state | Giữ topology hiện tại |
| Auth/401 | Shared HTTP client attach Bearer; app-level auth-expired handler đã được nối | Dashboard không tạo auth flow riêng |
| Vue Query | Package đã cài, `QueryClient` đã mount, stale time 30 giây | Dùng ba domain queries độc lập |
| Query keys | Có `studentKeys`, `gradeKeys`; chưa có `courseKeys`; có `dashboardKeys` chưa được dùng | Thêm `courseKeys`; không dùng dashboard summary key |
| Student data | Có typed API + mapper cho `GET /student/all`, nhưng Students page đang dùng mock local | Tạo reusable Student query options; domain migration là dependency của full cache reuse |
| Course data | Course page/type đang dùng mock; chưa có DTO mapper/API/query | Bổ sung domain data boundary |
| Grade data | Grade page/type đang dùng mock; chưa có DTO mapper/API/query | Bổ sung domain data boundary, giữ score string |
| Mutations | Student mock delete; Course/Grade chưa có live mutation flow | Định nghĩa invalidation contract; chỉ đánh dấu verified khi domain mutations dùng contract này |
| Quick Action routes | `/students/new`, `/courses/new` có; `/grades/new` chưa có | Hai action đầu active; Submit Grade disabled + giải thích |
| Attention details | Chưa có route/filter contract | Không render `View details` active |
| Tests | Vitest + Vue Test Utils có; chưa có Dashboard tests hoặc Playwright harness | Thêm unit/component/integration; E2E để dependency riêng |

Repository hiện có các thay đổi auth chưa commit. Khi implement phải chỉ sửa file thuộc workstream Dashboard/domain liên quan và không format hoặc ghi đè các thay đổi đó.

## 3. Quyết định implementation

1. Dùng `useQuery` ba lần với query options thuộc Students/Courses/Grades; không dùng `Promise.all` và không tạo một query tổng hợp vì cách đó làm mất retry/state độc lập.
2. Query keys canonical trong code là `studentKeys.all()`, `courseKeys.all()` và `gradeKeys.all()`. `dashboardKeys.summary()` không được dùng; có thể xóa nếu vẫn không có consumer khi bắt đầu implementation.
3. API URL luôn đi qua `httpClient` và `appEnv.apiBaseUrl`; source không hard-code `http://localhost:9090` hay `/api/v1`.
4. API adapter và mapper thuộc domain tương ứng. Dashboard chỉ consume view models và chứa pure derived functions.
5. Course view model canonical dùng `id`, `code`, `subject`, `description`; nếu Course Management cần tên cũ `courseCode/courseName`, migration phải thực hiện tại domain boundary, không đặt adapter riêng trong Dashboard.
6. Grade mapper yêu cầu `id`, `score`, nested `student.id/name` và `course.id/code`; `subject` được giữ nếu response hợp lệ. `score` không trim/parse thành number cho analytics.
7. Grades by Course khởi tạo từ Course collection để course có 0 grade vẫn xuất hiện khi còn slot; sort `gradeCount` giảm dần, tie-break `courseCode` tăng dần, lấy 5 row đầu.
8. Orphan Grade vẫn được tính vào Total Grades và có thể xuất hiện trong preview từ nested payload, nhưng không tạo Student/Course giả trong parent totals hoặc attention metrics.
9. Grade preview giữ thứ tự canonical của Grade query và dùng `slice(0, 5)`; không tự sort theo ID hoặc score.
10. `Submit Grade` render disabled với mô tả “Unavailable until grade submission is implemented” cho đến khi `/grades/new` tồn tại. Không dùng click handler log hoặc dead link.
11. Data Attention không render CTA `View details` ở phase này. Từng attention item chỉ trở thành link khi có filtered destination được product chốt.
12. UI copy theo spec dùng English; tài liệu và code comments có thể dùng quy ước hiện tại của repo.
13. Retry theo source: lỗi Students retry Students; lỗi Courses retry Courses; lỗi Grades retry Grades. Section có nhiều dependency có thể đưa ra các nút retry cho đúng source lỗi, không refetch source đã success nếu không cần.
14. Partial query data không được copy sang local state. Derived values là `computed`/pure functions từ query results để cache update tự phản ánh lên UI.

## 4. AC mapping

| Workstream | AC được đáp ứng | Deliverable chính |
| --- | --- | --- |
| Route/page composition | 001, 027 | Dashboard shell và các section thật, không activity giả |
| Domain API/query boundaries | 002–003, 031–032 | Ba query độc lập, shared keys, Bearer/401 dùng chung |
| Summary cards | 004–011 | Count thật, loading/error/retry/zero độc lập |
| Quick Actions | 012–014, 036 | Hai route active, Submit Grade disabled, không dead-link |
| Grades by Course | 015–018, 035 | Pure aggregation, top 5, deterministic order, accessible count |
| Data Attention | 019–021 | Dependency-aware metrics, không suy ra 0 khi lỗi |
| Grade Records | 022–026 | Tối đa 5 rows, score string, CTA `/grades` |
| Mutation freshness | 028–030 | Domain invalidation matrix và integration coverage |
| Responsive/a11y | 033–035 | Adaptive grid/table scroll, semantic controls/status |

## 5. Backend và client dependencies

### Backend contract bắt buộc

```text
GET /student/all  -> StudentDto[]
GET /course/all   -> CourseDto[]
GET /grade/all    -> GradeDto[]
Authorization: Bearer <jwt>
```

Không endpoint nào được xem là optional cho full Dashboard, nhưng failure của một endpoint không được collapse hai nguồn còn lại. Non-array hoặc record thiếu field bắt buộc phải trở thành normalized client error của query tương ứng, không được đổi thành mảng rỗng.

### Dependencies chưa hoàn tất trong source

| Dependency | Ảnh hưởng | Cách xử lý |
| --- | --- | --- |
| Courses/Grades chưa có live API + mapper | Không thể lấy dữ liệu thật cho hai source | Thực hiện Bước 1 trước UI |
| Domain list pages đang dùng mock | Chưa thể chứng minh Dashboard reuse cache với list pages | Tạo shared query options ngay; migration runtime của domain pages cần owner xác nhận vì Student plan có mock-data override |
| Domain mutations chưa dùng Vue Query | AC 028–030 chưa thể E2E verify | Định nghĩa và test invalidation helper/contract; hoàn tất verification khi mutation live |
| `/grades/new` chưa tồn tại | Submit Grade có thể thành dead link | Disabled cho đến khi Grade Create feature cung cấp route |
| Chưa có Playwright dependency/script | Không chạy được E2E-DASH-SP-022…025 trong repo | Không báo E2E pass; theo dõi như verification dependency |

Core Dashboard vẫn có thể implement và test bằng các live-query adapters/mocked network responses. Tuy nhiên AC 028–031 chỉ được đánh dấu hoàn tất toàn phần sau khi domain pages/mutations rời mock mode hoặc chính thức consume cùng query contracts.

## 6. Data contracts và derivation

### Domain view models

```ts
interface StudentViewModel {
  id: number
  name: string
  birthDate: string
}

interface CourseViewModel {
  id: number
  code: string
  subject: string
  description: string
}

interface GradeViewModel {
  id: number
  score: string
  student: { id: number; name: string }
  course: { id: number; code: string; subject?: string }
}
```

### Pure Dashboard outputs

```ts
interface CourseGradeCount {
  courseId: number
  courseCode: string
  courseName: string
  gradeCount: number
  barPercent: number
}

interface DashboardAttention {
  studentsWithoutGrades: number
  coursesWithoutGrades: number
}
```

Các pure functions dự kiến:

```text
getDashboardSummary(students, courses, grades)
getCourseGradeCounts(courses, grades, limit = 5)
getStudentsWithoutGrades(students, grades)
getCoursesWithoutGrades(courses, grades)
getGradePreview(grades, limit = 5)
```

`barPercent` trả `0` khi max count bằng `0`; các giá trị khác nằm trong `0..100`. Function không mutate input, không assume ID liên tiếp và không merge entity bằng code/name.

## 7. Files/modules bị ảnh hưởng

### Tạo mới

```text
src/features/
├── courses/
│   ├── api/
│   │   ├── course.api.ts
│   │   └── course.queries.ts
│   └── model/
│       └── course.mapper.ts
├── grades/
│   ├── api/
│   │   ├── grade.api.ts
│   │   └── grade.queries.ts
│   └── model/
│       └── grade.mapper.ts
├── students/
│   └── api/
│       └── student.queries.ts
└── dashboard/
    ├── components/
    │   ├── DashboardSummaryCard.vue
    │   ├── DashboardQuickActions.vue
    │   ├── GradesByCourseCard.vue
    │   ├── DataAttentionCard.vue
    │   └── DashboardGradeRecords.vue
    └── model/
        ├── dashboard.types.ts
        └── dashboard.derived.ts

tests/unit/
├── course-and-grade-mappers.spec.ts
├── dashboard-derived.spec.ts
├── dashboard-components.spec.ts
└── dashboard-page.spec.ts
```

Tên test có thể tách nhỏ nếu file vượt phạm vi dễ review, nhưng coverage mapping phải giữ nguyên.

### Chỉnh sửa hiện có

| File | Thay đổi dự kiến |
| --- | --- |
| `src/core/api/query-keys.ts` | Thêm `courseKeys`; chuẩn hóa all keys; bỏ/không dùng `dashboardKeys` |
| `src/features/courses/model/course.types.ts` | Bổ sung DTO/full live-data fields và canonical naming |
| `src/features/grades/model/grade.types.ts` | Bổ sung DTO/nested contract mà không đổi score khỏi string |
| `src/features/dashboard/pages/DashboardPage.vue` | Compose queries, state dependencies và target layout |
| `src/styles/_tokens.scss` | Chỉ thêm semantic warning/info tokens còn thiếu; không hard-code sample data |
| `tests/setup.ts` | Thêm reset QueryClient/router/mocks dùng chung nếu test Dashboard cần |

### Chỉ sửa khi dependency được duyệt

| File/area | Điều kiện |
| --- | --- |
| `StudentsPage.vue`, `CoursesPage.vue`, `GradesPage.vue` | Chuyển list khỏi mock sang cùng query options để đạt cache reuse runtime |
| Student/Course/Grade mutation files | Khi live create/update/delete flow được implement |
| `src/app/router/routes.ts` | Grade Create feature thực sự có page `/grades/new` |

## 8. Implementation sequence

```text
Domain DTO/mappers/API
          ↓
Shared query keys/options
          ↓
Pure dashboard derivation
          ↓
Presentational components
          ↓
Page query composition + state matrix
          ↓
Responsive/a11y hardening
          ↓
Invalidation integration
          ↓
Automated + live verification
```

### Bước 0 — Baseline và guardrails

1. Ghi nhận worktree hiện tại và không chạm các auth changes/unrelated files.
2. Chạy test/build baseline trước implementation; lưu số test thực tế, không đưa artifact build vào commit nếu repo không track.
3. Xác nhận protected API hoạt động qua shared `httpClient`, `/api` dev proxy và centralized 401 handler.
4. Chốt các decision an toàn ở mục 3: Submit Grade disabled, bỏ Attention dead-link, Grade preview giữ query order.

**Exit criteria:** baseline rõ; không có open question chặn layout/data core; dependency chưa sẵn sàng được đánh dấu thay vì giả lập production data.

### Bước 1 — Hoàn thiện domain data boundaries

1. Giữ `getStudents()` và Student mapper hiện có làm reference contract.
2. Tạo Course DTO mapper và `getCourses(signal)` gọi đúng `/course/all`.
3. Tạo Grade DTO mapper và `getGrades(signal)` gọi đúng `/grade/all`.
4. Validate array và required nested fields tại mapper; throw normalized client error thay vì filter im lặng hoặc tạo fallback label.
5. Giữ payload values cần hiển thị; không parse `score`; không assume ID sequential.
6. Thêm mapper tests cho success, non-array, missing nested IDs/names/code và score `A`/`B+`/`8.5`/`Pass`.

**Exit criteria:** ba fetcher trả typed arrays; malformed source chỉ làm query tương ứng error; endpoint/base URL không bị duplicate trong Dashboard.

### Bước 2 — Chuẩn hóa shared queries và cache keys

1. Thêm `courseKeys.root/all()` đồng nhất với Students/Grades.
2. Tạo `studentQueries.all()`, `courseQueries.all()`, `gradeQueries.all()` bằng TanStack `queryOptions`; mỗi queryFn chuyển `signal` vào fetcher.
3. Không tạo `dashboardQueries.summary()` chứa copy của ba collection.
4. Dashboard gọi ba `useQuery` riêng để mount song song và reuse fresh cache theo QueryClient policy.
5. Document invalidation: mutation invalidate domain root/all key liên quan; parent deletion có cascade phải invalidate Grades sau response success.

**Exit criteria:** inspect QueryClient cho thấy đúng ba collection cache entries; remount trong `staleTime` không tạo request duplicate; refetch một source không reset source khác.

### Bước 3 — Pure derived model

1. Implement summary lengths chỉ khi page đã có success data.
2. Implement Course grade-count map theo `course.id`, include course 0 grade, deterministic sort và limit 5.
3. Tính max/bar percentage an toàn khi mọi count bằng 0.
4. Implement attention metrics bằng `Set<number>` của Grade nested IDs.
5. Implement Grade preview `slice(0, 5)` giữ nguyên object order và score string.
6. Unit test datasets rỗng, tie, hơn 5 rows, large/non-sequential IDs, orphan grades và input immutability.

**Exit criteria:** UT-DASH-SP-001…009 và edge cases thuần data pass, không cần mount Vue.

### Bước 4 — Presentational components

1. `DashboardSummaryCard`: icon/label/count; mutually exclusive loading, error + Retry và loaded count kể cả `0`.
2. `DashboardQuickActions`: semantic `RouterLink` cho Student/Course; disabled non-link cho Submit Grade với accessible explanation.
3. `GradesByCourseCard`: heading/supporting text, row code, textual count, decorative relative bar và `/grades` CTA.
4. `DataAttentionCard`: hai metric độc lập theo dependency, icon + label + description + value; không có active `View details`.
5. `DashboardGradeRecords`: semantic table, 3 headers, max 5 rows, empty/error/loading state và `/grades` CTA.
6. Dùng `BaseCard` khi visual contract phù hợp; không làm shared component phức tạp chỉ cho Dashboard.
7. Dùng icon từ `@lucide/vue`; icon trang trí có `aria-hidden="true"`.

**Exit criteria:** component tests xác nhận semantic roles/names, disabled action không navigate, retry emit đúng source và bars luôn có count text.

### Bước 5 — Compose `DashboardPage`

1. Render `PageHeader title="Dashboard"` và shell ngay, không chờ request.
2. Start Students/Courses/Grades queries độc lập trong setup.
3. Map từng summary card trực tiếp tới query tương ứng.
4. Chỉ derive/render data section khi đủ dependencies:
   - Grades by Course = Courses + Grades;
   - Student Attention = Students + Grades;
   - Course Attention = Courses + Grades;
   - Grade Records = Grades.
5. Khi dependency loading, hiển thị loading chứ không `0`; khi error, hiển thị unavailable + đúng retry control.
6. Khi all error, vẫn giữ heading và Quick Actions; không blank page.
7. Không watcher copy query arrays vào refs; dùng computed/pure derivation.

**Exit criteria:** toàn bộ state matrix ở mục 9 render đúng; một failure không che dữ liệu success của source khác.

### Bước 6 — Responsive và accessibility hardening

1. Desktop: 3 summary cards; Quick Actions ngang; analytics 2 cột; records full width.
2. Tablet/mobile: adaptive grids stack; actions không overflow; analytics về 1 cột khi thiếu width.
3. Bọc table trong container `overflow-x-auto`; không làm body/page horizontal overflow.
4. Giữ đúng một page `h1`, section heading hierarchy hợp lý và DOM/tab order theo reading order.
5. Loading dùng status text/skeleton accessible; error có text; Retry là button native; navigation là link native.
6. Focus ring rõ; disabled Submit Grade không nằm trong tab order như link giả nhưng explanation vẫn được screen reader đọc.
7. Bar dùng `aria-hidden` nếu count/code text đã đủ; attention không chỉ dùng màu để truyền nghĩa.
8. Test long student/course/score/count values bằng wrap/truncate có title/accessible text khi cần.

**Exit criteria:** không page overflow ở mobile; keyboard-only dùng được mọi control active; thông tin không phụ thuộc icon, màu hoặc độ dài bar.

### Bước 7 — Cache invalidation integration

1. Khi live domain mutation tồn tại, invalidate theo matrix:

| Mutation | Keys cần invalidate |
| --- | --- |
| Create Student | `studentKeys.root` |
| Delete Student | `studentKeys.root`, `gradeKeys.root` nếu cascade có thể xảy ra |
| Create Course | `courseKeys.root` |
| Delete Course | `courseKeys.root`, `gradeKeys.root` nếu cascade có thể xảy ra |
| Create/Update/Delete Grade | `gradeKeys.root` |

2. Không invalidate dashboard key vì derived data đọc trực tiếp từ domain caches.
3. Với optimistic/cache update, vẫn giữ server response là source of truth; rollback mutation failure theo convention domain.
4. Integration test create/delete Grade làm attention và group count đổi; update score chỉ đổi preview content/count không đổi.
5. Nếu domain vẫn ở mock mode, đánh dấu bước này pending và không thêm bridge đồng bộ mock vào Dashboard.

**Exit criteria:** chuyển từ domain page về Dashboard không cần hard reload và hiển thị collection mới; failure không để cache optimistic sai.

### Bước 8 — Verification và handoff

1. Chạy `npm run test:unit` và `npm run build`.
2. Test component/integration với QueryClient mới mỗi test, retry off và mock network có kiểm soát.
3. Chạy live/manual hoặc E2E khi backend + Playwright harness sẵn sàng: counts bằng đúng response lengths, partial 500, empty arrays và mobile viewport.
4. Review source để loại sample counts/rows, fake activities, raw `fetch`, numeric score parsing, dead links, debug logs và `.only`.
5. Cập nhật checklist/status theo kết quả thật; không đánh dấu cache mutation/E2E pass khi dependency còn mock/chưa có harness.

## 9. UI state và dependency matrix

| Students | Courses | Grades | Summary | Grades by Course | Student Attention | Course Attention | Grade Records |
| --- | --- | --- | --- | --- | --- | --- | --- |
| loading | loading | loading | 3 loading cards | loading | loading | loading | loading |
| success | success | success | 3 counts | render | render | render | render |
| error | success | success | Student error; 2 counts | render | unavailable + retry Students | render | render |
| success | error | success | Course error; 2 counts | unavailable + retry Courses | render | unavailable + retry Courses | render |
| success | success | error | Grade error; 2 counts | unavailable + retry Grades | unavailable + retry Grades | unavailable + retry Grades | unavailable + retry Grades |
| empty | empty | empty | `0 / 0 / 0` | informative empty/zero state | `0` | `0` | `No grade records available.` |

Nếu Grades success rỗng nhưng Students/Courses có dữ liệu, attention bằng total parent; Grades by Course có tối đa 5 course count 0; preview empty. Failed collection tuyệt đối không được normalize thành trường hợp này.

## 10. Test plan

### Unit

| Test | Coverage |
| --- | --- |
| Student/Course/Grade mapper accept valid contracts và reject malformed collection/record | AC 002, 021–023 |
| Summary trả đúng 3 lengths và arrays rỗng trả 0 | AC 004–007 |
| Group theo course ID, include zero, count giảm dần, code tie-break, limit 5 | AC 015–018 |
| Max count 0 trả bar 0, không NaN/Infinity | AC 018 |
| Attention tính bằng parent IDs không xuất hiện trong Grades | AC 019–020 |
| Orphan Grade không làm tăng parent totals nhưng vẫn nằm trong grade total/preview | AC 004–006, 022 |
| Preview giữ order, limit 5 và score string nguyên vẹn | AC 022–025 |

### Component

| Test | Coverage |
| --- | --- |
| Summary card phân biệt loading/error/loaded zero và Retry emit | AC 007, 009–011 |
| Quick Actions navigate đúng hai route; Submit Grade không là active link | AC 012–014 |
| Course rows có code/count text và bar chỉ bổ trợ | AC 015–018, 035 |
| Attention item render value/unavailable độc lập; không có dead View details | AC 019–021, 036 |
| Grade table headers/rows/empty/CTA đúng | AC 022–026 |

### Integration/page

| Scenario | Expected | AC refs |
| --- | --- | --- |
| Ba deferred requests khi mount | Cùng start, không block lẫn nhau | 002–003 |
| All success | Full Dashboard dùng dữ liệu response thật | 001–008, 015–026 |
| All empty | 0/zero/empty states truthful | 007, 011 |
| Students error only | Student card/metric lỗi; Course/Grade sections usable | 009–010, 021 |
| Courses error only | Course-dependent sections lỗi; Student/Grade usable | 009–010, 021 |
| Grades error only | Grade-derived sections lỗi; Student/Course totals usable | 009–010, 021 |
| Retry một source recover | Chỉ source đó refetch và dependent sections recover | 010 |
| Fresh cache rồi remount | Không duplicate network request | 031 |
| Protected GET trả 401 | Global auth handler xử lý, Dashboard không tự retry auth | 032 |
| Domain invalidation | Derived UI đổi từ shared cache, không browser refresh | 028–030 |

### E2E/manual dependency

- Login → Dashboard: displayed counts bằng độ dài ba API arrays.
- Intercept riêng từng endpoint 500: chỉ dependent panels error và retry recover.
- Ba arrays rỗng: counts 0, attention 0 và preview empty.
- Create/delete entity/grade: quay Dashboard thấy dữ liệu mới mà không refresh browser.
- Viewport mobile: không page overflow; table scroll nội bộ; mọi action active usable.
- Không chạy/đánh dấu pass cho các case này cho đến khi repo có Playwright harness và backend/test data phù hợp.

### Commands dự kiến

```text
npm run test:unit
npm run build
```

Repo hiện không có lint hoặc E2E script; không báo các quality gate đó pass nếu script chưa tồn tại.

## 11. Rủi ro và phương án giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
| --- | --- | --- |
| Dashboard dùng API thật trong khi domain lists dùng mock | Count/list không nhất quán, cache reuse chưa thực | Tách shared query contracts; yêu cầu migration domain được duyệt; không sync mock thủ công |
| Course type rename ảnh hưởng Course Management | Type/build regression | Migrate tại domain boundary hoặc hỗ trợ adapter chuyển tiếp có test; chạy full build |
| Invalid Grade nested data làm cả query fail | Grade-derived sections unavailable | Strict mapper + safe normalized error + retry; không invent label |
| Một section retry nhiều dependencies sai source | Request thừa hoặc state khó hiểu | Retry button gắn source lỗi cụ thể; test call counts |
| Parent delete cascade contract chưa ổn định | Grade cache và metrics stale | Invalidate Grades sau parent delete success cho đến khi backend contract chắc chắn |
| Long labels/counts phá layout | Overflow mobile/table | Min-width/overflow wrapper/wrapping và responsive tests |
| Bar animation/visual che accessibility | Screen reader thiếu count | Numeric text là source of truth; bar decorative |
| Query defaults retry 1 làm test/error UI chậm | Flaky component tests | QueryClient riêng trong test với retry false; production giữ policy chung |

## 12. Rollback strategy

- Chia commit theo domain data boundary, derived model, components/page và tests để revert độc lập.
- Nếu Course/Grade live endpoint bị chặn, không quay Dashboard về sample counts/rows; giữ error states hoặc feature branch chưa merge.
- Nếu một analytics component lỗi production, có thể tạm ẩn riêng section đó trong khi giữ summary/Quick Actions/Grade Records; không collapse toàn page.
- Nếu domain list migration gây regression, revert migration nhưng giữ query option modules và đánh dấu cache-reuse AC pending; không tạo Dashboard cache copy.
- Submit Grade chỉ được enable trong commit cùng Grade Create route/page; rollback route phải rollback trạng thái action về disabled.

## 13. Definition of Done checks

- [x] `Dashboard content` được thay bằng target composition trong `MainLayout`.
- [x] Ba summary cards lấy đúng dữ liệu thật, không có `120/18/450` hard-code.
- [x] Student/Course/Grade adapters validate contract và giữ Grade score là string.
- [x] Ba queries mount độc lập, dùng shared domain keys/options và reuse fresh cache.
- [x] Loading khác loaded `0`; partial/all errors giữ page usable và có retry đúng source.
- [x] Quick Actions Student/Course hoạt động; Submit Grade không là dead link.
- [x] Grades by Course group/sort/limit/bar đúng và luôn có count text.
- [x] Attention metrics đúng dependency và không render `0` giả khi query lỗi.
- [x] Grade Records render tối đa 5 rows, giữ query order và không gọi recent/latest.
- [x] Không có fake Recent Activities hoặc Attention details route giả.
- [ ] Mutation invalidation cập nhật Dashboard không cần browser refresh, hoặc dependency mock mode được ghi pending rõ.
- [ ] Desktop/tablet/mobile không page overflow và table scroll nội bộ khi cần.
- [x] Headings, status/error, links/buttons, focus và icon/bar semantics đạt automated accessibility contract.
- [x] Unit/component/integration tests map đủ AC chính và pass.
- [ ] Live E2E critical scenarios pass, hoặc backend/Playwright/domain dependency được ghi chưa verify rõ ràng.
- [x] `npm run build` và mọi script quality hiện hữu pass.
- [x] Không có raw `fetch`, duplicate cache, sample production data, numeric score parsing, debug log hoặc `.only`.

## 14. Handoff decisions cần theo dõi

Các behavior sau đã có safe default để Dashboard core không bị chặn, nhưng cần owner xác nhận trước khi mở rộng capability:

1. Khi Grade Create feature hoàn tất, enable `/grades/new` hay dùng modal/inline form.
2. Attention items có cần link tới filtered Students/Courses view hay dedicated page.
3. Khi domain định nghĩa canonical Grade ordering, Dashboard có đổi preview theo ordering đó hay tiếp tục raw query order.
4. Việc migrate ba domain pages khỏi mock sang live query có nằm cùng Dashboard delivery hay là prerequisite delivery riêng.

## 15. Implementation result — 2026-09-15

Dashboard core đã được triển khai với ba live domain queries, strict Course/Grade mappers, pure client aggregation, năm presentational components và responsive layout. Verification local hiện tại:

```text
npm run test:unit  -> 12 files, 67 tests passed
npm run build      -> passed
```

Các dependency còn lại không được giả lập trong implementation:

- Students/Courses/Grades list pages vẫn dùng mock theo scope hiện tại, nên mutation-to-Dashboard invalidation chưa có live flow để tích hợp.
- `/grades/new` chưa tồn tại, vì vậy Submit Grade được render disabled thay vì dead link.
- Repo chưa có Playwright harness; live E2E và visual viewport review chưa được đánh dấu pass.
