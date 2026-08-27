# Sitemap and routes

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

## Route tree đề xuất

```text
/login                                  Public
/dashboard                              Protected
/students                               Protected
/students/new                           Protected
/students/:studentId                    Protected
/courses                                Protected
/courses/new                            Protected
/courses/:courseId                      Protected
/grades                                 Protected
/grades/new                             Protected
/grades/:studentId/:courseId/edit       Protected
/unauthorized                           Public state route hoặc inline template
/*                                      404 route
```

## Navigation

```text
[Dashboard] [Students] [Courses] [Grades] [Logout]
```

Không có menu theo role vì backend không có authorities.

## Redirect rules

- `/` → `/dashboard` nếu có token; ngược lại `/login`.
- Guest mở protected route → `/login?returnTo=...`.
- Protected API trả 401 → clear auth/cache và `/login?reason=unauthorized`.
- Login thành công → `returnTo` hợp lệ hoặc `/dashboard`.
- Unknown route/invalid positive ID → 404 state, không gọi API với `NaN`.

## Unsupported edit routes

Không mount `/students/:id/edit` hoặc `/courses/:id/edit` cho tới khi backend có update endpoint. Nút Edit trong wireframe phải disable/ẩn theo `15_capability_matrix.md`.
