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

  // Form state - complete medical record form
  const [profile, setProfile] = useState({
    // Fields from Patient entity (will be pre-filled)
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
    
    // Additional EMR fields (user fills)
    occupation: "",           // Nghề nghiệp
    ethnicity: "Kinh",       // Dân tộc
    foreign_national: false,  // Ngoại kiều
    workplace: "",           // Nơi làm việc
    patient_type: "BHYT",    // Đối tượng: BHYT/Thu phí/Miễn/Khác
    referral_source: "self", // Giới thiệu: self/medical
    referral_diagnosis: "",  // Chẩn đoán nơi giới thiệu
    
    // Medical history
    allergies: [],
    chronic_conditions: [],
    medications: [],
    
    // Consents
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
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch patient profile to pre-fill form
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch("http://localhost:8080/api/patient/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const patientData = await response.json();
            console.log("Patient data loaded:", patientData);
            
            // Pre-fill from Patient profile
            setProfile(prev => ({
              ...prev,
              full_name: patientData.name || "",
              dob: patientData.dateOfBirth || "",
              gender: patientData.gender || "Nam",
              address: patientData.address || "",
              phone: patientData.phone || "",
              email: patientData.email || "",
              insurance_number: patientData.socialInsurance || "",
              emergency_contact_name: patientData.emergencyContactName || "",
              emergency_contact_phone: patientData.emergencyContactPhone || "",
              citizenship: patientData.citizenship || ""
            }));
          }
        } catch (error) {
          console.error("Error loading patient profile:", error);
        }
      }
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

      // Build complete EMR data
      const emrData = {
        patient_profile: {
          patient_id: user.uid,
          
          // Basic info (from Patient profile)
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
          
          // Additional EMR fields
          occupation: profile.occupation || "",
          ethnicity: profile.ethnicity || "Kinh",
          foreign_national: profile.foreign_national || false,
          workplace: profile.workplace || "",
          patient_type: profile.patient_type || "BHYT",
          
          // Referral information
          referral_source: profile.referral_source || "self",
          referral_diagnosis: profile.referral_source === "medical" ? profile.referral_diagnosis : "",
          
          // Medical history
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
            updated_at: new Date().toISOString(),
            visit_time: new Date().toISOString() // Thời gian đến khám
          }
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
            Điền đầy đủ thông tin hành chính và y tế
          </p>
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Lưu ý:</strong> Một số thông tin đã được tự động điền từ hồ sơ cá nhân của bạn. 
              Vui lòng kiểm tra và bổ sung thông tin còn thiếu.
            </p>
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
                  placeholder="NGUYỄN VĂN A"
                  value={profile.full_name}
                  onValueChange={(v) => setProfile({...profile, full_name: v.toUpperCase()})}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<User className="text-default-400" size={20} />}
                  description="Tự động lấy từ hồ sơ cá nhân"
                  isReadOnly
                  classNames={{
                    input: "uppercase font-semibold"
                  }}
                />
                <Input
                  type="date"
                  label="2. Sinh ngày"
                  value={profile.dob}
                  onValueChange={(v) => setProfile({...profile, dob: v})}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Calendar className="text-default-400" size={20} />}
                  description="Tự động lấy từ hồ sơ cá nhân"
                  isReadOnly
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
                  startContent={<UsersIcon className="text-default-400" size={20} />}
                  description="Tự động lấy từ hồ sơ cá nhân"
                  isDisabled
                >
                  <SelectItem key="Nam" value="Nam">Nam</SelectItem>
                  <SelectItem key="Nữ" value="Nữ">Nữ</SelectItem>
                </Select>
                <Input
                  label="4. Nghề nghiệp"
                  placeholder="VD: Giáo viên, Kỹ sư, Sinh viên..."
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
                  placeholder="VD: Kinh, Tày, Mường..."
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
                placeholder="Số nhà, Thôn/Phố, Xã/Phường, Huyện/Quận, Tỉnh/Thành phố"
                value={profile.address}
                onValueChange={(v) => setProfile({...profile, address: v})}
                variant="bordered"
                labelPlacement="outside"
                startContent={<MapPin className="text-default-400" size={20} />}
                description="Tự động lấy từ hồ sơ cá nhân"
                isReadOnly
              />

              {/* Row 5: Nơi làm việc */}
              <Input
                label="8. Nơi làm việc"
                placeholder="Tên công ty, trường học, cơ quan..."
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
                description="Loại hình thanh toán"
              >
                <SelectItem key="BHYT" value="BHYT">1. BHYT (Bảo hiểm y tế)</SelectItem>
                <SelectItem key="Thu phí" value="Thu phí">2. Thu phí (Tự túc)</SelectItem>
                <SelectItem key="Miễn" value="Miễn">3. Miễn (Miễn phí)</SelectItem>
                <SelectItem key="Khác" value="Khác">4. Khác</SelectItem>
              </Select>

              {/* Row 7: BHYT (only if patient_type is BHYT) */}
              {profile.patient_type === "BHYT" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BHYTInput
                    label="10. Số thẻ BHYT"
                    placeholder="VD: HS 4 01 0120878811"
                    value={profile.insurance_number}
                    onChange={(v) => setProfile({...profile, insurance_number: v})}
                  />
                  <Input
                    type="date"
                    label="BHYT giá trị đến ngày"
                    value={profile.insurance_valid_to}
                    onValueChange={(v) => setProfile({...profile, insurance_valid_to: v})}
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Calendar className="text-default-400" size={20} />}
                  />
                </div>
              )}

              {/* Row 8: Người liên hệ khẩn cấp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="11. Họ tên người nhà khi cần báo tin"
                  placeholder="Tên người thân"
                  value={profile.emergency_contact_name}
                  onValueChange={(v) => setProfile({...profile, emergency_contact_name: v})}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<User className="text-default-400" size={20} />}
                  description="Tự động lấy từ hồ sơ cá nhân"
                  isReadOnly
                />
                <Input
                  type="tel"
                  label="Điện thoại số"
                  placeholder="0912 345 678"
                  value={profile.emergency_contact_phone}
                  onValueChange={(v) => setProfile({...profile, emergency_contact_phone: v})}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Phone className="text-default-400" size={20} />}
                  description="Tự động lấy từ hồ sơ cá nhân"
                  isReadOnly
                />
              </div>

              {/* Row 9: Đến khám bệnh lúc */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">12. Đến khám bệnh lúc</p>
                <p className="text-sm font-medium">
                  Thời gian tạo hồ sơ này sẽ được ghi nhận tự động khi lưu
                </p>
              </div>

              {/* Row 10: Chẩn đoán của nơi giới thiệu */}
              <div className="space-y-3">
                <Select
                  label="13. Chẩn đoán của nơi giới thiệu"
                  selectedKeys={[profile.referral_source]}
                  onSelectionChange={(keys) => setProfile({...profile, referral_source: Array.from(keys)[0]})}
                  variant="bordered"
                  labelPlacement="outside"
                >
                  <SelectItem key="self" value="self">2. Tự đến</SelectItem>
                  <SelectItem key="medical" value="medical">1. Y tế (Có giới thiệu)</SelectItem>
                </Select>
                
                {profile.referral_source === "medical" && (
                  <Textarea
                    label="Chẩn đoán từ nơi giới thiệu"
                    placeholder="Nhập chẩn đoán ban đầu từ cơ sở y tế giới thiệu..."
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

