import { AppPanelHelper } from "./sections/appPanel.js";

// This runs in the browser window
console.log("Renderer script loaded!");

// ! App Controller (The Orchestrator)

const refs = {
    loader: null,
    appPanel: null,
};

window.addEventListener('DOMContentLoaded', () => {
    refs.loader = document.querySelector('#bootingIndicator');
    
    // TODO: Create via JS instead of HTML tag? 
    refs.appPanel = document.querySelector(AppPanelHelper.TAG);
    
    // Once your data is ready...
    refs.loader.style = 'display: none';
});

window.addEventListener('document-create-requested', () => {
    refs.appPanel.createCanvas();
});

window.addEventListener('app-close-requested', () => {
    window.electronAPI.quit();
    // Note: If you have a preload script, use window.electronAPI.quit() instead
    // ipcRenderer.send('quit-app');
});