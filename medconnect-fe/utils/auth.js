/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const authToken = localStorage.getItem("authToken");
  return !!authToken;
};

/**
 * Get current user role FROM COOKIE ONLY (set by middleware after backend verification)
 */
export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const roleCookie = cookies.find(c => c.trim().startsWith('userRole='));
  return roleCookie ? roleCookie.split('=')[1] : null;
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("authToken");
};

/**
 * Get user info
 */
export const getUserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  return {
    token: localStorage.getItem("authToken"),
    role: getUserRole(), // Read from cookie, not localStorage
    email: localStorage.getItem("userEmail"),
    name: localStorage.getItem("userName"),
  };
};

/**
 * Save auth data - ONLY TOKEN in localStorage, role in cookie
 */
export const saveAuthData = (token, role, userData = {}) => {
  if (typeof window === 'undefined') return;
  
  // ONLY save token to localStorage (NO ROLE)
  localStorage.setItem("authToken", token);
  
  // Save user metadata (optional)
  if (userData.email) localStorage.setItem("userEmail", userData.email);
  if (userData.name) localStorage.setItem("userName", userData.name);
  
  // Save to cookies (will be verified by middleware)
  document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `userRole=${role}; path=/; max-age=86400; SameSite=Lax`;
};

/**
 * Logout user - clear everything
 */
export const logout = () => {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage (NO userRole here)
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("rememberedEmail");
  localStorage.removeItem("rememberedPassword");
  localStorage.removeItem("rememberMe");
  
  // Clear cookies
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

/**
 * Redirect to dashboard based on role FROM COOKIE
 */
export const redirectToDashboard = (router) => {
  const userRole = getUserRole(); // Read from cookie only
  
  if (!userRole) {
    router.push("/dang-nhap");
    return;
  }
  
  switch (userRole.toUpperCase()) {
    case "ADMIN":
      router.push("/admin/trang-chu");
      break;
    case "DOCTOR":
      router.push("/bac-si/trang-chu");
      break;
    case "PATIENT":
      router.push("/nguoi-dung/trang-chu");
      break;
    default:
      router.push("/");
  }
};

/**
 * Check permission (read from cookie, no localStorage)
 */
export const hasPermission = (requiredRole) => {
  const userRole = getUserRole(); // Read from cookie
  
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.map(r => r.toUpperCase()).includes(userRole.toUpperCase());
  }
  
  return userRole.toUpperCase() === requiredRole.toUpperCase();
};
