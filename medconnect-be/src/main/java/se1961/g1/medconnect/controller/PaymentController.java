package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.PaymentRequest;
import se1961.g1.medconnect.dto.PaymentResponse;
import se1961.g1.medconnect.enums.PaymentStatus;
import se1961.g1.medconnect.pojo.Payment;
import se1961.g1.medconnect.service.PaymentService;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    /**
     * Initialize payment for appointment — creates VNPay checkout link
     */
    @PostMapping("/init")
    public ResponseEntity<?> initiatePayment(
            Authentication authentication,
            @RequestBody PaymentRequest request
    ) {
        try {
            String firebaseUid = (String) authentication.getPrincipal();
            PaymentResponse response = paymentService.initiatePayment(firebaseUid, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * IPN webhook endpoint — receives notifications from VNPAY
     */
    @PostMapping("/ipn")
    public ResponseEntity<?> handleIPN(@RequestParam Map<String, String> ipnParams) {
        try {
            Payment payment = paymentService.handleIPN(ipnParams);
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } catch (Exception e) {
            // Always return 200 so VNPAY knows IPN was received
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", e.getMessage()));
        }
    }

    /**
     * Get payment status for a specific appointment
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPaymentByAppointment(@PathVariable Long appointmentId) {
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

    @GetMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestParam Map<String, String> vnpParams) {
        try {
            // VNPay returns params via GET, same structure as IPN
            Payment payment = paymentService.handleIPN(vnpParams);

            if (payment.getStatus() == PaymentStatus.PAID) {
                // You can redirect to frontend success page if desired
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Thanh toán thành công",
                        "paymentId", payment.getPaymentId(),
                        "status", payment.getStatus()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Thanh toán thất bại",
                        "status", payment.getStatus()
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all payments for the current authenticated patient
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
}

