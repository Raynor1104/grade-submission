# State Management Boundaries

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

## 1. Rule

| State | Nơi quản lý đề xuất |
| --- | --- |
| API/server state | TanStack Vue Query hoặc query cache tương đương |
| Auth token/session hint | Auth store + storage adapter |
| Global UI | Pinia/store tương đương |
| Local form/dialog | Component state |
| Search/page/filter chia sẻ | URL query khi có lợi |

Không copy toàn bộ server list vào global store tạo hai nguồn sự thật.

## 2. Query keys

```text
students.all
students.detail:<id>
courses.all
courses.detail:<id>
grades.all
grades.student:<id>
grades.course:<id>
grades.pair:<studentId>:<courseId>
```

## 3. Dashboard

Counts có thể derive từ cache list nếu đã có, hoặc fetch song song ba collection. Recent Activities không có server state current.

## 4. Mutation

- Snapshot/optimistic update chỉ dùng khi rollback đơn giản.
- Create/delete parent có cascade uncertainty; ưu tiên server response + invalidate.
- Grade update có thể optimistic trên score nếu pair rõ và rollback được.

## 5. URL state

Search/page/filter có thể lưu trong query string để Back/Forward hoạt động. Không lưu JWT hoặc sensitive data trong URL.
