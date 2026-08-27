# Course Journey

**Trạng thái:** Create/read/list/delete supported; update gap

## 1. Danh sách

1. gọi `GET /course/all`;
2. map backend `subject` thành nhãn UI “Course Name”;
3. search theo `code` hoặc `subject` tại client;
4. pagination tại client.

## 2. Tạo Course

Payload:

```json
{
  "subject": "Java Programming",
  "code": "JAVA101",
  "description": "Basic Java programming course"
}
```

Sau `201`, invalidate query `courses` và dashboard count.

## 3. Duplicate code

Database enforce unique `code`, nhưng chưa có error mapping ổn định. UI phải:

- giữ form data;
- hiển thị lỗi chung nếu không nhận được field-level error;
- không khẳng định mọi duplicate sẽ trả 409.

## 4. Chi tiết Course

Tải song song:

- `GET /course/{id}`;
- `GET /grade/course/{id}`.

Grade response chứa Student nested, nên có thể render bảng sinh viên và điểm.

## 5. Edit

Backend không có PUT/PATCH Course. MVP ẩn/disable Edit.

## 6. Delete

- mở confirm dialog;
- cảnh báo có thể ảnh hưởng Grade;
- gọi `DELETE /course/{id}`;
- khi thành công invalidate `courses`, `grades`, dashboard;
- unknown ID delete chưa có contract 404 ổn định.
