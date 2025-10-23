package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.PaymentInitRequest;
import se1961.g1.medconnect.dto.SePayCheckoutResponse;
import se1961.g1.medconnect.pojo.Payment;
import se1961.g1.medconnect.service.PaymentService;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;

    /**
     * Initialize payment for appointment
     */
    @PostMapping("/init")
    public ResponseEntity<?> initiatePayment(
            Authentication authentication,
            @RequestBody PaymentInitRequest request
    ) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            SePayCheckoutResponse response = paymentService.initiatePayment(firebaseUid, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * IPN webhook endpoint - receives payment notifications from SePay
     */
    @PostMapping("/ipn")
    public ResponseEntity<?> handleIPN(@RequestBody Map<String, Object> ipnData) {
        try {
            Payment payment = paymentService.handleIPN(ipnData);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            // Still return 200 to acknowledge receipt
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Get payment status for appointment
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointment(
            @PathVariable Long appointmentId
    ) {
        try {
            Payment payment = paymentService.getPaymentByAppointment(appointmentId);
            if (payment == null) {
                return ResponseEntity.ok(Map.of("hasPaid", false));
            }
            return ResponseEntity.ok(Map.of(
                "hasPaid", payment.getStatus().name().equals("PAID"),
                "status", payment.getStatus().name(),
                "amount", payment.getAmount(),
                "paidAt", payment.getPaidAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all payments for current patient
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyPayments(Authentication authentication) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            var payments = paymentService.getPaymentsByPatient(firebaseUid);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mock payment - Auto complete payment without gateway (for testing)
     */
    @PostMapping("/mock-complete")
    public ResponseEntity<?> mockCompletePayment(
            Authentication authentication,
            @RequestBody Map<String, Long> request
    ) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            Long appointmentId = request.get("appointmentId");
            
            if (appointmentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "appointmentId is required"));
            }
            
            Payment payment = paymentService.mockCompletePayment(firebaseUid, appointmentId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thanh toán thành công",
                "payment", payment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

