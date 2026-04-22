const loginSection = document.getElementById("loginSection");
const assistantSection = document.getElementById("assistantSection");
const saveSection = document.getElementById("saveSection");
const popupDescription = document.getElementById("popupDescription");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const saveButton = document.getElementById("saveArticleButton");
const logoutButtons = document.querySelectorAll(".logout-button");
const messageBox = document.getElementById("message");
const timeButtons = document.querySelectorAll("[data-minutes]");
const suggestionList = document.getElementById("suggestionList");

const showMessage = (text, color = "#b8bec9") => {
  messageBox.textContent = text;
  messageBox.style.color = color;
};

const showSection = (section) => {
  loginSection.classList.remove("active");
  assistantSection.classList.remove("active");
  saveSection.classList.remove("active");
  section.classList.add("active");
};

const getCurrentTab = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        reject(new Error("No active tab found"));
        return;
      }

      resolve(tabs[0]);
    });
  });
};

const renderLoggedOut = () => {
  showSection(loginSection);
  popupDescription.textContent = "Login once to enable quick saving and reading suggestions.";
};

const renderAssistant = (isNudge) => {
  showSection(assistantSection);
  popupDescription.textContent = isNudge
    ? "Got some free time?"
    : "Pick a time window and ReadFlow will suggest a few saved articles.";
};

const renderSuggestions = (articles, minutes) => {
  suggestionList.innerHTML = "";

  // Empty results are normal. The assistant should be helpful, not noisy.
  if (articles.length === 0) {
    suggestionList.innerHTML = `<p class="helper-text">No saved articles fit ${minutes} minutes yet.</p>`;
    return;
  }

  articles.forEach((article) => {
    const item = document.createElement("div");
    const text = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    const openButton = document.createElement("button");

    item.className = "suggestion-item";
    openButton.type = "button";
    openButton.textContent = "Open";
    title.textContent = article.title;
    meta.textContent = `${article.readingTime} min read`;

    text.append(title, meta);
    item.append(text, openButton);

    openButton.addEventListener("click", async () => {
      // Opening from a suggestion means the user chose to read it now.
      await ReadFlowApi.updateArticleStatus(article._id, "reading");
      chrome.tabs.create({ url: article.url });
      showMessage("Opened article and marked it as reading.", "#22c55e");
    });

    suggestionList.appendChild(item);
  });
};

const initializePopup = async () => {
  const { token, pendingReadingNudge } = await chrome.storage.local.get([
    "token",
    "pendingReadingNudge"
  ]);

  if (!token) {
    renderLoggedOut();
    return;
  }

  // Once the popup is opened, the quiet badge nudge has done its job.
  await chrome.action.setBadgeText({ text: "" });
  await chrome.storage.local.remove("pendingReadingNudge");
  renderAssistant(Boolean(pendingReadingNudge));
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    loginButton.disabled = true;
    showMessage("Logging in...", "#6c5ce7");

    const data = await ReadFlowApi.login({
      email: emailInput.value,
      password: passwordInput.value
    });

    await chrome.storage.local.set({ token: data.token });
    loginForm.reset();
    renderAssistant(false);
    showMessage("Login successful.", "#22c55e");
  } catch (error) {
    showMessage(error.message || "Login failed.", "#ef4444");
  } finally {
    loginButton.disabled = false;
  }
});

timeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const minutes = Number(button.dataset.minutes);

    try {
      suggestionList.innerHTML = "";
      showMessage(`Finding reads under ${minutes} minutes...`, "#6c5ce7");

      // Suggestions are fetched only after the user says how much time they have.
      const articles = await ReadFlowApi.getReadingSuggestions(minutes);
      renderSuggestions(articles, minutes);
      showMessage("Suggestions ready.", "#22c55e");
    } catch (error) {
      showMessage(error.message || "Could not load suggestions.", "#ef4444");
    }
  });
});

saveButton.addEventListener("click", async () => {
  try {
    showMessage("Saving article...", "#6c5ce7");

    const currentTab = await getCurrentTab();

    await ReadFlowApi.saveArticle({
      title: currentTab.title,
      url: currentTab.url
    });

    showMessage("Article saved successfully.", "#22c55e");
  } catch (error) {
    showMessage(error.message || "Something went wrong.", "#ef4444");
  }
});

logoutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await chrome.storage.local.remove(["token", "pendingReadingNudge"]);
    renderLoggedOut();
    showMessage("Logged out successfully.", "#22c55e");
  });
});

document.getElementById("saveModeButton").addEventListener("click", () => {
  showSection(saveSection);
  popupDescription.textContent = "Save the current page to your reading list.";
});

document.getElementById("assistantModeButton").addEventListener("click", () => {
  renderAssistant(false);
});

initializePopup();
