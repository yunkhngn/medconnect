// Utils for role-based redirects without AuthGuard dependency
import { getApiUrl } from "./api";

export const getRoleRedirectPath = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return '/admin/trang-chu';
    case 'DOCTOR':
      return '/bac-si/trang-chu';
    case 'PATIENT':
      return '/nguoi-dung/trang-chu';
    default:
      return '/'; // Default homepage
  }
};

export const redirectByRole = (router, role) => {
  const path = getRoleRedirectPath(role);
  router.push(path);
};

// Auto redirect with role detection from Firebase user
export const autoRedirectByUserRole = async (router, firebaseUser) => {
  try {
    // Try to get role from custom claims first
    const token = await firebaseUser.getIdTokenResult();
    let role = token.claims.role;

    // If no role in claims, try to get from backend
    if (!role) {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/user/role`, {
        headers: {
          'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        role = data.role;
      }
    }

    // Redirect based on role
    if (role) {
      redirectByRole(router, role);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error detecting user role:', error);
    return false;
  }
};