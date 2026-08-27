# Student journeys

## E2E-STUDENT-012 — Login → create → view → delete Student

**Loại:** Current UI + backend contract  
**AC:** `AC-STUDENT-FE-01` đến `AC-STUDENT-FE-08`

**Các bước**

1. Login.
2. Mở Students List.
3. Nhấn **Add Student**.
4. Nhập Full Name duy nhất và Birth Date hợp lệ.
5. Submit và chờ `POST /student` trả `201`.
6. Mở Student Detail của record mới.
7. Kiểm tra ID, Name và Birth Date.
8. Quay list, tìm record.
9. Nhấn Delete, kiểm tra modal, Confirm.
10. Chờ `DELETE /student/{id}` trả `204`.
11. Thử mở lại detail.

**Kết quả mong đợi**

- Request create chỉ có `name` và ISO `birthDate`.
- ID do server sinh.
- UI hiển thị Birth Date nhất quán.
- Delete modal nêu đúng Student và cảnh báo grade liên quan.
- Sau delete, record biến mất; detail trả 404 state.

---

## E2E-STUDENT-013 — Seed list hiển thị Birth Date

**Loại:** Current contract  
**AC:** `AC-STUDENT-FE-01`, `AC-GS-08`

**Các bước**

1. Backend mới khởi động.
2. Login và mở Students List.
3. Tìm Harry Potter và Neville Longbottom.

**Kết quả mong đợi**

- Harry Potter: `1980-07-31` từ API; UI có thể hiển thị `1980/07/31`.
- Neville Longbottom: `1980-07-30`.
- Header bảng là **Birth Date**, không phải Email.
- Không có field `grades` trong Student list entity.

---

## E2E-STUDENT-014 — Search và pagination phía client

**Loại:** Current UI contract  
**AC:** `AC-STUDENT-FE-02`

**Các bước**

1. Tạo đủ Student động để có hơn một trang.
2. Search theo một phần name, không phân biệt hoa thường.
3. Search theo ID.
4. Chuyển trang.
5. Thay đổi từ khóa khi đang ở trang > 1.

**Kết quả mong đợi**

- Search không phát query server-side ngoài `/student/all`.
- Total và “Showing x-y of z” dựa trên filtered array.
- Thay filter reset page về 1.
- Previous/Next disabled đúng boundary.

---

## E2E-STUDENT-015 — Student Detail ghép course và grade

**Loại:** Current UI + backend contract  
**AC:** `AC-STUDENT-FE-04`, `AC-STUDENT-FE-05`

**Setup**

Tạo Student, hai Course và hai Grade có score `A` và `8.5`.

**Kết quả mong đợi**

- UI gọi `GET /student/{id}` và `GET /grade/student/{id}`.
- Profile hiển thị ID, Name, Birth Date.
- Bảng Enrolled Courses & Grades hiển thị code, `course.subject` dưới nhãn Course Name và score nguyên chuỗi.
- Không parse `8.5` thành number cho logic domain.

---

## E2E-STUDENT-016 — Student chưa có grade hiển thị empty state

**Loại:** Current UI contract

Tạo Student mới và mở detail.

**Kết quả mong đợi**

- Profile vẫn hiển thị.
- Grade table có empty state rõ ràng.
- Không coi array rỗng là 404.

---

## E2E-STUDENT-017 — Unknown Student hiển thị 404 state

**Loại:** Current backend contract  
**AC:** `AC-STUDENT-FE-08`

Mở `/app/students/999999999`.

**Kết quả mong đợi**

- Backend `GET /student/999999999` trả 404.
- UI hiển thị Resource Not Found và Back to Students.
- Không hiển thị raw JSON error.

---

## E2E-STUDENT-018 — Invalid form bị chặn phía frontend

**Loại:** Frontend-controlled  
**AC:** `AC-STUDENT-FE-03`

Kiểm tra:

- Name trống.
- Birth Date trống.
- Birth Date sai format.
- Future date nếu UX rule được bật.

**Kết quả mong đợi**

- Hiển thị lỗi field.
- Không gửi `POST /student`.
- Ngày hợp lệ được submit dạng `yyyy-MM-dd`.

---

## E2E-STUDENT-019 — Edit Student bị blocked

**Loại:** Blocked  
**AC:** `AC-STUDENT-FE-07`, `AC-STUDENT-FE-09`

- Edit hidden/disabled.
- Không có E2E happy path update cho tới khi backend thêm endpoint.
