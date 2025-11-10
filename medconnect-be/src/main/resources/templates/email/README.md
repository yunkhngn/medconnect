# 📧 Email Templates

## Overview
Các template email HTML được sử dụng bởi `EmailService` để gửi email.

## Template Files

### 1. `appointment-confirmation.html`
**Mục đích:** Xác nhận đặt lịch khám thành công

**Variables:**
- `{{patientName}}` - Tên bệnh nhân
- `{{doctorName}}` - Tên bác sĩ
- `{{specialization}}` - Chuyên khoa
- `{{appointmentDate}}` - Ngày khám (VD: 25/10/2024)
- `{{appointmentTime}}` - Giờ khám (VD: 09:00)

**Usage:**
```java
emailService.sendAppointmentConfirmation(
    "patient@example.com",
    "Nguyễn Văn A",
    "Trần Thị B",
    "25/10/2024",
    "09:00",
    "Tim mạch"
);
```

---

### 2. `appointment-reminder.html`
**Mục đích:** Nhắc nhở lịch hẹn sắp tới

**Variables:**
- `{{patientName}}` - Tên bệnh nhân
- `{{doctorName}}` - Tên bác sĩ
- `{{appointmentDate}}` - Ngày khám
- `{{appointmentTime}}` - Giờ khám

**Usage:**
```java
emailService.sendAppointmentReminder(
    "patient@example.com",
    "Nguyễn Văn A",
    "Trần Thị B",
    "25/10/2024",
    "09:00"
);
```

---

### 3. `password-reset.html`
**Mục đích:** Email đặt lại mật khẩu

**Variables:**
- `{{userName}}` - Tên người dùng
- `{{resetLink}}` - Link đặt lại mật khẩu

**Usage:**
```java
emailService.sendPasswordResetEmail(
    "user@example.com",
    "Nguyễn Văn A",
    "https://medconnect.app/reset?token=abc123"
);
```

---

### 4. `welcome.html`
**Mục đích:** Chào mừng user mới

**Variables:**
- `{{userName}}` - Tên người dùng

**Usage:**
```java
emailService.sendWelcomeEmail(
    "newuser@example.com",
    "Nguyễn Văn A"
);
```

---

## Template Syntax

### Variables
Sử dụng format: `{{variableName}}`

**Example:**
```html
<p>Xin chào <strong>{{userName}}</strong>,</p>
```

### Styling
Tất cả CSS được inline trong `<style>` tag để tương thích với email clients.

**Color Scheme:**
- Teal (`#0891b2`) - Confirmation
- Orange (`#f59e0b`) - Reminder
- Red (`#dc2626`) - Security/Alert
- Green (`#10b981`) - Welcome

---

## How to Add New Template

### Step 1: Create HTML File
Tạo file mới trong folder này:
```
templates/email/your-template.html
```

### Step 2: Add Variables
Sử dụng `{{variableName}}` cho dynamic content:
```html
<p>Hello {{userName}}, your order {{orderId}} is ready!</p>
```

### Step 3: Create Service Method
Trong `EmailService.java`:
```java
public String sendYourEmail(
        String to,
        String userName,
        String orderId
) throws ResendException {
    try {
        Map<String, String> variables = new HashMap<>();
        variables.put("userName", userName);
        variables.put("orderId", orderId);
        
        String html = templateLoader.loadTemplate("your-template", variables);
        String subject = "Your Order is Ready!";
        
        return sendEmail(to, subject, html);
    } catch (IOException e) {
        throw new ResendException("Failed to load email template: " + e.getMessage());
    }
}
```

### Step 4: Add Controller Endpoint (Optional)
Trong `EmailController.java`:
```java
@PostMapping("/your-email")
public ResponseEntity<?> sendYourEmail(
        @RequestBody Map<String, String> request) {
    try {
        String to = request.get("to");
        String userName = request.get("userName");
        String orderId = request.get("orderId");
        
        String emailId = emailService.sendYourEmail(to, userName, orderId);
        
        return ResponseEntity.ok(Map.of(
            "message", "Email sent successfully",
            "emailId", emailId
        ));
    } catch (ResendException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", e.getMessage()));
    }
}
```

---

## Template Best Practices

### 1. Keep it Simple
- Sử dụng inline CSS
- Tránh JavaScript
- Tránh background images phức tạp

### 2. Responsive Design
```css
@media only screen and (max-width: 600px) {
    .content {
        padding: 15px !important;
    }
}
```

### 3. Test Across Email Clients
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- Mobile devices

### 4. Accessibility
- Sử dụng semantic HTML
- Alt text cho images
- High contrast colors
- Readable font sizes

### 5. Variable Naming
- Sử dụng camelCase: `{{userName}}` ✅
- Tránh snake_case: `{{user_name}}` ❌
- Descriptive names: `{{patientName}}` ✅
- Short names: `{{pn}}` ❌

---

## Testing Templates

### Test in Development
```java
@SpringBootTest
class EmailServiceTest {
    @Autowired
    private EmailService emailService;
    
    @Test
    void testAppointmentConfirmation() throws Exception {
        String emailId = emailService.sendAppointmentConfirmation(
            "test@example.com",
            "Test Patient",
            "Test Doctor",
            "25/10/2024",
            "09:00",
            "General"
        );
        
        assertNotNull(emailId);
    }
}
```

### Preview Template
Mở trực tiếp file HTML trong browser để xem design (variables sẽ hiển thị là `{{variableName}}`).

---

## Troubleshooting

### Template Not Found
```
Error: Failed to load email template: templates/email/xxx.html
```
**Solution:** Kiểm tra file tồn tại và tên chính xác

### Variables Not Replaced
```
Email hiển thị: "Hello {{userName}}"
```
**Solution:** Kiểm tra variable name trong code và template match

### Styling Issues
```
Email hiển thị không đúng format
```
**Solution:** 
- Sử dụng inline CSS
- Test với nhiều email clients
- Avoid complex layouts

---

## Resources

- **Resend Docs:** https://resend.com/docs
- **Email on Acid:** https://www.emailonacid.com/
- **Can I Email:** https://www.caniemail.com/
- **HTML Email Templates:** https://htmlemail.io/

---

Made with ❤️ by MedConnect Team

