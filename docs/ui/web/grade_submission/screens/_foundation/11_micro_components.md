# Shared micro-components

**Phụ trách:** Frontend team  
**Trạng thái:** Backend-aligned + wireframe-aligned  
**Cập nhật lần cuối:** 2026-07-22

## AppHeader / PrimaryNav

Props tối thiểu: username, active route, logout callback.

## PageHeader

Title + optional description + action slot.

## SummaryCard

Dùng cho Total Students/Courses/Grades. Hỗ trợ loading, value, error và retry độc lập.

## DataTable

- Loading, empty, horizontal scroll.
- Row actions với accessible label.
- Không tự gọi API; nhận rows/view model.

## ClientPagination

Nhận filtered array, page, pageSize; reset page khi filter thay đổi.

## SearchField

Clear button, Enter behavior, label hiển thị hoặc accessible name rõ.

## FormField / DateField

Label, helper, error, required; DateField chuyển display/input thành ISO payload an toàn.

## ErrorState / EmptyState

Domain copy + Retry/Back CTA.

## ConfirmDeleteDialog

Nhận target label, impact warning, confirm/cancel; xem `Shared/confirm_delete_modal.md`.

## CapabilityAction

Render enabled/disabled/hidden theo matrix; disabled action phải có lý do machine-testable.
