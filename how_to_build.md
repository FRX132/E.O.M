# 📦 How to Update the .dmg (Mac Distribution)

To create a new version of your application as a `.dmg` file, follow these steps:

## 🚀 Build Command

Open your terminal in the project root directory and run:

```bash
npm run electron:build
```

### What this does:
1.  **Vite Build**: Compiles your React frontend into optimized static files (`dist/`).
2.  **Electron Builder**: Packages the Electron main process and the React frontend into a macOS Disk Image (`.dmg`).

---

## 📂 Where is my file?

Once the build finishes, you will find the new `.dmg` in the following folder:

**`release/Life Planner OS-0.0.0.dmg`**

> [!TIP]
> You can change the version number in your `package.json` file (line 4) before running the build to track different releases!

---

## ⚠️ Troubleshooting
If the build fails, ensure you have all dependencies installed:
```bash
npm install
```
