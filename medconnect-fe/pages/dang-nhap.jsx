import React, { useState, useEffect } from "react";
import SocialLoginButtons from "@/components/ui/SocialLogin";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Default } from "@/components/layouts/";
import { Card, CardBody, Input, Button, Divider, Checkbox } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import RedirectByRole from "../config/Auth/redirectByRole";
import getUserRole from "../config/Auth/GetUserRole";

export default function MedConnectLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    // keep auth state listener if you need it elsewhere, but do NOT auto-redirect here
    // (we let finalizeLogin control redirect after successful backend handshake)
    let unsubscribe;
    if (auth && typeof auth.onAuthStateChanged === "function") {
      unsubscribe = auth.onAuthStateChanged(() => {});
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  // Remember me (email + password persisted if chosen)
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
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // Notify backend with Firebase ID token so server can set httpOnly session/cookie.
  // Returns an object: { ok: boolean, body: parsedJson|null }
  // If fetch (network) throws, sign out from Firebase, keep user on login page and show error.
  const notifyBackendLogin = async (user) => {
    try {
      setIsLoading(true);
      const idToken = await user.getIdToken();
      console.log(idToken);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      let body = null;
      try {
        body = await response.json();
      } catch (e) {
        body = null;
      }

      if (!response.ok) {
        // Backend responded with an error status.
        const errMsg =
          (body && body.message) ||
          (response.status === 401 ? "Email hoặc mật khẩu không đúng!" : "Đăng nhập thất bại từ backend.");
        // Do NOT sign out here per your previous requests — only sign out on fetch/network error.
        setIsLoading(false);
        showMessage(errMsg, "error");
        return { ok: false, body };
      }

      // success
      return { ok: true, body };
    } catch (err) {
      // Network / fetch error (backend not reachable) -> sign out firebase, keep on page, show message
      console.error("Backend notify error:", err);
      try {
        await signOut(auth);
      } catch (signOutErr) {
        console.warn("Failed to sign out after fetch error:", signOutErr);
      }
      setIsLoading(false);
      showMessage("Lỗi kết nối máy chủ. Bạn đã đăng xuất khỏi phiên Firebase. Vui lòng thử lại.", "error");
      // Keep on the login screen (do not redirect)
      return { ok: false, body: null, fetchError: true };
    }
  };

  // finalizeLogin handles backend handshake and role resolution.
  const finalizeLogin = async (firebaseUser) => {
    const notifyRes = await notifyBackendLogin(firebaseUser);
    if (!notifyRes.ok) {
      // If fetch error occurred, notifyBackendLogin already signed out and showed message.
      // Keep the user on the login page (no redirect).
      return;
    }

    // If backend returned role in the login response, use it directly.
    const backendRole = notifyRes.body && (notifyRes.body.role || notifyRes.body.data?.role);
    if (backendRole) {
      showMessage("Đăng nhập thành công!", "success");
      setTimeout(() => setRedirect(true), 200);
      return;
    }

    try {
      // Force refresh the ID token to pick up any newly-set custom claims (if backend or admin set them).
      await firebaseUser.getIdToken(true);
    } catch (err) {
      console.warn("Failed to refresh token:", err);
    }

    // Try to get role via getUserRole (custom claim or backend /user/role)
    const role = await getUserRole(firebaseUser, { fallbackToBackend: true });

    if (role) {
      showMessage("Đăng nhập thành công!", "success");
      setTimeout(() => setRedirect(true), 200);
    } else {
      // Role not available — show warning and do NOT redirect to role dashboards automatically.
      showMessage("Đăng nhập thành công nhưng không thể xác định vai trò. Vui lòng kiểm tra lại.", "warning");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    showMessage("Vui lòng nhập đầy đủ thông tin!", "error");
    return;
  }

  setIsLoading(true);

  try {
    await signOut(auth); 

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Remember me
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
      localStorage.setItem("rememberedPassword", password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");
    }

    await finalizeLogin(userCredential.user);

    if (!redirect) setIsLoading(false);
  } catch (error) {
    console.error("Login error:", error);

    let errorMessage = "Đăng nhập thất bại!";

    // Clear remembered credentials on auth failure
    const clearRemembered = () => {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");
    };

    // Map Firebase error codes to friendly Vietnamese messages
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-login-credentials":
        clearRemembered();
        errorMessage = "Email hoặc mật khẩu không chính xác!";
        break;
      case "auth/invalid-email":
        errorMessage = "Địa chỉ email không hợp lệ!";
        break;
      case "auth/user-disabled":
        clearRemembered();
        errorMessage = "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên!";
        break;
      case "auth/too-many-requests":
        errorMessage = "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ít phút!";
        break;
      case "auth/network-request-failed":
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!";
        break;
      case "auth/popup-closed-by-user":
        errorMessage = "Đăng nhập đã bị hủy!";
        break;
      default:
        // Fallback for unknown errors - show generic message, not raw Firebase error
        console.warn("Unhandled Firebase error code:", error.code);
        errorMessage = "Đăng nhập thất bại. Vui lòng thử lại!";
        // Log full error for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("Full error:", error);
        }
    }

    showMessage(errorMessage, "error");
    setIsLoading(false);
  }
};


  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  if (redirect) {
    return <RedirectByRole />;
  }

  return (
    <Default title="Đăng nhập - MedConnect">
      <div className="min-h-screen flex items-center justify-center p-10 relative overflow-hidden">
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

                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-yellow-500/10"></div>
                  <div className="absolute top-20 left-20 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
                </div>

        {/* Content */}
        <div className="w-full min-h-[60vh] grid place-items-center p-4 sm:p-6 relative z-10">
          <Card
            isBlurred
            shadow="lg"
            className="w-full max-w-5xl border border-white/20 bg-white/90 backdrop-blur-md dark:bg-default-100/50 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <CardBody className="p-6 sm:p-10">
                <div className="max-w-sm">
                  <h1 className="text-3xl font-semibold tracking-tight mb-6">Đăng nhập</h1>

                  {/* Error/Success Message */}
                  {message.text && (
                    <div
                      className={`p-3 rounded-lg mb-4 text-sm ${
                        message.type === "error"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : message.type === "success"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                    <Input
                      isRequired
                      type="email"
                      label="Email"
                      labelPlacement="outside"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                      isRequired
                      type={isPasswordVisible ? "text" : "password"}
                      label="Mật khẩu"
                      labelPlacement="outside"
                      placeholder="Nhập mật khẩu của bạn"
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
                      <Link href="/quen-mat-khau" className="text-sm text-primary hover:underline">
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <Button
                      color="primary"
                      size="md"
                      type="submit"
                      className="mt-2"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>

                    <Divider className="my-2" />
                    <div className="flex items-center justify-center">
                      <SocialLoginButtons
                        autoRedirect={true}
                        onSuccess={(user, token, data) => {
                          if (data) {
                            showMessage(data.message || "Đăng nhập thành công!", "success");
                            setTimeout(() => setRedirect(true), 500);
                          } else {
                            // Fallback to original flow if data not provided
                            finalizeLogin(user);
                          }
                        }}
                        onError={(msg) => showMessage(msg, "error")}
                      />
                    </div>
                  </form>

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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </CardBody>

              {/* RIGHT: Welcome panel */}
              <CardBody className="hidden md:flex p-0">
                <Image
                  src="/assets/homepage/stock-6.jpg"
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