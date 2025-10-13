import React, { useState, useEffect } from "react";
import SocialLoginButtons from "@/components/ui/SocialLogin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Default } from "@/components/layouts/";
import Meta from "@/components/layouts/Meta";
import { Card, CardBody, Input, Button, Form, Divider, Checkbox } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { saveAuthData, isAuthenticated, redirectToDashboard } from "@/utils/auth";

export default function MedConnectLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Redirect if already logged in (client session)
  useEffect(() => {
    if (isAuthenticated()) {
      redirectToDashboard(router);
    }
  }, [router]);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // send firebase idToken to backend, save returned auth token & role
  const sendFirebaseTokenToBackend = async (user) => {
    try {
      setIsLoading(true);
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          showMessage("Email hoặc mật khẩu không đúng!", "error");
        } else {
          const text = await response.text().catch(() => null);
          console.error("Backend login error:", response.status, text);
          showMessage("Đăng nhập thất bại từ backend.", "error");
        }
        return;
      }

      const data = await response.json();
      // save token + role + optional user info (will also set cookies)
      saveAuthData(data.token, data.role, { email: data.email || user.email, name: data.name || user.displayName });

      showMessage("Đăng nhập thành công!", "success");

      // redirect to role dashboard
      setTimeout(() => redirectToDashboard(router), 700);
    } catch (error) {
      console.error("sendFirebaseTokenToBackend error:", error);
      showMessage("Lỗi kết nối máy chủ.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Email/password login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      showMessage("Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // remember credentials if requested
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
      console.error("Email login error:", error);
      showMessage("Đăng nhập thất bại. Kiểm tra lại thông tin!", "error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Meta 
        title="Đăng nhập"
        description="Đăng nhập vào MedConnect để đặt lịch khám bệnh với các bác sĩ chuyên khoa"
      />
      <Default>
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
                        <Link href="/quen-mat-khau" className="text-sm text-primary hover:underline ml-5">
                          Quên mật khẩu?
                        </Link>
                      </div>

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

                      <div className="flex items-center justify-center">
                        <SocialLoginButtons
                          onSuccess={(user) => sendFirebaseTokenToBackend(user)}
                          onError={(msg) => showMessage(msg, "error")}
                        />
                      </div>
                    </Form>

                    <Link
                      href="/dang-ky"
                      className="mt-8 inline-flex items-center gap-2 text-gray-400 underline underline-offset-4"
                    >
                      Chưa có tài khoản? Đăng ký ngay
                      {/* ...icon... */}
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
    </>
  );
}