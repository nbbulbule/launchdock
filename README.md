# 🚀🗂️ Launch Doc

**Launch Doc** is a sleek, modern dashboard web app designed to serve as a centralized launchpad for your frequently used tools, apps, and websites. It allows you to organize shortcuts under customizable tabs, export/import data, and personalize the interface with a clean UI.

> _“A launching point for tools, apps, or sites from one centralized location”_

---

## 🌟 Features

### 🔖 Tabs & Shortcuts
- Create, rename, delete, and reorder tabs via drag-and-drop (Angular CDK).
- Add shortcuts (URLs) to tabs with custom icons and titles.
- Drag-and-drop to reorder shortcuts within a tab.

### ⚙️ Settings Menu
- Toggle background gradient themes via a dropdown Settings menu.
- Easily extendable for additional customization options.

### 🗃️ Data Management
- Export your entire dashboard configuration (tabs and shortcuts) as a JSON file.
- Import a previously saved configuration file to restore your setup.

### 👤 User Profile
- Displays user avatar and name in the top-right corner.
- Ready for extension into full authentication.

---

## 🛠️ Tech Stack

- **Angular 17+**
- **Angular CDK DragDrop** for drag-and-drop functionality
- **HTML & SCSS** for styling
- **Local Storage** for persistent data
- **Responsive Design** – usable on desktop and mobile

---

## 📂 Project Structure

src/
├── app/
│ ├── components/
│ ├── models/
│ ├── services/
│ └── app.component.ts / html / scss
├── assets/
├── environments/
└── index.html

---

## 📸 Screenshots

| Tabs & Shortcuts | Settings Menu |
|------------------|---------------|
| ![tabs](screenshots/tabs_shortcuts.jpg) | ![settings](screenshots/settings.jpg) |

---

## 🚀 Getting Started

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/launch-doc.git
   cd launch-doc

---

## Installation & Run
 ### Install Dependency
```npm install```

### Run the app
```ng serve```

### Visit http://localhost:4200

---

## ✨ Customization
To add more setting options (like font size, theme, etc.), extend the settings dropdown.

To persist user profiles, integrate with Firebase Auth or your preferred auth system.

---

## 🙌 Acknowledgements
Icons and emoji provided by:

[Twemoji](https://twemoji.twitter.com/)
[Heroicons](https://heroicons.com/)

---

## 🧠 Fun Fact
Built to reduce bookmark clutter and improve productivity by centralizing the launch of all your important tools ✨

---

## 📄 License
MIT © 2025 [launchdock]


