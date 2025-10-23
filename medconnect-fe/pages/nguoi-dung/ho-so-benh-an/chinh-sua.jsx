import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input, Textarea, Button, Card, CardBody, CardHeader, Divider, Select, SelectItem, Chip, Checkbox } from "@heroui/react";
import { Save, ArrowLeft, Plus, User, Mail, Phone, Calendar, MapPin, IdCard, Shield, Heart, Pill, Users as UsersIcon } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import BHYTInput from "@/components/ui/BHYTInput";

export default function EditEMRPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state - chỉ cần fields không có trong Patient entity
  const [profile, setProfile] = useState({
    allergies: [],
    chronic_conditions: [],
    medications: []
  });

  // Temp input states
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");

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
        
        if (data.detail) {
          const parsed = typeof data.detail === 'string' ? JSON.parse(data.detail) : data.detail;
          const patientProfile = parsed.patient_profile || {};
          
          // Only load EMR-specific fields
          setProfile({
            allergies: patientProfile.allergies || [],
            chronic_conditions: patientProfile.chronic_conditions || [],
            medications: patientProfile.medications || []
          });
        }
      } else if (response.status === 404) {
        toast.error("Chưa có hồ sơ bệnh án. Vui lòng tạo mới.");
        router.push("/nguoi-dung/ho-so-benh-an/tao-moi");
      }
    } catch (error) {
      console.error('Error fetching EMR:', error);
      toast.error('Không thể tải hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (type) => {
    let input;
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

    setSaving(true);
    try {
      const token = await user.getIdToken();

      // Fetch current EMR to preserve other data
      const fetchResponse = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch current EMR");
      }

      const currentData = await fetchResponse.json();
      const currentEMR = typeof currentData.detail === 'string' 
        ? JSON.parse(currentData.detail) 
        : currentData.detail;

      // Update only EMR-specific fields
      const updatedEMR = {
        ...currentEMR,
        patient_profile: {
          ...currentEMR.patient_profile,
          allergies: profile.allergies,
          chronic_conditions: profile.chronic_conditions,
          medications: profile.medications,
          meta: {
            ...currentEMR.patient_profile.meta,
            updated_at: new Date().toISOString()
          }
        }
      };

      const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          detail: JSON.stringify(updatedEMR)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update EMR");
      }

      toast.success("Cập nhật hồ sơ bệnh án thành công!");
      setTimeout(() => {
        router.push("/nguoi-dung/ho-so-benh-an");
      }, 1500);
    } catch (error) {
      console.error("Error updating EMR:", error);
      toast.error(error.message || "Không thể cập nhật hồ sơ bệnh án");
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa hồ sơ bệnh án</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin y tế của bạn
          </p>
          <p className="text-sm text-blue-600 mt-1">
            💡 Thông tin cơ bản (tên, SĐT, BHYT...) được lấy từ hồ sơ cá nhân. 
            Vui lòng vào <span className="font-semibold">Cài đặt</span> để chỉnh sửa.
          </p>
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
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>
    </PatientFrame>
  );
}

