export class AppSplitter extends HTMLElement {
    // ! INTERNAL STATUS
    #mounted = false;
    
    constructor(){
        super();
    }

    // ! EVENTs
    connectedCallback(){
        this.addEventListener('click', this);

        if(!this.#mounted){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){
        this.removeEventListener('click', this);
    }

    handleEvent(event){
        const { target, type } = event;

        if( type === 'click' ){
            console.log('resize');
        }
    }

    // ! RENDERs
    #render(){
        this.innerHTML = `<link rel="stylesheet" href="${AppSplitterHelper.CSS_CLASS}">`;
        
        this.classList.add('splitter');
    }
}

export class AppSplitterHelper {
    static CSS_CLASS = './css/components/base/appSplitter.css';
    static TAG = 'app-splitter';

    static define(){
        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppSplitter);
        }
    }

    static props({}){}
}