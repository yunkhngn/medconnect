import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import Loading from "../components/ui/loading"
export default function RedirectByRole() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const token = await user.getIdTokenResult();
        const role = token.claims.role?.toLowerCase();

        switch (role) {
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "doctor":
            router.push("/doctor/dashboard");
            break;
          case "patient":
            router.push("/patient/dashboard");
            break;
          default:
            router.push("/403");
            break;
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      }
    };

    checkUser();
  }, [router]);

  return (
    <div>
      <Loading/>
    </div>
  );
}
