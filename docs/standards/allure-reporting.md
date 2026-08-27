# Allure Reporting

**Phụ trách:** QA / Frontend team  
**Trạng thái:** Optional target  
**Cập nhật lần cuối:** 2026-07-22

Allure là lựa chọn trình bày evidence cho E2E; không phải capability current nếu project chưa cấu hình.

## Recommended metadata

- suite/module;
- AC ID;
- task/ticket link;
- environment/base URL;
- browser;
- screenshot/trace/video khi fail.

## Flow

```text
E2E runner
  → allure-results
  → generate HTML
  → CI artifact
```

Không đính kèm JWT/password/raw sensitive response vào report. Report phải phân biệt test skipped vì backend gap với test failure thật.
