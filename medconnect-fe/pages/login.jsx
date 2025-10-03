import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase"; // import từ file firebase.js

export default function MedConnectLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const sendToBackend = async (user, loginMethod) => {
    try {
      const idToken = await user.getIdToken();
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        loginMethod: loginMethod,
        firebaseToken: idToken,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Backend authentication failed");

      showMessage("Đăng nhập thành công! Đang chuyển hướng...", "success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Backend error:", error);
      showMessage("Lỗi kết nối với máy chủ. Vui lòng thử lại.", "error");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!termsAccepted || !privacyAccepted) {
      showMessage(
        "Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật.",
        "error"
      );
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendToBackend(userCredential.user, "email");
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      if (error.code === "auth/user-not-found")
        errorMessage = "Tài khoản không tồn tại.";
      else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      )
        errorMessage = "Email hoặc mật khẩu không chính xác.";
      else if (error.code === "auth/invalid-email")
        errorMessage = "Email không hợp lệ.";
      else if (error.code === "auth/user-disabled")
        errorMessage = "Tài khoản đã bị khóa.";
      showMessage(errorMessage, "error");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!termsAccepted || !privacyAccepted) {
      showMessage(
        "Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật.",
        "error"
      );
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await sendToBackend(result.user, "google");
    } catch (error) {
      showMessage("Đăng nhập Google thất bại. Vui lòng thử lại.", "error");
    }
  };

  const handleFacebookLogin = async () => {
    if (!termsAccepted || !privacyAccepted) {
      showMessage(
        "Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật.",
        "error"
      );
      return;
    }
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await sendToBackend(result.user, "facebook");
    } catch (error) {
      showMessage("Đăng nhập Facebook thất bại. Vui lòng thử lại.", "error");
    }
  };

    return (
    <div
      className="min-h-screen flex items-center justify-center p-8 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/hospital.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden w-full flex" style={{ maxWidth: '900px', minHeight: '550px' }}>
        <div className="flex-1 relative overflow-hidden">
          {/* Background Image */}
          <img
            src="/doctor.jpg"
            alt="Bác sĩ"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.7) 100%)' }}></div>

          {/* Content */}
          <div className="relative z-10 p-10 text-white flex flex-col justify-center h-full">
            <h1 className="text-4xl font-bold mb-4">🏥 MedConnect</h1>
            <p className="text-base leading-relaxed opacity-95 mb-6">
              Nền tảng đặt lịch khám bệnh và tư vấn y tế trực tuyến hàng đầu Việt Nam
            </p>

            <ul className="space-y-2">
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

        {/* right form */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Đăng nhập
            </h2>
            <p className="text-gray-600 text-xs">
              Chào mừng bạn trở lại với MedConnect
            </p>
          </div>

          {message.text && (
            <div
              className={`p-2.5 rounded-lg mb-4 text-xs ${
                message.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* inputs + button */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-gray-700 font-medium text-xs">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-gray-700 font-medium text-xs">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex justify-end">
              <a
                href="#"
                className="text-indigo-600 text-xs font-medium hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Tôi đồng ý với{" "}
                  <a
                    href="#"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Điều khoản sử dụng
                  </a>
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Tôi đã đọc và chấp nhận{" "}
                  <a
                    href="#"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
            </div>

            <button
              onClick={handleEmailLogin}
              disabled={isLoading}
              className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="relative text-center my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-500">
                Hoặc đăng nhập với
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGoogleLogin}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all hover:border-indigo-500 hover:shadow-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-red-600">Google</span>
              </button>
              <button
                onClick={handleFacebookLogin}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 text-base font-medium transition-all hover:border-indigo-500 hover:shadow-md"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#4267B2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-blue-600">Facebook</span>
              </button>
            </div>

            <div className="text-center mt-5 text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a
                href="#"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Đăng ký ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
