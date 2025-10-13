/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const authToken = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  
  return !!(authToken && userRole);
};

/**
 * Get current user role
 */
export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("userRole");
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("authToken");
};

/**
 * Get user info from localStorage
 */
export const getUserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  return {
    token: localStorage.getItem("authToken"),
    role: localStorage.getItem("userRole"),
    email: localStorage.getItem("userEmail"),
    name: localStorage.getItem("userName"),
  };
};

/**
 * Save auth data to localStorage and cookies
 */
export const saveAuthData = (token, role, userData = {}) => {
  if (typeof window === 'undefined') return;
  
  // Save to localStorage
  localStorage.setItem("authToken", token);
  localStorage.setItem("userRole", role);
  
  if (userData.email) localStorage.setItem("userEmail", userData.email);
  if (userData.name) localStorage.setItem("userName", userData.name);
  
  // Save to cookies for middleware
  document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `userRole=${role}; path=/; max-age=86400; SameSite=Lax`;
};

/**
 * Logout user
 */
export const logout = () => {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
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
 * Redirect to dashboard based on role
 */
export const redirectToDashboard = (router) => {
  const userRole = getUserRole();
  
  if (!userRole) {
    router.push("/dang-nhap");
    return;
  }
  
  switch (userRole) {
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
 * Check if user has permission to access route
 */
export const hasPermission = (requiredRole) => {
  const userRole = getUserRole();
  
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};
