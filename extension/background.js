const NUDGE_COOLDOWN_MS = 60 * 60 * 1000;
const IDLE_AFTER_SECONDS = 5 * 60;

// Chrome calls this file in the background because Manifest V3 uses a service worker.
// The worker does not fetch articles. It only decides when a gentle nudge is appropriate.
chrome.idle.setDetectionInterval(IDLE_AFTER_SECONDS);

chrome.runtime.onInstalled.addListener(() => {
  chrome.idle.setDetectionInterval(IDLE_AFTER_SECONDS);
});

chrome.runtime.onStartup.addListener(() => {
  createReadingNudge("startup");
});

chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle") {
    createReadingNudge("idle");
  }
});

const createReadingNudge = async (reason) => {
  const { token, lastReadingNudgeAt } = await chrome.storage.local.get([
    "token",
    "lastReadingNudgeAt"
  ]);

  // If the user is not logged in, the assistant stays quiet.
  if (!token) {
    return;
  }

  const now = Date.now();

  // This keeps the assistant from feeling like notification spam.
  if (lastReadingNudgeAt && now - lastReadingNudgeAt < NUDGE_COOLDOWN_MS) {
    return;
  }

  await chrome.storage.local.set({
    lastReadingNudgeAt: now,
    pendingReadingNudge: {
      reason,
      createdAt: now
    }
  });

  chrome.action.setBadgeText({ text: "READ" });
  chrome.action.setBadgeBackgroundColor({ color: "#6c5ce7" });
  chrome.action.setTitle({ title: "Got some free time?" });

  // Some Chrome versions allow an extension to open its popup programmatically.
  // If that is unavailable, the badge still gives a quiet visual cue.
  if (chrome.action.openPopup) {
    try {
      await chrome.action.openPopup();
    } catch (error) {
      console.log("Popup will open when the user clicks the extension:", error);
    }
  }
};
