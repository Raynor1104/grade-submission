# API Domain Mapping

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

## 1. Mục tiêu

Tách backend entity JSON khỏi model dùng trong UI. Mapper phải thuần túy, không gọi network và không chứa side effect.

## 2. Student

```ts
interface StudentDto {
  id: number;
  name: string;
  birthDate: string; // yyyy-MM-dd
}

interface StudentVm {
  id: number;
  name: string;
  birthDate: string;       // canonical ISO
  birthDateLabel: string;  // yyyy/MM/dd hoặc locale
}
```

Không chuyển pure date qua UTC timestamp.

## 3. Course

```ts
interface CourseDto {
  id: number;
  subject: string;
  code: string;
  description: string;
}

interface CourseVm {
  id: number;
  name: string; // map từ subject
  code: string;
  description: string;
}
```

Create payload phải map `name → subject`.

## 4. Grade

```ts
interface GradeDto {
  id: number;
  score: string;
  student: StudentDto;
  course: CourseDto;
}

interface GradeVm {
  id: number;
  score: string;
  student: StudentVm;
  course: CourseVm;
}
```

Không parse `score` thành number.

## 5. Form models

- Create Student: `{name, birthDate}`.
- Create Course: `{name, code, description}` rồi map sang `{subject, code, description}`.
- Grade form: `{studentId, courseId, score}`; student/course trong path, body chỉ `{score}`.

## 6. Unknown/malformed data

Mapper phải fail rõ hoặc trả validation result; không âm thầm tạo giá trị giả như `0`, `Unknown` nếu điều đó che mất contract lỗi.
