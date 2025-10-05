import React, { useState } from "react";
import { Input, Button } from "@heroui/react";
import SocialLoginButtons from "@/components/ui/SocialLogin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function MedConnectLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // Gửi token Firebase về backend để backend xác thực và trả về role
  const sendFirebaseTokenToBackend = async (user) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userRole", data.role);

        showMessage("Đăng nhập thành công!", "success");

        // Điều hướng theo role
        setTimeout(() => {
          if (data.role === "ADMIN") {
            window.location.href = "/admin/dashboard";
          } else if (data.role === "DOCTOR") {
            window.location.href = "/doctor/dashboard";
          } else {
            window.location.href = "/patient/dashboard";
          }
        }, 1000);
      } else if (response.status === 401) {
        showMessage("Email hoặc mật khẩu không đúng!", "error");
      } else {
        showMessage("Đăng nhập thất bại từ backend.", "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Lỗi kết nối máy chủ.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng nhập email / password
  const handleEmailLogin = async () => {
    if (!email || !password) {
      showMessage("Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendFirebaseTokenToBackend(userCredential.user);
    } catch (error) {
      showMessage("Đăng nhập thất bại. Kiểm tra lại thông tin!", "error");
      setIsLoading(false);
    }
  };

   return (
    <div
      className="min-h-screen flex items-center justify-center p-10 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/hospital.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div
        className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden w-full flex max-w-[1100px] min-h-[600px]"
      >
        {/* Left panel */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src="/doctor.jpg"
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
            <h1 className="text-5xl font-bold mb-4">🏥 MedConnect</h1>
            <p className="text-lg leading-relaxed opacity-95 mb-6">
              Nền tảng đặt lịch khám bệnh và tư vấn y tế trực tuyến hàng đầu Việt Nam
            </p>
            <ul className="space-y-3">
              {[
                "Tìm bác sĩ chuyên khoa nhanh chóng",
                "Đặt lịch khám online tiện lợi",
                "Tư vấn video trực tiếp với bác sĩ",
                "Quản lý lịch sử khám bệnh",
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm">
                  <span className="text-xl font-bold mr-3">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/* Right form with HeroUI */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-1">Đăng nhập</h2>
            <p className="text-gray-600 text-sm">Chào mừng bạn trở lại với MedConnect</p>
          </div>

          {message.text && (
            <div
              className={`p-3 rounded-lg mb-5 text-sm ${
                message.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <Input
                label="Email"
                placeholder="example@email.com"
                type="email"
                size="md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Mật khẩu"
                placeholder="••••••••"
                type="password"
                size="md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
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

            <Button
              onClick={handleEmailLogin}
              disabled={isLoading}
              fullWidth
              size="md"
              className="w-full py-3 text-white text-base font-semibold rounded-xl transition-all disabled:opacity-60 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="relative text-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-500">
                Hoặc đăng nhập với
              </span>
            </div>

            <div className="flex justify-center">
              <SocialLoginButtons
                onSuccess={(user) => sendFirebaseTokenToBackend(user)}
                onError={(msg) => showMessage(msg, "error")}
              />
            </div>

            <div className="text-center mt-6 text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a
                href="/signup"
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
