import React, { useState } from "react";
import { Button } from "@heroui/react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/router";
import { getRoleRedirectPath } from "@/utils/roleRedirect";
import { generateWelcomeEmail } from "@/utils/emailTemplates";
import { sendEmailViaAPI } from "@/utils/emailHelper";

export default function SocialLoginButtons({ onSuccess, onError, autoRedirect = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getFriendlyError = (err, providerName) => {
    if (!err) return `${providerName} login failed.`;
    if (err.code === "auth/popup-closed-by-user")
      return `${providerName} login cancelled.`;
    if (err.code === "auth/cancelled-popup-request")
      return `${providerName} cancelled.`;
    return `${providerName} login failed. Please try again.`;
  };

  const handleLogin = async (provider, providerName) => {
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);

      if (!result?.user) throw new Error(`${providerName} login aborted.`);
      
      const user = result.user;
      const token = await user.getIdToken();

      // Automatically handle login/register with backend
      await handleBackendAuthentication(user, token, providerName);

    } catch (err) {
      console.warn(`${providerName} login error:`, err);

      if (
        err.code !== "auth/popup-closed-by-user" &&
        err.code !== "auth/cancelled-popup-request"
      ) {
        if (auth.currentUser) {
          try {
            await auth.currentUser.delete();
            console.log("Temporary Firebase user deleted.");
          } catch (delErr) {
            console.warn("Cannot delete temp user:", delErr.message);
          }
        }
      }

      const msg = getFriendlyError(err, providerName);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackendAuthentication = async (user, token, providerName) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      
      // First, try login
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

        if (loginResponse.ok) {
          // User exists - login successful
          const loginData = await loginResponse.json();
          const userRole = loginData.role || loginData.data?.role;
          
          if (autoRedirect && userRole) {
            // Auto redirect to role dashboard
            const redirectPath = getRoleRedirectPath(userRole);
            router.push(redirectPath);
          } else if (onSuccess) {
            onSuccess(user, token, { 
              isNewUser: false, 
              role: userRole,
              message: "Đăng nhập thành công!"
            });
          }
          return;
        }      // If login failed with 404 (user not found), try register
      if (loginResponse.status === 404) {
        const registerResponse = await fetch(`${apiUrl}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: user.phoneNumber || '',
            role: 'PATIENT' // Default role for social registration
          }),
        });

        if (registerResponse.ok) {
          // Registration successful
          const registerData = await registerResponse.json();
          
          // Send welcome email to new user
          try {
            const userName = user.displayName || user.email?.split('@')[0] || 'Bạn';
            const { subject, html } = generateWelcomeEmail(userName, user.email);
            await sendEmailViaAPI(user.email, subject, html);
            console.log("✅ Welcome email sent to new Google user");
          } catch (emailError) {
            console.error("⚠️ Failed to send welcome email:", emailError);
            // Don't block registration flow if email fails
          }
          
          if (autoRedirect) {
            // Auto redirect to patient dashboard for new users
            router.push('/nguoi-dung/trang-chu');
          } else if (onSuccess) {
            onSuccess(user, token, { 
              isNewUser: true, 
              role: 'PATIENT',
              message: "Tài khoản mới đã được tạo thành công!"
            });
          }
          return;
        } else {
          // Registration failed
          const errorData = await registerResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Đăng ký thất bại từ ${providerName}`);
        }
      }

      // Other login errors
      const errorData = await loginResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Đăng nhập ${providerName} thất bại`);

    } catch (error) {
      console.error(`Backend ${providerName} authentication error:`, error);
      
      // Clean up Firebase user on backend error
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (delErr) {
          console.warn("Failed to delete Firebase user after backend error:", delErr);
        }
      }
      
      if (onError) {
        onError(error.message || `Lỗi kết nối máy chủ khi đăng nhập ${providerName}`);
      }
    }
  };

  return (
    <Button
      color="warning"
      variant="flat"
      disabled={isLoading}
      isLoading={isLoading}
      size="md"
      fullWidth
      startContent={
        !isLoading && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
        )
      }
      onClick={() => handleLogin(googleProvider, "Google")}
    >
      Google
    </Button>
  );
}
