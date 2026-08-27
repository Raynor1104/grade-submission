# API Integration

**Trạng thái:** Backend contract implementation-aligned  
**Base URL local:** `http://localhost:9090`

API hiện **không có** prefix `/api/v1`.

## 1. Authentication

### Login

```http
POST /authenticate
Content-Type: application/json
```

```json
{
  "username": "username",
  "password": "password"
}
```

Success `200`:

```json
{
  "token": "<jwt>"
}
```

### Protected request

```http
Authorization: Bearer <jwt>
```

JWT hết hạn sau 24 giờ. Backend không có refresh token, revoke hoặc logout endpoint.

## 2. Student endpoints

| Method | Endpoint | UI usage |
|---|---|---|
| GET | `/student/all` | List, dashboard count, selectors |
| GET | `/student/{id}` | Student detail |
| POST | `/student` | Add Student |
| DELETE | `/student/{id}` | Delete Student |

Create payload:

```json
{
  "name": "Luna Lovegood",
  "birthDate": "1981-02-13"
}
```

Không có PUT/PATCH Student.

## 3. Course endpoints

| Method | Endpoint | UI usage |
|---|---|---|
| GET | `/course/all` | List, dashboard count, selectors |
| GET | `/course/{id}` | Course detail |
| POST | `/course` | Add Course |
| DELETE | `/course/{id}` | Delete Course |

Create payload:

```json
{
  "subject": "Software Architecture",
  "code": "SA-401",
  "description": "Architecture fundamentals"
}
```

Không có PUT/PATCH Course.

## 4. Grade endpoints

| Method | Endpoint | UI usage |
|---|---|---|
| GET | `/grade/all` | Grade list, dashboard count |
| GET | `/grade/student/{studentId}` | Student detail/filter |
| GET | `/grade/course/{courseId}` | Course detail/filter |
| GET | `/grade/student/{studentId}/course/{courseId}` | Grade detail |
| POST | `/grade/student/{studentId}/course/{courseId}` | Create Grade |
| PUT | `/grade/student/{studentId}/course/{courseId}` | Update score |
| DELETE | `/grade/student/{studentId}/course/{courseId}` | Delete Grade |

Body:

```json
{
  "score": "A"
}
```

`score` phải được giữ nguyên là chuỗi.

## 5. Error shapes

### Not found

```json
{
  "message": "The student id '999' does not exist in our records",
  "status": 404,
  "timestamp": "2026-07-07T10:30:00"
}
```

### Unauthenticated

```json
{
  "error": "Unauthenticated"
}
```

### Chưa chuẩn hóa

Các lỗi sau có thể dùng Spring default error hoặc `500`:

- credentials sai;
- duplicate course code;
- duplicate grade pair;
- null/invalid field;
- malformed JWT ở một số đường đi.

Frontend phải chuẩn hóa response về:

```ts
interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}
```

## 6. Browser integration và CORS

Backend không có CORS policy tập trung cho toàn bộ business controller. Đề xuất:

- local development: Vue dev-server proxy `/api` hoặc proxy trực tiếp path backend;
- deployment demo: serve frontend và backend dưới cùng origin qua reverse proxy;
- deployment cross-origin: bổ sung backend CORS allowlist trước khi release.

Không dùng `mode: no-cors` vì response sẽ không đọc được.
