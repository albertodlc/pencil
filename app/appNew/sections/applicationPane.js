export class ApplicationPane extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({mode: "open"});
    }

    // ! EVENTS
    connectedCallback(){
        this.render();
    }

    disconnectedCallback(){}

    // ! RENDER
    render(){
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="./css/sections/applicationPane.css">

        <div id="main-area">
            <div id="content-header">
                <i id="menu-icon">menu</i>
                <div class="app-name">
                    <slot name="app-name"></slot>
                </div>
                <div class="toolbar">
                    <slot name="toolbar">Toolbar buttons</slot>
                </div>
            </div>
            <div id="content-section">
                CONTENT
            </div>
        </div>`;
    }
}

export class ApplicationPaneHelper {
    static TAG = 'app-pane';

    static define(){
        if (!customElements.get(ApplicationPaneHelper.TAG)) {
            customElements.define(ApplicationPaneHelper.TAG, ApplicationPane);
        }
    }

    static props({}){

    }
}

ApplicationPaneHelper.define();