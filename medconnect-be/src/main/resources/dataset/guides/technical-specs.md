# Technical Specifications - MedConnect System

## 1. Video Call Infrastructure

### Agora RTC Configuration
```
Service: Agora Real-Time Communication
App ID: [Configured in backend .env]
Channel Mode: Communication (1-to-1)
Video Profile: 640x480 @ 15fps (default), up to 1920x1080 @ 30fps
Audio Profile: 48kHz, Stereo, 128kbps
Encryption: AES-256-XTS
```

### Network Requirements
| Role | Min Bandwidth | Recommended | Latency |
|------|---------------|-------------|---------|
| Patient | 2 Mbps | 5 Mbps | < 500ms |
| Doctor | 5 Mbps | 10 Mbps | < 300ms |

### Supported Browsers
- Chrome 90+
- Edge 90+
- Safari 14+
- Firefox 90+ (limited support)

## 2. Cloud Recording

### Agora Cloud Recording Setup
```
Mode: Individual Recording (separate tracks)
Recording Format: 
  - Audio: MP3, 128kbps, 48kHz, Mono
  - Video: Disabled (audio-only recording)
Storage: Agora Cloud → Transfer to MedConnect S3
Max Recording Time: 2 hours per session
Auto-stop: Yes (when all users leave)
```

### File Naming Convention
```
recording_{appointmentId}_{timestamp}.mp3
Example: recording_12345_20251022143000.mp3
```

### Storage Strategy
```
Phase 1: Agora Cloud (temporary, 24h)
Phase 2: MedConnect Backend Storage (7 days)
Phase 3: DELETE permanently
Backup: Transcript + Summary (permanent)
```

## 3. Speech-to-Text Pipeline

### Primary: Google Cloud Speech-to-Text
```yaml
API: Google Cloud Speech-to-Text v2
Language: vi-VN (Vietnamese)
Model: medical_dictation (custom trained)
Features:
  - Speaker diarization: Enabled (2 speakers)
  - Automatic punctuation: Enabled
  - Profanity filter: Disabled
  - Word timestamps: Enabled
Sample Rate: 48000 Hz
Encoding: MP3
```

### Fallback: OpenAI Whisper API
```yaml
API: OpenAI Whisper API
Model: whisper-1
Language: vietnamese
Response Format: verbose_json (with timestamps)
Temperature: 0.2 (for accuracy)
```

### Error Handling
```
If Google Speech-to-Text fails → Retry 1 time
If still fails → Switch to Whisper API
If Whisper fails → Manual transcription required
```

## 4. AI Summarization

### Gemini API Configuration
```yaml
Model: gemini-2.0-flash-exp
Temperature: 0.3 (low for medical accuracy)
Max Output Tokens: 2048
Top-K: 40
Top-P: 0.95
Safety Settings:
  - Harassment: BLOCK_NONE
  - Hate Speech: BLOCK_NONE
  - Sexually Explicit: BLOCK_MEDIUM_AND_ABOVE
  - Dangerous Content: BLOCK_ONLY_HIGH
```

### Prompt Engineering
```
System Instruction:
"Bạn là trợ lý AI y tế chuyên nghiệp, hỗ trợ bác sĩ tóm tắt cuộc tư vấn. 
Nhiệm vụ: Trích xuất thông tin y khoa từ transcript, tạo hồ sơ bệnh án chuẩn.
Yêu cầu: Chính xác, đầy đủ, sử dụng thuật ngữ y khoa chuẩn."

User Prompt Template:
"Phân tích transcript cuộc tư vấn y tế và tạo JSON output theo schema:
[SCHEMA]
{medical_record_schema}
[/SCHEMA]

[TRANSCRIPT]
{transcript_with_timestamps}
[/TRANSCRIPT]

Lưu ý:
- Phân biệt Bác sĩ và Bệnh nhân
- Trích xuất triệu chứng, chẩn đoán, đơn thuốc
- Sử dụng ICD-10 code
- Format thuốc: Tên - Liều - Cách dùng - Thời gian"
```

### Output Schema
```json
{
  "chief_complaint": "string",
  "present_illness": "string",
  "symptoms": [
    {
      "symptom": "string",
      "medical_term": "string",
      "duration": "string",
      "severity": "string"
    }
  ],
  "diagnosis": {
    "primary": "string",
    "medical_term": "string",
    "icd10": "string",
    "differential": ["string"]
  },
  "prescription": [
    {
      "medication": "string",
      "dosage": "string",
      "frequency": "string",
      "timing": "string",
      "duration": "string"
    }
  ],
  "advice": ["string"],
  "follow_up": {
    "when": "string",
    "reason": "string"
  }
}
```

## 5. Database Schema

### VideoCallSession Table
```sql
CREATE TABLE VideoCallSession (
    appointmentId BIGINT PRIMARY KEY,
    channelName VARCHAR(255),
    agoraToken VARCHAR(500),
    connectionStatus VARCHAR(50), -- 'PENDING', 'CONNECTED', 'ENDED'
    startTime DATETIME,
    endTime DATETIME,
    duration INT, -- seconds
    recordingEnabled BIT DEFAULT 1,
    recordingUrl VARCHAR(1000),
    recordingStatus VARCHAR(50), -- 'RECORDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    FOREIGN KEY (appointmentId) REFERENCES Appointment(appointmentId)
);
```

### AudioRecording Table
```sql
CREATE TABLE AudioRecording (
    recordingId BIGINT PRIMARY KEY IDENTITY,
    appointmentId BIGINT,
    audioFileUrl VARCHAR(1000),
    audioFormat VARCHAR(10), -- 'MP3', 'WAV'
    duration INT, -- seconds
    fileSize BIGINT, -- bytes
    uploadedAt DATETIME,
    expiresAt DATETIME, -- uploadedAt + 7 days
    isDeleted BIT DEFAULT 0,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(appointmentId)
);
```

### Transcript Table
```sql
CREATE TABLE Transcript (
    transcriptId BIGINT PRIMARY KEY IDENTITY,
    appointmentId BIGINT,
    provider VARCHAR(50), -- 'GOOGLE_SPEECH', 'WHISPER'
    transcriptText NVARCHAR(MAX),
    transcriptJson NVARCHAR(MAX), -- with timestamps, speaker labels
    confidence FLOAT, -- 0.0 - 1.0
    createdAt DATETIME,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(appointmentId)
);
```

### MedicalRecordSummary Table
```sql
CREATE TABLE MedicalRecordSummary (
    summaryId BIGINT PRIMARY KEY IDENTITY,
    appointmentId BIGINT,
    transcriptId BIGINT,
    summaryJson NVARCHAR(MAX), -- JSON output from Gemini
    chiefComplaint NVARCHAR(500),
    diagnosis NVARCHAR(500),
    diagnosisICD10 VARCHAR(10),
    prescription NVARCHAR(MAX), -- JSON array
    reviewedByDoctor BIT DEFAULT 0,
    reviewedAt DATETIME,
    finalizedAt DATETIME,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(appointmentId),
    FOREIGN KEY (transcriptId) REFERENCES Transcript(transcriptId)
);
```

## 6. API Endpoints

### Video Call APIs
```
POST /api/video/generate-token
Request:
{
  "appointmentId": 12345,
  "role": "doctor" | "patient"
}
Response:
{
  "channelName": "appointment_12345",
  "token": "006abcd...",
  "uid": 1001,
  "expiresAt": "2025-10-22T16:00:00Z"
}

POST /api/video/start-recording
Request:
{
  "appointmentId": 12345,
  "channelName": "appointment_12345"
}
Response:
{
  "recordingId": "rec_abc123",
  "status": "RECORDING"
}

POST /api/video/stop-recording
Request:
{
  "appointmentId": 12345,
  "recordingId": "rec_abc123"
}
Response:
{
  "status": "STOPPED",
  "audioUrl": "https://..."
}
```

### AI Processing APIs
```
POST /api/ai/transcribe
Request:
{
  "appointmentId": 12345,
  "audioUrl": "https://...",
  "provider": "google" | "whisper"
}
Response:
{
  "transcriptId": 789,
  "transcriptText": "...",
  "confidence": 0.92,
  "speakerLabels": true
}

POST /api/ai/summarize
Request:
{
  "appointmentId": 12345,
  "transcriptId": 789
}
Response:
{
  "summaryId": 456,
  "summary": { ... }, // JSON object
  "needsReview": true
}

PUT /api/ai/review-summary/{summaryId}
Request:
{
  "summaryJson": { ... }, // Edited by doctor
  "approved": true
}
Response:
{
  "status": "FINALIZED",
  "medicalRecordId": 999
}
```

## 7. Cost Estimation

### Per 30-minute Consultation
```
Agora RTC:
  - Video call: $0.99/1000 minutes = $0.0297
  - Cloud recording: $0.99/1000 minutes = $0.0297

Google Speech-to-Text:
  - 30 minutes = 1800 seconds
  - $0.006 per 15 seconds = $0.72

Gemini API:
  - Input: ~3000 tokens (transcript) = $0.0001 * 3000 = $0.30
  - Output: ~500 tokens (summary) = $0.0003 * 500 = $0.15

Storage:
  - Audio 30 min = ~30MB * 7 days
  - S3: $0.023/GB/month ≈ negligible

TOTAL: ~$1.20 per consultation
```

### Monthly Estimation (1000 consultations)
```
Total: $1,200/month
Revenue per consultation: 85% of doctor fee
Average doctor fee: 200,000 VND (~$8)
Platform revenue: 15% = 30,000 VND ($1.20)

→ AI cost = Platform revenue (break-even)
→ Need optimization or increase fee slightly
```

## 8. Performance Metrics

### Latency Targets
```
Video call start: < 5 seconds
Audio upload after call: < 2 minutes
Speech-to-Text: < 5 minutes (for 30 min audio)
AI Summarization: < 1 minute
Total (end-to-end): < 10 minutes
```

### Accuracy Targets
```
Speech-to-Text:
  - Medical term accuracy: > 85%
  - Overall accuracy: > 90%

AI Summarization:
  - Symptom extraction: > 95%
  - Diagnosis accuracy: > 90% (with doctor review)
  - Prescription format: > 98%
```

### Availability
```
Video call uptime: 99.9%
Recording success rate: > 98%
AI processing success rate: > 95%
```

## 9. Security & Compliance

### Encryption
```
In Transit:
  - Video/Audio: AES-256 (Agora)
  - API calls: TLS 1.3
  - WebSocket: WSS

At Rest:
  - Audio files: AES-256
  - Database: Transparent Data Encryption (TDE)
  - Backups: Encrypted
```

### Access Control
```
Audio File:
  - Doctor: Full access (7 days)
  - Patient: No access
  - Admin: Read-only (for support)

Transcript:
  - Doctor: Full access
  - Patient: Read-only
  - Admin: No access (unless authorized)

Summary:
  - Doctor: Full access
  - Patient: Read-only
  - Admin: Read-only (anonymized)
```

### Audit Logging
```
All access to medical data is logged:
  - User ID
  - Action (view, edit, delete)
  - Timestamp
  - IP Address
  - Result (success/failure)

Retention: 5 years
```

### Compliance
```
✅ Nghị định 13/2023/NĐ-CP (Personal Data Protection)
✅ Thông tư 46/2017/TT-BYT (Electronic Medical Records)
✅ Thông tư 49/2017/TT-BYT (Telemedicine)
✅ HIPAA-equivalent (Vietnamese context)
```

## 10. Disaster Recovery

### Backup Strategy
```
Audio Files:
  - Primary: MedConnect S3
  - Backup: None (temporary, 7 days only)

Transcript:
  - Primary: SQL Server database
  - Backup: Daily incremental + Weekly full
  - Retention: 5 years

Summary:
  - Primary: SQL Server database
  - Backup: Real-time replication
  - Retention: Permanent
```

### Failover
```
If Agora fails:
  → Display error, reschedule consultation
  → No failover (no alternative video provider)

If Speech-to-Text fails:
  → Retry with fallback provider (Whisper)
  → If all fail: Manual transcription

If Gemini fails:
  → Doctor writes summary manually
  → No AI assistance
```

## 11. Monitoring & Alerts

### Metrics to Monitor
```
- Video call connection success rate
- Recording start/stop success rate
- Speech-to-Text latency & accuracy
- AI summarization latency & accuracy
- Storage usage
- API rate limits
- Error rates by service
```

### Alert Thresholds
```
CRITICAL:
  - Video call success rate < 95%
  - Recording failure rate > 5%
  - API errors > 10% in 5 minutes

WARNING:
  - Speech-to-Text latency > 10 minutes
  - Storage > 80% capacity
  - API rate limit approaching
```

### Logging
```
Level: INFO, WARN, ERROR
Format: JSON structured logging
Retention: 90 days
Tools: ELK Stack or CloudWatch
```

---

*Technical Specs Version: 1.0 - Updated Oct 2025*

