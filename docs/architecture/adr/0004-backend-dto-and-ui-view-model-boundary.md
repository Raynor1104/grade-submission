# ADR-0004: Backend DTO và UI View-Model Boundary

**Trạng thái:** Proposed / Accepted

## Bối cảnh

Backend field `subject` được wireframe gọi là Course Name; Grade trả nested entity; Student dùng `birthDate` nhưng UI hiển thị ngày theo định dạng thân thiện hơn payload API.

## Quyết định

- định nghĩa DTO đúng backend;
- dùng adapter để tạo view model;
- canonical Student UI dùng Birth Date ở list, form và detail;
- adapter định dạng `birthDate` để hiển thị nhưng giữ payload API ở dạng ISO;
- không thêm field giả hoặc đổi dữ liệu ngầm.

## Hệ quả

**Tích cực:** UI ít coupling với serialization; mismatch có một nơi xử lý.  
**Tiêu cực:** thêm lớp mapping và test adapter.
