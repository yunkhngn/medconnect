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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

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

  const sendFirebaseTokenToBackend = async (user, extra = {}) => {
  try {
    setIsLoading(true);

    await user.reload();
    const idToken = await user.getIdToken(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const body = {
      name: extra.name || user.displayName || "",
      email: extra.email || user.email || "",
    };

    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });

    let responseBody = null;
    try {
      responseBody = await response.json();
    } catch (e) {
      responseBody = null;
    }

    if (!response.ok) {
      let errorText = "Đăng ký thất bại từ backend.";
      if (responseBody && responseBody.message) errorText = responseBody.message;
      console.error("Backend register failed:", response.status, errorText);
      showMessage(errorText, "error");
      setIsLoading(false);
      return false;
    }

    showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");
    setTimeout(() => {
      router.push("/dang-nhap");
    }, 1500);

    return true;
  } catch (error) {
    console.error("Backend error:", error);
    showMessage("Lỗi kết nối với máy chủ. Vui lòng thử lại.", "error");
    setIsLoading(false);
    return false;
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

    try {
      await updateProfile(userCredential.user, { displayName: formData.fullName });
    } catch (updErr) {
      console.warn("Không thể update profile:", updErr);
    }

    const ok = await sendFirebaseTokenToBackend(userCredential.user, {
      name: formData.fullName,
      email: formData.email,
    });

    try {
      await auth.signOut();
    } catch (err) {
      console.warn("Không thể signOut:", err);
    }

    if (ok) {
      showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 1);
    } else {
      setIsLoading(false);
    }

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


  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  return (
    <Default title="Đăng ký - MedConnect">
      <div className="min-h-[calc(100vh-4em)] flex items-center justify-center p-10 relative overflow-hidden">
        {/* Background with blur */}
                <div className="absolute inset-0">
                  <Image
                    src="/assets/homepage/cover.jpg"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10"></div>
                  <div className="absolute top-20 left-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
                </div>

        {/* Content */}
        <div className="w-full min-h-[60vh] grid place-items-center p-4 sm:p-6 relative z-10">
          <Card
            isBlurred
            shadow="lg"
            className="w-full max-w-5xl border border-white/20 bg-white/90 backdrop-blur-md dark:bg-default-100/50 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LEFT: Register form */}
              <CardBody className="p-6 sm:p-10 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <h1 className="text-3xl font-semibold tracking-tight mb-6">Đăng ký</h1>

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
                      type={isPasswordVisible ? "text" : "password"}
                      label="Mật khẩu"
                      labelPlacement="outside"
                      placeholder="Nhập mật khẩu của bạn"
                      value={formData.password}
                      onChange={handleInputChange}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={togglePasswordVisibility}
                        >
                          {isPasswordVisible ? (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      }
                    />

                    <Input
                      isRequired
                      name="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      label="Xác nhận mật khẩu"
                      labelPlacement="outside"
                      placeholder="Xác nhận mật khẩu của bạn"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {isConfirmPasswordVisible ? (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      }
                    />

                    <div className="space-y-2">
                      <div>
                        <Checkbox
                          isSelected={termsAccepted}
                          onValueChange={setTermsAccepted}
                        />
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
                        />
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
                        onSuccess={(user, token, data) => {
                          if (data) {
                            showMessage(data.message || "Đăng ký thành công!", "success");
                            setTimeout(() => {
                              if (data.isNewUser) {
                                router.push("/dang-nhap?message=registration_success");
                              } else {
                                // Already existing user, redirect to role dashboard
                                router.push("/");
                              }
                            }, 1500);
                          } else {
                            // Fallback to original flow
                            sendFirebaseTokenToBackend(user, {
                              name: user.displayName || "",
                              email: user.email || ""
                            });
                          }
                        }}
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
                  src="/assets/homepage/stock-3.jpg"
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