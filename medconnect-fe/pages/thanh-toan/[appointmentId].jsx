import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card, CardBody, CardHeader, Button, Divider, Chip, Spinner, Checkbox
} from "@heroui/react";
import { CreditCard, Calendar, User, Clock, CheckCircle, AlertCircle, ArrowRight, Shield } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import { parseBHYT, BENEFIT_LEVELS } from "@/utils/bhytHelper";
import { getApiUrl } from "@/utils/api";

const SLOT_TIMES = {
  SLOT_1: "07:30 - 09:50",
  SLOT_2: "10:00 - 12:20",
  SLOT_3: "12:50 - 15:10",
  SLOT_4: "15:20 - 17:40"
};

export default function PaymentPage() {
  const router = useRouter();
  const { appointmentId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [consultationFee, setConsultationFee] = useState(0);
  const [patientProfile, setPatientProfile] = useState(null);
  const [useInsurance, setUseInsurance] = useState(false);
  const [insuranceDiscount, setInsuranceDiscount] = useState(0);
  const [insuranceInfo, setInsuranceInfo] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      router.push("/dang-nhap");
      return;
    }
    if (appointmentId) {
      fetchAppointmentAndPayment();
    }
  }, [user, authLoading, appointmentId]);

  // Calculate consultation fee based on appointment type and doctor's speciality
  const calculateConsultationFee = (appointment) => {
    if (!appointment || !appointment.doctor || !appointment.doctor.speciality) {
      console.warn("Missing appointment/doctor/speciality data, using default price");
      return 200000; // Default fallback
    }

    // Get price based on appointment type and doctor's speciality
    const speciality = appointment.doctor.speciality;
    
    if (appointment.type === "ONLINE") {
      return speciality.onlinePrice || 200000;
    } else {
      return speciality.offlinePrice || 300000;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  // Calculate discount based on BHYT benefit level
  const calculateInsuranceDiscount = (fee, benefitLevel) => {
    if (!benefitLevel || !BENEFIT_LEVELS[benefitLevel]) return 0;
    
    const rate = BENEFIT_LEVELS[benefitLevel].rate;
    // Parse rate like "80%" to get percentage
    const percentage = parseFloat(rate.replace('%', ''));
    
    // Discount = fee * (100 - percentage) / 100
    // For example: 80% coverage means 20% discount
    const discountPercent = 100 - percentage;
    return Math.round(fee * discountPercent / 100);
  };

  // Update discount when insurance checkbox changes
  useEffect(() => {
    if (useInsurance && insuranceInfo && consultationFee > 0) {
      const discount = calculateInsuranceDiscount(consultationFee, insuranceInfo.benefitLevel);
      setInsuranceDiscount(discount);
    } else {
      setInsuranceDiscount(0);
    }
  }, [useInsurance, insuranceInfo, consultationFee]);

  const finalAmount = consultationFee - insuranceDiscount;

  const fetchAppointmentAndPayment = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();

      // Fetch patient profile to get BHYT info
      try {
        const profileResponse = await fetch(`${getApiUrl()}/patient/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setPatientProfile(profileData);
          
          // Parse BHYT if available
          if (profileData.insurance_number || profileData.socialInsurance) {
            const bhytCode = profileData.insurance_number || profileData.socialInsurance;
            const parsed = parseBHYT(bhytCode);
            if (parsed) {
              setInsuranceInfo(parsed);
              
              // Check if BHYT is still valid
              const validTo = profileData.insurance_valid_to || profileData.insuranceValidTo;
              if (validTo) {
                const expiryDate = new Date(validTo);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (expiryDate >= today) {
                  // BHYT is valid, can use
                } else {
                  toast.error("Thẻ BHYT đã hết hạn. Không thể sử dụng để giảm giá.");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching patient profile:", error);
      }

      // Fetch appointment details
      const aptResponse = await fetch(`${getApiUrl()}/appointments/${appointmentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (aptResponse.ok) {
        const aptData = await aptResponse.json();
        setAppointment(aptData);
        
        // Calculate consultation fee based on appointment data
        const fee = calculateConsultationFee(aptData);
        setConsultationFee(fee);
      } else {
        toast.error("Không tìm thấy lịch hẹn");
        router.push("/nguoi-dung/lich-hen");
        return;
      }

      // Check payment status
      const paymentResponse = await fetch(`${getApiUrl()}/payment/appointment/${appointmentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log("Payment status response:", paymentData);
        setPaymentStatus(paymentData);
        
        // Check for different possible structures of payment response
        const isPaid = paymentData.hasPaid || 
                      paymentData.status === "PAID" || 
                      (paymentData.success && paymentData.status === "PAID");
        
        if (isPaid) {
          toast.success("Lịch hẹn này đã được thanh toán");
          setTimeout(() => router.push("/nguoi-dung/lich-hen"), 2000);
        }
      } else {
        console.log("Payment status check failed:", paymentResponse.status);
        // Don't show error for payment status check failure as it might be normal for unpaid appointments
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    try {
      const token = await user.getIdToken();
      
      // Call VNPay payment initialization API
      const response = await fetch(`${getApiUrl()}/payment/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: parseInt(appointmentId),
          returnUrl: `${window.location.origin}/thanh-toan/callback?appointmentId=${appointmentId}`,
          useInsurance: useInsurance,
          insuranceDiscount: useInsurance ? insuranceDiscount : 0,
          finalAmount: finalAmount
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Payment init response:", data);
        
        // Check for checkoutUrl in response
        if (data.checkoutUrl) {
          toast.success("Đang chuyển hướng đến VNPay...");
          // Small delay to show toast message
          setTimeout(() => {
            window.location.href = data.checkoutUrl;
          }, 1000);
        } else {
          console.error("No checkoutUrl in response:", data);
          toast.error("Không nhận được link thanh toán từ VNPay");
          setProcessingPayment(false);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Payment init failed:", response.status, errorData);
        toast.error(errorData.message || errorData.error || "Không thể khởi tạo thanh toán");
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Lỗi kết nối server. Vui lòng thử lại.");
      setProcessingPayment(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PatientFrame>
    );
  }

  if (!appointment) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardBody className="text-center p-8">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy lịch hẹn</h2>
              <Button color="primary" onClick={() => router.push("/nguoi-dung/lich-hen")}>
                Quay lại
              </Button>
            </CardBody>
          </Card>
        </div>
      </PatientFrame>
    );
  }

  const leftChildren = (
    <div className="space-y-6">
      {/* Payment Info Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <CreditCard className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thông tin thanh toán</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {/* Fee breakdown */}
          <div className="space-y-3">
            {appointment?.doctor?.speciality && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Chuyên khoa:</span>
                  <span className="font-medium">{appointment.doctor.speciality.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Hình thức:</span>
                  <span className="font-medium">
                    {appointment.type === "ONLINE" ? "Khám trực tuyến" : "Khám tại phòng khám"}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phí khám bệnh:</span>
              <span className="text-lg font-semibold text-gray-900">{formatPrice(consultationFee)}</span>
            </div>
            
            {/* BHYT Checkbox */}
            {insuranceInfo && (
              <>
                <Divider className="my-3" />
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Checkbox
                    isSelected={useInsurance}
                    onValueChange={setUseInsurance}
                    classNames={{
                      label: "text-sm"
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-blue-600" />
                      <span className="font-medium text-blue-900">Sử dụng Bảo hiểm Y tế</span>
                    </div>
                  </Checkbox>
                  {useInsurance && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã BHYT:</span>
                        <span className="font-medium">{insuranceInfo.formatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mức hưởng:</span>
                        <span className="font-medium text-green-600">{insuranceInfo.benefitRate}</span>
                      </div>
                      {insuranceDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá BHYT:</span>
                          <span className="font-semibold">-{formatPrice(insuranceDiscount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <Divider />
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-700 font-semibold text-lg">Tổng thanh toán:</span>
            <span className="text-2xl font-bold text-teal-600">{formatPrice(finalAmount)}</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Phương thức thanh toán</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-white rounded border flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">VNPAY</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Cổng thanh toán VNPay</p>
                  <p className="text-xs text-blue-700">ATM / Visa / MasterCard / QR Code</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Security Card */}
      <Card className="bg-gradient-to-br from-green-50 to-teal-50">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-green-900">Thanh toán an toàn</h4>
              <p className="text-sm text-green-800 mt-1">
                Giao dịch được mã hóa và bảo mật bởi VNPay - Cổng thanh toán hàng đầu Việt Nam
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Appointment Details Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Chi tiết lịch hẹn</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <User size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Bác sĩ</p>
              <p className="font-semibold">{appointment.doctor?.name || "N/A"}</p>
              <p className="text-sm text-gray-500">{appointment.doctor?.specialization || "N/A"}</p>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar size={18} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ngày khám</p>
                <p className="font-medium">{new Date(appointment.date).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={18} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Giờ khám</p>
                <p className="font-medium">{SLOT_TIMES[appointment.slot]}</p>
              </div>
            </div>
          </div>

          <Divider />

          <div>
            <p className="text-sm text-gray-600 mb-1">Hình thức khám</p>
            <Chip color={appointment.type === "ONLINE" ? "success" : "warning"} variant="flat">
              {appointment.type === "ONLINE" ? "Khám online" : "Khám tại phòng khám"}
            </Chip>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
            <Chip color="primary" variant="flat">
              {appointment.status === "PENDING" ? "Chờ thanh toán" : appointment.status}
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* Payment Action Card */}
      <Card className="border-2 border-teal-500">
        <CardBody className="p-6">
          <h3 className="text-xl font-semibold mb-4">Xác nhận thanh toán</h3>
          
          {/* Payment breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            {appointment?.doctor?.speciality && (
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Chuyên khoa {appointment.doctor.speciality.name}:</span>
                  <span className="font-medium">{appointment.type === "ONLINE" ? "Khám trực tuyến" : "Khám tại phòng khám"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Phí dịch vụ:</span>
                  <span className="font-medium">{formatPrice(consultationFee)}</span>
                </div>
              </div>
            )}
            
            {useInsurance && insuranceDiscount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600 mt-2">
                <span>Giảm giá BHYT ({insuranceInfo?.benefitRate}):</span>
                <span className="font-semibold">-{formatPrice(insuranceDiscount)}</span>
              </div>
            )}
            
            <Divider className="my-3" />
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Tổng thanh toán:</span>
              <span className="text-3xl font-bold text-teal-600">{formatPrice(finalAmount)}</span>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
            <p className="text-sm text-yellow-900">
              <strong>Lưu ý:</strong> Sau khi thanh toán thành công, lịch hẹn của bạn sẽ được xác nhận.
            </p>
          </div>

          <Button
            fullWidth
            color="primary"
            size="lg"
            onClick={handlePayment}
            isLoading={processingPayment}
            endContent={<ArrowRight size={20} />}
          >
            Tiến hành thanh toán
          </Button>

          <Button
            fullWidth
            variant="bordered"
            className="mt-3"
            onClick={() => router.push("/nguoi-dung/lich-hen")}
          >
            Quay lại
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <PatientFrame>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />
    </PatientFrame>
  );
}
