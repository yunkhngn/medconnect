# Hướng dẫn Tư vấn qua Video Call - MedConnect

## 1. Giới thiệu

MedConnect cung cấp tính năng tư vấn y tế từ xa qua video call chất lượng cao, sử dụng công nghệ Agora RTC với khả năng ghi âm và tóm tắt cuộc trò chuyện bằng AI.

## 2. Công nghệ sử dụng

### Video Call Platform
- **Agora RTC**: Nền tảng video call chuyên nghiệp
- **Chất lượng**: HD 1080p, độ trễ thấp < 300ms
- **Bảo mật**: Mã hóa end-to-end (AES-256)
- **Băng thông yêu cầu**: 
  - Bệnh nhân: Tối thiểu 2 Mbps
  - Bác sĩ: Tối thiểu 5 Mbps

### Audio Recording
- **Agora Cloud Recording**: Ghi âm streaming tự động
- **Format**: MP3 (128 kbps) hoặc WAV
- **Chất lượng**: 16 kHz, mono/stereo
- **Dung lượng**: ~1 MB/phút (MP3)

### AI Processing
- **Speech-to-Text**: Google Cloud Speech-to-Text / OpenAI Whisper
- **Summarization**: Google Gemini AI
- **Ngôn ngữ**: Tiếng Việt + thuật ngữ y khoa

## 3. Quy trình Video Consultation

### Bước 1: Chuẩn bị
**Bệnh nhân:**
- Kiểm tra camera, microphone
- Kết nối internet ổn định
- Môi trường yên tĩnh, ánh sáng đủ
- Chuẩn bị hồ sơ/xét nghiệm (nếu có)

**Bác sĩ:**
- Camera HD, microphone chất lượng cao
- Kết nối internet tốc độ cao
- Phòng khám/văn phòng riêng tư
- Review hồ sơ bệnh nhân trước

### Bước 2: Đồng ý Ghi âm
- Trước khi bắt đầu, hệ thống sẽ hiển thị thông báo:
  ```
  "Cuộc tư vấn này sẽ được GHI ÂM để tạo hồ sơ bệnh án tự động.
   Audio sẽ được chuyển thành văn bản và tóm tắt bằng AI.
   File ghi âm sẽ được xóa sau 7 ngày.
   
   Bạn có đồng ý không?"
   [Đồng ý] [Không đồng ý]
  ```
- **CẢ HAI BÊN** phải đồng ý mới bắt đầu ghi âm
- Nếu không đồng ý: Video call vẫn diễn ra, nhưng bác sĩ phải ghi chép thủ công

### Bước 3: Tham gia Video Call
**Bệnh nhân:**
1. Đúng giờ hẹn, vào "Lịch hẹn của tôi"
2. Click "Tham gia cuộc gọi"
3. Cho phép truy cập camera, microphone
4. Chờ bác sĩ vào phòng

**Bác sĩ:**
1. Vào "Lịch hẹn" > "Bắt đầu tư vấn"
2. Hệ thống tự động kết nối với bệnh nhân
3. Kiểm tra audio, video

### Bước 4: Trong cuộc gọi
**Tính năng:**
- Bật/tắt camera
- Bật/tắt microphone
- Chia sẻ màn hình (bác sĩ)
- Chat văn bản
- Đèn báo "Đang ghi âm"

**Lưu ý:**
- Nói rõ ràng, tránh nói chồng lên nhau
- Đề cập đầy đủ: Triệu chứng, Chẩn đoán, Đơn thuốc, Lời dặn
- Thời gian khuyến nghị: 15-30 phút

### Bước 5: Kết thúc
1. Bác sĩ hoặc bệnh nhân click "Kết thúc cuộc gọi"
2. Hệ thống dừng ghi âm
3. Audio file được upload lên server
4. Quá trình xử lý AI bắt đầu

## 4. Quy trình Xử lý Audio → Medical Record

### Step 1: Cloud Recording (Tự động)
- Agora Cloud Recording ghi âm trong suốt cuộc gọi
- File được lưu tạm trên Agora Cloud
- Sau khi kết thúc, tự động download về MedConnect backend
- **Thời gian**: 1-3 phút

### Step 2: Speech-to-Text Transcription (Tự động)
**Công nghệ:**
- Google Cloud Speech-to-Text (primary)
- OpenAI Whisper API (fallback)

**Xử lý:**
```
Audio (MP3) → API → Transcript (Text)
```

**Ví dụ Transcript:**
```
[00:12] Bác sĩ: Chào chị, hôm nay chị có triệu chứng gì?
[00:18] Bệnh nhân: Em bị đau bụng vùng thượng vị 2 ngày nay.
[00:25] Bác sĩ: Đau nhiều không? Có buồn nôn không?
[00:30] Bệnh nhân: Có ạ, đau dữ lắm, nôn ra 2 lần.
[00:40] Bác sĩ: Chị có ăn gì lạ không? Đau trước hay sau bữa ăn?
[00:48] Bệnh nhân: Sau bữa ăn là đau nhiều ạ.
[01:05] Bác sĩ: Để tôi khám... Có vẻ viêm loét dạ dày. Tôi kê đơn thuốc...
```

**Thời gian**: 5-10 phút (tùy độ dài)

### Step 3: AI Summarization với Gemini (Tự động)
**Prompt Template:**
```
Bạn là bác sĩ chuyên khoa. Hãy phân tích transcript cuộc tư vấn y tế sau 
và tạo bản tóm tắt hồ sơ bệnh án theo format chuẩn:

[TRANSCRIPT]
{transcript_text}
[/TRANSCRIPT]

Yêu cầu:
1. Trích xuất TRIỆU CHỨNG CHÍNH (Chief Complaint)
2. Liệt kê TẤT CẢ TRIỆU CHỨNG (Symptoms) với thuật ngữ y khoa
3. CHẨN ĐOÁN (Diagnosis) - bằng tiếng Việt + ICD-10
4. ĐƠN THUỐC (Prescription) - tên thuốc, liều dùng, thời gian
5. LỜI DẶN (Medical Advice)
6. TÁI KHÁM (Follow-up)

Output format: JSON chuẩn theo Medical Record schema.
```

**Output JSON:**
```json
{
  "consultation_summary": {
    "chief_complaint": "Đau bụng vùng thượng vị 2 ngày",
    "present_illness": "Bệnh nhân nữ, đau bụng thượng vị 2 ngày, đau tăng sau ăn, kèm buồn nôn và nôn 2 lần. Chưa dùng thuốc gì.",
    "symptoms": [
      {
        "symptom": "Đau thượng vị",
        "medical_term": "Epigastric Pain",
        "duration": "2 ngày",
        "severity": "Nặng"
      },
      {
        "symptom": "Buồn nôn",
        "medical_term": "Nausea",
        "frequency": "Thường xuyên"
      },
      {
        "symptom": "Nôn",
        "medical_term": "Vomiting",
        "frequency": "2 lần"
      }
    ],
    "diagnosis": {
      "primary": "Viêm loét dạ dày",
      "medical_term": "Gastritis/Peptic Ulcer Disease",
      "icd10": "K29.7",
      "confidence": "Khả năng cao - cần nội soi xác định"
    },
    "prescription": [
      {
        "medication": "Omeprazole",
        "dosage": "20mg",
        "frequency": "1 viên x 2 lần/ngày",
        "timing": "Trước ăn 30 phút",
        "duration": "4 tuần"
      },
      {
        "medication": "Sucralfate",
        "dosage": "1g",
        "frequency": "1 gói x 3 lần/ngày",
        "timing": "Trước bữa ăn",
        "duration": "2 tuần"
      }
    ],
    "advice": [
      "Ăn nhiều bữa, mỗi bữa ít",
      "Tránh cay nóng, cà phê, rượu",
      "Không ăn quá no",
      "Giảm stress"
    ],
    "follow_up": {
      "when": "2 tuần",
      "reason": "Đánh giá đáp ứng điều trị, cân nhắc nội soi nếu không đỡ"
    }
  },
  "transcript_preview": "[00:12] Bác sĩ: Chào chị...",
  "audio_duration": "15:42",
  "consultation_date": "2025-10-22T14:30:00Z"
}
```

**Thời gian**: 30-60 giây

### Step 4: Review bởi Bác sĩ (Thủ công)
1. Hệ thống gửi thông báo cho bác sĩ: "Summary đã sẵn sàng"
2. Bác sĩ vào "Lịch hẹn" > "Review Summary"
3. **Kiểm tra và chỉnh sửa** nếu AI hiểu sai
4. Có thể nghe lại audio (nếu cần)
5. Click "Phê duyệt" để finalize

### Step 5: Lưu vào Medical Record (Tự động)
- Summary được lưu vào bảng `MedicalRecord`
- Bệnh nhân có thể xem ngay
- Audio file được **XÓA** sau 7 ngày (tuân thủ privacy)
- Chỉ giữ lại transcript + summary

## 5. Bảo mật và Privacy

### Mã hóa
- **Video/Audio Stream**: AES-256 encryption
- **Audio File lưu trữ**: Encrypted at rest
- **Transcript/Summary**: Encrypted trong database

### Quyền truy cập
- **Audio file**: Chỉ bác sĩ + admin (để troubleshoot)
- **Transcript**: Chỉ bác sĩ + bệnh nhân
- **Summary**: Bác sĩ, bệnh nhân, admin (chỉ đọc)

### Lưu trữ
- **Audio file**: 7 ngày → XÓA VĨNH VIỄN
- **Transcript**: 5 năm (theo quy định y tế)
- **Summary**: Vĩnh viễn (là hồ sơ bệnh án chính thức)

### Tuân thủ pháp luật
- **Nghị định 13/2023/NĐ-CP**: Bảo vệ dữ liệu cá nhân
- **Thông tư 46/2017/TT-BYT**: Hồ sơ bệnh án điện tử
- **Informed Consent**: Bắt buộc đồng ý trước khi ghi âm

## 6. Xử lý Lỗi

### Lỗi kết nối trong cuộc gọi
**Triệu chứng**: Video/audio bị giật, lag
**Xử lý**:
1. Kiểm tra kết nối internet
2. Tắt camera (chỉ dùng audio)
3. Làm mới trang
4. Nếu vẫn lỗi: Kết thúc và đặt lịch lại (miễn phí)

### Lỗi ghi âm
**Triệu chứng**: Không ghi được audio
**Xử lý**:
- Hệ thống tự động thông báo
- Bác sĩ phải ghi chép thủ công
- Bệnh nhân được bồi thường voucher

### Lỗi Speech-to-Text
**Triệu chứng**: Transcript sai, không đọc được
**Xử lý**:
- Hệ thống tự động retry với Whisper API
- Nếu vẫn lỗi: Bác sĩ ghi chép thủ công
- Audio vẫn được lưu để xem xét

### Lỗi AI Summarization
**Triệu chứng**: Summary không chính xác, thiếu thông tin
**Xử lý**:
- Bác sĩ có thể edit hoàn toàn
- Có thể regenerate với prompt khác
- Bác sĩ có thể viết mới từ đầu

## 7. Best Practices

### Cho Bác sĩ
✅ **Nên:**
- Nói rõ ràng, tốc độ vừa phải
- Đề cập rõ: "Chẩn đoán là...", "Tôi kê đơn thuốc..."
- Nhắc lại tên thuốc, liều dùng
- Tóm tắt cuối buổi: "Vậy là..."
- Review AI summary trước khi phê duyệt

❌ **Không nên:**
- Nói quá nhanh, nhai chữ
- Dùng tên viết tắt không rõ ràng
- Quên đề cập lời dặn quan trọng
- Phê duyệt summary mà không kiểm tra

### Cho Bệnh nhân
✅ **Nên:**
- Nói rõ triệu chứng, thời gian
- Trả lời đầy đủ câu hỏi bác sĩ
- Đề cập thuốc đang dùng, dị ứng
- Hỏi lại nếu không hiểu

❌ **Không nên:**
- Nói chuyện riêng trong lúc khám
- Để người khác làm ồn xung quanh
- Tắt mic khi bác sĩ hỏi

## 8. FAQ về Recording & AI

**Q: Audio có bị lộ ra ngoài không?**
A: KHÔNG. Audio được mã hóa, chỉ bác sĩ và bệnh nhân truy cập. Xóa sau 7 ngày.

**Q: AI có thể hiểu sai không?**
A: Có thể. Vì vậy bác sĩ PHẢI review và chỉnh sửa trước khi finalize.

**Q: Tôi không muốn bị ghi âm được không?**
A: Được. Chọn "Không đồng ý" khi có thông báo. Video call vẫn diễn ra bình thường.

**Q: Transcript có được chia sẻ với ai không?**
A: KHÔNG. Chỉ bạn và bác sĩ của bạn. Tuân thủ bảo mật y tế tuyệt đối.

**Q: Chi phí có đắt hơn không?**
A: KHÔNG. Phí khám online đã bao gồm recording + AI summary.

**Q: Tôi có thể nghe lại audio không?**
A: Bác sĩ có thể. Bệnh nhân KHÔNG (để bảo vệ bác sĩ). Bạn có transcript và summary đầy đủ.

**Q: AI có thay thế bác sĩ không?**
A: TUYỆT ĐỐI KHÔNG. AI chỉ hỗ trợ ghi chép. Bác sĩ vẫn phải review, chẩn đoán và chịu trách nhiệm.

**Q: Nếu AI tóm tắt sai, ai chịu trách nhiệm?**
A: Bác sĩ. Vì vậy bác sĩ BẮT BUỘC phải review trước khi phê duyệt.

## 9. Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| Không kết nối được | Internet yếu | Kiểm tra kết nối, reset router |
| Không thấy video | Camera bị chặn | Cho phép truy cập camera trong browser |
| Không nghe thấy âm thanh | Mic bị tắt/chặn | Kiểm tra mic, unmute |
| Video bị giật | Băng thông không đủ | Tắt camera, chỉ dùng audio |
| "Đang ghi âm" không hiện | Không đồng ý ghi âm | Check lại consent, hoặc bỏ qua ghi âm |
| Summary không chính xác | AI hiểu sai | Bác sĩ edit lại trong review |
| Audio không có | Lỗi Agora Recording | Bác sĩ ghi chép thủ công |

## 10. Liên hệ Hỗ trợ

**Vấn đề kỹ thuật video call:**
- Hotline: 1900 xxxx
- Email: video-support@medconnect.vn
- Chat: Trong cuộc gọi có nút "Báo lỗi"

**Vấn đề về AI Summary:**
- Email: ai-support@medconnect.vn
- Ghi rõ: Mã lịch hẹn, Vấn đề gặp phải

---

*Hướng dẫn này được cập nhật liên tục. Phiên bản: 1.0 - Tháng 10, 2025*

