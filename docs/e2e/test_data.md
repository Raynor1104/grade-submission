# E2E test data and cleanup strategy

## 1. Backend startup baseline

Mỗi lần backend khởi động với H2 mới, dữ liệu baseline gồm:

### Students

| Name | Birth Date API | Birth Date UI |
| --- | --- | --- |
| Harry Potter | `1980-07-31` | `1980/07/31` hoặc locale tương đương |
| Ron Weasley | `1980-03-01` | `1980/03/01` |
| Hermione Granger | `1979-09-19` | `1979/09/19` |
| Neville Longbottom | `1980-07-30` | `1980/07/30` |

### Courses

| Subject | Code |
| --- | --- |
| Charms | `CH104` |
| Defence Against the Dark Arts | `DADA` |
| Herbology | `HB311` |
| History of Magic | `HIS393` |
| Potions | `POT102` |
| Transfiguration | `TR442` |

### Grades

Không có grade được seed.

### Authentication account

```text
username: username
password: password
```

Account nằm trong `JwtUserDetailsService`, không nằm trong H2.

## 2. Dynamic data

Mỗi test dùng suffix:

```text
<UTC timestamp>-<random>
```

Ví dụ:

```json
{
  "name": "E2E Student 20260722-a31f",
  "birthDate": "2001-01-15"
}
```

```json
{
  "subject": "E2E Course 20260722-a31f",
  "code": "E2E-A31F",
  "description": "Created by browser E2E"
}
```

```json
{
  "score": "A+"
}
```

## 3. Canonical mapping

| UI | Backend |
| --- | --- |
| Student Name | `name` |
| Birth Date | `birthDate` |
| Course Name | `subject` |
| Course Code | `code` |
| Grade | `score` string |

Date payload luôn là `yyyy-MM-dd`. Grade không được parse thành number.

## 4. Factories đề xuất

```ts
studentFactory(overrides?)
courseFactory(overrides?)
gradeFactory(overrides?)
```

Mỗi factory trả cả:

- Input UI.
- API payload kỳ vọng.
- Unique lookup field.
- Cleanup metadata.

## 5. API helpers đề xuất

```text
loginApi()
createStudent()
createCourse()
createGrade()
getStudent()
getCourse()
getGrade()
deleteGrade()
deleteStudent()
deleteCourse()
findStudentByName()
findCourseByCode()
```

## 6. Cleanup

Thứ tự an toàn:

```text
delete grade
→ delete student
→ delete course
```

Dù entity mapping có cascade, explicit cleanup giúp test rõ ý định.

## 7. Baseline protection

- Không xóa seed Student/Course trong journey thông thường.
- Cascade/delete journey chỉ dùng record động.
- Không assert generated ID cố định.
- Không assert list count tuyệt đối sau khi suite đã tạo dữ liệu, trừ khi backend vừa restart.

## 8. Reset strategy

### Current

```text
stop backend
→ start backend
→ H2 mới
→ startup seed
```

### Backlog

Test-only profile có thể cung cấp reset/fixture endpoint, nhưng hiện chưa tồn tại. Không viết test gọi `/__test__/reset` như contract hiện tại.

## 9. Parallel execution

Cho tới khi có database-per-worker hoặc reset harness:

```ts
workers: 1
fullyParallel: false
```
