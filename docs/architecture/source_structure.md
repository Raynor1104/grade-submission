# Source Structure đề xuất

**Trạng thái:** Frontend-proposed  
**Tham chiếu:** Cách chia feature module của tài liệu frontend Vue 3

```text
src/
├── app/
│   ├── router/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── guards.ts
│   ├── layouts/
│   │   ├── AuthLayout.vue
│   │   └── MainLayout.vue
│   ├── providers/
│   │   ├── query-client.ts
│   │   └── error-handler.ts
│   └── App.vue
├── core/
│   ├── api/
│   │   ├── http-client.ts
│   │   ├── endpoints.ts
│   │   ├── error-normalizer.ts
│   │   └── types.ts
│   ├── auth/
│   │   ├── auth-store.ts
│   │   ├── token-storage.ts
│   │   └── jwt.ts
│   ├── config/
│   │   └── env.ts
│   └── models/
│       ├── student.ts
│       ├── course.ts
│       └── grade.ts
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── validation/
│   ├── dashboard/
│   ├── students/
│   ├── courses/
│   └── grades/
├── shared/
│   ├── ui/
│   │   ├── DataTable.vue
│   │   ├── ConfirmDialog.vue
│   │   ├── Pagination.vue
│   │   └── ErrorState.vue
│   ├── composables/
│   └── utils/
└── main.ts
```

## Ranh giới trách nhiệm

### `app`

- khởi tạo router và provider;
- layout public/protected;
- global error handling.

### `core`

- HTTP client và endpoint constants;
- JWT/token lifecycle;
- DTO dùng chung và adapter;
- không chứa component nghiệp vụ.

### `features`

Mỗi feature sở hữu:

- API query/mutation;
- page và component nghiệp vụ;
- form schema;
- adapter/view model;
- test của feature.

### `shared`

Chỉ chứa UI/composable thực sự dùng lại ở nhiều feature.

## Dependency rule

```text
app → features → core
app → shared
features → shared + core
shared → core types (hạn chế)
core → không phụ thuộc feature
```
