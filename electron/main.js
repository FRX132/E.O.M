import { app, BrowserWindow, globalShortcut, dialog, ipcMain } from 'electron';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');
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
  ipcMain.handle('save-backup', async (event, dataStr) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Backup',
      defaultPath: `life_os_backup_${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    if (filePath) {
      fs.writeFileSync(filePath, dataStr, 'utf-8');
      return true;
    }
    return false;
  });

  ipcMain.handle('select-auto-backup-folder', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Select Auto-Backup Folder',
      properties: ['openDirectory']
    });
    if (filePaths && filePaths.length > 0) {
      return filePaths[0];
    }
    return null;
  });

  ipcMain.handle('auto-backup-save', async (event, folderPath, dataStr) => {
    try {
      if (fs.existsSync(folderPath)) {
        const fullPath = path.join(folderPath, 'EOM_AutoBackup.json');
        fs.writeFileSync(fullPath, dataStr, 'utf-8');
        return true;
      }
      return false;
    } catch (e) {
      console.error("Auto backup failed:", e);
      return false;
    }
  });

  ipcMain.handle('load-backup', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Load Backup',
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    if (filePaths && filePaths.length > 0) {
      const dataStr = fs.readFileSync(filePaths[0], 'utf-8');
      return dataStr;
    }
    return null;
  });

  ipcMain.handle('parse-pdf', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Select PDF Document',
      properties: ['openFile'],
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    });

    if (filePaths && filePaths.length > 0) {
      try {
        const dataBuffer = fs.readFileSync(filePaths[0]);
        const data = await pdfParse(dataBuffer);
        return {
          success: true,
          text: data.text,
          fileName: path.basename(filePaths[0])
        };
      } catch (err) {
        console.error("Error parsing PDF:", err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'No file selected' };
  });

  createWindow();

  // ----- Auto-Updater Logic -----
  // The app will check for updates on startup in production
  if (!isDev) {
    try {
      autoUpdater.checkForUpdatesAndNotify();

      autoUpdater.on('update-available', () => {
        console.log('Update available.');
      });

      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update Ready',
          message: 'A new version of E.O.M has been downloaded. Restart to apply?',
          buttons: ['Restart', 'Later']
        }).then((result) => {
          if (result.response === 0) autoUpdater.quitAndInstall();
        });
      });
    } catch (err) {
      console.error('Failed to check for updates:', err);
    }
  }
  // -------------------------------

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
  // eslint-disable-next-line no-undef
  if (process.platform !== 'darwin') app.quit();
});
