const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveBackup: (data) => ipcRenderer.invoke('save-backup', data),
  loadBackup: () => ipcRenderer.invoke('load-backup')
});
