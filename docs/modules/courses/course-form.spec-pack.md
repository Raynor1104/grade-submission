# Course Form (Create / Update Course) — Spec Pack

**Phụ trách:** Frontend team  
**Trạng thái:** Create + Edit ready for implementation  
**Cập nhật lần cuối:** 2026-09-28

## 1. Bối cảnh

**Course Form** là form dùng chung cho nghiệp vụ quản lý Course, với mục tiêu không duplicate UI, validation và form state giữa Create và Edit.

Hai mode được định nghĩa trong cùng một component:

1. **Create Course** — tạo Course mới bằng `POST /course`.
2. **Update Course** — chỉnh sửa Course đã tồn tại bằng `PUT /course/{id}`.

Source hiện tại đã mount route `/courses/new`, nhưng `CourseCreatePage.vue` mới chỉ là placeholder. Backend hiện đã có `PUT /course/{id}` cho Update Course. Vì vậy spec này yêu cầu triển khai shared `CourseForm.vue` dùng chung cho cả Create và Edit, đồng thời bổ sung đầy đủ FE integration cho update flow. Nếu docs/API adapter trong repository chưa phản ánh `PUT /course/{id}`, cần cập nhật chúng trong cùng implementation để tránh lệch contract.

Spec được xây dựng từ:

- `src/app/router/routes.ts`;
- `src/features/courses/pages/CourseCreatePage.vue`;
- `src/features/courses/pages/CourseDetailPage.vue`;
- `src/features/courses/api/course.api.ts`;
- `src/features/courses/api/course.queries.ts`;
- `src/features/courses/model/course.types.ts`;
- `src/features/courses/model/course.mapper.ts`;
- `src/core/api/http-client.ts`;
- `src/core/api/query-keys.ts`;
- `src/shared/ui/BaseInput.vue`;
- `src/shared/ui/BaseButton.vue`;
- `docs/ui/web/grade_submission/screens/design/course_form.png`;
- `docs/ui/web/grade_submission/screens/courses/course_form.md`;
- `docs/modules/courses/spec.md`;
- `docs/modules/courses/tasks.md`;
- `docs/modules/courses/test_spec.md`;
- `docs/architecture/course_journey.md`;
- `docs/architecture/data_model.md`;
- `docs/architecture/api_integration.md`;
- `docs/standards/validation-rules.md`;
- `docs/standards/component-patterns.md`;
- `docs/standards/accessibility-and-responsive.md`;
- `docs/e2e/courses.md`.

### 1.1 Mục tiêu

- Có một **Course Form UI duy nhất** cho Create và Edit.
- Không duplicate markup, validation, helper text, submit state hoặc action layout.
- Create mode dùng form rỗng và `POST /course`.
- Edit mode dùng dữ liệu preload và `PUT /course/{id}`.
- UI label **Course Name (Subject)** phải map đúng sang backend field `subject`.
- Course Code không tự uppercase nếu chưa có business rule chính thức.
- Không làm mất dữ liệu user khi request thất bại.
- Page wrapper chịu trách nhiệm query/mutation/navigation; form component không gọi API trực tiếp.

---

## 2. Modes và routes

| Mode | Route | Page | Capability |
| --- | --- | --- | --- |
| Create | `/courses/new` | `CourseCreatePage.vue` | Current route, page placeholder; ready to implement |
| Edit | `/courses/:id/edit` | `CourseEditPage.vue` | Target route; backend ready; FE route/page/mutation cần implement |

### 2.1 Create mode

Route canonical:

```text
/courses/new
```

Route name hiện tại:

```text
course-create
```

Page header:

```text
Course Management | Add Course
```

Primary action:

```text
Save Course
```

### 2.2 Edit mode

Target route:

```text
/courses/:id/edit
```

Target route name:

```text
course-edit
```

Page header:

```text
Course Management | Edit Course
```

Primary action:

```text
Update Course
```

Edit route chưa được mount trong source hiện tại. Backend đã có Update API, nên route này có thể được implement và enable sau khi query/mutation + page states + tests hoàn chỉnh.

### 2.3 Related routes

| Route | Mục đích | Quan hệ với Course Form |
| --- | --- | --- |
| `/courses` | Course Management | Cancel/default destination |
| `/courses/new` | Create Course | Create wrapper |
| `/courses/:id` | Course Detail | Detail/success destination; Edit entry point |
| `/courses/:id/edit` | Edit Course | Target Edit wrapper |

Course Form nằm dưới authenticated `MainLayout`, vì vậy phải kế thừa auth guard hiện có.

---

## 3. Current / Target

### 3.1 Current implementation

`src/features/courses/pages/CourseCreatePage.vue` hiện chỉ render:

```text
Course Management | Add Course
Course create page
```

`src/features/courses/pages/CourseDetailPage.vue` cũng mới ở mức placeholder detail.

Current Course API adapter mới expose:

```http
GET /course/all
DELETE /course/{id}
```

Backend hiện hỗ trợ thêm:

```http
GET /course/{id}
POST /course
PUT /course/{id}
```

`course.api.ts` chưa expose đầy đủ `getCourseById()`, `createCourse()` và `updateCourse()` cho flow form.

Shared `httpClient` hiện expose:

- `get()`;
- `post()`;
- `delete()`.

Backend canonical update method là `PUT /course/{id}`. Nếu public `httpClient` chưa expose `put()`, FE phải bổ sung helper `put()` qua centralized request pipeline thay vì dùng raw `fetch()`.

### 3.2 Target Create

Target Create phải có:

- shared `CourseForm.vue`;
- real form state;
- validation;
- `createCourse()` adapter;
- create mutation;
- loading/pending/error handling;
- success cache invalidation;
- success navigation;
- component/integration/E2E coverage.

### 3.3 Target Edit

Edit là scope chính thức và phải reuse cùng `CourseForm.vue`:

- route `/courses/:id/edit`;
- `CourseEditPage.vue`;
- preload `GET /course/{id}`;
- cùng field/validation/layout với Create;
- `PUT /course/{id}` update mutation;
- invalidate list/detail/dashboard-related data;
- navigation về Course Detail sau success.

### 3.4 Không được làm

Không dùng chuỗi request:

```text
DELETE /course/{id}
POST /course
```

để giả lập Update. Update phải gọi trực tiếp `PUT /course/{id}`.

Cách này có thể thay đổi ID, phá liên kết Grade và tạo behavior không atomic.

---

## 4. Kiến trúc component

### 4.1 Target component tree

```text
CourseCreatePage
├── PageHeader
└── BaseCard
    └── CourseForm

CourseEditPage                 [target, ready to implement]
├── PageHeader
├── Loading / LoadError / NotFound
└── BaseCard
    └── CourseForm
```

Shared form:

```text
CourseForm
├── SectionHeader
│   ├── information icon
│   └── Course Information
├── CourseCodeField
├── CourseSubjectField
├── DescriptionField
├── FormError
└── Actions
    ├── Primary action
    └── Cancel
```

### 4.2 `CourseForm.vue` responsibility

Chịu trách nhiệm:

- render field;
- local form state;
- trim-aware validation;
- field-level errors;
- form-level error presentation;
- submit event;
- cancel event;
- dirty state;
- pending/disabled UI;
- mode-specific button copy.

Không chịu trách nhiệm:

- gọi API trực tiếp;
- gọi router trực tiếp;
- parse route param;
- fetch Course;
- invalidate Vue Query cache;
- quyết định endpoint Create/Update.

### 4.3 Page wrapper responsibility

`CourseCreatePage.vue`:

- truyền initial values rỗng;
- gọi create mutation;
- handle request error;
- invalidate cache;
- navigate sau success.

`CourseEditPage.vue`:

- validate route `id`;
- fetch Course detail;
- render load/not-found/error state;
- truyền initial values;
- gọi update mutation chính thức;
- invalidate cache;
- navigate sau success.

---

## 5. Data contract

### 5.1 Current backend DTO

Source định nghĩa:

```ts
export interface CourseDto {
  id: number
  subject: string
  code: string
  description: string
}
```

View model hiện tương đương:

```ts
export interface CourseViewModel {
  id: number
  code: string
  subject: string
  description: string
}
```

### 5.2 Shared form values

Recommended:

```ts
export interface CourseFormValues {
  code: string
  subject: string
  description: string
}
```

Không đưa `id` vào editable form values.

### 5.3 Form mode

```ts
export type CourseFormMode = 'create' | 'edit'
```

### 5.4 Suggested props/emits

```ts
interface CourseFormProps {
  mode: CourseFormMode
  initialValues?: CourseFormValues
  pending?: boolean
  submitError?: string | null
}
```

```ts
interface CourseFormEmits {
  submit: [values: CourseFormValues]
  cancel: []
}
```

Equivalent API được chấp nhận nếu giữ đúng responsibility boundary.

### 5.5 Create request

Endpoint:

```http
POST /course
Content-Type: application/json
Authorization: Bearer <token>
```

Request body:

```json
{
  "code": "JAVA101",
  "subject": "Java Programming",
  "description": "Basic Java programming course"
}
```

Mapping bắt buộc:

| UI | Form model | API field |
| --- | --- | --- |
| Course Code | `code` | `code` |
| Course Name (Subject) | `subject` | `subject` |
| Description | `description` | `description` |

Không serialize Course Name thành `name`.

### 5.6 Create response

Backend docs kỳ vọng `201 Created`.

FE phải chấp nhận response theo contract thật; nếu API trả Course object, map về `CourseViewModel`. Nếu response body rỗng nhưng status success được backend contract chấp nhận, navigation phải dựa vào agreed success path thay vì giả định object luôn tồn tại.

Preferred contract nếu backend trả entity:

```json
{
  "id": 1,
  "code": "JAVA101",
  "subject": "Java Programming",
  "description": "Basic Java programming course"
}
```

### 5.7 Update request

Canonical backend contract:

```http
PUT /course/{id}
Content-Type: application/json
Authorization: Bearer <token>
```

Payload của Update dùng cùng editable form shape, trừ khi backend DTO quy định khác:

```json
{
  "code": "JAVA201",
  "subject": "Advanced Java Programming",
  "description": "Advanced Java course"
}
```

FE phải dùng đúng `PUT /course/{id}`; không dùng `PATCH` trừ khi backend contract được thay đổi chính thức sau này.

### 5.8 Update response

Update được coi là thành công khi backend trả status success theo contract thực tế (thường là `200 OK` với entity hoặc `204 No Content`). FE không được giả định response body luôn tồn tại. Nếu backend trả Course object, map về `CourseViewModel`; nếu body rỗng, dùng route `id` hiện tại để invalidate/navigate.

---

## 6. UI specification

### 6.1 Visual source

Target UI bám theo:

```text
docs/ui/web/grade_submission/screens/design/course_form.png
```

### 6.2 Page structure

Create:

```text
Course Management | Add Course

+--------------------------------------------------------------+
| Course Information                                           |
|                                                              |
| Course Code *                                                |
| [ JAVA101.................................................. ] |
| Enter a unique code for the course (e.g., JAVA101)           |
|                                                              |
| Course Name (Subject) *                                      |
| [ Java Programming........................................ ] |
| Enter the name of the course                                 |
|                                                              |
| Description *                                                |
| [ Basic Java programming course........................... ] |
| [ ......................................................... ] |
| Enter a brief description of the course                      |
|                                                              |
| ------------------------------------------------------------ |
|                              [ Save Course ] [ Cancel ]       |
+--------------------------------------------------------------+
```

Edit dùng cùng layout, chỉ đổi:

```text
Add Course      → Edit Course
Save Course     → Update Course
```

### 6.3 Course Code

Label:

```text
Course Code *
```

Helper:

```text
Enter a unique code for the course (e.g., JAVA101)
```

Requirements:

- text input;
- required;
- user có thể nhập chữ, số và ký tự mà backend cho phép;
- trim trước validation/submit;
- không tự động uppercase;
- không thay đổi internal characters ngoài product rule được xác nhận.

### 6.4 Course Name (Subject)

Label:

```text
Course Name (Subject) *
```

Helper:

```text
Enter the name of the course
```

Requirements:

- text input;
- required;
- trim trước validation/submit;
- serialize thành `subject`.

### 6.5 Description

Label:

```text
Description *
```

Helper:

```text
Enter a brief description of the course
```

Requirements:

- multi-line textarea;
- required;
- trim trước validation/submit;
- giữ newline nội bộ nếu user nhập nhiều dòng, trừ khi backend/product có normalization rule khác.

Source hiện chưa có `BaseTextarea.vue`; implementation có thể:

1. tạo `BaseTextarea.vue` theo pattern `BaseInput.vue`; hoặc
2. dùng `<textarea>` feature-local với label/error/helper semantics tương đương.

Ưu tiên tạo shared primitive nếu textarea sẽ được reuse ở các feature khác.

### 6.6 Primary action

Create:

```text
Save Course
```

Edit:

```text
Update Course
```

Primary button:

- `type="submit"`;
- disabled/loading khi mutation pending;
- không cho double submit;
- Enter submit theo native form semantics khi focus ở single-line field;
- textarea Enter chỉ tạo newline, không submit ngoài native/default behavior được intentionally override.

### 6.7 Cancel

Label:

```text
Cancel
```

Behavior Create:

```text
navigate /courses
```

Behavior Edit:

```text
navigate /courses
```

Cancel không gọi mutation.

Nếu product chưa yêu cầu unsaved-changes confirmation, Cancel rời form trực tiếp. Unsaved-changes modal là backlog riêng.

---

## 7. Form initialization

### 7.1 Create

```ts
{
  code: '',
  subject: '',
  description: '',
}
```

Không dùng example trong design làm real default value. Các giá trị `JAVA101`, `Java Programming`, `Basic Java programming course` chỉ là design/example content.

### 7.2 Edit

Sau `GET /course/{id}` success:

```ts
{
  code: course.code,
  subject: course.subject,
  description: course.description,
}
```

Không render editable form với dữ liệu rỗng trong khi Course đang load để tránh user nhập rồi bị preload data ghi đè.

---

## 8. Validation

### 8.1 Nguyên tắc

Frontend validation để cải thiện UX; backend vẫn là trust boundary.

Không phát minh:

- max length;
- regex code bắt buộc;
- uppercase rule;
- description length limit;

nếu backend/product chưa xác nhận.

### 8.2 Course Code

Invalid khi:

```ts
code.trim().length === 0
```

Suggested error:

```text
Course Code is required.
```

### 8.3 Course Name

Invalid khi:

```ts
subject.trim().length === 0
```

Suggested error:

```text
Course Name is required.
```

### 8.4 Description

Invalid khi:

```ts
description.trim().length === 0
```

Suggested error:

```text
Description is required.
```

### 8.5 Submit normalization

Payload dùng trimmed values:

```ts
{
  code: values.code.trim(),
  subject: values.subject.trim(),
  description: values.description.trim(),
}
```

Không tự uppercase `code`:

```text
java101
```

không được tự biến thành:

```text
JAVA101
```

trừ khi sau này business rule yêu cầu.

### 8.6 Validation timing

Recommended behavior:

- validate toàn form khi submit;
- sau lần submit đầu tiên, field đã lỗi có thể revalidate khi user chỉnh sửa;
- không hiển thị tất cả error ngay khi page mới mở.

### 8.7 API không được gọi khi client validation fail

Nếu bất kỳ required field không hợp lệ:

- không call API;
- focus nên chuyển tới field invalid đầu tiên hoặc form phải có keyboard-friendly error navigation;
- error được liên kết bằng `aria-describedby`/`aria-invalid`.

---

## 9. Duplicate Course Code

### 9.1 Backend reality

`code` unique ở database.

Current backend error contract cho duplicate code chưa ổn định và có thể trả generic `500` thay vì stable `409`.

### 9.2 Frontend behavior hiện tại

FE không được:

- assume GET list check đủ để đảm bảo uniqueness;
- block create chỉ dựa vào stale local list;
- hiển thị SQL constraint name;
- hiển thị stack trace/raw backend body cho user.

Khi duplicate/error không có stable machine-readable contract:

```text
Unable to save the course. Please review the information and try again.
```

hoặc equivalent generic safe message.

### 9.3 Target khi backend chuẩn hóa conflict

Nếu backend trả stable `409`/error code cho duplicate Course Code:

- map thành field-level error tại Course Code;
- suggested copy:

```text
This Course Code is already in use.
```

- giữ nguyên toàn bộ form values;
- focus Course Code khi phù hợp.

---

## 10. Create flow

### 10.1 Normal flow

```text
User opens /courses/new
        ↓
CourseCreatePage renders CourseForm(create)
        ↓
User enters code / subject / description
        ↓
User selects Save Course
        ↓
Client validation
        ↓ valid
Normalize trimmed payload
        ↓
POST /course
        ↓ 201
Invalidate related cache
        ↓
Navigate to success destination
```

### 10.2 Suggested API adapter

```ts
export interface CreateCourseInput {
  code: string
  subject: string
  description: string
}

export async function createCourse(
  input: CreateCourseInput,
  signal?: AbortSignal,
): Promise<CourseViewModel> {
  const response = await httpClient.post<unknown>('/course', input, { signal })
  return mapCourseDto(response)
}
```

Nếu backend create response thực tế không trả Course object, adapter phải được chỉnh theo contract thật; không ép mapper lên `undefined`.

### 10.3 Mutation pending

Trong khi POST đang pending:

- primary button disabled;
- Cancel có thể vẫn cho phép hoặc disable tùy mutation navigation policy, nhưng không được tạo request thứ hai;
- fields có thể remain editable hoặc disable; ưu tiên consistency toàn app;
- primary button hiển thị loading state;
- không gửi request duplicate khi double click.

### 10.4 Success

Sau success:

- invalidate `courseKeys.root` hoặc tối thiểu `courseKeys.all()`;
- invalidate Dashboard query/derived data nếu Dashboard cache phụ thuộc Course count;
- nếu response có new Course `id`, preferred destination:

```text
/courses/:id
```

- nếu contract không trả ID, fallback:

```text
/courses
```

Project phải chọn một success navigation rule thống nhất sau khi xác nhận create response.

### 10.5 Error

Submit error phải:

- giữ nguyên `code`;
- giữ nguyên `subject`;
- giữ nguyên `description`;
- re-enable submit;
- hiển thị safe form-level/field-level message;
- không redirect;
- không tự retry mutation.

---

## 11. Edit flow

### 11.1 Route load

```text
/courses/:id/edit
       ↓
validate id > 0 integer
       ↓
GET /course/{id}
       ↓
loading / success / 404 / error
       ↓ success
CourseForm(edit, initialValues)
```

### 11.2 Invalid route ID

Các route param sau không được gửi API:

```text
abc
0
-1
1.5
NaN
```

UI render not-found/invalid-resource state và cho phép Back to Courses.

### 11.3 Edit loading

Trong lúc load Course:

- không render editable form rỗng;
- render page-level loading state/skeleton;
- giữ page header ổn định.

### 11.4 404

Nếu Course không tồn tại:

- hiển thị Resource Not Found;
- có Back to Courses;
- không render stale form.

### 11.5 Update submit

```text
CourseForm submit
      ↓
client validation
      ↓
PUT /course/{id}
      ↓ success
invalidate courses list + course detail + dashboard-related cache
      ↓
/courses/:id
```

### 11.6 No-op Edit

Nếu values sau trim bằng initial values, implementation có thể:

- disable `Update Course`; hoặc
- cho submit idempotent request.

Preferred UX: disable Update khi form pristine nếu dirty-state implementation đơn giản và đáng tin cậy.

Không bắt buộc cho Create.

---

## 12. API error handling

### 12.1 `400`

Nếu backend có stable validation response:

- map được field nào thì render cạnh field;
- không map được thì render form-level error.

### 12.2 `401`

Protected API request gặp `401` phải dùng auth-expired flow hiện có từ `httpClient`.

Form không tự triển khai session logic riêng.

### 12.3 `404`

- Create: không phải expected response cho `/course`, normalize thành form-level error nếu xảy ra.
- Edit preload/update: render not-found behavior phù hợp.

### 12.4 `409`

Khi backend chuẩn hóa duplicate Course Code:

```text
409 → Course Code field error
```

Nếu chưa chuẩn hóa, generic safe error.

### 12.5 `5xx`

Suggested message:

```text
Unable to save the course. Please try again.
```

Không render stack trace, SQL exception hoặc constraint internals.

### 12.6 Network failure

- giữ values;
- re-enable submit;
- safe retry copy;
- mutation chỉ retry khi user chủ động submit lại.

---

## 13. Empty / loading / pending states

| State | Create | Edit |
| --- | --- | --- |
| Page initial loading | Không cần data fetch | Có |
| Empty form | Expected | Không |
| Detail loading | N/A | Có |
| Detail 404 | N/A | Có |
| Detail load error | N/A | Có + Retry |
| Submit pending | Có | Có |
| Submit error | Có | Có |
| Submit success | Redirect | Redirect |

---

## 14. Accessibility

### 14.1 Labels

Mọi field có visible `<label>` gắn với control qua `for/id`.

Required marker `*` không được là dấu hiệu duy nhất; semantic `required` hoặc `aria-required` phải được sử dụng.

### 14.2 Helper/error association

Helper hoặc error phải dùng `aria-describedby`.

Invalid field:

```html
aria-invalid="true"
```

### 14.3 Error visibility

Error không chỉ dựa vào màu đỏ; phải có text.

### 14.4 Keyboard

- Tab order theo visual order: Code → Name → Description → Save → Cancel.
- Tất cả action dùng keyboard được.
- Focus visible.
- Submit dùng native `<form @submit.prevent>` semantics.

### 14.5 Form error

Form-level error nên dùng role phù hợp, ví dụ:

```html
role="alert"
```

hoặc accessible live region tương đương.

### 14.6 Icon

Information/save/cancel icon mang tính decorative nếu button/section đã có visible text; icon không được lặp accessible name gây đọc hai lần.

---

## 15. Responsive

### Desktop

- form card full available content width theo design;
- actions align cuối card;
- textarea đủ chiều cao để đọc description.

### Tablet/mobile

- form giữ một cột;
- input/textarea width 100%;
- action buttons có thể stack hoặc wrap;
- không tạo horizontal scroll do form control;
- tap target đủ lớn;
- helper/error text wrap tự nhiên.

Design không yêu cầu hai-column field layout; không tự chuyển thành multi-column ở desktop nếu không có UX requirement.

---

## 16. Dirty state và navigation

### 16.1 Current requirement

Dirty state có thể được dùng để enable/disable Update trong tương lai.

### 16.2 Unsaved changes confirmation

Không được tự coi là scope bắt buộc nếu product chưa chốt.

Nếu implement sau này, phải áp dụng thống nhất cho:

- Cancel;
- browser Back;
- nav tab;
- route change.

Không chỉ chặn một đường navigation.

---

## 17. Cache invalidation

### 17.1 Create success

Invalidate tối thiểu:

```ts
courseKeys.root
```

hoặc cụ thể:

```ts
courseKeys.all()
```

Dashboard Course count/derived query phải được refresh theo cache architecture thực tế.

### 17.2 Update success

Invalidate:

```ts
courseKeys.all()
courseKeys.detail(id)
```

và Dashboard cache/derived state nếu Dashboard hiển thị Course data bị ảnh hưởng.

Không cần invalidate Grade list chỉ vì sửa Course metadata trừ khi UI grade đang cache nested Course display data và không tự re-resolve.

---

## 18. Source changes đề xuất

### 18.1 Create implementation

```text
src/features/courses/
├── api/
│   ├── course.api.ts
│   └── course.queries.ts
├── components/
│   └── CourseForm.vue
├── model/
│   ├── course.types.ts
│   ├── course.mapper.ts
│   └── course-form.ts              [optional]
└── pages/
    └── CourseCreatePage.vue
```

### 18.2 Edit implementation

```text
src/features/courses/pages/CourseEditPage.vue
```

Route target:

```ts
{
  path: 'courses/:id/edit',
  name: 'course-edit',
  component: () => import('@/features/courses/pages/CourseEditPage.vue'),
}
```

Mount/enable khi route, preload query, update mutation, error states và tests đã hoàn chỉnh.

### 18.3 API adapter target

Create:

```ts
getCourse(id)
createCourse(input)
```

Edit:

```ts
getCourseById(id)
updateCourse(id, input)
```

### 18.4 HTTP client gap

Vì backend dùng `PUT`, `httpClient` cần expose helper tương ứng, ví dụ:

```ts
put<T>(path, body, options?)
```

hoặc feature adapter dùng public generic request nếu sau này public API của core được thiết kế như vậy.

Không bypass centralized error/auth handling bằng raw `fetch()` trong feature.

---

## 19. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-COURSE-FORM-001 | `/courses/new` render Course Management / Add Course | Ready |
| AC-COURSE-FORM-002 | Form có Course Code, Course Name (Subject), Description | Ready |
| AC-COURSE-FORM-003 | Ba field đều là required | Ready |
| AC-COURSE-FORM-004 | Course Code trim trước validate/submit | Ready |
| AC-COURSE-FORM-005 | Subject trim trước validate/submit | Ready |
| AC-COURSE-FORM-006 | Description trim trước validate/submit | Ready |
| AC-COURSE-FORM-007 | Blank/whitespace Code không gọi API | Ready |
| AC-COURSE-FORM-008 | Blank/whitespace Subject không gọi API | Ready |
| AC-COURSE-FORM-009 | Blank/whitespace Description không gọi API | Ready |
| AC-COURSE-FORM-010 | Course Name serialize thành `subject`, không phải `name` | Ready |
| AC-COURSE-FORM-011 | Course Code không bị tự uppercase | Ready |
| AC-COURSE-FORM-012 | Create gửi `POST /course` với đúng payload | Ready |
| AC-COURSE-FORM-013 | Submit pending chặn duplicate request | Ready |
| AC-COURSE-FORM-014 | Save error giữ nguyên form values | Ready |
| AC-COURSE-FORM-015 | Save error không redirect | Ready |
| AC-COURSE-FORM-016 | 5xx/network error hiển thị safe message | Ready |
| AC-COURSE-FORM-017 | Raw SQL/stack trace không hiển thị cho user | Ready |
| AC-COURSE-FORM-018 | Duplicate code không ghi đè record cũ | Ready |
| AC-COURSE-FORM-019 | Stable 409 trong tương lai map được vào Code field | Partial / backend contract gap |
| AC-COURSE-FORM-020 | Create success invalidate Course list cache | Ready |
| AC-COURSE-FORM-021 | Create success refresh Dashboard course count/derived data | Ready |
| AC-COURSE-FORM-022 | Create success điều hướng theo agreed detail/list rule | Ready |
| AC-COURSE-FORM-023 | Cancel Create quay `/courses` và không mutation | Ready |
| AC-COURSE-FORM-024 | Shared `CourseForm` không gọi router/API trực tiếp | Ready |
| AC-COURSE-FORM-025 | UI dùng visible labels + helper text theo design | Ready |
| AC-COURSE-FORM-026 | Field error có `aria-invalid`/`aria-describedby` | Ready |
| AC-COURSE-FORM-027 | Form action dùng được bằng keyboard | Ready |
| AC-COURSE-FORM-028 | Mobile layout một cột và không overflow ngang | Ready |
| AC-COURSE-FORM-029 | Description dùng multi-line textarea | Ready |
| AC-COURSE-FORM-030 | 401 dùng centralized auth-expired flow | Ready |
| AC-COURSE-FORM-031 | Form architecture hỗ trợ `mode='create'|'edit'` | Ready |
| AC-COURSE-FORM-032 | Edit gửi đúng `PUT /course/{id}` với payload normalized | Ready |
| AC-COURSE-FORM-033 | Không dùng DELETE + POST để giả lập Update | Ready |
| AC-COURSE-FORM-034 | Edit preload Course trước khi render editable form | Ready |
| AC-COURSE-FORM-035 | Edit invalid ID không gửi API | Ready |
| AC-COURSE-FORM-036 | Edit 404 render Not Found state | Ready |
| AC-COURSE-FORM-037 | Update dùng cùng validation/UI với Create | Ready |
| AC-COURSE-FORM-038 | Update success invalidate list + detail cache dù response là entity hoặc empty body | Ready |
| AC-COURSE-FORM-039 | Update success quay `/courses/:id` | Ready |
| AC-COURSE-FORM-040 | Edit entry point chỉ enable khi full route/query/mutation đã hoàn chỉnh | Ready |

---

## 20. Edge cases

1. User nhập toàn space ở một field → field invalid.
2. User nhập Course Code lowercase → giữ nguyên case khi gửi.
3. User nhập leading/trailing spaces → trim ở payload.
4. Description có newline nội bộ → không collapse nếu không có rule.
5. User double-click Save → chỉ một mutation active.
6. API chậm → loading state vẫn giữ form values.
7. API fail → không clear form.
8. Duplicate code trả 500 → safe generic error, không raw SQL.
9. Duplicate code sau này trả 409 → map Code field nếu error contract đủ ổn định.
10. 401 trong submit → auth-expired flow hiện có xử lý.
11. Create response body rỗng → không cố map thành Course object nếu contract cho phép rỗng.
12. Create response trả malformed object → centralized/client mapping error, không giả success.
13. Cancel khi chưa submit → không API.
14. Edit route ID `abc` → không GET `NaN`.
15. Edit Course bị xóa trong lúc form mở → update 404 xử lý an toàn.
16. Edit Code đổi sang code đã tồn tại → conflict handling giống Create.
17. Edit form pristine → không bắt buộc gửi update.
18. User nhấn Enter trong Description → newline, không vô tình mất nội dung.

---

## 21. Test mapping

| Test ID | Level | Scenario | Expected | AC |
| --- | --- | --- | --- | --- |
| UT-COURSE-FORM-001 | Unit | Normalize values | Trim 3 field, giữ case code | 004–006, 011 |
| UT-COURSE-FORM-002 | Unit | Required validation | whitespace invalid | 007–009 |
| CT-COURSE-FORM-003 | Component | Render create form | đúng label/helper/action | 001–003,025,029 |
| CT-COURSE-FORM-004 | Component | Invalid submit | field error, không emit valid submit | 007–009 |
| CT-COURSE-FORM-005 | Component | Valid submit | emit `{code,subject,description}` | 010,012 |
| CT-COURSE-FORM-006 | Component | Pending | Save disabled/loading | 013 |
| CT-COURSE-FORM-007 | Component | Submit error | values preserved | 014–017 |
| CT-COURSE-FORM-008 | Component | Cancel | emit cancel; no submit | 023 |
| CT-COURSE-FORM-009 | Component | Accessibility | labels/error association | 025–027 |
| IT-COURSE-FORM-010 | Integration | Create 201 | POST đúng payload + invalidation + redirect | 012,020–022 |
| IT-COURSE-FORM-011 | Integration | Duplicate code generic failure | safe error/no overwrite | 017–019 |
| IT-COURSE-FORM-012 | Integration | 401 | centralized auth-expired | 030 |
| IT-COURSE-FORM-013 | Integration | Double submit | một active request | 013 |
| E2E-COURSE-FORM-014 | E2E | Login → Add Course → Save → View/List | Create hoàn tất | 001–030 |
| CT-COURSE-FORM-015 | Component | Render edit mode | same fields + Update Course | 031,037 |
| IT-COURSE-FORM-016 | Integration | Preload Edit | GET detail → initial values | 034–036 |
| IT-COURSE-FORM-017 | Integration | Update success | `PUT /course/{id}` + invalidate + detail redirect với `200` hoặc `204` | 032,037–039 |

Các test Edit/Update là một phần bắt buộc của implementation vì backend `PUT /course/{id}` đã sẵn sàng.

---

## 22. Traceability

| Requirement | Source |
| --- | --- |
| Create route `/courses/new` | `src/app/router/routes.ts` |
| Current Create placeholder | `src/features/courses/pages/CourseCreatePage.vue` |
| Course DTO fields | `src/features/courses/model/course.types.ts` |
| Course data validation/mapping | `src/features/courses/model/course.mapper.ts` |
| Current API adapter | `src/features/courses/api/course.api.ts` |
| Current query pattern | `src/features/courses/api/course.queries.ts` |
| Query keys | `src/core/api/query-keys.ts` |
| POST capability | `src/core/api/http-client.ts` |
| Backend create endpoint/payload | `docs/architecture/api_integration.md` |
| Required fields + unique code | `docs/standards/validation-rules.md` |
| Form component separation | `docs/standards/component-patterns.md` |
| Accessibility/responsive | `docs/standards/accessibility-and-responsive.md` |
| Course Form visual target | `docs/ui/web/grade_submission/screens/design/course_form.png` |
| Course form textual wireframe | `docs/ui/web/grade_submission/screens/courses/course_form.md` |
| Course module capability | `docs/modules/courses/spec.md` |
| Course tests | `docs/modules/courses/test_spec.md`, `docs/e2e/courses.md` |
| Backend Update endpoint | `PUT /course/{id}` — backend capability đã xác nhận; repository docs/API adapter cần đồng bộ nếu còn thiếu |

---

## 23. Suggested implementation order

1. Tạo form model + validation helpers.
2. Tạo `CourseForm.vue` reusable với `mode`.
3. Bổ sung `BaseTextarea.vue` hoặc equivalent accessible textarea.
4. Bổ sung `createCourse()` trong `course.api.ts`.
5. Bổ sung create mutation/composable theo Vue Query pattern.
6. Replace placeholder `CourseCreatePage.vue` bằng real orchestration.
7. Implement pending/error/success/invalidation/navigation.
8. Viết unit/component/integration tests.
9. Viết/enable Create E2E.
10. Bổ sung `getCourseById()` nếu chưa có và `updateCourse(id, input)` dùng `PUT /course/{id}`.
11. Implement `CourseEditPage.vue`, route `/courses/:id/edit`, preload query, update mutation và enable Edit action.
12. Viết/enable Edit integration + E2E tests.

---

## 24. Definition of Done — Create

Create Course được coi là Done khi:

- [ ] `/courses/new` không còn placeholder.
- [ ] `CourseForm.vue` dùng shared form architecture.
- [ ] Course Code, Subject, Description render đúng design.
- [ ] Required validation hoạt động.
- [ ] `subject` mapping đúng backend.
- [ ] Code không tự uppercase.
- [ ] Description dùng textarea accessible.
- [ ] `POST /course` được tích hợp qua centralized `httpClient`.
- [ ] Double submit bị chặn.
- [ ] Submit error giữ values.
- [ ] Duplicate code không lộ raw database error.
- [ ] Success invalidates Course list/Dashboard-related data.
- [ ] Success navigation được chốt và test.
- [ ] Cancel không mutation.
- [ ] 401 dùng auth-expired flow.
- [ ] Mobile + keyboard + screen-reader basics đáp ứng standards.
- [ ] Unit/component/integration tests pass.
- [ ] Create Course E2E pass.

---

## 25. Definition of Done — Edit

Edit Course chỉ được coi là Done khi:

- [x] Backend có canonical `PUT /course/{id}`.
- [ ] Repository API contract/docs được cập nhật để phản ánh `PUT /course/{id}` nếu hiện còn thiếu.
- [ ] `httpClient`/Course adapter hỗ trợ update mà không bypass core error/auth handling.
- [ ] `/courses/:id/edit` được mount.
- [ ] Invalid route ID không gửi API.
- [ ] Course preload loading/error/404 hoạt động.
- [ ] Edit reuse đúng `CourseForm.vue`; không duplicate form.
- [ ] Update dùng cùng validation với Create.
- [ ] Duplicate code update xử lý an toàn.
- [ ] Update pending chặn double submit.
- [ ] Update error giữ values.
- [ ] Success invalidate Course list + detail + relevant Dashboard cache.
- [ ] Success navigate `/courses/:id`.
- [ ] Edit entry point ở list/detail được enable.
- [ ] Update integration/E2E tests pass.

---

## 26. Open questions cần chốt khi implement

1. `POST /course` trả created Course object hay chỉ status/body khác?
2. Success Create sẽ luôn về `/courses` hay preferred `/courses/:id` khi có ID?
3. Duplicate code backend sẽ chuẩn hóa thành `409` + stable code khi nào?
4. Có business rule chính thức về uppercase/pattern của Course Code không?
5. Có max length cho Code/Subject/Description không?
6. Có cần unsaved-changes confirmation không?
7. Update có cho phép đổi Course Code hay code immutable sau Create?
8. `PUT /course/{id}` trả `200` + updated Course hay `204`/status-only? FE spec đã hỗ trợ cả hai, nhưng nên chốt để test contract chính xác.

Các open question không được dùng để tự phát minh validation hoặc API behavior. Implementation phải giữ contract tối thiểu đã xác nhận ở trên.
