# ConfirmModal Component

Component modal tái sử dụng cho các tình huống cần xác nhận hành động từ user.

## 📚 Features

- ✅ 4 variants: `danger`, `warning`, `info`, `success`
- ✅ Tùy biến text, icon, màu sắc theo variant
- ✅ Hiển thị item name trong box nổi bật
- ✅ Warning box tùy chỉnh
- ✅ Loading state cho async actions
- ✅ Fully customizable

## 🎨 Variants

### 1. Danger (Delete/Remove Actions)
Màu đỏ, icon AlertTriangle
```jsx
<ConfirmModal
  variant="danger"
  title="Xóa dữ liệu"
  message="Bạn có chắc muốn xóa?"
/>
```

### 2. Warning (Risky Actions)
Màu vàng/cam, icon AlertCircle
```jsx
<ConfirmModal
  variant="warning"
  title="Thay đổi quan trọng"
  message="Hành động này sẽ ảnh hưởng đến dữ liệu"
/>
```

### 3. Info (Informational Confirmations)
Màu xanh dương, icon Info
```jsx
<ConfirmModal
  variant="info"
  title="Xác nhận thông tin"
  message="Vui lòng xác nhận thông tin trước khi tiếp tục"
/>
```

### 4. Success (Positive Confirmations)
Màu xanh lá, icon CheckCircle
```jsx
<ConfirmModal
  variant="success"
  title="Hoàn tất"
  message="Bạn muốn hoàn tất thao tác?"
/>
```

## 📖 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | required | Modal open state |
| `onClose` | function | required | Close handler |
| `onConfirm` | function | required | Confirm action handler |
| `title` | string | required | Modal title |
| `message` | string | required | Main message |
| `variant` | string | `'danger'` | Visual style: 'danger' \| 'warning' \| 'info' \| 'success' |
| `itemName` | string | optional | Name of item (shows in highlighted box) |
| `confirmText` | string | auto | Confirm button text |
| `cancelText` | string | `'Hủy'` | Cancel button text |
| `isLoading` | boolean | `false` | Loading state |
| `showWarning` | boolean | `true` | Show warning box |
| `warningText` | string | auto | Custom warning text |

## 💡 Usage Examples

### Example 1: Delete Confirmation
```jsx
import { ConfirmModal } from '@/components/ui';
import { useDisclosure } from '@heroui/react';

function MyComponent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const [item, setItem] = useState(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAPI(item.id);
      toast.success("Đã xóa thành công!");
      onClose();
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button onPress={() => { setItem(someItem); onOpen(); }}>
        Xóa
      </Button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
        variant="danger"
        title="Xóa giấy phép"
        message="Bạn có chắc muốn xóa giấy phép này? Dữ liệu sẽ mất vĩnh viễn."
        itemName={item?.licenseNumber}
        confirmText="Xác nhận xóa"
        isLoading={isDeleting}
      />
    </>
  );
}
```

### Example 2: Warning Confirmation
```jsx
<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleAction}
  variant="warning"
  title="Thay đổi quyền hạn"
  message="Bạn đang thay đổi quyền hạn của user. Điều này có thể ảnh hưởng đến quyền truy cập của họ."
  itemName={user.email}
  confirmText="Xác nhận thay đổi"
  warningText="Vui lòng kiểm tra kỹ quyền hạn trước khi xác nhận."
/>
```

### Example 3: Info Confirmation (No Item Name)
```jsx
<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleSubmit}
  variant="info"
  title="Xác nhận gửi đơn"
  message="Bạn có chắc muốn gửi đơn đăng ký này? Sau khi gửi, bạn không thể chỉnh sửa."
  confirmText="Gửi đơn"
  showWarning={false}
/>
```

### Example 4: Success Confirmation
```jsx
<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleApprove}
  variant="success"
  title="Phê duyệt đơn"
  message="Bạn có chắc muốn phê duyệt đơn này?"
  itemName={application.id}
  confirmText="Phê duyệt"
  cancelText="Quay lại"
/>
```

## 🎯 Best Practices

1. **Variant Selection:**
   - `danger`: Delete, remove, destructive actions
   - `warning`: Risky changes, important updates
   - `info`: Confirmations, informational prompts
   - `success`: Approvals, completions

2. **Item Name:**
   - Use for identifying what's being acted upon
   - Shows in highlighted box for emphasis
   - Optional - omit for generic confirmations

3. **Custom Text:**
   - Provide clear, action-oriented `confirmText`
   - Match the action being performed
   - Example: "Xóa", "Gửi", "Phê duyệt", "Hoàn tất"

4. **Loading State:**
   - Always show loading during async operations
   - Disable close while loading
   - Show feedback after completion

5. **Warning Box:**
   - Use for critical actions
   - Can be hidden with `showWarning={false}`
   - Customize with `warningText` prop

## 🔧 Customization

The component automatically styles based on variant:
- Colors, icons, and default texts are preset
- Override with custom props as needed
- Maintains consistent UX across the app

## 📝 Notes

- Built on top of @heroui/react Modal
- Uses lucide-react icons
- Fully responsive
- Backdrop blur effect
- Accessibility compliant

