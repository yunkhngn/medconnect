import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";
import SocialLogin from "@/components/ui/SocialLogin";

export default function MedConnectRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Gửi duy nhất token Firebase về backend
  const sendFirebaseTokenToBackend = async (user) => {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) throw new Error("Backend registration failed");

      const data = await response.json();
      console.log("Backend response:", data);

      showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      console.error("Backend error:", error);
      showMessage("Lỗi kết nối với máy chủ. Vui lòng thử lại.", "error");
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();

    if (!termsAccepted || !privacyAccepted) {
      showMessage("Vui lòng đồng ý với điều khoản và chính sách bảo mật.", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showMessage("Mật khẩu xác nhận không khớp.", "error");
      return;
    }

    if (formData.password.length < 6) {
      showMessage("Mật khẩu phải có ít nhất 6 ký tự.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, { displayName: formData.fullName });
      await sendFirebaseTokenToBackend(userCredential.user);
    } catch (error) {
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

      if (error.code === "auth/email-already-in-use")
        errorMessage = "Email đã được sử dụng.";
      else if (error.code === "auth/invalid-email")
        errorMessage = "Email không hợp lệ.";
      else if (error.code === "auth/weak-password")
        errorMessage = "Mật khẩu quá yếu.";

      showMessage(errorMessage, "error");
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!termsAccepted || !privacyAccepted) {
      showMessage("Vui lòng đồng ý với điều khoản và chính sách bảo mật.", "error");
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await sendFirebaseTokenToBackend(result.user);
    } catch {
      showMessage("Đăng ký Google thất bại. Vui lòng thử lại.", "error");
    }
  };

  const handleFacebookRegister = async () => {
    if (!termsAccepted || !privacyAccepted) {
      showMessage("Vui lòng đồng ý với điều khoản và chính sách bảo mật.", "error");
      return;
    }

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await sendFirebaseTokenToBackend(result.user);
    } catch {
      showMessage("Đăng ký Facebook thất bại. Vui lòng thử lại.", "error");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(hospital.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div
        className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full flex relative z-10"
        style={{ maxWidth: "950px", minHeight: "580px" }}
      >
        {/* LEFT SIDE */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="text-center mb-7">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">Đăng ký</h2>
            <p className="text-gray-600 text-sm">Tạo tài khoản mới trên MedConnect</p>
          </div>

          {message.text && (
            <div
              className={`p-3 rounded-lg mb-4 text-sm ${message.type === "error"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-600 border border-green-200"
                }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-gray-700 font-medium text-sm">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-gray-700 font-medium text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-gray-700 font-medium text-sm">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-gray-700 font-medium text-sm">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2.5">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-1 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-indigo-600 font-medium hover:underline">
                    Điều khoản sử dụng
                  </a>
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="w-4 h-4 mt-1 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  Tôi đã đọc và chấp nhận{" "}
                  <a href="#" className="text-indigo-600 font-medium hover:underline">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white text-base font-semibold rounded-xl transition-all disabled:opacity-60 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          {/* SOCIAL LOGIN */}
          <div className="relative text-center my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-sm text-gray-500">
              Hoặc đăng ký với
            </span>
          </div>

            <div className="flex justify-center"> <SocialLogin onSuccess={(user) => sendFirebaseTokenToBackend(user)} onError={(msg) => showMessage(msg, "error")} /> </div>


          <div className="text-center mt-4 text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-indigo-600 font-semibold hover:underline">
              Đăng nhập ngay
            </a>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src="doctor.jpg"
            alt="Bác sĩ"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.7) 100%)",
            }}
          ></div>
          <div className="relative z-10 p-12 text-white flex flex-col justify-center h-full">
            <h1 className="text-4xl font-bold mb-4">🏥 MedConnect</h1>
            <p className="text-base leading-relaxed opacity-95 mb-6">
              Nền tảng đặt lịch khám bệnh và tư vấn y tế trực tuyến hàng đầu Việt Nam
            </p>
            <ul className="space-y-2.5">
              {[
                "Tìm bác sĩ chuyên khoa nhanh chóng",
                "Đặt lịch khám online tiện lợi",
                "Tư vấn video trực tiếp với bác sĩ",
                "Quản lý lịch sử khám bệnh",
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm">
                  <span className="text-xl font-bold mr-3">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
