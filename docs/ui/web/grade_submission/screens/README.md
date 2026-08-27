# Grade Submission screen specifications

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-30

## Taxonomy

```text
screens/
├── _foundation/        Quy tắc chung, states, responsive, accessibility
├── auth/               Login
├── dashboard.md        Dashboard
├── students/           Quản lý sinh viên
├── courses/            Quản lý khóa học
├── grades/             Quản lý điểm
└── Shared/             Modal dùng chung
```

## Cấu trúc bắt buộc của screen doc

- Mục đích.
- Route và access.
- Capability status.
- Hợp đồng API.
- Layout/wireframe.
- Hành vi chính.
- Loading, empty, error và success states.
- Validation.
- Responsive và accessibility.
- Test coverage path.

## Current backend boundary

- Không có API version prefix.
- Protected endpoint dùng `Authorization: Bearer <jwt>`.
- Không có roles/permissions; mọi authenticated principal có cùng quyền nghiệp vụ.
- Không có update Student/Course.
- Không có search/pagination server-side.
- Error envelope chưa đồng nhất.

## Quy ước đọc screen docs

## Ký hiệu ASCII

| Ký hiệu | Ý nghĩa |
|---|---|
| `[Button]` | Nút tương tác |
| `[ Input_____ ]` | Input/select |
| `[View] [Edit] [Delete]` | Row actions |
| `+-----+` | Card, panel, table hoặc dialog |
| `Previous / Next` | Client-side pagination controls |

## Capability badges

- **Current:** backend và UI có thể triển khai ngay.
- **Frontend-only:** hành vi phía client, không cần endpoint mới.
- **Partial:** backend có primitive nhưng behavior lỗi/validation chưa ổn định.
- **Blocked:** wireframe có nhưng backend thiếu capability.
- **Backlog:** không thuộc bản hiện tại.

## Screen anatomy

```text
App Header
Navigation
Page Header / Toolbar
Main content
Pagination or Form actions
Global feedback / Dialog
```

## Data vocabulary

- Student: `id`, `name`, `birthDate`.
- Course: `id`, `code`, `subject`, `description`; UI label `Course Name` ánh xạ `subject`.
- Grade: `student`, `course`, `score`; `score` luôn là string.

## Tối ưu số lượng tài liệu

- Legend được đặt trực tiếp trong README để người đọc không phải mở file riêng.
- Login và logout cùng nằm trong `auth/auth_login.md` vì thuộc một vòng đời xác thực.
- Giữ riêng `_foundation/06_error_404_not_found.md` và `_foundation/09_error_500_unexpected.md` vì đây là hai nhóm lỗi khác nhau.
- Accessibility và responsive được gộp trong `_foundation/10_accessibility_and_responsive.md`.
- Design tokens, timing và animation được gộp trong `_foundation/12_design_system.md`.
