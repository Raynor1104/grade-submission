# Layer Public API Imports

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

Mỗi feature/layer expose public API qua `index.ts` hoặc entrypoint tương đương.

```text
features/students/
├── api/
├── model/
├── components/
├── pages/
└── index.ts
```

Import hợp lệ:

```ts
import { StudentTable, useStudents } from '@/features/students';
```

Tránh deep import nội bộ từ feature khác:

```ts
import { mapStudentDto } from '@/features/students/api/internal/mapper';
```

Ngoại lệ chỉ khi file được tuyên bố public rõ. Public entrypoint không được export mọi thứ vô điều kiện.
