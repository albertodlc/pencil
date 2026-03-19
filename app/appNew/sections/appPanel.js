import { AppLogoHelper } from "../components/base/appLogo.js";
import { AppToolbarHelper } from "../components/base/appToolbar.js";
import { AppCanvas, AppCanvasHelper } from "../components/drawing/appCanvas.js";
import { AppMenuHelper } from "../components/navigation/appMenu.js";

export class AppPanel extends HTMLElement {

    // ! INTERNAL REFERENCES
    #refs = {
        canvasArea: null,
    }

    // ! INNER STATUS
    #mounted = false;

    constructor(){
        super();
        this.attachShadow({mode: "open"});
    }

    // ! EVENTS
    connectedCallback(){
        if( !this.#mounted ){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){}

    // ! RENDER
    #render(){
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${AppPanelHelper.CSS_CLASS}">

        <div id="main-area">
            <div id="content-header">
                <slot name="app-menu"></slot>
                <slot name="app-logo"></slot>
                <slot name="toolbar">Toolbar buttons</slot>
            </div>
            <div class="content">
                <div class="content__shapes-area">SHAPES</div>
                <div id="canvas-area" class="content__canvas-area"></div>
                <div class="content__properties-area">PROPERTIES</div>
            </div>
        </div>`;

        this.#refs.canvasArea = this.shadowRoot.querySelector('#canvas-area');
    }

    #cleanCanvasArea(){
        this.#refs.canvasArea.innerHTML = '';
    }

    // ! APIs
    createCanvas(){
        const canvas = new AppCanvas();

        this.#cleanCanvasArea();
        this.#refs.canvasArea.appendChild(canvas);
    }

}

export class AppPanelHelper {
    static CSS_CLASS = './css/sections/appPanel.css';
    static TAG = 'app-panel';

    static define(){
        AppMenuHelper.define();
        AppLogoHelper.define();
        AppToolbarHelper.define();
        AppCanvasHelper.define();

        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppPanel);
        }
    }

    static props({}){

    }
}

AppPanelHelper.define();