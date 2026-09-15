# Student Management — Spec Pack

**Phụ trách:** Frontend team  
**Trạng thái:** Ready for implementation — current screen is placeholder  
**Cập nhật lần cuối:** 2026-09-08

## 1. Bối cảnh

Màn hình **Student Management** là màn hình danh sách và quản lý sinh viên tại route `/students` của Grade Submission System.

Source hiện tại trong `src/features/students/pages/StudentsPage.vue` mới chỉ là placeholder:

```vue
<template>
  <section>
    Student Page
  </section>
</template>
```

Vì vậy spec pack này mô tả **màn hình hoàn chỉnh cần implement**, dựa trên:

- wireframe/design hiện có trong `docs/ui/web/grade_submission/screens/design/student_management.png`;
- mô tả UI tại `docs/ui/web/grade_submission/screens/students/students_list.md`;
- nghiệp vụ Student tại `docs/modules/students/spec.md`;
- Student journey tại `docs/architecture/student_journey.md`;
- API contract tại `docs/architecture/api_integration.md`;
- data model tại `docs/architecture/data_model.md`;
- test specification tại `docs/modules/students/test_spec.md` và `docs/e2e/students.md`;
- UI/shared components và conventions đang tồn tại trong source.

Mục tiêu của spec pack:

1. Xác định chính xác boundary của Student Management List.
2. Chuẩn hóa UI, API interaction, search, pagination và actions.
3. Tách rõ Current / Target / Backlog.
4. Cung cấp acceptance criteria có thể dùng trực tiếp cho implementation và testing.
5. Không phát minh chức năng backend chưa được hỗ trợ.

---

## 2. Source và boundary

### 2.1 Route

Canonical route hiện tại trong source:

```text
/students
```

Định nghĩa tại:

```text
src/app/router/routes.ts
```

Các route liên quan:

| Route | Mục đích | Quan hệ với Student Management |
| --- | --- | --- |
| `/students` | Student Management List | Màn hình thuộc phạm vi spec này |
| `/students/new` | Add Student | Destination của nút **Add Student** |
| `/students/:id` | Student Detail | Destination của action **View** |

### 2.2 Current implementation

Current source:

```text
src/features/students/pages/StudentsPage.vue
```

Hiện trạng:

- Chỉ render text `Student Page`.
- Chưa có PageHeader.
- Chưa có Student table.
- Chưa có search.
- Chưa có pagination.
- Chưa có API integration.
- Chưa có loading / empty / error state.
- Chưa có Add / View / Edit / Delete actions.

### 2.3 Target implementation

Target Student Management phải cung cấp:

- Page title `Student Management` và subtitle `List`.
- Search theo Student Name hoặc Student ID.
- Student table.
- Client-side pagination.
- Add Student navigation.
- View Student navigation.
- Delete Student có confirmation.
- Edit Student visible hoặc hidden/disabled theo design, nhưng tuyệt đối không phát request update.
- Loading state.
- Empty collection state.
- No-search-result state.
- List error + Retry.
- Delete pending / error / success handling.
- Responsive và accessibility theo standards của project.

### 2.4 Backlog / unsupported

Không thuộc target hiện tại:

- Update/Edit Student qua backend.
- Server-side search.
- Server-side pagination.
- Bulk selection / bulk delete.
- Sorting tùy ý từ UI nếu chưa có product requirement.
- Export/import Student.

Backend hiện không có `PUT` hoặc `PATCH /student/{id}`. Không được dùng delete + create để giả lập edit.

---

## 3. Source of truth và ưu tiên khi có conflict

Khi các tài liệu hoặc source mâu thuẫn, áp dụng thứ tự sau:

1. Backend API contract đã được ghi nhận trong `docs/architecture/api_integration.md`.
2. Target design `student_management.png` và `students_list.md`.
3. Student module spec / journey.
4. Shared UI conventions và patterns trong source hiện tại.
5. Placeholder hiện tại chỉ dùng để xác định implementation status, không dùng làm target behavior.

Canonical decisions cho màn hình này:

- Route: `/students`.
- API list: `GET /student/all`.
- API delete: `DELETE /student/{id}`.
- Student fields: `id`, `name`, `birthDate`.
- Birth Date hiển thị `yyyy/MM/dd`.
- Page size: `10`.
- Search và pagination: client-side.
- Edit: unsupported.

---

## 4. Phạm vi

### 4.1 In scope

- Mở màn hình Student Management List.
- Tải Student list từ backend.
- Hiển thị ID, Student Name, Birth Date.
- Search theo name / ID.
- Client-side pagination.
- Add Student navigation.
- View Student navigation.
- Edit unsupported state.
- Delete confirmation và delete API call.
- Empty / no-result / loading / error states.
- Retry list loading.
- Delete pending / error / success state.
- Clamp pagination sau khi delete làm trang hiện tại rỗng.
- Responsive table và toolbar.
- Keyboard/accessibility cho actions và dialog.

### 4.2 Out of scope

- Chi tiết form `/students/new`.
- Chi tiết màn hình `/students/:id`.
- Grade table bên trong Student Detail.
- Backend implementation.
- Student update/edit API.
- Server-side filtering/pagination.
- Authentication implementation chi tiết.
- Dashboard invalidation implementation chi tiết ngoài requirement invalidate/refetch liên quan.

---

## 5. UI specification

### 5.1 Page composition

Target layout:

```text
MainLayout
└── StudentsPage
    ├── PageHeader
    │   ├── title: Student Management
    │   └── subtitle: List
    │
    └── BaseCard
        ├── StudentToolbar
        │   ├── Search input
        │   └── Add Student button
        │
        ├── Loading / Error / Empty / Table region
        │   └── StudentTable
        │       ├── ID
        │       ├── Student Name
        │       ├── Birth Date
        │       └── Actions
        │           ├── View
        │           ├── Edit (disabled/unsupported)
        │           └── Delete
        │
        └── Footer region
            ├── Showing x–y of z students
            ├── Edit unavailable note
            └── Pagination

Delete action
└── Confirm Delete Dialog
```

### 5.2 Header

Phải sử dụng hoặc match behavior của shared `PageHeader.vue`:

```text
Student Management | List
```

### 5.3 Toolbar

Search input:

```text
Search by student name or ID
```

Add button:

```text
+ Add Student
```

Behavior:

- Search nằm bên trái.
- Add Student nằm bên phải ở desktop.
- Mobile: toolbar được phép chuyển thành một cột.
- Add Student phải usable bằng keyboard.

### 5.4 Student table

Columns theo đúng thứ tự:

```text
ID | Student Name | Birth Date | Actions
```

Mỗi row hiển thị:

| Field | Source | Display |
| --- | --- | --- |
| ID | `student.id` | number/string representation |
| Student Name | `student.name` | nguyên giá trị sau mapping |
| Birth Date | `student.birthDate` | `yyyy/MM/dd` |
| Actions | UI actions | View / Edit / Delete |

### 5.5 Action buttons

#### View

- Variant: secondary/outlined theo design.
- Có icon Eye nếu dùng Lucide như các màn hình khác.
- Click → `/students/{id}`.
- Không mutate data.

#### Edit

Backend hiện không hỗ trợ update Student.

Target behavior:

- Có thể **disabled** để khớp design, hoặc hidden nếu product quyết định.
- Nếu visible + disabled, nên có tooltip/title:

```text
Edit is currently unavailable
```

- Không được emit update request.
- Không được navigate tới edit route giả.
- Không được delete + recreate Student.

Design hiện tại hiển thị note ở footer:

```text
Edit is currently unavailable.
```

#### Delete

- Variant: danger.
- Click không gọi API ngay.
- Mở confirmation dialog.

### 5.6 Footer của list

Khi có filtered records, hiển thị summary:

```text
Showing {start}-{end} of {filteredTotal} students
```

Ví dụ:

```text
Showing 1-10 of 120 students
```

`filteredTotal` phải là tổng sau search, không phải tổng collection gốc.

Phần footer cũng có:

- edit unavailable note nếu Edit visible disabled;
- Previous;
- page numbers;
- Next.

---

## 6. Data contract

### 6.1 Backend DTO

Theo architecture docs:

```ts
export interface StudentDto {
  id: number
  name: string
  birthDate: string // yyyy-MM-dd
}
```

### 6.2 Frontend view model

Target tối thiểu:

```ts
export interface StudentViewModel {
  id: number
  name: string
  birthDate: string
}
```

Có thể giữ `birthDate` dạng ISO trong model và format tại presentation layer.

Không bind trực tiếp raw response vào component nếu project bổ sung adapter layer.

### 6.3 Birth Date mapping

API:

```text
1980-07-31
```

UI:

```text
1980/07/31
```

Shared utility hiện có:

```text
src/shared/utils/date.ts
```

với `formatDisplayDate()` thay `-` bằng `/`.

Target requirement:

- Student list phải dùng cùng date-format convention với các màn hình Student khác.
- Không đổi timezone vì contract là date-only.
- Invalid date từ backend không được làm crash page; cần fallback an toàn nếu adapter/date utility được harden.

---

## 7. API contract

### 7.1 Load list

```http
GET /student/all
Authorization: Bearer <jwt>
```

Expected success:

```text
200 OK
```

Response là collection Student có tối thiểu:

```json
[
  {
    "id": 1,
    "name": "Nguyen Van A",
    "birthDate": "1980-07-31"
  }
]
```

Student Management phải tải **toàn bộ array**, sau đó search và paginate tại client.

### 7.2 Delete Student

```http
DELETE /student/{id}
Authorization: Bearer <jwt>
```

Expected success:

```text
204 No Content
```

Sau success:

- record phải biến mất khỏi Student list;
- list state phải được refresh hoặc cache được invalidate;
- dữ liệu liên quan Students/Grades/Dashboard cần được coi là stale nếu app dùng cache layer;
- current page phải được clamp nếu page cuối trở thành rỗng.

### 7.3 API error normalization

Frontend nên normalize lỗi về contract chung:

```ts
interface ApiError {
  status: number
  message: string
  code?: string
  details?: unknown
}
```

Không render trực tiếp raw backend stack/error payload.

---

## 8. Normal flows

### 8.1 Initial load

1. User navigate tới `/students`.
2. Page render header và card shell.
3. Page vào loading state.
4. Gọi `GET /student/all` một lần cho initial load.
5. Khi success:
   - map DTO → view model;
   - `search = ''`;
   - `page = 1`;
   - `pageSize = 10`;
   - filtered list = toàn bộ students;
   - render tối đa 10 records đầu tiên.
6. Loading state kết thúc.

### 8.2 Search by name

1. User nhập text vào search box.
2. Keyword được `trim()`.
3. Name comparison không phân biệt hoa thường.
4. Filter chạy trên array đã tải.
5. Không phát thêm request `GET /student/all` cho mỗi ký tự.
6. Khi keyword thay đổi, page reset về `1`.
7. Pagination và summary dùng filtered result.

Ví dụ:

```text
Input: "nguyen"
Student: "Nguyen Van A"
Result: match
```

### 8.3 Search by ID

- Convert `student.id` sang string.
- Search theo string ID.
- Substring matching được chấp nhận theo docs hiện tại.

Ví dụ:

```text
keyword "12" có thể match ID 12, 120, 312
```

Nếu product muốn exact-only thì cần change request riêng; spec hiện tại theo substring behavior.

### 8.4 Clear search

Khi search trở về empty/whitespace-only:

- hiển thị lại toàn bộ collection;
- page = 1;
- total = tổng Student list.

### 8.5 Pagination

Page size:

```text
10
```

Rules:

- Pagination áp dụng sau filtering.
- Previous disabled khi `page <= 1`.
- Next disabled khi `page >= totalPages`.
- Page number hiện tại có active state và `aria-current="page"`.
- Summary tính:

```text
start = (page - 1) * pageSize + 1
end   = min(page * pageSize, filteredTotal)
```

- Không hiển thị `Showing 1-10 of 0`.
- Nếu collection/filter result bằng 0, dùng empty state tương ứng.

### 8.6 Add Student

1. User click **Add Student**.
2. Navigate:

```text
/students/new
```

Không có API call từ list page tại bước này.

### 8.7 View Student

1. User click View tại row.
2. Navigate:

```text
/students/{student.id}
```

### 8.8 Delete Student

1. User click Delete tại một row.
2. UI lưu selected Student làm delete target.
3. Mở confirm dialog.
4. Dialog hiển thị rõ Student target.
5. Dialog cảnh báo grade liên quan có thể bị xóa do cascade mapping.
6. User chọn Cancel:
   - đóng dialog;
   - không gọi API;
   - trả focus về Delete trigger nếu có thể.
7. User chọn Confirm:
   - disable actions cần thiết trong dialog;
   - hiển thị pending/loading state;
   - gọi `DELETE /student/{id}`.
8. Success `204`:
   - đóng dialog;
   - remove/refetch list;
   - clamp page nếu cần;
   - thông báo success nếu app có notification pattern.
9. Failure:
   - giữ context Student target;
   - hiển thị error;
   - cho phép retry/close;
   - không giả định record đã bị xóa.

---

## 9. Delete confirmation dialog

### 9.1 Required content

Dialog cần truyền đạt tối thiểu:

- Đây là thao tác xóa Student.
- Student target: name và/hoặc ID.
- Hành động có thể ảnh hưởng các Grade liên quan.
- Có Cancel và Confirm Delete.

Suggested copy:

```text
Delete student?

Are you sure you want to delete "{student.name}" (ID: {student.id})?
Related grade records may also be deleted.

[Cancel] [Delete]
```

Copy có thể điều chỉnh theo locale strategy, nhưng ý nghĩa không được mất.

### 9.2 Pending state

Khi request delete đang chạy:

- Confirm button disabled/loading.
- Không cho gửi duplicate delete request.
- Cancel có thể disabled nếu việc đóng dialog gây mất trạng thái không rõ ràng.

### 9.3 Error state

Nếu delete fail:

- Hiển thị general error trong dialog hoặc notification.
- Không remove row trước khi xác nhận success nếu không implement optimistic rollback đầy đủ.
- User có thể retry.

---

## 10. Loading, empty và error states

### 10.1 Initial loading

Khi list request pending:

- giữ page shell/header ổn định;
- table region hiển thị loading indicator/skeleton/message;
- không hiển thị stale empty state;
- Add Student có thể vẫn enabled nếu navigation độc lập với list request.

Accessible loading text tối thiểu:

```text
Loading students...
```

### 10.2 Empty collection

Điều kiện:

```text
GET /student/all success + total students = 0 + search empty
```

Suggested message:

```text
No students yet.
```

CTA Add Student vẫn visible.

### 10.3 No search results

Điều kiện:

```text
original collection > 0
AND normalized search != empty
AND filteredTotal = 0
```

Suggested message:

```text
No students found.
```

Không hiển thị pagination.

Có thể cho phép user clear search trực tiếp nếu UI pattern hỗ trợ.

### 10.4 List load error

Nếu `GET /student/all` fail:

- không render empty collection như thể API trả `[]`;
- hiển thị error state;
- có Retry action;
- Retry gọi lại list endpoint.

Suggested generic message:

```text
Unable to load students. Please try again.
```

### 10.5 Authentication error

Nếu request trả `401` hoặc auth layer xác định token invalid/expired:

- xử lý theo global authentication flow;
- không biến thành “No students found”.

---

## 11. Validation và normalization

### 11.1 Search

- Search là optional.
- Trim leading/trailing whitespace.
- Empty sau trim = no filter.
- Name comparison case-insensitive.
- ID comparison qua string.
- Không áp dụng arbitrary max length nếu chưa có project standard.

### 11.2 Student IDs

- IDs từ API được coi là positive integer theo domain expectation.
- Khi tạo detail route, dùng ID của record đã load; không synthesize ID.

### 11.3 Dates

- `birthDate` API contract: `yyyy-MM-dd`.
- UI display: `yyyy/MM/dd`.
- Không parse thành local datetime gây lệch ngày.

---

## 12. Client state model

Suggested logical state:

```ts
interface StudentManagementState {
  students: StudentViewModel[]
  search: string
  page: number
  pageSize: 10
  isLoading: boolean
  loadError: ApiError | null
  deleteTarget: StudentViewModel | null
  isDeleting: boolean
  deleteError: ApiError | null
}
```

Derived state:

```ts
normalizedSearch
filteredStudents
filteredTotal
totalPages
paginatedStudents
startItem
endItem
```

Không cần global state nếu data chỉ dùng tại feature và app chưa có state/cache layer. Nếu dùng query/cache library sau này, source of truth phải tránh duplicated local cache.

---

## 13. Expected source structure

Để match conventions đang có ở Courses/Grades, target Student feature nên tách tối thiểu:

```text
src/features/students/
├── components/
│   ├── StudentToolbar.vue
│   ├── StudentTable.vue
│   └── StudentDeleteDialog.vue        # nếu chưa có shared dialog
├── model/
│   ├── student.types.ts
│   └── student.mapper.ts              # optional nếu có DTO/ViewModel adapter
├── pages/
│   ├── StudentsPage.vue
│   ├── StudentCreatePage.vue
│   └── StudentDetailPage.vue
└── api/                               # nếu project áp dụng feature API layer
    └── student.api.ts
```

Shared components hiện có nên reuse khi phù hợp:

```text
src/shared/ui/PageHeader.vue
src/shared/ui/BaseCard.vue
src/shared/ui/BaseInput.vue
src/shared/ui/BaseButton.vue
src/shared/ui/Pagination.vue
src/shared/utils/date.ts
```

Không bắt buộc đúng tên file ở trên nếu project architecture được thay đổi có chủ đích; behavior trong spec mới là contract chính.

---

## 14. URL/search state

Architecture doc yêu cầu search/page được lưu trong URL query để state có thể khôi phục khi navigation/back/forward.

Target behavior:

- Search state và page state nên có thể sync với route query.
- Reload/back-forward không nên mất filter/page nếu query đang tồn tại.
- Khi search thay đổi, page reset 1 trước khi sync URL.
- Invalid page từ URL phải được normalize/clamp.

Tên query key cần giữ nhất quán trong implementation và tests. Nếu chưa có convention toàn app, implementation plan phải chốt trước khi code.

---

## 15. Accessibility

Theo `docs/standards/accessibility-and-responsive.md`:

### 15.1 Search

Search input phải có accessible name thực sự.

Không được chỉ dựa vào placeholder.

Acceptable approaches:

- visible `<label>`;
- visually hidden label;
- `aria-label="Search students by name or ID"`.

Lưu ý: `BaseInput.vue` hiện chỉ render label khi prop `label` được truyền; implementation phải truyền label hoặc mở rộng component phù hợp.

### 15.2 Table

- Dùng semantic `<table>`, `<thead>`, `<tbody>`, `<th>`.
- Column headers readable bằng assistive technology.
- Action buttons phải có text hoặc accessible label.
- Không dùng icon-only button không nhãn.

### 15.3 Pagination

- Page hiện tại dùng `aria-current="page"`.
- Previous/Next disabled đúng boundary.
- Page controls keyboard accessible.

Shared `Pagination.vue` hiện đã có `aria-label` cho page number và `aria-current`; nên reuse nếu behavior phù hợp.

### 15.4 Delete dialog

- Có dialog semantics (`role="dialog"` / native equivalent).
- Có accessible title.
- Focus chuyển vào dialog khi mở.
- Focus được trap trong dialog khi mở.
- Escape behavior rõ ràng nếu hỗ trợ.
- Khi đóng, focus trả về Delete button đã mở dialog.
- Error không chỉ thể hiện bằng màu.

### 15.5 Loading/error announcements

- Loading và error quan trọng nên có live-region/status semantics phù hợp.
- Không làm screen reader hiểu empty state trong lúc loading.

---

## 16. Responsive behavior

### Desktop

- Search bên trái, Add Student bên phải.
- Table hiển thị đủ 4 columns.
- Footer summary/edit note/pagination sắp xếp theo design.

### Tablet/mobile

- Toolbar có thể chuyển thành column.
- Search full width.
- Add Student full width hoặc fit-content theo breakpoint.
- Table có horizontal scroll nếu không đủ chiều rộng.
- Không ẩn ID/Name/Birth Date/Actions làm mất dữ liệu nếu chưa có card transformation.
- Pagination có thể wrap hoặc chuyển column.
- Delete dialog không vượt viewport.

Pattern hiện có trong Courses và shared Pagination hỗ trợ:

```text
flex-col → md:flex-row
overflow-x-auto
```

Nên giữ nhất quán.

---

## 17. Edge cases

### List/search/pagination

1. Backend trả `[]`.
2. Backend trả đúng 10 records.
3. Backend trả 11 records.
4. Search chỉ có whitespace.
5. Search khác casing với Student Name.
6. Search chỉ match một phần ID.
7. Search không có result.
8. User đang page > 1 rồi đổi search.
9. Filter result chỉ có một page.
10. Current page từ URL lớn hơn totalPages.
11. Xóa record cuối cùng ở page cuối.
12. Xóa record làm filtered result bằng 0.
13. Search đang active trong lúc delete.
14. Student name có dấu/Unicode.
15. Student name rất dài gây layout pressure.
16. Birth date malformed từ backend.
17. Duplicate IDs từ backend: UI không được tự sửa dữ liệu; log/handle theo data-quality strategy.

### API/delete

18. Initial request timeout/network failure.
19. Retry sau network failure.
20. Delete request bị double-click.
21. Delete target đã bị xóa ở session khác.
22. Delete trả 401.
23. Delete trả 404.
24. Delete trả 5xx.
25. Dialog bị đóng sau failed delete và mở lại record khác.

### Navigation

26. Add Student khi list đang loading.
27. View Student từ filtered/page > 1 rồi browser Back.
28. Reload page với query state.

---

## 18. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-STUDENT-MGMT-001 | Route `/students` render page title `Student Management` và subtitle `List`, không còn placeholder `Student Page` | Ready |
| AC-STUDENT-MGMT-002 | Page gọi `GET /student/all` và render list từ response thành công | Ready |
| AC-STUDENT-MGMT-003 | Table có đúng các cột ID, Student Name, Birth Date, Actions | Ready |
| AC-STUDENT-MGMT-004 | `birthDate` ISO `yyyy-MM-dd` được hiển thị theo `yyyy/MM/dd` | Ready |
| AC-STUDENT-MGMT-005 | Search theo name chạy case-insensitive và trim keyword | Ready |
| AC-STUDENT-MGMT-006 | Search theo Student ID dùng string matching trên array đã load | Ready |
| AC-STUDENT-MGMT-007 | Search không phát request server-side mới cho từng thay đổi keyword | Ready |
| AC-STUDENT-MGMT-008 | Thay đổi search reset current page về 1 | Ready |
| AC-STUDENT-MGMT-009 | Pagination chạy client-side với page size 10 trên filtered array | Ready |
| AC-STUDENT-MGMT-010 | Summary hiển thị đúng `Showing x-y of z students` dựa trên filtered total | Ready |
| AC-STUDENT-MGMT-011 | Previous/Next disable đúng boundary và page hiện tại có active/current state | Ready |
| AC-STUDENT-MGMT-012 | Add Student navigate tới `/students/new` | Ready |
| AC-STUDENT-MGMT-013 | View Student navigate tới `/students/:id` của đúng row | Ready |
| AC-STUDENT-MGMT-014 | Edit không phát request update và được disabled/hidden theo unsupported contract | Ready |
| AC-STUDENT-MGMT-015 | Nếu Edit visible disabled, UI thông báo `Edit is currently unavailable` hoặc copy tương đương | Ready |
| AC-STUDENT-MGMT-016 | Click Delete mở confirmation dialog cho đúng Student, chưa gọi API ngay | Ready |
| AC-STUDENT-MGMT-017 | Delete dialog cảnh báo Grade liên quan có thể bị xóa | Ready |
| AC-STUDENT-MGMT-018 | Cancel delete đóng dialog và không gọi DELETE API | Ready |
| AC-STUDENT-MGMT-019 | Confirm delete gọi đúng `DELETE /student/{id}` một lần | Ready |
| AC-STUDENT-MGMT-020 | Delete success `204` làm Student biến mất khỏi list và state liên quan được refresh/invalidate | Ready |
| AC-STUDENT-MGMT-021 | Sau delete, current page được clamp nếu page cuối không còn record | Ready |
| AC-STUDENT-MGMT-022 | Initial loading hiển thị loading state, không hiển thị false empty state | Ready |
| AC-STUDENT-MGMT-023 | Collection rỗng hiển thị empty state phù hợp và vẫn cho phép Add Student | Ready |
| AC-STUDENT-MGMT-024 | Search không có kết quả hiển thị `No students found.` và không render pagination vô nghĩa | Ready |
| AC-STUDENT-MGMT-025 | List load failure hiển thị error state + Retry | Ready |
| AC-STUDENT-MGMT-026 | Delete failure không xóa row giả và cho phép user xử lý/retry | Ready |
| AC-STUDENT-MGMT-027 | Search input có accessible name, không chỉ placeholder | Ready |
| AC-STUDENT-MGMT-028 | Table/actions/pagination usable bằng keyboard và có semantic/accessibility state phù hợp | Ready |
| AC-STUDENT-MGMT-029 | Delete dialog quản lý focus phù hợp và trả focus khi đóng | Ready |
| AC-STUDENT-MGMT-030 | Mobile/tablet không mất dữ liệu; table có horizontal scroll hoặc presentation tương đương | Ready |
| AC-STUDENT-MGMT-031 | Search/page state có thể khôi phục qua URL query theo architecture decision | Ready |
| AC-STUDENT-MGMT-032 | Student edit/update backend không được implement giả khi chưa có PUT/PATCH contract | Blocked/Unsupported |
| AC-STUDENT-MGMT-033 | Server-side search/pagination không bắt buộc trong scope hiện tại | Backlog |

---

## 19. Suggested test coverage

| Test ID | Level | Scenario | Expected | AC ref |
| --- | --- | --- | --- | --- |
| CT-STUDENT-MGMT-001 | Component | Render successful list | Header + columns + rows đúng | 001-004 |
| UT-STUDENT-MGMT-002 | Unit | Search name mixed-case | Match case-insensitive | 005 |
| UT-STUDENT-MGMT-003 | Unit | Search whitespace | Trim và coi empty | 005 |
| UT-STUDENT-MGMT-004 | Unit | Search ID substring | Match expected IDs | 006 |
| UT-STUDENT-MGMT-005 | Unit | Search khi page > 1 | Reset page 1 | 008 |
| UT-STUDENT-MGMT-006 | Unit | Pagination > 10 rows | Slice đúng 10/page | 009-011 |
| CT-STUDENT-MGMT-007 | Component | Click Add | Navigate `/students/new` | 012 |
| CT-STUDENT-MGMT-008 | Component | Click View | Navigate đúng `/students/:id` | 013 |
| CT-STUDENT-MGMT-009 | Component | Edit control | Disabled/hidden, no request | 014-015 |
| CT-STUDENT-MGMT-010 | Component | Click Delete | Open dialog, chưa gọi API | 016-017 |
| CT-STUDENT-MGMT-011 | Component | Delete → Cancel | Không gọi DELETE | 018 |
| IT-STUDENT-MGMT-012 | Integration | Delete → Confirm → 204 | Request đúng ID, list refresh/remove | 019-021 |
| IT-STUDENT-MGMT-013 | Integration | Delete fail | Row giữ nguyên + error | 026 |
| CT-STUDENT-MGMT-014 | Component | Initial loading | Loading state đúng | 022 |
| CT-STUDENT-MGMT-015 | Component | API returns [] | Empty collection state | 023 |
| CT-STUDENT-MGMT-016 | Component | Search no results | No-result state, no pagination | 024 |
| IT-STUDENT-MGMT-017 | Integration | GET list fails → Retry | Retry request và recover | 025 |
| CT-STUDENT-MGMT-018 | Component | Keyboard/a11y checks | Labels/aria/focus đúng | 027-029 |
| CT-STUDENT-MGMT-019 | Component | Narrow viewport | Toolbar responsive + table scroll | 030 |
| IT-STUDENT-MGMT-020 | Integration | URL query reload/back | Search/page restored/clamped | 031 |
| E2E-STUDENT-MGMT-021 | E2E | Open list → search → view → back | State và navigation đúng | 001-013,031 |
| E2E-STUDENT-MGMT-022 | E2E | Create record → find → delete | Record hiển thị rồi delete 204 thành công | 002-021 |

Existing project test docs tương ứng:

```text
docs/modules/students/test_spec.md
docs/e2e/students.md
```

Spec mới nên được dùng để refine/mở rộng các test hiện có, không xóa coverage nghiệp vụ create/detail đã được định nghĩa riêng.

---

## 20. Traceability

| Requirement | Source |
| --- | --- |
| Route `/students` | `src/app/router/routes.ts` |
| Current placeholder | `src/features/students/pages/StudentsPage.vue` |
| Target UI layout | `docs/ui/web/grade_submission/screens/design/student_management.png` |
| Student list UI contract | `docs/ui/web/grade_submission/screens/students/students_list.md` |
| Search/client pagination | `docs/modules/students/spec.md`, `docs/architecture/student_journey.md` |
| Page size 10 | Student UI/spec docs; shared `Pagination.vue` default also 10 |
| GET `/student/all` | `docs/architecture/api_integration.md` |
| DELETE `/student/{id}` | `docs/architecture/api_integration.md` |
| No Student PUT/PATCH | `docs/architecture/api_integration.md` |
| `id/name/birthDate` | `docs/architecture/data_model.md` |
| Birth Date display | `students_list.md`, `src/shared/utils/date.ts` |
| Delete cascade warning | `docs/architecture/student_journey.md`, `docs/architecture/data_model.md` |
| Accessibility/responsive | `docs/standards/accessibility-and-responsive.md` |
| Validation rules | `docs/standards/validation-rules.md` |
| Existing Student test coverage | `docs/modules/students/test_spec.md`, `docs/e2e/students.md` |
| UI patterns available | `src/shared/ui/*`, `src/features/courses/*` |

---

## 21. Implementation constraints

1. Không hardcode Student list làm production data source.
2. Không phát request search/pagination server-side ngoài `GET /student/all` trong scope này.
3. Không implement fake Edit.
4. Không gọi DELETE trước confirmation.
5. Không coi API error là empty collection.
6. Không format date qua JavaScript local datetime làm đổi calendar date.
7. Không dùng placeholder làm accessible label duy nhất cho search.
8. Không remove Student optimistically nếu không có rollback/error strategy rõ ràng.
9. Không assume seed IDs là persistent giữa backend restart.
10. Không tạo dependency/component mới nếu shared component hiện có đã đáp ứng behavior cần thiết.

---

## 22. Definition of Done cho Student Management

Màn hình được coi là hoàn thành khi:

- [ ] `/students` không còn placeholder.
- [ ] UI khớp layout/intent của `student_management.png`.
- [ ] Load dữ liệu thật từ `GET /student/all`.
- [ ] Table render đúng ID / Name / Birth Date / Actions.
- [ ] Search ID/name hoạt động client-side.
- [ ] Search reset page 1.
- [ ] Pagination 10 items/page hoạt động đúng.
- [ ] Summary filtered total đúng.
- [ ] Add navigation hoạt động.
- [ ] View navigation hoạt động.
- [ ] Edit unsupported state rõ ràng và không có update request.
- [ ] Delete có confirmation + cascade warning.
- [ ] Delete success/error/pending được xử lý đúng.
- [ ] Delete không tạo duplicate requests.
- [ ] Page clamp đúng sau delete.
- [ ] Loading state tồn tại.
- [ ] Empty collection state tồn tại.
- [ ] No-search-result state tồn tại.
- [ ] List error + Retry tồn tại.
- [ ] Accessible name của search hợp lệ.
- [ ] Keyboard actions/dialog/pagination đạt yêu cầu.
- [ ] Responsive behavior không làm mất dữ liệu.
- [ ] Search/page URL state được implement theo architecture requirement hoặc có ADR/change record nếu quyết định bỏ.
- [ ] Unit/component/integration tests cover các AC chính.
- [ ] E2E Student list/search/delete flow pass.
- [ ] `npm run build` / typecheck / lint (nếu scripts tồn tại) pass.
- [ ] Docs/test mapping được cập nhật nếu implementation thay đổi contract.

---

## 23. Open questions cần chốt nếu phát sinh trong implementation

Các điểm sau không được tự ý thay đổi business contract; nếu implementation gặp ambiguity cần chốt hoặc ghi ADR/spec update:

1. Tên chính xác của URL query keys cho search và page.
2. Edit control sẽ **disabled** hay **hidden** ở final release; design hiện ưu tiên disabled.
3. Success notification sau delete dùng toast/global notification hay silent refresh, tùy UI infrastructure được bổ sung.
4. Backend behavior chính xác khi delete ID không tồn tại chưa được coi là contract ổn định; frontend phải dùng generic normalized error cho tới khi backend harden.
5. Nếu backend CORS chưa được cấu hình tập trung, local integration cần dùng dev-server proxy/reverse proxy theo `docs/architecture/api_integration.md`.

