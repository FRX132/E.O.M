# E.O.M — Life Planner OS 🧠

**E.O.M** (End of Month / Each One Matters) is a premium, minimalist desktop application designed to gamify and organize every facet of your life. Built with a "local-first" philosophy, it combines productivity with RPG-inspired progression mechanics.

![E.O.M Dashboard](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop&q=80)

## ✨ Core Modules

### 💰 Finance Hub (Expense Tracker)
Professional-grade financial management with:
- **Automatic Calculations**: Real-time tracking of income, expenses, and total balance.
- **Recurring Payments**: Automated monthly deductions for bills and subscriptions.
- **Budgeting**: Set and monitor budgets across custom categories.
- **Visual Analytics**: Dynamic charts showing cash flow trends throughout the year.

### 🏋️‍♂️ Workout Hub (Anatomical Map)
High-fidelity fitness tracking featuring:
- **Dual Anatomy Support**: Toggle between male and female anatomical frames.
- **Muscle Targeting**: Interactive SVG maps to select and log specific muscle group sessions.
- **Smart Sync**: Automatically syncs body structure with your user profile gender.

### 🌍 Language Hub
Track your journey to polyglot status:
- **Level Progression**: CEFR standard tracking (A1 to C2).
- **Metric Monitoring**: Visual progress bars and session notes for each language.
- **Resource Management**: Dedicated space for learning materials and goals.

### 🛡️ Skill Tree & Habits
The heart of the gamification engine:
- **RPG Progression**: Unlock and level up branches in Health, Social, Career, Spirit, and Mental.
- **Dynamic Habits**: Habits are directly linked to your Skill Tree; completing them earns XP and advances your rank.

### 📚 Media Databases
- **Library (Books)**: Track reading progress, ratings, and collections.
- **Cinema (Movies/Series)**: Manage your watch-list and historical media consumption.

---

## 🚀 Technical Highlights
- **Vite + React**: Blazing fast development and optimized production bundles.
- **Zustand**: State management with local persistence (Privacy First).
- **Electron**: Cross-platform desktop experience.
- **Glassmorphism UI**: High-end aesthetic with customizable accent colors and neon modes.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/FRX132/E.O.M.git
   cd E.O.M
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Launch development mode:
   ```sh
   npm run electron:dev
   ```

---

## 📦 Building for Production
To generate installers for testers or personal use:

- **Windows Build**: `npm run electron:build:win`
- **Mac Build**: `npm run electron:build`
- **Web Preview**: `npm run build && npm run preview`

Generated binaries will be located in the `release/` directory.

---

## 📂 Project Structure
- `src/components/` — UI Modules (Finance, Workout, Language, etc.)
- `src/store.js` — Global state, persistence logic, and profile data.
- `src/data/` — Anatomical path data and asset JSONs.
- `electron/` — Main process and desktop integration scripts.

---

## 📜 License
MIT — Created by [FRX132](https://github.com/FRX132).