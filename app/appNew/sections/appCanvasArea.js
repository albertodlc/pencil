import { AppCanvas, AppCanvasHelper } from "../components/drawing/appCanvas.js";

export class AppCanvasArea extends HTMLElement {

    // ! INTERNAL STATUS
    #mounted = false;

    // ! INTERNAL REFERENCES
    #refs = {}

    constructor(){
        super();
    }

    // ! EVENTs
    connectedCallback(){
        if( !this.#mounted ){
            this.#render();
            this.#mounted = true;
        }
    }

    #render(){
        this.innerHTML = `
            <link rel="stylesheet" href="${AppCanvasAreaHelper.CSS_CLASS}">`;

        this.classList.add('canvas-area');
    }

    #cleanCanvasArea(){
        this.innerHTML = '';
    }

    // ! APIs
    createCanvas(){
        const canvas = new AppCanvas();

        // this.#cleanCanvasArea();
        this.appendChild(canvas);
    }
}

export class AppCanvasAreaHelper {
    static CSS_CLASS = './css/sections/appCanvasArea.css';
    static TAG = 'app-canvas-area';

    static define(){
        AppCanvasHelper.define();
        
        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppCanvasArea);
        }
    }

    static props({}){}
}