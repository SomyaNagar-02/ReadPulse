# ReadFlow Chrome Extension

`manifest.json` must stay valid JSON, so comments cannot be written inside it.  
This file explains what each field does:

- `manifest_version`: Tells Chrome this extension uses Manifest V3.
- `name`: The extension name shown in Chrome.
- `version`: The current version of the extension.
- `description`: A short summary of what the extension does.
- `permissions`: Requests access to `activeTab`, `idle`, and `storage`.
- `host_permissions`: Allows the extension to call the local backend API.
- `background`: Runs `background.js` as the Manifest V3 service worker.
- `action`: Defines the extension button behavior.
- `default_popup`: Opens `popup.html` when the extension icon is clicked.

## Smart Reading Suggestion Flow

This feature is intentionally behavior-driven:

1. `background.js` watches for browser startup and idle time.
2. When a logged-in user seems available, it stores a quiet pending nudge and marks the extension button.
3. `popup.html` shows the small "Got some free time?" UI.
4. `popup.js` handles UI clicks for 5, 10, or 30 minutes.
5. `api.js` calls `/api/articles/suggestions?minutes=...`.
6. The backend returns up to 3 older, unfinished articles where `readingTime <= minutes`.

The extension avoids notification spam by throttling nudges to once per hour.

## File Responsibilities

- `background.js`: Behavior trigger logic only.
- `api.js`: Backend request helpers only.
- `popup.html`: Popup layout and styles.
- `popup.js`: Popup interaction and rendering logic.
