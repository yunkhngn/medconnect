"use client";

import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Textarea, Chip, Divider } from "@heroui/react";
import { Star, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";

const API_BASE_URL = 'http://localhost:8080/api';

export default function TestFeedback() {
  const { user } = useAuth();
  const [appointmentId, setAppointmentId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [fetchAppointmentId, setFetchAppointmentId] = useState("");
  const [fetchedFeedback, setFetchedFeedback] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  
  const [doctorId, setDoctorId] = useState("");
  const [doctorSummary, setDoctorSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const submitFeedback = async () => {
    if (!appointmentId || !rating) {
      setError("Vui lòng điền appointmentId và chọn rating");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (!user) {
        throw new Error("Chưa đăng nhập");
      }
      
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: parseInt(appointmentId),
          rating: rating,
          comment: comment || ''
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setError(null);
      } else {
        setError(data.message || 'Lỗi không xác định');
        setResult(null);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi feedback');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    if (!fetchAppointmentId) {
      setError("Vui lòng điền appointmentId");
      return;
    }
    
    setFetchLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error("Chưa đăng nhập");
      }
      
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/feedback/appointment/${fetchAppointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFetchedFeedback(data.data);
        setError(null);
      } else {
        setError(data.message || 'Không tìm thấy feedback');
        setFetchedFeedback(null);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy feedback');
      setFetchedFeedback(null);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchDoctorSummary = async () => {
    if (!doctorId) {
      setError("Vui lòng điền doctorId");
      return;
    }
    
    setSummaryLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/doctor/${doctorId}/summary`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDoctorSummary(data.data);
        setError(null);
      } else {
        setError(data.message || 'Lỗi khi lấy summary');
        setDoctorSummary(null);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy summary');
      setDoctorSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Feedback API</h1>
          <p className="text-gray-600">Trang test các API feedback</p>
          {user && (
            <Chip color="success" className="mt-2">
              Đã đăng nhập: {user.email}
            </Chip>
          )}
        </div>

        {/* Submit Feedback */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">1. Tạo Feedback</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Appointment ID"
              type="number"
              placeholder="Nhập appointmentId"
              value={appointmentId}
              onValueChange={setAppointmentId}
              variant="bordered"
              classNames={{
                input: "remove-arrow",
                inputWrapper: "focus-within:border-primary focus-within:ring-0"
              }}
            />
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Rating</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 transition-all ${
                      star <= rating
                        ? 'text-yellow-400 scale-110'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating === 5 && 'Rất hài lòng'}
                {rating === 4 && 'Hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 1 && 'Rất không hài lòng'}
              </p>
            </div>
            
            <Textarea
              label="Comment (tùy chọn)"
              placeholder="Nhập comment..."
              value={comment}
              onValueChange={setComment}
              variant="bordered"
              minRows={3}
            />
            
            <Button
              color="primary"
              className="w-full"
              onPress={submitFeedback}
              isLoading={loading}
            >
              Gửi Feedback
            </Button>
            
            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Thành công!</span>
                </div>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Fetch Feedback by Appointment */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">2. Lấy Feedback theo Appointment</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Appointment ID"
              type="number"
              placeholder="Nhập appointmentId"
              value={fetchAppointmentId}
              onValueChange={setFetchAppointmentId}
              variant="bordered"
              classNames={{
                input: "remove-arrow",
                inputWrapper: "focus-within:border-primary focus-within:ring-0"
              }}
            />
            
            <Button
              color="secondary"
              className="w-full"
              onPress={fetchFeedback}
              isLoading={fetchLoading}
            >
              Lấy Feedback
            </Button>
            
            {fetchedFeedback && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Feedback tìm thấy:</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= fetchedFeedback.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({fetchedFeedback.rating}/5)</span>
                  </div>
                  {fetchedFeedback.comment && (
                    <div>
                      <span className="font-medium">Comment:</span>
                      <p className="text-sm text-gray-700 mt-1">{fetchedFeedback.comment}</p>
                    </div>
                  )}
                  {fetchedFeedback.patientName && (
                    <div>
                      <span className="font-medium">Bệnh nhân:</span>
                      <span className="text-sm text-gray-700 ml-2">{fetchedFeedback.patientName}</span>
                    </div>
                  )}
                  {fetchedFeedback.createdAt && (
                    <div>
                      <span className="font-medium">Ngày tạo:</span>
                      <span className="text-sm text-gray-700 ml-2">
                        {new Date(fetchedFeedback.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
                <Divider className="my-3" />
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(fetchedFeedback, null, 2)}
                </pre>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Fetch Doctor Summary */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">3. Lấy Feedback Summary của Doctor</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Doctor ID"
              type="number"
              placeholder="Nhập doctorId"
              value={doctorId}
              onValueChange={setDoctorId}
              variant="bordered"
              classNames={{
                input: "remove-arrow",
                inputWrapper: "focus-within:border-primary focus-within:ring-0"
              }}
            />
            
            <Button
              color="success"
              className="w-full"
              onPress={fetchDoctorSummary}
              isLoading={summaryLoading}
            >
              Lấy Summary
            </Button>
            
            {doctorSummary && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Summary:</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Average Rating:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(doctorSummary.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {doctorSummary.averageRating.toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Total Feedbacks:</span>
                    <span className="text-sm text-gray-700 ml-2">{doctorSummary.totalFeedbacks}</span>
                  </div>
                  
                  {doctorSummary.recentFeedbacks && doctorSummary.recentFeedbacks.length > 0 && (
                    <div>
                      <span className="font-medium mb-2 block">3 Feedback gần nhất:</span>
                      <div className="space-y-2">
                        {doctorSummary.recentFeedbacks.map((fb, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{fb.patientName || 'Bệnh nhân'}</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= fb.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {fb.comment && (
                              <p className="text-xs text-gray-600 mt-1">"{fb.comment}"</p>
                            )}
                            {fb.createdAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Divider className="my-3" />
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(doctorSummary, null, 2)}
                </pre>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-300">
            <CardBody>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Lỗi:</span>
                <span>{error}</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-blue-900">Hướng dẫn sử dụng</h3>
          </CardHeader>
          <CardBody className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Tạo Feedback:</strong> Cần đăng nhập, nhập appointmentId, chọn rating và comment (tùy chọn)</p>
            <p><strong>2. Lấy Feedback:</strong> Cần đăng nhập, nhập appointmentId để xem feedback đã tạo</p>
            <p><strong>3. Lấy Summary:</strong> Không cần đăng nhập, nhập doctorId để xem average rating và 3 feedback gần nhất</p>
            <p className="mt-4 text-xs text-blue-600">
              <strong>Lưu ý:</strong> Mỗi appointment chỉ có thể tạo 1 feedback. Nếu đã có feedback, sẽ báo lỗi.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

