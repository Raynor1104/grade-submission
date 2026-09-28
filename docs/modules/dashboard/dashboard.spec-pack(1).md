# Dashboard — Spec Pack

**Phụ trách:** Frontend team  
**Trạng thái:** Ready for implementation — replace `Grades by Course` with `A Grades by Student`  
**Cập nhật lần cuối:** 2026-09-23

## 1. Bối cảnh

Màn hình **Dashboard** là màn hình tổng quan của Grade Submission System tại route `/dashboard`.

Dashboard hiện tại đã được implement với các vùng chính:

- Summary Cards;
- Quick Actions;
- `Grades by Course`;
- Data Attention;
- Grade Records preview.

Backend hiện đã có API aggregate mới:

```http
GET /api/v1/students/grade-a-counts
```

API này trả về tên học sinh và số lượng điểm thuộc **nhóm A** của từng học sinh. Nhóm A bao gồm chính xác:

```text
A
A+
A-
```

Spec pack này cập nhật Dashboard theo design mới với yêu cầu:

> **Chỉ thay đổi nội dung của panel `Grades by Course` thành `A Grades by Student`; layout, kích thước card, visual style và vị trí của panel phải giữ nguyên như Dashboard hiện tại.**

Các phần còn lại của Dashboard tiếp tục giữ behavior hiện có, trừ các thay đổi về query/cache cần thiết để tích hợp API mới.

### 1.1 Mục tiêu thay đổi

Trước:

```text
Grades by Course
Number of grade records for each course

JAVA101  ███████████████  120
DBI202    ███████████      85
SWT301    █████████        68
NET205    ███████          52
PRJ301    ██████           45

View all grades →
```

Sau:

```text
A Grades by Student
Number of A grades earned by each student

Nguyen Van A  ███████████████  8
Tran Thi B    ███████████      6
Le Van C      ███████          4
Pham Thi D    ███              2
Hoang Van E   ██               1

View all students →
```

Các tên và số liệu trong design chỉ là sample. Runtime phải dùng dữ liệu thật từ backend.

### 1.2 Nguyên tắc chính

1. Không thay đổi composition/layout tổng thể của Dashboard.
2. Không hard-code student names hoặc counts từ design.
3. `A Grades by Student` phải lấy dữ liệu từ API aggregate backend, không tự scan `GET /grade/all` để tính lại cùng metric.
4. `gradeACount` bao gồm `A`, `A+`, `A-` theo backend contract.
5. API aggregate failure chỉ làm panel `A Grades by Student` unavailable; không collapse các vùng Dashboard khác.
6. Backend trả dữ liệu theo tên học sinh tăng dần; Dashboard được phép rank lại theo `gradeACount` giảm dần để phục vụ preview.
7. Hai học sinh trùng tên là hai records riêng; frontend không được merge theo `studentName`.
8. Các phần Data Attention và Grade Records tiếp tục dùng các collection hiện tại.

---

## 2. Source và boundary

### 2.1 Frontend source baseline

Dashboard hiện tại:

```text
src/features/dashboard/pages/DashboardPage.vue
```

Các component liên quan:

```text
src/features/dashboard/components/
├── DashboardSummaryCard.vue
├── DashboardQuickActions.vue
├── GradesByCourseCard.vue
├── DataAttentionCard.vue
└── DashboardGradeRecords.vue
```

Derived data hiện tại:

```text
src/features/dashboard/model/
├── dashboard.derived.ts
└── dashboard.types.ts
```

Student API/query ownership:

```text
src/features/students/
├── api/
│   ├── student.api.ts
│   └── student.queries.ts
└── model/
    ├── student.mapper.ts
    └── student.types.ts
```

Shared query keys:

```text
src/core/api/query-keys.ts
```

HTTP client:

```text
src/core/api/http-client.ts
```

### 2.2 Backend source baseline

API aggregate đã tồn tại ở backend:

```text
StudentGradeACountController
StudentService#getStudentGradeACounts
StudentRepository#findGradeACountByStudent
StudentGradeACountResponse
```

Endpoint:

```http
GET /api/v1/students/grade-a-counts
```

Repository aggregate hiện tại dùng:

```text
Student
LEFT JOIN grades
GROUP BY student.id, student.name
```

và chỉ count score thuộc:

```text
A, A+, A-
```

### 2.3 Route

Canonical Dashboard route:

```text
/dashboard
```

Dashboard được render bên trong `MainLayout`.

Navigation hiện có:

```text
/dashboard
/students
/courses
/grades
```

### 2.4 Current implementation

Dashboard hiện tại đã có:

1. Page heading `Dashboard`.
2. Total Students.
3. Total Courses.
4. Total Grades.
5. Quick Actions.
6. `Grades by Course` panel.
7. Data Attention.
8. Grade Records preview.
9. Independent loading/error handling.
10. Vue Query cache integration.
11. Responsive layout.

Current `Grades by Course` implementation:

```text
DashboardPage
  ├── courses query
  ├── grades query
  ├── getCourseGradeCounts(courses, grades)
  └── GradesByCourseCard
```

### 2.5 Target implementation

Target phải đổi riêng analytics card bên trái:

```text
GradesByCourseCard
        ↓
StudentGradeACountCard
```

Target data flow:

```text
DashboardPage
  └── student grade A count query
        ↓
GET /api/v1/students/grade-a-counts
        ↓
rank + limit + barPercent
        ↓
StudentGradeACountCard
```

Panel Data Attention bên phải và tất cả sections khác giữ nguyên layout hiện tại.

### 2.6 Backlog / không thuộc thay đổi này

Không thuộc scope:

- redesign toàn Dashboard;
- thay đổi Summary Cards;
- thay đổi Quick Actions;
- thay đổi Data Attention UI;
- thay đổi Grade Records UI;
- backend pagination cho grade-A-count endpoint;
- student detail navigation từ từng bar row;
- thêm `studentId` vào response API;
- time-based A-grade trends;
- percentage growth/decline;
- average GPA/score calculation.

---

## 3. Source of truth và conflict resolution

Khi docs/design/source mâu thuẫn, áp dụng ưu tiên:

1. Backend API contract/capability thực tế.
2. User-approved Dashboard design revision có `A Grades by Student`.
3. Runtime frontend source hiện tại cho layout và visual behavior.
4. Architecture/query/cache conventions hiện tại.
5. Docs cũ chỉ dùng làm reference khi không conflict với các nguồn trên.

### 3.1 Canonical decisions

| Concern | Canonical decision |
| --- | --- |
| Dashboard route | `/dashboard` |
| Total Students | `students.length` |
| Total Courses | `courses.length` |
| Total Grades | `grades.length` |
| A-grade source | `GET /api/v1/students/grade-a-counts` |
| A group | exact `A`, `A+`, `A-` |
| Aggregation owner | Backend/database |
| Dashboard ranking | Client-side descending by `gradeACount` |
| Preview size | tối đa 5 student records |
| Tie-break | `studentName` ascending; preserve backend order nếu vẫn tie |
| Bar scale | relative to largest visible `gradeACount` |
| Zero count | hợp lệ, hiển thị `0` |
| Duplicate names | giữ thành records riêng, không merge |
| A-grade CTA | `View all students →` → `/students` |
| Students without grades | giữ logic hiện tại từ Students + Grades |
| Courses without grades | giữ logic hiện tại từ Courses + Grades |
| Grade preview | giữ logic hiện tại |

### 3.2 Khác biệt so với Dashboard spec cũ

Dashboard spec cũ quy định:

```text
Grades by Course
```

và derive dữ liệu bằng:

```text
Courses + Grades → group by course
```

Spec mới thay toàn bộ requirement của panel này bằng:

```text
A Grades by Student
```

và lấy aggregate trực tiếp từ backend:

```text
GET /api/v1/students/grade-a-counts
```

Do đó các requirement/test liên quan `getCourseGradeCounts`, `CourseGradeCount` và `GradesByCourseCard` không còn là target Dashboard sau thay đổi.

---

## 4. Phạm vi

### 4.1 In scope

- Giữ nguyên Dashboard tại `/dashboard`.
- Giữ nguyên visual composition hiện tại.
- Thay `Grades by Course` bằng `A Grades by Student`.
- Thêm frontend API function cho grade-A-count endpoint.
- Thêm typed data contract cho response.
- Validate response shape theo conventions hiện tại.
- Thêm Vue Query query option và query key.
- Fetch/reuse aggregate query trong Dashboard.
- Rank student theo `gradeACount` descending.
- Limit preview tối đa 5 rows.
- Tính relative bar percentage.
- Hỗ trợ student có `gradeACount = 0`.
- Không merge duplicate student names.
- Independent loading/error/retry cho A-grade panel.
- Link `View all students →` đến `/students`.
- Cập nhật cache invalidation của Student/Grade mutations ảnh hưởng metric.
- Cập nhật unit/component/page tests.
- Giữ nguyên responsive/accessibility behavior của card cũ.

### 4.2 Out of scope

- Thay đổi backend API đã implement.
- Thay đổi nghĩa của nhóm A.
- Case-insensitive score matching.
- Normalize score trước khi count.
- Thêm `studentId` vào response.
- Click từng student row để mở detail.
- Pagination/search trong card.
- Hiển thị toàn bộ students trong Dashboard.
- Chuyển A-grade calculation về frontend.
- Xóa Data Attention.
- Thay đổi Grade Records.
- Thay đổi global navigation/header/footer.
- Implement Submit Grade nếu feature đó vẫn chưa có.

---

## 5. Backend/API contract

### 5.1 Existing Dashboard collection APIs

Các phần còn lại của Dashboard tiếp tục dùng:

```http
GET /student/all
GET /course/all
GET /grade/all
Authorization: Bearer <jwt>
```

### 5.2 Student Grade A Count API

Endpoint:

```http
GET /api/v1/students/grade-a-counts
Authorization: Bearer <jwt>
```

Request:

- không có body;
- không có path parameter;
- không có query parameter.

Success:

```http
200 OK
Content-Type: application/json
```

Response example:

```json
[
  {
    "studentName": "Nguyen Van A",
    "gradeACount": 8
  },
  {
    "studentName": "Tran Thi B",
    "gradeACount": 6
  },
  {
    "studentName": "Le Van C",
    "gradeACount": 4
  }
]
```

Không có students:

```json
[]
```

Status vẫn là:

```http
200 OK
```

### 5.3 Backend business rules Dashboard phải tôn trọng

#### BR-DASH-A-001 — Exact A group

`gradeACount` đã bao gồm:

```text
A
A+
A-
```

Không bao gồm:

```text
a
a+
a-
B
B+
B-
Pass
8.5
empty string
null
```

Frontend **không tự tính lại** hoặc reinterpret field này.

#### BR-DASH-A-002 — Include students with zero A grades

Backend trả một row cho tất cả students, kể cả:

- student chưa có grade;
- student có grade nhưng không có A/A+/A-.

Các trường hợp đó:

```json
{
  "studentName": "Student Name",
  "gradeACount": 0
}
```

#### BR-DASH-A-003 — Duplicate names remain distinct

Hai Student entity có cùng name vẫn là hai response records riêng.

Ví dụ hợp lệ:

```json
[
  {
    "studentName": "Nguyen Van A",
    "gradeACount": 4
  },
  {
    "studentName": "Nguyen Van A",
    "gradeACount": 1
  }
]
```

Frontend không được group/merge theo `studentName`.

#### BR-DASH-A-004 — Backend ordering

Backend response hiện được order theo:

```text
student.name ASC, student.id ASC
```

Dashboard preview được phép tạo một presentation ordering khác theo số điểm A.

### 5.4 Frontend request path

Current frontend có:

```ts
apiBaseUrl = '/api'
```

và Vite proxy:

```text
/api/* → http://localhost:9090/*
```

Do endpoint backend đã có `/api/v1/...`, API function phải gọi:

```ts
httpClient.get('/api/v1/students/grade-a-counts')
```

Trong dev, browser request sẽ có dạng:

```text
/api/api/v1/students/grade-a-counts
```

Vite proxy strip **prefix `/api` đầu tiên**, backend nhận:

```text
/api/v1/students/grade-a-counts
```

Không tự đổi frontend path thành `/v1/students/grade-a-counts` nếu chưa thay đổi proxy/base URL contract.

### 5.5 Authorization

Endpoint yêu cầu Bearer JWT như protected APIs khác.

Không có/invalid/expired JWT:

```http
401 Unauthorized
```

`401` tiếp tục được auth layer xử lý tập trung qua HTTP client hiện tại.

### 5.6 Request strategy

Sau thay đổi, Dashboard có bốn data sources độc lập:

```text
Dashboard mounted
├── Students query
├── Courses query
├── Grades query
└── Student Grade A Counts query
```

Các query có thể chạy song song/reuse cache.

Không chờ Students/Courses/Grades xong mới gọi grade-A-count API vì endpoint aggregate không phụ thuộc client collections.

---

## 6. Data contract

### 6.1 Existing DTO/View Models

Existing Student:

```ts
interface StudentDto {
  id: number
  name: string
  birthDate: string
}
```

Existing Course:

```ts
interface CourseDto {
  id: number
  subject: string
  code: string
  description: string
}
```

Existing Grade:

```ts
interface GradeDto {
  id: number
  score: string
  student: StudentDto
  course: CourseDto
}
```

### 6.2 Student Grade A Count DTO

Target frontend type:

```ts
export interface StudentGradeACountDto {
  studentName: string
  gradeACount: number
}
```

Có thể dùng cùng shape làm ViewModel nếu không cần domain transformation:

```ts
export interface StudentGradeACountViewModel {
  studentName: string
  gradeACount: number
}
```

### 6.3 Runtime response validation

Theo pattern mapper hiện tại, response từ HTTP không nên cast thẳng thành trusted data.

List mapper phải validate:

```text
response là Array
studentName là string
gradeACount là finite integer
gradeACount >= 0
```

Nếu response shape sai:

```text
throw normalized client error
```

Không silently convert:

```text
"3" → 3
null → 0
-1 → 0
```

### 6.4 Dashboard A-grade row view model

Card cần thêm presentation value `barPercent` và có thể giữ `sourceIndex` để xử lý duplicate-name key/tie:

```ts
interface StudentGradeACountRow {
  studentName: string
  gradeACount: number
  barPercent: number
  sourceIndex: number
}
```

`sourceIndex` là presentation metadata; không phải student ID.

### 6.5 Query key

Thêm key vào existing `studentKeys`:

```ts
export const studentKeys = {
  root: ['students'] as const,
  all: () => ['students', 'all'] as const,
  detail: (id: number) => ['students', 'detail', id] as const,
  gradeACounts: () => ['students', 'grade-a-counts'] as const,
}
```

Query thuộc Students domain vì resource endpoint là student aggregate.

### 6.6 API/query ownership

Preferred ownership:

```text
src/features/students/
├── api/
│   ├── student.api.ts
│   └── student.queries.ts
└── model/
    ├── student.types.ts
    └── student.mapper.ts
```

Dashboard chỉ consume query và derive presentation ranking.

Không duplicate HTTP call trong:

```text
src/features/dashboard/api/
```

nếu Students domain đã là canonical owner.

---

## 7. UI specification

### 7.1 Page composition

Layout sau thay đổi:

```text
MainLayout
└── DashboardPage
    ├── PageHeader
    │   └── Dashboard
    │
    ├── Summary Cards
    │   ├── Total Students
    │   ├── Total Courses
    │   └── Total Grades
    │
    ├── Quick Actions
    │   ├── Add Student
    │   ├── Add Course
    │   └── Submit Grade
    │
    ├── Analytics Row
    │   ├── A Grades by Student
    │   └── Data Attention
    │
    └── Grade Records
        ├── Student
        ├── Course
        ├── Score
        └── View all grades
```

Không thay đổi vị trí/card dimensions/grid behavior chỉ vì data source thay đổi.

### 7.2 Summary Cards

Giữ nguyên:

```text
Total Students
Total Courses
Total Grades
```

Mapping:

```ts
totalStudents = students.length
totalCourses = courses.length
totalGrades = grades.length
```

Không dùng grade-A-count API để tính `Total Students`.

### 7.3 Quick Actions

Giữ nguyên current behavior.

Không thuộc thay đổi này.

### 7.4 A Grades by Student

#### 7.4.1 Section title

```text
A Grades by Student
```

#### 7.4.2 Supporting text

```text
Number of A grades earned by each student
```

Trong business semantics của hệ thống, `A grades` ở đây nghĩa là aggregate của:

```text
A + A+ + A-
```

#### 7.4.3 Card visual

Phải reuse visual language của `Grades by Course` card hiện tại:

- cùng `BaseCard`;
- cùng padding;
- cùng min-height;
- cùng heading hierarchy;
- cùng horizontal bar style;
- cùng spacing giữa rows;
- cùng count column alignment;
- cùng loading/error container position;
- cùng CTA placement cuối card;
- cùng responsive behavior.

Không redesign thành table, donut, pie hoặc chart library.

#### 7.4.4 Row content

Mỗi row hiển thị:

```text
<Student Name> | <relative horizontal bar> | <gradeACount>
```

Ví dụ:

```text
Nguyen Van A   ████████████████████   8
Tran Thi B     ███████████████        6
Le Van C       ██████████             4
Pham Thi D     █████                  2
Hoang Van E    ██                     1
```

#### 7.4.5 Ranking

API trả alphabetical order, nhưng Dashboard preview phải ưu tiên học sinh có nhiều điểm A nhất.

Algorithm:

1. Giữ mỗi response record riêng biệt.
2. Gắn `sourceIndex` theo backend response order.
3. Sort `gradeACount` descending.
4. Nếu count bằng nhau, sort `studentName` ascending.
5. Nếu vẫn bằng nhau do duplicate names, giữ backend/source order.
6. Slice tối đa 5 rows.

Pseudo-code:

```ts
const ranked = values
  .map((value, sourceIndex) => ({ ...value, sourceIndex }))
  .sort((left, right) => (
    right.gradeACount - left.gradeACount ||
    left.studentName.localeCompare(right.studentName) ||
    left.sourceIndex - right.sourceIndex
  ))
  .slice(0, 5)
```

Không mutate input array từ Vue Query cache.

#### 7.4.6 Bar scaling

Sau khi đã chọn visible rows:

```ts
const maxGradeACount = Math.max(
  0,
  ...visibleRows.map(row => row.gradeACount),
)
```

Mỗi row:

```ts
barPercent = maxGradeACount === 0
  ? 0
  : (gradeACount / maxGradeACount) * 100
```

Ví dụ:

```text
counts = [8, 6, 4, 2, 1]
bar%  = [100, 75, 50, 25, 12.5]
```

Bar chỉ là visualization tương đối. Numeric count là source of truth.

#### 7.4.7 Students with zero A grades

Nếu API có students nhưng tất cả count bằng `0`:

```text
Student A    [0%-width bar]  0
Student B    [0%-width bar]  0
...
```

Không coi đây là empty dataset vì students vẫn tồn tại.

Nếu chỉ một phần students có count 0, các zero rows có thể xuất hiện nếu còn slot trong top 5.

#### 7.4.8 Empty state

Chỉ khi API trả:

```json
[]
```

panel hiển thị informative empty state:

```text
No students available.
```

Không dùng:

```text
No A grades available.
```

vì API contract phân biệt rõ student tồn tại nhưng count bằng 0.

#### 7.4.9 Duplicate names

Không sử dụng:

```vue
:key="row.studentName"
```

vì tên không unique.

Do API chưa trả `studentId`, key có thể dùng presentation identity ổn định trong response snapshot, ví dụ:

```vue
:key="`${row.studentName}-${row.sourceIndex}`"
```

Không merge duplicate rows.

#### 7.4.10 Long student names

Giữ behavior tương tự course code/name hiện tại:

- không làm card overflow;
- cho phép ellipsis ở label;
- full name nên có thể discover qua `title` hoặc accessible text nếu visual truncate;
- count column không bị đẩy ra ngoài card.

#### 7.4.11 CTA

CTA đổi nội dung từ:

```text
View all grades →
```

thành:

```text
View all students →
```

Navigate:

```text
/students
```

Style/position của CTA giữ nguyên.

### 7.5 Data Attention

Giữ nguyên UI và logic hiện tại.

#### Students without grades

Definition:

> Student có trong Students collection nhưng ID không xuất hiện ở `grade.student.id`.

Metric này **không đồng nghĩa** với `gradeACount = 0`.

Ví dụ student có grade `B+`:

```text
Students without grades = không count student này
A Grades by Student = gradeACount 0
```

Hai metric phải giữ semantics riêng.

#### Courses without grades

Giữ nguyên derivation từ Courses + Grades.

### 7.6 Grade Records

Giữ nguyên UI hiện tại:

```text
Student | Course | Score
```

Không lọc Grade Records chỉ còn A grades.

Thay đổi panel A Grades không làm thay đổi grade preview.

---

## 8. Derived metrics specification

### 8.1 Summary

Giữ nguyên:

```ts
{
  totalStudents: students.length,
  totalCourses: courses.length,
  totalGrades: grades.length,
}
```

### 8.2 A Grades by Student

Target pure function đề xuất:

```ts
getStudentGradeACountRows(
  values: readonly StudentGradeACountViewModel[],
  limit = 5,
): StudentGradeACountRow[]
```

Function phải:

- không mutate `values`;
- giữ duplicate names;
- sort count descending;
- tie by name ascending;
- final tie by source order;
- limit safely;
- compute `barPercent`;
- tránh divide-by-zero.

Nếu:

```ts
limit <= 0
```

trả:

```ts
[]
```

### 8.3 Students without grades

Giữ nguyên:

```ts
const gradedStudentIds = new Set(
  grades.map(grade => grade.student.id),
)

return students.filter(
  student => !gradedStudentIds.has(student.id),
).length
```

Không thay bằng:

```text
count students where gradeACount === 0
```

vì semantics khác nhau.

### 8.4 Courses without grades

Giữ nguyên current derivation.

### 8.5 Grade preview

Giữ nguyên current derivation:

```ts
grades.slice(0, 5)
```

hoặc canonical ordering của Grades domain nếu sau này được định nghĩa.

---

## 9. Normal flow

### 9.1 Initial load

1. User mở `/dashboard`.
2. Page shell, heading và layout render ngay.
3. Dashboard start/reuse bốn queries:
   - Students;
   - Courses;
   - Grades;
   - Student Grade A Counts.
4. Summary cards resolve độc lập.
5. `A Grades by Student` render khi grade-A-count query success.
6. Data Attention render khi dependencies tương ứng success.
7. Grade Records render khi Grades success.
8. User có thể click `View all students →` để đi `/students`.

### 9.2 Warm-cache load

Nếu `studentKeys.gradeACounts()` cache còn fresh:

- A-grade card render cache ngay;
- không fetch duplicate chỉ vì quay về Dashboard;
- background refetch tuân theo global Vue Query policy.

### 9.3 Navigation flow

```text
Dashboard
  ↓ click “View all students”
/students
```

Không cần student filter/query parameter.

---

## 10. Loading, empty và error flows

### 10.1 A-grade loading

Trong khi grade-A-count query pending:

```text
A Grades by Student
Number of A grades earned by each student

Loading student A-grade counts…
```

Không render fake bars.

Không render `0` như placeholder loading value.

### 10.2 A-grade success

Nếu API success và có records:

- rank;
- limit 5;
- render name + bar + count.

### 10.3 Empty response

Nếu API trả `[]`:

```text
No students available.
```

CTA `View all students →` có thể vẫn hiển thị vì route Students hợp lệ.

### 10.4 All counts zero

Nếu API trả students với `gradeACount = 0`:

- không hiển thị empty state;
- render tối đa 5 students;
- mỗi numeric count = `0`;
- bar width = `0%`.

### 10.5 API error

Nếu chỉ endpoint grade-A-count lỗi:

```text
Student A-grade counts are unavailable.
[Retry]
```

Các phần sau vẫn usable nếu source tương ứng success:

- Total Students;
- Total Courses;
- Total Grades;
- Quick Actions;
- Data Attention;
- Grade Records.

### 10.6 Retry

Retry trong A-grade panel chỉ refetch:

```text
studentKeys.gradeACounts()
```

Không refetch Students/Courses/Grades chỉ vì aggregate request lỗi.

### 10.7 Other source errors

Nếu `/grade/all` lỗi nhưng grade-A-count endpoint success:

- Total Grades: error;
- Data Attention: unavailable theo dependencies;
- Grade Records: unavailable;
- `A Grades by Student`: **vẫn render bình thường**.

Nếu `/student/all` lỗi nhưng grade-A-count endpoint success:

- Total Students: error;
- Students without grades: unavailable;
- `A Grades by Student`: **vẫn render bình thường** vì có independent API source.

Nếu grade-A-count endpoint lỗi nhưng Students/Grades success:

- không fallback tự tính A counts từ Grade collection;
- hiển thị panel error + retry.

Lý do: aggregate backend là canonical source cho feature này.

### 10.8 401

`401` tiếp tục được global auth-expired handling xử lý.

Không render raw backend/auth error detail trực tiếp trong card nếu application hiện dùng normalized user-facing state.

---

## 11. Cache và invalidation

### 11.1 Query key relationship

Grade-A-count query nằm dưới:

```text
studentKeys.root = ['students']
```

với exact key:

```text
['students', 'grade-a-counts']
```

### 11.2 Student mutations

| Mutation | A-grade-count cache impact | Required action |
| --- | --- | --- |
| Create Student | thêm row count `0` | invalidate grade-A-count query |
| Update Student name | `studentName` thay đổi | invalidate grade-A-count query |
| Delete Student | row biến mất | invalidate grade-A-count query |

Nếu mutation invalidate:

```ts
studentKeys.root
```

thì grade-A-count query được invalidated cùng root theo partial matching.

Nếu mutation chỉ invalidate:

```ts
studentKeys.all()
```

thì phải **explicitly invalidate**:

```ts
studentKeys.gradeACounts()
```

Đặc biệt current Student Edit flow đang invalidate student list/detail theo phạm vi riêng; implementation phải đảm bảo aggregate name không bị stale sau rename.

### 11.3 Grade mutations

| Mutation | A-grade-count impact | Required action |
| --- | --- | --- |
| Create Grade `A/A+/A-` | count +1 | invalidate grade-A-count |
| Create non-A grade | count không đổi về business value | vẫn nên invalidate theo mutation policy đơn giản/chắc chắn |
| Update score non-A → A group | count +1 | invalidate |
| Update score A group → non-A | count -1 | invalidate |
| Update A → A+ / A- | count unchanged | invalidate acceptable |
| Delete A-group grade | count -1 | invalidate |
| Delete non-A grade | count unchanged | invalidate acceptable |

Grade mutation hiện invalidate `gradeKeys.root`; việc đó **không tự invalidate** `studentKeys.gradeACounts()`.

Do đó các Grade mutations phải thêm:

```ts
queryClient.invalidateQueries({
  queryKey: studentKeys.gradeACounts(),
})
```

hoặc một shared invalidation helper tương đương.

### 11.4 Course mutations

Create/update/delete Course không trực tiếp thay `studentName` hoặc A-grade count nếu Grade records không thay đổi.

Nếu delete Course cascade làm xóa Grades ở backend, aggregate có thể thay đổi. Trong flow có cascade Grade, phải invalidate grade-A-count query sau successful deletion.

Không assume cascade behavior nếu backend contract chưa bảo đảm.

### 11.5 No duplicate Dashboard cache

Không lưu một copy riêng kiểu:

```text
['dashboard', 'student-grade-a-counts']
```

nếu cùng resource đã được Students domain sở hữu.

---

## 12. Validation và data integrity

### 12.1 Collection guard

Response grade-A-count phải là array.

Object item phải có:

```text
studentName: string
gradeACount: integer >= 0
```

### 12.2 Preserve backend semantics

Frontend không:

- trim/uppercase score vì score không xuất hiện trong response aggregate;
- recalculate A group;
- infer student ID từ array index;
- merge students có cùng name.

### 12.3 Name display

`studentName` có thể:

- dài;
- chứa dấu;
- trùng nhau;
- chứa whitespace hợp lệ theo backend.

UI không được giả định unique hoặc ASCII-only.

### 12.4 Numeric integrity

`gradeACount`:

- phải >= 0;
- phải là integer;
- UI dùng tabular numeric rendering nếu conventions hiện tại hỗ trợ;
- không thêm `%`;
- không format thành decimal.

### 12.5 Large counts

Count lớn vẫn phải:

- không overflow card;
- giữ numeric value đọc được;
- bar luôn clamp logic trong range 0–100 do relative calculation.

---

## 13. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| DASH-A-001 | `/dashboard` tiếp tục render trong MainLayout | Required |
| DASH-A-002 | UI layout tổng thể không đổi so với Dashboard hiện tại | Required |
| DASH-A-003 | `Grades by Course` không còn xuất hiện trong target Dashboard | Required |
| DASH-A-004 | Analytics card bên trái có title `A Grades by Student` | Required |
| DASH-A-005 | Subtitle là `Number of A grades earned by each student` | Required |
| DASH-A-006 | Card dùng `GET /api/v1/students/grade-a-counts` | Required |
| DASH-A-007 | Request sử dụng auth behavior của shared HTTP client | Required |
| DASH-A-008 | A group semantics là backend-provided `A`, `A+`, `A-` | Required |
| DASH-A-009 | Không aggregate lại A count từ `/grade/all` | Required |
| DASH-A-010 | Response runtime shape được validate | Required |
| DASH-A-011 | Preview sort `gradeACount` descending | Required |
| DASH-A-012 | Tie sort `studentName` ascending | Required |
| DASH-A-013 | Duplicate student names không bị merge | Required |
| DASH-A-014 | Preview tối đa 5 records | Required |
| DASH-A-015 | Bar lớn nhất visible = 100% nếu max count > 0 | Required |
| DASH-A-016 | Khi max count = 0, tất cả bars = 0% | Required |
| DASH-A-017 | Numeric count luôn hiển thị cạnh bar | Required |
| DASH-A-018 | Student count 0 vẫn là valid row | Required |
| DASH-A-019 | API `[]` hiển thị `No students available.` | Required |
| DASH-A-020 | Loading không bị hiển thị nhầm thành count 0 | Required |
| DASH-A-021 | A-grade API error chỉ ảnh hưởng A-grade card | Required |
| DASH-A-022 | Retry A-grade card chỉ retry aggregate source | Required |
| DASH-A-023 | Grades API fail không che A-grade panel nếu aggregate success | Required |
| DASH-A-024 | Students API fail không che A-grade panel nếu aggregate success | Required |
| DASH-A-025 | Không fallback client-side calculation khi aggregate API fail | Required |
| DASH-A-026 | CTA hiển thị `View all students →` | Required |
| DASH-A-027 | CTA navigate `/students` | Required |
| DASH-A-028 | Card style/size/spacing giữ cùng visual pattern card cũ | Required |
| DASH-A-029 | Long name không làm horizontal page overflow | Required |
| DASH-A-030 | Student mutation invalidate grade-A-count khi cần | Required |
| DASH-A-031 | Grade mutation invalidate grade-A-count khi cần | Required |
| DASH-A-032 | Existing Summary Cards giữ behavior hiện tại | Required |
| DASH-A-033 | Existing Quick Actions giữ behavior hiện tại | Required |
| DASH-A-034 | Existing Data Attention giữ semantics hiện tại | Required |
| DASH-A-035 | `Students without grades` không được thay bằng `gradeACount === 0` | Required |
| DASH-A-036 | Existing Grade Records preview giữ behavior hiện tại | Required |
| DASH-A-037 | Desktop analytics row vẫn 2 columns | Required |
| DASH-A-038 | Tablet/mobile analytics cards vẫn stack theo breakpoint hiện tại | Required |
| DASH-A-039 | Bar có textual name + count cho accessibility | Required |
| DASH-A-040 | Retry là semantic button và focusable | Required |
| DASH-A-041 | CTA là semantic RouterLink | Required |
| DASH-A-042 | Lint/typecheck/unit tests/build pass | Required |

---

## 14. Edge cases

### 14.1 No students

API:

```json
[]
```

Expected:

```text
No students available.
```

Không render 5 placeholder rows.

### 14.2 Students exist, no grades at all

Backend aggregate example:

```json
[
  { "studentName": "A", "gradeACount": 0 },
  { "studentName": "B", "gradeACount": 0 }
]
```

Expected:

- render A và B;
- count `0`;
- bars `0%`.

### 14.3 Students have grades but no A group

Same display semantics như all-zero case.

### 14.4 A, A+, A-

Nếu một student có:

```text
A
A+
A-
B
```

backend trả:

```text
gradeACount = 3
```

Frontend hiển thị `3`, không re-evaluate score values.

### 14.5 Lowercase A scores

Nếu backend score có:

```text
a
a+
a-
```

chúng không thuộc metric theo current backend contract.

Frontend không sửa semantics này.

### 14.6 Duplicate names

Input:

```json
[
  { "studentName": "Alex", "gradeACount": 5 },
  { "studentName": "Alex", "gradeACount": 2 }
]
```

Expected:

```text
Alex  5
Alex  2
```

Không:

```text
Alex  7
```

### 14.7 More than five students

Render top 5 sau ranking.

Không scroll để show toàn bộ list trong Dashboard card.

### 14.8 Equal counts

Input:

```text
Charlie 3
Alice   3
Bob     3
```

Expected order:

```text
Alice
Bob
Charlie
```

### 14.9 Equal counts + duplicate names

Preserve backend relative order sau name tie.

### 14.10 Long names

Truncate visually nếu cần nhưng không mất accessible full text.

### 14.11 Very large count

Ví dụ:

```text
999999
```

count vẫn visible; card không overflow.

### 14.12 Aggregate API success, Grades API error

A-grade panel vẫn render.

### 14.13 Aggregate API error, Grades API success

A-grade panel error; không derive fallback từ Grades.

### 14.14 Slow aggregate query

Các section khác render khi data của chúng sẵn sàng; không block toàn Dashboard bằng global loading overlay.

### 14.15 Response invalid shape

Ví dụ:

```json
[
  {
    "studentName": "A",
    "gradeACount": "3"
  }
]
```

Expected: normalized client error state cho A-grade panel.

---

## 15. Accessibility

### 15.1 Heading structure

- `Dashboard` là primary page heading.
- `A Grades by Student` dùng section heading cùng level với `Data Attention`.

### 15.2 Bar accessibility

Không truyền metric chỉ bằng màu/chiều dài bar.

Mỗi row phải có textual equivalent:

```text
<Student Name> — <gradeACount> A grades
```

Có thể implement bằng visible text + `sr-only` suffix.

Ví dụ:

```vue
<span>{{ row.gradeACount }}</span>
<span class="sr-only">A grades</span>
```

### 15.3 Decorative bar

Track/bar visual có thể:

```html
aria-hidden="true"
```

vì text count đã convey data.

### 15.4 Loading/error

- Loading dùng accessible status phù hợp.
- Error có text, không chỉ color.
- Retry dùng `<button type="button">`.
- Retry có visible focus state.

### 15.5 CTA

`View all students` dùng semantic `RouterLink`.

### 15.6 Color

Blue bar không phải source duy nhất để đọc count.

---

## 16. Responsive behavior

### 16.1 Desktop

Giữ layout hiện tại:

```text
3 summary cards / row
Quick Actions horizontal
A Grades by Student | Data Attention
Grade Records full width
```

### 16.2 Tablet

Giữ breakpoint behavior hiện tại:

- Summary có thể 2 + 1.
- Analytics row stack nếu width không đủ.
- A-grade card không tạo horizontal page overflow.

### 16.3 Mobile

- Summary stack 1 column.
- Quick Actions stack theo current component.
- `A Grades by Student` và Data Attention stack.
- Student label/bar/count co giãn trong card.
- Count vẫn visible.
- Long names ellipsis thay vì kéo rộng viewport.

### 16.4 Visual regression requirement

Ngoại trừ content của left analytics panel, các vùng sau không được thay đổi có chủ đích:

- header/nav;
- page heading;
- summary cards;
- Quick Actions;
- Data Attention;
- Grade Records;
- footer;
- overall spacing/grid.

---

## 17. State matrix

| Students | Courses | Grades | A Counts | Summary | A Grades by Student | Student Attention | Course Attention | Grade Preview |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| loading | loading | loading | loading | loading | loading | loading | loading | loading |
| success | success | success | success | counts | render | render | render | render |
| error | success | success | success | Student error; others count | render | unavailable | render | render |
| success | error | success | success | Course error; others count | render | render | unavailable | render |
| success | success | error | success | Grade error; others count | render | unavailable | unavailable | unavailable |
| success | success | success | error | counts | unavailable + retry | render | render | render |
| error | error | error | success | errors | render | unavailable | unavailable | unavailable |
| success | success | success | empty | counts | `No students available.` | render | render | render |
| empty | empty | empty | empty | 0/0/0 | `No students available.` | 0 | 0 | empty |
| success | success | empty | success all-zero | counts | render zero rows | students without grades | courses without grades | empty |

`A Counts = empty` nghĩa endpoint trả `[]`, không phải records có count `0`.

---

## 18. Suggested implementation structure

Target tree:

```text
src/
├── core/
│   └── api/
│       └── query-keys.ts
│
├── features/
│   ├── students/
│   │   ├── api/
│   │   │   ├── student.api.ts
│   │   │   └── student.queries.ts
│   │   └── model/
│   │       ├── student.mapper.ts
│   │       └── student.types.ts
│   │
│   └── dashboard/
│       ├── components/
│       │   ├── DashboardSummaryCard.vue
│       │   ├── DashboardQuickActions.vue
│       │   ├── StudentGradeACountCard.vue
│       │   ├── DataAttentionCard.vue
│       │   └── DashboardGradeRecords.vue
│       ├── model/
│       │   ├── dashboard.types.ts
│       │   └── dashboard.derived.ts
│       └── pages/
│           └── DashboardPage.vue
```

### 18.1 Component replacement

Preferred:

```text
remove/retire GradesByCourseCard.vue
add StudentGradeACountCard.vue
```

Không giữ tên `GradesByCourseCard` rồi đổi content bên trong vì tên file/component sẽ sai domain meaning.

### 18.2 Remove obsolete derived logic from Dashboard target

Nếu `getCourseGradeCounts` không còn được dùng ở nơi khác:

- remove function;
- remove `CourseGradeCount` type;
- remove tests chỉ dành cho Dashboard `Grades by Course`.

Không xóa code nếu có consumer ngoài Dashboard mà chưa kiểm tra usage.

### 18.3 Suggested student API addition

```ts
export async function getStudentGradeACounts(
  signal?: AbortSignal,
): Promise<StudentGradeACountViewModel[]> {
  const response = await httpClient.get<unknown>(
    '/api/v1/students/grade-a-counts',
    signal,
  )

  return mapStudentGradeACountList(response)
}
```

### 18.4 Suggested query addition

```ts
export const studentQueries = {
  all: () => queryOptions({
    queryKey: studentKeys.all(),
    queryFn: ({ signal }) => getStudents(signal),
  }),

  detail: (id: number) => queryOptions({
    queryKey: studentKeys.detail(id),
    queryFn: ({ signal }) => getStudent(id, signal),
    retry: false,
  }),

  gradeACounts: () => queryOptions({
    queryKey: studentKeys.gradeACounts(),
    queryFn: ({ signal }) => getStudentGradeACounts(signal),
  }),
}
```

### 18.5 Dashboard page target query

Conceptually:

```ts
const {
  data: studentGradeACounts,
  isPending: studentGradeACountsPending,
  isError: studentGradeACountsError,
  refetch: refetchStudentGradeACounts,
} = useQuery(studentQueries.gradeACounts())

const studentGradeACountRows = computed(() => (
  studentGradeACounts.value
    ? getStudentGradeACountRows(studentGradeACounts.value)
    : []
))
```

Then:

```vue
<StudentGradeACountCard
  :rows="studentGradeACountRows"
  :is-loading="studentGradeACountsPending"
  :is-error="studentGradeACountsError"
  @retry="refetchStudentGradeACounts()"
/>
```

Exact event signature có thể follow conventions hiện tại, miễn behavior đúng spec.

---

## 19. Suggested tests

### 19.1 Mapper/API tests

| Test ID | Level | Scenario | Expected |
| --- | --- | --- | --- |
| UT-DASH-A-001 | Unit | valid aggregate array | mapped correctly |
| UT-DASH-A-002 | Unit | response not array | client error |
| UT-DASH-A-003 | Unit | missing `studentName` | client error |
| UT-DASH-A-004 | Unit | `gradeACount` string | client error |
| UT-DASH-A-005 | Unit | negative `gradeACount` | client error |
| UT-DASH-A-006 | Unit | duplicate names | both records preserved |

### 19.2 Derived ranking tests

| Test ID | Level | Scenario | Expected |
| --- | --- | --- | --- |
| UT-DASH-A-010 | Unit | counts 8,6,4,2,1 | same descending order |
| UT-DASH-A-011 | Unit | unsorted backend data | sorted descending |
| UT-DASH-A-012 | Unit | same count, different names | names ascending |
| UT-DASH-A-013 | Unit | duplicate name + same count | source order preserved |
| UT-DASH-A-014 | Unit | >5 students | only 5 rows |
| UT-DASH-A-015 | Unit | max=8 | max bar = 100 |
| UT-DASH-A-016 | Unit | all zero | all barPercent = 0 |
| UT-DASH-A-017 | Unit | empty list | `[]` |
| UT-DASH-A-018 | Unit | source array passed in | source not mutated |

### 19.3 Component tests

| Test ID | Level | Scenario | Expected |
| --- | --- | --- | --- |
| CT-DASH-A-020 | Component | normal rows | title/subtitle/names/counts render |
| CT-DASH-A-021 | Component | barPercent 100/50 | style widths render |
| CT-DASH-A-022 | Component | zero rows | `No students available.` |
| CT-DASH-A-023 | Component | all counts zero | names + `0`, not empty state |
| CT-DASH-A-024 | Component | loading | loading state |
| CT-DASH-A-025 | Component | error | unavailable + retry |
| CT-DASH-A-026 | Component | click retry | retry event emitted |
| CT-DASH-A-027 | Component | CTA | href `/students` |
| CT-DASH-A-028 | Component | duplicate names | both visible |
| CT-DASH-A-029 | Component | accessible count | textual A-grade semantics |

### 19.4 Dashboard page tests

| Test ID | Level | Scenario | Expected |
| --- | --- | --- | --- |
| IT-DASH-A-030 | Integration | cold mount | 4 data requests started |
| IT-DASH-A-031 | Integration | aggregate request | browser path uses configured base correctly |
| IT-DASH-A-032 | Integration | all success | full dashboard + A-grade card |
| IT-DASH-A-033 | Integration | warm cache all four | no duplicate requests |
| IT-DASH-A-034 | Integration | Students fails, aggregate succeeds | A-grade card still renders |
| IT-DASH-A-035 | Integration | Grades fails, aggregate succeeds | A-grade card still renders |
| IT-DASH-A-036 | Integration | aggregate fails | only A-grade card error |
| IT-DASH-A-037 | Integration | retry aggregate | only aggregate refetched |
| IT-DASH-A-038 | Integration | aggregate `[]` | empty A-grade state |
| IT-DASH-A-039 | Integration | aggregate all-zero | zero student rows render |

### 19.5 Cache invalidation tests

| Test ID | Level | Scenario | Expected |
| --- | --- | --- | --- |
| IT-DASH-A-040 | Integration | create student | aggregate query stale/refetched |
| IT-DASH-A-041 | Integration | rename student | aggregate studentName refreshes |
| IT-DASH-A-042 | Integration | delete student | aggregate row disappears |
| IT-DASH-A-043 | Integration | create A grade | count updates |
| IT-DASH-A-044 | Integration | update B → A | count updates |
| IT-DASH-A-045 | Integration | update A → B | count updates |
| IT-DASH-A-046 | Integration | delete A grade | count updates |

### 19.6 E2E / visual tests

| Test ID | Level | Scenario | Expected |
| --- | --- | --- | --- |
| E2E-DASH-A-050 | E2E | login → dashboard | A-grade data equals endpoint |
| E2E-DASH-A-051 | E2E | click View all students | navigates `/students` |
| E2E-DASH-A-052 | E2E | intercept aggregate 500 | rest of dashboard remains usable |
| E2E-DASH-A-053 | E2E | mobile viewport | no overflow |
| VR-DASH-A-054 | Visual | compare before/after | only left analytics card content intentionally changes |

---

## 20. Source traceability

| Requirement area | Source |
| --- | --- |
| Current Dashboard runtime | `src/features/dashboard/pages/DashboardPage.vue` |
| Existing analytics card UI | `src/features/dashboard/components/GradesByCourseCard.vue` |
| Existing derived metrics | `src/features/dashboard/model/dashboard.derived.ts` |
| Existing Dashboard types | `src/features/dashboard/model/dashboard.types.ts` |
| Students API owner | `src/features/students/api/student.api.ts` |
| Students queries | `src/features/students/api/student.queries.ts` |
| Student mapper conventions | `src/features/students/model/student.mapper.ts` |
| Query keys | `src/core/api/query-keys.ts` |
| HTTP client | `src/core/api/http-client.ts` |
| API base URL | `src/core/config/env.ts` |
| Dev proxy | `vite.config.ts` |
| Dashboard route | `src/app/router/routes.ts` |
| Existing Dashboard tests | `tests/unit/dashboard-components.spec.ts` |
| Existing derived tests | `tests/unit/dashboard-derived.spec.ts` |
| Existing Dashboard page tests | `tests/unit/dashboard-page.spec.ts` |
| Backend aggregate API spec | `spring-boot-crud/docs/modules/students/student-grade-a-count-api.spec-pack.md` |
| Backend controller | `StudentGradeACountController` |
| Backend response DTO | `StudentGradeACountResponse` |
| Backend repository query | `StudentRepository#findGradeACountByStudent` |
| Target visual change | user-approved Dashboard design: `A Grades by Student` replaces `Grades by Course` |

---

## 21. Implementation constraints

1. Chỉ thay content/behavior của left analytics card; không redesign Dashboard.
2. Không hard-code sample names/counts.
3. Không gọi `GET /grade/all` để recalculate A counts.
4. Không merge duplicate names.
5. Không dùng `studentName` một mình làm Vue key.
6. Không assume `gradeACount = 0` nghĩa student không có grades.
7. Không thay Data Attention semantics bằng aggregate endpoint.
8. Không hide students có count 0 trước ranking nếu chúng còn nằm trong top 5 slots.
9. Không mutate Vue Query cached array khi sort.
10. Không tạo global loading overlay vì aggregate request pending.
11. Không collapse toàn Dashboard khi aggregate endpoint lỗi.
12. Không fallback sang client aggregation nếu endpoint lỗi.
13. Không để Student rename tạo stale name trong A-grade card.
14. Không để Grade mutation tạo stale count trong A-grade card.
15. Không tạo dead CTA; `/students` đã là canonical route.
16. Không thay bar chart bằng visualization khác.
17. Không thay card dimensions/spacing có chủ đích.
18. Không parse/format `gradeACount` thành percentage.
19. Không thêm `studentId` giả từ array position.
20. Không thay backend score matching semantics ở frontend.

---

## 22. Definition of Done

Dashboard revision hoàn thành khi:

- [ ] `Grades by Course` đã được remove khỏi Dashboard target.
- [ ] `A Grades by Student` render đúng vị trí card cũ.
- [ ] Subtitle đúng design.
- [ ] API `GET /api/v1/students/grade-a-counts` được tích hợp qua Students domain.
- [ ] Response có runtime validation.
- [ ] Query key `studentKeys.gradeACounts()` tồn tại.
- [ ] Dashboard query aggregate độc lập với Students/Courses/Grades queries.
- [ ] Top 5 ranking đúng `gradeACount DESC`.
- [ ] Tie ordering deterministic.
- [ ] Duplicate names không bị merge.
- [ ] Zero counts render đúng.
- [ ] All-zero dataset không bị nhầm thành empty.
- [ ] Empty array có informative state.
- [ ] Bar scaling đúng và không divide-by-zero.
- [ ] CTA là `View all students →` và navigate `/students`.
- [ ] Aggregate loading/error/retry hoạt động độc lập.
- [ ] Students/Grades failure không che aggregate panel khi aggregate success.
- [ ] Aggregate failure không làm hỏng các section khác.
- [ ] Student create/update/delete invalidation không để stale aggregate data.
- [ ] Grade mutations invalidation không để stale aggregate counts.
- [ ] Existing Summary/Quick Actions/Data Attention/Grade Records behavior không regression.
- [ ] UI desktop/tablet/mobile không regression ngoài content intended.
- [ ] Accessibility text cho bar/count đạt yêu cầu.
- [ ] Unit tests cho mapper/ranking pass.
- [ ] Component tests cho A-grade card pass.
- [ ] Dashboard integration tests cập nhật từ 3 sources thành 4 sources pass.
- [ ] Existing obsolete `Grades by Course` tests được thay/remove hợp lý.
- [ ] `npm test` pass.
- [ ] typecheck/build pass.

---

## 23. Open questions / future improvements

Các điểm dưới đây **không block implementation hiện tại**, nhưng có thể cải thiện sau:

1. **Student ID trong aggregate response:** nếu sau này muốn click từng row sang Student Detail, backend nên trả `studentId` để có stable identity/navigation.
2. **Dedicated student ranking page:** hiện CTA đi `/students`; nếu product muốn xem full A-grade ranking có thể cần filtered/analytics page riêng.
3. **Server-side ranking/limit:** dataset lớn có thể cân nhắc endpoint hỗ trợ `sort`/`limit`; hiện tại API trả tất cả students và Dashboard rank ở client.
4. **Label clarity:** nếu product muốn rõ hơn, subtitle hoặc tooltip có thể giải thích `A grades includes A, A+, and A-`; không bắt buộc trong target design hiện tại.
5. **Course deletion cascade:** nếu backend bảo đảm xóa Course cascade Grades, mutation policy nên chính thức invalidate grade-A-count aggregate.

Những future improvements này không thay đổi canonical target hiện tại: **giữ nguyên Dashboard UI, thay `Grades by Course` bằng `A Grades by Student`, và dùng backend aggregate API làm source of truth.**
