# 📦 E.O.M OS — Multi-Platform Build & Distribution Guide

This guide covers building, packaging, and updating **E.O.M Life Planner OS** across macOS (.dmg), Windows (.exe), iOS (Xcode), Android (Android Studio), and Web/PWA (Vercel).

---

## 🔒 User Data Safety Guarantee During Updates

> [!IMPORTANT]
> **Updating the application binary NEVER overwrites your personal data or password.**
> E.O.M uses a strict **Local-First & Zero-Knowledge** architecture. Your profile credentials, habit streaks, workouts, transactions, and journal entries are physically decoupled from the executable binary and stored inside your system's sandboxed LevelDB / SQLite storage:
> - **macOS**: `~/Library/Application Support/eom/Local Storage/leveldb/`
> - **Windows**: `%APPDATA%\eom\Local Storage\leveldb\`
> - **iOS & Android**: Sandboxed native App container
> - **Web/PWA**: Browser origin `localStorage` & `IndexedDB`
>
> When you install a new `.dmg`, `.exe`, or iOS build, your existing data remains 100% intact!

---

## 🖥️ 1. macOS Desktop Distribution (.dmg)

To build a fresh macOS installer package:

```bash
npm run electron:build
```

### What this does:
1. **Vite Build**: Compiles React components, assets, and styles into the `dist/` directory.
2. **Electron Builder**: Packages the Electron main runtime and static assets into an optimized Apple Disk Image (`.dmg`).

### Output Location:
```text
release/Life Planner OS-x.x.x.dmg
```

### How to Install / Update on Mac:
1. Double-click the `.dmg` file in the `release/` folder.
2. Drag **Life Planner OS** into your `/Applications` folder (choose "Replace" if updating).
3. Launch the app. All your existing data, settings, and accounts will load automatically.

> [!TIP]
> Before building, update the version string in `package.json` (e.g. `"version": "1.5.0"`) to track release history.

---

## 🪟 2. Windows Desktop Distribution (.exe)

To build an NSIS Windows installer:

```bash
npm run electron:build:win
```

### Output Location:
```text
release/Life Planner OS Setup x.x.x.exe
```

### How to Install / Update on Windows:
Run the `.exe` installer. It updates the executable while preserving your `%APPDATA%\eom` user storage.

---

## 📱 3. Native iOS Build (iPhone & iPad via Xcode)

To deploy E.O.M to physical iOS devices or the iOS Simulator:

```bash
# 1. Build the production React bundle
npm run build

# 2. Sync web assets and plugins to the native Xcode workspace
npx cap sync ios

# 3. Open the project in Xcode
npx cap open ios
```

### Inside Xcode:
1. Select your development team in **Signing & Capabilities**.
2. Select your connected iPhone or a Simulator from the device dropdown.
3. Press <kbd>Cmd + R</kbd> (or click the Play button) to compile and launch.
4. For distribution via TestFlight or the App Store, select **Product ➔ Archive**.

---

## 🤖 4. Native Android Build (Android Studio)

```bash
# 1. Build the production React bundle
npm run build

# 2. Sync web assets to the native Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

In Android Studio, click **Run ➔ Run 'app'** (<kbd>Shift + F10</kbd>) or build an APK / AAB via **Build ➔ Generate Signed Bundle / APK**.

---

## 🌐 5. Web & PWA Deployment (Vercel)

E.O.M is pre-configured with multi-tier Vercel routing (`vercel.json`):
- **`/` (Root)** ➔ Serves the interactive **Preview & Showcase Landing Page** (Simulator, Features, Tech Matrix, Documentation).
- **`/app` (or `/app/*`)** ➔ Serves the **E.O.M Life Planner OS** (React PWA SPA with local-first IndexedDB).
- **`/Documentary.html`** ➔ Serves the full Interactive Architecture & System Documentation.
- **`/api/validate`** ➔ Vercel Serverless Function handling simulator override requests.

```bash
# Push updates to GitHub (triggers automated Vercel CI/CD)
git add .
git commit -m "Deploy update"
git push origin main
```

Users visiting your root domain will see the showcase page first, and clicking **Launch App** opens the OS at `/app`. PWA shortcuts on home screens will launch directly into the app.

---

## 🛠️ Verification & Troubleshooting

### Test the Production Bundle Locally:
```bash
npm run build
npm run preview
```

### Clean Install if Dependencies Conflict:
```bash
rm -rf node_modules package-lock.json dist
npm install
```

### Checking Electron DevTools for Local Data:
In the running Desktop app, press <kbd>Cmd + Shift + I</kbd> (Mac) or <kbd>Ctrl + Shift + I</kbd> (Windows) ➔ **Application** tab ➔ **Local Storage** to inspect `os_profile` and system tables.
