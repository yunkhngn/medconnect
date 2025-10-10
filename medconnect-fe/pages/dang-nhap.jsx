import React, { useState, useEffect } from "react";
import SocialLoginButtons from "@/components/ui/SocialLogin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Default } from "@/components/layouts/";
import { Card, CardBody, Input, Button, Form, Divider, Checkbox } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";

export default function MedConnectLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const wasRemembered = localStorage.getItem("rememberMe") === "true";

    if (wasRemembered && savedEmail) {
      setEmail(savedEmail);
      setPassword(savedPassword || "");
      setRememberMe(true);
    }
  }, []);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // Gửi token Firebase về backend
  const sendFirebaseTokenToBackend = async (user) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:8080/api/auth/login", {
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
            window.location.href = "/bac-si/trang-chu";
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

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.removeItem("rememberMe");
      }

      await sendFirebaseTokenToBackend(userCredential.user);
    } catch (error) {
      showMessage("Đăng nhập thất bại. Kiểm tra lại thông tin!", "error");
      setIsLoading(false);
    }
  };

  return (
    <Default title="Đăng nhập - MedConnect" >
      <div className="min-h-screen flex items-center justify-center p-10 bg-cover bg-center bg-no-repeat relative "
      >
        <div className="w-full min-h-[60vh] grid place-items-center p-4 sm:p-6">
          <Card
            isBlurred
            shadow="sm"
            className="w-full max-w-5xl border-none bg-background/60 dark:bg-default-100/50 rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LEFT: Login form */}
              <CardBody className="p-6 sm:p-10">
                <div className="max-w-sm">
                  <h1 className="text-3xl font-semibold tracking-tight mb-6">Đăng nhập</h1>

                  <Form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => { e.preventDefault(); handleEmailLogin(); }}
                  >
                    <Input
                      isRequired
                      name="email"
                      type="text"
                      label="Email"
                      labelPlacement="outside"
                      placeholder="example@gmail.com"
                      errorMessage="Please enter a valid email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                      isRequired
                      name="password"
                      type="password"
                      label="Mật khẩu"
                      labelPlacement="outside"
                      placeholder="Nhập mật khẩu của bạn"
                      errorMessage="Mật khẩu là bắt buộc"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <Checkbox
                        size="sm"
                        isSelected={rememberMe}
                        onValueChange={setRememberMe}
                      >
                        <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                      </Checkbox>
                    </div>
                    <Link href="#" className="text-sm text-primary hover:underline">
                        Quên mật khẩu?
                      </Link>
                    <Button
                      color="primary"
                      size="md"
                      type="submit"
                      className="mt-2"
                      disabled={isLoading}
                    >
                      {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>

                    <Divider className="my-2" />

                    <div className="flex items-center justify-center gap-3">
                      <SocialLoginButtons
                        onSuccess={(user) => sendFirebaseTokenToBackend(user)}
                        onError={(msg) => showMessage(msg, "error")}
                      />
                    </div>
                  </Form>
                  <Link
                    href="/dang-ki"
                    className="mt-8 inline-flex items-center gap-2 text-gray-400 underline underline-offset-4"
                  >
                    Chưa có tài khoản? Đăng ký ngay
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

function IconBrand({ name }) {
  const paths = {
    google: (
      <path d="M21 12.23c0-4.74-3.96-8.73-8.73-8.73A8.73 8.73 0 106 19.1 8.3 8.3 0 0121 12.23Z" />
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
