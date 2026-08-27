# Adapter and Facade Pattern Evaluation

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

## Adapter nên dùng

- `CourseDto.subject` → `CourseVm.name`.
- ISO birth date → display label.
- Heterogeneous backend errors → normalized error.
- Grade nested entity → flat table row.

## Facade nên dùng khi

Một feature cần phối hợp nhiều subsystem, ví dụ Dashboard fetch Students/Courses/Grades và tính counts.

## Không nên dùng khi

- Chỉ bọc một hàm `fetch` mà không tạo boundary.
- Tăng layer nhưng không giảm coupling.
- Che giấu endpoint khiến debug khó.

## Decision questions

1. Contract bên ngoài có khác model UI không?
2. Có nhiều consumer cần cùng transformation không?
3. Có cần test seam không?
4. Pattern có làm dependency direction rõ hơn không?
