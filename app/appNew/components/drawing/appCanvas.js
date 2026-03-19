export class AppCanvas extends HTMLElement {

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

    disconnectedCallback(){}

    #render(){
        this.innerHTML = `<link rel="stylesheet" href="${AppCanvasHelper.CSS_CLASS}" />`;

        const canvas = document.createElement('canvas');
        canvas.classList.add('canvas');

        // if (canvas.getContext) {
        //     const ctx = canvas.getContext("2d");
        // }

        this.appendChild(canvas);
    }
}

export class AppCanvasHelper {
    static CSS_CLASS = './css/components/drawing/appCanvas.css';
    static TAG = 'app-canvas';

    static define(){
        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppCanvas);
        }
    }

    static props({}){

    }
}