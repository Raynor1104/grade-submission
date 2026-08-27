# Traceability Matrix

**Trạng thái:** Wireframe-to-backend mapping

| Wireframe | API / nguồn dữ liệu | Trạng thái | Ghi chú triển khai |
|---|---|---|---|
| WF-01 Login | `POST /authenticate` | Supported | JWT Bearer, không session cookie |
| WF-02 Total Students | `GET /student/all` | Supported via aggregation | `array.length` |
| WF-02 Total Courses | `GET /course/all` | Supported via aggregation | `array.length` |
| WF-02 Total Grades | `GET /grade/all` | Supported via aggregation | `array.length` |
| WF-02 Recent Activities | Không có | Gap | Ẩn/empty state |
| WF-03 Student list | `GET /student/all` | Supported | Search/page client-side; canonical Birth Date |
| WF-03 View | `GET /student/{id}` | Supported | Detail route |
| WF-03 Edit | Không có | Gap | Ẩn/disable |
| WF-03 Delete | `DELETE /student/{id}` | Supported | Confirm + cascade warning |
| WF-04 Add Student | `POST /student` | Supported | `{name,birthDate}` |
| WF-04 Edit Student | Không có | Gap | Không giả lập |
| WF-05 Course list | `GET /course/all` | Supported | Search/page client-side |
| WF-05 View | `GET /course/{id}` | Supported | Detail route |
| WF-05 Edit | Không có | Gap | Ẩn/disable |
| WF-05 Delete | `DELETE /course/{id}` | Supported | Confirm + cascade warning |
| WF-06 Add Course | `POST /course` | Supported | `subject`, `code`, `description` |
| WF-06 Edit Course | Không có | Gap | Không giả lập |
| WF-07 Grade list | `GET /grade/all` | Supported | Pagination client-side |
| WF-07 Student filter | `GET /grade/student/{id}` | Supported | Có thể trả empty array |
| WF-07 Course filter | `GET /grade/course/{id}` | Supported | Có thể trả empty array |
| WF-07 Pair filter | GET pair endpoint | Supported | 404 chuyển thành empty trong filter context |
| WF-08 Submit Grade | POST pair endpoint | Supported | `score` string |
| WF-08 Update Grade | PUT pair endpoint | Supported | Chỉ thay đổi score |
| WF-08 Delete Grade | DELETE pair endpoint | Supported | Pair-based |
| WF-09 Student profile | `GET /student/{id}` | Supported | Hiển thị `birthDate` dưới nhãn Birth Date |
| WF-09 Courses & Grades | `GET /grade/student/{id}` | Supported | Course nested trong Grade |
| WF-10 Course info | `GET /course/{id}` | Supported | Map `subject` → Course Name |
| WF-10 Students & Grades | `GET /grade/course/{id}` | Supported | Student nested trong Grade |
| WF-11 Unauthorized | HTTP client + route guard | Supported frontend | Backend 401 shape riêng |
| WF-12 Confirm Delete | Shared UI + DELETE endpoints | Supported frontend | Cảnh báo cascade |
