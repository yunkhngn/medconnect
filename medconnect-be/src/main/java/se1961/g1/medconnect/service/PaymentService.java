package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import se1961.g1.medconnect.dto.PaymentInitRequest;
import se1961.g1.medconnect.dto.SePayCheckoutResponse;
import se1961.g1.medconnect.enums.PaymentStatus;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.pojo.Payment;
import se1961.g1.medconnect.repository.AppointmentRepository;
import se1961.g1.medconnect.repository.PaymentRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Value("${sepay.merchant.id:}")
    private String merchantId;
    
    @Value("${sepay.secret.key:}")
    private String secretKey;
    
    @Value("${sepay.api.url:https://sandbox-pay.sepay.vn/v1/checkout/init}")
    private String sePayApiUrl;
    
    @Value("${app.base.url:http://localhost:3000}")
    private String appBaseUrl;
    
    private static final double CONSULTATION_FEE = 200000.0; // 200,000 VND

    public SePayCheckoutResponse initiatePayment(String firebaseUid, PaymentInitRequest request) throws Exception {
        // Get appointment
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new Exception("Appointment not found"));
        
        // Verify appointment belongs to patient
        if (!appointment.getPatient().getFirebaseUid().equals(firebaseUid)) {
            throw new Exception("Unauthorized access to appointment");
        }
        
        // Check if payment already exists
        Optional<Payment> existingPayment = paymentRepository.findByAppointment(appointment);
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.PAID) {
            throw new Exception("Appointment already paid");
        }
        
        // Create or update payment record
        Payment payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
        } else {
            payment = new Payment();
            payment.setAppointment(appointment);
            payment.setPatient(appointment.getPatient());
            payment.setAmount(CONSULTATION_FEE);
            payment.setGatewayName("SEPAY");
            payment.setPaymentMethod("BANK_TRANSFER");
        }
        
        payment.setStatus(PaymentStatus.PENDING);
        payment.setDescription("Thanh toán khám bệnh - " + appointment.getDoctor().getName());
        payment = paymentRepository.save(payment);
        
        // Generate invoice number
        String invoiceNumber = "INV-" + payment.getPaymentId() + "-" + System.currentTimeMillis();
        
        // Prepare SePay checkout request
        Map<String, Object> checkoutData = new HashMap<>();
        checkoutData.put("merchant_id", merchantId);
        checkoutData.put("order_id", payment.getPaymentId().toString());
        checkoutData.put("order_amount", payment.getAmount());
        checkoutData.put("order_currency", "VND");
        checkoutData.put("order_description", payment.getDescription());
        checkoutData.put("order_invoice_number", invoiceNumber);
        checkoutData.put("success_url", appBaseUrl + "/thanh-toan/thanh-cong");
        checkoutData.put("error_url", appBaseUrl + "/thanh-toan/that-bai");
        checkoutData.put("cancel_url", appBaseUrl + "/thanh-toan/da-huy");
        
        // Generate signature
        String signature = generateSignature(checkoutData);
        checkoutData.put("signature", signature);
        
        try {
            // Call SePay API
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(checkoutData, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                sePayApiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                String checkoutUrl = (String) responseBody.get("checkout_url");
                
                // Update payment with transaction details
                payment.setTransactionId(invoiceNumber);
                paymentRepository.save(payment);
                
                return new SePayCheckoutResponse(
                    checkoutUrl,
                    payment.getPaymentId().toString(),
                    invoiceNumber
                );
            } else {
                throw new Exception("Failed to initialize payment with SePay");
            }
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayResponse("Error: " + e.getMessage());
            paymentRepository.save(payment);
            throw new Exception("Payment initialization failed: " + e.getMessage());
        }
    }
    
    public Payment handleIPN(Map<String, Object> ipnData) throws Exception {
        String notificationType = (String) ipnData.get("notification_type");
        
        if (!"ORDER_PAID".equals(notificationType)) {
            return null; // Ignore other notification types
        }
        
        Map<String, Object> order = (Map<String, Object>) ipnData.get("order");
        String orderId = (String) order.get("order_id");
        String orderStatus = (String) order.get("order_status");
        
        // Find payment by order ID
        Payment payment = paymentRepository.findById(Long.parseLong(orderId))
                .orElseThrow(() -> new Exception("Payment not found"));
        
        if ("CAPTURED".equals(orderStatus)) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            
            Map<String, Object> transaction = (Map<String, Object>) ipnData.get("transaction");
            payment.setTransactionId((String) transaction.get("transaction_id"));
            payment.setGatewayResponse(ipnData.toString());
            
            // Update appointment status to CONFIRMED after payment
            Appointment appointment = payment.getAppointment();
            if (appointment != null) {
                appointment.setStatus(se1961.g1.medconnect.enums.AppointmentStatus.CONFIRMED);
                appointmentRepository.save(appointment);
            }
            
            paymentRepository.save(payment);
        }
        
        return payment;
    }
    
    public Payment getPaymentByAppointment(Long appointmentId) throws Exception {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new Exception("Appointment not found"));
        
        return paymentRepository.findByAppointment(appointment)
                .orElse(null);
    }
    
    public List<Payment> getPaymentsByPatient(String firebaseUid) throws Exception {
        // Note: Need to get Patient by firebaseUid first
        // This requires PatientRepository method
        return new ArrayList<>(); // Placeholder
    }
    
    private String generateSignature(Map<String, Object> data) {
        try {
            // Sort parameters alphabetically (excluding signature)
            TreeMap<String, Object> sortedData = new TreeMap<>(data);
            sortedData.remove("signature");
            
            // Build query string
            StringBuilder queryString = new StringBuilder();
            for (Map.Entry<String, Object> entry : sortedData.entrySet()) {
                if (queryString.length() > 0) {
                    queryString.append("&");
                }
                queryString.append(entry.getKey()).append("=").append(entry.getValue());
            }
            
            // Generate HMAC SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(queryString.toString().getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signature", e);
        }
    }

    /**
     * Mock complete payment - for testing without payment gateway
     */
    public Payment mockCompletePayment(String firebaseUid, Long appointmentId) throws Exception {
        // Get appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new Exception("Appointment not found"));
        
        // Verify appointment belongs to patient
        if (!appointment.getPatient().getFirebaseUid().equals(firebaseUid)) {
            throw new Exception("Unauthorized access to appointment");
        }
        
        // Check if payment already exists and is paid
        Optional<Payment> existingPayment = paymentRepository.findByAppointment(appointment);
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.PAID) {
            throw new Exception("Appointment already paid");
        }
        
        // Create or update payment record
        Payment payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
        } else {
            payment = new Payment();
            payment.setAppointment(appointment);
            payment.setPatient(appointment.getPatient());
            payment.setAmount(CONSULTATION_FEE);
        }
        
        // Mark as paid
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setGatewayName("MOCK");
        payment.setPaymentMethod("MOCK_PAYMENT");
        payment.setTransactionId("MOCK-" + System.currentTimeMillis());
        payment.setDescription("Mock payment for testing - Appointment #" + appointmentId);
        payment = paymentRepository.save(payment);
        
        // Update appointment status to PENDING (waiting for doctor confirmation)
        // Don't auto-confirm, let doctor confirm manually
        if (appointment.getStatus() == se1961.g1.medconnect.enums.AppointmentStatus.PENDING) {
            // Keep as PENDING - doctor needs to confirm
        }
        appointmentRepository.save(appointment);
        
        return payment;
    }
}

