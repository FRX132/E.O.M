# E.O.M — Life Planner OS 🧠

**E.O.M** (End of Month / Each One Matters) is a premium, high-performance personal operating system designed to gamify, optimize, and organize every facet of your life. Built with a "local-first" privacy philosophy, it combines productivity with RPG-inspired progression mechanics on Desktop, Web, and Mobile (PWA & iOS).

![E.O.M Dashboard](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop&q=80)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Preview-black?style=flat&logo=vercel)](https://eom-preview.vercel.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blue?style=flat&logo=pwa)](https://eom-preview.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Preview & Showcase
Try the interactive web showcase and documentation:
* **Live Showcase & Download Hub**: [https://eom-preview.vercel.app](https://eom-preview.vercel.app)

---

## ✨ Core Modules & Capabilities

### 🤖 AI Assistant & Connection Hub (Pseudo-MCP)
An integrated intelligence agent coordinating your workspace:
- **Zero-Config Local AI**: Runs local LLMs directly inside a background Web Worker using `Transformers.js`.
- **Custom Provider Integration**: Connect OpenAI, Anthropic Claude, or local API servers (Ollama, LM Studio) using custom endpoints and API keys.
- **Pseudo-MCP Command Router**: Translate natural language prompt commands directly into system state actions:
  - *"Log workout chest for 45 minutes"*
  - *"Complete goal read 5 books"*
  - *"Add goal learn React"*
  - *"Delete expense 12"* or *"remove milk from fridge"*
- **Cloud-Synced Settings**: Settings and API choices are synchronized along with your planner workspace.

### 📰 Global News & Intelligence Hub
A multi-tier real-time news radar and intelligence center powered by top global media:
- **Top 10 Global News Outlets & Agencies**:
  - 🏛️ **Nachrichtenagenturen (Fakten-Goldstandard)**: Reuters, Associated Press (AP), Agence France-Presse (AFP).
  - 🌐 **Globale Reichweiten-Giganten**: BBC News, The New York Times, CNN, The Guardian.
  - 📈 **Geopolitik & Wirtschaft**: Bloomberg, Financial Times, Al Jazeera English.
  - 🇩🇪 **Nationale & Tech-Feeds**: Tagesschau, Der Spiegel, Heise Online, Golem.de, The Verge, Wired, TechCrunch, NASA.
- **Media Tier Quick Filters**: Filter articles dynamically by *Fakten-Agenturen*, *Globale Giganten*, *Geopolitik & Märkte*, *Nationale Leitmedien* oder *Tech & Science*.
- **Live RSS Ingestion**: High-throughput parallel feed parser with dual CORS proxy failover.
- **Audio Reader (Text-to-Speech)**: Listen to breaking headlines and article summaries on the go.
- **Interactive Modals & Ticker**: Daily Morning Briefing generator, RSS Feed Manager with toggle switches, bookmarking, and full-screen distraction-free article reader.

### 🎨 Advanced Design System & Retro Aesthetics
A fully customizable UI engine with **16+ Interface Templates** and **8 Typography engines**:
- **Modern & Sci-Fi Templates**: Cyberpunk Neon, Aero Glassmorphism, Neo-Brutalism, Fallout CRT Terminal, Nordic Minimalist, Obsidian Gold, Claymorphism Soft 3D, Neumorphism, Aurora Glow UI.
- **Retro Website Styles (ReallyGoodDesigns)**:
  - 🕺 **70s Disco Groove & Vinyl**: Warm amber/gold gradients, vinyl record radial textures, Playfair serif.
  - 🕹️ **80s Synthwave & Arcade Neon**: Outrun laser grids, CRT scanline glow, chamfered corners, VT323 pixel font.
  - 📟 **Y2K & Nokia 3310 LCD**: Dot-matrix matrix green LCD, stepped pixel borders, Share Tech Mono.
  - 📜 **Vintage Editorial & Parchment**: Antique Italian letterpress, wax seal mahogany, double-framed borders.
  - 🌐 **90s Web 1.0 & Windows 95**: Classic Win95 teal desktop, 3D beveled raised/inset frames.
  - 🍸 **1920s Art Deco Luxury**: Deep obsidian black & champagne gold, Gatsby geometric cutouts, Cinzel serif.
  - 🍦 **50s Pastel Diner & Pin-Up**: Mint turquoise, strawberry milkshake pink, rounded diner badge curves.
- **Fine-Tuning Controls**: Glassmorphism blur slider, corner radius slider, compact mode, neon glow toggle, 1-click Quick Presets, and smart randomizer.

### 💰 Finance Hub (Expense Tracker)
Professional-grade financial management with:
- **Automatic Calculations**: Real-time tracking of income, expenses, and total balance.
- **Performance Optimized**: Sub-millisecond interface responsiveness via memoized render-trees and delayed state writes.
- **Recurring Payments**: Automated monthly deductions for bills and subscriptions.
- **Budgeting & Visual Analytics**: Custom category budgets and interactive cash-flow charts.

### 🏋️‍♂️ Workout Hub (Anatomical Map)
High-fidelity fitness tracking featuring:
- **Dual Anatomy Support**: Toggle between male and female anatomical SVG frames.
- **Muscle Targeting**: Interactive body maps to select and log specific muscle group sessions.
- **Smart Sync**: Automatically syncs body structure with your user profile gender.

### 🛡️ Skill Tree & Dynamic Habits
The RPG engine powering your daily progress:
- **5 Progression Trees**: Level up in Health, Social, Career, Spirit, and Mental.
- **Dynamic Habit Syncing**: Daily habits directly reward XP and advance your overall agent rank.

### 📅 Timetable & Big Targets
- **Weekly Schedule Matrix**: Time-blocked weekly schedule with task status management.
- **Big Targets Vision Board**: Track long-term milestone quests and five-year achievements.

### 🧊 Fridge Stock & Meal Inventory
- Track pantry and refrigerator food items with expiry countdowns, quantity counters, and grocery list generation.

### 📚 Media Databases & Secret Locker
- **Library (Books)** & **Cinema (Movies/Series)**: Track reading progress, watchlists, and personal ratings.
- **Password Manager & Secrets**: Client-side encrypted credential store.
- **Markdown Journal & Project Canvas**: Creative node canvas and note editor.

---

## 📱 Mobile & PWA Support (Zero Xcode Needed)

E.O.M is a complete **Progressive Web App (PWA)** that can be installed instantly on any mobile device:

### iOS (iPhone & iPad)
1. Open the web app or [https://eom-preview.vercel.app](https://eom-preview.vercel.app) in Safari.
2. Tap the **Share** button (box with upward arrow).
3. Scroll down and tap **Add to Home Screen** (Zum Home-Bildschirm).
4. Launch E.O.M in fullscreen standalone mode.

### Android
1. Open in Google Chrome.
2. Tap the 3-dots menu ➔ **Install app** or **Add to Home screen**.

---

## 🚀 Technical Stack
- **Frontend Core**: React 19, Vite, React Router v7.
- **State & Local Persistence**: Zustand with `localStorage` fallback and Cloud Sync URL loader.
- **PWA & Offline**: `vite-plugin-pwa` with custom Service Worker caching.
- **Desktop**: Electron 34 with cross-platform packaging.
- **Mobile Container**: Capacitor iOS (optional native build).
- **AI & NLP**: `@huggingface/transformers` (Web Worker onnxruntime-web).
- **Styling**: Vanilla CSS Variables Design System with Google Fonts (`Inter`, `Outfit`, `JetBrains Mono`, `Roboto`, `Playfair Display`, `Cinzel`, `VT323`, `Share Tech Mono`).

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
3. Start development server:
   ```sh
   npm run dev
   ```

---

## 📦 Building for Production

### Web & PWA Bundle
```sh
npm run build
npm run preview
```

### Desktop App (Electron)
- **Mac App**: `npm run electron:build`
- **Windows Executable**: `npm run electron:build:win`

### Native iOS (Capacitor Xcode Project)
```sh
npm run build
npx cap sync ios
```
Open the `ios/App` folder in Xcode to build directly to a connected iPhone.

---

## 📂 Project Structure
```text
E.O.M/
├── Preview Page/            # Interactive Vercel showcase landing page & serverless API
│   ├── api/validate.js      # Serverless validation function
│   ├── index.html           # Landing page with PWA launch modal
│   └── vercel.json          # Deployment & routing configuration
├── electron/                # Electron main process & desktop preload scripts
├── ios/                     # Native Capacitor iOS container
├── src/
│   ├── components/
│   │   ├── Agency/          # NewsHub, Journal, MovieList, PasswordManager, etc.
│   │   ├── Functions/       # AIAssistant, ProjectCanvas, Editor
│   │   ├── Health/          # HabitTracker, FridgeStock, SportHub
│   │   ├── Intelligence/    # GoalPlanner, BookList
│   │   ├── Styles/          # Templates_Interface.css, Default.css, NewsHub.css
│   │   └── User/            # ProfileSettings, Overview, ExpenseTracker, Timetable
│   ├── services/            # newsService.js (RSS parser & live channels)
│   ├── App.jsx              # Application router & theme controller
│   ├── store.js             # Zustand store & persistence schema
│   └── index.css            # Design token system & typography imports
├── vite.config.js           # Vite + PWA configuration
└── package.json
```

---

## 📜 License
MIT — Created by [FRX132](https://github.com/FRX132).