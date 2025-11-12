import React, { useState } from "react";
import { Card, CardBody, Input, Button, Divider } from "@heroui/react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Default } from "@/components/layouts/";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      showMessage("Vui lòng nhập email!", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Send Firebase password reset email (with valid reset token)
      await sendPasswordResetEmail(auth, email);
      
      showMessage("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.", "success");

      setTimeout(() => {
        router.push("/dang-nhap");
      }, 3000);
    } catch (error) {
      let errorMessage = "Gửi email thất bại. Vui lòng thử lại.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Email không tồn tại trong hệ thống.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ.";
      }

      showMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Default title="Quên mật khẩu - MedConnect">
      <div className="min-h-screen flex items-center justify-center p-10 bg-cover bg-center bg-no-repeat relative">
        <div className="w-full min-h-[60vh] grid place-items-center p-4 sm:p-6">
          <Card
            isBlurred
            shadow="sm"
            className="w-full max-w-5xl border-none bg-background/60 dark:bg-default-100/50 rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LEFT: Reset Password form */}
              <CardBody className="p-6 sm:p-10">
                <div className="max-w-sm">
                  <h1 className="text-3xl font-semibold tracking-tight mb-4">Quên mật khẩu?</h1>
                  <p className="text-gray-600 mb-6">
                    Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
                  </p>

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

                  <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <Input
                      isRequired
                      name="email"
                      type="email"
                      label="Email"
                      labelPlacement="outside"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <Button
                      color="primary"
                      size="md"
                      type="submit"
                      className="mt-2"
                      disabled={isLoading}
                      isLoading={isLoading}
                    >
                      {isLoading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                    </Button>

                    <Divider className="my-2" />

                    <div className="flex items-center justify-center gap-4 text-sm">
                      <Link href="/dang-nhap" className="text-primary hover:underline">
                        Quay lại đăng nhập
                      </Link>
                      <span className="text-gray-400">|</span>
                      <Link href="/dang-ky" className="text-primary hover:underline">
                        Tạo tài khoản mới
                      </Link>
                    </div>
                  </form>
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
};

export default ForgotPassword;