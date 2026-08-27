# Confirm Delete Dialog

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

**Test coverage:** `docs/e2e/system_states.md` — `E2E-STATE-FE-009`; domain delete scenarios.

## Mục đích

Xác nhận destructive action trước khi gọi DELETE.

## Layout

```text
+--------------------------------------------------------------+
|                                                      [ X ]   |
|  [Delete]  Confirm Deletion                                  |
|                                                              |
|  ----------------------------------------------------------  |
|                                                              |
|  Are you sure you want to delete this grade?                 |
|                                                              |
|  Target:                                                     |
|  Nguyen Van A — JAVA101 — Java Programming                   |
|                                                              |
|  Warning: This action will permanently remove                |
|           this grade record.                                 |
|                                                              |
|  ----------------------------------------------------------  |
|                                                              |
|       [      Confirm Delete      ]   [      Cancel      ]    |
|                                                              |
+--------------------------------------------------------------+
```

## Target copy

- Student: tên + ID; cảnh báo grades có thể cascade delete.
- Course: code + name; cảnh báo grades có thể cascade delete.
- Grade: Student + Course pair; chỉ grade pair bị xóa.

## Behavior

- Cancel: đóng, không phát request.
- Confirm: disable cả hai actions hoặc ít nhất confirm trong pending state.
- Chỉ đóng và thông báo success sau response 204/2xx.
- Error: giữ dialog hoặc trả về page với error rõ ràng; không mất context.
- Unknown delete behavior Student/Course chưa ổn định; map generic error an toàn.

## Accessibility

Focus trap, descriptive title, danger button rõ, focus restore về trigger.
