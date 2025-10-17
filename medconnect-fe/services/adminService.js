import { auth } from '@/lib/firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Lấy Firebase token để gửi kèm request
 */
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};

// Whitelist allowed API domains
const ALLOWED_API_DOMAINS = [
  'localhost:8080',
  'api.medconnect.vn',
  process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, ''),
].filter(Boolean);

// Validate URL to prevent SSRF
const validateUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const host = urlObj.host;
    
    if (!ALLOWED_API_DOMAINS.includes(host)) {
      throw new Error('URL not in whitelist');
    }
    
    return url;
  } catch (error) {
    console.error('Invalid URL:', error);
    throw new Error('Invalid or unauthorized URL');
  }
};

/**
 * Lấy danh sách tất cả admin
 */
export const getAllAdmins = async () => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'Không thể lấy danh sách admin';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Lấy thông tin admin theo ID
 */
export const getAdminById = async (id) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'Không thể lấy thông tin admin';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Tạo admin mới
 */
export const createAdmin = async (adminData) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    let errorMessage = 'Không thể tạo admin';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Cập nhật thông tin admin
 */
export const updateAdmin = async (id, adminData) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    let errorMessage = 'Không thể cập nhật admin';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Xóa admin
 */
export const deleteAdmin = async (id) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'Không thể xóa admin';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Khóa/Mở khóa admin
 */
export const toggleAdminStatus = async (id, disabled) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ disabled }),
  });

  if (!response.ok) {
    let errorMessage = 'Không thể thay đổi trạng thái admin';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Đổi mật khẩu admin
 */
export const changeAdminPassword = async (id, newPassword) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}/password`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newPassword }),
  });

  if (!response.ok) {
    let errorMessage = 'Không thể đổi mật khẩu';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

/**
 * Lấy danh sách tất cả admin (cách 2 - với SSRF fix)
 */
export const fetchAdmins = async () => {
  try {
    const url = validateUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin`);
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) {
      let errorMessage = 'Không thể lấy danh sách admin';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin admin (cách 2 - với SSRF fix)
 */
export const updateAdmin = async (id, data) => {
  try {
    const url = validateUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/${encodeURIComponent(id)}`);
    const response = await fetch(url, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'Không thể cập nhật admin';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

/**
 * Xóa admin (cách 2 - với SSRF fix)
 */
export const deleteAdmin = async (id) => {
  try {
    const url = validateUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/${encodeURIComponent(id)}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) {
      let errorMessage = 'Không thể xóa admin';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};
