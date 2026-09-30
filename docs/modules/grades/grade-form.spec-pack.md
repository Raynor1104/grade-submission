# Grade Form — Spec Pack

**Phụ trách:** Frontend team  
**Trạng thái:** Ready for implementation — backend-supported, FE form routes/pages chưa implement  
**Cập nhật lần cuối:** 2026-09-29

## 1. Bối cảnh

**Grade Form** là UI dùng chung cho hai nghiệp vụ:

1. **Submit New Grade** — tạo Grade cho một cặp Student + Course.
2. **Update Grade** — cập nhật `score` của Grade đã tồn tại mà không thay đổi Student/Course.

Spec pack này dựa trên:

- design `docs/ui/web/grade_submission/screens/design/grade_form.png`;
- screen spec `docs/ui/web/grade_submission/screens/grades/grade_form.md`;
- `docs/modules/grades/spec.md`;
- `docs/architecture/grade_journey.md`;
- `docs/e2e/grades.md`;
- router, HTTP client, Grade API/query/model và Student/Course query hiện tại trong source.

Nguyên tắc kiến trúc chính:

- Chỉ có **một `GradeForm.vue` dùng chung** cho Create và Update.
- Create cho phép chọn Student + Course.
- Update khóa Student + Course và chỉ cho sửa `score`.
- `score` luôn là **string tự do**; không parse number, không round, không áp dụng allowlist letter grade.
- Cặp `(studentId, courseId)` là identity nghiệp vụ của Grade trong API.
- Không đổi Student/Course ngầm trong Update; muốn đổi pair phải xóa Grade cũ và tạo Grade mới bằng hành động rõ ràng của người dùng.

---

## 2. Source và boundary

### 2.1 Current routes

Source hiện có:

```text
/grades
```

Router hiện **chưa có** form routes.

### 2.2 Target routes

Canonical routes cho Grade Form:

```text
Create: /grades/new
Update: /grades/:studentId/:courseId/edit
```

Cả hai route nằm trong protected `MainLayout` và yêu cầu authenticated session.

### 2.3 Current implementation

Current Grade feature đã có:

- `GradesPage.vue`;
- Grade list;
- Student/Course filters;
- client-side pagination;
- delete confirmation + `DELETE` integration;
- `GET /grade/all`;
- Student/Course collection queries để populate filters;
- shared `DeleteConfirmDialog`;
- Bearer token/401 handling ở `httpClient`.

Nhưng form flow hiện chưa hoàn chỉnh:

- `GradesPage.handleCreate()` mới `console.log('Submit new grade')`;
- `GradesPage.handleEdit()` mới `console.log(...)`;
- chưa có `/grades/new`;
- chưa có `/grades/:studentId/:courseId/edit`;
- chưa có `GradeCreatePage.vue`;
- chưa có `GradeEditPage.vue`;
- chưa có shared `GradeForm.vue`;
- `grade.api.ts` hiện mới có `getGrades()` và `deleteGrade()`;
- chưa có pair GET/create/update API functions;
- `grade.queries.ts` mới có `all()`;
- `gradeKeys` mới có `root` và `all()`;
- `httpClient` có core request type hỗ trợ `PUT`, nhưng public client hiện chưa expose `put()`.

### 2.4 Target source structure

Đề xuất:

```text
src/features/grades/
├── api/
│   ├── grade.api.ts
│   └── grade.queries.ts
├── components/
│   └── GradeForm.vue
├── model/
│   ├── grade.mapper.ts
│   └── grade.types.ts
└── pages/
    ├── GradeCreatePage.vue
    └── GradeEditPage.vue
```

Flow component:

```text
/grades/new
    ↓
GradeCreatePage
    ↓
 GradeForm.vue
    ↑
GradeEditPage
    ↑
/grades/:studentId/:courseId/edit
```

`GradeForm.vue` chịu trách nhiệm:

- render field;
- local form state;
- validation;
- disabled/pending UI;
- emit submit/cancel/delete intent.

Page wrapper chịu trách nhiệm:

- route params;
- fetch data;
- mutation;
- API error handling;
- cache invalidation;
- navigation.

---

## 3. Source of truth và canonical decisions

Khi design/docs/source runtime khác nhau, ưu tiên:

1. Backend/API contract đã được project docs xác nhận.
2. Grade domain spec + Grade journey.
3. Target design `grade_form.png` cho visual composition.
4. Router/shared UI conventions hiện tại.
5. Runtime hiện tại chỉ dùng để xác định phần FE nào chưa implement.

| Concern | Canonical decision |
| --- | --- |
| Create route | `/grades/new` |
| Update route | `/grades/:studentId/:courseId/edit` |
| Create API | `POST /grade/student/{studentId}/course/{courseId}` |
| Update API | `PUT /grade/student/{studentId}/course/{courseId}` |
| Pair GET | `GET /grade/student/{studentId}/course/{courseId}` |
| Delete API | `DELETE /grade/student/{studentId}/course/{courseId}` |
| Request body | `{ "score": string }` |
| Grade identity | `(studentId, courseId)` |
| Score type | `string` |
| Create Student/Course | Selectable |
| Update Student/Course | Read-only |
| Delete button | Hidden in Create; visible in Update |
| Update scope | Chỉ `score` |
| Delete success | `204 No Content` |

---

## 4. Phạm vi

### 4.1 In scope

- Shared Grade Form UI.
- Create Grade.
- Update Grade.
- Delete Grade từ Update form.
- Student selector trong Create.
- Course selector trong Create.
- Read-only Student/Course trong Update.
- Free-form score string.
- Client validation.
- Loading/error/empty states khi load dependencies.
- Duplicate pair handling.
- Parent Student/Course missing handling.
- Mutation pending/error/success behavior.
- Cache invalidation.
- Cancel/navigation.
- Responsive/accessibility.
- Integration với auth-expired flow hiện có.

### 4.2 Out of scope

- Đổi Student/Course của một Grade đã tồn tại.
- Numeric grade calculation.
- Average/GPA conversion.
- Letter-grade allowlist.
- Min/max numeric validation.
- Bulk grade submission.
- Import CSV/Excel.
- Grade history/audit trail.
- Server-side duplicate-check endpoint riêng.

---

## 5. Backend/API contract

### 5.1 Load collections cho Create

```http
GET /student/all
GET /course/all
```

Dùng query/cache hiện có của Student/Course feature, không tạo duplicate fetch layer riêng cho Grade Form.

### 5.2 Load Grade cho Update

```http
GET /grade/student/{studentId}/course/{courseId}
```

Expected success: Grade object có `score`, `student`, `course`.

Nếu pair không tồn tại:

- HTTP `404`;
- Update page hiển thị resource-not-found state hoặc điều hướng theo global 404 convention;
- không render form rỗng như thể đang tạo mới.

### 5.3 Create

```http
POST /grade/student/{studentId}/course/{courseId}
Content-Type: application/json
```

```json
{
  "score": "A"
}
```

Expected success theo project E2E contract:

```text
201 Created
```

### 5.4 Update

```http
PUT /grade/student/{studentId}/course/{courseId}
Content-Type: application/json
```

```json
{
  "score": "A+"
}
```

Expected success theo project E2E contract:

```text
200 OK
```

Update **không gửi** Student/Course trong body.

### 5.5 Delete

```http
DELETE /grade/student/{studentId}/course/{courseId}
```

Success:

```text
204 No Content
```

HTTP client không được cố parse JSON body cho `204`.

### 5.6 FE API functions đề xuất

```ts
export interface GradeInput {
  score: string
}

export function getGrade(
  studentId: number,
  courseId: number,
  signal?: AbortSignal,
): Promise<GradeViewModel>

export function createGrade(
  studentId: number,
  courseId: number,
  input: GradeInput,
  signal?: AbortSignal,
): Promise<GradeViewModel>

export function updateGrade(
  studentId: number,
  courseId: number,
  input: GradeInput,
  signal?: AbortSignal,
): Promise<GradeViewModel>

export function deleteGrade(
  studentId: number,
  courseId: number,
  signal?: AbortSignal,
): Promise<void>
```

`httpClient` cần expose `put()` theo cùng error/auth contract với `get/post/delete`.

---

## 6. Data contract

### 6.1 Existing Grade view model

```ts
interface GradeViewModel {
  id: number
  score: string
  student: {
    id: number
    name: string
  }
  course: {
    id: number
    code: string
    subject?: string
    description?: string
  }
}
```

### 6.2 Form value

```ts
interface GradeFormValue {
  studentId: number | null
  courseId: number | null
  score: string
}
```

### 6.3 Submit payload

Path params mang identity; body chỉ chứa score:

```ts
interface GradeInput {
  score: string
}
```

Ví dụ hợp lệ về mặt current contract:

```text
A
A+
B+
Pass
85
8.5
```

Không chuyển:

```text
"8.5" -> 8.5
"85"  -> 85
```

---

## 7. UI specification

### 7.1 Page heading

Theo target design:

```text
Grade Management | Submit / Update Grade
```

Có thể mode-aware để rõ nghiệp vụ hơn nếu vẫn giữ visual hierarchy:

Create:

```text
Grade Management | Submit Grade
```

Update:

```text
Grade Management | Update Grade
```

### 7.2 Card

Card title:

```text
Grade Information
```

Fields theo thứ tự:

1. Student `*`.
2. Course `*`.
3. Grade `*`.
4. Divider.
5. Action buttons.

### 7.3 Student field

#### Create mode

- Select enabled.
- Placeholder: `Select Student`.
- Options lấy từ `GET /student/all`.
- Display tối thiểu:

```text
<Student Name> - ID: <id>
```

Ví dụ:

```text
Nguyễn Văn A - ID: 1
```

#### Update mode

- Student lấy từ pair Grade hiện tại.
- Không được thay đổi.
- UI có thể dùng disabled select hoặc read-only display field, nhưng phải rõ trạng thái khóa.
- Helper text:

```text
Read-only. Student cannot be changed.
```

### 7.4 Course field

#### Create mode

- Select enabled.
- Placeholder: `Select Course`.
- Options lấy từ `GET /course/all`.
- Display ưu tiên:

```text
<code> - <subject>
```

Ví dụ:

```text
JAVA101 - Java Programming
```

Nếu `subject` thiếu, fallback an toàn theo convention hiện có, không crash render.

#### Update mode

- Course lấy từ pair Grade hiện tại.
- Không được thay đổi.
- Helper text:

```text
Read-only. Course cannot be changed.
```

### 7.5 Grade field

- Text input, **không dùng `type="number"`**.
- Label: `Grade *`.
- Giá trị là free-form string.
- Helper text theo design:

```text
Enter the grade as text (e.g., A, B+, Pass, 8.5).
```

### 7.6 Actions

#### Create

```text
[ Save Grade ] [ Cancel ]
```

- Không hiển thị Delete.

#### Update

```text
[ Save Grade ] [ Delete Grade ] [ Cancel ]
```

Có thể đổi primary label thành `Update Grade` để tăng rõ nghĩa, nhưng nếu giữ design `Save Grade` thì behavior phải mode-aware và test rõ.

Canonical recommendation cho text:

```text
Create: Save Grade
Update: Update Grade
```

Delete dùng destructive style.

---

## 8. Normal flow — Create

### 8.1 Entry

Từ Grade Management:

```text
Submit New Grade
    ↓
/grades/new
```

`GradesPage.handleCreate()` phải chuyển từ `console.log` sang router navigation.

### 8.2 Initial load

Create page load song song/reuse cache:

```text
students query
courses query
```

Không cần fetch `/grade/all` chỉ để render form.

### 8.3 User interaction

1. Chọn Student.
2. Chọn Course.
3. Nhập Grade.
4. Nhấn `Save Grade`.
5. Client validate.
6. Chuẩn hóa `score = score.trim()`.
7. Gửi:

```text
POST /grade/student/{studentId}/course/{courseId}
{ "score": "..." }
```

8. Khi success:
   - invalidate Grade-related cache;
   - invalidate Student/Course detail cache liên quan;
   - invalidate/recompute Dashboard Grade data;
   - điều hướng về `/grades`.

### 8.4 Double-submit protection

Trong mutation pending:

- disable primary submit;
- không gửi request thứ hai;
- hiển thị pending state phù hợp;
- Cancel/Delete behavior phải tránh tạo race condition.

---

## 9. Normal flow — Update

### 9.1 Entry

Từ Grade list row:

```text
Edit
  ↓
/grades/{studentId}/{courseId}/edit
```

`GradesPage.handleEdit()` phải chuyển từ `console.log` sang navigation dùng pair IDs.

### 9.2 Route params

`studentId` và `courseId` phải:

- parse thành positive integer;
- invalid param → not-found/error route theo convention;
- không gửi malformed value vào backend.

### 9.3 Initial load

```text
GET /grade/student/{studentId}/course/{courseId}
```

Khi success:

```text
Student = currentGrade.student (read-only)
Course  = currentGrade.course  (read-only)
Grade   = currentGrade.score   (editable)
```

Update page không cần `/student/all` hoặc `/course/all` chỉ để render read-only pair nếu pair response đã chứa nested Student/Course.

### 9.4 Submit

1. User sửa Grade.
2. Validate non-empty sau trim.
3. Gửi:

```http
PUT /grade/student/{studentId}/course/{courseId}
```

```json
{
  "score": "A+"
}
```

4. Không gửi student/course body.
5. Không cho pair thay đổi trong UI.
6. Success → invalidate cache + quay `/grades`.

### 9.5 No-op update

Nếu normalized score mới bằng normalized score ban đầu, implementation có thể:

- disable `Update Grade`; hoặc
- cho submit nhưng backend xử lý idempotently.

Khuyến nghị FE: disable update khi không có thay đổi hợp lệ để tránh request thừa.

---

## 10. Delete flow trong Update mode

Delete button chỉ xuất hiện trong Update mode.

Khi click:

1. Mở shared `DeleteConfirmDialog`.
2. Dialog nêu rõ Student + Course, ví dụ:

```text
Are you sure you want to delete the grade for
Nguyễn Văn A in JAVA101?
```

3. Cancel:
   - đóng dialog;
   - không gọi API;
   - trả focus về trigger.
4. Confirm:

```http
DELETE /grade/student/{studentId}/course/{courseId}
```

5. Pending:
   - disable repeat confirm;
   - không đóng dialog sớm.
6. Success `204`:
   - invalidate cache;
   - đóng dialog;
   - điều hướng `/grades`.
7. Failure:
   - giữ dialog mở;
   - hiển thị safe error;
   - cho retry.

Backend hiện có caveat: delete unknown pair có thể là no-op `204`. UI không được phụ thuộc vào `404` để hoàn tất delete workflow.

---

## 11. Validation

### 11.1 Student

Create:

- required;
- phải map tới một option có ID hợp lệ trong data hiện có tại thời điểm chọn.

Update:

- lấy từ resource;
- không editable;
- không cần client validation như select input.

Error text đề xuất:

```text
Student is required.
```

### 11.2 Course

Create:

- required;
- phải có positive integer ID từ option.

Update:

- read-only từ Grade pair.

Error text:

```text
Course is required.
```

### 11.3 Grade/score

Canonical MVP validation:

```ts
const normalizedScore = score.trim()
valid = normalizedScore.length > 0
```

Không áp dụng:

- numeric parsing;
- `0..10` range;
- `0..100` range;
- A–F allowlist;
- automatic uppercase;
- decimal rounding.

Error text:

```text
Grade is required.
```

### 11.4 Normalization

Được phép:

```text
"  A+  " → "A+"
```

Không được phép tự ý:

```text
"pass" → "PASS"
"8.50" → "8.5"
"085" → "85"
```

---

## 12. Loading, empty và error states

### 12.1 Create — dependency loading

Trong khi Student/Course collections đang load:

- form không được submit;
- selector có loading/disabled state;
- có `role="status"` / `aria-live="polite"` phù hợp.

### 12.2 Create — collection error

Nếu Student hoặc Course collection fail:

- hiển thị error rõ nguồn hoặc generic form dependency error;
- có Retry;
- không submit với option data chưa load đáng tin cậy.

### 12.3 Create — empty Students

Nếu không có Student:

- Student selector không có usable option;
- Save bị disable;
- hiển thị message như:

```text
No students are available. Add a student before submitting a grade.
```

Có thể link tới `/students/new` nếu phù hợp UX.

### 12.4 Create — empty Courses

Tương tự:

```text
No courses are available. Add a course before submitting a grade.
```

### 12.5 Update — pair loading

Trong khi GET pair pending:

- không render blank editable form;
- hiển thị loading state/skeleton/status.

### 12.6 Update — pair 404

- Resource-not-found state.
- Không biến thành Create mode.
- Có navigation về Grade Management.

### 12.7 Create — duplicate pair

Database chỉ cho tối đa một Grade trên `(studentId, courseId)`.

Backend duplicate error hiện chưa được chuẩn hóa ổn định. FE phải:

- không lộ raw DB/constraint message;
- giữ Student/Course/Grade values;
- hiển thị safe message, ví dụ:

```text
A grade for this student and course already exists or could not be saved.
```

Nếu backend sau này chuẩn hóa `409 GRADE_ALREADY_EXISTS`, map sang message cụ thể hơn mà không đổi form contract.

### 12.8 Parent Student/Course bị xóa giữa lúc form mở

Create POST có thể trả `404` nếu Student/Course không còn tồn tại.

FE phải:

- không hiển thị success;
- giữ score người dùng nhập;
- báo resource không còn tồn tại;
- refetch relevant collection;
- buộc user chọn lại nếu selected option biến mất.

### 12.9 Update mutation 404

Nếu pair bị xóa bởi phiên khác trước khi PUT:

- hiển thị resource no longer exists;
- không giả lập recreate bằng POST;
- cho người dùng về Grade Management.

### 12.10 401

Dùng centralized auth-expired behavior của `httpClient`:

- clear authenticated session;
- redirect Login theo app auth flow;
- không hiển thị raw token/server detail.

### 12.11 5xx/network

- Giữ form values.
- Hiển thị safe retryable error.
- Mutation không auto-retry theo cách có thể tạo duplicate Create ngoài ý muốn.

---

## 13. Query keys và cache invalidation

Current keys mới có:

```ts
gradeKeys.root
gradeKeys.all()
```

Target nên mở rộng:

```ts
export const gradeKeys = {
  root: ['grades'] as const,
  all: () => ['grades', 'all'] as const,
  byStudent: (studentId: number) => ['grades', 'student', studentId] as const,
  byCourse: (courseId: number) => ['grades', 'course', courseId] as const,
  pair: (studentId: number, courseId: number) =>
    ['grades', 'pair', studentId, courseId] as const,
}
```

Sau Create/Update/Delete thành công, invalidate tối thiểu:

```text
grades root/all
byStudent(studentId)
byCourse(courseId)
pair(studentId, courseId)
student detail liên quan
course detail liên quan
Dashboard data phụ thuộc Grade collection
```

Có thể dùng `invalidateQueries({ queryKey: gradeKeys.root })` cho Grade family nếu phù hợp convention, nhưng Student/Course detail vẫn cần invalidation riêng nếu các detail hiển thị Grades.

Update score **không làm thay đổi Grade count**, nhưng Dashboard Grade Records/Grades by Course có thể cần refresh để hiển thị score/derived data hiện tại.

---

## 14. Navigation behavior

### Create

```text
Save success → /grades
Cancel       → /grades
```

### Update

```text
Update success → /grades
Delete success → /grades
Cancel         → /grades
```

Nếu sau này có Grade detail riêng, navigation có thể được ADR/spec khác thay đổi. Current target không yêu cầu Grade detail route.

Cancel:

- không gọi mutation;
- nếu form dirty, product có thể bổ sung unsaved-change confirm sau; không bắt buộc trong MVP.

---

## 15. Accessibility

- Mỗi field có `<label>` liên kết đúng control.
- Required state không chỉ biểu diễn bằng màu/asterisk.
- Validation error dùng `aria-describedby` và/hoặc `aria-invalid="true"`.
- Pending/error message được announce hợp lý.
- Native select hoặc accessible custom select; không tạo div-only faux select thiếu keyboard semantics.
- Read-only Student/Course ở Update phải được screen reader hiểu là không editable.
- Delete dialog:
  - focus trap;
  - Escape nếu shared dialog contract cho phép;
  - focus return;
  - accessible title/description.
- Buttons có accessible name rõ ràng.
- Focus order:

```text
Student → Course → Grade → Primary action → Delete(if any) → Cancel
```

- Error không chỉ dùng màu đỏ để truyền đạt trạng thái.

---

## 16. Responsive behavior

Theo design desktop:

- Form nằm trong một card rộng.
- Student/Course/Grade xếp dọc full width.
- Actions align về bên phải.

Mobile/tablet:

- Card/container không gây horizontal scroll.
- Fields full width.
- Select text dài được truncate/wrap hợp lý mà vẫn giữ accessible value.
- Action buttons có thể stack full width theo thứ tự:

```text
Primary
Delete (Update only)
Cancel
```

- Touch target tối thiểu phù hợp shared design system.
- Không ẩn helper text quan trọng chỉ để tiết kiệm chiều cao.

---

## 17. Mode contract cho shared `GradeForm.vue`

Type đề xuất:

```ts
type GradeFormMode = 'create' | 'edit'

interface GradeFormProps {
  mode: GradeFormMode
  initialValue: GradeFormValue
  students?: GradeStudent[]
  courses?: GradeCourse[]
  isSubmitting?: boolean
  submitError?: string | null
}
```

Behavior matrix:

| Capability | Create | Edit |
| --- | --- | --- |
| Student | Selectable | Read-only |
| Course | Selectable | Read-only |
| Score | Editable | Editable |
| Primary action | Save Grade | Update Grade |
| Delete | Hidden | Visible |
| Initial score | Empty | Current score |
| Pair GET | Không cần | Required |
| Student/Course list GET | Required/reuse cache | Không bắt buộc nếu pair response đủ |
| POST | Yes | No |
| PUT | No | Yes |

Shared component **không trực tiếp gọi router/API**. Nó emit intent để page xử lý.

---

## 18. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-GRADE-FORM-001 | `/grades/new` render Grade Form ở Create mode | Ready |
| AC-GRADE-FORM-002 | `/grades/:studentId/:courseId/edit` render Grade Form ở Edit mode | Ready |
| AC-GRADE-FORM-003 | Cả Create và Edit dùng chung `GradeForm.vue` | Ready |
| AC-GRADE-FORM-004 | Create load/reuse Student collection | Ready |
| AC-GRADE-FORM-005 | Create load/reuse Course collection | Ready |
| AC-GRADE-FORM-006 | Create cho phép chọn Student | Ready |
| AC-GRADE-FORM-007 | Create cho phép chọn Course | Ready |
| AC-GRADE-FORM-008 | Create yêu cầu Student | Ready |
| AC-GRADE-FORM-009 | Create yêu cầu Course | Ready |
| AC-GRADE-FORM-010 | Score bắt buộc sau trim | Ready |
| AC-GRADE-FORM-011 | Score dùng text input, không number input | Ready |
| AC-GRADE-FORM-012 | Score giữ type `string` | Ready |
| AC-GRADE-FORM-013 | Không áp dụng numeric range/letter allowlist | Ready |
| AC-GRADE-FORM-014 | Create gửi đúng POST pair endpoint | Ready |
| AC-GRADE-FORM-015 | Create body chỉ chứa `{score}` | Ready |
| AC-GRADE-FORM-016 | Double submit bị chặn khi POST pending | Ready |
| AC-GRADE-FORM-017 | Create success điều hướng `/grades` | Ready |
| AC-GRADE-FORM-018 | Duplicate pair không lộ raw DB error | Ready |
| AC-GRADE-FORM-019 | Duplicate failure giữ form values | Ready |
| AC-GRADE-FORM-020 | Create parent 404 hiển thị resource stale/missing state | Ready |
| AC-GRADE-FORM-021 | Edit parse pair IDs từ route | Ready |
| AC-GRADE-FORM-022 | Invalid route IDs không gửi malformed request | Ready |
| AC-GRADE-FORM-023 | Edit GET current Grade bằng pair endpoint | Ready |
| AC-GRADE-FORM-024 | Edit preload current score | Ready |
| AC-GRADE-FORM-025 | Edit hiển thị Student read-only | Ready |
| AC-GRADE-FORM-026 | Edit hiển thị Course read-only | Ready |
| AC-GRADE-FORM-027 | Edit không cho đổi Grade pair | Ready |
| AC-GRADE-FORM-028 | Update gửi đúng PUT pair endpoint | Ready |
| AC-GRADE-FORM-029 | Update body chỉ chứa `{score}` | Ready |
| AC-GRADE-FORM-030 | Update success điều hướng `/grades` | Ready |
| AC-GRADE-FORM-031 | Pair GET 404 không chuyển thành Create mode | Ready |
| AC-GRADE-FORM-032 | Delete hidden trong Create mode | Ready |
| AC-GRADE-FORM-033 | Delete visible trong Edit mode | Ready |
| AC-GRADE-FORM-034 | Delete mở confirm dialog chứa Student + Course | Ready |
| AC-GRADE-FORM-035 | Cancel delete không gửi DELETE | Ready |
| AC-GRADE-FORM-036 | Confirm delete gửi đúng pair endpoint | Ready |
| AC-GRADE-FORM-037 | Delete xử lý `204` không parse body | Ready |
| AC-GRADE-FORM-038 | Mutation success invalidate Grade caches liên quan | Ready |
| AC-GRADE-FORM-039 | Mutation invalidate Student/Course detail data liên quan | Ready |
| AC-GRADE-FORM-040 | Dashboard Grade-dependent data được refresh/invalidate | Ready |
| AC-GRADE-FORM-041 | API/network error giữ form values | Ready |
| AC-GRADE-FORM-042 | 401 dùng centralized auth-expired flow | Ready |
| AC-GRADE-FORM-043 | Create dependency loading chặn submit | Ready |
| AC-GRADE-FORM-044 | Empty Students/Courses có actionable empty state | Ready |
| AC-GRADE-FORM-045 | Form keyboard accessible và có label/error semantics | Ready |
| AC-GRADE-FORM-046 | Layout responsive, không horizontal overflow | Ready |
| AC-GRADE-FORM-047 | `GradesPage` Submit New Grade điều hướng tới Create route | Ready |
| AC-GRADE-FORM-048 | `GradesPage` Edit điều hướng tới pair Edit route | Ready |

---

## 19. Edge cases

| Case | Expected behavior |
| --- | --- |
| Score `" A "` | Submit `"A"` |
| Score `"8.5"` | Giữ string `"8.5"` |
| Score `"Pass"` | Hợp lệ nếu non-empty |
| Score `"0"` | Hợp lệ về current free-form contract |
| Score chỉ whitespace | Validation error |
| Student chưa chọn | Validation error |
| Course chưa chọn | Validation error |
| Không có Students | Không thể submit; show empty guidance |
| Không có Courses | Không thể submit; show empty guidance |
| Duplicate pair | Safe error; giữ values |
| Student bị xóa sau khi user chọn | POST 404; refetch Student options |
| Course bị xóa sau khi user chọn | POST 404; refetch Course options |
| Pair bị xóa trước khi Edit load | 404/not-found |
| Pair bị xóa trước khi PUT | Báo resource no longer exists; không POST thay thế |
| Delete unknown pair trả 204 | Xem action là complete và refetch/invalidate |
| Repeated Save click | Chỉ một active mutation |
| Route ID `abc` | Không gọi API với `NaN` |
| Route ID `0` hoặc âm | Invalid route resource |
| Long Student/Course name | Không phá layout; accessible full value vẫn có thể xác định |
| 401 khi form mở | Auth-expired flow |
| Network fail khi submit | Form values giữ nguyên, cho retry |

---

## 20. Test mapping

### 20.1 Unit tests

| Test ID | Scope | Nội dung |
| --- | --- | --- |
| UT-GRADE-FORM-001 | validation | Student required Create |
| UT-GRADE-FORM-002 | validation | Course required Create |
| UT-GRADE-FORM-003 | validation | whitespace score invalid |
| UT-GRADE-FORM-004 | normalization | score trim |
| UT-GRADE-FORM-005 | semantics | numeric-looking score vẫn là string |
| UT-GRADE-FORM-006 | semantics | alphabetic/free-form score hợp lệ |
| UT-GRADE-FORM-007 | route helper | positive pair IDs accepted |
| UT-GRADE-FORM-008 | route helper | malformed pair IDs rejected |

### 20.2 Component tests

| Test ID | Scope | Nội dung |
| --- | --- | --- |
| CT-GRADE-FORM-001 | shared form | Create renders enabled Student/Course selects |
| CT-GRADE-FORM-002 | shared form | Edit renders Student/Course read-only |
| CT-GRADE-FORM-003 | shared form | Delete hidden Create |
| CT-GRADE-FORM-004 | shared form | Delete visible Edit |
| CT-GRADE-FORM-005 | shared form | validation errors + aria semantics |
| CT-GRADE-FORM-006 | shared form | pending disables repeated submit |
| CT-GRADE-FORM-007 | shared form | emits normalized form value |

### 20.3 Integration tests

| Test ID | Scope | Nội dung |
| --- | --- | --- |
| IT-GRADE-FORM-001 | Create page | load Students/Courses |
| IT-GRADE-FORM-002 | Create page | POST đúng pair + `{score}` |
| IT-GRADE-FORM-003 | Create page | duplicate safe error |
| IT-GRADE-FORM-004 | Create page | parent 404 refetch relevant option data |
| IT-GRADE-FORM-005 | Edit page | GET pair + preload |
| IT-GRADE-FORM-006 | Edit page | PUT chỉ score |
| IT-GRADE-FORM-007 | Edit page | pair 404 state |
| IT-GRADE-FORM-008 | Delete | confirm/cancel/204 |
| IT-GRADE-FORM-009 | cache | mutation invalidates Grade + related detail queries |
| IT-GRADE-FORM-010 | auth | 401 flows through central auth expiration |

### 20.4 E2E alignment

Spec phải support các journeys hiện có:

- `E2E-GRADE-011` — create → update → delete.
- `E2E-GRADE-012` — string score semantics.
- `E2E-GRADE-015` — detail phản ánh grade mutation.
- `E2E-GRADE-016` — duplicate pair safe error.
- `E2E-GRADE-017` — missing Student/Course khi create.
- `E2E-GRADE-018` — delete confirm chứa Student + Course.
- `E2E-GRADE-019` — delete unknown pair không phụ thuộc 404.

---

## 21. Source traceability

| Requirement | Source |
| --- | --- |
| Create/Update routes | `docs/ui/web/grade_submission/screens/grades/grade_form.md` |
| Form visual | `docs/ui/web/grade_submission/screens/design/grade_form.png` |
| POST/PUT/DELETE pair API | `docs/modules/grades/spec.md` |
| Score free-form string | `docs/architecture/grade_journey.md`, Grade ADR/docs |
| Create selectors | `docs/ui/web/grade_submission/screens/grades/grade_form.md` |
| Update pair read-only | `docs/modules/grades/spec.md` |
| Duplicate pair constraint | `docs/modules/grades/spec.md`, `docs/e2e/grades.md` |
| Delete 204 | `docs/modules/grades/spec.md` |
| Current Grade list/delete implementation | `src/features/grades/pages/GradesPage.vue` |
| Current Grade API gap | `src/features/grades/api/grade.api.ts` |
| Current Grade query gap | `src/features/grades/api/grade.queries.ts` |
| Current router gap | `src/app/router/routes.ts` |
| HTTP PUT exposure gap | `src/core/api/http-client.ts` |
| Existing Student/Course collections | `studentQueries.all()`, `courseQueries.all()` |

---

## 22. Current vs Target matrix

| Capability | Current FE | Target |
| --- | --- | --- |
| Grade list | Implemented | Keep |
| Delete from list | Implemented | Keep |
| Submit New Grade navigation | `console.log` | `/grades/new` |
| Edit navigation | `console.log` | pair edit route |
| Create route | Missing | Implement |
| Edit route | Missing | Implement |
| Shared Grade Form | Missing | Implement |
| Student/Course selectors | Existing in list filter only | Reuse domain data in Create form |
| Pair GET API | Missing FE wrapper | Implement |
| POST Grade API | Missing FE wrapper | Implement |
| PUT Grade API | Missing FE wrapper | Implement |
| DELETE Grade API | Implemented | Reuse |
| `httpClient.put()` | Missing public method | Implement |
| Pair query key | Missing | Implement |
| Create validation | Missing | Implement |
| Update read-only pair | Missing | Implement |
| Delete from Update form | Missing | Reuse shared dialog |
| Cache invalidation family | Partial/root only | Expand for pair/detail dependencies |

---

## 23. Suggested implementation order

1. Mở rộng `httpClient.put()`.
2. Mở rộng `grade.types.ts` với `GradeInput`/form types nếu cần.
3. Bổ sung `getGrade`, `createGrade`, `updateGrade` vào `grade.api.ts`.
4. Mở rộng `gradeKeys` + `gradeQueries` cho pair/query families.
5. Tạo shared `GradeForm.vue` với Create/Edit mode.
6. Tạo `GradeCreatePage.vue`.
7. Tạo `GradeEditPage.vue`.
8. Thêm `/grades/new` và `/grades/:studentId/:courseId/edit` vào router.
9. Nối `GradesPage.handleCreate()` và `handleEdit()` vào router.
10. Reuse `DeleteConfirmDialog` ở Edit page.
11. Implement mutation invalidation.
12. Viết unit/component/integration tests.
13. Chạy E2E Grade journeys.
14. Đồng bộ module docs/task nếu implementation quyết định khác spec.

---

## 24. Definition of Done

Grade Form được xem là hoàn chỉnh khi:

- [ ] Có một shared `GradeForm.vue` cho cả Create và Update.
- [ ] `/grades/new` hoạt động.
- [ ] `/grades/:studentId/:courseId/edit` hoạt động.
- [ ] Create load/reuse Student + Course options.
- [ ] Create POST đúng pair endpoint.
- [ ] Edit GET đúng pair và preload dữ liệu.
- [ ] Student/Course khóa read-only khi Edit.
- [ ] Update PUT chỉ `{score}`.
- [ ] `score` luôn giữ type string.
- [ ] Không có numeric/letter allowlist ngoài non-empty validation.
- [ ] Duplicate pair hiển thị safe error.
- [ ] Missing parent/pair được xử lý rõ ràng.
- [ ] Delete chỉ xuất hiện trong Edit mode và có confirm dialog.
- [ ] Delete `204` không bị parse body.
- [ ] Double submit bị chặn.
- [ ] Mutation failure giữ form values.
- [ ] Cache Grade/Student/Course/Dashboard liên quan được invalidate đúng.
- [ ] 401 đi qua centralized auth-expired flow.
- [ ] UI keyboard accessible và responsive.
- [ ] Unit/component/integration tests pass.
- [ ] `E2E-GRADE-011`, `012`, `016`, `017`, `018`, `019` pass cho form flow liên quan.
- [ ] Không còn `console.log` placeholder cho Create/Edit Grade navigation.

