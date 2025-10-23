import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, CardHeader, Button, Chip, Divider, Accordion, AccordionItem } from "@heroui/react";
import { FileText, Calendar, User, Heart, Pill, Shield, Phone, AlertCircle, Plus, Eye } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

export default function MedicalRecordPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emrData, setEmrData] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchEMR(firebaseUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchEMR = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Raw EMR data:', data);
        setEmrData(data);
        
        // Parse JSON detail if needed
        if (data.detail) {
          try {
            console.log('Detail string:', data.detail);
            console.log('Detail type:', typeof data.detail);
            
            const parsed = typeof data.detail === 'string' ? JSON.parse(data.detail) : data.detail;
            console.log('Parsed EMR:', parsed);
            
            setPatientProfile(parsed.patient_profile || null);
            setMedicalRecords(parsed.medical_records || []);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Invalid JSON string:', data.detail);
            toast.error('Dữ liệu hồ sơ bệnh án không hợp lệ');
            setEmrData(null);
          }
        }
      } else if (response.status === 404) {
        // No EMR yet
        setEmrData(null);
      } else {
        throw new Error('Failed to fetch EMR');
      }
    } catch (error) {
      console.error('Error fetching EMR:', error);
      toast.error('Không thể tải hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    router.push('/nguoi-dung/ho-so-benh-an/tao-moi');
  };

  if (loading) {
    return (
      <PatientFrame>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PatientFrame>
    );
  }

  if (!user) {
    return (
      <PatientFrame>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="text-warning" size={48} />
          <p className="mt-4 text-lg">Vui lòng đăng nhập để xem hồ sơ bệnh án</p>
        </div>
      </PatientFrame>
    );
  }

  return (
    <PatientFrame>
      <ToastNotification toast={toast} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="text-primary" size={32} />
                Hồ sơ bệnh án
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý thông tin sức khỏe và lịch sử khám bệnh của bạn
              </p>
            </div>
            {!patientProfile && (
              <Button
                color="primary"
                startContent={<Plus size={20} />}
                onClick={handleCreateProfile}
              >
                Tạo hồ sơ
              </Button>
            )}
          </div>
        </div>

        {/* No Profile State */}
        {!patientProfile ? (
          <Card className="p-8">
            <div className="text-center">
              <FileText className="mx-auto text-gray-300" size={80} />
              <h2 className="text-2xl font-semibold text-gray-800 mt-4">
                Chưa có hồ sơ bệnh án
              </h2>
              <p className="text-gray-600 mt-2 mb-6">
                Tạo hồ sơ bệnh án để lưu trữ thông tin sức khỏe và lịch sử khám bệnh của bạn
              </p>
              <Button
                color="primary"
                size="lg"
                startContent={<Plus size={20} />}
                onClick={handleCreateProfile}
              >
                Tạo hồ sơ bệnh án
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Patient Profile Section */}
            <Card className="mb-6">
              <CardHeader className="flex justify-between items-center pb-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <User className="text-primary" size={24} />
                  Thông tin cá nhân
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    color="default"
                    onClick={() => router.push('/nguoi-dung/cai-dat')}
                  >
                    Cài đặt hồ sơ
                  </Button>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<Eye size={16} />}
              onClick={() => router.push('/nguoi-dung/ho-so-benh-an/chinh-sua')}
            >
              Chỉnh sửa hồ sơ
            </Button>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Thông tin cơ bản</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Họ tên:</span> <span className="font-medium">{patientProfile.full_name}</span></p>
                      <p><span className="text-gray-600">Ngày sinh:</span> <span className="font-medium">{patientProfile.dob}</span></p>
                      <p><span className="text-gray-600">Giới tính:</span> <span className="font-medium">{patientProfile.gender}</span></p>
                      <p><span className="text-gray-600">SĐT:</span> <span className="font-medium">{patientProfile.contact?.phone}</span></p>
                      <p><span className="text-gray-600">Email:</span> <span className="font-medium">{patientProfile.contact?.email}</span></p>
                      <p><span className="text-gray-600">Địa chỉ:</span> <span className="font-medium">{patientProfile.address}</span></p>
                    </div>
                  </div>

                  {/* Insurance */}
                  {patientProfile.insurance && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Shield className="text-blue-500" size={18} />
                        Bảo hiểm Y tế
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Loại:</span> <span className="font-medium">{patientProfile.insurance.type}</span></p>
                        <p><span className="text-gray-600">Mã số:</span> <span className="font-medium font-mono">{patientProfile.insurance.number}</span></p>
                        <p><span className="text-gray-600">Hiệu lực đến:</span> <span className="font-medium">{patientProfile.insurance.valid_to}</span></p>
                      </div>
                    </div>
                  )}

                  {/* Medical History */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Heart className="text-red-500" size={18} />
                      Tiền sử bệnh
                    </h3>
                    <div className="space-y-2 text-sm">
                      {patientProfile.allergies && patientProfile.allergies.length > 0 && (
                        <div>
                          <span className="text-gray-600">Dị ứng:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patientProfile.allergies.map((allergy, idx) => (
                              <Chip key={idx} size="sm" color="danger" variant="flat">{allergy}</Chip>
                            ))}
                          </div>
                        </div>
                      )}
                      {patientProfile.chronic_conditions && patientProfile.chronic_conditions.length > 0 && (
                        <div>
                          <span className="text-gray-600">Bệnh mãn tính:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patientProfile.chronic_conditions.map((condition, idx) => (
                              <Chip key={idx} size="sm" color="warning" variant="flat">{condition}</Chip>
                            ))}
                          </div>
                        </div>
                      )}
                      {patientProfile.medications && patientProfile.medications.length > 0 && (
                        <div>
                          <span className="text-gray-600 flex items-center gap-1">
                            <Pill size={14} /> Thuốc đang dùng:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patientProfile.medications.map((med, idx) => (
                              <Chip key={idx} size="sm" color="primary" variant="flat">{med}</Chip>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {patientProfile.emergency_contact && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Phone className="text-orange-500" size={18} />
                        Liên hệ khẩn cấp
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Họ tên:</span> <span className="font-medium">{patientProfile.emergency_contact.name}</span></p>
                        <p><span className="text-gray-600">SĐT:</span> <span className="font-medium">{patientProfile.emergency_contact.phone}</span></p>
                        <p><span className="text-gray-600">Quan hệ:</span> <span className="font-medium">{patientProfile.emergency_contact.relation}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Medical Records Section */}
            <Card>
              <CardHeader className="pb-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="text-primary" size={24} />
                  Lịch sử khám bệnh
                  {medicalRecords.length > 0 && (
                    <Chip size="sm" variant="flat">{medicalRecords.length} lần khám</Chip>
                  )}
                </h2>
              </CardHeader>
              <Divider />
              <CardBody>
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto text-gray-300" size={48} />
                    <p className="mt-4">Chưa có lịch sử khám bệnh</p>
                  </div>
                ) : (
                  <Accordion variant="splitted">
                    {medicalRecords.map((record, idx) => (
                      <AccordionItem
                        key={idx}
                        title={
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="font-semibold">{record.chief_complaint || record.reason_for_visit || "Khám bệnh"}</p>
                              <p className="text-sm text-gray-600">
                                {record.provider?.full_name && `BS. ${record.provider.full_name}`}
                                {record.provider?.specialization && ` • ${record.provider.specialization}`}
                                {record.visit_type && ` • ${record.visit_type === 'online' ? 'Online' : 'Trực tiếp'}`}
                              </p>
                            </div>
                            <Chip
                              size="sm"
                              color={record.encounter?.status === 'completed' ? 'success' : 'warning'}
                              variant="flat"
                            >
                              {record.encounter?.status || 'completed'}
                            </Chip>
                          </div>
                        }
                        subtitle={(() => {
                          try {
                            // Try new format first (visit_date + visit_time)
                            if (record.visit_date) {
                              const dateStr = record.visit_time 
                                ? `${record.visit_date}T${record.visit_time}`
                                : record.visit_date;
                              return new Date(dateStr).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: record.visit_time ? '2-digit' : undefined,
                                minute: record.visit_time ? '2-digit' : undefined
                              });
                            }
                            // Fallback to old format
                            if (record.encounter?.started_at) {
                              return new Date(record.encounter.started_at).toLocaleString('vi-VN');
                            }
                            return "Chưa có thông tin";
                          } catch (e) {
                            return "Chưa có thông tin";
                          }
                        })()}
                      >
                        <div className="space-y-4 pl-4">
                          {/* Vital Signs */}
                          {record.vital_signs && Object.values(record.vital_signs).some(v => v) && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Sinh hiệu tự đo:</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                {record.vital_signs.temperature && <p>🌡️ Nhiệt độ: {record.vital_signs.temperature}°C</p>}
                                {record.vital_signs.blood_pressure && <p>💉 Huyết áp: {record.vital_signs.blood_pressure}</p>}
                                {record.vital_signs.heart_rate && <p>❤️ Nhịp tim: {record.vital_signs.heart_rate} bpm</p>}
                                {record.vital_signs.oxygen_saturation && <p>🫁 SpO2: {record.vital_signs.oxygen_saturation}%</p>}
                                {record.vital_signs.weight && <p>⚖️ Cân nặng: {record.vital_signs.weight} kg</p>}
                                {record.vital_signs.height && <p>📏 Chiều cao: {record.vital_signs.height} cm</p>}
                              </div>
                            </div>
                          )}

                          {/* Diagnosis - New format */}
                          {record.diagnosis?.primary && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Chẩn đoán:</h4>
                              <Chip color="primary" variant="flat" className="mr-2 mb-2">
                                {record.diagnosis.primary}
                              </Chip>
                              {record.diagnosis.secondary?.map((diag, i) => (
                                <Chip key={i} color="secondary" variant="flat" className="mr-2 mb-2">
                                  {diag}
                                </Chip>
                              ))}
                              {record.diagnosis.icd_codes?.map((code, i) => (
                                <Chip key={i} color="default" variant="bordered" size="sm" className="mr-2 mb-2">
                                  ICD: {code}
                                </Chip>
                              ))}
                            </div>
                          )}

                          {/* Diagnosis - Old format */}
                          {record.assessment_plan?.final_diagnosis && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Chẩn đoán:</h4>
                              {record.assessment_plan.final_diagnosis.map((diag, i) => (
                                <Chip key={i} color="primary" variant="flat" className="mr-2">
                                  {diag.text} ({diag.icd10})
                                </Chip>
                              ))}
                            </div>
                          )}

                          {/* Plan - Old format */}
                          {record.assessment_plan?.plan && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Kế hoạch điều trị:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {record.assessment_plan.plan.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Prescription - New format */}
                          {record.prescriptions && record.prescriptions.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Pill size={16} /> Đơn thuốc:
                              </h4>
                              <div className="space-y-2">
                                {record.prescriptions.map((item, i) => (
                                  <div key={i} className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <p className="font-medium">{item.name} {item.dosage}</p>
                                    <p className="text-gray-600">{item.frequency} • {item.duration}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prescription - Old format */}
                          {record.e_prescription && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Pill size={16} /> Đơn thuốc:
                              </h4>
                              <div className="space-y-2">
                                {record.e_prescription.items.map((item, i) => (
                                  <div key={i} className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <p className="font-medium">{item.drug} {item.dose}</p>
                                    <p className="text-gray-600">{item.route} • {item.freq} • {item.days} ngày</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {record.notes && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Ghi chú:</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </PatientFrame>
  );
}
