"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Card, CardBody, CardHeader, Input, Textarea, Select, SelectItem, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Calendar, Save, ArrowLeft, Plus, Clock, FileText, Stethoscope, Pill, AlertCircle, X, Sparkles, Loader2 } from "lucide-react";
import DoctorFrame from "@/components/layouts/Doctor/Frame";
import Grid from "@/components/layouts/Grid";
import ToastNotification from "@/components/ui/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { auth } from "@/lib/firebase";
import { parseReason } from "@/utils/appointmentUtils";
import { useGemini } from "@/hooks/useGemini";

export default function OfflineExamDetailPage() {
  const router = useRouter();
  const toast = useToast();
  const { appointmentId } = router.query || {};
  const { sendMessage: sendGeminiMessage, loading: geminiLoading } = useGemini();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [patientUserId, setPatientUserId] = useState("");
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [previousEntry, setPreviousEntry] = useState(null);

  const mergeRecord = (base, incoming) => {
    if (!incoming) return base;
    const merged = { ...base };
    const pick = (v, fb) => (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0) ? fb : v);
    merged.visit_date = pick(incoming.visit_date, merged.visit_date);
    merged.visit_time = pick(incoming.visit_time, merged.visit_time);
    merged.visit_type = pick((incoming.visit_type||"").toString().toLowerCase(), merged.visit_type);
    merged.chief_complaint = pick(incoming.chief_complaint, merged.chief_complaint);
    if (incoming.vital_signs) merged.vital_signs = { ...merged.vital_signs, ...incoming.vital_signs };
    if (incoming.physical_exam) merged.physical_exam = { ...merged.physical_exam, ...incoming.physical_exam };
    if (incoming.diagnosis) {
      merged.diagnosis = {
        primary: pick(incoming.diagnosis.primary, merged.diagnosis.primary),
        secondary: pick(incoming.diagnosis.secondary, merged.diagnosis.secondary),
        icd_codes: pick(incoming.diagnosis.icd_codes, merged.diagnosis.icd_codes)
      }
    }
    if (incoming.prescriptions) merged.prescriptions = pick(incoming.prescriptions, merged.prescriptions);
    merged.notes = pick(incoming.notes, merged.notes);
    return merged;
  };

  const normalizeEntry = (raw) => {
    try {
      const e = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
      const n = { ...e };
      // Some APIs may nest payload under `entry`
      const src = n.entry && typeof n.entry === 'object' ? n.entry : n;
      // Some fields may be JSON-stringified
      const parseMaybe = (v) => {
        if (typeof v === 'string') {
          try { return JSON.parse(v); } catch { return v; }
        }
        return v;
      };
      // Parse reason properly - handle both object and string formats
      let chiefComplaint = src.chief_complaint || src.complaint || "";
      if (!chiefComplaint && src.reason) {
        // If reason is an object, parse it to get reasonText
        if (typeof src.reason === 'object' && src.reason !== null) {
          const parsed = parseReason(src.reason);
          chiefComplaint = parsed.reasonText || "";
        } else if (typeof src.reason === 'string') {
          // If reason is a string, try to parse it
          const parsed = parseReason(src.reason);
          chiefComplaint = parsed.reasonText || src.reason;
        } else {
          chiefComplaint = String(src.reason || "");
        }
      }
      
      return {
        visit_id: src.visit_id || n.visit_id,
        visit_date: src.visit_date,
        visit_time: src.visit_time,
        visit_type: src.visit_type,
        chief_complaint: chiefComplaint,
        vital_signs: parseMaybe(src.vital_signs),
        physical_exam: parseMaybe(src.physical_exam),
        diagnosis: parseMaybe(src.diagnosis),
        prescriptions: parseMaybe(src.prescriptions),
        notes: src.notes || src.note,
        appointment_id: src.appointment_id || n.appointment_id,
      };
    } catch (err) {
      console.warn('[Offline Exam] normalizeEntry failed', err);
      return {};
    }
  };

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
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [hasAiSummary, setHasAiSummary] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onOpenChange: onConfirmOpenChange } = useDisclosure();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!appointmentId || !user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`http://localhost:8080/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Không tìm thấy lịch hẹn");
        const data = await res.json();
        console.log("[Offline Exam] Appointment data:", data);
        console.log("[Offline Exam] Patient avatar/idPhotoUrl:", data.patient?.idPhotoUrl, data.patient?.avatar);
        setAppointmentInfo(data);
        setIsFinished(String(data?.status).toUpperCase() === "FINISHED");
        setPatientUserId(String(data.patient?.id || ""));
        // Prefill visit date, type and chief complaint from appointment.reason (JSON or plain text)
        let reasonText = "";
        try {
          if (data?.reason) {
            const parsed = JSON.parse(data.reason);
            reasonText = parsed?.reason || parsed?.text || parsed?.detail || "";
          }
        } catch (_) {
          reasonText = data?.reason || "";
        }
        setRecord((prev) => ({
          ...prev,
          visit_date: data.date || prev.visit_date,
          visit_time: (data.time || data.startTime || prev.visit_time || new Date().toTimeString().slice(0,5)),
          visit_type: (data.type||"OFFLINE").toString().toLowerCase(),
          chief_complaint: reasonText || prev.chief_complaint
        }));
        // Try prefill from existing EMR (keep old information when editing finished appointments)
        try {
          const pid = String(data.patient?.id || "");
          if (pid) {
            const emrUrl = `http://localhost:8080/api/medical-records/patient/${pid}`;
            const emrResp = await fetch(emrUrl, { headers: { Authorization: `Bearer ${token}` } });
            if (emrResp.ok) {
              const emrData = await emrResp.json();
              // Support two shapes: {entries:[...] } or { detail: '{"entries": [...] }' }
              let entries = emrData?.entries;
              if (!Array.isArray(entries)) {
                try {
                  const detail = typeof emrData?.detail === 'string' ? JSON.parse(emrData.detail) : (emrData?.detail || {});
                  if (Array.isArray(detail?.entries)) entries = detail.entries;
                } catch (_) { /* ignore */ }
              }
              if (!Array.isArray(entries)) entries = [];
              console.log('[Offline Exam] EMR raw entries:', entries);
              const byAptRaw = entries.find((e) => String((e.appointment_id || e.entry?.appointment_id)) === String(appointmentId));
              const latestRaw = entries[entries.length - 1];
              const toUseRaw = byAptRaw || latestRaw;
              const toUse = normalizeEntry(toUseRaw);
              if (toUse) {
                setPreviousEntry(toUse);
                setRecord((prev) => mergeRecord(prev, toUse));
                setPrefilled(true);
              }
            }
          }
        } catch (_) {
          // ignore
        }
        // Chỉ đánh dấu bắt đầu khi lịch chưa hoàn thành
        if (String(data?.status).toUpperCase() !== "FINISHED") {
          await fetch(`http://localhost:8080/api/appointments/${appointmentId}/start`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
        }
      } catch (e) { toast.error(e.message || "Không thể tải lịch hẹn"); }
    })();
  }, [appointmentId, user]);

  const addSecondary = () => { if (!secondaryDiagnosis.trim()) return; setRecord((p)=>({...p, diagnosis:{...p.diagnosis, secondary:[...p.diagnosis.secondary, secondaryDiagnosis.trim()]}})); setSecondaryDiagnosis(""); };
  const removeSecondary = (i) => setRecord((p)=>({...p, diagnosis:{...p.diagnosis, secondary:p.diagnosis.secondary.filter((_,idx)=>idx!==i)}}));
  const addICD = () => { if (!icdCode.trim()) return; setRecord((p)=>({...p, diagnosis:{...p.diagnosis, icd_codes:[...p.diagnosis.icd_codes, icdCode.trim()]}})); setIcdCode(""); };
  const addMedication = () => { if(!medicationInput.name.trim()) return; setRecord((p)=>({...p, prescriptions:[...p.prescriptions, {...medicationInput}] })); setMedicationInput({name:"",dosage:"",frequency:"",duration:""}); };
  const removeMedication = (i) => setRecord((p)=>({...p, prescriptions:p.prescriptions.filter((_,idx)=>idx!==i)}));

  // Generate AI summary from prescription data - hướng về bệnh nhân
  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    try {
      // Chuẩn bị dữ liệu để gửi cho AI
      const recordData = {
        chief_complaint: record.chief_complaint || "",
        diagnosis_primary: record.diagnosis?.primary || "",
        diagnosis_secondary: record.diagnosis?.secondary || [],
        icd_codes: record.diagnosis?.icd_codes || [],
        vital_signs: record.vital_signs || {},
        prescriptions: record.prescriptions || [],
        physical_exam: record.physical_exam || {},
        notes: record.notes || ""
      };

      // Tạo prompt chi tiết, hướng về bệnh nhân
      const physicalExamParts = [];
      if (recordData.physical_exam.general) physicalExamParts.push(`Tổng quát: ${recordData.physical_exam.general}`);
      if (recordData.physical_exam.cardiovascular) physicalExamParts.push(`Tim mạch: ${recordData.physical_exam.cardiovascular}`);
      if (recordData.physical_exam.respiratory) physicalExamParts.push(`Hô hấp: ${recordData.physical_exam.respiratory}`);

      const prompt = `Bạn là bác sĩ đang tạo tóm tắt cho bệnh nhân sau khi khám. Hãy viết một tóm tắt dễ hiểu, thân thiện, hướng về bệnh nhân (dùng "bạn" thay vì "bệnh nhân"). 

Thông tin khám bệnh:
- Lý do khám: ${recordData.chief_complaint || "Chưa có"}
- Chẩn đoán chính: ${recordData.diagnosis_primary || "Chưa có"}
- Chẩn đoán phụ: ${recordData.diagnosis_secondary.join(", ") || "Không có"}
- Mã ICD-10: ${recordData.icd_codes.join(", ") || "Chưa có"}
- Dấu hiệu sinh tồn: ${recordData.vital_signs.temperature ? `Nhiệt độ: ${recordData.vital_signs.temperature}°C` : ""} ${recordData.vital_signs.blood_pressure ? `Huyết áp: ${recordData.vital_signs.blood_pressure} mmHg` : ""} ${recordData.vital_signs.heart_rate ? `Nhịp tim: ${recordData.vital_signs.heart_rate} bpm` : ""}
- Khám lâm sàng: ${physicalExamParts.join("; ") || "Không có"}
- Đơn thuốc: ${recordData.prescriptions.map(m => `${m.name}${m.dosage ? ` (${m.dosage})` : ""}${m.frequency ? ` - ${m.frequency}` : ""}${m.duration ? ` trong ${m.duration}` : ""}`).join(", ") || "Không có"}
- Ghi chú: ${recordData.notes || "Không có"}

Hãy tạo tóm tắt với các phần sau (viết bằng tiếng Việt, dễ hiểu, thân thiện):
1. **Chẩn đoán**: Giải thích cho bệnh nhân biết họ đang bị gì (dùng "bạn" thay vì "bệnh nhân")
2. **Đơn thuốc**: Liệt kê từng thuốc bác sĩ kê, liều lượng, tần suất uống (bao nhiêu lần/ngày), thời gian uống
3. **Hướng dẫn sinh hoạt**: Nên ăn uống, nghỉ ngơi, vận động như thế nào
4. **Lưu ý**: Những điều cần chú ý, khi nào cần tái khám, dấu hiệu cần đến bệnh viện ngay

Format: Viết thành đoạn văn tự nhiên, không dùng bullet points, dùng "bạn" thay vì "bệnh nhân".`;

      // Gọi Gemini API
      const summary = await sendGeminiMessage(prompt);
      
      setAiSummary(summary);
      setHasAiSummary(true);
      
      // Tự động điền vào notes với format: [notes hiện tại] + "Tóm tắt của AI:\n\n" + [summary]
      // Nếu đã có "Tóm tắt của AI:" thì replace, không append
      const currentNotes = record.notes || "";
      let newNotes;
      
      if (currentNotes.includes("Tóm tắt của AI:")) {
        // Replace phần AI summary cũ
        const parts = currentNotes.split("Tóm tắt của AI:");
        const beforeAI = parts[0].trim();
        newNotes = beforeAI 
          ? `${beforeAI}\n\nTóm tắt của AI:\n\n${summary}`
          : `Tóm tắt của AI:\n\n${summary}`;
      } else {
        // Append mới
        newNotes = currentNotes 
          ? `${currentNotes}\n\nTóm tắt của AI:\n\n${summary}`
          : `Tóm tắt của AI:\n\n${summary}`;
      }
      
      setRecord(prev => ({
        ...prev,
        notes: newNotes
      }));
    } catch (error) {
      console.error("AI Summary generation error:", error);
      toast.error("Không thể tạo tóm tắt AI. Đang tạo tóm tắt đơn giản...");
      // Fallback: tạo summary đơn giản nếu AI lỗi
      const summaryParts = [];
      if (record.chief_complaint) {
        summaryParts.push(`Bạn đến khám với lý do: ${record.chief_complaint}.`);
      }
      if (record.diagnosis?.primary) {
        summaryParts.push(`Bác sĩ chẩn đoán bạn đang bị: ${record.diagnosis.primary}.`);
      }
      if (record.prescriptions && record.prescriptions.length > 0) {
        const meds = record.prescriptions.map(m => 
          `${m.name}${m.dosage ? ` (${m.dosage})` : ""}${m.frequency ? ` - ${m.frequency}` : ""}${m.duration ? ` trong ${m.duration}` : ""}`
        ).join(", ");
        summaryParts.push(`Bác sĩ kê đơn thuốc: ${meds}.`);
      }
      const fallbackSummary = summaryParts.length > 0 
        ? summaryParts.join(" ") 
        : "Chưa có đủ thông tin để tạo tóm tắt.";
      setAiSummary(fallbackSummary);
      setHasAiSummary(true);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const performSave = async () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); return; }
    if (!appointmentId || !patientUserId) { toast.error("Thiếu thông tin lịch hẹn/bệnh nhân"); return; }
    if (!record.chief_complaint || !record.diagnosis.primary) { toast.error("Nhập lý do khám và chẩn đoán chính"); return; }
    setSaving(true);
    try {
      const token = await user.getIdToken();
      // Merge với bản ghi cũ để không làm mất dữ liệu khi cập nhật
      const mergedToSave = isFinished && previousEntry ? mergeRecord(previousEntry, record) : record;
      
      // Notes should already contain AI summary from generateAISummary, so we use it directly
      let finalNotes = mergedToSave.notes || "";
      
      const doctor_name = appointmentInfo?.doctor?.name || user?.displayName || "";
      const doctor_id = appointmentInfo?.doctor?.id || user?.uid || "";
      const visit_time = mergedToSave.visit_time || new Date().toTimeString().slice(0,5);
      const visit_id = previousEntry?.visit_id || mergedToSave.visit_id || `V${Date.now()}`;
      const entry = { 
        visit_id, 
        ...mergedToSave, 
        notes: finalNotes,
        visit_time, 
        doctor_name, 
        doctor_id, 
        appointment_id:Number(appointmentId) 
      };
      const resp = await fetch(`http://localhost:8080/api/medical-records/patient/${patientUserId}/add-entry`, { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body: JSON.stringify({ entry }) });
      if (!resp.ok) throw new Error((await resp.json()).error || "Lưu bệnh án thất bại");
      if (!isFinished) {
        await fetch(`http://localhost:8080/api/appointments/${appointmentId}/finish`, { method:"PATCH", headers:{ Authorization:`Bearer ${token}` } });
        toast.success("Đã lưu bệnh án và hoàn thành lịch hẹn");
      } else {
        toast.success("Đã cập nhật bệnh án cho lịch hẹn đã hoàn thành");
      }
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
          {appointmentInfo?.patient ? (() => {
            const patientName = appointmentInfo.patient.name || "Bệnh nhân";
            // Priority: idPhotoUrl > avatar > ui-avatars fallback
            const avatarUrl = appointmentInfo.patient.idPhotoUrl || appointmentInfo.patient.avatar;
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=0D9488&color=fff&size=128`;
            const avatarSrc = avatarUrl || fallbackUrl;
            return (
              <div className="flex items-start gap-3">
                <img
                  src={avatarSrc}
                  className="w-[72px] h-[96px] rounded-lg object-cover border-2 border-teal-400"
                  alt={`${patientName} avatar`}
                  loading="eager"
                  onError={(e) => {
                    // Prevent infinite loop
                    if (e.target.src !== fallbackUrl) {
                      e.target.src = fallbackUrl;
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-base">{patientName}</p>
                  <p className="text-xs text-gray-500 mt-1">Mã lịch hẹn #{appointmentId}</p>
                </div>
              </div>
            );
          })() : (
            <div className="flex items-start gap-3">
              <div className="w-[72px] h-[96px] rounded-lg bg-gray-200 animate-pulse border-2 border-teal-400" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
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
      {/* Thông tin khám - Section 1 */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Thông tin khám</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ngày khám</label>
              <Input 
                type="date" 
                value={record.visit_date} 
                onValueChange={(v)=>setRecord({...record, visit_date:v})} 
                variant="bordered"
                classNames={{
                  input: "font-medium text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-blue-400 transition-colors"
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Giờ khám</label>
              <Input 
                type="time" 
                value={record.visit_time} 
                onValueChange={(v)=>setRecord({...record, visit_time:v})} 
                variant="bordered"
                classNames={{
                  input: "font-medium text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-blue-400 transition-colors"
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Loại khám</label>
              <Select 
                selectedKeys={[record.visit_type]} 
                isDisabled 
                variant="bordered"
                classNames={{
                  trigger: "bg-gray-50",
                  value: "font-medium"
                }}
              >
                <SelectItem key="offline">Offline</SelectItem>
                <SelectItem key="online">Online</SelectItem>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              Lý do khám <span className="text-red-500">*</span>
            </label>
            <Textarea 
              value={record.chief_complaint} 
              onValueChange={(v)=>setRecord({...record, chief_complaint:v})} 
              variant="bordered"
              placeholder="Nhập lý do khám của bệnh nhân..."
              minRows={3}
              classNames={{
                input: "font-medium text-gray-900",
                inputWrapper: "border-gray-300 hover:border-blue-400 transition-colors"
              }}
              isRequired 
            />
          </div>
        </CardBody>
      </Card>

      {/* Chẩn đoán - Section 2 */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-amber-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Stethoscope className="text-amber-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Chẩn đoán</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              Chẩn đoán chính <span className="text-red-500">*</span>
            </label>
            <Input 
              label="" 
              value={record.diagnosis.primary} 
              onValueChange={(v)=>setRecord({...record, diagnosis:{...record.diagnosis, primary:v}})} 
              variant="bordered"
              placeholder="Nhập chẩn đoán chính..."
              classNames={{
                input: "font-medium text-gray-900",
                inputWrapper: "border-gray-300 hover:border-amber-400 transition-colors"
              }}
              isRequired 
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">Chẩn đoán phụ</label>
            <div className="flex gap-2">
              <Input 
                placeholder="VD: Viêm amidan" 
                value={secondaryDiagnosis} 
                onValueChange={setSecondaryDiagnosis} 
                variant="bordered"
                classNames={{
                  input: "text-gray-900",
                  inputWrapper: "border-gray-300"
                }}
                onKeyPress={(e) => e.key === 'Enter' && addSecondary()}
              />
              <Button 
                color="warning" 
                variant="flat" 
                onClick={addSecondary}
                className="font-medium"
                startContent={<Plus size={16} />}
              >
                Thêm
              </Button>
            </div>
            {record.diagnosis.secondary.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {record.diagnosis.secondary.map((d,i)=>(
                  <Chip 
                    key={i} 
                    onClose={()=>removeSecondary(i)} 
                    variant="flat" 
                    color="warning"
                    className="font-medium"
                  >
                    {d}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">Mã ICD-10</label>
            <div className="flex gap-2">
              <Input 
                placeholder="VD: J03.9" 
                value={icdCode} 
                onValueChange={setIcdCode} 
                variant="bordered"
                classNames={{
                  input: "font-mono text-gray-900",
                  inputWrapper: "border-gray-300"
                }}
                onKeyPress={(e) => e.key === 'Enter' && addICD()}
              />
              <Button 
                color="primary" 
                variant="flat" 
                onClick={addICD}
                className="font-medium"
                startContent={<Plus size={16} />}
              >
                Thêm
              </Button>
            </div>
            {record.diagnosis.icd_codes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {record.diagnosis.icd_codes.map((c,i)=>(
                  <Chip 
                    key={i} 
                    variant="flat" 
                    color="primary"
                    className="font-mono font-semibold"
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Đơn thuốc - Section 3 */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-green-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Pill className="text-green-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Đơn thuốc</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tên thuốc</label>
              <Input 
                value={medicationInput.name} 
                onValueChange={(v)=>setMedicationInput({...medicationInput, name:v})} 
                variant="bordered"
                placeholder="Tên thuốc..."
                classNames={{
                  input: "font-medium text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-green-400 transition-colors"
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Liều lượng</label>
              <Input 
                value={medicationInput.dosage} 
                onValueChange={(v)=>setMedicationInput({...medicationInput, dosage:v})} 
                variant="bordered"
                placeholder="VD: 500mg"
                classNames={{
                  input: "font-medium text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-green-400 transition-colors"
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tần suất</label>
              <Input 
                value={medicationInput.frequency} 
                onValueChange={(v)=>setMedicationInput({...medicationInput, frequency:v})} 
                variant="bordered"
                placeholder="VD: 2 lần/ngày"
                classNames={{
                  input: "font-medium text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-green-400 transition-colors"
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Thời gian</label>
              <Input 
                value={medicationInput.duration} 
                onValueChange={(v)=>setMedicationInput({...medicationInput, duration:v})} 
                variant="bordered"
                placeholder="VD: 7 ngày"
                classNames={{
                  input: "font-medium text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-green-400 transition-colors"
                }}
              />
            </div>
          </div>
          <Button 
            color="success" 
            variant="flat" 
            onClick={addMedication}
            className="font-medium w-full md:w-auto"
            startContent={<Plus size={18} />}
          >
            Thêm thuốc vào đơn
          </Button>
          
          {record.prescriptions.length > 0 && (
            <div className="space-y-3 mt-4">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">Danh sách thuốc đã thêm</label>
              <div className="space-y-2">
                {record.prescriptions.map((m,i)=>(
                  <div 
                    key={i} 
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1">{m.name}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          {m.dosage && <span className="flex items-center gap-1"><Pill size={14} /> {m.dosage}</span>}
                          {m.frequency && <span className="flex items-center gap-1"><Clock size={14} /> {m.frequency}</span>}
                          {m.duration && <span className="flex items-center gap-1"><Calendar size={14} /> {m.duration}</span>}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="light" 
                        color="danger" 
                        isIconOnly 
                        onClick={()=>removeMedication(i)}
                        className="ml-2"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* AI Summary - Section 4 */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Tóm tắt AI</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Button
              color="secondary"
              variant="flat"
              onClick={generateAISummary}
              isLoading={isGeneratingSummary}
              startContent={isGeneratingSummary ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              className="font-medium"
            >
              {isGeneratingSummary ? "Đang tạo tóm tắt..." : "Tạo tóm tắt"}
            </Button>
            {hasAiSummary && (
              <Button
                variant="light"
                color="danger"
                onClick={() => {
                  setAiSummary("");
                  setHasAiSummary(false);
                  
                  // Xóa phần "Tóm tắt của AI:" trong notes
                  const currentNotes = record.notes || "";
                  if (currentNotes.includes("Tóm tắt của AI:")) {
                    const parts = currentNotes.split("Tóm tắt của AI:");
                    const beforeAI = parts[0].trim();
                    setRecord(prev => ({
                      ...prev,
                      notes: beforeAI
                    }));
                  }
                }}
                className="font-medium"
              >
                Xóa tóm tắt
              </Button>
            )}
          </div>
          {hasAiSummary && (
            <div className="space-y-2">
              <Textarea
                placeholder="Tóm tắt AI sẽ xuất hiện ở đây..."
                value={aiSummary}
                onValueChange={setAiSummary}
                variant="bordered"
                minRows={4}
                classNames={{
                  input: "font-medium text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-indigo-400 transition-colors"
                }}
              />
              <p className="text-xs text-gray-500 italic">*Thông tin từ AI chỉ mang tính chất tham khảo.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Ghi chú - Section 5 */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Ghi chú</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6">
          <Textarea 
            placeholder="Ghi chú thêm về tình trạng bệnh nhân, hướng điều trị, tái khám..." 
            value={record.notes} 
            onValueChange={(v)=>setRecord({...record, notes:v})} 
            variant="bordered" 
            minRows={4}
            classNames={{
              input: "font-medium text-gray-900",
              inputWrapper: "border-gray-300 hover:border-purple-400 transition-colors"
            }}
          />
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button 
          variant="bordered" 
          onClick={()=>router.push("/bac-si/kham-offline")}
          className="font-medium"
          size="lg"
        >
          Hủy
        </Button>
        <Button 
          color="primary" 
          startContent={<Save size={18}/>} 
          onClick={handleSave} 
          isLoading={saving}
          className="font-medium"
          size="lg"
        >
          Lưu & Hoàn thành lịch hẹn
        </Button>
      </div>
    </div>
  );

  return (
    <DoctorFrame title={`Khám offline ca ${appointmentId || ""}`}>
      <ToastNotification toast={toast} />
      <Grid leftChildren={leftChildren} rightChildren={rightChildren} />
      
      {/* Confirm Modal for AI Summary */}
      <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent className="max-h-[90vh]">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={20} />
              <span>Xác nhận lưu với tóm tắt AI</span>
            </div>
          </ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <p className="text-gray-700">
              Bạn đã sử dụng tóm tắt được tạo bởi AI. Vui lòng xác nhận rằng bạn đã đọc kỹ và kiểm tra nội dung tóm tắt này trước khi lưu.
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto">
              <p className="text-sm font-semibold text-gray-700 mb-2">Nội dung tóm tắt AI:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{aiSummary}</p>
            </div>
            <p className="text-xs text-gray-500 italic mt-3">*Thông tin từ AI chỉ mang tính chất tham khảo.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onConfirmOpenChange}>
              Hủy
            </Button>
            <Button
              color="primary"
              onPress={() => {
                onConfirmOpenChange();
                performSave();
              }}
            >
              Đã đọc kỹ, xác nhận lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DoctorFrame>
  );
}


