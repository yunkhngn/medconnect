package se1961.g1.medconnect.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import se1961.g1.medconnect.dto.PaymentRequest;
import se1961.g1.medconnect.dto.PaymentResponse;
import se1961.g1.medconnect.enums.PaymentStatus;
import se1961.g1.medconnect.pojo.Payment;
import se1961.g1.medconnect.service.PaymentService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    // --- TEST: /init ---
    @Test
    void testInitiatePaymentSuccess() throws Exception {
        PaymentRequest request = new PaymentRequest();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("user123", null);

        PaymentResponse expectedResponse =
                new PaymentResponse("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", "ORDER123", "INV001");

        when(paymentService.initiatePayment("user123", request)).thenReturn(expectedResponse);

        ResponseEntity<?> response = paymentController.initiatePayment(auth, request);

        assertEquals(200, response.getStatusCodeValue());
        PaymentResponse body = (PaymentResponse) response.getBody();
        assertNotNull(body);
        assertEquals("ORDER123", body.getOrderId());
        assertTrue(body.getCheckoutUrl().contains("vnpayment.vn"));
    }

    // --- TEST: /ipn ---
    @Test
    void testHandleIPNSuccess() throws Exception {
        Map<String, String> ipnParams = Map.of("vnp_ResponseCode", "00");
        Payment mockPayment = new Payment();
        mockPayment.setStatus(PaymentStatus.PAID);

        when(paymentService.handleIPN(ipnParams)).thenReturn(mockPayment);

        ResponseEntity<?> response = paymentController.handleIPN(ipnParams);

        assertEquals(200, response.getStatusCodeValue());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("00", body.get("RspCode"));
        assertEquals("Confirm Success", body.get("Message"));
    }

    // --- TEST: /appointment/{id} ---
    @Test
    void testGetPaymentByAppointmentPaid() throws Exception {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.PAID);
        payment.setAmount(Double.valueOf(150000));
        payment.setPaidAt(LocalDateTime.now());

        when(paymentService.getPaymentByAppointment(1L)).thenReturn(payment);

        ResponseEntity<?> response = paymentController.getPaymentByAppointment(1L);

        assertEquals(200, response.getStatusCodeValue());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(true, body.get("hasPaid"));
        assertEquals("PAID", body.get("status"));
    }

    @Test
    void testGetPaymentByAppointmentNotFound() throws Exception {
        when(paymentService.getPaymentByAppointment(1L)).thenReturn(null);

        ResponseEntity<?> response = paymentController.getPaymentByAppointment(1L);

        assertEquals(200, response.getStatusCodeValue());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(false, body.get("hasPaid"));
    }

    // --- TEST: /confirm ---
    @Test
    void testConfirmPaymentSuccess() throws Exception {
        Map<String, String> params = Map.of("vnp_ResponseCode", "00");
        Payment payment = new Payment();
        payment.setPaymentId(10L);
        payment.setStatus(PaymentStatus.PAID);

        when(paymentService.handleIPN(params)).thenReturn(payment);

        ResponseEntity<?> response = paymentController.confirmPayment(params);

        assertEquals(200, response.getStatusCodeValue());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(true, body.get("success"));
        assertEquals("Thanh toán thành công", body.get("message"));
    }

    // --- TEST: /my ---
    @Test
    void testGetMyPaymentsSuccess() throws Exception {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("user123", null);

        when(paymentService.getPaymentsByPatient("user123")).thenReturn(List.of());

        ResponseEntity<?> response = paymentController.getMyPayments(auth);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof List);
    }
}
