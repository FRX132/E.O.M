# Life Planner OS 🧠

Welcome to **Life Planner OS**, a highly personalized, minimalist, Notion-inspired desktop application designed to gamify and organize your entire life. Built with React, Zustand, and Electron, it serves as an all-in-one personal dashboard for tracking habits, finances, physical metrics, overarching goals, and skill progressions.

## ✨ Features

- **RPG-Style Skill Tree:** A fully interactive, radial mindmap of life skills (Health, Social, Career, Spirit, Mental). Unlock skills through an interconnected web of prerequisites.
- **Dynamic Habit Tracker:** Seamlessly integrated with the Skill Tree. As you unlock new skills, the required daily habits automatically appear in your rolling 10-day tracker.
- **Expense Tracker:** Monitor your cash flow, track big purchases, and categorize your daily spending using an intuitive interface.
- **Goal Planner:** Drill down your life's big targets into manageable milestones using a structured tier system.
- **Profile Customization & Auth Cache:** Upload custom background images, profile pictures, and set your core overarching life objectives.
- **Notion-Like Aesthetics:** Clean typography, glassmorphism elements, dark-mode first design, and robust UX features.
- **Local First & Privacy Focused:** All data is persisted entirely locally using Zustand and LocalStorage. No data leaves your machine. Hard resets are available via a "Factory Reset" option.

## 🛠️ Technology Stack

- **Frontend Core:** React, Vite
- **Styling:** Vanilla CSS (App.css, index.css) + Glassmorphism UI
- **State Management:** Zustand (with persist middleware for auto-saving)
- **Node Graph / Map:** `@xyflow/react` + `dagre` (for automated radial tree layouts)
- **Desktop Wrapper:** Electron (for native macOS windowing capabilities)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/your_username_/life-planner-os.git
   ```
2. Navigate to the project directory
   ```sh
   cd life-planner-os
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the application
   The project uses `concurrently` to run the Vite dev server and Electron backend simultaneously.
   ```sh
   npm run electron:dev
   ```

## 🏗️ Project Structure

- `src/components/`: Houses all the core dashboard widgets (`SkillTree`, `ExpenseTracker`, `HabitTracker`, `ProfileSettings`, etc.)
- `src/store.js`: The central "brain" of the app. Handles all global state, localStorage persistence, default definitions, and factory reset overrides.
- `src/App.jsx`: The main React Router that manages the sidebar navigation and routes you to the different OS apps.
- `electron/`: Contains the native desktop wrapper configurations (`main.js`, `preload.cjs`).

## 💡 How It Works
- **The Core Habit:** Out of the box, the system starts with zero noise. The Habit Tracker begins with exactly one routine: the "Daily Tracker Check." 
- **Skill Progression:** By clicking nodes in the Skill Tree (e.g. Health -> Sports -> Gym), you are challenged to fulfill a new real-world habit. Unlocking it adds that routine to your daily tracker permanently.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
