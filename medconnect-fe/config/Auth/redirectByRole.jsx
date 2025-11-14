"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import { getApiUrl } from "@/utils/api";

export default function RedirectByRole() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // All hooks must be called at the top level
    useEffect(() => {
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

            try {
                const token = await user.getIdToken();

                const res = await fetch(
                    `${getApiUrl()}/user/role`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.status === 401 || res.status === 403) {
                    router.push("/");
                    return;
                }

                if (!res.ok) {
                    router.push("/");
                    return;
                }

                const data = await res.json();
                const role = data.role?.toLowerCase();

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
                        router.push("/");
                        break;
                }
            } catch (err) {
                console.error("Error checking user role:", err);
                router.push("/");
            }
        };

        checkUser();
    }, [isClient, router]);

    return null;
}
