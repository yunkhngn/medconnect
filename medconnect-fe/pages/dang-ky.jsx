import React, { useState } from "react";
import { Card, CardBody, Input, Button, Checkbox, Divider } from "@heroui/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import SocialLogin from "@/components/ui/SocialLogin";
import { Default } from "@/components/layouts/";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function MedConnectRegister() {
  const router = useRouter();
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

  const sendFirebaseTokenToBackend = async (user) => {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        let errorText = "Đăng ký thất bại từ backend.";
        
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorText;
        } catch {
          errorText = await response.text() || errorText;
        }
        
        console.error("Backend register failed:", response.status, errorText);
        await user.delete();
        
        showMessage(errorText, "error");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Backend response:", data);

      showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 1500);
    } catch (error) {
      console.error("Backend error:", error);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) await currentUser.delete();
      } catch (deleteError) {
        console.warn("Không thể xóa user Firebase:", deleteError);
      }

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

  return (
    <Default title="Đăng ký - MedConnect">
      <div className="min-h-screen flex items-center justify-center p-10 bg-cover bg-center bg-no-repeat relative">
        <div className="w-full min-h-[60vh] grid place-items-center p-4 sm:p-6">
          <Card
            isBlurred
            shadow="sm"
            className="w-full max-w-5xl border-none bg-background/60 dark:bg-default-100/50 rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LEFT: Register form */}
              <CardBody className="p-6 sm:p-10">
                <div className="max-w-sm">
                  <h1 className="text-3xl font-semibold tracking-tight mb-6">Đăng ký</h1>

                  {message.text && (
                    <div
                      className={`p-3 rounded-lg mb-4 text-sm ${
                        message.type === "error"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-green-50 text-green-600 border border-green-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleEmailRegister} className="flex flex-col gap-4">
                    <Input
                      isRequired
                      name="fullName"
                      type="text"
                      label="Họ và tên"
                      labelPlacement="outside"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />

                    <Input
                      isRequired
                      name="email"
                      type="email"
                      label="Email"
                      labelPlacement="outside"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />

                    <Input
                      isRequired
                      name="password"
                      type="password"
                      label="Mật khẩu"
                      labelPlacement="outside"
                      placeholder="Nhập mật khẩu của bạn"
                      value={formData.password}
                      onChange={handleInputChange}
                    />

                    <Input
                      isRequired
                      name="confirmPassword"
                      type="password"
                      label="Xác nhận mật khẩu"
                      labelPlacement="outside"
                      placeholder="Xác nhận mật khẩu của bạn"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />

                    <div className="space-y-2">
                      <div>
                      <Checkbox
                        isSelected={termsAccepted}
                        onValueChange={setTermsAccepted}
                      >
                      </Checkbox>
                      <span className="text-sm text-gray-600">
                          Tôi đồng ý với{" "}
                          <Link href="/chinh-sach/dieu-khoan-su-dung" className="text-primary font-medium hover:underline">
                            Điều khoản sử dụng
                          </Link>
                        </span>
                    </div>
                    <div>
                      <Checkbox
                        isSelected={privacyAccepted}
                        onValueChange={setPrivacyAccepted}
                      >
                      </Checkbox>
                      <span className="text-sm text-gray-600">
                          Tôi đã đọc và chấp nhận{" "}
                          <Link href="/chinh-sach/chinh-sach-bao-mat" className="text-primary font-medium hover:underline">
                            Chính sách bảo mật
                          </Link>
                        </span>
                        </div>
                    </div>

                    <Button
                      color="primary"
                      size="md"
                      type="submit"
                      className="mt-2"
                      disabled={isLoading}
                      isLoading={isLoading}
                    >
                      {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                    </Button>

                    <Divider className="my-2" />

                    <div className="flex items-center justify-center">
                      <SocialLogin
                        onSuccess={(user) => sendFirebaseTokenToBackend(user)}
                        onError={(msg) => showMessage(msg, "error")}
                      />
                    </div>
                  </form>

                  <Link
                    href="/dang-nhap"
                    className="mt-8 inline-flex items-center gap-2 text-gray-400 underline underline-offset-4"
                  >
                    Đã có tài khoản? Đăng nhập ngay
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      className="size-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </CardBody>

              {/* RIGHT: Welcome panel */}
              <CardBody className="hidden md:flex p-0">
                <Image
                  src="/assets/homepage/cover.jpg"
                  alt="Welcome Image"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </CardBody>
            </div>
          </Card>
        </div>
      </div>
    </Default>
  );
}
