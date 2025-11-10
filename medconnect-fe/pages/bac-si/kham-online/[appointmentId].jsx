"use client";

import { useRef, useEffect, useState } from "react";
import { Button, Card, CardHeader, CardBody, Avatar, Input, Divider, Chip, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Maximize2, MessageSquare, User, Calendar, Clock, Phone, Mail, MapPin, FileText, Camera, Send, Search, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/router";
import { parseReason, formatReasonForDisplay } from "@/utils/appointmentUtils";
import { auth } from "@/lib/firebase";
import dynamic from "next/dynamic";
import { subscribeRoomMessages, sendChatMessage, setPresence, cleanupRoomIfEmpty } from "@/services/chatService";
import { v4 as uuidv4 } from 'uuid';

const AgoraVideoCall = dynamic(() => import("@/components/ui/AgoraVideoCall"), { ssr: false });

export default function DoctorOnlineExamRoom() {
  const router = useRouter();
  const { appointmentId } = router.query;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'emr'
  const [unread, setUnread] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const { isOpen: isPatientInfoOpen, onOpen: onPatientInfoOpen, onOpenChange: onPatientInfoOpenChange } = useDisclosure();
  const [agoraToken, setAgoraToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [agoraUid, setAgoraUid] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const n = window.crypto.getRandomValues(new Uint32Array(1))[0];
        return String(n);
      }
      return String(Math.floor(Math.random() * 1000000));
    } catch {
      return String(Math.floor(Math.random() * 1000000));
    }
  });
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // EMR compact UI (similar style to test form) - keep hooks at top level
  const [emr, setEmr] = useState({ 
    chief_complaint: "", 
    diagnosis_primary: "", 
    secondary: [], 
    icd_codes: [], 
    notes: "", 
    vital_signs: { temperature:"", blood_pressure:"", heart_rate:"", oxygen_saturation:"", weight:"", height:"" }, 
    prescriptions: [] 
  });
  const [icdQuery, setIcdQuery] = useState("");
  const [icdResults, setIcdResults] = useState([]);
  const [icdLoading, setIcdLoading] = useState(false);
  const [icdError,   setIcdError]   = useState("");
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState("");
  const [medicationInput, setMedicationInput] = useState({ name: "", dosage: "", frequency: "", duration: "" });
  const draftKey = typeof window !== 'undefined' && appointmentId ? `emr_draft_${appointmentId}` : null;
  // EMR profile in modal (hooks must be before any early returns)
  const [emrEntries, setEmrEntries] = useState([]);
  const [emrLoading, setEmrLoading] = useState(false);
  const [emrError, setEmrError] = useState("");

  // refs video call
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!appointmentId) return;
    fetchAppointmentDetails();
    // Chỉ subscribe Firestore sau khi user đã đăng nhập để tránh lỗi PERMISSION
    let unsubFS = null;
    const stopAuth = auth.onAuthStateChanged((u) => {
      if (u && !unsubFS) {
        unsubFS = subscribeRoomMessages(appointmentId, (items)=>{
          // count unread when not on chat tab and message from patient
          const last = items[items.length - 1];
          if (last && last.senderRole === 'patient' && activeTab !== 'chat') {
            setUnread((c)=>c+1);
          }
          setChatMessages(items);
        });
      }
    });
    return () => {
      stopAuth && stopAuth();
      unsubFS && unsubFS();
    };
  }, [appointmentId]);

  // Presence: bác sĩ online khi phòng đang ONGOING; rời sẽ cleanup nếu cả 2 out
  useEffect(() => {
    if (!appointmentId) return;
    if (appointment && appointment.status === 'ONGOING') {
      setPresence(appointmentId, 'doctor', true);
      return () => {
        setPresence(appointmentId, 'doctor', false);
        cleanupRoomIfEmpty(appointmentId);
      };
    }
  }, [appointmentId, appointment?.status]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Load draft when available
  useEffect(() => {
    try {
      if (draftKey) {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Normalize draft to ensure all fields are correct types
          setEmr(prev => ({
            ...prev,
            ...parsed,
            secondary: Array.isArray(parsed.secondary) ? parsed.secondary : [],
            icd_codes: Array.isArray(parsed.icd_codes) ? parsed.icd_codes : [],
            prescriptions: Array.isArray(parsed.prescriptions) ? parsed.prescriptions : [],
            vital_signs: parsed.vital_signs && typeof parsed.vital_signs === 'object' ? parsed.vital_signs : { temperature:"", blood_pressure:"", heart_rate:"", oxygen_saturation:"", weight:"", height:"" }
          }));
        }
      }
    } catch {}
    // eslint-disable-next-line
  }, [draftKey]);

  const saveEmrDraft = () => {
    try { if (draftKey) localStorage.setItem(draftKey, JSON.stringify(emr)); } catch {}
  };

  // ICD-10 search effect (must be before any early returns)
  useEffect(() => {
    if (!icdQuery || icdQuery.trim().length < 2) { setIcdResults([]); setIcdLoading(false); setIcdError(""); return; }
    const t = setTimeout(async () => {
      try {
        setIcdLoading(true); setIcdError("");
        const query = icdQuery.trim().toUpperCase();
        // Check if query looks like ICD-10 code pattern (e.g., A19, A19.0, A19.9, A19.90)
        const isCodePattern = /^[A-Z][0-9][0-9](\.[0-9]+)*$/i.test(query);
        
        let results = [];
        
        if (isCodePattern) {
          // For code search, extract base code (e.g., A19 from A19.0)
          const baseCode = query.split('.')[0]; // Get A19 from A19.0
          
          // Strategy 1: Search with base code (e.g., "A19")
          try {
            const resp1 = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(baseCode)}&maxList=100`);
            if (resp1.ok) {
              const data1 = await resp1.json();
              const codes1 = data1?.[2] || [];
              const names1 = data1?.[3] || [];
              console.log('[ICD-10] Base search:', baseCode, 'got', codes1.length, 'results');
              // Filter to show codes starting with baseCode (case-insensitive)
              results = codes1.map((c, i) => ({ code: String(c || ''), name: String(names1[i] || '') }))
                .filter(r => r.code && r.code.toUpperCase().startsWith(baseCode.toUpperCase()));
              console.log('[ICD-10] Filtered results:', results.length);
            }
          } catch (e) {
            console.error('[ICD-10] Base search error:', e);
          }
          
          // Strategy 2: If no results, try searching code field only
          if (results.length === 0) {
            try {
              const resp2 = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code&terms=${encodeURIComponent(baseCode)}&maxList=100`);
              if (resp2.ok) {
                const data2 = await resp2.json();
                const codes2 = data2?.[2] || [];
                const names2 = data2?.[3] || [];
                console.log('[ICD-10] Code-only search:', codes2.length, 'results');
                results = codes2.map((c, i) => ({ code: String(c || ''), name: String(names2[i] || '') }))
                  .filter(r => r.code && r.code.toUpperCase().startsWith(baseCode.toUpperCase()));
              }
            } catch (e) {
              console.error('[ICD-10] Code-only search error:', e);
            }
          }
          
          // Strategy 3: Try exact match
          if (results.length === 0 && query.includes('.')) {
            try {
              const resp3 = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}&maxList=30`);
              if (resp3.ok) {
                const data3 = await resp3.json();
                const codes3 = data3?.[2] || [];
                const names3 = data3?.[3] || [];
                results = codes3.map((c, i) => ({ code: String(c || ''), name: String(names3[i] || '') }));
              }
            } catch (e) {
              console.error('[ICD-10] Exact match error:', e);
            }
          }
        } else {
          // For text search, use normal search
          try {
            const resp = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}&maxList=20`);
            if (resp.ok) {
              const data = await resp.json();
              const codes = data?.[2] || [];
              const names = data?.[3] || [];
              results = codes.map((c, i) => ({ code: String(c || ''), name: String(names[i] || '') }));
            }
          } catch (e) {
            console.error('[ICD-10] Text search error:', e);
          }
        }
        
        setIcdResults(results);
      } catch (e) {
        console.error('[ICD-10] Search error:', e);
        setIcdResults([]);
        setIcdError("Không lấy được gợi ý");
      } finally {
        setIcdLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [icdQuery]);

  // EMR fetch effect (must be before any early returns)
  useEffect(() => {
    const fetchEmr = async () => {
      try {
        if (!isPatientInfoOpen || !appointment) {
          console.log('[EMR] Modal not open or no appointment');
          return;
        }
        setEmrLoading(true); setEmrError("");
        const user = auth.currentUser; if (!user) return;
        const token = await user.getIdToken();
        
        // Try multiple strategies: first by appointment, then by patient
        let data = [];
        
        // Strategy 1: Fetch by appointment ID
        try {
          const appointmentUrl = `http://localhost:8080/api/medical-records/appointment/${appointmentId}`;
          console.log('[EMR] Trying appointment endpoint:', appointmentUrl);
          const appointmentRes = await fetch(appointmentUrl, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (appointmentRes.ok) {
            const appointmentData = await appointmentRes.json();
            console.log('[EMR] Appointment endpoint response:', appointmentData);
            // If single object, wrap in array
            if (appointmentData && !Array.isArray(appointmentData)) {
              data = [appointmentData];
            } else if (Array.isArray(appointmentData)) {
              data = appointmentData;
            }
          }
        } catch (e) {
          console.log('[EMR] Appointment endpoint failed, trying patient endpoint:', e);
        }
        
        // Strategy 2: If no data from appointment, try patient endpoint
        if (data.length === 0) {
          const patientUserId = appointment?.patientUserId ?? appointment?.patientId ?? appointment?.patient?.id ?? appointment?.patient?.userId ?? null;
          console.log('[EMR] Fetching for patientUserId:', patientUserId);
          if (patientUserId) {
            const patientUrl = `http://localhost:8080/api/medical-records/patient/${patientUserId}/entries`;
            console.log('[EMR] Trying patient endpoint:', patientUrl);
            const patientRes = await fetch(patientUrl, {
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (patientRes.ok) {
              const patientData = await patientRes.json();
              console.log('[EMR] Patient endpoint response:', patientData);
              data = Array.isArray(patientData) ? patientData : [];
            } else if (patientRes.status === 404) {
              console.log('[EMR] No record found (404)');
              data = [];
            } else {
              throw new Error(`HTTP ${patientRes.status}`);
            }
          }
        }
        
        console.log('[EMR] Final entries:', data);
        setEmrEntries(data);
      } catch (e) {
        console.error('[EMR] Fetch error:', e);
        setEmrEntries([]);
        setEmrError('Không tải được hồ sơ bệnh án');
      } finally {
        setEmrLoading(false);
      }
    };
    fetchEmr();
    // eslint-disable-next-line
  }, [isPatientInfoOpen, appointment, appointmentId]);

  useEffect(() => {
    if (!appointmentId || !agoraUid) return;
      const fetchToken = async () => {
        try {
          const tokenResp = await fetch(
          `http://localhost:8080/api/agora/token?channel=${appointmentId}&uid=${agoraUid}`
          );
        if (tokenResp.ok) {
          const data = await tokenResp.json();
          setAgoraToken(data.token);
            setTokenError("");
        } else {
          console.warn('[Doctor] Failed to fetch Agora token:', tokenResp.status);
          setAgoraToken("");
            setTokenError(`Không lấy được token (HTTP ${tokenResp.status})`);
        }
        } catch (e) {
          console.error('[Doctor] Error fetching Agora token:', e);
          setAgoraToken("");
          setTokenError('Không lấy được token. Vui lòng thử lại');
        }
      };
      fetchToken();
  }, [appointmentId, agoraUid]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
        setChatMessages([
          {
            id: 1,
            sender: 'patient',
            message: 'Xin chào bác sĩ, tôi đã sẵn sàng cho cuộc khám.',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (total) => {
    const mm = String(Math.floor(total / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleSendMessage = async () => {
    const text = chatMessage.trim();
    if (!text) return;
    setChatMessage("");
    const user = auth.currentUser;
    if (text) {
    await sendChatMessage(appointmentId, {
      senderId: user?.uid,
      senderName: user?.displayName || "Bác sĩ",
      senderRole: "doctor",
      text,
    });
    }
  };

  const handleStartAppointment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/start`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setAppointment(prev => ({ ...prev, status: 'ONGOING' }));
      }
    } catch (error) {
      console.error("Failed to start appointment:", error);
    }
  };

  const handleEndAppointment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      // Persist EMR draft before finishing (best-effort)
      try {
        const raw = draftKey ? localStorage.getItem(draftKey) : null;
        const draft = raw ? JSON.parse(raw) : null;
        const patientUserId = appointment?.patientUserId ?? appointment?.patientId ?? null;
        if (draft && patientUserId) {
          const medicalEntry = {
            visit_id: `V${Date.now()}`,
            visit_date: new Date().toISOString().split('T')[0],
            visit_time: new Date().toTimeString().slice(0,5),
            visit_type: 'online',
            appointment_id: appointmentId, // Link to appointment
            doctor_name: user?.displayName || '',
            doctor_id: user?.uid || '',
            chief_complaint: draft.chief_complaint || '',
            diagnosis: { primary: draft.diagnosis_primary || '', icd_codes: draft.icd_codes || [], secondary: draft.secondary || [] },
            vital_signs: draft.vital_signs || {},
            prescriptions: draft.prescriptions || [],
            notes: draft.notes || ''
          };
          await fetch(`http://localhost:8080/api/medical-records/patient/${patientUserId}/add-entry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ entry: medicalEntry })
          });
          if (draftKey) localStorage.removeItem(draftKey);
        }
      } catch {}
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/finish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setAppointment(prev => ({ ...prev, status: 'FINISHED' }));
        router.push('/bac-si/kham-online');
      }
    } catch (error) {
      console.error("Failed to end appointment:", error);
    }
  };

  if (loading) return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải phòng khám...</p>
      </div>
    </div>
  );

  if (!appointment) return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Không tìm thấy cuộc hẹn</p>
        <Button color="primary" onPress={() => router.push('/bac-si/kham-online')}>Quay lại danh sách</Button>
      </div>
    </div>
  );

  if (appointment.status !== 'ONGOING') return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {appointment.status === 'CONFIRMED' ? (
          <Button color="success" onClick={handleStartAppointment} className="font-semibold">Bắt đầu khám online</Button>
        ) : (
          <p className="text-gray-600 mb-4">Chờ bệnh nhân xác nhận hoặc đã khám xong!</p>
        )}
        <Button color="default" onClick={() => router.push('/bac-si/kham-online')} className="mt-4">Quay lại</Button>
      </div>
    </div>
  );

  // Parse reason safely - handle both object and string formats
  const reasonData = parseReason(appointment.reason);
  const reasonText = reasonData?.reasonText ? String(reasonData.reasonText) : '';
  const attachments = Array.isArray(reasonData?.attachments) ? reasonData.attachments : [];
  console.log('[Appointment] reason:', appointment.reason, 'parsed:', { reasonText, attachments });
  
  // Derive names/avatars for header (doctor view)
  const selfName = auth.currentUser?.displayName || appointment?.doctorName || 'Bác sĩ';
  const selfAvatar = auth.currentUser?.photoURL || appointment?.doctorAvatar || undefined;
  const partnerName = appointment?.patientName || appointment?.patient?.name || appointment?.patient?.fullName || 'Bệnh nhân';
  const partnerAvatar = appointment?.patientAvatar || appointment?.patient?.avatar || appointment?.patient?.photoUrl || undefined;

  // Patient info modal: robust fallbacks
  const patientPhone = appointment?.patientPhone || appointment?.patient?.phone || appointment?.patient?.phoneNumber || '';
  const patientEmail = appointment?.patientEmail || appointment?.patient?.email || '';
  const apptDateObj = appointment?.appointmentDate ? new Date(appointment.appointmentDate) : (appointment?.date ? new Date(appointment.date) : null);
  const apptDateStr = apptDateObj && !isNaN(apptDateObj.getTime()) ? apptDateObj.toLocaleDateString('vi-VN') : '—';
  const apptTimeStr = apptDateObj && !isNaN(apptDateObj.getTime()) ? apptDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : (appointment?.appointmentTime || appointment?.time || '—');

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        {/* Video Area - Full width */}
        <div className="flex-1 min-w-0 relative bg-black">
          {/* Remote video fill area */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div ref={remoteVideoRef} className="w-full h-full" />
            {/* Nếu partner chưa vào (remote chưa có stream) thì hiện thông báo */}
            {!hasRemoteVideo && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                {remoteConnected ? (
                  <span className="bg-black bg-opacity-60 px-5 py-2 rounded-xl text-white text-lg font-medium">Bệnh nhân đang tắt camera</span>
                ) : (
                  <span className="bg-black bg-opacity-60 px-5 py-2 rounded-xl text-white text-lg font-medium">Đang đợi kết nối với Bệnh nhân</span>
                )}
              </div>
            )}
          </div>

          {/* Local preview nhỏ góc phải giống patient */}
          <div className="absolute right-5 top-5 w-56 aspect-video rounded-xl bg-gray-800/70 ring-1 ring-white/15 flex items-center justify-center text-white/70 text-xs select-none">
            <div ref={localVideoRef} className="absolute inset-0 rounded-xl overflow-hidden" />
            <span className="absolute bottom-2 left-2 text-xs text-white/70">Doctor preview</span>
            {muted && <MicOff className="absolute top-2 right-2 text-red-400 w-6 h-6" />}
            {camOff && <VideoOff className="absolute top-2 right-10 text-red-400 w-6 h-6" />}
          </div>

          {/* Top bar giống bệnh nhân */}
          <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3">
              <Chip color="primary" variant="bordered" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900">Phiên khám online • Bác sĩ</Chip>
              <Chip variant="bordered" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900">{formatTime(seconds)}</Chip>
              <Button size="md" variant="bordered" color="primary" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900" onPress={onPatientInfoOpen} startContent={<User size={18} />}>Thông tin bệnh nhân</Button>
              <div className="ml-2 bg-white/50 backdrop-blur-md rounded-full p-1 border border-white/30 shadow-lg">
                <button className={`px-4 py-1.5 text-sm rounded-full font-semibold transition-all ${activeTab==='chat'?'bg-primary/90 text-white shadow-md':'text-gray-900 bg-white/40'}`} onClick={()=>{setActiveTab('chat'); setUnread(0);}}>Chat {unread>0 && <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-semibold bg-red-600 text-white rounded-full">{unread}</span>}</button>
                <button className={`ml-1 px-4 py-1.5 text-sm rounded-full font-semibold transition-all ${activeTab==='emr'?'bg-primary/90 text-white shadow-md':'text-gray-900 bg-white/40'}`} onClick={()=>setActiveTab('emr')}>Ghi khám</button>
              </div>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto pr-2">
              <Button size="md" variant="bordered" color="primary" className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg font-semibold text-gray-900" startContent={<Maximize2 size={18} />} onPress={toggleFullscreen}>Toàn màn hình</Button>
            </div>
          </div>
          {tokenError && (
            <div className="absolute left-0 right-0 top-16 px-4 flex justify-center z-20">
              <div className="bg-red-600 text-white text-sm px-3 py-2 rounded-md shadow">{tokenError}</div>
            </div>
          )}
          {/* Controls bottom - thêm nút mute/tắt video */}
          <div className="absolute left-0 right-0 bottom-0 pb-6 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md rounded-full px-4 py-3 border border-white/30 shadow-lg">
              <Button isIconOnly variant="bordered" color={muted ? "warning" : "default"} onPress={()=>setMuted(v => !v)} className="bg-white/40 border border-white/30 shadow-md" title={muted?"Bật mic":"Tắt mic"}>{muted ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}</Button>
              <Button isIconOnly variant="bordered" color={camOff ? "warning" : "default"} onPress={()=>setCamOff(v => !v)} className="bg-white/40 border border-white/30 shadow-md" title={camOff?"Bật camera":"Tắt camera"}>{camOff ? <VideoOff className="w-5 h-5"/> : <Video className="w-5 h-5"/>}</Button>
              {/* Rời phòng - thay nút "Kết thúc khám" */}
              <Button color="danger" variant="bordered" onPress={()=>router.push('/bac-si/kham-online')} className="bg-red-500/80 backdrop-blur-md border border-red-300/30 shadow-lg font-semibold ml-6 text-white">Rời phòng</Button>
            </div>
          </div>
          {/* Controls - glassy, có thể dùng lại hoặc customize thêm */}
        </div>

        {/* Right: Chat panel (4/12 width) */}
        <div className="w-[420px] h-full bg-gray-50 flex flex-col">
          {activeTab==='chat' ? (
            <>
            {/* Header trạng thái kết nối + avatar bệnh nhân */}
            <div className="p-4 flex items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Avatar src={partnerAvatar} name={partnerName} size="sm"/>
                <div className="flex flex-col">
                  <p className="font-semibold">{partnerName}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`inline-block w-2 h-2 rounded-full ${remoteConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-gray-600">{remoteConnected ? 'Đã kết nối' : 'Đang kết nối…'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderRole === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl ${msg.senderRole === 'doctor' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} px-4 py-2.5`}>
                    <div className="text-sm whitespace-pre-wrap break-words">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 flex gap-2 items-center bg-gray-50/50">
              <Input 
                placeholder="Nhập tin nhắn…" 
                className="flex-1"
                variant="flat"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button color="primary" onPress={handleSendMessage}><Send size={16} /></Button>
            </div>
            <div className="w-full px-4 py-3 bg-gray-50/50 flex justify-end"><Button color="danger" onPress={handleEndAppointment} className="font-semibold">Kết thúc khám</Button></div>
            </>
          ) : (
            <div className="flex-1 h-full overflow-y-auto bg-white">
              <div className="p-6 space-y-8">
                {/* Ghi chú đưa lên đầu, rộng hơn */}
                <Textarea
                  label="Ghi chú phiên khám"
                  placeholder="Ghi chú tổng quan, tóm tắt triệu chứng, diễn biến..."
                  value={emr.notes}
                  onValueChange={(v)=>setEmr(prev=>({...prev, notes: v}))}
                  variant="bordered"
                  minRows={10}
                  labelPlacement="outside"
                />
                <div className="grid grid-cols-1 gap-3">
                  <Input
                    label="Lý do khám"
                    placeholder="VD: Đau đầu, ho, sốt..."
                    value={emr.chief_complaint}
                    onValueChange={(v)=>setEmr(prev=>({...prev, chief_complaint: v}))}
                    variant="bordered"
                    labelPlacement="outside"
                  />
                  <Input
                    label="Chẩn đoán chính"
                    placeholder="VD: Viêm họng cấp"
                    value={emr.diagnosis_primary}
                    onValueChange={(v)=>setEmr(prev=>({...prev, diagnosis_primary: v}))}
                    variant="bordered"
                    labelPlacement="outside"
                  />
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tìm nhanh ICD-10</label>
                    <div className="relative">
                      <Input
                        placeholder="Gõ tên bệnh hoặc mã (≥2 ký tự)"
                        value={icdQuery}
                        onValueChange={setIcdQuery}
                        variant="bordered"
                      />
                      {(icdLoading || icdResults.length>0 || icdError) && (
                        <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-auto rounded-md border border-gray-200 bg-white z-10 shadow-sm">
                          {icdLoading && <div className="px-3 py-2 text-sm text-gray-500">Đang tải...</div>}
                          {!icdLoading && icdError && <div className="px-3 py-2 text-sm text-red-600">{icdError}</div>}
                          {!icdLoading && !icdError && icdResults.map((it, idx)=> (
                            <button key={idx} className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={()=>{ setEmr(prev=>({...prev, icd_codes:[...(Array.isArray(prev.icd_codes)?prev.icd_codes:[]), it.code]})); setIcdQuery(""); }}>
                              <span className="font-semibold mr-2">{it.code}</span>
                              <span className="text-gray-700">{it.name}</span>
                            </button>
                          ))}
                          {!icdLoading && !icdError && icdResults.length===0 && icdQuery.trim().length>=2 && (
                            <div className="px-3 py-2 text-sm text-gray-500">Không có gợi ý</div>
                          )}
                        </div>
                      )}
                    </div>
                    {emr.icd_codes.length>0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {emr.icd_codes.map((code, i)=> (
                          <Chip key={i} variant="flat" color="primary" onClose={()=>setEmr(prev=>({...prev, icd_codes: (Array.isArray(prev.icd_codes)?prev.icd_codes:[]).filter((_,idx)=>idx!==i)}))}>{code}</Chip>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Chẩn đoán phụ */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Chẩn đoán phụ</label>
                    <div className="flex gap-2">
                      <Input placeholder="VD: Viêm amidan" value={secondaryDiagnosis} onValueChange={setSecondaryDiagnosis} variant="bordered" />
                      <Button variant="flat" onPress={()=>{ if(secondaryDiagnosis.trim()){ setEmr(prev=>({...prev, secondary:[...(Array.isArray(prev.secondary)?prev.secondary:[]), secondaryDiagnosis.trim()]})); setSecondaryDiagnosis(""); } }}>Thêm</Button>
                    </div>
                    {emr.secondary?.length>0 && (
                      <div className="flex flex-wrap gap-2 mt-2">{emr.secondary.map((d,i)=>(<Chip key={i} onClose={()=>setEmr(prev=>({...prev, secondary: (Array.isArray(prev.secondary)?prev.secondary:[]).filter((_,idx)=>idx!==i)}))} variant="flat" color="secondary">{d}</Chip>))}</div>
                    )}
                  </div>
                </div>
                {/* Sinh hiệu tự đo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nhiệt độ (°C)" placeholder="VD: 37.5" value={emr.vital_signs?.temperature||""} onValueChange={(v)=>setEmr(prev=>({...prev, vital_signs:{...prev.vital_signs, temperature:v}}))} variant="bordered" labelPlacement="outside" />
                  <Input label="Huyết áp (mmHg)" placeholder="VD: 120/80" value={emr.vital_signs?.blood_pressure||""} onValueChange={(v)=>setEmr(prev=>({...prev, vital_signs:{...prev.vital_signs, blood_pressure:v}}))} variant="bordered" labelPlacement="outside" />
                  <Input label="Nhịp tim (bpm)" placeholder="VD: 72" value={emr.vital_signs?.heart_rate||""} onValueChange={(v)=>setEmr(prev=>({...prev, vital_signs:{...prev.vital_signs, heart_rate:v}}))} variant="bordered" labelPlacement="outside" />
                  <Input label="SpO2 (%)" placeholder="VD: 98" value={emr.vital_signs?.oxygen_saturation||""} onValueChange={(v)=>setEmr(prev=>({...prev, vital_signs:{...prev.vital_signs, oxygen_saturation:v}}))} variant="bordered" labelPlacement="outside" />
                  <Input label="Cân nặng (kg)" placeholder="VD: 65" value={emr.vital_signs?.weight||""} onValueChange={(v)=>setEmr(prev=>({...prev, vital_signs:{...prev.vital_signs, weight:v}}))} variant="bordered" labelPlacement="outside" />
                  <Input label="Chiều cao (cm)" placeholder="VD: 170" value={emr.vital_signs?.height||""} onValueChange={(v)=>setEmr(prev=>({...prev, vital_signs:{...prev.vital_signs, height:v}}))} variant="bordered" labelPlacement="outside" />
                </div>
                {/* Đơn thuốc */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Tên thuốc" placeholder="VD: Paracetamol" value={medicationInput.name} onValueChange={(v)=>setMedicationInput(prev=>({...prev, name:v}))} variant="bordered" />
                  <Input label="Liều lượng" placeholder="VD: 500mg" value={medicationInput.dosage} onValueChange={(v)=>setMedicationInput(prev=>({...prev, dosage:v}))} variant="bordered" />
                  <Input label="Tần suất" placeholder="VD: 3 lần/ngày" value={medicationInput.frequency} onValueChange={(v)=>setMedicationInput(prev=>({...prev, frequency:v}))} variant="bordered" />
                  <Input label="Thời gian" placeholder="VD: 5 ngày" value={medicationInput.duration} onValueChange={(v)=>setMedicationInput(prev=>({...prev, duration:v}))} variant="bordered" />
                  <div className="md:col-span-2"><Button variant="flat" onPress={()=>{ if(medicationInput.name.trim()){ setEmr(prev=>({...prev, prescriptions:[...(Array.isArray(prev.prescriptions)?prev.prescriptions:[]), medicationInput]})); setMedicationInput({ name:"", dosage:"", frequency:"", duration:"" }); } }}>Thêm thuốc</Button></div>
                  {emr.prescriptions?.length>0 && (
                    <div className="md:col-span-2 space-y-2">
                      {emr.prescriptions.map((m,i)=> (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                          <div className="text-sm text-gray-700">{m.name} • {m.dosage} • {m.frequency} • {m.duration}</div>
                          <Button size="sm" variant="light" color="danger" onPress={()=>setEmr(prev=>({...prev, prescriptions: (Array.isArray(prev.prescriptions)?prev.prescriptions:[]).filter((_,idx)=>idx!==i)}))}>Xóa</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                

                <div className="flex justify-end gap-2">
                  <Button variant="bordered" onPress={()=>{ setEmr({ chief_complaint:"", diagnosis_primary:"", secondary:[], icd_codes:[], notes:"", vital_signs:{ temperature:"", blood_pressure:"", heart_rate:"", oxygen_saturation:"", weight:"", height:"" }, prescriptions:[] }); }}>Xóa</Button>
                  <Button color="primary" onPress={saveEmrDraft}>Lưu tạm</Button>
                </div>
              </div>
            </div>
          )}
          </div>
      </div>
      {/* Patient Info Modal (vẫn giữ nguyên) */}
      <Modal isOpen={isPatientInfoOpen} onOpenChange={onPatientInfoOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1"><h3 className="text-lg font-semibold">Thông tin bệnh nhân</h3></ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar src={partnerAvatar} name={partnerName} size="lg" className="ring-2 ring-blue-100" />
                <div>
                  <h3 className="text-xl font-semibold">{partnerName}</h3>
                  <p className="text-gray-600">Bệnh nhân</p>
                </div>
              </div>
              <Divider />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{patientPhone || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{patientEmail || ""}</span>
                </div>
              </div>
              <Divider />
              <div className="space-y-3">
                <h4 className="font-semibold">Chi tiết cuộc hẹn</h4>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /><span className="text-sm">{apptDateStr}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /><span className="text-sm">{apptTimeStr}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /><span className="text-sm">Khám online</span></div>
              </div>
              <Divider />
              <div className="space-y-3">
                <h4 className="font-semibold">Hồ sơ bệnh án</h4>
                {emrLoading && <div className="text-sm text-gray-500">Đang tải hồ sơ…</div>}
                {!emrLoading && emrError && <div className="text-sm text-red-600">{emrError}</div>}
                {!emrLoading && !emrError && (
                  emrEntries.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {emrEntries.map((e, idx) => {
                        // Parse diagnosis from various possible structures
                        const diagnosis = e?.assessment_plan?.final_diagnosis || e?.diagnosis || [];
                        const primaryDiag = Array.isArray(diagnosis) && diagnosis.length > 0 
                          ? (diagnosis[0]?.text || diagnosis[0]?.primary || diagnosis[0]) 
                          : (typeof diagnosis === 'string' ? diagnosis : null);
                        const diagText = primaryDiag || e?.chief_complaint || e?.reason_for_visit || 'Chưa có chẩn đoán';
                        
                        // Get ICD codes
                        const icdCodes = Array.isArray(diagnosis) 
                          ? diagnosis.map(d => d?.icd10 || d?.code || d).filter(Boolean)
                          : (e?.icd_codes || []);
                        
                        // Get secondary diagnosis
                        const secondaryDiag = e?.diagnosis?.secondary || e?.secondary || [];
                        
                        // Get prescriptions
                        const prescriptions = e?.prescriptions || e?.medications || [];
                        
                        // Get vital signs
                        const vitalSigns = e?.vital_signs || {};
                        
                        // Get notes
                        const notes = e?.notes || e?.note || '';
                        
                        // Get date
                        const date = e?.encounter?.started_at || e?.visit_date || e?.date || e?.visit_id?.replace('V', '');
                        const dateStr = date ? (isNaN(Date.parse(date)) ? date : new Date(date).toLocaleDateString('vi-VN')) : '';
                        
                        return (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                            {dateStr && (
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{dateStr}</div>
                            )}
                            
                            {/* Diagnosis */}
                            <div>
                              <div className="text-sm font-semibold text-gray-900 mb-1">Chẩn đoán</div>
                              <div className="text-sm text-gray-700">{diagText}</div>
                              {icdCodes.length > 0 && (
                                <div className="text-xs text-gray-600 mt-1">ICD-10: {icdCodes.join(', ')}</div>
                              )}
                              {secondaryDiag.length > 0 && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Chẩn đoán phụ: {secondaryDiag.map(d => typeof d === 'string' ? d : d?.text || d).join(', ')}
                                </div>
                              )}
                            </div>
                            
                            {/* Vital Signs */}
                            {Object.keys(vitalSigns).length > 0 && (
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">Dấu hiệu sinh tồn</div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                  {vitalSigns.temperature && <div>Nhiệt độ: {vitalSigns.temperature} °C</div>}
                                  {vitalSigns.blood_pressure && <div>Huyết áp: {vitalSigns.blood_pressure} mmHg</div>}
                                  {vitalSigns.heart_rate && <div>Nhịp tim: {vitalSigns.heart_rate} bpm</div>}
                                  {vitalSigns.oxygen_saturation && <div>SpO2: {vitalSigns.oxygen_saturation} %</div>}
                                  {vitalSigns.weight && <div>Cân nặng: {vitalSigns.weight} kg</div>}
                                  {vitalSigns.height && <div>Chiều cao: {vitalSigns.height} cm</div>}
                                </div>
                              </div>
                            )}
                            
                            {/* Prescriptions */}
                            {prescriptions.length > 0 && (
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">Đơn thuốc</div>
                                <div className="space-y-2">
                                  {prescriptions.map((med, medIdx) => (
                                    <div key={medIdx} className="text-xs text-gray-700 border-l-2 border-blue-300 pl-2 py-1">
                                      <div className="font-medium">{med.name || med.medication_name}</div>
                                      {med.dosage && <div>Liều lượng: {med.dosage}</div>}
                                      {med.frequency && <div>Tần suất: {med.frequency}</div>}
                                      {med.duration && <div>Thời gian: {med.duration}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Notes */}
                            {notes && (
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">Ghi chú</div>
                                <div className="text-xs text-gray-700 whitespace-pre-line">{notes}</div>
                              </div>
                            )}
                            
                            {/* Reason for visit */}
                            {e?.reason_for_visit && e.reason_for_visit !== diagText && (
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">Lý do khám</div>
                                <div className="text-xs text-gray-700">{e.reason_for_visit}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Chưa có hồ sơ</div>
                  )
                )}
              </div>
              <Divider />
              <div className="space-y-3">
                <h4 className="font-semibold">Lý do khám</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{formatReasonForDisplay(appointment.reason)}</p>
                {attachments && attachments.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Hình ảnh đính kèm</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="relative group">
                          <img src={attachment} alt={`Attachment ${index + 1}`} className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(attachment, '_blank')} />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all"><Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onPatientInfoOpenChange}>Đóng</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Agora logic inject video + audio vào UI layout này */}
      <AgoraVideoCall
        channel={appointmentId}
        token={agoraToken}
        uid={agoraUid}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        muted={muted}
        camOff={camOff}
        onRemoteVideoChange={setHasRemoteVideo}
        onRemotePresenceChange={setRemoteConnected}
        autoJoin={!!agoraToken}
      />
    </div>
  );
}
