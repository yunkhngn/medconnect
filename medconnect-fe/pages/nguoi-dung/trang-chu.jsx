import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { 
  Calendar, FileText, Heart, Activity, Clock, TrendingUp, 
  User, Phone, Mail, AlertCircle, CheckCircle, XCircle,
  Plus, ArrowRight, Stethoscope, ClipboardList, Settings, MapPin
} from "lucide-react";
import { Card, CardBody, CardHeader, Button, Chip, Avatar, Divider } from "@heroui/react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import Grid from "@/components/layouts/Grid";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import UserAvatar from "@/components/ui/UserAvatar";
import { parseReason, formatReasonForDisplay } from "@/utils/appointmentUtils";


export default function PatientDashboard() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [emr, setEMR] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [paymentByAptId, setPaymentByAptId] = useState({}); // { [id]: { hasPaid, status } }
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    hasEMR: false
  });

  useEffect(() => {
    console.log('[PatientDashboard] Auth state:', { authLoading, hasUser: !!user });
    
    if (authLoading) {
      return; // Wait for auth to complete
    }
    
    if (!user) {
      console.log('[PatientDashboard] No user, setting loading false');
      setLoading(false);
      return;
    }

    fetchDashboardData(user);
  }, [user, authLoading]);

  const fetchDashboardData = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();

      // Fetch patient profile
      const profileRes = await fetch(`${getApiUrl()}/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Fetch EMR
      try {
        const emrRes = await fetch(`${getApiUrl()}/medical-records/my-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (emrRes.ok) {
          const emrData = await emrRes.json();
          setEMR(emrData);
          setStats(prev => ({ ...prev, hasEMR: true }));
        }
      } catch (error) {
        // EMR not found is OK
        console.log("No EMR found");
      }

      // Fetch appointments
      try {
        const aptRes = await fetch(`${getApiUrl()}/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (aptRes.ok) {
          const aptData = await aptRes.json();
          setAppointments(aptData);
          
          // Fetch payment status for each appointment
          if (aptData.length > 0) {
            const paymentPromises = aptData.map(async (apt) => {
              const id = apt.id || apt.appointmentId;
              if (!id) return null;
              try {
                const resp = await fetch(`${getApiUrl()}/payment/appointment/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (resp.ok) {
                  const payData = await resp.json();
                  return { id, payment: payData };
                }
              } catch (e) {
                console.error(`Failed to fetch payment for appointment ${id}:`, e);
              }
              return null;
            });
            
            const paymentResults = await Promise.all(paymentPromises);
            const paymentMap = {};
            paymentResults.forEach(result => {
              if (result && result.payment) {
                paymentMap[result.id] = {
                  hasPaid: result.payment.hasPaid || false,
                  status: result.payment.status
                };
              }
            });
            setPaymentByAptId(paymentMap);
          }
          
          // Calculate stats
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          const normalizeDate = (date) => {
            const d = new Date(date);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
          };
          
          const upcoming = aptData.filter(apt => {
            const aptDate = normalizeDate(apt.date || apt.appointmentDate);
            return aptDate >= today && (apt.status === "PENDING" || apt.status === "CONFIRMED");
          });
          
          const completed = aptData.filter(apt => {
            return apt.status === "COMPLETED" || apt.status === "FINISHED";
          });
          
          setStats(prev => ({
            ...prev,
            totalAppointments: aptData.length,
            upcomingAppointments: upcoming.length,
            completedAppointments: completed.length
          }));
        } else {
          console.error("Failed to fetch appointments:", aptRes.status);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
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

  const leftChildren = (
    <div className="space-y-6">
      {/* Avatar Card */}
      <Card>
        <CardBody className="flex flex-col items-center p-6">
          <UserAvatar size={100} asButton />
          <h3 className="text-xl font-semibold mt-4">{profile?.name || "Bệnh nhân"}</h3>
          <p className="text-sm text-gray-500">{profile?.email}</p>
        </CardBody>
      </Card>

      {/* Profile Info Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <User className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          {profile?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-gray-400" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile?.dateOfBirth && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span>{new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
          {profile?.address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
              <span className="line-clamp-2">{typeof profile.address === 'object' ? (profile.address?.full || [profile.address?.address_detail, profile.address?.ward_name, profile.address?.district_name, profile.address?.province_name].filter(Boolean).join(', ')) : profile.address}</span>
            </div>
          )}
          <Divider className="my-2" />
          <Button
            fullWidth
            variant="flat"
            color="primary"
            startContent={<Settings size={18} />}
            onClick={() => router.push("/nguoi-dung/cai-dat")}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </CardBody>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <Activity className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thao tác nhanh</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-2">
          <Button
            fullWidth
            variant="flat"
            color="primary"
            startContent={<Stethoscope size={18} />}
            onClick={() => router.push("/tim-bac-si")}
          >
            Tìm bác sĩ
          </Button>
          <Button
            fullWidth
            variant="flat"
            color="success"
            startContent={<FileText size={18} />}
            onClick={() => router.push("/nguoi-dung/ho-so-benh-an")}
          >
            Hồ sơ bệnh án
          </Button>
          <Button
            fullWidth
            variant="flat"
            color="secondary"
            startContent={<ClipboardList size={18} />}
            onClick={() => router.push("/nguoi-dung/lich-hen")}
          >
            Xem lịch hẹn
          </Button>
        </CardBody>
      </Card>
        </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <CardBody className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {profile?.name || "Bệnh nhân"}!
              </h1>
              <p className="text-teal-100 text-lg">
                Chúc bạn một ngày tràn đầy sức khỏe và năng lượng
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                color="default"
                variant="flat"
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                startContent={<Calendar size={18} />}
                onClick={() => router.push("/nguoi-dung/lich-hen")}
              >
                Lịch hẹn
              </Button>
              <Button
                color="default"
                variant="flat"
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                startContent={<Plus size={18} />}
                onClick={() => router.push("/tim-bac-si")}
              >
                Đặt khám
              </Button>
                  </div>
                </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <Card>
        <CardHeader className="flex gap-3">
          <TrendingUp className="text-teal-600" size={24} />
          <h3 className="text-lg font-semibold">Thống kê tổng quan</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="text-blue-500" size={28} />
                <Chip size="sm" variant="flat" color="primary">
                  Sắp tới
                </Chip>
              </div>
              <p className="text-sm text-gray-600 mb-1">Lịch hẹn</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.upcomingAppointments}
              </p>
        </div>

            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-green-500" size={28} />
                <Chip size="sm" variant="flat" color="success">
                  Hoàn thành
                </Chip>
              </div>
              <p className="text-sm text-gray-600 mb-1">Đã khám</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.completedAppointments}
              </p>
            </div>

            <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-l-teal-500">
              <div className="flex items-center justify-between mb-2">
                <FileText className="text-teal-500" size={28} />
                {stats.hasEMR ? (
                  <Chip size="sm" variant="flat" color="success">
                    Có sẵn
                  </Chip>
                ) : (
                  <Chip size="sm" variant="flat" color="warning">
                    Chưa có
                  </Chip>
                )}
                      </div>
              <p className="text-sm text-gray-600 mb-1">Hồ sơ bệnh án</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.hasEMR ? "1" : "0"}
                        </p>
                      </div>

            <div className="p-4 bg-rose-50 rounded-lg border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between mb-2">
                <Heart className="text-rose-500" size={28} />
                <Chip size="sm" variant="flat" color="danger">
                  Live
                </Chip>
              </div>
              <p className="text-sm text-gray-600 mb-1">Sức khỏe</p>
              <p className="text-3xl font-bold text-gray-900">Tốt</p>
                    </div>
                  </div>
        </CardBody>
      </Card>

      {/* EMR Warning */}
      {!stats.hasEMR && (
        <Card className="border-2 border-warning">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-warning flex-shrink-0" size={32} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-warning">
                  Bạn chưa có hồ sơ bệnh án
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hồ sơ bệnh án giúp bác sĩ hiểu rõ hơn về tình trạng sức khỏe của bạn và đưa ra chẩn đoán chính xác hơn.
                </p>
                <Button
                  color="warning"
                  variant="flat"
                  startContent={<Plus size={18} />}
                  onClick={() => router.push("/nguoi-dung/ho-so-benh-an/tao-moi")}
                >
                  Tạo hồ sơ bệnh án ngay
                </Button>
              </div>
              </div>
          </CardBody>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold">Lịch hẹn sắp tới</h3>
          </div>
          <Button
            size="sm"
            variant="light"
            color="primary"
            endContent={<ArrowRight size={16} />}
            onClick={() => router.push("/nguoi-dung/lich-hen")}
          >
            Xem tất cả
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          {(() => {
            const upcomingApts = appointments.filter(apt => {
              const aptDate = new Date(apt.date || apt.appointmentDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return aptDate >= today && (apt.status === "PENDING" || apt.status === "CONFIRMED");
            });
            return upcomingApts.length === 0;
          })() ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 mb-4">Bạn chưa có lịch hẹn nào</p>
              <Button
                color="primary"
                variant="flat"
                startContent={<Plus size={18} />}
                onClick={() => router.push("/tim-bac-si")}
              >
                Đặt lịch khám
              </Button>
            </div>
            ) : (
              <div className="space-y-4">
              {appointments
                .filter(apt => {
                  const aptDate = new Date(apt.date || apt.appointmentDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  // Exclude cancelled and denied appointments
                  return aptDate >= today && 
                         (apt.status === "PENDING" || apt.status === "CONFIRMED") &&
                         apt.status !== "CANCELLED" && 
                         apt.status !== "DENIED";
                })
                .sort((a, b) => {
                  const dateA = new Date(a.date || a.appointmentDate);
                  const dateB = new Date(b.date || b.appointmentDate);
                  return dateA - dateB;
                })
                .slice(0, 5)
                .map((apt) => {
                  const aptDate = new Date(apt.date || apt.appointmentDate);
                  const slotTimes = {
                    SLOT_1: "07:30 - 08:00",
                    SLOT_2: "08:15 - 08:45",
                    SLOT_3: "09:00 - 09:30",
                    SLOT_4: "09:45 - 10:15",
                    SLOT_5: "10:30 - 11:00",
                    SLOT_6: "11:15 - 11:45",
                    SLOT_7: "13:00 - 13:30",
                    SLOT_8: "13:45 - 14:15",
                    SLOT_9: "14:30 - 15:00",
                    SLOT_10: "15:15 - 15:45",
                    SLOT_11: "16:00 - 16:30",
                    SLOT_12: "16:45 - 17:15"
                  };
                  
                  const getStatusColor = (status) => {
                    switch (status) {
                      case "CONFIRMED": return "success";
                      case "PENDING": return "warning";
                      case "COMPLETED": case "FINISHED": return "primary";
                      case "CANCELLED": return "danger";
                      default: return "default";
                    }
                  };
                  
                  const getStatusText = (status, appointmentId) => {
                    // For PENDING appointments, check payment status
                    if (status === "PENDING") {
                      const aptId = appointmentId;
                      const payInfo = aptId ? paymentByAptId[aptId] : null;
                      const hasPaid = payInfo?.hasPaid || false;
                      return hasPaid ? "Chờ xác nhận" : "Chờ thanh toán";
                    }
                    
                    switch (status) {
                      case "CONFIRMED": return "Đã xác nhận";
                      case "COMPLETED": case "FINISHED": return "Hoàn thành";
                      case "CANCELLED": return "Đã hủy";
                      default: return status;
                    }
                  };
                  
                  return (
                    <Card key={apt.id || apt.appointmentId} shadow="none" className="hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3 flex-1">
                        <Avatar
                              src={apt.doctor?.avatar || apt.doctorAvatar || null}
                              name={apt.doctor?.name || apt.doctorName || "BS"}
                          size="lg"
                              showFallback
                        />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900">
                                {(apt.doctor?.name || apt.doctorName || "Bác sĩ").replace(/^BS\.\s*/i, '')}
                              </p>
                              <p className="text-sm text-gray-600">{apt.specialty || apt.doctor?.specialization || "Chuyên khoa"}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {aptDate.toLocaleDateString('vi-VN')} • {slotTimes[apt.slot] || apt.time || "N/A"}
                                </span>
                              </div>
                              {apt.reason && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {formatReasonForDisplay(apt.reason)}
                                </p>
                              )}
                        </div>
                    </div>
                          <div className="text-right flex-shrink-0">
                            <Chip size="sm" color={getStatusColor(apt.status)} variant="flat" className="mb-2">
                              {getStatusText(apt.status, apt.id || apt.appointmentId)}
                            </Chip>
                            {apt.type === "ONLINE" && (
                              <Chip size="sm" color="secondary" variant="flat" className="text-xs">
                                Online
                        </Chip>
                            )}
                  </div>
                    </div>
                  </CardBody>
                </Card>
                  );
                })}
              </div>
            )}
        </CardBody>
      </Card>

      {/* Health Tips */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold">Lời khuyên sức khỏe</h3>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-sm">Uống đủ 2 lít nước mỗi ngày</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-sm">Tập thể dục ít nhất 30 phút mỗi ngày</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-sm">Ngủ đủ 7-8 tiếng mỗi đêm</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-sm">Ăn nhiều rau xanh và trái cây</span>
            </li>
          </ul>
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