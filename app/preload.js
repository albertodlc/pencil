const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded!')

contextBridge.exposeInMainWorld('electronAPI', {
    quit: () => ipcRenderer.send('quit-app'),
    saveFile: (data) => ipcRenderer.invoke('save-file', data)
});