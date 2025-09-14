# Quy tắc Commit Gitlab

Mỗi người sẽ được phân code các branch **`fe`** (frontend) và **`be`** (backend)

## Cấu trúc commit
```
<type>: <short description>
[optional body]
[optional footer]
```

### Type hợp lệ
- `feat`: thêm tính năng mới  
- `fix`: sửa bug  
- `docs`: thay đổi hoặc bổ sung tài liệu  
- `style`: thay đổi giao diện, format, CSS, không ảnh hưởng logic  
- `refactor`: tối ưu code, không thêm/chỉnh tính năng  
- `test`: thêm hoặc sửa test  
- `chore`: việc phụ trợ (config, CI/CD, dependency, build tool…)

### Ví dụ commit
- `feat: add user login API`  
- `feat: create navbar component`  
- `fix: wrong redirect after signup`  
- `chore: setup eslint and prettier`  
- `docs: update project setup guide`


## Checklist
- [ ] Code chạy được, không lỗi cơ bản  
- [ ] Đặt tên commit ngắn gọn, rõ ràng (≤ 50 ký tự)  
- [ ] Chia nhỏ commit, không gom quá nhiều thay đổi trong một commit  
- [ ] Nếu có thay đổi quan trọng thì mô tả chi tiết ở phần body  

## Quy tắc sử dụng Git
- Không commit trực tiếp vào `main`, `dev/fe`, `dev/be`
- Mỗi thành viên chỉ code trên branch cá nhân (`dev/fe-<tên>`, `dev/be-<tên>`)
- Hoàn thành task → tạo Merge Request vào nhánh team (`dev/fe`, `dev/be`)
- PM/Reviewer review code trước khi merge
- Khi cần cập nhật code mới từ `main`, sync theo flow:
  - `main` → `dev/fe` và `dev/be`
  - Các branch cá nhân sync từ branch team tương ứng
- Thường xuyên `git pull` để tránh xung đột