# BHYTInput Component

Component input mã số Bảo hiểm Y tế (BHYT) Việt Nam với validation đầy đủ theo quy định của Bảo hiểm Xã hội Việt Nam.

## 📋 Tính năng

- ✅ **Auto-format**: Tự động format mã BHYT theo chuẩn `XX Y ZZ NNNNNNNNNN`
- ✅ **Real-time validation**: Validate từng ký tự khi nhập
- ✅ **Mã đối tượng**: Kiểm tra 65+ loại đối tượng BHYT hợp lệ
- ✅ **Mức hưởng**: Validate mức hưởng từ 1-5
- ✅ **Mã tỉnh**: Kiểm tra mã tỉnh/TP từ 01-99
- ✅ **Mã BHXH**: Validate 10 ký tự số cuối
- ✅ **Hiển thị thông tin**: Tự động hiển thị thông tin chi tiết khi mã hợp lệ
- ✅ **Error messages**: Thông báo lỗi rõ ràng, dễ hiểu
- ✅ **Visual feedback**: Icon check/error và màu sắc trực quan

## 🎯 Cấu trúc mã BHYT (15 ký tự)

```
XX Y ZZ NNNNNNNNNN
│  │ │  └─ 10 ký tự số: Mã số BHXH (định danh duy nhất)
│  │ └──── 2 ký tự số: Mã tỉnh/TP (01-99)
│  └────── 1 ký tự số: Mức hưởng (1-5)
└───────── 2 ký tự chữ: Mã đối tượng (VD: HS, DN, GD)
```

**Ví dụ**: `HS 4 01 0120878811`
- `HS`: Học sinh
- `4`: Mức hưởng 80%
- `01`: Hà Nội
- `0120878811`: Mã số BHXH

## 📦 Installation

Component đã được tạo sẵn trong project tại:
```
medconnect-fe/components/ui/BHYTInput.jsx
```

## 🚀 Usage

### Basic Usage

```jsx
import BHYTInput from '@/components/ui/BHYTInput';

function MyForm() {
  const [bhytCode, setBhytCode] = useState('');

  return (
    <BHYTInput
      value={bhytCode}
      onChange={setBhytCode}
      required
    />
  );
}
```

### With Form Validation

```jsx
import BHYTInput from '@/components/ui/BHYTInput';
import { isValidBHYT } from '@/utils/bhytHelper';

function PatientForm() {
  const [bhytCode, setBhytCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isValidBHYT(bhytCode)) {
      setError('Mã số BHYT không hợp lệ');
      return;
    }

    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      <BHYTInput
        value={bhytCode}
        onChange={setBhytCode}
        error={error}
        required
        label="Mã số Bảo hiểm Y tế"
        placeholder="VD: HS 4 01 0120878811"
      />
      <button type="submit">Xác nhận</button>
    </form>
  );
}
```

### With Parse Info

```jsx
import BHYTInput from '@/components/ui/BHYTInput';
import { parseBHYT } from '@/utils/bhytHelper';

function PatientInfo() {
  const [bhytCode, setBhytCode] = useState('');
  const bhytInfo = parseBHYT(bhytCode);

  return (
    <div>
      <BHYTInput
        value={bhytCode}
        onChange={setBhytCode}
      />
      
      {bhytInfo && (
        <div>
          <p>Đối tượng: {bhytInfo.objectName}</p>
          <p>Mức hưởng: {bhytInfo.benefitRate}</p>
          <p>Tỉnh/TP: {bhytInfo.provinceName}</p>
        </div>
      )}
    </div>
  );
}
```

## 🎨 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Giá trị mã BHYT (raw, không có space) |
| `onChange` | `function` | - | Callback khi giá trị thay đổi `(value: string) => void` |
| `error` | `string` | - | Error message từ bên ngoài (optional) |
| `required` | `boolean` | `false` | Bắt buộc nhập |
| `disabled` | `boolean` | `false` | Disable input |
| `label` | `string` | `"Mã số BHYT"` | Label của input |
| `placeholder` | `string` | `"XX 0 00 0000000000"` | Placeholder text |

## 🛠️ Helper Functions

### `formatBHYT(input: string): string`

Format mã BHYT thành dạng có space: `XX Y ZZ NNNNNNNNNN`

```javascript
import { formatBHYT } from '@/utils/bhytHelper';

formatBHYT('HS4010120878811');
// Output: "HS 4 01 0120878811"
```

### `validateBHYT(bhytCode: string): { isValid: boolean, errors: string[] }`

Validate mã BHYT và trả về danh sách lỗi

```javascript
import { validateBHYT } from '@/utils/bhytHelper';

const result = validateBHYT('HS4010120878811');
console.log(result.isValid); // true
console.log(result.errors);  // []
```

### `parseBHYT(bhytCode: string): object | null`

Parse thông tin chi tiết từ mã BHYT

```javascript
import { parseBHYT } from '@/utils/bhytHelper';

const info = parseBHYT('HS4010120878811');
console.log(info);
/*
{
  raw: "HS4010120878811",
  formatted: "HS 4 01 0120878811",
  objectCode: "HS",
  objectName: "Học sinh",
  benefitLevel: "4",
  benefitRate: "80%",
  benefitDescription: "Thanh toán 80% chi phí KCB",
  provinceCode: "01",
  provinceName: "Hà Nội",
  bhxhCode: "0120878811"
}
*/
```

### `isValidBHYT(bhytCode: string): boolean`

Kiểm tra nhanh mã BHYT có hợp lệ không

```javascript
import { isValidBHYT } from '@/utils/bhytHelper';

isValidBHYT('HS4010120878811'); // true
isValidBHYT('XX9990000000000'); // false
```

### `maskBHYT(bhytCode: string): string`

Ẩn 6 số cuối của mã BHXH (bảo mật)

```javascript
import { maskBHYT } from '@/utils/bhytHelper';

maskBHYT('HS4010120878811');
// Output: "HS 4 01 0120******"
```

## 📝 Mã đối tượng BHYT

### Nhóm do NLĐ và người SDLĐ đóng
- `DN`: NLĐ trong doanh nghiệp
- `HX`: NLĐ trong HTX
- `CH`: NLĐ trong cơ quan nhà nước
- `NN`: NLĐ làm việc cho tổ chức nước ngoài
- `TK`: NLĐ trong tổ chức khác
- `HC`: Cán bộ, công chức, viên chức
- `XK`: Người hoạt động không chuyên trách ở xã

### Nhóm do BHXH đóng
- `HT`: Người hưởng lương hưu
- `TB`: Người hưởng trợ cấp TNLĐ-BNN
- `NO`: NLĐ nghỉ ốm dài ngày
- `CT`: Người từ 80 tuổi hưởng trợ cấp tuất
- `XB`: Cán bộ xã nghỉ việc
- `TN`: Người hưởng trợ cấp thất nghiệp
- `CS`: Công nhân cao su nghỉ việc

### Nhóm do NSNN đóng
- `QN`: Quân nhân
- `CA`: Công an
- `CY`: Cán bộ cơ yếu
- `CC`: Người có công - nhóm 1
- `CK`: Người có công - nhóm 2
- `CB`: Cựu chiến binh
- `KC`: Người tham gia kháng chiến
- `HD`: Đại biểu Quốc hội/HĐND
- `TE`: Trẻ em dưới 6 tuổi
- `BT`: Người hưởng trợ cấp bảo trợ xã hội
- `HN`: Hộ nghèo
- `DT`: Dân tộc thiểu số
- `DK`: Vùng khó khăn đặc biệt
- `XD`: Xã đảo, huyện đảo
- Và nhiều mã khác...

### Nhóm NSNN hỗ trợ
- `CN`: Hộ cận nghèo
- `HS`: Học sinh
- `SV`: Sinh viên
- `GB`: Hộ gia đình nông-lâm-ngư-diêm nghiệp

### Nhóm hộ gia đình
- `GD`: Hộ gia đình

## 🎓 Mức hưởng BHYT

| Mức | Tỷ lệ | Mô tả |
|-----|-------|-------|
| 1 | 100% | Thanh toán 100% không giới hạn (CC, TE) |
| 2 | 100% | Thanh toán 100% có giới hạn (CK, CB, KC, HN, DT...) |
| 3 | 95% | Thanh toán 95% chi phí KCB (HT, TC, CN) |
| 4 | 80% | Thanh toán 80% chi phí KCB (DN, HX, CH, HS, SV, GD...) |
| 5 | 100% | Thanh toán 100% kể cả ngoài phạm vi (QN, CA, CY) |

## 🧪 Testing

Truy cập trang test để thử nghiệm component:

```
http://localhost:3000/test-bhyt
```

## 📚 Tài liệu tham khảo

- [Thông tư 14/2015/TT-BYT](https://thuvienphapluat.vn/van-ban/Bao-hiem/Thong-tu-14-2015-TT-BYT-huong-dan-kham-chua-benh-bao-hiem-y-te-269729.aspx)
- [Quyết định 1666/QĐ-BHXH](https://baohiemxahoi.gov.vn/)

## 💡 Tips

1. **Tự động gợi ý**: Component sẽ tự động gợi ý format khi user nhập
2. **Copy-paste**: Hỗ trợ paste mã BHYT có hoặc không có space
3. **Responsive**: Component responsive, hoạt động tốt trên mobile
4. **Accessibility**: Đầy đủ ARIA labels và keyboard navigation

## 🐛 Common Issues

### Issue: "Mã đối tượng không hợp lệ"
- Kiểm tra 2 ký tự đầu phải là chữ cái viết hoa
- Xem danh sách mã đối tượng hợp lệ ở trên

### Issue: "Mã tỉnh/TP phải từ 01-99"
- Mã tỉnh phải là 2 chữ số
- Phải có số 0 đứng đầu nếu < 10 (VD: 01, 05, 09)

## 📄 License

MIT © MedConnect

