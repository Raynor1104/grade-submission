# Dashboard — Spec Pack

**Phụ trách:** Frontend team  
**Trạng thái:** Ready for implementation — current screen is placeholder  
**Cập nhật lần cuối:** 2026-09-14

## 1. Bối cảnh

Màn hình **Dashboard** là màn hình tổng quan của Grade Submission System tại route `/dashboard`. Dashboard cung cấp cho người dùng một cái nhìn nhanh về quy mô dữ liệu hiện tại, các thao tác thường dùng, phân bố grade theo course, các dữ liệu cần chú ý và một preview của grade records.

Source hiện tại tại:

```text
src/features/dashboard/pages/DashboardPage.vue
```

mới chỉ render:

```text
Dashboard content
```

Vì vậy spec pack này mô tả **màn hình Dashboard hoàn chỉnh cần implement**, dựa trên:

- target design `docs/ui/web/grade_submission/screens/design/dashboard.png`;
- screen documentation `docs/ui/web/grade_submission/screens/dashboard.md`;
- Dashboard module spec/test/task hiện có;
- Dashboard journey và ADR về client aggregation;
- backend API contract và data model;
- router và shared layout hiện tại;
- các capability thực sự có ở backend.

Nguyên tắc quan trọng:

1. Dashboard chỉ hiển thị dữ liệu có thể suy ra từ API thật.
2. Không render các số mẫu `120`, `18`, `450` như dữ liệu production.
3. Không tạo activity feed giả vì backend không có audit/activity API hoặc timestamp.
4. Các derived metrics trong design phải được tính từ cùng ba collection Students, Courses, Grades.
5. Partial failure của một nguồn dữ liệu không được làm hỏng toàn bộ Dashboard.

---

## 2. Source và boundary

### 2.1 Route

Canonical route trong source:

```text
/dashboard
```

Định nghĩa tại:

```text
src/app/router/routes.ts
```

Root route `/` redirect về `/dashboard`.

Dashboard được render bên trong:

```text
MainLayout
├── AppHeader
├── AppNav
├── RouterView -> DashboardPage
└── AppFooter
```

Navigation hiện có:

- `/dashboard`
- `/students`
- `/courses`
- `/grades`

### 2.2 Current implementation

Current Dashboard:

- có `PageHeader title="Dashboard"`;
- có một bordered container;
- container chỉ hiển thị text `Dashboard content`;
- chưa gọi API;
- chưa có summary cards;
- chưa có Quick Actions;
- chưa có Grades by Course;
- chưa có Data Attention;
- chưa có Grade Records preview;
- chưa có loading/error/empty states;
- chưa có dashboard query/cache integration.

### 2.3 Target implementation

Dashboard hoàn chỉnh phải có:

1. Page heading `Dashboard`.
2. Ba summary cards:
   - Total Students.
   - Total Courses.
   - Total Grades.
3. Quick Actions:
   - Add Student.
   - Add Course.
   - Submit Grade.
4. Grades by Course.
5. Data Attention:
   - Students without grades.
   - Courses without grades.
6. Grade Records preview.
7. Loading state độc lập theo dữ liệu/phần giao diện.
8. Partial error + retry.
9. Empty datasets hiển thị trạng thái thật, không dùng mock values.
10. Responsive và accessibility.
11. Cache reuse/invalidation với các domain Students/Courses/Grades.

### 2.4 Backlog / unsupported

Không thuộc target hiện tại:

- Recent Activities lịch sử toàn hệ thống.
- Activity/audit timeline giả lập.
- Server-side dashboard summary endpoint.
- Server-side analytics endpoint.
- Trend percentage theo thời gian.
- Charts yêu cầu timestamp/history mà backend không cung cấp.
- So sánh tuần/tháng/năm.

Nếu backend sau này cung cấp summary/activity API, kiến trúc client aggregation có thể được thay thế theo ADR exit criteria.

---

## 3. Source of truth và conflict resolution

Khi source/docs/design mâu thuẫn, áp dụng ưu tiên:

1. Backend API contract/capability thực tế.
2. Target design `dashboard.png` cho visual composition.
3. Dashboard architecture/module decisions.
4. Shared UI conventions và router source hiện tại.
5. Placeholder runtime chỉ dùng để xác định implementation status.

### 3.1 Quyết định canonical cho Dashboard

| Concern | Canonical decision |
| --- | --- |
| Route | `/dashboard` |
| Total Students | `students.length` |
| Total Courses | `courses.length` |
| Total Grades | `grades.length` |
| Data source | `GET /student/all`, `GET /course/all`, `GET /grade/all` |
| Aggregation | Client-side |
| Requests | Có thể chạy song song và reuse cache |
| Grade score | Luôn giữ là `string` |
| Grades by Course | Group Grade records theo Course, không parse `score` |
| Students without grades | Student IDs không xuất hiện trong Grade records |
| Courses without grades | Course IDs không xuất hiện trong Grade records |
| Grade preview | Preview từ Grade collection; không gọi là “recent” |
| Recent Activities | Không hỗ trợ vì backend thiếu audit/activity source |

### 3.2 Khác biệt với docs Dashboard cũ

Một số docs cũ mô tả panel **Recent Activities**. Target design hiện có trong source dùng các vùng **Quick Actions**, **Grades by Course**, **Data Attention** và **Grade Records**.

Spec pack này chọn target design mới vì các vùng trên đều có thể tạo từ dữ liệu backend thật hiện có. `Recent Activities` không được đưa vào target vì không có nguồn dữ liệu đáng tin cậy.

---

## 4. Phạm vi

### 4.1 In scope

- Render Dashboard tại `/dashboard`.
- Fetch/reuse Student, Course, Grade collections.
- Ba total cards.
- Quick Actions.
- Client-side derived metrics.
- Grades by Course ranking/list.
- Students without grades count.
- Courses without grades count.
- Grade Records preview.
- Link tới domain pages.
- Independent loading/error handling.
- Retry.
- Zero/empty states.
- Cache invalidation/refetch sau mutations làm thay đổi counts/derived data.
- Responsive layout.
- Keyboard and screen-reader support.

### 4.2 Out of scope

- Authentication implementation chi tiết.
- Create Student form implementation.
- Create Course form implementation.
- Submit Grade form implementation.
- CRUD logic chi tiết của Students/Courses/Grades.
- Server changes.
- Activity feed.
- Time-based analytics.
- Numeric grade calculations/average score.
- Sorting grade score theo giá trị vì `score` là free-form string.

---

## 5. Backend/API contract

### 5.1 APIs

Dashboard dùng ba protected endpoints:

```http
GET /student/all
GET /course/all
GET /grade/all
Authorization: Bearer <jwt>
```

Base URL local hiện tại:

```text
http://localhost:9090
```

Không có `/api/v1` prefix theo contract hiện tại.

### 5.2 Request strategy

Ba query độc lập được phép chạy song song:

```text
Dashboard mounted
├── students query
├── courses query
└── grades query
```

Dashboard phải dùng cùng query/cache keys với domain list, ví dụ:

```ts
['students']
['courses']
['grades']
```

Không tạo một nguồn cache Dashboard riêng chứa bản copy không đồng bộ của ba collections.

### 5.3 Error normalization

API errors được normalize về shape chuẩn của frontend:

```ts
interface ApiError {
  status: number
  message: string
  code?: string
  details?: unknown
}
```

`401` phải được auth layer xử lý tập trung.

---

## 6. Data contract

### 6.1 Student DTO

```ts
interface StudentDto {
  id: number
  name: string
  birthDate: string // yyyy-MM-dd
}
```

### 6.2 Course DTO

```ts
interface CourseDto {
  id: number
  subject: string
  code: string
  description: string
}
```

### 6.3 Grade DTO

```ts
interface GradeDto {
  id: number
  score: string
  student: StudentDto
  course: CourseDto
}
```

`score` phải được giữ nguyên là string. Dashboard không parse `A`, `B+`, `8.5`, `Pass`, v.v. sang number.

### 6.4 Suggested Dashboard view models

```ts
interface DashboardSummary {
  totalStudents: number
  totalCourses: number
  totalGrades: number
}

interface CourseGradeCount {
  courseId: number
  courseCode: string
  courseName: string
  gradeCount: number
}

interface DashboardAttention {
  studentsWithoutGrades: number
  coursesWithoutGrades: number
}

interface DashboardGradeRow {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseCode: string
  courseName: string
  score: string
}
```

---

## 7. UI specification

### 7.1 Page composition

Target composition:

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
    │   ├── Grades by Course
    │   └── Data Attention
    │
    └── Grade Records
        ├── Student
        ├── Course
        ├── Score
        └── View all grades
```

### 7.2 Summary cards

Ba cards theo thứ tự:

1. Total Students.
2. Total Courses.
3. Total Grades.

Mỗi card gồm:

- semantic icon;
- label;
- count lớn;
- state loading/error/loaded độc lập.

Count mapping:

```ts
totalStudents = students.length
totalCourses = courses.length
totalGrades = grades.length
```

Không hard-code số từ design.

Nếu collection thành công nhưng rỗng:

```text
0
```

không dùng `-`, `N/A` hoặc mock number.

### 7.3 Quick Actions

Section title:

```text
Quick Actions
```

Supporting text:

```text
Get started with common tasks
```

#### Add Student

Label:

```text
Add Student
```

Description:

```text
Create a new student record
```

Navigation:

```text
/students/new
```

#### Add Course

Label:

```text
Add Course
```

Description:

```text
Create a new course record
```

Navigation:

```text
/courses/new
```

#### Submit Grade

Label:

```text
Submit Grade
```

Description:

```text
Add grade for a student
```

Canonical target navigation theo docs UI:

```text
/grades/new
```

**Current gap:** `src/app/router/routes.ts` chưa khai báo `/grades/new`. Dashboard implementation không được link tới một route chết. Trước khi enable action này, feature Grades phải thêm route/form tương ứng; nếu chưa sẵn sàng, action phải ở trạng thái disabled/unsupported có giải thích rõ.

### 7.4 Grades by Course

Section title:

```text
Grades by Course
```

Supporting text:

```text
Number of grade records for each course
```

#### Derivation

Không dùng score để tính toán. Metric là **số Grade records** theo course.

Algorithm logic:

1. Khởi tạo mỗi Course với `gradeCount = 0` nếu Course list đã load thành công.
2. Duyệt Grade collection và group theo `grade.course.id`.
3. Tăng `gradeCount` cho course tương ứng.
4. Sort descending theo `gradeCount`.
5. Tie-breaker đề xuất: `course.code` ascending để kết quả deterministic.
6. Render tối đa **5 courses** trên Dashboard preview.

Việc include course có `0` grade giúp visualization phản ánh đầy đủ các course khi dataset nhỏ.

#### Row content

Mỗi row hiển thị:

- Course code.
- Horizontal relative bar.
- Grade count.

Ví dụ visual trong design (`JAVA101`, `DBI202`, ...) chỉ là sample, không phải production data.

#### Bar scaling

```ts
barPercent = maxGradeCount === 0
  ? 0
  : (gradeCount / maxGradeCount) * 100
```

Bar là relative visualization; số count bên cạnh là source of truth.

#### View all grades

CTA:

```text
View all grades →
```

Navigate:

```text
/grades
```

### 7.5 Data Attention

Section title:

```text
Data Attention
```

Supporting text:

```text
Items that may need your attention
```

Panel gồm hai metrics.

#### Students without grades

Definition:

> Student tồn tại trong Student collection nhưng `student.id` không xuất hiện trong bất kỳ `grade.student.id` nào.

Derivation:

```ts
const studentIdsWithGrades = new Set(
  grades.map(grade => grade.student.id),
)

studentsWithoutGrades = students.filter(
  student => !studentIdsWithGrades.has(student.id),
).length
```

Label:

```text
Students without grades
```

Description:

```text
Students who do not have any grade records
```

#### Courses without grades

Definition:

> Course tồn tại trong Course collection nhưng `course.id` không xuất hiện trong bất kỳ `grade.course.id` nào.

Derivation:

```ts
const courseIdsWithGrades = new Set(
  grades.map(grade => grade.course.id),
)

coursesWithoutGrades = courses.filter(
  course => !courseIdsWithGrades.has(course.id),
).length
```

Label:

```text
Courses without grades
```

Description:

```text
Courses that do not have any grade records
```

#### Dependency rule

Data Attention cần cả parent collection và Grade collection tương ứng:

- Students without grades requires Students + Grades.
- Courses without grades requires Courses + Grades.

Nếu một dependency lỗi, metric tương ứng phải hiển thị error/unavailable thay vì suy ra `0` sai.

#### View details

Design có CTA `View details →` nhưng hiện chưa có dedicated attention page.

Target behavior ưu tiên:

- nếu product chưa định nghĩa trang detail: **không render CTA như link hoạt động**;
- hoặc link từng attention item sang `/students` / `/courses` khi requirement được chốt.

Không tạo route mới chỉ để khớp visual mà không có spec.

### 7.6 Grade Records preview

Section title:

```text
Grade Records
```

Supporting text:

```text
A list of grade records in the system
```

Columns:

```text
Student | Course | Score
```

Mapping:

| UI field | Source |
| --- | --- |
| Student | `grade.student.name` |
| Course | ưu tiên `grade.course.code`; có thể bổ sung `subject` nếu layout cho phép |
| Score | `grade.score` nguyên string |

Dashboard chỉ render preview tối đa **5 records**.

Vì Grade model không có timestamp, Dashboard **không được gọi preview này là “Recent Grades”** và không được tuyên bố rằng 5 rows là mới nhất.

Default deterministic selection:

```text
first 5 records theo thứ tự canonical của Grade query/cache
```

Nếu domain Grades có canonical sort được định nghĩa sau này, Dashboard phải reuse cùng sort.

CTA:

```text
View all grades →
```

Navigate:

```text
/grades
```

---

## 8. Normal flow

### 8.1 Initial load

1. User mở `/dashboard`.
2. `DashboardPage` render shell và heading ngay.
3. Students/Courses/Grades queries được start song song hoặc reuse fresh cache.
4. Các summary card hiển thị loading state riêng.
5. Khi từng collection success, card tương ứng hiển thị count.
6. Các derived sections được render khi dependencies cần thiết đã sẵn sàng.
7. User có thể dùng Quick Actions hoặc các `View all` CTA để chuyển sang domain page.

### 8.2 Cached load

Nếu query cache còn fresh:

- Dashboard được phép render dữ liệu cache ngay;
- không cần fetch duplicate chỉ vì user vừa chuyển từ Students/Courses/Grades về Dashboard;
- background refetch tuân theo query policy chung của application.

### 8.3 Mutation refresh

Các mutation sau phải invalidate/refetch dữ liệu liên quan:

| Mutation | Students | Courses | Grades | Dashboard impact |
| --- | ---: | ---: | ---: | --- |
| Create Student | ✓ |  |  | Total Students; Students without grades |
| Delete Student | ✓ |  | ✓* | Total Students; attention; grade-derived panels |
| Create Course |  | ✓ |  | Total Courses; Courses without grades |
| Delete Course |  | ✓ | ✓* | Total Courses; attention; grade-derived panels |
| Create Grade |  |  | ✓ | Total Grades; Grades by Course; both attention metrics; preview |
| Update Grade score |  |  | ✓ | Grade preview content only; counts unchanged |
| Delete Grade |  |  | ✓ | Total Grades; Grades by Course; attention; preview |

`*` Parent deletion có cascade Grade theo mapping hiện tại, nhưng integration behavior phải được test trước khi coi chi tiết cascade là business contract bền vững.

Dashboard không cần hard refresh browser sau mutation.

---

## 9. Loading, empty và error flows

### 9.1 Summary loading

Mỗi card có loading state độc lập.

Ví dụ:

- Students loading.
- Courses đã loaded.
- Grades error.

Dashboard vẫn giữ các phần thành công usable.

Skeleton/loading indicator không được thay count bằng `0` khi request chưa hoàn thành, vì `0` có nghĩa là collection đã load thành công và rỗng.

### 9.2 Empty datasets

#### Students = []

- Total Students = `0`.
- Students without grades = `0` nếu Grades cũng đã load.

#### Courses = []

- Total Courses = `0`.
- Courses without grades = `0` nếu Grades cũng đã load.
- Grades by Course hiển thị empty state phù hợp.

#### Grades = []

- Total Grades = `0`.
- Grade Records hiển thị empty state.
- Grades by Course hiển thị các courses với count `0` hoặc informative empty visualization.
- Students without grades = total Students.
- Courses without grades = total Courses.

Suggested Grade Records empty copy:

```text
No grade records available.
```

### 9.3 Partial API failure

Nếu chỉ Students query lỗi:

- Total Students: error state.
- Students without grades: unavailable/error.
- Total Courses và Total Grades vẫn hiển thị nếu success.
- Courses without grades vẫn có thể hiển thị nếu Courses + Grades success.
- Grades by Course và Grade Records vẫn có thể render từ successful dependencies.

Tương tự cho các source còn lại.

### 9.4 All requests fail

Dashboard vẫn render:

- page heading;
- Quick Actions nếu route capability không phụ thuộc data;
- error states cho data panels;
- Retry All hoặc per-panel Retry.

Không render blank page.

### 9.5 Retry

Preferred behavior:

- card/section error có retry source liên quan;
- có thể cung cấp `Retry all` nếu UX thống nhất;
- retry không reload toàn browser.

### 9.6 401

401/expired JWT phải được auth handling chung xử lý. Dashboard không tự tạo auth flow riêng.

---

## 10. Validation và data integrity

Dashboard không có user form input, nên validation tập trung vào API/data assumptions.

### 10.1 Collection guards

- Query success phải normalize missing/invalid array theo API layer policy.
- Không tính `length` trước khi data ở success state.
- Không coi failed collection là empty collection.

### 10.2 Grade integrity

Một Grade hợp lệ cho dashboard aggregation cần có:

```text
grade.id
grade.score
grade.student.id
grade.student.name
grade.course.id
grade.course.code
```

Malformed records phải tuân theo mapper/error policy chung; Dashboard không tự silently invent Student/Course labels.

### 10.3 Orphan Grade

Nếu Grade response tham chiếu nested Student/Course không còn trong `/student/all` hoặc `/course/all`:

- Total Grades vẫn dựa trên Grade collection thực tế.
- Grade preview có thể render nested data từ Grade nếu record hợp lệ.
- Attention metrics lấy parent collections làm source of truth.
- Không tự thêm orphan entity vào Total Students/Total Courses.

Trường hợp này nên được telemetry/logged ở development/testing nếu app có facility tương ứng.

---

## 11. Derived metrics specification

### 11.1 Summary

```ts
summary = {
  totalStudents: students.length,
  totalCourses: courses.length,
  totalGrades: grades.length,
}
```

### 11.2 Grades by Course

Pseudo-code:

```ts
const countByCourseId = new Map<number, number>()

for (const course of courses) {
  countByCourseId.set(course.id, 0)
}

for (const grade of grades) {
  const courseId = grade.course.id
  countByCourseId.set(
    courseId,
    (countByCourseId.get(courseId) ?? 0) + 1,
  )
}

const rows = courses
  .map(course => ({
    courseId: course.id,
    courseCode: course.code,
    courseName: course.subject,
    gradeCount: countByCourseId.get(course.id) ?? 0,
  }))
  .sort((a, b) =>
    b.gradeCount - a.gradeCount ||
    a.courseCode.localeCompare(b.courseCode),
  )
  .slice(0, 5)
```

### 11.3 Students without grades

```ts
const gradedStudentIds = new Set(
  grades.map(grade => grade.student.id),
)

const studentsWithoutGrades = students.reduce(
  (count, student) =>
    count + (gradedStudentIds.has(student.id) ? 0 : 1),
  0,
)
```

### 11.4 Courses without grades

```ts
const gradedCourseIds = new Set(
  grades.map(grade => grade.course.id),
)

const coursesWithoutGrades = courses.reduce(
  (count, course) =>
    count + (gradedCourseIds.has(course.id) ? 0 : 1),
  0,
)
```

### 11.5 Grade preview

```ts
const gradePreview = grades.slice(0, 5)
```

Không sort theo `score`. Không gọi là recent nếu không có timestamp.

---

## 12. Acceptance criteria

| AC ID | Tiêu chí | Trạng thái |
| --- | --- | --- |
| AC-DASH-SP-001 | `/dashboard` render page heading `Dashboard` trong `MainLayout` | ready |
| AC-DASH-SP-002 | Dashboard dùng `GET /student/all`, `/course/all`, `/grade/all` hoặc reuse cùng cached queries | ready |
| AC-DASH-SP-003 | Ba data requests có thể chạy song song và không block lẫn nhau | ready |
| AC-DASH-SP-004 | Total Students bằng `students.length` | ready |
| AC-DASH-SP-005 | Total Courses bằng `courses.length` | ready |
| AC-DASH-SP-006 | Total Grades bằng `grades.length` | ready |
| AC-DASH-SP-007 | Collection rỗng sau success hiển thị count `0` | ready |
| AC-DASH-SP-008 | Không hiển thị sample counts `120/18/450` như data thật | ready |
| AC-DASH-SP-009 | Một query lỗi không che dữ liệu thành công của query khác | ready |
| AC-DASH-SP-010 | Error source có retry mà không reload toàn browser | ready |
| AC-DASH-SP-011 | Loading khác biệt rõ với loaded count `0` | ready |
| AC-DASH-SP-012 | Quick Action Add Student điều hướng `/students/new` | ready |
| AC-DASH-SP-013 | Quick Action Add Course điều hướng `/courses/new` | ready |
| AC-DASH-SP-014 | Submit Grade không điều hướng tới route không tồn tại; target `/grades/new` chỉ enable khi route sẵn sàng | dependency |
| AC-DASH-SP-015 | Grades by Course group theo `course.id` và đếm Grade records | ready |
| AC-DASH-SP-016 | Grades by Course không parse hoặc tính toán từ `score` | ready |
| AC-DASH-SP-017 | Grades by Course sort count giảm dần, tie deterministic, tối đa 5 rows | ready |
| AC-DASH-SP-018 | Bar tỷ lệ theo max grade count và count text vẫn là source of truth | ready |
| AC-DASH-SP-019 | Students without grades được tính bằng Student IDs không xuất hiện trong Grade records | ready |
| AC-DASH-SP-020 | Courses without grades được tính bằng Course IDs không xuất hiện trong Grade records | ready |
| AC-DASH-SP-021 | Attention metric không hiển thị `0` giả khi dependency API lỗi | ready |
| AC-DASH-SP-022 | Grade Records preview hiển thị Student, Course, Score từ Grade data thật | ready |
| AC-DASH-SP-023 | Score được hiển thị nguyên string | ready |
| AC-DASH-SP-024 | Grade preview tối đa 5 records | ready |
| AC-DASH-SP-025 | Grade preview không được gọi là recent/latest khi không có timestamp | ready |
| AC-DASH-SP-026 | `View all grades` điều hướng `/grades` | ready |
| AC-DASH-SP-027 | Dashboard không render Recent Activities giả | ready |
| AC-DASH-SP-028 | Create/delete Student refresh Student-derived dashboard data | ready |
| AC-DASH-SP-029 | Create/delete Course refresh Course-derived dashboard data | ready |
| AC-DASH-SP-030 | Create/update/delete Grade refresh Grade-derived dashboard data phù hợp | ready |
| AC-DASH-SP-031 | Dashboard reuse shared query cache thay vì duy trì duplicate source of truth | ready |
| AC-DASH-SP-032 | 401 được auth layer xử lý tập trung | ready |
| AC-DASH-SP-033 | Dashboard usable ở mobile/tablet/desktop mà không gây horizontal page overflow | ready |
| AC-DASH-SP-034 | Interactive controls có keyboard focus và accessible name | ready |
| AC-DASH-SP-035 | Visualization bar không phải cách duy nhất truyền đạt grade count; numeric count luôn có text | ready |
| AC-DASH-SP-036 | `View details` của Data Attention không được render như active dead-link khi chưa có destination spec | ready |

---

## 13. Edge cases

### 13.1 Dataset combinations

- Students > 0, Courses > 0, Grades = 0.
- Students = 0, Courses > 0, Grades = 0.
- Students > 0, Courses = 0, Grades = 0.
- Cả ba collections rỗng.
- Chỉ một course có grades.
- Nhiều courses cùng grade count.
- Hơn 5 courses có grades.
- Hơn 5 grade records.

### 13.2 Partial failures

- Students fail, Courses + Grades success.
- Courses fail, Students + Grades success.
- Grades fail, Students + Courses success.
- All fail.
- Retry một source thành công sau lần đầu lỗi.

### 13.3 Cache/mutation

- Dashboard mở sau Students page và Students cache còn fresh.
- Tạo Student rồi quay Dashboard.
- Xóa Student có related Grades.
- Tạo Grade cho student previously without grade.
- Xóa grade cuối cùng của một Student.
- Xóa grade cuối cùng của một Course.
- Update Grade score: counts không thay đổi nhưng preview score cập nhật.

### 13.4 Data consistency

- Duplicate Grade pair không nên tồn tại theo DB constraint, nhưng aggregation vẫn đếm response records thực tế nếu backend trả về.
- Grade nested Course có code khác Course collection cùng ID: mapper/query consistency issue, không tự merge bằng code.
- IDs lớn không được assume sequential.
- Backend restart có thể regenerate H2 IDs; Dashboard không persist assumptions theo seed ID.

### 13.5 Display

- Course code/name dài.
- Student name dài.
- Score string dài.
- Count rất lớn.
- Max grade count bằng `0` để tránh divide-by-zero ở bars.

---

## 14. Accessibility

### 14.1 Structure

- Chỉ có một primary page heading cho `Dashboard`.
- Section headings có hierarchy hợp lý.
- Summary metric cards phải có text label, không chỉ icon.

### 14.2 Icons

- Decorative icons dùng `aria-hidden="true"` khi label text đã cung cấp meaning.
- Nếu icon-only control xuất hiện, phải có `aria-label`.

### 14.3 Quick Actions và links

- Dùng semantic `RouterLink` cho navigation thay vì clickable `div`.
- Focus state phải nhìn thấy rõ.
- Tab order theo visual reading order.

### 14.4 Charts/bars

Grades by Course phải luôn có textual:

```text
<Course Code> — <gradeCount>
```

Không truyền thông tin chỉ bằng chiều dài/màu bar.

### 14.5 Error/loading

- Loading indicator có accessible status phù hợp.
- Error message có text, không chỉ màu đỏ.
- Retry là semantic button.

### 14.6 Color

Data Attention không chỉ dựa vào red/orange color; luôn có label, icon/text và numeric value.

---

## 15. Responsive behavior

### 15.1 Desktop

Theo target design:

```text
3 summary cards / row
Quick Actions horizontal
Grades by Course | Data Attention
Grade Records full width
```

### 15.2 Tablet

- Summary cards có thể 2 + 1 hoặc grid adaptive.
- Quick Actions wrap hợp lý.
- Analytics panels có thể vẫn 2 columns nếu đủ width, nếu không stack.

### 15.3 Mobile

- Summary cards stack thành 1 column.
- Quick Actions stack hoặc wrap thành 1 column.
- Grades by Course và Data Attention stack.
- Grade table sử dụng horizontal scroll container nếu cần; không làm toàn page overflow.
- Labels/counts không bị cắt mất meaning.
- Touch targets tuân theo accessibility standard của project.

### 15.4 Suggested grid behavior

Implementation có thể dùng Tailwind responsive utilities theo conventions hiện tại, ví dụ:

```text
Summary: grid-cols-1 → md:grid-cols-3
Analytics: grid-cols-1 → lg:grid-cols-2
```

Exact breakpoint không phải business contract; visual outcome và usability mới là acceptance target.

---

## 16. State matrix

| Students | Courses | Grades | Summary | Grades by Course | Student Attention | Course Attention | Grade Preview |
| --- | --- | --- | --- | --- | --- | --- | --- |
| loading | loading | loading | loading | loading | loading | loading | loading |
| success | success | success | counts | render | render | render | render |
| error | success | success | Student error; others count | render từ Courses+Grades | unavailable | render | render |
| success | error | success | Course error; others count | unavailable | render | unavailable | render |
| success | success | error | Grade error; others count | unavailable | unavailable | unavailable | unavailable |
| empty | empty | empty | 0/0/0 | empty | 0 | 0 | empty |

---

## 17. Suggested implementation structure

Spec không bắt buộc exact file tree, nhưng nên giữ feature boundary rõ ràng:

```text
src/features/dashboard/
├── api/
│   └── dashboard.queries.ts        # nếu cần composition; reuse domain queries ưu tiên hơn
├── components/
│   ├── DashboardSummaryCard.vue
│   ├── DashboardQuickActions.vue
│   ├── GradesByCourseCard.vue
│   ├── DataAttentionCard.vue
│   └── DashboardGradeRecords.vue
├── model/
│   ├── dashboard.types.ts
│   └── dashboard.derived.ts
└── pages/
    └── DashboardPage.vue
```

Preferred architecture:

- API DTO/query ownership vẫn ở domain Students/Courses/Grades nếu đã có.
- Dashboard chỉ compose queries và derive metrics.
- Pure derived functions đặt ở model/util để dễ unit test.
- Không duplicate API adapters trong Dashboard.

---

## 18. Suggested tests

| Test ID | Level | Scenario | Expected | AC refs |
| --- | --- | --- | --- | --- |
| UT-DASH-SP-001 | Unit | 3 students | totalStudents = 3 | 004 |
| UT-DASH-SP-002 | Unit | 2 courses | totalCourses = 2 | 005 |
| UT-DASH-SP-003 | Unit | 5 grades | totalGrades = 5 | 006 |
| UT-DASH-SP-004 | Unit | group grades by course | correct counts | 015 |
| UT-DASH-SP-005 | Unit | ties in grade count | deterministic order | 017 |
| UT-DASH-SP-006 | Unit | max count = 0 | bar percentage = 0, no divide error | 018 |
| UT-DASH-SP-007 | Unit | student IDs with/without grades | attention count correct | 019 |
| UT-DASH-SP-008 | Unit | course IDs with/without grades | attention count correct | 020 |
| UT-DASH-SP-009 | Unit | score = `B+`/`Pass`/`8.5` | strings preserved | 023 |
| CT-DASH-SP-010 | Component | all queries success | full dashboard sections render | 001–026 |
| CT-DASH-SP-011 | Component | all collections empty | 0 counts + empty preview | 007 |
| CT-DASH-SP-012 | Component | Student query fails only | Student-dependent UI error, others remain | 009,021 |
| CT-DASH-SP-013 | Component | Grade query fails | grade-derived sections unavailable | 009,021 |
| CT-DASH-SP-014 | Component | more than 5 courses/grades | previews limited to 5 | 017,024 |
| CT-DASH-SP-015 | Component | Quick Actions | supported routes navigate correctly | 012–014 |
| CT-DASH-SP-016 | Component | target has no activity source | no fake activity rows | 027 |
| IT-DASH-SP-017 | Integration | mount Dashboard | three queries parallel/reuse cache | 002,003,031 |
| IT-DASH-SP-018 | Integration | create Student | total/attention update after invalidation | 028 |
| IT-DASH-SP-019 | Integration | create Course | total/attention update | 029 |
| IT-DASH-SP-020 | Integration | create Grade | grade total, group, attention, preview update | 030 |
| IT-DASH-SP-021 | Integration | update Grade score | count unchanged, preview score updates | 030 |
| E2E-DASH-SP-022 | E2E | login → Dashboard | displayed counts equal API lengths | 002–008 |
| E2E-DASH-SP-023 | E2E | intercept one API 500 | partial error only | 009,010 |
| E2E-DASH-SP-024 | E2E | all arrays empty | 0/empty states truthful | 007 |
| E2E-DASH-SP-025 | E2E | viewport mobile | no page overflow, controls usable | 033,034 |

---

## 19. Source traceability

| Requirement area | Source |
| --- | --- |
| Current Dashboard placeholder | `src/features/dashboard/pages/DashboardPage.vue` |
| Dashboard route | `src/app/router/routes.ts` |
| Main layout | `src/app/layouts/MainLayout.vue` |
| Main navigation | `src/shared/ui/AppNav.vue` |
| Target visual composition | `docs/ui/web/grade_submission/screens/design/dashboard.png` |
| Existing Dashboard screen behavior | `docs/ui/web/grade_submission/screens/dashboard.md` |
| Dashboard counts/API policy | `docs/modules/dashboard/spec.md` |
| Dashboard tasks | `docs/modules/dashboard/tasks.md` |
| Dashboard tests | `docs/modules/dashboard/test_spec.md` |
| Parallel aggregation/cache | `docs/architecture/dashboard_journey.md` |
| Client aggregation decision | `docs/architecture/adr/0007-dashboard-client-aggregation.md` |
| No fake activity decision | `docs/architecture/adr/0008-dashboard-client-aggregation-no-fake-activity.md` |
| API endpoints | `docs/architecture/api_integration.md` |
| DTO relationships | `docs/architecture/data_model.md` |
| Wireframe/backend conflicts | `docs/architecture/wireframe_alignment.md` |
| E2E baseline | `docs/e2e/dashboard.md` |
| General spec-pack format | `docs/standards/templates/spec-pack.template.md` |

---

## 20. Implementation constraints

1. Không hard-code count/sample rows từ design.
2. Không dùng mock activity như production data.
3. Không parse Grade score thành number.
4. Không fetch ba collections lần thứ hai chỉ để Dashboard có duplicate state nếu shared cache đã có.
5. Không để failure của một endpoint collapse toàn Dashboard.
6. Không hiển thị `0` cho failed/loading query.
7. Không tạo dead links từ Quick Actions/Data Attention.
8. Không assume Student/Course IDs sequential hoặc stable qua backend restart.
9. Derived metrics nên là pure/computed values; không persist như nguồn dữ liệu độc lập.
10. Không gọi Grade Records preview là recent/latest khi backend thiếu timestamp.

---

## 21. Definition of Done

Dashboard được coi là hoàn thành khi:

- [ ] Placeholder `Dashboard content` được thay bởi target layout.
- [ ] Ba summary cards hiển thị data thật.
- [ ] Không còn sample counts từ design.
- [ ] Ba source queries chạy/reuse cache đúng architecture.
- [ ] Partial failure hoạt động độc lập.
- [ ] Empty state phân biệt với loading/error.
- [ ] Quick Actions supported hoạt động đúng route.
- [ ] Submit Grade không tạo dead link.
- [ ] Grades by Course tính từ Grade records thật.
- [ ] Students/Courses without grades tính chính xác.
- [ ] Grade Records preview dùng data thật và giữ score dạng string.
- [ ] Không có fake Recent Activities.
- [ ] Mutation invalidation cập nhật dashboard không cần browser refresh.
- [ ] Responsive đạt mobile/tablet/desktop.
- [ ] Keyboard/accessibility cơ bản đạt standards.
- [ ] Unit/component/integration tests cho derived metrics và states pass.
- [ ] E2E count/partial-error/empty scenarios pass.
- [ ] Lint/typecheck/build pass.

---

## 22. Open questions / decisions cần chốt

Các điểm sau không được tự suy diễn trong implementation nếu chưa được product/team chốt:

1. **Submit Grade route:** thêm canonical `/grades/new` hay Grade Management dùng modal/inline form?
2. **Data Attention `View details`:** bỏ CTA, link sang `/students`/`/courses`, hay tạo dedicated filtered view?
3. **Grade Records ordering:** backend/domain có canonical ordering nào không? Nếu không, giữ query order và không gọi là recent.
4. **Grades by Course khi có >5 courses:** top 5 theo grade count như spec hay cần scroll/show all?
5. **Course có 0 grade:** luôn hiển thị trong top 5 nếu còn slot hay section chỉ liệt kê course có grade?
6. **Shared query library:** nếu project chưa tích hợp Vue Query ở runtime, cần xác nhận state/query solution trước khi implement cache/invalidation policy đã mô tả trong architecture docs.

Các open question này không thay đổi những contract chắc chắn: counts phải là data thật, partial error phải độc lập, score là string, và không được giả lập activity/history.
