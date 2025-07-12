const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Handle form data (for file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login with email/password
  login: async (credentials) => {
    return apiRequest('/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register new user
  register: async (userData) => {
    return apiRequest('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    return apiRequest('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
};

// User API
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    return apiRequest('/users/profile/');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest('/users/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Update user profile with file upload
  updateProfileWithPhoto: async (formData) => {
    return apiRequest('/users/profile/', {
      method: 'PUT',
      body: formData,
    });
  },

  // Get list of users (for browse page)
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/users/list/?${params}`);
  },
};

// Skills API
export const skillsAPI = {
  // Get all skills
  getSkills: async (search = '') => {
    const params = search ? `?name=${encodeURIComponent(search)}` : '';
    return apiRequest(`/skills/${params}`);
  },

  // Create new skill
  createSkill: async (skillData) => {
    return apiRequest('/skills/', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  },
};

// Swap Requests API
export const swapAPI = {
  // Get user's swap requests (sent and received)
  getSwapRequests: async () => {
    return apiRequest('/swaps/');
  },

  // Create new swap request
  createSwapRequest: async (swapData) => {
    return apiRequest('/swaps/', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
  },

  // Accept swap request
  acceptSwapRequest: async (requestId) => {
    return apiRequest(`/swaps/${requestId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    });
  },

  // Reject swap request
  rejectSwapRequest: async (requestId) => {
    return apiRequest(`/swaps/${requestId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected' }),
    });
  },

  // Mark swap as completed
  completeSwapRequest: async (requestId) => {
    return apiRequest(`/swaps/${requestId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
  },

  // Rate a completed swap
  rateSwap: async (requestId, ratingData) => {
    return apiRequest(`/swaps/${requestId}/rate/`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },

  // Get swap statistics for dashboard
  getSwapStats: async () => {
    return apiRequest('/swaps/stats/');
  },

  // Get recent swaps for dashboard
  getRecentSwaps: async () => {
    return apiRequest('/swaps/recent/');
  },
};

// User Skills API
export const userSkillsAPI = {
  // Get user's offered skills
  getOfferedSkills: async () => {
    return apiRequest('/users/skills/offered/');
  },

  // Get user's wanted skills
  getWantedSkills: async () => {
    return apiRequest('/users/skills/wanted/');
  },

  // Add offered skill
  addOfferedSkill: async (skillData) => {
    return apiRequest('/users/skills/offered/', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  },

  // Add wanted skill
  addWantedSkill: async (skillData) => {
    return apiRequest('/users/skills/wanted/', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  },

  // Update skill
  updateSkill: async (skillId, skillData, type) => {
    return apiRequest(`/users/skills/${type}/${skillId}/`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
  },

  // Delete skill
  deleteSkill: async (skillId, type) => {
    return apiRequest(`/users/skills/${type}/${skillId}/`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  // Get all users (admin only)
  getAllUsers: async (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/users/admin/users/${params}`);
  },

  // Get platform statistics
  getPlatformStats: async () => {
    return apiRequest('/admin/stats/');
  },

  // Get all swap requests (admin only)
  getAllSwapRequests: async () => {
    return apiRequest('/admin/swaps/');
  },

  // Ban/unban user
  toggleUserBan: async (userId, isBanned) => {
    return apiRequest(`/users/admin/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_banned: isBanned }),
    });
  },

  // Get reports
  getReports: async () => {
    return apiRequest('/admin/reports/');
  },

  // Resolve report
  resolveReport: async (reportId, resolution) => {
    return apiRequest(`/admin/reports/${reportId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved', resolution }),
    });
  },

  // Get all skills (admin only)
  getAllSkills: async (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/skills/admin/${params}`);
  },

  // Delete (reject) a skill
  deleteSkill: async (skillId) => {
    return apiRequest('/skills/admin/', {
      method: 'DELETE',
      body: JSON.stringify({ id: skillId }),
    });
  },

  // Get all swaps (admin only)
  getAllSwaps: async (status = '') => {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/swaps/admin/${params}`);
  },

  // Send platform-wide message
  sendPlatformMessage: async (messageData) => {
    return apiRequest('/users/admin/messages/', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Download reports
  downloadReport: async (reportType) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/admin/reports/?type=${reportType}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get filename from response headers
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `${reportType}_report.csv`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    const blob = await response.blob();
    return { blob, filename };
  },
};

// Notifications API
export const notificationsAPI = {
  // Get user notifications
  getNotifications: async () => {
    return apiRequest('/users/notifications/');
  },

  // Mark specific notification as read
  markAsRead: async (notificationId) => {
    return apiRequest('/users/notifications/mark-read/', {
      method: 'PATCH',
      body: JSON.stringify({ notification_id: notificationId }),
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiRequest('/users/notifications/mark-read/', {
      method: 'POST',
    });
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Logout (clear token)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  // Set tokens after login
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
}; 