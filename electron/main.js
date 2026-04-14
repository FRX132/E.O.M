import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very simple flag to detect dev mode vs production mode
// Defaulting to dev for our `concurrently` script, production otherwise
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // Native traffic lights without hard OSX title bar
    backgroundColor: '#0a0a0c', // Dark mode fallback background
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false // Required for some native modules if we add them later
    },
  });

  if (isDev) {
    // Load Vite Dev Server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools
    // mainWindow.webContents.openDevTools();
  } else {
    // Load built React assets
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  
  // Set up native IPC bindings before creating the window


  createWindow();

  // Add shortcut to easily open Developer Tools anywhere
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.toggleDevTools();
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
