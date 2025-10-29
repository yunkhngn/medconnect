"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Card, CardBody, CardHeader, Input, Textarea, Select, SelectItem, Chip, Divider } from "@heroui/react";
import { Calendar, Save, ArrowLeft, Plus } from "lucide-react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import ToastNotification from "@/components/ui/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { auth } from "@/lib/firebase";

export default function OfflineExamDetailPage() {
  const router = useRouter();
  const toast = useToast();
  const { appointmentId } = router.query || {};
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [patientUserId, setPatientUserId] = useState("");
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  const [record, setRecord] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    visit_time: "",
    visit_type: "offline",
    chief_complaint: "",
    vital_signs: { temperature: "", blood_pressure: "", heart_rate: "", oxygen_saturation: "", weight: "", height: "" },
    physical_exam: { general: "", cardiovascular: "", respiratory: "", abdomen: "", neurological: "", others: "" },
    diagnosis: { primary: "", secondary: [], icd_codes: [] },
    prescriptions: [],
    notes: "",
  });
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [medicationInput, setMedicationInput] = useState({ name: "", dosage: "", frequency: "", duration: "" });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!appointmentId || !user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`http://localhost:8080/api/appointments/${appointmentId}`);
        if (!res.ok) throw new Error("Không tìm thấy lịch hẹn");
        const data = await res.json();
        setAppointmentInfo(data);
        setPatientUserId(String(data.patient?.id || ""));
        setRecord((prev) => ({ ...prev, visit_date: data.date || prev.visit_date, visit_type: (data.type||"OFFLINE").toString().toLowerCase() }));
        await fetch(`http://localhost:8080/api/appointments/${appointmentId}/start`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      } catch (e) { toast.error(e.message || "Không thể tải lịch hẹn"); }
    })();
  }, [appointmentId, user]);

  const addSecondary = () => { if (!secondaryDiagnosis.trim()) return; setRecord((p)=>({...p, diagnosis:{...p.diagnosis, secondary:[...p.diagnosis.secondary, secondaryDiagnosis.trim()]}})); setSecondaryDiagnosis(""); };
  const removeSecondary = (i) => setRecord((p)=>({...p, diagnosis:{...p.diagnosis, secondary:p.diagnosis.secondary.filter((_,idx)=>idx!==i)}}));
  const addICD = () => { if (!icdCode.trim()) return; setRecord((p)=>({...p, diagnosis:{...p.diagnosis, icd_codes:[...p.diagnosis.icd_codes, icdCode.trim()]}})); setIcdCode(""); };
  const addMedication = () => { if(!medicationInput.name.trim()) return; setRecord((p)=>({...p, prescriptions:[...p.prescriptions, {...medicationInput}] })); setMedicationInput({name:"",dosage:"",frequency:"",duration:""}); };
  const removeMedication = (i) => setRecord((p)=>({...p, prescriptions:p.prescriptions.filter((_,idx)=>idx!==i)}));

  const handleSave = async () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); return; }
    if (!appointmentId || !patientUserId) { toast.error("Thiếu thông tin lịch hẹn/bệnh nhân"); return; }
    if (!record.chief_complaint || !record.diagnosis.primary) { toast.error("Nhập lý do khám và chẩn đoán chính"); return; }
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const entry = { visit_id:`V${Date.now()}`, ...record, appointment_id:Number(appointmentId) };
      const resp = await fetch(`http://localhost:8080/api/medical-records/patient/${patientUserId}/add-entry`, { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body: JSON.stringify({ entry }) });
      if (!resp.ok) throw new Error((await resp.json()).error || "Lưu bệnh án thất bại");
      await fetch(`http://localhost:8080/api/appointments/${appointmentId}/finish`, { method:"PATCH", headers:{ Authorization:`Bearer ${token}` } });
      toast.success("Đã lưu bệnh án và hoàn thành lịch hẹn");
      router.push("/bac-si/lich-hen");
    } catch (e) { toast.error(e.message || "Không thể lưu"); } finally { setSaving(false); }
  };

  const leftChildren = (
    <div className="space-y-4">
      <Button variant="light" startContent={<ArrowLeft size={18} />} onClick={()=>router.push("/bac-si/kham-offline")}>
        Quay lại
      </Button>
      <Card>
        <CardHeader><h3 className="font-semibold">Thông tin lịch hẹn</h3></CardHeader>
        <Divider />
        <CardBody className="space-y-2">
          {!appointmentInfo ? (
            <div className="flex items-start gap-3">
              <div className="w-16 h-[85px] rounded-lg bg-gray-200 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <img
                src={appointmentInfo?.patient?.idPhotoUrl || appointmentInfo?.patient?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointmentInfo?.patient?.name||'BN')}&background=0D9488&color=fff`}
                className="w-16 h-[85px] rounded-lg object-cover border-2 border-teal-400"
                alt="avatar"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appointmentInfo?.patient?.name||'BN')}&background=0D9488&color=fff`;
                }}
              />
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">{appointmentInfo?.patient?.name || "Bệnh nhân"}</p>
                <p className="text-xs text-gray-500 mt-1">Mã lịch hẹn #{appointmentId}</p>
              </div>
            </div>
          )}
          <Divider />
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="text-gray-500">Ngày khám: </span>{appointmentInfo?.date ? new Date(appointmentInfo.date).toLocaleDateString("vi-VN") : record.visit_date}</p>
            <p><span className="text-gray-500">Loại khám: </span>{record.visit_type === "online" ? "Online" : "Offline"}</p>
            {appointmentInfo?.patient?.email && (
              <p><span className="text-gray-500">Email: </span>{appointmentInfo.patient.email}</p>
            )}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h3 className="font-semibold">Lưu ý</h3></CardHeader>
        <CardBody className="text-xs text-gray-600">Điền đầy đủ các mục. Sau khi lưu sẽ đánh dấu lịch hẹn là Hoàn thành, có thể thêm lượt khám tiếp theo nhưng không xóa.</CardBody>
      </Card>
    </div>
  );

  const rightChildren = (
    <div className="space-y-6">
      <Card>
        <CardHeader><h2 className="text-xl font-semibold flex items-center gap-2"><Calendar className="text-primary" size={22}/>Thông tin khám</h2></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="date" label="Ngày khám" value={record.visit_date} onValueChange={(v)=>setRecord({...record, visit_date:v})} variant="bordered" labelPlacement="outside" />
            <Input type="time" label="Giờ khám" value={record.visit_time} onValueChange={(v)=>setRecord({...record, visit_time:v})} variant="bordered" labelPlacement="outside" />
            <Select label="Loại khám" selectedKeys={[record.visit_type]} onSelectionChange={(k)=>setRecord({...record, visit_type:Array.from(k)[0]})} variant="bordered" labelPlacement="outside"><SelectItem key="offline">Offline</SelectItem><SelectItem key="online">Online</SelectItem></Select>
          </div>
          <Textarea label="Lý do khám" value={record.chief_complaint} onValueChange={(v)=>setRecord({...record, chief_complaint:v})} variant="bordered" labelPlacement="outside" minRows={2} isRequired />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Chẩn đoán</h2></CardHeader>
        <CardBody className="space-y-4">
          <Input label="Chẩn đoán chính" value={record.diagnosis.primary} onValueChange={(v)=>setRecord({...record, diagnosis:{...record.diagnosis, primary:v}})} variant="bordered" labelPlacement="outside" isRequired />
          <div>
            <label className="text-sm font-medium mb-2 block">Chẩn đoán phụ</label>
            <div className="flex gap-2 mb-2"><Input placeholder="VD: Viêm amidan" value={secondaryDiagnosis} onValueChange={setSecondaryDiagnosis} variant="bordered"/><Button color="primary" variant="flat" onClick={addSecondary}><Plus size={16}/> Thêm</Button></div>
            <div className="flex flex-wrap gap-2">{record.diagnosis.secondary.map((d,i)=>(<Chip key={i} onClose={()=>removeSecondary(i)} variant="flat" color="secondary">{d}</Chip>))}</div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Mã ICD-10</label>
            <div className="flex gap-2 mb-2"><Input placeholder="VD: J03.9" value={icdCode} onValueChange={setIcdCode} variant="bordered"/><Button color="primary" variant="flat" onClick={addICD}><Plus size={16}/> Thêm</Button></div>
            <div className="flex flex-wrap gap-2">{record.diagnosis.icd_codes.map((c,i)=>(<Chip key={i} variant="flat" color="primary">{c}</Chip>))}</div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h2 className="text-xl font-semibold">Đơn thuốc</h2></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Tên thuốc" value={medicationInput.name} onValueChange={(v)=>setMedicationInput({...medicationInput,name:v})} variant="bordered" />
            <Input label="Liều lượng" value={medicationInput.dosage} onValueChange={(v)=>setMedicationInput({...medicationInput,dosage:v})} variant="bordered" />
            <Input label="Tần suất" value={medicationInput.frequency} onValueChange={(v)=>setMedicationInput({...medicationInput,frequency:v})} variant="bordered" />
            <Input label="Thời gian" value={medicationInput.duration} onValueChange={(v)=>setMedicationInput({...medicationInput,duration:v})} variant="bordered" />
          </div>
          <Button color="primary" variant="flat" onClick={addMedication}><Plus size={16}/> Thêm thuốc</Button>
          {record.prescriptions.length>0 && (<div className="space-y-2 mt-3">{record.prescriptions.map((m,i)=>(<div key={i} className="p-3 bg-gray-50 rounded-lg flex items-start justify-between"><div><p className="font-semibold">{m.name}</p><p className="text-sm text-gray-600">{m.dosage} • {m.frequency} • {m.duration}</p></div><Button size="sm" variant="light" color="danger" isIconOnly onClick={()=>removeMedication(i)}>×</Button></div>))}</div>)}
        </CardBody>
      </Card>

      <Card><CardHeader><h2 className="text-xl font-semibold">Ghi chú</h2></CardHeader><CardBody><Textarea placeholder="Ghi chú thêm..." value={record.notes} onValueChange={(v)=>setRecord({...record, notes:v})} variant="bordered" minRows={4} /></CardBody></Card>

      <div className="flex justify-end gap-3"><Button variant="bordered" onClick={()=>router.push("/bac-si/kham-offline")}>Hủy</Button><Button color="primary" startContent={<Save size={18}/>} onClick={handleSave} isLoading={saving}>Lưu & Hoàn thành lịch hẹn</Button></div>
    </div>
  );

  return (
    <DoctorFrame title={`Khám offline ca ${appointmentId || ""}`}>
      <ToastNotification toast={toast} />
        <Grid leftChildren={leftChildren} rightChildren={rightChildren} />
    </DoctorFrame>
  );
}


