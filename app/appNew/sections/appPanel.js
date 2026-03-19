import { AppLogoHelper } from "../components/base/appLogo.js";
import { AppSplitterHelper } from "../components/base/appSplitter.js";
import { AppToolbarHelper } from "../components/base/appToolbar.js";
import { AppMenuHelper } from "../components/navigation/appMenu.js";
import { AppCanvasAreaHelper } from "./appCanvasArea.js";

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
        this.addEventListener(AppPanelHelper.EVENTS.DOC_CREATED, this);

        if( !this.#mounted ){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){
        this.removeEventListener(AppPanelHelper.EVENTS.DOC_CREATED, this);
    }

    handleEvent(event){
        const { target, type } = event;

        if( type === AppPanelHelper.EVENTS.DOC_CREATED ){
            this.#refs.canvasArea.createCanvas();
        }
    }

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
                <app-splitter></app-splitter>
                <app-canvas-area></app-canvas-area>
                <app-splitter></app-splitter>
                <div class="content__properties-area">PROPERTIES</div>
            </div>
        </div>`;

        this.#refs.canvasArea = this.shadowRoot.querySelector(AppCanvasAreaHelper.TAG);
    }

}

export class AppPanelHelper {
    static CSS_CLASS = './css/sections/appPanel.css';
    static TAG = 'app-panel';
    static EVENTS = {
        DOC_CREATED: 'app-panel:doc-created',
    }

    static define(){
        AppMenuHelper.define();
        AppLogoHelper.define();
        AppToolbarHelper.define();
        
        AppSplitterHelper.define();

        AppCanvasAreaHelper.define();

        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppPanel);
        }
    }

    static props({}){

    }
}

AppPanelHelper.define();