# 📖 ReadPulse

**ReadPulse** is a behavior-driven **Read-It-Later** platform built using the **MERN Stack** with a **Chrome Extension** for one-click article saving. Unlike traditional bookmarking applications, ReadPulse is designed to help users actually read their saved articles through smart prioritization, scheduling, and timely reminders.

---

## 🚀 Problem Statement

Many users save articles while browsing but rarely return to read them. Traditional bookmarking applications encourage content hoarding rather than content consumption.

ReadPulse addresses this problem by combining frictionless article saving with intelligent reading workflows that encourage users to complete their reading.

---

## ✨ Features

### 🔐 Authentication 
- User Registration & Login
- JWT-based Authentication
- Protected Routes

### 🌐 Chrome Extension
- Save articles directly from any website
- Capture page title and URL instantly
- Seamless integration with backend APIs

### 📚 Smart Reading Queue
- Displays only a limited number of articles at a time
- Prioritizes older articles first
- Encourages users to complete reading instead of endlessly saving content

### 🗂️ All Articles Dashboard
- View every saved article
- Search articles by title
- Filter by reading status

### ⏰ Article Scheduling
- Schedule articles to read later
- Choose predefined or custom reading times
- Scheduled articles reappear in the reading queue when their time arrives

### 🔔 Browser Notifications
- Chrome notifications remind users when scheduled articles become available
- One-click notification opens the article directly in the browser

### 📖 Reading Time Estimation
- Automatically estimates article reading time
- Helps users choose articles based on available free time

### 📊 Article Management
- Save
- Schedule
- Read
- Mark as Completed
- Delete Articles

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- REST APIs

### Database
- MongoDB
- Mongoose

### Chrome Extension
- Manifest V3
- Chrome Tabs API
- Chrome Notifications API
- Chrome Storage API

### Other Tools
- Axios
- Cheerio
- Nodemailer (Optional)
- Git & GitHub

---

## 📂 Project Structure

```
ReadPulse
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   └── server.js
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── styles
│   └── App.jsx
│
└── extension
    ├── background.js
    ├── popup.html
    ├── popup.js
    ├── manifest.json
    └── icon.png
```



## 🔄 Application Flow

```text
User Browses Website
        │
        ▼
Chrome Extension
        │
        ▼
Capture URL + Title
        │
        ▼
Backend API
        │
        ▼
MongoDB
        │
        ▼
Smart Reading Queue
        │
        ├── Read Now
        ├── Schedule
        ├── Complete
        └── Delete
```





