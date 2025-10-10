"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import Loading from "../../components/ui/loading";

export default function RedirectByRole() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Đảm bảo code chỉ chạy trên client
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/");
        return;
      }

      const role = localStorage.getItem("userRole")?.toLowerCase();

      if (role) {
        switch (role) {
          case "admin":
            router.push("/admin/trang-chu");
            break;
          case "doctor":
            router.push("/bac-si/trang-chu");
            break;
          case "patient":
            router.push("/nguoi-dung/trang-chu");
            break;
          default:
            router.push("/403");
            break;
        }
      } else {
        router.push("/");
      }
    };

    checkUser();
  }, [isClient, router]);

  return <Loading />;
}
