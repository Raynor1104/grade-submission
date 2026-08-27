# API Naming Conventions

**Phụ trách:** Frontend + Backend teams  
**Trạng thái:** Current contract + Target recommendation  
**Cập nhật lần cuối:** 2026-07-22

## 1. Current routes — không tự đổi ở frontend

```text
POST   /authenticate
GET    /student/all
GET    /student/{id}
POST   /student
DELETE /student/{id}
GET    /course/all
GET    /course/{id}
POST   /course
DELETE /course/{id}
GET    /grade/all
GET    /grade/student/{studentId}
GET    /grade/course/{courseId}
GET    /grade/student/{studentId}/course/{courseId}
POST   /grade/student/{studentId}/course/{courseId}
PUT    /grade/student/{studentId}/course/{courseId}
DELETE /grade/student/{studentId}/course/{courseId}
```

## 2. JSON naming

- JSON fields: `camelCase`.
- Student: `id`, `name`, `birthDate`.
- Course API: `id`, `subject`, `code`, `description`.
- Grade: `id`, `score`, `student`, `course`.
- Path/query parameters: `camelCase`.
- Error codes target: `SCREAMING_SNAKE_CASE`.

## 3. Frontend naming

- Components/types: `PascalCase`.
- Variables/functions: `camelCase`.
- Composables: `useXxx`.
- Stores: `useXxxStore`.
- API adapters: `mapStudentDto`, `mapCourseDto`, `mapGradeDto`.
- Files/folders: kebab-case hoặc project convention thống nhất; không trộn nhiều style trong cùng layer.

## 4. UI/API mapping

| UI | API |
| --- | --- |
| Course Name | `subject` |
| Birth Date hiển thị `yyyy/MM/dd` | `birthDate` JSON `yyyy-MM-dd` |
| Grade | `score` string |

## 5. Target route naming

Khi backend version hóa, mục tiêu là plural resources dưới `/api/v1`; frontend không tự dùng target routes trước khi backend phát hành.
