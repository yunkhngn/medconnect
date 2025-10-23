import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input, Textarea, Button, Card, CardBody, CardHeader, Divider, Select, SelectItem, Chip, Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Save, ArrowLeft, Plus, User, Mail, Phone, Calendar, MapPin, IdCard, Shield, Heart, Pill, Users as UsersIcon, Trash2, AlertTriangle } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/useToast";
import ToastNotification from "@/components/ui/ToastNotification";
import BHYTInput from "@/components/ui/BHYTInput";

export default function EditEMRPage() {
  const router = useRouter();
  const toast = useToast();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state - complete EMR data
  const [profile, setProfile] = useState({
    full_name: "",
    dob: "",
    gender: "Nam",
    address: "",
    phone: "",
    email: "",
    insurance_number: "",
    insurance_valid_to: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    citizenship: "",
    occupation: "",
    ethnicity: "Kinh",
    foreign_national: false,
    workplace: "",
    patient_type: "BHYT",
    referral_source: "self",
    referral_diagnosis: "",
    allergies: [],
    chronic_conditions: [],
    medications: [],
    consents: {
      privacy: true,
      telemedicine: true
    }
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
          const pp = parsed.patient_profile || {};
          
          // Load ALL fields
          setProfile({
            full_name: pp.full_name || "",
            dob: pp.dob || "",
            gender: pp.gender || "Nam",
            address: pp.address || "",
            phone: pp.contact?.phone || "",
            email: pp.contact?.email || "",
            insurance_number: pp.insurance?.number || "",
            insurance_valid_to: pp.insurance?.valid_to || "",
            emergency_contact_name: pp.emergency_contact?.name || "",
            emergency_contact_phone: pp.emergency_contact?.phone || "",
            citizenship: pp.identity?.national_id || "",
            occupation: pp.occupation || "",
            ethnicity: pp.ethnicity || "Kinh",
            foreign_national: pp.foreign_national || false,
            workplace: pp.workplace || "",
            patient_type: pp.patient_type || "BHYT",
            referral_source: pp.referral_source || "self",
            referral_diagnosis: pp.referral_diagnosis || "",
            allergies: pp.allergies || [],
            chronic_conditions: pp.chronic_conditions || [],
            medications: pp.medications || [],
            consents: pp.consents || { privacy: true, telemedicine: true }
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

      // Fetch current EMR to preserve medical_records
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

      // Build updated EMR with all fields
      const updatedEMR = {
        ...currentEMR,
        patient_profile: {
          patient_id: user.uid,
          full_name: profile.full_name,
          dob: profile.dob,
          gender: profile.gender,
          contact: {
            phone: profile.phone,
            email: profile.email
          },
          address: profile.address,
          identity: {
            national_id: profile.citizenship,
            verified: false,
            verified_at: null,
            method: null
          },
          insurance: profile.insurance_number ? {
            type: "BHYT",
            number: profile.insurance_number,
            valid_to: profile.insurance_valid_to || ""
          } : null,
          emergency_contact: profile.emergency_contact_name ? {
            name: profile.emergency_contact_name,
            phone: profile.emergency_contact_phone || "",
            relation: ""
          } : null,
          occupation: profile.occupation || "",
          ethnicity: profile.ethnicity || "Kinh",
          foreign_national: profile.foreign_national || false,
          workplace: profile.workplace || "",
          patient_type: profile.patient_type || "BHYT",
          referral_source: profile.referral_source || "self",
          referral_diagnosis: profile.referral_source === "medical" ? profile.referral_diagnosis : "",
          allergies: profile.allergies || [],
          chronic_conditions: profile.chronic_conditions || [],
          medications: profile.medications || [],
          consents: profile.consents,
          meta: {
            ...currentEMR.patient_profile?.meta,
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

  const handleDelete = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/medical-records/my-profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to delete EMR");
      }

      toast.success("Đã xóa hồ sơ bệnh án thành công!");
      setTimeout(() => {
        router.push("/nguoi-dung/ho-so-benh-an");
      }, 1500);
    } catch (error) {
      console.error("Error deleting EMR:", error);
      toast.error("Không thể xóa hồ sơ bệnh án");
    } finally {
      setDeleting(false);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa hồ sơ bệnh án</h1>
              <p className="text-gray-600 mt-2">
                Cập nhật thông tin hồ sơ bệnh án của bạn
              </p>
            </div>
            <Button
              color="danger"
              variant="bordered"
              startContent={<Trash2 size={20} />}
              onClick={onOpen}
            >
              Xóa hồ sơ
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* I. HÀNH CHÍNH */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <IdCard className="text-primary" size={24} />
                I. HÀNH CHÍNH
              </h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-6">
              {/* Row 1: Tên & Ngày sinh */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="1. Họ và tên (in hoa)"
                  value={profile.full_name}
                  onValueChange={(v) => setProfile({...profile, full_name: v.toUpperCase()})}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<User className="text-default-400" size={20} />}
                  classNames={{ input: "uppercase font-semibold" }}
                />
                <Input
                  type="date"
                  label="2. Sinh ngày"
                  value={profile.dob}
                  onValueChange={(v) => setProfile({...profile, dob: v})}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Calendar className="text-default-400" size={20} />}
                />
              </div>

              {/* Row 2: Giới tính & Nghề nghiệp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="3. Giới tính"
                  selectedKeys={[profile.gender]}
                  onSelectionChange={(keys) => setProfile({...profile, gender: Array.from(keys)[0]})}
                  variant="bordered"
                  labelPlacement="outside"
                >
                  <SelectItem key="Nam" value="Nam">Nam</SelectItem>
                  <SelectItem key="Nữ" value="Nữ">Nữ</SelectItem>
                </Select>
                <Input
                  label="4. Nghề nghiệp"
                  value={profile.occupation}
                  onValueChange={(v) => setProfile({...profile, occupation: v})}
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Row 3: Dân tộc & Ngoại kiều */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="5. Dân tộc"
                  value={profile.ethnicity}
                  onValueChange={(v) => setProfile({...profile, ethnicity: v})}
                  variant="bordered"
                  labelPlacement="outside"
                />
                <Checkbox
                  isSelected={profile.foreign_national}
                  onValueChange={(v) => setProfile({...profile, foreign_national: v})}
                >
                  6. Ngoại kiều
                </Checkbox>
              </div>

              {/* Row 4: Địa chỉ */}
              <Input
                label="7. Địa chỉ đầy đủ"
                value={profile.address}
                onValueChange={(v) => setProfile({...profile, address: v})}
                variant="bordered"
                labelPlacement="outside"
                startContent={<MapPin className="text-default-400" size={20} />}
              />

              {/* Row 5: Nơi làm việc */}
              <Input
                label="8. Nơi làm việc"
                value={profile.workplace}
                onValueChange={(v) => setProfile({...profile, workplace: v})}
                variant="bordered"
                labelPlacement="outside"
              />

              {/* Row 6: Đối tượng */}
              <Select
                label="9. Đối tượng"
                selectedKeys={[profile.patient_type]}
                onSelectionChange={(keys) => setProfile({...profile, patient_type: Array.from(keys)[0]})}
                variant="bordered"
                labelPlacement="outside"
              >
                <SelectItem key="BHYT" value="BHYT">1. BHYT</SelectItem>
                <SelectItem key="Thu phí" value="Thu phí">2. Thu phí</SelectItem>
                <SelectItem key="Miễn" value="Miễn">3. Miễn</SelectItem>
                <SelectItem key="Khác" value="Khác">4. Khác</SelectItem>
              </Select>

              {/* Row 7: BHYT */}
              {profile.patient_type === "BHYT" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BHYTInput
                    label="10. Số thẻ BHYT"
                    value={profile.insurance_number}
                    onChange={(v) => setProfile({...profile, insurance_number: v})}
                  />
                  <Input
                    type="date"
                    label="Giá trị đến"
                    value={profile.insurance_valid_to}
                    onValueChange={(v) => setProfile({...profile, insurance_valid_to: v})}
                    variant="bordered"
                    labelPlacement="outside"
                  />
                </div>
              )}

              {/* Row 8: Emergency contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="11. Người nhà khi cần báo tin"
                  value={profile.emergency_contact_name}
                  onValueChange={(v) => setProfile({...profile, emergency_contact_name: v})}
                  variant="bordered"
                  labelPlacement="outside"
                />
                <Input
                  label="Điện thoại"
                  value={profile.emergency_contact_phone}
                  onValueChange={(v) => setProfile({...profile, emergency_contact_phone: v})}
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Row 9: Referral */}
              <div className="space-y-3">
                <Select
                  label="13. Chẩn đoán nơi giới thiệu"
                  selectedKeys={[profile.referral_source]}
                  onSelectionChange={(keys) => setProfile({...profile, referral_source: Array.from(keys)[0]})}
                  variant="bordered"
                  labelPlacement="outside"
                >
                  <SelectItem key="self" value="self">2. Tự đến</SelectItem>
                  <SelectItem key="medical" value="medical">1. Y tế</SelectItem>
                </Select>
                
                {profile.referral_source === "medical" && (
                  <Textarea
                    label="Chẩn đoán từ nơi giới thiệu"
                    value={profile.referral_diagnosis}
                    onValueChange={(v) => setProfile({...profile, referral_diagnosis: v})}
                    variant="bordered"
                    labelPlacement="outside"
                    minRows={2}
                  />
                )}
              </div>
            </CardBody>
          </Card>

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
                    placeholder="VD: Penicillin..."
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
                    placeholder="VD: Tăng huyết áp..."
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
                    placeholder="VD: Amlodipine 5mg..."
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
          <div className="flex justify-between gap-3">
            <Button
              color="danger"
              variant="light"
              startContent={<Trash2 size={20} />}
              onClick={onOpen}
            >
              Xóa hồ sơ bệnh án
            </Button>
            <div className="flex gap-3">
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
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-danger">
                <AlertTriangle size={24} />
                Xác nhận xóa hồ sơ bệnh án
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn xóa hồ sơ bệnh án này không?
                </p>
                <p className="text-sm text-danger font-semibold">
                  ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu bao gồm lịch sử khám bệnh sẽ bị xóa vĩnh viễn.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button 
                  color="danger" 
                  onPress={() => {
                    onClose();
                    handleDelete();
                  }}
                  isLoading={deleting}
                >
                  {deleting ? "Đang xóa..." : "Xác nhận xóa"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PatientFrame>
  );
}
