# Wireframe Scope

**Trạng thái:** Source-derived  
**Nguồn:** `references/wireframe.md`

## Danh sách màn hình

| ID | Màn hình | Mục tiêu |
|---|---|---|
| WF-01 | Đăng nhập | Nhập username/password và nhận JWT |
| WF-02 | Dashboard | Tổng số Student, Course, Grade; khu vực Recent Activities |
| WF-03 | Quản lý sinh viên | Search, list, view, edit, delete, pagination |
| WF-04 | Form sinh viên | Add/Edit Student |
| WF-05 | Quản lý khóa học | Search, list, view, edit, delete, pagination |
| WF-06 | Form khóa học | Add/Edit Course |
| WF-07 | Quản lý điểm | Lọc theo Student/Course, list, edit, pagination |
| WF-08 | Form điểm | Create/Update/Delete Grade |
| WF-09 | Chi tiết sinh viên | Hồ sơ và các khóa học/điểm liên quan |
| WF-10 | Chi tiết khóa học | Thông tin khóa học và sinh viên/điểm liên quan |
| WF-11 | 401 Unauthorized | Thông báo chưa đăng nhập và quay lại Login |
| WF-12 | Confirm Delete | Xác nhận xóa và cảnh báo dữ liệu liên quan |

## Navigation đề xuất

```text
/login
/app/dashboard
/app/students
/app/students/new
/app/students/:studentId
/app/courses
/app/courses/new
/app/courses/:courseId
/app/grades
/app/grades/new
/app/grades/:studentId/:courseId
/unauthorized
```

Route edit Student/Course không được kích hoạt trong MVP vì backend chưa có update endpoint.
