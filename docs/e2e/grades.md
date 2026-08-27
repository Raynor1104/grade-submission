# Grade journeys

## E2E-GRADE-011 — Login → create grade → update → delete

**Loại:** Current UI + backend contract  
**AC:** `AC-GRADE-FE-01` đến `AC-GRADE-FE-09`

**Setup**

Tạo Student và Course động.

**Các bước**

1. Login và mở Grade Management.
2. Nhấn Submit New Grade.
3. Chọn Student và Course.
4. Nhập score `A`.
5. Submit POST pair endpoint.
6. Mở Update Grade.
7. Assert Student/Course read-only.
8. Đổi score thành `A+`, submit PUT.
9. Delete Grade và confirm.
10. Tìm lại pair.

**Kết quả mong đợi**

- Create `201`, update `200`, delete `204`.
- Pair `(studentId, courseId)` không đổi khi update.
- `score` giữ nguyên string.
- Sau delete, pair không còn và Dashboard count giảm.

---

## E2E-GRADE-012 — Grade list hiển thị string score

**Loại:** Current contract  
**AC:** `AC-GRADE-FE-01`, `AC-GRADE-FE-07`, `AC-GS-09`

Tạo các score:

```text
A
B+
Pass
8.5
```

**Kết quả mong đợi**

- UI hiển thị đúng từng chuỗi.
- Không áp dụng numeric range.
- Không tự uppercase/convert ngoài contract đã chốt.

---

## E2E-GRADE-013 — Filter chọn đúng endpoint

**Loại:** Current UI contract  
**AC:** `AC-GRADE-FE-02`

| Selection | Expected endpoint |
| --- | --- |
| Không filter | `/grade/all` |
| Student | `/grade/student/{studentId}` |
| Course | `/grade/course/{courseId}` |
| Student + Course | `/grade/student/{studentId}/course/{courseId}` |

**Kết quả mong đợi**

- Không fetch tất cả rồi giả lập server filter khi endpoint chuyên biệt đã có.
- Pagination áp dụng phía client trên response hiện tại.

---

## E2E-GRADE-014 — Pair 404 trong filter là no-results

**Loại:** Current UI contract  
**AC:** `AC-GRADE-FE-03`

Chọn Student + Course chưa có Grade.

- Pair endpoint trả 404.
- Grade Management hiển thị “Không có điểm cho lựa chọn này”.
- Không chuyển sang global Resource Not Found page.

---

## E2E-GRADE-015 — Student/Course detail phản ánh grade mutation

**Loại:** Current UI contract  
**AC:** `AC-GRADE-FE-09`

1. Tạo grade từ Grade Management.
2. Mở Student Detail và Course Detail.
3. Update score.
4. Mở lại hai detail.
5. Delete grade.

**Kết quả mong đợi**

- Các query all/byStudent/byCourse/pair được invalidate đúng.
- Detail phản ánh score mới.
- Sau delete, grade biến mất khỏi cả hai detail.

---

## E2E-GRADE-016 — Duplicate pair hiển thị lỗi an toàn

**Loại:** Observed backend gap  
**AC:** `AC-GRADE-FE-08`

1. Tạo Grade cho một pair.
2. Submit POST lần hai cùng pair.

**Kết quả mong đợi**

- Không tạo grade thứ hai.
- Grade đầu vẫn giữ nguyên.
- UI không hiển thị raw unique-constraint error.
- Có thể hiển thị generic “Điểm cho sinh viên và khóa học này đã tồn tại hoặc không thể lưu”.

Target backend: stable `409 GRADE_ALREADY_EXISTS`.

---

## E2E-GRADE-017 — Parent không tồn tại khi tạo Grade

**Loại:** Current backend contract

Hai biến thể:

- Student không tồn tại.
- Course không tồn tại.

**Kết quả mong đợi**

- Backend trả 404.
- UI giữ input phù hợp và hiển thị target không còn tồn tại.
- Không hiển thị success hoặc tạo dữ liệu một phần.

---

## E2E-GRADE-018 — Delete confirm nêu Student và Course

**Loại:** Current UI contract  
**AC:** `AC-GRADE-FE-06`

- Cancel không gửi DELETE.
- Confirm gửi đúng pair endpoint.
- Xử lý 204 không parse JSON.
- Sau success quay list và clear stale detail state.

---

## E2E-GRADE-019 — Delete unknown pair không phụ thuộc 404

**Loại:** Current backend caveat

Backend delete unknown pair có thể là no-op + 204. UI chỉ dựa vào response của action hiện tại và refetch, không yêu cầu 404 để hoàn tất workflow.
