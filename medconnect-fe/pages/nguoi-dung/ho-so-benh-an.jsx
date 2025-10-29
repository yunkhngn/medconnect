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
  Download,
  Printer,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function HoSoBenhAn() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emrData, setEmrData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[HoSoBenhAn] Auth state:', { authLoading, hasUser: !!user });
    
    if (authLoading) {
      return; // Wait for auth to complete
    }
    
    if (!user) {
      console.log('[HoSoBenhAn] No user, redirecting...');
      setError("Vui lòng đăng nhập");
      setLoading(false);
      return;
    }

    const fetchEMR = async () => {
      console.log('[HoSoBenhAn] Fetching EMR...');
      setLoading(true);
      setError(null);
      
      try {
        const token = await user.getIdToken();
        const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[HoSoBenhAn] EMR data loaded:', data);
          setEmrData(data);
          setError(null);
        } else if (response.status === 404) {
          console.log('[HoSoBenhAn] No EMR found (404)');
          setError("Chưa có hồ sơ bệnh án");
        } else {
          console.log('[HoSoBenhAn] Failed to load EMR:', response.status);
          setError("Không thể tải hồ sơ bệnh án");
        }
      } catch (err) {
        console.error('[HoSoBenhAn] Error fetching EMR:', err);
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchEMR();
  }, [user, authLoading]);

  const parseDetail = (detail) => {
    if (!detail) return null;
    try {
      return typeof detail === "string" ? JSON.parse(detail) : detail;
    } catch (err) {
      console.error("Error parsing detail:", err);
      return null;
    }
  };

  const formatDiagnosis = (diagnosis) => {
    if (!diagnosis) return 'N/A';
    if (typeof diagnosis === 'string') return diagnosis;
    
    const parts = [];
    if (diagnosis.primary) parts.push(`Chính: ${diagnosis.primary}`);
    if (diagnosis.secondary) parts.push(`Phụ: ${diagnosis.secondary}`);
    if (diagnosis.icd_codes) parts.push(`Mã ICD: ${diagnosis.icd_codes}`);
    return parts.join(' | ') || 'N/A';
  };

  const generatePDFContent = () => {
    const detail = parseDetail(emrData.detail);
    const patientProfile = detail?.patient_profile || {};
    const medicalHistory = detail?.medical_history || {};
    const medicalRecords = detail?.medical_records || [];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hồ sơ bệnh án - ${patientProfile.full_name}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { margin: 0; }
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0d9488;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0d9488;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              background: #0d9488;
              color: white;
              padding: 10px 15px;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: bold;
              width: 200px;
              color: #666;
            }
            .info-value {
              flex: 1;
              color: #333;
            }
            .record-item {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 5px;
              background: #f9f9f9;
            }
            .record-header {
              font-weight: bold;
              color: #0d9488;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HỒ SƠ BỆNH ÁN</h1>
            <p>MedConnect - Hệ thống quản lý y tế</p>
            <p>Xuất ngày: ${new Date().toLocaleDateString('vi-VN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div class="section">
            <div class="section-title">THÔNG TIN BỆNH NHÂN</div>
            <div class="info-row">
              <div class="info-label">Họ và tên:</div>
              <div class="info-value">${patientProfile.full_name || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Ngày sinh:</div>
              <div class="info-value">${patientProfile.date_of_birth ? new Date(patientProfile.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Giới tính:</div>
              <div class="info-value">${patientProfile.gender || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Nhóm máu:</div>
              <div class="info-value">${patientProfile.blood_type || 'Chưa cập nhật'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Số điện thoại:</div>
              <div class="info-value">${patientProfile.phone || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${patientProfile.email || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Địa chỉ:</div>
              <div class="info-value">${patientProfile.address || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Số BHYT:</div>
              <div class="info-value">${patientProfile.insurance_number || 'Chưa cập nhật'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">LIÊN HỆ KHẨN CẤP</div>
            <div class="info-row">
              <div class="info-label">Người liên hệ:</div>
              <div class="info-value">${patientProfile.emergency_contact?.name || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Số điện thoại:</div>
              <div class="info-value">${patientProfile.emergency_contact?.phone || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Quan hệ:</div>
              <div class="info-value">${patientProfile.emergency_contact?.relation || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">TIỀN SỬ BỆNH & DỊ ỨNG</div>
            <div class="info-row">
              <div class="info-label">Dị ứng:</div>
              <div class="info-value">${medicalHistory.allergies || 'Không'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Bệnh tiền sử:</div>
              <div class="info-value">${medicalHistory.previous_conditions || 'Không'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Thuốc đang dùng:</div>
              <div class="info-value">${medicalHistory.current_medications || 'Không'}</div>
            </div>
          </div>

          ${medicalRecords && medicalRecords.length > 0 ? `
            <div class="section">
              <div class="section-title">LỊCH SỬ KHÁM BỆNH (${medicalRecords.length} lần khám)</div>
              ${medicalRecords.map((record, index) => {
                const visitDate = record.visit_date || record.encounter?.started_at;
                const visitDateStr = visitDate ? new Date(visitDate).toLocaleDateString('vi-VN') : 'N/A';
                const visitTimeStr = record.visit_time ? ` ${record.visit_time}` : '';
                
                return `
                <div class="record-item">
                  <div class="record-header">Lần khám ${medicalRecords.length - index} - ${record.visit_type === 'online' ? 'Online' : 'Tại phòng khám'}</div>
                  <div class="info-row">
                    <div class="info-label">Ngày khám:</div>
                    <div class="info-value">${visitDateStr}${visitTimeStr}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Bác sĩ:</div>
                    <div class="info-value">${record.doctor_name || 'N/A'}</div>
                  </div>
                  ${record.chief_complaint ? `
                    <div class="info-row">
                      <div class="info-label">Lý do khám:</div>
                      <div class="info-value">${record.chief_complaint}</div>
                    </div>
                  ` : ''}
                  ${record.vital_signs ? `
                    <div class="info-row">
                      <div class="info-label">Sinh hiệu:</div>
                      <div class="info-value">
                        ${record.vital_signs.temperature ? `Nhiệt độ: ${record.vital_signs.temperature}°C` : ''}
                        ${record.vital_signs.blood_pressure ? ` | Huyết áp: ${record.vital_signs.blood_pressure}` : ''}
                        ${record.vital_signs.heart_rate ? ` | Nhịp tim: ${record.vital_signs.heart_rate} bpm` : ''}
                        ${record.vital_signs.spo2 ? ` | SpO2: ${record.vital_signs.spo2}%` : ''}
                        ${record.vital_signs.weight ? ` | Cân nặng: ${record.vital_signs.weight} kg` : ''}
                        ${record.vital_signs.height ? ` | Chiều cao: ${record.vital_signs.height} cm` : ''}
                      </div>
                    </div>
                  ` : ''}
                  <div class="info-row">
                    <div class="info-label">Chẩn đoán:</div>
                    <div class="info-value">${formatDiagnosis(record.diagnosis)}</div>
                  </div>
                  ${record.prescriptions && record.prescriptions.length > 0 ? `
                    <div class="info-row">
                      <div class="info-label">Đơn thuốc:</div>
                      <div class="info-value">${record.prescriptions.map(rx => {
                        const medicineName = rx.medication || rx.medicine_name || rx.name || 'Thuốc không xác định';
                        return `${medicineName}: ${rx.dosage || 'N/A'} - ${rx.frequency || 'N/A'} - ${rx.duration || 'N/A'}`;
                      }).join('; ')}</div>
                    </div>
                  ` : ''}
                  ${record.notes ? `
                    <div class="info-row">
                      <div class="info-label">Ghi chú:</div>
                      <div class="info-value">${record.notes}</div>
                    </div>
                  ` : ''}
                </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          <div class="footer">
            <p>Hồ sơ bệnh án này được tạo tự động từ hệ thống MedConnect</p>
            <p>Tài liệu này chỉ mang tính chất tham khảo</p>
          </div>
        </body>
      </html>
    `;
  };

  const downloadPDF = () => {
    if (!emrData) return;
    
    const detail = parseDetail(emrData.detail);
    const patientProfile = detail?.patient_profile || {};
    const fileName = `ho-so-benh-an-${patientProfile.full_name?.replace(/\s+/g, '-') || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    const htmlContent = generatePDFContent();
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.document.title = fileName;
    printWindow.focus();
    
    // Wait for content to load then trigger print dialog (user can save as PDF)
    setTimeout(() => {
      printWindow.print();
      // Note: Browser will show print dialog, user can choose "Save as PDF"
    }, 250);
  };

  if (authLoading || loading) {
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
          {/* ID Photo 3:4 */}
          {patientProfile.id_photo_url ? (
            <div className="w-32 h-[170px] mx-auto mb-4 rounded-lg overflow-hidden border-2 border-teal-500">
              <img 
                src={patientProfile.id_photo_url} 
                alt="ID Photo" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Avatar
              name={patientProfile.full_name?.charAt(0)?.toUpperCase()}
              className="w-20 h-20 mx-auto mb-4 text-large"
            />
          )}
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
              color="success"
              variant="flat"
              startContent={<Edit size={18} />}
              onPress={() => router.push("/nguoi-dung/ho-so-benh-an/chinh-sua")}
            >
              Chỉnh sửa hồ sơ
            </Button>
              <Button
              fullWidth
                color="secondary"
                variant="flat"
                startContent={<Download size={18} />}
                onPress={downloadPDF}
              >
                Xuất hồ sơ bệnh án
              </Button>
              <Button
              fullWidth
              color="primary"
              variant="flat"
              startContent={<Settings size={18} />}
              onPress={() => router.push("/nguoi-dung/cai-dat")}
            >
              Cài đặt tài khoản
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
          <InfoItem 
            label="Địa chỉ" 
            value={typeof patientProfile.address === 'object' ? (patientProfile.address.full || '') : patientProfile.address} 
          />
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
                          {typeof record.diagnosis === 'string' ? (
                            <p className="text-sm text-gray-600">{record.diagnosis}</p>
                          ) : (
                            <div className="space-y-1 text-sm">
                              {record.diagnosis.primary && (
                                <div className="bg-red-50 p-2 rounded">
                                  <span className="font-medium text-red-700">Chính:</span>{' '}
                                  <span className="text-gray-700">{record.diagnosis.primary}</span>
                                </div>
                              )}
                              {record.diagnosis.secondary && (
                                <div className="bg-orange-50 p-2 rounded">
                                  <span className="font-medium text-orange-700">Phụ:</span>{' '}
                                  <span className="text-gray-700">{record.diagnosis.secondary}</span>
                                </div>
                              )}
                              {record.diagnosis.icd_codes && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <span className="font-medium text-blue-700">Mã ICD:</span>{' '}
                                  <span className="text-gray-700">{record.diagnosis.icd_codes}</span>
                      </div>
                              )}
                      </div>
                          )}
                    </div>
                      )}

                      {record.prescriptions && record.prescriptions.length > 0 && (
                    <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Đơn thuốc:</p>
                          <div className="space-y-2">
                            {record.prescriptions.map((rx, idx) => {
                              console.log('[Prescription Debug]', rx); // Debug prescription structure
                              const medicineName = rx.medication || rx.medicine_name || rx.name || 'Thuốc không xác định';
                              return (
                                <div key={idx} className="bg-blue-50 p-3 rounded text-sm">
                                  <p className="font-medium">{medicineName}</p>
                                  <p className="text-gray-600">
                                    {rx.dosage || 'N/A'} - {rx.frequency || 'N/A'} - {rx.duration || 'N/A'}
                                  </p>
                                  {rx.instructions && (
                                    <p className="text-gray-500 text-xs mt-1">{rx.instructions}</p>
                                  )}
                      </div>
                              );
                            })}
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
