"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import Loading from "../../components/ui/loading";

export default function RedirectByRole() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

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
                // 🔹 Get Firebase token
                const token = await user.getIdToken();

                // 🔹 Ask backend who this user really is
                const res = await fetch(`http://localhost:8080/api/user/role`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status === 401 || res.status === 403) {
                    router.push("/403");
                    return;
                }

                if (!res.ok) {
                    router.push("/");
                    return;
                }

                const data = await res.json();
                const role = data.role?.toLowerCase();

                // 🔹 Redirect based on actual backend role
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
            } catch (err) {
                console.error("Error checking user role:", err);
                router.push("/");
            }
        };

        checkUser();
    }, [isClient, router]);

    return <Loading />;
}
