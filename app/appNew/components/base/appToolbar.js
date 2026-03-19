export class AppToolbar extends HTMLElement {

    // ! INNER STATUS
    #mounted = false;

    constructor(){
        super();
    }

    connectedCallback(){
        if( !this.#mounted ){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){

    }

    #render(){
        const toolbar = document.createElement('div');
        toolbar.classList.add('toolbar');
        
        const editToolbar = document.createElement('div');
        editToolbar.innerHTML = 'EDIT';

        const zoomToolbar = document.createElement('div');
        zoomToolbar.innerHTML = 'ZOOM';

        const alignToolbar = document.createElement('div');
        alignToolbar.innerHTML = 'ALIGNMENT';

        const sizeToolbar = document.createElement('div');
        sizeToolbar.innerHTML = 'SIZE';

        const textToolbar = document.createElement('div');
        textToolbar.innerHTML = 'TEXT';

        const colorsToolbar = document.createElement('div');
        colorsToolbar.innerHTML = 'COLOR';

        const linestyleToolbar = document.createElement('div');
        linestyleToolbar.innerHTML = 'LINES';

        const otherToolbar = document.createElement('div');
        otherToolbar.innerHTML = 'OTHER';

        this.innerHTML = `<link rel="stylesheet" href="${AppToolbarHelper.CSS_CLASS}">`;

        toolbar.appendChild(editToolbar);
        toolbar.appendChild(zoomToolbar);
        toolbar.appendChild(alignToolbar);
        toolbar.appendChild(sizeToolbar);
        toolbar.appendChild(textToolbar);
        toolbar.appendChild(colorsToolbar);
        toolbar.appendChild(linestyleToolbar);
        toolbar.appendChild(otherToolbar);

        this.appendChild(toolbar);
    }
}

export class AppToolbarHelper {
    static CSS_CLASS = './css/components/base/appToolbar.css'
    static TAG = 'app-toolbar';

    static define(){
        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppToolbar);
        }
    }

    static props({}){

    }
}