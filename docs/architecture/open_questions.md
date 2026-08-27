# Open Questions

| ID | Câu hỏi cần chốt | Tác động | Quyết định tạm thời |
|---|---|---|---|
| OQ-01 | Có bổ sung update Student không? | WF-03, WF-04, WF-09 | Ẩn/disable Edit |
| OQ-02 | Có bổ sung update Course không? | WF-05, WF-06, WF-10 | Ẩn/disable Edit |
| OQ-03 | Score được phép là chuỗi nào? | Validation, filter, reporting | Non-empty free-form string |
| OQ-04 | Recent Activities lấy từ nguồn nào? | Dashboard | Ẩn/empty state |
| OQ-05 | Browser frontend chạy cùng origin hay cần CORS? | Integration/deployment | Dev proxy + same-origin |
| OQ-06 | Delete Student/Course cascade Grade có là business contract chính thức không? | Confirm text, tests | Cảnh báo bảo thủ + integration test |
| OQ-07 | Dataset mục tiêu lớn bao nhiêu? | Search/pagination/performance | Client-side chỉ cho demo nhỏ |
| OQ-08 | Có cần `/me` hoặc profile endpoint? | Greeting, identity state | Giữ username/JWT subject |
| OQ-09 | Invalid credentials phải trả status/schema nào? | Login UX và test | Generic non-2xx mapping |
| OQ-10 | Duplicate course/grade phải trả 409 hay 400? | Field error UX | Generic error tới khi contract chốt |
| OQ-11 | Có cần role Admin/User? | Menu, authorization | Mọi JWT cùng quyền hiện tại |
| OQ-12 | Token production sẽ dùng Bearer storage hay secure cookie? | XSS/CSRF/security | sessionStorage chỉ cho demo |
