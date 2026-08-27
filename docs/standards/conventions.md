# Documentation Conventions — Spec-first và SSoT

**Phụ trách:** Frontend team  
**Trạng thái:** Normative  
**Cập nhật lần cuối:** 2026-07-22

## 1. Entry points

1. `../architecture/README.md` — boundary và quyết định kiến trúc.
2. `../modules/README.md` — module map.
3. `../modules/*/spec.md` — acceptance criteria canonical.
4. `../modules/*/tasks.md` — implementation work.
5. `../modules/*/test_spec.md` — verification inventory.
6. `../standards/README.md` — quy tắc dùng chung.

## 2. Single Source of Truth

- Hành vi nghiệp vụ nằm trong module spec, không viết lại đầy đủ ở standards.
- Standards định nghĩa **cách triển khai và kiểm chứng**, không tự tạo requirement nghiệp vụ mới.
- Backend contract hiện tại được ghi ở `../architecture/api_integration.md` và tài liệu backend nguồn.
- Wireframe quyết định màn hình/label; backend quyết định endpoint và payload thực tế.

## 3. ID conventions

| Loại | Quy ước |
| --- | --- |
| Acceptance Criteria | `AC-GS-*`, `AC-AUTH-FE-*`, `AC-DASH-*`, `AC-STUDENT-FE-*`, `AC-COURSE-FE-*`, `AC-GRADE-FE-*`, `AC-PLATFORM-FE-*` |
| Task | `T-<AREA>-<SEQ>` |
| Test | `UT-`, `CT-`, `IT-`, `E2E-` + area + sequence |
| Edge case | `EC-###` trong architecture |
| ADR | `NNNN-kebab-case-title.md` |

ID đã phát hành không được tái sử dụng cho ý nghĩa khác.

## 4. Metadata bắt buộc

Mọi tài liệu canonical phải có:

```text
Phụ trách
Trạng thái
Cập nhật lần cuối
```

Nếu tài liệu mô tả cả current và target, phải có bảng hoặc heading phân biệt rõ.

## 5. Trạng thái task

- `ready`: backend hỗ trợ đủ.
- `partial`: frontend có thể làm nhưng phải xử lý tạm phía client hoặc error chưa ổn định.
- `blocked`: wireframe có nhưng backend thiếu capability.
- `backlog`: chưa thuộc MVP hoặc cần quyết định mới.

## 6. Quy tắc ví dụ

- Example Student phải dùng `birthDate`, không dùng `email`.
- Ngày trong JSON phải là `yyyy-MM-dd`.
- Example Grade phải đặt trong dấu nháy JSON vì `score` là chuỗi.
- Course UI dùng `name`, nhưng example API phải dùng `subject`.
