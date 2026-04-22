const API_BASE_URL = "http://localhost:5000/api";

// API helpers live in one file so the popup UI does not repeat fetch logic.
const ReadFlowApi = {
  async getToken() {
    const { token } = await chrome.storage.local.get("token");
    return token;
  },

  async request(endpoint, options = {}) {
    const token = await this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    // Protected backend routes expect this JWT in the Authorization header.
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  },

  login(userData) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  },

  saveArticle(articleData) {
    return this.request("/articles/add", {
      method: "POST",
      body: JSON.stringify(articleData)
    });
  },

  getReadingSuggestions(minutes) {
    // The backend handles the real suggestion rules: time fit, older first, max 3.
    return this.request(`/articles/suggestions?minutes=${minutes}`);
  },

  updateArticleStatus(articleId, status) {
    return this.request(`/articles/${articleId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  }
};
