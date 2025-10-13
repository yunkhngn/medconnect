import React, { useState, useEffect } from "react";
import SocialLoginButtons from "@/components/ui/SocialLogin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Default } from "@/components/layouts/";
import { Card, CardBody, Input, Button, Form, Divider, Checkbox } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import RedirectByRole from "../config/Auth/redirectByRole";

export default function MedConnectLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [redirect, setRedirect] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

    // Gửi token Firebase về backend để xác thực
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
                showMessage("Đăng nhập thành công!", "success");
                setRedirect(true);
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

    // Xử lý đăng nhập bằng email/password
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

            // Lưu thông tin "Ghi nhớ đăng nhập"
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
            showMessage("Email hoặc mật khẩu không tồn tại!", "error");
            setIsLoading(false);
        }
    };

    if (redirect) {
        return <RedirectByRole />;
    }

    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    // Message style mapping
    const messageTypeStyles = {
        info: "bg-blue-100 text-blue-800 border-blue-300",
        success: "bg-green-100 text-green-800 border-green-300",
        error: "bg-red-100 text-red-800 border-red-300",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };

    return (
        <Default title="Đăng nhập - MedConnect" >
            <div className="min-h-screen flex items-center justify-center p-10 bg-cover bg-center bg-no-repeat relative">
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

                                    {/* Message Section */}
                                    {message.text && (
                                        <div
                                            className={`mb-4 px-4 py-3 border rounded transition-all duration-300 ${
                                                messageTypeStyles[message.type] || messageTypeStyles.info
                                            }`}
                                            role="alert"
                                        >
                                            {message.text}
                                        </div>
                                    )}

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
                                            errorMessage="Hãy nhập email hợp lệ"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                        <Input
                                            isRequired
                                            name="password"
                                            type={isPasswordVisible ? "text" : "password"}
                                            label="Mật khẩu"
                                            labelPlacement="outside"
                                            placeholder="Nhập mật khẩu của bạn"
                                            errorMessage="Mật khẩu là bắt buộc"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            fill="none"
                                            className="size-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                            />
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