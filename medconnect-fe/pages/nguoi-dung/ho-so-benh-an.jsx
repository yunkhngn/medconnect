"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Divider,
  Chip,
  Accordion,
  AccordionItem,
  Avatar,
} from "@heroui/react";
import { PatientFrame, Grid } from "@/components/layouts/";
import {
  FileText,
  Calendar,
  User,
  Phone,
  MapPin,
  Heart,
  Shield,
  AlertCircle,
  Stethoscope,
  Activity,
  Plus,
  Edit,
  Settings,
} from "lucide-react";
import { auth } from "@/lib/firebase";

export default function HoSoBenhAn() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emrData, setEmrData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEMR = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("Vui lòng đăng nhập");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

        if (response.ok) {
          const data = await response.json();
          console.log("EMR data:", data);
          setEmrData(data);
        } else if (response.status === 404) {
          setError("Chưa có hồ sơ bệnh án");
        } else {
          setError("Không thể tải hồ sơ bệnh án");
        }
      } catch (err) {
        console.error("Error fetching EMR:", err);
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchEMR();
  }, []);

  const parseDetail = (detail) => {
    if (!detail) return null;
    try {
      return typeof detail === "string" ? JSON.parse(detail) : detail;
    } catch (err) {
      console.error("Error parsing detail:", err);
      return null;
    }
  };

  if (loading) {
    return (
      <PatientFrame title="Hồ sơ bệnh án">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </PatientFrame>
    );
  }

  if (error || !emrData) {
    return (
      <PatientFrame title="Hồ sơ bệnh án">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardBody className="text-center p-8">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {error || "Chưa có hồ sơ bệnh án"}
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa có hồ sơ bệnh án trong hệ thống. Vui lòng tạo hồ sơ mới.
              </p>
              <Button
                color="primary"
                onPress={() => router.push("/nguoi-dung/ho-so-benh-an/tao-moi")}
                startContent={<Plus size={18} />}
              >
                Tạo hồ sơ bệnh án
              </Button>
            </CardBody>
          </Card>
        </div>
      </PatientFrame>
    );
  }

  const detail = parseDetail(emrData.detail);
  const patientProfile = detail?.patient_profile || {};
  const medicalRecords = detail?.medical_records || [];

  // Left Panel - Quick Info
  const leftPanel = (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6 text-center">
          <Avatar
            name={patientProfile.full_name?.charAt(0)?.toUpperCase()}
            className="w-20 h-20 mx-auto mb-4 text-large"
          />
          <h3 className="text-lg font-semibold">{patientProfile.full_name || "N/A"}</h3>
          <p className="text-sm text-gray-600">{patientProfile.email || "N/A"}</p>
          {patientProfile.insurance_number && (
            <Chip size="sm" color="primary" className="mt-2">
              BHYT: {patientProfile.insurance_number}
            </Chip>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h4 className="font-semibold mb-3">Thông tin nhanh</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={16} />
              <span className="text-gray-600">
                {patientProfile.date_of_birth
                  ? new Date(patientProfile.date_of_birth).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-gray-400" size={16} />
              <span className="text-gray-600">{patientProfile.gender || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="text-red-400" size={16} />
              <span className="text-gray-600">Nhóm máu: {patientProfile.blood_type || "Chưa cập nhật"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-gray-400" size={16} />
              <span className="text-gray-600">
                {medicalRecords.length} lần khám
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4">
          <div className="space-y-2">
            <Button
              fullWidth
              color="primary"
              variant="flat"
              startContent={<Settings size={18} />}
              onPress={() => router.push("/nguoi-dung/cai-dat")}
            >
              Cập nhật thông tin
            </Button>
            <Button
              fullWidth
              color="success"
              variant="flat"
              startContent={<Edit size={18} />}
              onPress={() => router.push("/nguoi-dung/ho-so-benh-an/chinh-sua")}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Right Panel - EMR Details
  const rightPanel = (
    <div className="space-y-6">
      {/* Patient Profile */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User size={24} className="text-teal-600" />
            Thông tin bệnh nhân
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Họ và tên" value={patientProfile.full_name} />
            <InfoItem label="Ngày sinh" value={patientProfile.date_of_birth ? new Date(patientProfile.date_of_birth).toLocaleDateString("vi-VN") : null} />
            <InfoItem label="Giới tính" value={patientProfile.gender} />
            <InfoItem label="Nhóm máu" value={patientProfile.blood_type || detail?.patient_profile?.blood_type} />
            <InfoItem label="Số điện thoại" value={patientProfile.phone} />
            <InfoItem label="Email" value={patientProfile.email} />
          </div>
          <InfoItem label="Địa chỉ" value={patientProfile.address} />
          <InfoItem label="Mã BHYT" value={patientProfile.insurance_number} />
          {patientProfile.insurance_valid_to && (
            <InfoItem 
              label="BHYT hết hạn" 
              value={new Date(patientProfile.insurance_valid_to).toLocaleDateString("vi-VN")} 
            />
          )}
          <InfoItem label="CCCD" value={patientProfile.citizenship} />
        </CardBody>
      </Card>

      {/* Emergency Contact */}
      {(patientProfile.emergency_contact?.name || patientProfile.emergency_contact_name) && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Phone size={24} className="text-orange-600" />
              Liên hệ khẩn cấp
            </h3>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoItem 
                label="Tên" 
                value={patientProfile.emergency_contact?.name || patientProfile.emergency_contact_name} 
              />
              <InfoItem 
                label="Số điện thoại" 
                value={patientProfile.emergency_contact?.phone || patientProfile.emergency_contact_phone} 
              />
              <InfoItem 
                label="Quan hệ" 
                value={patientProfile.emergency_contact?.relation || patientProfile.emergency_contact_relationship} 
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Medical History */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Heart size={24} className="text-red-600" />
            Tiền sử bệnh & Dị ứng
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <InfoItem 
            label="Dị ứng" 
            value={detail?.medical_history?.allergies || patientProfile.allergies || "Không"} 
          />
          <InfoItem 
            label="Tiền sử bệnh" 
            value={detail?.medical_history?.previous_conditions || "Không"} 
          />
          <InfoItem 
            label="Thuốc đang dùng" 
            value={detail?.medical_history?.current_medications || "Không"} 
          />
          <InfoItem 
            label="Tiền sử phẫu thuật" 
            value={detail?.medical_history?.surgeries || "Không"} 
          />
          <InfoItem 
            label="Tiền sử gia đình" 
            value={detail?.medical_history?.family_history || "Không"} 
          />
        </CardBody>
      </Card>

      {/* Medical Records */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Stethoscope size={24} className="text-purple-600" />
            Lịch sử khám bệnh
          </h3>
          <Chip color="primary" variant="flat">
            {medicalRecords.length} lần khám
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody>
          {medicalRecords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có lịch sử khám bệnh</p>
          ) : (
            <Accordion variant="splitted">
              {medicalRecords.map((record, index) => {
                const visitDate = record.visit_date || record.encounter?.started_at;
                const visitTime = record.visit_time;
                const subtitle = visitDate 
                  ? `${new Date(visitDate).toLocaleDateString("vi-VN")}${visitTime ? ` - ${visitTime}` : ""}`
                  : "Không rõ ngày";

                return (
                  <AccordionItem
                    key={index}
                    aria-label={`Lần khám ${index + 1}`}
                    title={`Lần khám ${medicalRecords.length - index}`}
                    subtitle={subtitle}
                    startContent={
                      <Chip size="sm" color={record.visit_type === "online" ? "primary" : "success"}>
                        {record.visit_type === "online" ? "Online" : "Tại phòng khám"}
                      </Chip>
                    }
                  >
                    <div className="space-y-4 pt-2">
                      {record.chief_complaint && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Lý do khám:</p>
                          <p className="text-sm text-gray-600">{record.chief_complaint}</p>
                        </div>
                      )}

                      {record.vital_signs && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Sinh hiệu:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {record.vital_signs.temperature && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Nhiệt độ:</span> {record.vital_signs.temperature}°C
                              </div>
                            )}
                            {record.vital_signs.blood_pressure && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Huyết áp:</span> {record.vital_signs.blood_pressure}
                              </div>
                            )}
                            {record.vital_signs.heart_rate && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Nhịp tim:</span> {record.vital_signs.heart_rate} bpm
                              </div>
                            )}
                            {record.vital_signs.spo2 && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">SpO2:</span> {record.vital_signs.spo2}%
                              </div>
                            )}
                            {record.vital_signs.weight && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Cân nặng:</span> {record.vital_signs.weight} kg
                              </div>
                            )}
                            {record.vital_signs.height && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Chiều cao:</span> {record.vital_signs.height} cm
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {record.diagnosis && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Chẩn đoán:</p>
                          <p className="text-sm text-gray-600">{record.diagnosis}</p>
                        </div>
                      )}

                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Đơn thuốc:</p>
                          <div className="space-y-2">
                            {record.prescriptions.map((rx, idx) => (
                              <div key={idx} className="bg-blue-50 p-3 rounded text-sm">
                                <p className="font-medium">{rx.medication || rx.medicine_name}</p>
                                <p className="text-gray-600">
                                  {rx.dosage} - {rx.frequency} - {rx.duration}
                                </p>
                                {rx.instructions && (
                                  <p className="text-gray-500 text-xs mt-1">{rx.instructions}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.notes && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Ghi chú:</p>
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardBody>
      </Card>
    </div>
  );

  return (
    <PatientFrame title="Hồ sơ bệnh án">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
    </PatientFrame>
  );
}

// Helper Component
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-base text-gray-900">{value || "Chưa cập nhật"}</p>
    </div>
  );
}
