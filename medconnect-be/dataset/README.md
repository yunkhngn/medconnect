# MedConnect Dataset - RAG Knowledge Base

## 📁 Cấu trúc Dataset

```
dataset/
├── README.md                           # File này
├── SRS.pdf                             # Software Requirements Specification
├── faq/                                # Câu hỏi thường gặp
│   ├── patient-faq.txt                 # FAQ cho bệnh nhân
│   ├── doctor-faq.txt                  # FAQ cho bác sĩ
│   └── system-faq.txt                  # FAQ về hệ thống
├── policies/                           # Chính sách
│   ├── cancellation-policy.txt         # Chính sách hủy lịch & hoàn tiền
│   └── payment-policy.txt              # Chính sách thanh toán
├── medical/                            # Kiến thức y khoa
│   ├── specializations.json            # 12 chuyên khoa + thuật ngữ
│   └── diseases-symptoms.json          # 12 bệnh phổ biến với ICD-10
└── guides/                             # Hướng dẫn sử dụng
    ├── video-call-guide.md             # Hướng dẫn video call + recording
    └── technical-specs.md              # Thông số kỹ thuật

```

## 📊 Thống kê Dataset

### FAQs
- **patient-faq.txt**: 40+ câu hỏi
- **doctor-faq.txt**: 35+ câu hỏi
- **system-faq.txt**: 30+ câu hỏi
- **Tổng**: 105+ Q&A pairs

### Policies
- **cancellation-policy.txt**: Chi tiết chính sách hủy lịch, hoàn tiền
- **payment-policy.txt**: Chi tiết về thanh toán, phí, hóa đơn

### Medical Knowledge
- **specializations.json**: 12 chuyên khoa
  - Cardiology (Tim mạch)
  - Dermatology (Da liễu)
  - Neurology (Thần kinh)
  - Orthopedics (Chấn thương chỉnh hình)
  - Gastroenterology (Tiêu hóa)
  - Pulmonology (Hô hấp)
  - Endocrinology (Nội tiết)
  - Pediatrics (Nhi khoa)
  - Obstetrics & Gynecology (Sản phụ khoa)
  - Psychiatry (Tâm thần)
  - Ophthalmology (Nhãn khoa)
  - ENT (Tai Mũi Họng)

- **diseases-symptoms.json**: 12 bệnh phổ biến
  - Tăng huyết áp (Hypertension)
  - Đái tháo đường type 2 (Diabetes Mellitus Type 2)
  - Viêm phổi (Pneumonia)
  - Viêm loét dạ dày (Gastritis)
  - Đột quỵ (Stroke)
  - Thoái hóa khớp (Osteoarthritis)
  - Trầm cảm (Depression)
  - Hen phế quản (Asthma)
  - COPD
  - Suy giáp (Hypothyroidism)
  - GERD

### Guides
- **video-call-guide.md**: Hướng dẫn đầy đủ về video consultation + recording + AI summary
- **technical-specs.md**: Specs kỹ thuật cho developers

## 🎯 Mục đích sử dụng

Dataset này được thiết kế cho **RAG (Retrieval-Augmented Generation) Chatbot** với Gemini AI:

### 1. **Hỗ trợ Bệnh nhân**
- Trả lời câu hỏi về cách đặt lịch, thanh toán, hủy lịch
- Tư vấn sơ bộ về triệu chứng
- Gợi ý chuyên khoa phù hợp
- Giải thích chính sách

### 2. **Hỗ trợ Bác sĩ**
- Trả lời câu hỏi về quy trình, thanh toán
- Hướng dẫn sử dụng video call, recording
- Giải thích chính sách và trách nhiệm

### 3. **Tra cứu Y khoa**
- Thông tin về chuyên khoa
- Triệu chứng và bệnh phổ biến
- Thuật ngữ y khoa (tiếng Việt + tiếng Anh)
- ICD-10 codes

### 4. **System Information**
- Giải thích tính năng hệ thống
- Troubleshooting
- Technical specs

## 🔧 Cách sử dụng trong RAG System

### Step 1: Load Documents
```python
# Pseudo code
documents = [
    load_text("faq/patient-faq.txt"),
    load_text("faq/doctor-faq.txt"),
    load_text("faq/system-faq.txt"),
    load_text("policies/cancellation-policy.txt"),
    load_text("policies/payment-policy.txt"),
    load_json("medical/specializations.json"),
    load_json("medical/diseases-symptoms.json"),
    load_markdown("guides/video-call-guide.md"),
    load_pdf("SRS.pdf")
]
```

### Step 2: Create Embeddings (Optional - for vector search)
```python
# Using embedding model to create vector database
vectorstore = create_vectorstore(documents)
```

### Step 3: Query with RAG
```python
user_query = "Làm sao để hủy lịch hẹn?"

# Retrieve relevant context
relevant_docs = vectorstore.search(user_query, top_k=3)

# Augment prompt with context
prompt = f"""
Context:
{relevant_docs}

User Question: {user_query}

Hãy trả lời dựa trên context trên.
"""

# Generate answer with Gemini
response = gemini.generate(prompt)
```

### Step 4: Function Calling (for database queries)
```python
# If user asks about appointments, doctors, etc.
# Use Gemini Function Calling to query database

user_query = "Lịch hẹn của tôi tuần này?"

functions = [
    {
        "name": "get_user_appointments",
        "description": "Lấy lịch hẹn của user",
        "parameters": {
            "start_date": "string",
            "end_date": "string"
        }
    }
]

response = gemini.generate(user_query, functions=functions)
if response.function_call:
    result = execute_function(response.function_call)
    final_answer = gemini.generate(f"Dựa trên data: {result}, trả lời: {user_query}")
```

## 📝 Nguyên tắc tạo Dataset

### 1. **Chính xác**
- Thông tin phải đúng với thực tế
- Thuật ngữ y khoa chuẩn
- Tuân thủ quy định pháp luật Việt Nam

### 2. **Đầy đủ**
- Cover tất cả use cases chính
- Giải đáp đủ câu hỏi thường gặp

### 3. **Rõ ràng**
- Ngôn ngữ dễ hiểu
- Có ví dụ cụ thể
- Format nhất quán

### 4. **Cập nhật**
- Review định kỳ
- Thêm FAQ mới từ user feedback
- Update khi có thay đổi chính sách

## 🔄 Quy trình cập nhật Dataset

### Khi nào cần update?
1. **Chính sách thay đổi**: Update policies/
2. **Tính năng mới**: Thêm vào guides/, FAQ
3. **Phản hồi user**: Bổ sung FAQ mới
4. **Bug trong AI response**: Clarify thông tin

### Ai có quyền update?
- **Admin**: Full access
- **Medical Team**: medical/ folder
- **Product Team**: faq/, policies/, guides/
- **Dev Team**: technical-specs.md

### Git workflow
```bash
# Create feature branch
git checkout -b update-dataset-faq

# Edit files
vim dataset/faq/patient-faq.txt

# Commit with clear message
git add dataset/
git commit -m "docs: Add FAQ about video recording consent"

# Create PR for review
git push origin update-dataset-faq
```

## 🎓 Training AI với Dataset

### Prompt Engineering Tips

**Tốt ✅:**
```
Bạn là trợ lý AI của MedConnect. Dựa trên knowledge base sau:
[CONTEXT]
{relevant_documents}
[/CONTEXT]

User hỏi: {user_query}

Trả lời:
- Ngắn gọn, dễ hiểu
- Dựa trên context, không bịa đặt
- Nếu không biết, nói "Tôi không có thông tin này"
- Suggest liên hệ support nếu cần
```

**Không tốt ❌:**
```
Trả lời câu hỏi: {user_query}
(Không có context, AI sẽ hallucinate)
```

### Fine-tuning (Optional)
- Dataset này có thể dùng để fine-tune model nhỏ hơn
- Format: Instruction-Response pairs
- Tool: LoRA, QLoRA for Llama, Mistral, etc.

## 📈 Metrics để đánh giá

### Accuracy
- % câu trả lời đúng (so với ground truth)
- % câu AI nói "Không biết" (khi thật sự không có trong dataset)

### Coverage
- % câu hỏi user được trả lời (không cần human)
- % câu hỏi cần escalate đến support

### User Satisfaction
- Thumbs up/down rate
- Số lần user hỏi lại câu hỏi tương tự

## 🛠️ Tools để làm việc với Dataset

### Text Editor
- VSCode (có Markdown preview)
- Cursor AI (có AI suggestions)

### JSON Editor
- VSCode với JSON schema validation
- Online: jsoneditoronline.org

### Version Control
- Git (bắt buộc)
- Semantic versioning cho major changes

### Testing
- Manual: Hỏi chatbot các câu trong FAQ, check đúng không
- Automated: Unit tests với ground truth Q&A pairs

## 📞 Liên hệ

**Thắc mắc về dataset:**
- Email: data@medconnect.vn
- Slack: #dataset-discussion

**Report lỗi:**
- GitHub Issues
- Email: bug-report@medconnect.vn

---

*Dataset Version: 1.0*
*Last Updated: October 2025*
*Maintained by: MedConnect Team - SWP391 G1*

