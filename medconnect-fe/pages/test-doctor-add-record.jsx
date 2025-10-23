import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input, Textarea, Button, Card, CardBody, CardHeader, Divider, Select, SelectItem, Chip } from "@heroui/react";
import { Save, ArrowLeft, Plus, Trash2, Stethoscope, Pill, FlaskConical, Calendar } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";

export default function TestDoctorAddRecord() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [patientUserId, setPatientUserId] = useState(""); // ID of patient to add record to

  // Medical record data
  const [record, setRecord] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: "",
    vital_signs: {
      temperature: "",
      blood_pressure: "",
      heart_rate: "",
      respiratory_rate: "",
      oxygen_saturation: "",
      weight: "",
      height: ""
    },
    physical_exam: {
      general: "",
      cardiovascular: "",
      respiratory: "",
      abdomen: "",
      neurological: "",
      others: ""
    },
    diagnosis: {
      primary: "",
      secondary: [],
      icd_codes: []
    },
    treatment_plan: {
      medications: [],
      procedures: [],
      lifestyle: "",
      diet: ""
    },
    prescriptions: [],
    lab_tests: [],
    follow_up: {
      required: false,
      date: "",
      notes: ""
    },
    notes: ""
  });

  // Temp inputs
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [medicationInput, setMedicationInput] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: ""
  });
  const [labTestInput, setLabTestInput] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAddSecondaryDiagnosis = () => {
    if (secondaryDiagnosis.trim()) {
      setRecord(prev => ({
        ...prev,
        diagnosis: {
          ...prev.diagnosis,
          secondary: [...prev.diagnosis.secondary, secondaryDiagnosis.trim()]
        }
      }));
      setSecondaryDiagnosis("");
    }
  };

  const handleRemoveSecondaryDiagnosis = (index) => {
    setRecord(prev => ({
      ...prev,
      diagnosis: {
        ...prev.diagnosis,
        secondary: prev.diagnosis.secondary.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddICD = () => {
    if (icdCode.trim()) {
      setRecord(prev => ({
        ...prev,
        diagnosis: {
          ...prev.diagnosis,
          icd_codes: [...prev.diagnosis.icd_codes, icdCode.trim()]
        }
      }));
      setIcdCode("");
    }
  };

  const handleAddMedication = () => {
    if (medicationInput.name.trim()) {
      setRecord(prev => ({
        ...prev,
        prescriptions: [...prev.prescriptions, { ...medicationInput }]
      }));
      setMedicationInput({ name: "", dosage: "", frequency: "", duration: "" });
    }
  };

  const handleRemoveMedication = (index) => {
    setRecord(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handleAddLabTest = () => {
    if (labTestInput.trim()) {
      setRecord(prev => ({
        ...prev,
        lab_tests: [...prev.lab_tests, {
          test_name: labTestInput.trim(),
          status: "ordered",
          ordered_date: new Date().toISOString().split('T')[0]
        }]
      }));
      setLabTestInput("");
    }
  };

  const handleRemoveLabTest = (index) => {
    setRecord(prev => ({
      ...prev,
      lab_tests: prev.lab_tests.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    if (!patientUserId) {
      toast.error("Vui lòng nhập Patient User ID");
      return;
    }

    if (!record.chief_complaint || !record.diagnosis.primary) {
      toast.error("Vui lòng nhập lý do khám và chẩn đoán chính");
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();

      // Build medical record entry
      const medicalEntry = {
        visit_id: `V${Date.now()}`,
        visit_date: record.visit_date,
        chief_complaint: record.chief_complaint,
        vital_signs: record.vital_signs,
        physical_exam: record.physical_exam,
        diagnosis: record.diagnosis,
        treatment_plan: record.treatment_plan,
        prescriptions: record.prescriptions,
        lab_tests: record.lab_tests,
        follow_up: record.follow_up,
        notes: record.notes,
        doctor_notes: {
          created_at: new Date().toISOString(),
          created_by: user.uid
        }
      };

      const response = await fetch(`http://localhost:8080/api/medical-records/patient/${patientUserId}/add-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(medicalEntry)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add medical record");
      }

      toast.success("Đã thêm bệnh án thành công!");
      
      // Reset form
      setRecord({
        visit_date: new Date().toISOString().split('T')[0],
        chief_complaint: "",
        vital_signs: {
          temperature: "",
          blood_pressure: "",
          heart_rate: "",
          respiratory_rate: "",
          oxygen_saturation: "",
          weight: "",
          height: ""
        },
        physical_exam: {
          general: "",
          cardiovascular: "",
          respiratory: "",
          abdomen: "",
          neurological: "",
          others: ""
        },
        diagnosis: {
          primary: "",
          secondary: [],
          icd_codes: []
        },
        treatment_plan: {
          medications: [],
          procedures: [],
          lifestyle: "",
          diet: ""
        },
        prescriptions: [],
        lab_tests: [],
        follow_up: {
          required: false,
          date: "",
          notes: ""
        },
        notes: ""
      });
      
    } catch (error) {
      console.error("Error adding medical record:", error);
      toast.error(error.message || "Không thể thêm bệnh án");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastNotification toast={toast} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            startContent={<ArrowLeft size={20} />}
            onClick={() => router.push("/")}
            className="mb-4"
          >
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">🧪 TEST: Thêm bệnh án (Doctor)</h1>
          <p className="text-gray-600 mt-2">
            Trang test để bác sĩ nhập thông tin khám bệnh vào EMR của bệnh nhân
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>WARNING:</strong> Đây là trang test. Chỉ dùng để development. Xóa sau khi test xong!
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Chọn bệnh nhân</h2>
            </CardHeader>
            <CardBody>
              <Input
                label="Patient User ID"
                placeholder="VD: 13 (user_id của patient)"
                value={patientUserId}
                onValueChange={setPatientUserId}
                variant="bordered"
                labelPlacement="outside"
                description="ID của patient trong database (số nguyên)"
                type="number"
              />
            </CardBody>
          </Card>

          {/* Visit Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="text-primary" size={24} />
                Thông tin khám
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                type="date"
                label="Ngày khám"
                value={record.visit_date}
                onValueChange={(v) => setRecord({...record, visit_date: v})}
                variant="bordered"
                labelPlacement="outside"
              />
              <Textarea
                label="Lý do khám"
                placeholder="VD: Đau đầu, sốt, ho..."
                value={record.chief_complaint}
                onValueChange={(v) => setRecord({...record, chief_complaint: v})}
                variant="bordered"
                labelPlacement="outside"
                minRows={2}
                isRequired
              />
            </CardBody>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Stethoscope className="text-rose-500" size={24} />
                Sinh hiệu
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nhiệt độ (°C)"
                  placeholder="37.5"
                  value={record.vital_signs.temperature}
                  onValueChange={(v) => setRecord({...record, vital_signs: {...record.vital_signs, temperature: v}})}
                  variant="bordered"
                />
                <Input
                  label="Huyết áp (mmHg)"
                  placeholder="120/80"
                  value={record.vital_signs.blood_pressure}
                  onValueChange={(v) => setRecord({...record, vital_signs: {...record.vital_signs, blood_pressure: v}})}
                  variant="bordered"
                />
                <Input
                  label="Nhịp tim (bpm)"
                  placeholder="72"
                  value={record.vital_signs.heart_rate}
                  onValueChange={(v) => setRecord({...record, vital_signs: {...record.vital_signs, heart_rate: v}})}
                  variant="bordered"
                />
                <Input
                  label="Nhịp thở (breaths/min)"
                  placeholder="16"
                  value={record.vital_signs.respiratory_rate}
                  onValueChange={(v) => setRecord({...record, vital_signs: {...record.vital_signs, respiratory_rate: v}})}
                  variant="bordered"
                />
                <Input
                  label="SpO2 (%)"
                  placeholder="98"
                  value={record.vital_signs.oxygen_saturation}
                  onValueChange={(v) => setRecord({...record, vital_signs: {...record.vital_signs, oxygen_saturation: v}})}
                  variant="bordered"
                />
                <Input
                  label="Cân nặng (kg)"
                  placeholder="65"
                  value={record.vital_signs.weight}
                  onValueChange={(v) => setRecord({...record, vital_signs: {...record.vital_signs, weight: v}})}
                  variant="bordered"
                />
              </div>
            </CardBody>
          </Card>

          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Chẩn đoán</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Chẩn đoán chính"
                placeholder="VD: Viêm họng cấp"
                value={record.diagnosis.primary}
                onValueChange={(v) => setRecord({...record, diagnosis: {...record.diagnosis, primary: v}})}
                variant="bordered"
                labelPlacement="outside"
                isRequired
              />
              
              {/* Secondary Diagnosis */}
              <div>
                <label className="text-sm font-medium mb-2 block">Chẩn đoán phụ</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: Viêm amidan"
                    value={secondaryDiagnosis}
                    onValueChange={setSecondaryDiagnosis}
                    variant="bordered"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Plus size={18} />}
                    onClick={handleAddSecondaryDiagnosis}
                  >
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.diagnosis.secondary.map((diag, idx) => (
                    <Chip
                      key={idx}
                      onClose={() => handleRemoveSecondaryDiagnosis(idx)}
                      variant="flat"
                      color="secondary"
                    >
                      {diag}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* ICD Codes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mã ICD-10</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: J03.9"
                    value={icdCode}
                    onValueChange={setIcdCode}
                    variant="bordered"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Plus size={18} />}
                    onClick={handleAddICD}
                  >
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.diagnosis.icd_codes.map((code, idx) => (
                    <Chip key={idx} variant="flat" color="primary">
                      {code}
                    </Chip>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Pill className="text-blue-500" size={24} />
                Đơn thuốc
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tên thuốc"
                  placeholder="VD: Paracetamol"
                  value={medicationInput.name}
                  onValueChange={(v) => setMedicationInput({...medicationInput, name: v})}
                  variant="bordered"
                />
                <Input
                  label="Liều lượng"
                  placeholder="VD: 500mg"
                  value={medicationInput.dosage}
                  onValueChange={(v) => setMedicationInput({...medicationInput, dosage: v})}
                  variant="bordered"
                />
                <Input
                  label="Tần suất"
                  placeholder="VD: 3 lần/ngày"
                  value={medicationInput.frequency}
                  onValueChange={(v) => setMedicationInput({...medicationInput, frequency: v})}
                  variant="bordered"
                />
                <Input
                  label="Thời gian"
                  placeholder="VD: 5 ngày"
                  value={medicationInput.duration}
                  onValueChange={(v) => setMedicationInput({...medicationInput, duration: v})}
                  variant="bordered"
                />
              </div>
              <Button
                color="primary"
                variant="flat"
                startContent={<Plus size={18} />}
                onClick={handleAddMedication}
              >
                Thêm thuốc
              </Button>

              {record.prescriptions.length > 0 && (
                <div className="space-y-2 mt-4">
                  {record.prescriptions.map((med, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        isIconOnly
                        onClick={() => handleRemoveMedication(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Lab Tests */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FlaskConical className="text-purple-500" size={24} />
                Xét nghiệm
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="VD: Xét nghiệm máu tổng quát"
                  value={labTestInput}
                  onValueChange={setLabTestInput}
                  variant="bordered"
                />
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Plus size={18} />}
                  onClick={handleAddLabTest}
                >
                  Thêm
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {record.lab_tests.map((test, idx) => (
                  <Chip
                    key={idx}
                    onClose={() => handleRemoveLabTest(idx)}
                    variant="flat"
                    color="secondary"
                  >
                    {test.test_name}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Ghi chú</h2>
            </CardHeader>
            <CardBody>
              <Textarea
                placeholder="Ghi chú thêm về ca khám..."
                value={record.notes}
                onValueChange={(v) => setRecord({...record, notes: v})}
                variant="bordered"
                minRows={4}
              />
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="bordered"
              onClick={() => router.push("/")}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              startContent={<Save size={20} />}
              onClick={handleSave}
              isLoading={saving}
            >
              {saving ? "Đang lưu..." : "Lưu bệnh án"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

