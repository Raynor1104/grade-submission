# Course journeys

## E2E-COURSE-011 — Login → create → view → delete Course

**Loại:** Current UI + backend contract  
**AC:** `AC-COURSE-FE-01` đến `AC-COURSE-FE-09`

**Các bước**

1. Login và mở Courses List.
2. Add Course với code duy nhất.
3. Submit.
4. Mở Course Detail.
5. Kiểm tra ID, Code, Name và Description.
6. Quay list, search theo code/name.
7. Delete và confirm.
8. Kiểm tra `204` và detail 404 sau delete.

**Kết quả mong đợi**

- UI Course Name map thành request field `subject`.
- Create trả `201` và generated ID.
- Delete modal nêu đúng Course và cảnh báo grade cascade.
- Cache course/grade/dashboard được refresh.

---

## E2E-COURSE-012 — Seed courses hiển thị đúng field mapping

**Loại:** Current contract  
**AC:** `AC-COURSE-FE-01`, `AC-PLATFORM-FE-05`

**Kết quả mong đợi**

- `CH104` hiển thị Course Name **Charms** từ backend `subject`.
- Có các seed code: `CH104`, `DADA`, `HB311`, `HIS393`, `POT102`, `TR442`.
- Field `grades` không xuất hiện trong Course list entity.

---

## E2E-COURSE-013 — Search và pagination phía client

**Loại:** Current UI contract  
**AC:** `AC-COURSE-FE-02`

- Search code và subject không phân biệt hoa thường.
- Không phát server search endpoint.
- Filter thay đổi reset page.
- Showing total dùng filtered data.

---

## E2E-COURSE-014 — Course Detail ghép Students Taking This Course

**Loại:** Current UI + backend contract  
**AC:** `AC-COURSE-FE-04`, `AC-COURSE-FE-05`

**Setup**

Tạo Course, hai Students và Grade `A`, `B+`.

**Kết quả mong đợi**

- Gọi `GET /course/{id}` và `GET /grade/course/{id}`.
- Course Information map đúng `subject`.
- Bảng hiển thị Student ID, Student Name và score nguyên chuỗi.

---

## E2E-COURSE-015 — Course chưa có grade hiển thị empty state

**Loại:** Current UI contract

Tạo Course mới, mở detail.

- Course info hiển thị.
- Students Taking This Course hiển thị empty state.
- Array rỗng không chuyển global 404.

---

## E2E-COURSE-016 — Duplicate code hiển thị lỗi an toàn

**Loại:** Observed backend gap  
**AC:** `AC-COURSE-FE-09`

1. Tạo Course code duy nhất.
2. Tạo Course thứ hai cùng code.

**Kết quả mong đợi**

- Lần hai không hiển thị success.
- Record đầu không bị ghi đè.
- UI hiển thị generic conflict/save failure.
- Không hiển thị SQL constraint hoặc stack trace.

Backend hiện có thể trả 500; target dài hạn là stable 400/409.

---

## E2E-COURSE-017 — Unknown Course hiển thị 404 state

**Loại:** Current backend contract  
**AC:** `AC-COURSE-FE-08`

Mở `/app/courses/999999999`.

- Resource Not Found.
- Back to Courses hoạt động.
- Không render raw JSON.

---

## E2E-COURSE-018 — Edit Course bị blocked

**Loại:** Blocked  
**AC:** `AC-COURSE-FE-07`, `AC-COURSE-FE-10`

- Edit hidden/disabled.
- Không gửi PUT/PATCH.
- Không có happy-path update E2E trước khi backend hỗ trợ.
