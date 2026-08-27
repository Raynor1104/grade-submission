# Playwright implementation mapping

## 1. Cấu trúc đề xuất

```text
e2e-tests/
├── playwright.config.ts
├── tests/
│   ├── auth.spec.ts
│   ├── access-control.spec.ts
│   ├── dashboard.spec.ts
│   ├── students.spec.ts
│   ├── courses.spec.ts
│   ├── grades.spec.ts
│   ├── system-states.spec.ts
│   └── performance.spec.ts
├── pages/
│   ├── login.page.ts
│   ├── app-shell.page.ts
│   ├── dashboard.page.ts
│   ├── students.page.ts
│   ├── courses.page.ts
│   └── grades.page.ts
├── fixtures/
│   ├── auth.fixture.ts
│   ├── api.fixture.ts
│   └── data.fixture.ts
└── helpers/
    ├── wait-for-backend.ts
    ├── redact.ts
    └── assertions.ts
```

## 2. Core test mapping

| Module test ID | Playwright file | Journey document |
| --- | --- | --- |
| `E2E-GS-007` | `access-control.spec.ts` | `access_control.md` |
| `E2E-AUTH-FE-009` | `auth.spec.ts` | `auth.md` |
| `E2E-DASH-007` | `dashboard.spec.ts` | `dashboard.md` |
| `E2E-STUDENT-012` | `students.spec.ts` | `students.md` |
| `E2E-COURSE-011` | `courses.spec.ts` | `courses.md` |
| `E2E-GRADE-011` | `grades.spec.ts` | `grades.md` |
| `E2E-PLATFORM-FE-011` | `access-control.spec.ts` | `access_control.md` |

## 3. Page objects

Page object chỉ đóng gói hành động và locator ổn định. Assertion nghiệp vụ chính nên ở test để giữ scenario dễ đọc.

Ví dụ:

```ts
class StudentsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/app/students');
  }

  async createStudent(name: string, birthDate: string) {
    await this.page.getByRole('button', { name: 'Add Student' }).click();
    await this.page.getByLabel('Full Name').fill(name);
    await this.page.getByLabel('Birth Date').fill(birthDate);
    await this.page.getByRole('button', { name: 'Save Student' }).click();
  }
}
```

## 4. Fixture ownership

- `auth.fixture`: login API/UI và storage state.
- `api.fixture`: typed helpers cho Student/Course/Grade.
- `data.fixture`: unique suffix và cleanup registry.
- Mỗi test đăng ký entity đã tạo để cleanup ở `finally`/fixture teardown.

## 5. Network assertions

Dùng `page.waitForResponse` hoặc event listener để assert:

- Method.
- Path.
- Status.
- Request JSON.
- Bearer presence nhưng không log full token.

Không mock core happy path.

## 6. Controlled interception

Chỉ dùng `page.route` cho:

- Network failure.
- Partial Dashboard card error.
- Unexpected response shape.
- Empty arrays khi seed backend không thể tạo trạng thái.
- Rate/latency simulation nếu cần UI behavior.

Mỗi intercepted test phải gắn `@frontend-controlled`.

## 7. Locator contracts cần frontend cung cấp

Đề xuất `data-testid`:

```text
app-shell
dashboard-student-count
dashboard-course-count
dashboard-grade-count
student-table
course-table
grade-table
confirm-delete-dialog
global-error
```

Form field nên ưu tiên label thay vì test ID.

## 8. Storage state

Không commit file chứa JWT thật. Nếu tạo storage state:

- Sinh trong runtime.
- Lưu dưới output ignored.
- Redact trong artifact.
- Hủy sau job.

## 9. Commands đề xuất

Chỉ áp dụng sau khi runner được thêm vào source:

```bash
npx playwright test
npx playwright test tests/students.spec.ts
npx playwright show-report
```

Lệnh khởi động frontend phải lấy từ `package.json` thực tế, không suy đoán trong tài liệu này.
