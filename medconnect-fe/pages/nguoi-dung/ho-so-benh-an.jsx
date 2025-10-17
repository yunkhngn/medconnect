import { useEffect, useState } from "react";
import { FileText, Calendar, User, Pill, Stethoscope } from "lucide-react";
import PatientFrame from "@/components/layouts/Patient/Frame"; // sửa path nếu khác

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    // ---- Mock dữ liệu để hiển thị UI ----
    const today = new Date().toISOString().split("T")[0];

    const mock = [
      {
        id: "rec1",
        visit_date: addDaysISO(today, -2),
        diagnosis: "Viêm dạ dày cấp.\nĐề nghị điều chỉnh chế độ ăn.",
        treatment: "PPI 20mg sáng/chiều trong 14 ngày.",
        prescription: "- Omeprazole 20mg x 2 viên/ngày\n- Alusal 10ml khi đau",
        notes: "Tái khám sau 2 tuần.",
        created_at: addDaysISO(today, -2),
        doctor: {
          full_name: "BS. Phạm Mỹ Dung",
          specialty: "Tiêu hóa",
          email: "dung.pm@hospital.vn",
        },
      },
      {
        id: "rec2",
        visit_date: addDaysISO(today, -7),
        diagnosis: "Viêm họng do virus.",
        treatment: "Uống nhiều nước, nghỉ ngơi, giảm đau khi cần.",
        prescription: "Paracetamol 500mg khi sốt/đau, không quá 3g/ngày.",
        notes: "",
        created_at: addDaysISO(today, -7),
        doctor: {
          full_name: "BS. Vũ Anh Tuấn",
          specialty: "Tai Mũi Họng",
          email: "tuan.va@hospital.vn",
        },
      },
      {
        id: "rec3",
        visit_date: addDaysISO(today, -10),
        diagnosis: "",
        treatment: "",
        prescription: "",
        notes: "Khuyên tập kéo giãn cột sống 10 phút/ngày.",
        created_at: addDaysISO(today, -10),
        doctor: {
          full_name: "BS. Trần Quỳnh Mai",
          specialty: "Cơ Xương Khớp",
          email: "mai.tq@hospital.vn",
        },
      },
    ];

    const t = setTimeout(() => {
      setRecords(mock);
      setSelectedRecord(mock[0] || null);
      setLoading(false);
    }, 300);

    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <PatientFrame title="Hồ sơ bệnh án">
        <div className="p-6 md:p-8 max-w-7xl mx-auto md:pl-28 lg:pl-32 xl:pl-36">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-gray-200 rounded" />
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </PatientFrame>
    );
  }

  return (
    <PatientFrame title="Hồ sơ bệnh án">
      <div className="p-6 md:p-8 max-w-7xl mx-auto md:pl-28 lg:pl-32 xl:pl-36">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ bệnh án</h1>
          </div>
          <p className="text-gray-600">Xem lịch sử khám bệnh và điều trị của bạn</p>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hồ sơ bệnh án</h3>
            <p className="text-gray-600">
              Hồ sơ bệnh án của bạn sẽ được hiển thị ở đây sau các lần khám bệnh
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Danh sách hồ sơ */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách hồ sơ</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {records.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      className={`w-full text-left p-4 border rounded-lg transition-colors ${
                        selectedRecord?.id === record.id
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-teal-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{toViDate(record.visit_date)}</p>
                        <Calendar size={16} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{record.doctor?.full_name}</p>
                      <p className="text-xs text-gray-500">{record.doctor?.specialty}</p>
                      {record.diagnosis ? (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{record.diagnosis}</p>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chi tiết hồ sơ */}
            <div className="lg:col-span-2">
              {selectedRecord ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ khám bệnh</h2>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>
                            {new Date(selectedRecord.visit_date).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <User size={20} className="text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Bác sĩ điều trị</h3>
                      </div>
                      <p className="text-lg font-medium text-gray-900 ml-8">
                        {selectedRecord.doctor?.full_name}
                      </p>
                      <p className="text-sm text-gray-600 ml-8">{selectedRecord.doctor?.specialty}</p>
                      <p className="text-sm text-gray-500 ml-8 mt-1">{selectedRecord.doctor?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Stethoscope size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900 text-lg">Chẩn đoán</h3>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 ml-8">
                        <p className="text-gray-800 whitespace-pre-line">
                          {selectedRecord.diagnosis || "Không có thông tin chẩn đoán"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <FileText size={20} className="text-green-600" />
                        <h3 className="font-semibold text-gray-900 text-lg">Phương pháp điều trị</h3>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 ml-8">
                        <p className="text-gray-800 whitespace-pre-line">
                          {selectedRecord.treatment || "Không có thông tin điều trị"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Pill size={20} className="text-orange-600" />
                        <h3 className="font-semibold text-gray-900 text-lg">Đơn thuốc</h3>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 ml-8">
                        <p className="text-gray-800 whitespace-pre-line">
                          {selectedRecord.prescription || "Không có đơn thuốc"}
                        </p>
                      </div>
                    </div>

                    {selectedRecord.notes ? (
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <FileText size={20} className="text-gray-600" />
                          <h3 className="font-semibold text-gray-900 text-lg">Ghi chú thêm</h3>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 ml-8">
                          <p className="text-gray-800 whitespace-pre-line">{selectedRecord.notes}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Hồ sơ được tạo ngày: {toViDate(selectedRecord.created_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <p className="text-gray-600">Chọn một hồ sơ để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PatientFrame>
  );
}

/* ---------- helpers ---------- */
function addDaysISO(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
function toViDate(iso) {
  return new Date(iso).toLocaleDateString("vi-VN");
}
