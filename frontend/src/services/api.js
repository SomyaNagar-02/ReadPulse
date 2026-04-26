const API_BASE_URL = "http://localhost:5000/api";

// This helper reads the saved JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// This helper sends requests to the backend and automatically adds
// the token header when the user is logged in
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // Attach the JWT token automatically if it exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  // Throw a readable error so pages can handle it easily
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const api = {
  // Register a new user account
  register: async (userData) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  },

  // Login does not need a token, so we only send email and password
  login: async (userData) => {
    return request("/users/login", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  },

  // Keep this alias so existing code using loginUser still works
  loginUser: async (userData) => {
    return request("/users/login", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  },

  // Fetch the main article list for the logged-in user
  getArticles: async () => {
    return request("/articles");
  },

  // Fetch all articles with optional query params like status or keyword
  getAllArticles: async (queryParams = "") => {
    const query = queryParams ? `?${queryParams}` : "";
    return request(`/articles/all${query}`);
  },

  // Add a new article for the logged-in user
  addArticle: async (articleData) => {
    return request("/articles/add", {
      method: "POST",
      body: JSON.stringify(articleData)
    });
  },

  // Update article status, for example saved, reading, or scheduled
  updateArticleStatus: async (articleId, status) => {
    return request(`/articles/${articleId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },

  // Schedule an article for a specific future date and time
  scheduleArticle: async (articleId, scheduledAt) => {
    return request(`/articles/schedule/${articleId}`, {
      method: "PUT",
      body: JSON.stringify({ scheduledAt })
    });
  },

  // Delete an article from the logged-in user's library
  deleteArticle: async (articleId) => {
    return request(`/articles/${articleId}`, {
      method: "DELETE"
    });
  }
};
