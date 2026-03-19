export class AppLogo extends HTMLElement {

    // ! INNER STATUS
    #mounted = false;

    constructor(){
        super();
    }

    connectedCallback(){
        if(!this.#mounted){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){

    }

    #render(){
        this.innerHTML = `
            <link rel="stylesheet" href="${AppLogoHelper.CSS_CLASS}" />
            <strong class="app-name">PENCIL</strong>`;
    }
}

export class AppLogoHelper {
    static CSS_CLASS = './css/components/base/appLogo.css'
    static TAG = 'app-logo';

    static define(){
        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppLogo);
        }
    }

    static props({}){

    }
}

AppLogoHelper.define();