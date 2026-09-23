# Student Form (Create / Update Student) — Spec Pack

**Phụ trách:** Frontend team  
**Trạng thái:** Ready for Create + Update implementation  
**Cập nhật lần cuối:** 2026-09-22

## 1. Bối cảnh

**Student Form** là form dùng chung cho hai use case:

1. **Create Student** — tạo Student mới.
2. **Update Student** — chỉnh sửa Student đã tồn tại.

Mục tiêu kiến trúc là **không duplicate UI, validation hoặc form state** giữa hai màn hình. Hai page chỉ khác nhau ở route, cách lấy dữ liệu ban đầu, mutation và success navigation; phần form phải được reuse từ cùng một component.

Source hiện tại đã có Create route `/students/new`, nhưng `StudentCreatePage.vue` vẫn là placeholder. Backend hiện đã có API Update Student tại `PUT/PATCH /student/{id}`; tuy nhiên FE vẫn chưa có route Edit, `StudentEditPage.vue` và update adapter/mutation tương ứng. Vì vậy spec này định nghĩa đầy đủ UI/behavior cho cả Create và Update theo cùng một shared form, đồng thời coi Update là capability sẵn sàng để tích hợp ở FE.

Spec được xây dựng từ:

- `src/app/router/routes.ts`;
- `src/features/students/pages/StudentCreatePage.vue`;
- `src/features/students/pages/StudentDetailPage.vue`;
- `src/features/students/api/student.api.ts`;
- `src/features/students/api/student.queries.ts`;
- `src/features/students/model/student.types.ts`;
- `src/features/students/model/student.mapper.ts`;
- `src/core/api/http-client.ts`;
- `src/core/api/query-keys.ts`;
- `docs/ui/web/grade_submission/screens/design/student_form.png`;
- `docs/ui/web/grade_submission/screens/students/student_form.md`;
- `docs/modules/students/spec.md`;
- `docs/architecture/student_journey.md`;
- `docs/architecture/api_integration.md`;
- `docs/standards/validation-rules.md`;
- `docs/standards/date-and-time-handling.md`;
- `docs/standards/component-patterns.md`;
- `docs/standards/accessibility-and-responsive.md`;
- `docs/modules/students/test_spec.md`;
- `docs/e2e/students.md`.

### 1.1 Mục tiêu

- Có **một UI Student Form duy nhất** cho Create và Update.
- Không duplicate field markup, validation rule, error rendering hoặc action layout.
- Create mode dùng dữ liệu rỗng và `POST /student`.
- Edit mode preload Student hiện tại và submit qua API Update Student chính thức.
- Student ID luôn do hệ thống quản lý, không editable.
- Date-only giữ đúng `yyyy-MM-dd`, không bị timezone làm lệch ngày.
- Page wrapper chịu trách nhiệm query/mutation/navigation; form component ưu tiên reusable và testable độc lập.

---

## 2. Modes và routes

| Mode | Route | Page | Trạng thái hiện tại |
| --- | --- | --- | --- |
| Create | `/students/new` | `StudentCreatePage.vue` | Route có sẵn, page đang placeholder |
| Edit | `/students/:id/edit` | `StudentEditPage.vue` | Target route, chưa có trong source |

### 2.1 Create mode

Route canonical:

```text
/students/new
```

Route name:

```text
student-create
```

Page header:

```text
Student Management | Add Student
```

Primary action:

```text
Save Student
```

### 2.2 Edit mode

Target route:

```text
/students/:id/edit
```

Target route name:

```text
student-edit
```

Page header:

```text
Student Management | Edit Student
```

Primary action:

```text
Update Student
```

Edit route có thể được implement và enable cùng với FE update integration vì backend update endpoint đã sẵn sàng. Entry point Edit ở list/detail được enable sau khi route, preload và mutation Update hoàn chỉnh.

### 2.3 Related routes

| Route | Mục đích | Quan hệ với Student Form |
| --- | --- | --- |
| `/students` | Student Management | Cancel/default success destination |
| `/students/new` | Create Student | Create wrapper |
| `/students/:id` | Student Detail | Nguồn điều hướng tới Edit và optional success destination |
| `/students/:id/edit` | Edit Student | Target Edit wrapper |

Tất cả Student Form routes nằm dưới authenticated `MainLayout` và phải kế thừa `requiresAuth` behavior hiện có.

---

## 3. Current / Target / Integration gap

### 3.1 Current implementation

Current Create page:

```text
src/features/students/pages/StudentCreatePage.vue
```

chỉ render placeholder:

```text
Student Management | Add Student
Student create page
```

Current Student API mới có:

```http
GET /student/all
DELETE /student/{id}
```

Shared `httpClient` đã support `POST`, nhưng `student.api.ts` chưa có `createStudent()`.

Docs hiện hành còn mô tả:

```http
GET /student/{id}
POST /student
```

cho Student Detail/Create, nhưng source Student API adapter chưa expose đầy đủ các operation này.

### 3.2 Target shared UI

Target phải có một component dùng chung, ví dụ:

```text
src/features/students/components/StudentForm.vue
```

Component này render cùng một layout cho cả Create/Edit và nhận mode + initial values qua props.

### 3.3 Update integration gap

Backend hiện đã hỗ trợ Update Student qua endpoint chính thức:

```http
PUT/PATCH /student/{id}
```

FE hiện còn thiếu phần tích hợp tương ứng:

- `updateStudent()` trong `student.api.ts`;
- update mutation trong `student.queries.ts` hoặc composable tương đương;
- route `/students/:id/edit`;
- `StudentEditPage.vue`;
- enable Edit entry point ở Student list/detail;
- cache invalidation sau update.

Không dùng DELETE + POST để giả lập update.

---

## 4. Kiến trúc component

### 4.1 Target component tree

```text
StudentCreatePage
├── PageHeader
└── BaseCard
    └── StudentForm

StudentEditPage
├── PageHeader
├── EditLoading / EditLoadError / NotFound
└── BaseCard
    └── StudentForm
```

`StudentForm` là phần UI dùng chung:

```text
StudentForm
├── SectionHeader
│   ├── decorative user icon
│   └── Student Information
├── StudentIdField
├── FullNameField
├── BirthDateField
├── FormError
└── Actions
    ├── Primary action
    └── Cancel
```

### 4.2 Responsibility boundary

#### `StudentForm.vue`

Chịu trách nhiệm:

- render field;
- form state;
- shared validation;
- field errors;
- submit event;
- Cancel event;
- pending/disabled UI;
- labels/helper text;
- mode-specific copy nhỏ như button text và Student ID value.

Không chịu trách nhiệm:

- gọi router trực tiếp;
- fetch Student;
- gọi API trực tiếp;
- invalidate Vue Query cache;
- quyết định endpoint update;
- map route param.

#### `StudentCreatePage.vue`

Chịu trách nhiệm:

- khởi tạo form trống;
- gọi create mutation;
- handle create success/error;
- invalidate cache;
- navigation.

#### `StudentEditPage.vue`

Chịu trách nhiệm:

- parse/validate route `id`;
- fetch `GET /student/{id}`;
- render loading/404/load error;
- truyền initial values vào `StudentForm`;
- gọi update mutation qua API Update Student chính thức;
- invalidate list/detail/dashboard-related caches;
- navigation.

---

## 5. Form contract

### 5.1 Shared form mode

Recommended type:

```ts
export type StudentFormMode = 'create' | 'edit'
```

### 5.2 Shared form values

```ts
export interface StudentFormValues {
  name: string
  birthDate: string
}
```

Không đưa `id` vào editable form values vì ID không được user thay đổi.

### 5.3 Suggested component props

```ts
interface StudentFormProps {
  mode: StudentFormMode
  studentId?: number
  initialValues?: StudentFormValues
  pending?: boolean
  submitError?: string | null
}
```

Suggested emits:

```ts
interface StudentFormEmits {
  submit: [values: StudentFormValues]
  cancel: []
}
```

Có thể dùng API component tương đương miễn đảm bảo separation of concerns nêu trên.

### 5.4 Initial values

#### Create

```ts
{
  name: '',
  birthDate: '',
}
```

#### Edit

Sau khi load Student thành công:

```ts
{
  name: student.name,
  birthDate: student.birthDate,
}
```

Không render form edit với dữ liệu rỗng trong lúc Student đang loading, tránh user nhập rồi bị initial data ghi đè.

---

## 6. UI specification

### 6.1 Shared layout

Cả Create và Edit phải sử dụng cùng layout theo `student_form.png`:

```text
Student Management | <Add Student / Edit Student>

+--------------------------------------------------------------+
| Student Information                                          |
|                                                              |
| Student ID                                                   |
| [ Auto-generated after saving / actual ID ]                  |
| helper text                                                  |
|                                                              |
| Full Name *                                                  |
| [..........................................................] |
|                                                              |
| Birth Date *                                                 |
| [ yyyy/MM/dd                                      calendar ] |
| Display format: yyyy/MM/dd                                   |
|                                                              |
|                         [Primary Action] [Cancel]             |
+--------------------------------------------------------------+
```

### 6.2 Student ID

#### Create mode

Value/presentation:

```text
Auto-generated after saving
```

Helper:

```text
Student ID is created by the system.
```

#### Edit mode

Hiển thị Student ID thật:

```text
1001
```

Helper có thể là:

```text
Student ID cannot be changed.
```

Rules cho cả hai mode:

- không editable;
- không validate như input của user;
- không cho phép đổi ID;
- Create không gửi ID trong payload;
- Update lấy ID từ route/entity identity, không lấy từ editable form state.

### 6.3 Full Name

Label:

```text
Full Name *
```

Rules:

- required;
- trim trước validation/submit;
- không chấp nhận chuỗi chỉ gồm whitespace;
- giữ nguyên casing user nhập;
- không tự title-case;
- edit mode preload tên hiện tại.

### 6.4 Birth Date

Label:

```text
Birth Date *
```

Rules:

- required;
- date hợp lệ;
- không cho future date theo frontend guard;
- form state/API payload dùng `yyyy-MM-dd`;
- không convert qua UTC timestamp;
- edit mode preload `student.birthDate` nguyên dạng date-only.

Display/helper:

```text
Display format: yyyy/MM/dd
```

Nếu dùng native `<input type="date">`, browser có thể render format theo locale; source value vẫn phải là `yyyy-MM-dd`.

### 6.5 Actions theo mode

| Mode | Primary button | Cancel |
| --- | --- | --- |
| Create | `Save Student` | Về `/students` |
| Edit | `Update Student` | Về previous safe route hoặc `/students/:id` |

Để hành vi predictable, canonical Edit Cancel destination được khuyến nghị:

```text
/students/:id
```

Nếu Student Detail chưa hoàn chỉnh tại thời điểm implement Edit, fallback:

```text
/students
```

### 6.6 `BaseInput` dependency

`BaseInput.vue` hiện support:

```text
text | password | email
```

Student Form cần một trong hai:

1. mở rộng `BaseInput` để support `type="date"`; hoặc
2. tạo feature-level date field dùng native `<input type="date">` nhưng giữ cùng visual/accessibility convention.

Ưu tiên phương án 1 nếu không làm shared component phức tạp bất hợp lý.

---

## 7. Validation

Validation phải dùng chung giữa Create/Edit.

### 7.1 Full Name

Pseudo-rule:

```ts
const normalizedName = values.name.trim()

if (!normalizedName) {
  errors.name = 'Full Name is required.'
}
```

Không submit nếu invalid.

### 7.2 Birth Date required

Nếu rỗng:

```text
Birth Date is required.
```

### 7.3 Birth Date validity

Giá trị phải là calendar date hợp lệ.

Các case cần cover:

- `2024-02-29` hợp lệ;
- `2025-02-29` không hợp lệ;
- `2026-13-01` không hợp lệ;
- malformed manual input không được submit.

### 7.4 Future date

Nếu birth date > local current calendar date:

```text
Birth Date cannot be in the future.
```

So sánh date-only; không dùng UTC conversion để quyết định ngày hiện tại.

### 7.5 Validation timing

Recommended:

- validate field sau blur hoặc sau lần submit đầu;
- submit luôn validate toàn form;
- sau khi field đã invalid, update error khi user sửa;
- focus field invalid đầu tiên khi submit thất bại nếu phù hợp.

### 7.6 Same validation in both modes

Không tạo rules riêng chỉ vì form ở Edit mode. Nếu backend sau này có update-specific constraint, rule đó phải được bổ sung có chủ đích, không fork toàn bộ form.

---

## 8. Create flow

### 8.1 API

Current documented create contract:

```http
POST /student
Authorization: Bearer <jwt>
Content-Type: application/json
```

Payload:

```json
{
  "name": "Nguyen Van A",
  "birthDate": "1980-07-31"
}
```

Không gửi `id`.

### 8.2 Submit sequence

```text
User enters data
    ↓
StudentForm validates
    ↓
StudentForm emits submit(values)
    ↓
StudentCreatePage calls createStudent(values)
    ↓
POST /student
    ↓
201 success
    ↓
invalidate Student caches
    ↓
navigate /students
```

### 8.3 Pending behavior

Trong lúc create pending:

- primary button disabled;
- Cancel nên disabled nếu navigation có nguy cơ bỏ mutation đang pending;
- không cho double submit;
- field có thể disabled để tránh state UI khác với payload đang gửi;
- aria-busy trên form/container nếu phù hợp.

### 8.4 Success

Sau success:

- invalidate `studentKeys.root` hoặc tối thiểu list query;
- Dashboard student count phải có cơ chế refresh qua shared cache invalidation/query strategy;
- canonical destination: `/students`.

Nếu product quyết định redirect tới Student Detail thì chỉ làm khi response contract cung cấp ID mới đáng tin cậy và Detail đã production-ready.

---

## 9. Edit preload flow

### 9.1 Route identity

Target route:

```text
/students/:id/edit
```

`id` phải parse thành positive integer.

Invalid route param không gọi API update.

### 9.2 Load current Student

Edit page cần:

```http
GET /student/{id}
```

Success response map về `StudentViewModel`:

```ts
interface StudentViewModel {
  id: number
  name: string
  birthDate: string
}
```

Sequence:

```text
Navigate /students/1001/edit
    ↓
validate route id
    ↓
GET /student/1001
    ↓
loading state
    ↓
success
    ↓
<StudentForm
  mode="edit"
  studentId=1001
  initialValues={name,birthDate}
/>
```

### 9.3 Loading state

Khi initial Student đang load:

- không render editable empty form;
- hiển thị skeleton/spinner phù hợp;
- không hiển thị Update button active.

### 9.4 404/not found

Nếu Student không tồn tại:

- hiển thị Student Not Found state;
- không render editable form;
- có action quay về Students List;
- không phát update request.

### 9.5 Load error

Network/5xx:

- hiển thị load error;
- có Retry;
- Retry chỉ gọi lại GET;
- không biến load error thành validation error.

---

## 10. Update flow

### 10.1 Backend contract

Backend hiện đã có Update Student endpoint:

```http
PUT/PATCH /student/{id}
Authorization: Bearer <jwt>
Content-Type: application/json
```

FE phải dùng đúng HTTP method mà backend contract hiện tại expose. Nếu backend hỗ trợ cả `PUT` và `PATCH`, project phải chọn một canonical method cho Student Form và dùng thống nhất trong adapter, tests và docs.

### 10.2 Expected UI payload

Form-level data cần cho update vẫn là:

```json
{
  "name": "Nguyen Van A",
  "birthDate": "1980-07-31"
}
```

Identity lấy từ route/student entity:

```text
studentId = 1001
```

Không cho user sửa `studentId`.

### 10.3 Recommended adapter shape

```ts
export interface UpdateStudentInput {
  name: string
  birthDate: string
}

export function updateStudent(
  id: number,
  input: UpdateStudentInput,
  signal?: AbortSignal,
): Promise<StudentViewModel> {
  // call the official PUT/PATCH /student/{id} contract
}
```

Không hard-code method giả trong shared `StudentForm`.

### 10.4 Update submit sequence

```text
Edit Student loaded
    ↓
User changes name/birthDate
    ↓
StudentForm validates
    ↓
StudentForm emits submit(values)
    ↓
StudentEditPage calls updateStudent(id, values)
    ↓
PUT/PATCH /student/{id}
    ↓
success
    ↓
update/invalidate Student list + detail caches
    ↓
navigate /students/:id (preferred) or /students
```

### 10.5 No-op update

Recommended behavior nếu values sau normalization giống initial values:

- primary button có thể disabled khi form pristine; hoặc
- submit có thể short-circuit mà không gửi request.

Không bắt buộc gửi update request nếu không có thay đổi.

### 10.6 Update cache behavior

Sau update success:

- cập nhật hoặc invalidate `studentKeys.detail(id)`;
- invalidate `studentKeys.all()`/`studentKeys.root`;
- các màn hình dùng student name/profile phải thấy dữ liệu mới;
- Dashboard total Students không đổi, nhưng shared student cache có thể vẫn cần refresh theo strategy chung;
- Grade entity cache chỉ invalidate nếu UI/backend grade payload embed student fields và có nguy cơ stale; không invalidate vô điều kiện nếu không cần.

---

## 11. Shared submit/error behavior

### 11.1 Double submit

Cả Create/Edit:

- không phát request thứ hai khi mutation đang pending;
- primary button disabled trong pending;
- Enter không bypass pending guard.

### 11.2 Mutation error

Khi submit fail:

- giữ nguyên field values;
- không reset form;
- không navigate;
- hiển thị form-level error hoặc field-level error khi backend contract cho phép map rõ;
- primary action re-enable sau failure.

### 11.3 401

Dùng auth-expired flow hiện có của `httpClient`.

Student Form không tự implement logout/token refresh riêng.

### 11.4 4xx validation/conflict

Nếu backend sau này trả structured validation error:

- map field error khi code/field xác định được;
- unknown 4xx render form-level error;
- không đoán message từ HTTP status nếu shared normalizer đã có contract.

### 11.5 Network / 5xx

Hiển thị retryable mutation error nhưng **không auto retry mutation** nếu có nguy cơ duplicate write.

User chủ động submit lại.

---

## 12. Cancel và unsaved changes

### 12.1 Create Cancel

Canonical:

```text
/students
```

Cancel không gọi API.

### 12.2 Edit Cancel

Preferred:

```text
/students/:id
```

Fallback khi detail chưa production-ready:

```text
/students
```

Cancel không gọi update API.

### 12.3 Unsaved-change protection

Current docs chưa yêu cầu confirm khi rời form có thay đổi.

Do đó:

- không bắt buộc trong MVP;
- có thể thêm sau dưới dạng shared dirty-state guard cho cả Create/Edit;
- không implement riêng hai modal khác nhau.

---

## 13. Accessibility

Cả hai mode phải đáp ứng cùng accessibility contract.

- Dùng `<form>` semantic.
- Field có `<label>` liên kết bằng `for/id` hoặc component equivalent.
- Required không chỉ thể hiện bằng màu/asterisk; có semantic `required`/`aria-required` khi phù hợp.
- Error field liên kết qua `aria-describedby`.
- Invalid field có `aria-invalid="true"`.
- Form-level error có live-region phù hợp.
- Primary action là `type="submit"`.
- Cancel là `type="button"`.
- Decorative icon `aria-hidden="true"`.
- Pending state được thông báo cho assistive technology.
- Keyboard user có thể hoàn tất toàn bộ flow không cần mouse.
- Focus order: ID presentation → Full Name → Birth Date → Primary → Cancel, hoặc bỏ ID khỏi tab order nếu chỉ là text/read-only presentation.
- Edit loading/error/404 state phải có heading/message rõ ràng.

---

## 14. Responsive behavior

Theo project standards và design:

### Desktop/tablet

- Card centered trong content area.
- Fields theo vertical form layout.
- Actions align về cuối/right theo design.

### Mobile

- Card dùng chiều rộng khả dụng.
- Không horizontal overflow.
- Inputs chiếm full width.
- Action row có thể stack hoặc wrap.
- Touch target đủ lớn.
- Date control không bị cắt calendar affordance.

Create và Edit không được có responsive layout khác nhau trừ copy/content cần thiết.

---

## 15. State matrix

| State | Create | Edit |
| --- | --- | --- |
| Initial | Empty form | Load Student trước |
| ID | `Auto-generated after saving` | Hiển thị ID hiện tại |
| Name | Empty | Prefilled |
| Birth Date | Empty | Prefilled |
| Primary label | Save Student | Update Student |
| Initial loading | Không cần | Có |
| Initial 404 | N/A | Có |
| Initial load retry | N/A | Có |
| Client validation | Có | Có |
| Pending mutation | Có | Có |
| Mutation error | Có | Có |
| Success | `/students` | `/students/:id` preferred |
| Backend capability | Supported/documented | Supported by backend; FE integration pending |

---

## 16. API/Data contract

### 16.1 Entity

```ts
export interface StudentDto {
  id: number
  name: string
  birthDate: string
}

export interface StudentViewModel {
  id: number
  name: string
  birthDate: string
}
```

### 16.2 Create input

```ts
export interface CreateStudentInput {
  name: string
  birthDate: string
}
```

### 16.3 Update input

UI-level contract:

```ts
export interface UpdateStudentInput {
  name: string
  birthDate: string
}
```

API endpoint cho Update: `PUT/PATCH /student/{id}`. FE dùng method chính xác theo backend contract và giữ thống nhất trong toàn module.

### 16.4 Form normalization

Trước submit:

```ts
const input = {
  name: values.name.trim(),
  birthDate: values.birthDate,
}
```

Không mutate `birthDate` sang datetime.

---

## 17. Recommended source structure

```text
src/features/students/
├── api/
│   ├── student.api.ts
│   └── student.queries.ts
├── components/
│   ├── StudentForm.vue              # shared Create/Edit UI
│   ├── StudentTable.vue
│   └── StudentToolbar.vue
├── model/
│   ├── student-form.ts              # values + validation/normalization
│   ├── student.mapper.ts
│   └── student.types.ts
└── pages/
    ├── StudentCreatePage.vue         # create orchestration
    ├── StudentEditPage.vue           # edit orchestration
    ├── StudentDetailPage.vue
    └── StudentsPage.vue
```

Recommended principle:

```text
Page = orchestration
Form = UI + form behavior
API = transport
Model = types/validation/normalization
```

Không tạo:

```text
CreateStudentForm.vue
EditStudentForm.vue
```

nếu hai file chỉ duplicate cùng fields/layout/validation.

---

## 18. Query keys và cache

Expected query-key pattern nên có:

```ts
studentKeys.root
studentKeys.all()
studentKeys.detail(id)
```

### Create success

- invalidate root/all list.

### Edit initial load

- dùng detail query với `studentKeys.detail(id)`.

### Update success

- set/invalidate detail(id);
- invalidate list/root;
- tránh broad invalidation không cần thiết.

Nếu `studentQueries` hiện mới có `all()`, cần thêm:

```ts
studentQueries.detail(id)
```

trước khi Edit page hoàn chỉnh.

---

## 19. Edge cases

1. Full Name chỉ có spaces.
2. Full Name có Unicode/Vietnamese/Japanese characters.
3. Birth Date rỗng.
4. Birth Date malformed.
5. Leap-day hợp lệ.
6. Leap-day không hợp lệ.
7. Birth Date là ngày mai theo local calendar.
8. User double-click primary button.
9. User nhấn Enter nhiều lần trong pending.
10. Create API timeout/network failure.
11. Create server 500.
12. Create success nhưng response body empty nếu backend contract cho phép.
13. Edit route id không phải integer.
14. Edit route id <= 0.
15. Edit Student 404.
16. Edit initial GET network failure rồi Retry.
17. Edit values giống initial values.
18. Edit name đổi nhưng birthDate không đổi.
19. Edit birthDate đổi nhưng name không đổi.
20. Update pending rồi auth hết hạn.
21. Update fail nhưng values user sửa vẫn còn.
22. Route đổi từ `/students/1/edit` sang `/students/2/edit` trong cùng component lifecycle: form phải phản ánh Student 2, không giữ stale values của Student 1.
23. Cached detail cũ được refetch/update theo Vue Query policy.
24. Student ID hiển thị edit nhưng không nằm trong editable payload.
25. Không dùng delete + create; Update phải gọi endpoint Update Student chính thức.

---

## 20. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-STUDENT-FORM-001 | Create và Edit dùng cùng `StudentForm` UI/component contract | Ready |
| AC-STUDENT-FORM-002 | Không duplicate field markup/validation giữa Create và Edit | Ready |
| AC-STUDENT-FORM-003 | `/students/new` render Create mode | Ready |
| AC-STUDENT-FORM-004 | Create header là `Student Management | Add Student` | Ready |
| AC-STUDENT-FORM-005 | Create Student ID hiển thị system-generated và không editable | Ready |
| AC-STUDENT-FORM-006 | Full Name required sau trim | Ready |
| AC-STUDENT-FORM-007 | Birth Date required và phải là calendar date hợp lệ | Ready |
| AC-STUDENT-FORM-008 | Future Birth Date bị chặn ở frontend | Ready |
| AC-STUDENT-FORM-009 | Form/API giữ Birth Date dạng `yyyy-MM-dd` | Ready |
| AC-STUDENT-FORM-010 | Create submit không gửi Student ID | Ready |
| AC-STUDENT-FORM-011 | Create hợp lệ gọi đúng `POST /student` một lần | Ready |
| AC-STUDENT-FORM-012 | Create pending ngăn double submit | Ready |
| AC-STUDENT-FORM-013 | Create error giữ nguyên input | Ready |
| AC-STUDENT-FORM-014 | Create success invalidate Student cache và navigate `/students` | Ready |
| AC-STUDENT-FORM-015 | Create Cancel không gửi mutation và về `/students` | Ready |
| AC-STUDENT-FORM-016 | Shared form đổi primary label theo mode | Ready |
| AC-STUDENT-FORM-017 | Edit mode hiển thị actual Student ID read-only | Ready for UI |
| AC-STUDENT-FORM-018 | Edit mode preload Full Name và Birth Date từ Student hiện tại | Ready for UI/query |
| AC-STUDENT-FORM-019 | Edit route param phải là positive integer | Ready for UI/query |
| AC-STUDENT-FORM-020 | Edit initial loading không render empty editable form | Ready for UI/query |
| AC-STUDENT-FORM-021 | Edit unknown Student hiển thị Not Found và không submit update | Ready for UI/query |
| AC-STUDENT-FORM-022 | Edit load error hỗ trợ Retry GET | Ready for UI/query |
| AC-STUDENT-FORM-023 | Edit validation dùng cùng rules với Create | Ready |
| AC-STUDENT-FORM-024 | Edit primary label là `Update Student` | Ready for UI |
| AC-STUDENT-FORM-025 | Student ID không thể sửa và không lấy từ form payload | Ready |
| AC-STUDENT-FORM-026 | Update không được giả lập bằng DELETE + POST | Ready |
| AC-STUDENT-FORM-027 | `/students/:id/edit` được implement và enable khi FE update integration hoàn chỉnh | Ready |
| AC-STUDENT-FORM-028 | Update gọi `PUT/PATCH /student/{id}` đúng một lần | Ready |
| AC-STUDENT-FORM-029 | Update success refresh list + detail cache | Ready |
| AC-STUDENT-FORM-030 | Update error giữ nguyên edited values | Ready |
| AC-STUDENT-FORM-031 | Edit Cancel không gửi mutation | Ready for UI |
| AC-STUDENT-FORM-032 | 401 dùng centralized auth-expired behavior | Ready |
| AC-STUDENT-FORM-033 | Form hỗ trợ keyboard submit/cancel đúng semantic | Ready |
| AC-STUDENT-FORM-034 | Error fields có accessible relationship với input | Ready |
| AC-STUDENT-FORM-035 | Create/Edit dùng cùng responsive layout | Ready |
| AC-STUDENT-FORM-036 | Edit route chuyển sang ID khác không giữ stale form values | Ready for UI/query |
| AC-STUDENT-FORM-037 | Mutation pending không auto retry/double-write | Ready |
| AC-STUDENT-FORM-038 | No-op edit không bắt buộc phát update request | Ready for UI, backend-independent |

---

## 21. Suggested tests

### 21.1 Unit — form model/validation

| Test ID | Scenario | AC |
| --- | --- | --- |
| UT-STUDENT-FORM-001 | trim name | 006 |
| UT-STUDENT-FORM-002 | whitespace-only name invalid | 006 |
| UT-STUDENT-FORM-003 | required birthDate | 007 |
| UT-STUDENT-FORM-004 | leap date valid/invalid | 007 |
| UT-STUDENT-FORM-005 | future date invalid | 008 |
| UT-STUDENT-FORM-006 | normalization preserves date-only | 009 |
| UT-STUDENT-FORM-007 | Create/Edit share same validation function | 002, 023 |

### 21.2 Component — `StudentForm.vue`

| Test ID | Scenario | AC |
| --- | --- | --- |
| CT-STUDENT-FORM-001 | create mode renders generated-ID text | 005 |
| CT-STUDENT-FORM-002 | edit mode renders actual ID | 017 |
| CT-STUDENT-FORM-003 | create primary label `Save Student` | 016 |
| CT-STUDENT-FORM-004 | edit primary label `Update Student` | 024 |
| CT-STUDENT-FORM-005 | initialValues prefill name/birthDate | 018 |
| CT-STUDENT-FORM-006 | valid submit emits normalized values | 006-010 |
| CT-STUDENT-FORM-007 | invalid submit does not emit | 006-008 |
| CT-STUDENT-FORM-008 | pending prevents repeated submit | 012, 037 |
| CT-STUDENT-FORM-009 | submitError does not clear fields | 013, 030 |
| CT-STUDENT-FORM-010 | cancel emit has no submit side effect | 015, 031 |
| CT-STUDENT-FORM-011 | accessibility labels/errors | 033, 034 |

### 21.3 Integration — Create page

| Test ID | Scenario | AC |
| --- | --- | --- |
| IT-STUDENT-CREATE-001 | valid form → POST once | 011 |
| IT-STUDENT-CREATE-002 | payload excludes id | 010 |
| IT-STUDENT-CREATE-003 | success invalidates cache + redirects | 014 |
| IT-STUDENT-CREATE-004 | API error preserves values | 013 |
| IT-STUDENT-CREATE-005 | 401 uses auth-expired flow | 032 |

### 21.4 Integration — Edit page

| Test ID | Scenario | AC |
| --- | --- | --- |
| IT-STUDENT-EDIT-001 | valid ID → detail GET → prefilled form | 018-020 |
| IT-STUDENT-EDIT-002 | invalid route ID → no GET/update | 019 |
| IT-STUDENT-EDIT-003 | 404 → not-found state | 021 |
| IT-STUDENT-EDIT-004 | initial GET fail → Retry works | 022 |
| IT-STUDENT-EDIT-005 | route ID changes → new Student values | 036 |
| IT-STUDENT-EDIT-006 | valid edit → PUT/PATCH đúng một lần | 026-028 |

### 21.5 Integration/E2E — Update

| Test ID | Scenario | AC |
| --- | --- | --- |
| E2E-STUDENT-EDIT-001 | open Edit from existing Student | 017-024 |
| E2E-STUDENT-EDIT-002 | edit name and update success | 028-029 |
| E2E-STUDENT-EDIT-003 | edit birthDate and update success | 028-029 |
| E2E-STUDENT-EDIT-004 | update failure preserves edited data | 030 |
| E2E-STUDENT-EDIT-005 | cancel leaves data unchanged | 031 |
| E2E-STUDENT-EDIT-006 | double submit issues one request | 037 |

Các E2E Update là một phần của Definition of Done cho Student Edit.

---

## 22. Traceability

| Requirement | Source / evidence |
| --- | --- |
| Student form design | `docs/ui/web/grade_submission/screens/design/student_form.png` |
| Existing Add/Edit design intent | `docs/ui/web/grade_submission/screens/students/student_form.md` |
| Create route | `src/app/router/routes.ts` |
| Current Create placeholder | `src/features/students/pages/StudentCreatePage.vue` |
| Student entity | `src/features/students/model/student.types.ts` |
| Student mapping | `src/features/students/model/student.mapper.ts` |
| Existing list API | `src/features/students/api/student.api.ts` |
| HTTP POST support | `src/core/api/http-client.ts` |
| Create API contract | `docs/modules/students/spec.md` / architecture API docs |
| Update backend capability | Backend hiện có `PUT/PATCH /student/{id}` theo thông tin backend hiện tại |
| Edit cannot be simulated | `docs/architecture/wireframe_alignment.md`, module/docs standards |
| Date handling | `docs/standards/date-and-time-handling.md` |
| Validation | `docs/standards/validation-rules.md` |
| Responsive/accessibility | `docs/standards/accessibility-and-responsive.md` |

---

## 23. Current vs Target capability matrix

| Capability | Current source | Target spec |
| --- | --- | --- |
| `/students/new` route | Có | Reuse Create wrapper |
| Create page UI | Placeholder | Complete shared form |
| Shared `StudentForm` | Chưa có | Có |
| `POST /student` adapter | Chưa expose trong `student.api.ts` | Có |
| Create validation | Chưa có | Có |
| Date input support | `BaseInput` chưa support `date` | Bổ sung/reuse |
| GET Student detail adapter/query | Chưa expose đầy đủ ở Student API/query source | Bổ sung cho Edit |
| `/students/:id/edit` route | Chưa có | Target |
| Edit page | Chưa có | Target wrapper |
| Edit preload | Chưa có | Có |
| Update UI | Chưa có | Reuse shared form |
| Update backend endpoint | Có ở backend: `PUT/PATCH /student/{id}` | FE phải tích hợp |
| Update mutation | Chưa có ở FE | Bổ sung `updateStudent()` + mutation |
| Delete+Create workaround | Không | Cấm |

---

## 24. Implementation order

Triển khai theo thứ tự:

1. Tách shared form types/validation/normalization.
2. Implement `StudentForm.vue` hỗ trợ `mode="create" | "edit"`.
3. Implement Create wrapper với `POST /student`.
4. Bổ sung `GET /student/{id}` adapter + detail query nếu source chưa có.
5. Implement `StudentEditPage.vue` ở mức preload/UI và component tests.
6. Thêm `updateStudent()` adapter dùng `PUT/PATCH /student/{id}` theo backend contract.
7. Bổ sung update mutation và pending/error handling.
8. Mount/enable `/students/:id/edit` production route.
9. Bật Edit action ở Student list/detail.
10. Bổ sung integration/E2E update success/error.
11. Cập nhật module docs/API docs để phản ánh Update capability đã active.

Điểm quan trọng: **shared form phải được thiết kế cho cả hai mode ngay từ bước 2**, không chờ backend Update rồi mới refactor Create form.

---

## 25. Definition of Done

### Shared UI / Create

- [ ] Có một `StudentForm.vue` dùng chung.
- [ ] Form nhận `create/edit` mode.
- [ ] Form không gọi API/router trực tiếp.
- [ ] Create mode đúng design.
- [ ] Edit mode render được từ `initialValues` trong component tests/story/dev harness.
- [ ] Student ID read-only đúng từng mode.
- [ ] Shared validation chạy cho cả hai mode.
- [ ] Birth Date giữ `yyyy-MM-dd`.
- [ ] Create gửi đúng `POST /student` payload.
- [ ] Create pending ngăn double submit.
- [ ] Create error không mất input.
- [ ] Create success invalidate cache và navigate đúng.
- [ ] Accessibility/responsive pass.
- [ ] Unit/component/integration tests pass.

### Edit / Update

- [ ] Có target `StudentEditPage.vue` architecture.
- [ ] Edit load Student bằng ID và prefill cùng `StudentForm`.
- [ ] Loading/404/load-error states được định nghĩa/test.
- [ ] Không duplicate Create form markup.
- [ ] Không có delete+create workaround.

### Update activation

- [ ] FE xác nhận method chính xác (`PUT` hoặc `PATCH`) từ backend contract.
- [ ] `updateStudent()` dùng `PUT/PATCH /student/{id}` chính thức.
- [ ] `/students/:id/edit` được enable production.
- [ ] Edit action list/detail được enable.
- [ ] Update pending ngăn double submit.
- [ ] Update success refresh list/detail caches.
- [ ] Update error giữ edited values.
- [ ] Update integration/E2E tests pass.

---

## 26. Quyết định cuối cùng

**Student Form phải là UI dùng chung cho Create và Update.**

Canonical architecture:

```text
                   +----------------------+
/students/new ---> | StudentCreatePage    |
                   +----------+-----------+
                              |
                              v
                     +-------------------+
                     | StudentForm.vue   |
                     | shared UI/rules   |
                     +-------------------+
                              ^
                              |
                   +----------+-----------+
/students/:id/edit>| StudentEditPage      |
                   +----------------------+
```

Khác biệt giữa hai mode chỉ nằm ở orchestration:

```text
CREATE
initial = empty
ID = auto-generated message
button = Save Student
mutation = POST /student
success = /students

EDIT
initial = GET /student/:id
ID = actual read-only ID
button = Update Student
mutation = PUT/PATCH /student/:id
success = /students/:id preferred
```

Không được tạo hai form độc lập chỉ vì Create và Edit có mutation khác nhau.
