const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  saveBackup: (data) => ipcRenderer.invoke('save-backup', data),
  loadBackup: () => ipcRenderer.invoke('load-backup'),
  selectAutoBackupFolder: () => ipcRenderer.invoke('select-auto-backup-folder'),
  autoBackupSave: (folderPath, data) => ipcRenderer.invoke('auto-backup-save', folderPath, data),
  parsePDF: () => ipcRenderer.invoke('parse-pdf'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectVault: () => ipcRenderer.invoke('select-vault-directory'),
  getLocalIP: () => ipcRenderer.invoke('get-local-ip')
});
