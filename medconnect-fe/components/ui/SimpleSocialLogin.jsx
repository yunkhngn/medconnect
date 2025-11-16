import React, { useState } from "react";
import { Button } from "@heroui/react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/router";
import { getRoleRedirectPath } from "@/utils/roleRedirect";
import { generateWelcomeEmail } from "@/utils/emailTemplates";
import { sendEmailViaAPI } from "@/utils/emailHelper";
import { getApiUrl } from "@/utils/api";

export default function SimpleSocialLogin({ buttonText = "Đăng nhập với Google", showMessage }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const apiUrl = getApiUrl();
      
      // Try login first
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (loginResponse.ok) {
        // Existing user - redirect to appropriate dashboard
        const loginData = await loginResponse.json();
        const userRole = loginData.role || loginData.data?.role;
        
        if (showMessage) showMessage("Đăng nhập thành công!", "success");
        
        setTimeout(() => {
          const redirectPath = getRoleRedirectPath(userRole);
          router.push(redirectPath);
        }, 500);
        return;
      }

      // If login failed with 404, try register
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
            role: 'PATIENT'
          }),
        });

        if (registerResponse.ok) {
          if (showMessage) showMessage("Tài khoản mới đã được tạo thành công!", "success");
          
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
          
          setTimeout(() => {
            router.push('/nguoi-dung/trang-chu'); // New users go to patient dashboard
          }, 1000);
          return;
        }
      }

      // Handle other errors
      const errorData = await loginResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Đăng nhập thất bại");

    } catch (error) {
      console.error("Google auth error:", error);
      
      // Clean up Firebase user on error
      if (auth.currentUser && error.code !== "auth/popup-closed-by-user") {
        try {
          await auth.currentUser.delete();
        } catch (delErr) {
          console.warn("Failed to delete Firebase user:", delErr);
        }
      }

      if (error.code === "auth/popup-closed-by-user") {
        if (showMessage) showMessage("Đăng nhập đã bị hủy", "warning");
      } else {
        if (showMessage) showMessage(error.message || "Lỗi đăng nhập Google", "error");
      }
    } finally {
      setIsLoading(false);
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
      onClick={handleGoogleAuth}
    >
      {isLoading ? "Đang xử lý..." : buttonText}
    </Button>
  );
}