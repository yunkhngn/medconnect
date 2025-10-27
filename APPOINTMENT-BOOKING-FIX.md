# Fix: Appointment Booking Issues

## 🐛 Vấn đề
1. **Không thấy danh sách bác sĩ** khi vào trang đặt lịch
2. **Chỉ chọn được 4 slots** đầu tiên, không thể scroll để xem thêm

## 🔍 Nguyên nhân

### Vấn đề 1: Không hiển thị danh sách bác sĩ
- **Backend SecurityConfig**: Endpoint `/doctor/dashboard/all` yêu cầu `DOCTOR` role
- **FirebaseFilter**: Không skip endpoint này cho public access
- **Kết quả**: Frontend gọi API bị 403 Forbidden

### Vấn đề 2: Không scroll được slots
- **Frontend UI**: Container slots thiếu `max-height` và `overflow-y-auto`
- **Kết quả**: Chỉ hiển thị 4 slots đầu tiên, không thể scroll

## ✅ Giải pháp đã áp dụng

### 1. SecurityConfig.java
```java
@Configuration(proxyBeanMethods = false) // Thêm để fix CGLIB classloader issue
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // ...
    
    .authorizeHttpRequests(auth -> auth
        // Public endpoints
        .requestMatchers("/api/auth/**").permitAll()
        .requestMatchers("/api/appointments/doctor/*/available-slots").permitAll()
        .requestMatchers("/api/appointments/doctor/{doctorId}/available-slots").permitAll() // ✅ Thêm
        .requestMatchers("/doctor/dashboard/all").permitAll() // ✅ Thêm
        // ...
    )
}
```

**Thay đổi:**
- ✅ Thêm `proxyBeanMethods = false` để tránh CGLIB enhancement issues với Spring DevTools
- ✅ Cho phép public access tới `/doctor/dashboard/all`
- ✅ Thêm pattern rõ ràng hơn cho available-slots endpoint

### 2. FirebaseFilter.java
```java
@Override
protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();
    return path.startsWith("/api/auth") || 
           path.startsWith("/actuator") ||
           path.startsWith("/api/specialities") ||
           path.startsWith("/api/payment/ipn") ||
           path.startsWith("/doctor/dashboard/all") || // ✅ Thêm
           path.matches("/api/appointments/doctor/\\d+/available-slots.*"); // ✅ Thêm
}
```

**Thay đổi:**
- ✅ Skip authentication filter cho `/doctor/dashboard/all`
- ✅ Skip authentication filter cho `/api/appointments/doctor/{id}/available-slots`

### 3. dat-lich-kham.jsx (Frontend)
```jsx
// UI cải tiến cho slot selection
<div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
  {availableSlots.map((slot) => (
    <Button
      key={slot}
      variant={selectedSlot === slot ? "solid" : "bordered"}
      color={selectedSlot === slot ? "primary" : "default"}
      onClick={() => setSelectedSlot(slot)}
      startContent={<Clock size={18} />}
      className="w-full" // ✅ Thêm
    >
      {SLOT_TIMES[slot]}
    </Button>
  ))}
</div>

// Thêm hiển thị số lượng slots
<div className="flex items-center justify-between mb-2">
  <label className="text-sm font-medium">Chọn khung giờ</label>
  {availableSlots.length > 0 && (
    <span className="text-xs text-gray-500">
      {availableSlots.length} khung giờ có sẵn
    </span>
  )}
</div>

// Thêm console.log để debug
console.log("Fetched doctors:", data.length, "doctors");
console.log(`Available slots for ${selectedDate}:`, data.availableSlots);
```

**Thay đổi:**
- ✅ Thêm `max-h-[400px] overflow-y-auto` để có thể scroll
- ✅ Thêm hiển thị số lượng slots available
- ✅ Thêm `className="w-full"` cho buttons
- ✅ Thêm console logging để debug

## 🧪 Test

### Test 1: Kiểm tra danh sách bác sĩ
1. Đăng nhập với tài khoản PATIENT
2. Vào trang **Đặt lịch khám** (`/nguoi-dung/dat-lich-kham`)
3. **Kỳ vọng:** Danh sách bác sĩ hiển thị đầy đủ
4. Kiểm tra console: Phải có log `"Fetched doctors: X doctors"`

### Test 2: Kiểm tra slot selection
1. Chọn một bác sĩ
2. Chọn ngày khám (phải là ngày có lịch của bác sĩ)
3. **Kỳ vọng:** 
   - Hiển thị tất cả các slots available
   - Có thể scroll nếu có > 4 slots
   - Hiển thị "X khung giờ có sẵn" ở góc phải
4. Kiểm tra console: Phải có log `"Available slots for YYYY-MM-DD: [...]"`

### Test 3: Kiểm tra đặt lịch end-to-end
1. Chọn bác sĩ → Chọn ngày → Chọn slot
2. Chọn hình thức khám (Online/Offline)
3. Nhập lý do (optional)
4. Click "Xác nhận đặt lịch"
5. **Kỳ vọng:** 
   - Đặt lịch thành công
   - Redirect tới trang thanh toán

## 🚀 Deployment

### Development (Local)
```bash
# Backend - Restart Spring Boot application
cd medconnect-be
./mvnw spring-boot:run

# Frontend - Next.js tự động hot reload
# Không cần làm gì
```

### Production (Docker)
```bash
cd /path/to/project
docker-compose down
docker-compose up --build -d
```

## 📝 Files đã thay đổi
1. `medconnect-be/src/main/java/se1961/g1/medconnect/config/SecurityConfig.java`
2. `medconnect-be/src/main/java/se1961/g1/medconnect/filter/FirebaseFilter.java`
3. `medconnect-fe/pages/nguoi-dung/dat-lich-kham.jsx`

## 🔗 Related Endpoints

### Public (No Authentication)
- `GET /doctor/dashboard/all` - Lấy danh sách tất cả bác sĩ
- `GET /api/appointments/doctor/{doctorId}/available-slots?date=YYYY-MM-DD` - Lấy slots trống

### Authenticated (Require Token)
- `POST /api/appointments` - Tạo lịch hẹn mới
- `GET /api/appointments/my` - Lấy lịch hẹn của user hiện tại
- `PATCH /api/appointments/{id}/status` - Cập nhật trạng thái lịch hẹn

## ⚠️ Lưu ý
- Phải restart backend để thay đổi có hiệu lực
- Frontend sẽ tự động reload nhờ Next.js hot reload
- Check console log để debug nếu vẫn gặp vấn đề


