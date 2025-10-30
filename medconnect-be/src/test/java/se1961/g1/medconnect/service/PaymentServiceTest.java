package se1961.g1.medconnect.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import se1961.g1.medconnect.dto.PaymentRequest;
import se1961.g1.medconnect.pojo.*;
import se1961.g1.medconnect.repository.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @InjectMocks
    private PaymentService paymentService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    private Appointment appointment;
    private Patient patient;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // mock VNPay config values (normally loaded from application.properties)
        paymentService.setVnpTmnCode("W9VOZMDN");
        paymentService.setVnpHashSecret("5Y1HPSXD6LV9XV58PD4C02YYFK");
        paymentService.setVnpPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        paymentService.setVnpReturnUrl("https://example.com/return");

        patient = new Patient();
        patient.setFirebaseUid("abc123");

        appointment = new Appointment();
        appointment.setAppointmentId(1L);
        appointment.setPatient(patient);
        appointment.setDoctor(new Doctor());
        appointment.getDoctor().setName("Dr. Nguyen");
    }

    @Test
    void testInitiatePayment_Success() throws Exception {
        // Arrange
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(paymentRepository.findByAppointment(appointment)).thenReturn(Optional.empty());

        // Mock behavior for save(): simulate auto-generated ID
        when(paymentRepository.save(any())).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            if (p.getPaymentId() == null) {
                p.setPaymentId(999L);
            }
            return p;
        });

        PaymentRequest request = new PaymentRequest();
        request.setAppointmentId(1L);

        // Act
        var response = paymentService.initiatePayment("abc123", request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getCheckoutUrl()).contains("vnp_TmnCode=W9VOZMDN");
        assertThat(response.getOrderId()).isEqualTo("999");
        assertThat(response.getInvoiceNumber()).contains("999-");
    }

    @Test
    void testHandleIPN_Success() throws Exception {
        // Arrange
        Payment payment = new Payment();
        payment.setPaymentId(10L);
        payment.setAppointment(appointment);

        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
        when(appointmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> ipnData = new HashMap<>();
        ipnData.put("vnp_TxnRef", "10-1730189283123");
        ipnData.put("vnp_ResponseCode", "00");

        // Act
        Payment updated = paymentService.handleIPN(ipnData);

        // Assert
        assertThat(updated.getStatus().name()).isEqualTo("PAID");
        assertThat(updated.getAppointment().getStatus().name()).isEqualTo("CONFIRMED");
    }
}
