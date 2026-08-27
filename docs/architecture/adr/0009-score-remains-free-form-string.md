# ADR-0009: Score Remains a Free-form String

**Trạng thái:** Backend-aligned

## Bối cảnh

`Grade.score` là VARCHAR/String và không có enum/range. Wireframe có cả `A` và giá trị trông như số.

## Quyết định

- type frontend là `string`;
- dùng text input;
- chỉ trim và non-empty validation trong MVP;
- không parse, round, compare numerically hoặc áp dụng grade scale chưa được chốt.

## Hệ quả

Hỗ trợ `A`, `B+`, `Pass`, `85`, `8.5`, nhưng không thể tính trung bình hoặc sort theo học lực một cách đáng tin cậy.
