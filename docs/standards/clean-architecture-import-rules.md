# Clean Architecture Import Rules

**Phụ trách:** Frontend team  
**Trạng thái:** Frontend-proposed  
**Cập nhật lần cuối:** 2026-07-22

## 1. Proposed layers

```text
app → features → core
app → shared
features → core + shared
shared → core types (hạn chế)
core → không phụ thuộc feature
```

## 2. Rules

- `core/api` không import component/router feature.
- Feature A không deep-import internals của Feature B.
- Shared UI không import Student/Course/Grade business service.
- Mapper/domain type không phụ thuộc Vue component APIs.
- Route/page có thể orchestrate query và component, nhưng không chứa HTTP parsing lặp lại.

## 3. Forbidden examples

```ts
// shared/DataTable imports student service — forbidden
import { deleteStudent } from '@/features/students/api/internal';

// core imports feature — forbidden
import StudentPage from '@/features/students/pages/StudentPage.vue';
```

## 4. Enforcement target

- ESLint restricted imports.
- Alias boundaries.
- Architecture test hoặc dependency graph trong CI.
