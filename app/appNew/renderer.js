import { GLOBAL_EVENTS } from "./constants/events.js";

// This runs in the browser window
console.log("Renderer script loaded!");

// ! App Controller (The Orchestrator)
const refs = {
    loader: null,
};

window.addEventListener('DOMContentLoaded', () => {
    refs.loader = document.querySelector('#bootingIndicator');
        
    // Once your data is ready...
    refs.loader.style = 'display: none';
});

window.addEventListener(GLOBAL_EVENTS.QUIT_APP, () => {
    // ! PRELOAD SCRIPT
    window.electronAPI.quit();
});