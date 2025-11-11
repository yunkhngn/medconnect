# 🔧 Backend Fix: Hiển thị đầy đủ License trong Admin

## Vấn đề hiện tại
- Admin API `/api/admin/doctor/all` chỉ trả về `licenseId`
- Frontend không có thông tin chi tiết license (số giấy phép, ngày cấp, cơ quan cấp, v.v.)
- Table `license` có đầy đủ dữ liệu nhưng không được join vào response

## Giải pháp: Sửa Backend

### Bước 1: Sửa DoctorService.java

Thêm method để map License sang DTO:

```java
// File: medconnect-be/src/main/java/se1961/g1/medconnect/service/DoctorService.java

private Map<String, Object> mapLicenseToDTO(License license) {
    if (license == null) {
        return null;
    }
    
    Map<String, Object> map = new HashMap<>();
    map.put("license_id", license.getLicenseId());
    map.put("license_number", license.getLicenseNumber());
    map.put("issued_date", license.getIssuedDate());
    map.put("expiry_date", license.getExpiryDate());
    map.put("issued_by", license.getIssuedBy());
    map.put("issuer_title", license.getIssuerTitle());
    map.put("scope_of_practice", license.getScopeOfPractice());
    map.put("is_active", license.getIsActive());
    map.put("notes", license.getNotes());
    map.put("proof_images", license.getProofImages());
    map.put("is_expired", license.isExpired());
    map.put("is_valid", license.isValid());
    
    return map;
}
```

### Bước 2: Sửa method getAllDoctorsForAdmin()

```java
// Trong method getAllDoctorsForAdmin(), thay đổi từ:
doctorMap.put("licenseId", doctor.getLicense() != null ? doctor.getLicense().getLicenseId() : null);

// Sang:
if (doctor.getLicense() != null) {
    doctorMap.put("licenseId", doctor.getLicense().getLicenseId());
    doctorMap.put("license", mapLicenseToDTO(doctor.getLicense()));
} else {
    doctorMap.put("licenseId", null);
    doctorMap.put("license", null);
}
```

### Bước 3: Test API Response

Sau khi sửa, response sẽ như này:

```json
{
  "id": 1,
  "name": "BS. Nguyễn Văn An",
  "email": "doctor.an@medconnect.vn",
  "licenseId": 123,
  "license": {
    "license_id": 123,
    "license_number": "000001/BYT-GPHN",
    "issued_date": "2024-01-15",
    "expiry_date": "2029-01-15",
    "issued_by": "Bộ Y Tế",
    "issuer_title": "Cục trưởng",
    "scope_of_practice": "Khám bệnh, chữa bệnh nội trú và ngoại trú",
    "is_active": true,
    "notes": "Cấp mới",
    "proof_images": "https://cloudinary.com/...",
    "is_expired": false,
    "is_valid": true
  }
}
```

## Cập nhật Frontend sau khi Backend fix

### Bước 4: Sửa admin/bac-si.jsx

```javascript
// Thay đổi phần hiển thị license từ:
{currentDoctor.licenseId ? (
  // Hiển thị licenseId
) : (
  // Empty state
)}

// Sang:
{currentDoctor.license ? (
  <Card className="border">
    <CardBody>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-600">Số giấy phép:</p>
          <p className="text-gray-900">{currentDoctor.license.license_number}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Ngày cấp:</p>
          <p className="text-gray-900">{currentDoctor.license.issued_date}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Ngày hết hạn:</p>
          <p className="text-gray-900">
            {currentDoctor.license.expiry_date || 'Không thời hạn'}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Cơ quan cấp:</p>
          <p className="text-gray-900">{currentDoctor.license.issued_by}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Chức vụ người cấp:</p>
          <p className="text-gray-900">{currentDoctor.license.issuer_title}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Trạng thái:</p>
          <Chip color={currentDoctor.license.is_active ? "success" : "danger"}>
            {currentDoctor.license.is_active ? "Còn hiệu lực" : "Hết hiệu lực"}
          </Chip>
        </div>
        {currentDoctor.license.scope_of_practice && (
          <div className="col-span-2">
            <p className="font-semibold text-gray-600">Phạm vi hành nghề:</p>
            <p className="text-gray-900">{currentDoctor.license.scope_of_practice}</p>
          </div>
        )}
        {currentDoctor.license.proof_images && (
          <div className="col-span-2">
            <p className="font-semibold text-gray-600">Hình ảnh chứng chỉ:</p>
            <img 
              src={currentDoctor.license.proof_images} 
              alt="License" 
              className="w-full max-w-md mt-2 rounded-lg border"
            />
          </div>
        )}
      </div>
    </CardBody>
  </Card>
) : (
  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-gray-400">
    <FileText size={48} className="mb-2" />
    <p>Chưa có chứng chỉ hành nghề</p>
  </div>
)}
```

## Tóm tắt

1. ✅ **Backend cần JOIN license data** vào API response
2. ✅ **Frontend đang sẵn sàng** nhận và hiển thị data
3. ⚠️ **Hiện tại chỉ hiển thị licenseId** (tạm thời)
4. 🎯 **Sau khi backend fix** → Frontend sẽ tự động hiển thị đầy đủ thông tin

---

**Ghi chú**: Doctor model đã có relationship với License, chỉ cần eager load khi query là xong!
