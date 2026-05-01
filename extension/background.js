const API_BASE_URL = "http://localhost:5000/api";
const CHECK_INTERVAL_MS = 60 * 1000;
const notificationArticleMap = {};
const NOTIFICATION_ICON_URL = "/icon.png";

console.log("ReadFlow background service worker started");

// This helper shows a Chrome notification for one article.
// A local icon path is required for extension notifications.
const showReadNotification = (articleId, articleTitle, articleUrl) => {
  const notificationId = `read-${articleId}`;

  console.log("Showing notification for article:", articleId, articleTitle);

  notificationArticleMap[notificationId] = {
    articleId,
    articleUrl
  };

  chrome.notifications.create(
    notificationId,
    {
      type: "basic",
      iconUrl: NOTIFICATION_ICON_URL,
      title: "Time to Read",
      message: `Your scheduled article is ready: ${articleTitle}`,
      priority: 2
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log("Notification create error:", chrome.runtime.lastError.message);
      }
    }
  );
};

// Fetch scheduled articles that are ready right now.
const fetchScheduledReadyArticles = async () => {
  const { token } = await chrome.storage.local.get("token");

  if (!token) {
    console.log("No token found, skipping scheduled article check");
    return [];
  }

  console.log("Checking backend for scheduled-ready articles");

  const response = await fetch(`${API_BASE_URL}/articles/scheduled-ready`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch scheduled-ready articles");
  }

  return data;
};

// Mark an article as notified after the user clicks the notification.
const markArticleAsNotified = async (articleId) => {
  const { token } = await chrome.storage.local.get("token");

  if (!token) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/articles/mark-notified/${articleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to mark article as notified");
  }

  console.log("Marked article as notified:", articleId);
};

// Find due scheduled articles, notify once, and store notified ids in chrome.storage.
const checkScheduledArticles = async () => {
  try {
    const articles = await fetchScheduledReadyArticles();
    const readyArticleIds = articles.map((article) => article._id);
    const { notifiedScheduledArticles = [] } = await chrome.storage.local.get(
      "notifiedScheduledArticles"
    );

    // Remove ids that are no longer ready, so future schedules can notify again.
    const updatedNotifiedIds = notifiedScheduledArticles.filter((articleId) =>
      readyArticleIds.includes(articleId)
    );

    for (const article of articles) {
      // Notify only if this article id has not been notified already.
      if (updatedNotifiedIds.includes(article._id)) {
        continue;
      }

      showReadNotification(article._id, article.title, article.url);
      updatedNotifiedIds.push(article._id);
    }

    await chrome.storage.local.set({
      notifiedScheduledArticles: updatedNotifiedIds
    });

    console.log("Scheduled article check completed. Ready articles:", articles.length);
  } catch (error) {
    console.log("Scheduled article check failed:", error.message);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("ReadFlow extension installed");

  // This test notification confirms the notification system is alive.
  chrome.notifications.create(
    "readflow-install-test",
    {
      type: "basic",
      iconUrl: NOTIFICATION_ICON_URL || "icon.png",
      title: "Time to Read",
      message: "ReadFlow notifications are ready.",
      priority: 2
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log("Install notification error:", chrome.runtime.lastError.message);
      }
    }
  );

  checkScheduledArticles();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("ReadFlow extension started");
  checkScheduledArticles();
});

// Poll backend every 1 minute for ready scheduled articles.
setInterval(() => {
  console.log("Running scheduled article poll");
  checkScheduledArticles();
}, CHECK_INTERVAL_MS);

// Notification clicks open the article and then notify the backend.
chrome.notifications.onClicked.addListener(async (notificationId) => {
  const notificationData = notificationArticleMap[notificationId];

  console.log("Notification clicked:", notificationId);

  if (!notificationData) {
    return;
  }

  chrome.tabs.create({ url: notificationData.articleUrl });

  try {
    await markArticleAsNotified(notificationData.articleId);
  } catch (error) {
    console.log("Failed to mark article as notified:", error.message);
  }

  delete notificationArticleMap[notificationId];
  chrome.notifications.clear(notificationId);
});
