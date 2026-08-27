# ADR-0005: State Boundaries — Vue Query, Pinia, Local và URL

**Trạng thái:** Proposed / Accepted

## Quyết định

| State | Tool |
|---|---|
| API server data | TanStack Vue Query |
| JWT/username/auth flag | Pinia + storage adapter |
| Search/filter/page | Vue Router query params |
| Modal/form state | `ref`/`reactive` hoặc form library |

Không sao chép Student/Course/Grade response vào Pinia.

## Hệ quả

- một nguồn sự thật cho server cache;
- filter shareable và back-button safe;
- cần query-key convention và invalidation discipline.
