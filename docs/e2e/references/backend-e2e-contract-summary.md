# Backend E2E contract summary

## Runtime

- Java 17.
- Spring Boot 3.5.14.
- Local port `9090`.
- H2 in-memory.
- JWT Bearer HS256, lifetime khoảng 24 giờ.
- Demo credentials: `username` / `password`.

## Public routes

```text
POST /authenticate
GET /v3/api-docs
GET /swagger-ui/index.html
```

## Protected routes

```text
/student/**
/course/**
/grade/**
```

## Student

```text
GET /student/all
GET /student/{id}
POST /student
DELETE /student/{id}
```

Fields: `id`, `name`, `birthDate`.

Không có update endpoint.

## Course

```text
GET /course/all
GET /course/{id}
POST /course
DELETE /course/{id}
```

Fields: `id`, `subject`, `code`, `description`.

Không có update endpoint.

## Grade

```text
GET /grade/all
GET /grade/student/{studentId}
GET /grade/course/{courseId}
GET /grade/student/{studentId}/course/{courseId}
POST /grade/student/{studentId}/course/{courseId}
PUT /grade/student/{studentId}/course/{courseId}
DELETE /grade/student/{studentId}/course/{courseId}
```

Field `score` là string.

## Error notes

- Unauthorized: `{"error":"Unauthenticated"}`.
- Domain 404: `{message,status,timestamp}`.
- Invalid credentials có thể thành 500.
- Duplicate constraints có thể thành 500.
- Missing fields chưa có stable validation contract.
- Success response là entity/array trực tiếp.
- Delete success là 204.
