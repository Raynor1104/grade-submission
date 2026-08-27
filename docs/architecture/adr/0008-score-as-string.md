# ADR-0008: Score remains a string

## Bối cảnh
Backend lưu `score` là chuỗi và wireframe đã được cập nhật để biểu diễn điểm dưới dạng chuỗi, ví dụ `A`, `Pass` hoặc `8.5`.

## Quyết định
Frontend dùng input text và giữ nguyên giá trị chuỗi; chỉ áp dụng tập giá trị hoặc quy tắc bổ sung khi nghiệp vụ và backend thống nhất.

## Hệ quả
### Tích cực
- tương thích backend
- hỗ trợ điểm chữ và số

### Tiêu cực
- không đảm bảo tính nhất quán hoặc tính toán trung bình
