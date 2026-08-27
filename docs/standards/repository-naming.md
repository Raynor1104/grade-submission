# Repository and Gateway Naming

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

Dự án nhỏ có thể dùng functional gateways thay vì class repository nặng.

## Recommended

```ts
studentGateway.listAll()
studentGateway.getById(id)
studentGateway.create(input)
studentGateway.remove(id)
```

```ts
gradeGateway.getByPair(studentId, courseId)
gradeGateway.upsert(...)
gradeGateway.remove(...)
```

## Nếu dùng interface

- `StudentRepository` — port/contract.
- `HttpStudentRepository` — HTTP implementation.
- `InMemoryStudentRepository` — test double.

Không gọi API client thô là repository nếu nó chưa encapsulate domain operations.
