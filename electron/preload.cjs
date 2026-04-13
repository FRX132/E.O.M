const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppleReminders: () => ipcRenderer.invoke('get-apple-reminders')
});
