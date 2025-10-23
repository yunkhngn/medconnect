import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input, Textarea, Button, Card, CardBody, CardHeader, Divider, Select, SelectItem, Chip, Checkbox } from "@heroui/react";
import { Save, ArrowLeft, Plus, X, User, Mail, Phone, Calendar, MapPin, IdCard, Shield, Heart, Pill, Users as UsersIcon, AlertCircle } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import BHYTInput from "@/components/ui/BHYTInput";

export default function CreateEMRPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state - only EMR-specific fields
  const [profile, setProfile] = useState({
    allergies: [],
    chronic_conditions: [],
    medications: [],
    consents: {
      privacy: false,
      telemedicine: false
    }
  });

  // Temp input states
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAddItem = (type) => {
    let input, value;
    switch(type) {
      case 'allergy':
        input = allergyInput.trim();
        if (input && !profile.allergies.includes(input)) {
          setProfile(prev => ({
            ...prev,
            allergies: [...prev.allergies, input]
          }));
          setAllergyInput("");
        }
        break;
      case 'condition':
        input = conditionInput.trim();
        if (input && !profile.chronic_conditions.includes(input)) {
          setProfile(prev => ({
            ...prev,
            chronic_conditions: [...prev.chronic_conditions, input]
          }));
          setConditionInput("");
        }
        break;
      case 'medication':
        input = medicationInput.trim();
        if (input && !profile.medications.includes(input)) {
          setProfile(prev => ({
            ...prev,
            medications: [...prev.medications, input]
          }));
          setMedicationInput("");
        }
        break;
    }
  };

  const handleRemoveItem = (type, index) => {
    switch(type) {
      case 'allergy':
        setProfile(prev => ({
          ...prev,
          allergies: prev.allergies.filter((_, i) => i !== index)
        }));
        break;
      case 'condition':
        setProfile(prev => ({
          ...prev,
          chronic_conditions: prev.chronic_conditions.filter((_, i) => i !== index)
        }));
        break;
      case 'medication':
        setProfile(prev => ({
          ...prev,
          medications: prev.medications.filter((_, i) => i !== index)
        }));
        break;
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    // Validation
    if (!profile.consents.privacy || !profile.consents.telemedicine) {
      toast.error("Vui lòng đồng ý với các điều khoản để tiếp tục");
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();

      // Build EMR data - backend will auto-fill basic info from Patient entity
      const emrData = {
        patient_profile: {
          patient_id: user.uid,
          // Medical history (user input)
          allergies: profile.allergies || [],
          chronic_conditions: profile.chronic_conditions || [],
          medications: profile.medications || [],
          // Consents
          consents: {
            privacy: profile.consents.privacy,
            telemedicine: profile.consents.telemedicine,
            consent_at: new Date().toISOString()
          },
          // Metadata
          meta: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          // Placeholders (will be overwritten by backend from Patient entity)
          full_name: "",
          dob: "",
          gender: "",
          contact: { phone: "", email: "" },
          address: "",
          identity: { national_id: "", verified: false, verified_at: null, method: null },
          insurance: null,
          emergency_contact: null
        },
        medical_records: []
      };

      // Debug log
      console.log("EMR Data to send:", emrData);

      const response = await fetch("http://localhost:8080/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          detail: JSON.stringify(emrData)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.error || "Failed to create EMR");
      }

      toast.success("Tạo hồ sơ bệnh án thành công!");
      setTimeout(() => {
        router.push("/nguoi-dung/ho-so-benh-an");
      }, 1500);
    } catch (error) {
      console.error("Error creating EMR:", error);
      toast.error(error.message || "Không thể tạo hồ sơ bệnh án");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PatientFrame>
      <ToastNotification toast={toast} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            startContent={<ArrowLeft size={20} />}
            onClick={() => router.back()}
            className="mb-4"
          >
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Tạo hồ sơ bệnh án</h1>
          <p className="text-gray-600 mt-2">
            Điền thông tin y tế để tạo hồ sơ bệnh án điện tử của bạn
          </p>
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Lưu ý:</strong> Thông tin cơ bản (tên, SĐT, email, BHYT...) sẽ được tự động lấy từ <strong>Cài đặt hồ sơ</strong> của bạn. 
              Bạn chỉ cần điền tiền sử bệnh và đồng ý điều khoản.
            </p>
            <Button
              size="sm"
              variant="light"
              color="primary"
              className="mt-2"
              onClick={() => router.push('/nguoi-dung/cai-dat')}
            >
              Cập nhật thông tin cơ bản →
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Medical History */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Heart className="text-red-500" size={24} />
                Tiền sử bệnh
              </h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Allergies */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dị ứng</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: Penicillin, hải sản, phấn hoa..."
                    value={allergyInput}
                    onValueChange={setAllergyInput}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('allergy')}
                    variant="bordered"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Plus size={18} />}
                    onClick={() => handleAddItem('allergy')}
                  >
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy, idx) => (
                    <Chip
                      key={idx}
                      onClose={() => handleRemoveItem('allergy', idx)}
                      variant="flat"
                      color="danger"
                    >
                      {allergy}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bệnh mãn tính</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: Tăng huyết áp, Tiểu đường..."
                    value={conditionInput}
                    onValueChange={setConditionInput}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('condition')}
                    variant="bordered"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Plus size={18} />}
                    onClick={() => handleAddItem('condition')}
                  >
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.chronic_conditions.map((condition, idx) => (
                    <Chip
                      key={idx}
                      onClose={() => handleRemoveItem('condition', idx)}
                      variant="flat"
                      color="warning"
                    >
                      {condition}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Pill size={16} /> Thuốc đang sử dụng
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="VD: Amlodipine 5mg, Metformin 500mg..."
                    value={medicationInput}
                    onValueChange={setMedicationInput}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('medication')}
                    variant="bordered"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Plus size={18} />}
                    onClick={() => handleAddItem('medication')}
                  >
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.medications.map((med, idx) => (
                    <Chip
                      key={idx}
                      onClose={() => handleRemoveItem('medication', idx)}
                      variant="flat"
                      color="primary"
                    >
                      {med}
                    </Chip>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="text-warning" size={24} />
                Đồng ý điều khoản
              </h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-3">
              <Checkbox
                isSelected={profile.consents.privacy}
                onValueChange={(v) => setProfile({...profile, consents: {...profile.consents, privacy: v}})}
              >
                <span className="text-sm">
                  Tôi đồng ý cho MedConnect lưu trữ và xử lý thông tin sức khỏe của tôi theo{" "}
                  <a href="/chinh-sach/chinh-sach-bao-mat" className="text-primary underline">
                    Chính sách bảo mật
                  </a>
                </span>
              </Checkbox>
              <Checkbox
                isSelected={profile.consents.telemedicine}
                onValueChange={(v) => setProfile({...profile, consents: {...profile.consents, telemedicine: v}})}
              >
                <span className="text-sm">
                  Tôi đồng ý sử dụng dịch vụ khám bệnh từ xa và hiểu rằng đây không thay thế cho khám trực tiếp
                </span>
              </Checkbox>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="bordered"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              startContent={<Save size={20} />}
              onClick={handleSave}
              isLoading={saving}
            >
              {saving ? "Đang lưu..." : "Lưu hồ sơ"}
            </Button>
          </div>
        </div>
      </div>
    </PatientFrame>
  );
}

