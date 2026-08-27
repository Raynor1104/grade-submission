# Dashboard journeys

## E2E-DASH-007 — Dashboard count khớp backend lists

**Loại:** Current UI + backend contract  
**AC:** `AC-DASH-01` đến `AC-DASH-04`

**Các bước**

1. Login.
2. Đồng thời quan sát:
   - `GET /student/all`
   - `GET /course/all`
   - `GET /grade/all`
3. Mở Dashboard.
4. So sánh card count với độ dài response arrays.

**Kết quả mong đợi**

- Total Students = `students.length`.
- Total Courses = `courses.length`.
- Total Grades = `grades.length`.
- Với baseline backend mới khởi động: Students = 4, Courses = 6, Grades = 0.
- Không hiển thị số mẫu `120`, `18`, `450` như dữ liệu thật.

---

## E2E-DASH-008 — Một card lỗi không che card thành công

**Loại:** Frontend-controlled  
**AC:** `AC-DASH-03`

**Các bước**

1. Route `GET /student/all` trả lỗi mạng hoặc 500.
2. Cho Course và Grade request thành công.
3. Mở Dashboard.

**Kết quả mong đợi**

- Student card hiển thị lỗi + Retry.
- Course/Grade card vẫn hiển thị count.
- Không thay toàn bộ Dashboard bằng blank page.

---

## E2E-DASH-009 — Mutation thay đổi count

**Loại:** Current UI + backend contract  
**AC:** `AC-DASH-05`

**Các biến thể**

1. Tạo Student → Student count tăng 1.
2. Xóa Student động → Student count giảm 1.
3. Tạo Course → Course count tăng 1.
4. Tạo Grade → Grade count tăng 1.
5. Update Grade score → Grade count không đổi.
6. Xóa Grade → Grade count giảm 1.

**Kết quả mong đợi**

- Cache liên quan được invalidate/refetch.
- Không cần hard refresh browser.

---

## E2E-DASH-010 — Recent Activities không giả lập dữ liệu server

**Loại:** Current UI contract / blocked backend capability  
**AC:** `AC-DASH-06`, `AC-DASH-07`

**Kết quả chấp nhận**

Một trong hai:

- Section bị ẩn và có notice “Chưa được backend hỗ trợ”; hoặc
- Hiển thị hoạt động của browser session và ghi nhãn rõ là local.

Không chấp nhận:

- Render các dòng mẫu như dữ liệu audit thật.
- Tuyên bố lịch sử toàn hệ thống khi backend không có timestamps/activity API.

---

## E2E-DASH-011 — Empty counts hiển thị 0

**Loại:** Frontend-controlled  
**AC:** `AC-DASH-04`

Intercept ba list trả `[]`.

**Kết quả mong đợi**

- Ba card hiển thị `0`.
- Không hiển thị `-`, `N/A` hoặc số mẫu.
