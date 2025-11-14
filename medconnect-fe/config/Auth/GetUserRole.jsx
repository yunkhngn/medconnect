import { getAuth, getIdTokenResult } from "firebase/auth";
import { getApiUrl } from "@/utils/api";
const API_URL = getApiUrl();

export async function getUserRole(user = null, { fallbackToBackend = true } = {}) {
  try {
    const auth = getAuth();
    const currentUser = user || auth.currentUser;

    if (!currentUser) {
      return null;
    }
    try {
      const tokenResult = await getIdTokenResult(currentUser);
      const claimRole = tokenResult?.claims?.role || tokenResult?.claims?.rol || tokenResult?.claims?.user_role;
      if (claimRole) {
        return String(claimRole).toLowerCase();
      }
    } catch (claimErr) {
      console.warn("Failed to read ID token claims:", claimErr);
    }

    if (fallbackToBackend) {
      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch(`${API_URL}/user/role`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          console.warn("Backend role endpoint returned non-ok status:", res.status);
          return null;
        }

        const data = await res.json();
        const backendRole = data?.role;
        return backendRole ? String(backendRole).toLowerCase() : null;
      } catch (backendErr) {
        console.error("Error fetching role from backend:", backendErr);
        return null;
      }
    }

    return null;
  } catch (err) {
    console.error("getUserRole error:", err);
    return null;
  }
}

export default getUserRole;