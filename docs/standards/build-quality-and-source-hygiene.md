# Build Quality and Source Hygiene

**Phụ trách:** Frontend team  
**Trạng thái:** Target  
**Cập nhật lần cuối:** 2026-07-22

## Minimum commands

Project thực tế phải định nghĩa lệnh tương đương:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

E2E khi có:

```bash
npm run e2e
```

## Source hygiene

- Không commit build output, local env secret, test token hoặc H2 export.
- Lockfile phải được commit.
- Không để focused test (`.only`) hoặc debug logging.
- Dependency mới cần lý do và license/security review phù hợp.
- Generated files phải xác định rõ có commit hay tạo trong CI.

## CI target

1. install frozen lockfile;
2. docs link/metadata checks;
3. lint + typecheck;
4. unit/component tests;
5. build;
6. E2E/contract tests khi backend sẵn sàng;
7. artifact/report upload.
