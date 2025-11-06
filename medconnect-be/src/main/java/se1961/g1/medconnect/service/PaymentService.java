package se1961.g1.medconnect.service;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.dto.PaymentRequest;
import se1961.g1.medconnect.dto.PaymentResponse;
import se1961.g1.medconnect.enums.PaymentStatus;
import se1961.g1.medconnect.pojo.Appointment;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Patient;
import se1961.g1.medconnect.pojo.Payment;
import se1961.g1.medconnect.repository.AppointmentRepository;
import se1961.g1.medconnect.repository.PatientRepository;
import se1961.g1.medconnect.repository.PaymentRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Getter
@Setter
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Value("${vnpay.tmnCode}")
    private String vnpTmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnpHashSecret;

    @Value("${vnpay.url}")
    private String vnpPayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnpReturnUrl;    public PaymentResponse initiatePayment(String firebaseUid, PaymentRequest request) throws Exception {
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
        
        // Calculate consultation fee based on appointment type and doctor's speciality
        double consultationFee = calculateConsultationFee(appointment);

        // Create or update payment record
        Payment payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
        } else {
            payment = new Payment();
            payment.setAppointment(appointment);
            payment.setPatient(appointment.getPatient());
            payment.setAmount(consultationFee);
            payment.setGatewayName("VNPAY");
            payment.setPaymentMethod("BANK_TRANSFER");
        }
        
        payment.setStatus(PaymentStatus.PENDING);
        payment.setDescription("Thanh toán khám bệnh - " + appointment.getDoctor().getName());
        payment = paymentRepository.save(payment);
        
        // Generate invoice number
        String vnpTxnRef = String.valueOf(payment.getPaymentId()) + "-" + System.currentTimeMillis();


        // Prepare checkout request
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf((long) (payment.getAmount() * 100))); // multiply by 100
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", payment.getDescription());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", request.getReturnUrl() != null ? request.getReturnUrl() : vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", "127.0.0.1");
        vnpParams.put("vnp_CreateDate", LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        // ✅ Generate VNPAY signature
        String vnpSecureHash = generateVnpSignature(vnpParams);
        vnpParams.put("vnp_SecureHash", vnpSecureHash);

        String paymentUrl = vnpPayUrl + "?" + buildQuery(vnpParams);

        payment.setTransactionId(vnpTxnRef);
        paymentRepository.save(payment);

        return new PaymentResponse(
                paymentUrl,
                payment.getPaymentId().toString(),
                vnpTxnRef
        );
    }

    private String generateVnpSignature(Map<String, String> params) {
        try {
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String fieldName = fieldNames.get(i);
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                    if (i != fieldNames.size() - 1) {
                        hashData.append('&');
                    }
                }
            }

            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(vnpHashSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(hashData.toString().getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();

        } catch (Exception e) {
            throw new RuntimeException("Cannot generate VNPAY signature", e);
        }
    }

    private String buildQuery(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder query = new StringBuilder();
        for (String key : keys) {
            String value = params.get(key);
            if (query.length() > 0) query.append('&');
            query.append(URLEncoder.encode(key, StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
        }
        return query.toString();
    }

    public Payment handleIPN(Map<String, String> vnpResponse) throws Exception {
        String txnRef = vnpResponse.get("vnp_TxnRef");
        String responseCode = vnpResponse.get("vnp_ResponseCode");

        if (txnRef == null) {
            throw new Exception("Invalid IPN: missing transaction reference");
        }

        Long paymentId = Long.parseLong(txnRef.split("-")[0]);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new Exception("Payment not found"));

        if ("00".equals(responseCode)) { // success
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setGatewayResponse(vnpResponse.toString());

            Appointment appointment = payment.getAppointment();
            if (appointment != null) {
                appointment.setStatus(se1961.g1.medconnect.enums.AppointmentStatus.CONFIRMED);
                appointmentRepository.save(appointment);
            }

            paymentRepository.save(payment);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayResponse(vnpResponse.toString());

            // If payment failed/cancelled, auto-cancel the appointment so doctors cannot confirm it
            Appointment appointment = payment.getAppointment();
            if (appointment != null) {
                appointment.setStatus(se1961.g1.medconnect.enums.AppointmentStatus.CANCELLED);
                appointmentRepository.save(appointment);
            }

            paymentRepository.save(payment);
        }

        return payment;
    }

    public Payment getPaymentByAppointment(Long appointmentId) {
        return paymentRepository.findByAppointmentAppointmentId(appointmentId).orElse(null);
    }

    public List<Payment> getPaymentsByPatient(String firebaseUid) {
        Patient patient = patientRepository.findByFirebaseUid(firebaseUid).orElse(null);
        return paymentRepository.findByPatient(patient);
    }

    /**
     * Calculate consultation fee based on appointment type and doctor's speciality
     */
    private double calculateConsultationFee(Appointment appointment) {
        try {
            // Get doctor's speciality
            Doctor doctor = appointment.getDoctor();
            if (doctor == null || doctor.getSpeciality() == null) {
                // Fallback to default fee if no speciality found
                return 200000.0; // Default 200k VND
            }

            // Get price based on appointment type
            if (appointment.getType() == se1961.g1.medconnect.enums.AppointmentType.ONLINE) {
                return doctor.getSpeciality().getOnlinePrice() != null 
                    ? doctor.getSpeciality().getOnlinePrice().doubleValue()
                    : 200000.0; // Default online price
            } else {
                return doctor.getSpeciality().getOfflinePrice() != null 
                    ? doctor.getSpeciality().getOfflinePrice().doubleValue()
                    : 300000.0; // Default offline price
            }
        } catch (Exception e) {
            // Log error and return default fee
            System.err.println("Error calculating consultation fee: " + e.getMessage());
            return 200000.0; // Safe default
        }
    }
}

