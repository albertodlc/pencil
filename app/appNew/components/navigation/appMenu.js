
// ! MENU
export class AppMenu extends HTMLElement {
    // ! INTERNAL REFERENCES
    #refs = {
        btnToogle: null,
        menuDialog: null,
    };

    // ! INNER STATUS
    #mounted = false;

    constructor(){
        super();
    }

    // ! EVENTs
    connectedCallback(){
        this.addEventListener('click', this);

        if( !this.#mounted ){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){}

    handleEvent(event){
        const { target } = event;
        const { parentNode } = target;
    
        // Check if the clicked option is the "Quit" option
        // You might want to add a property or class to your menu options to identify them
        if (parentNode.dataset.action === 'quit') {
            this.#handleQuit();
        }

        if( parentNode.dataset.action === 'new' ){
            this.#handleCreateDocument();
        }
    }

    #handleCreateDocument(){
        this.dispatchEvent(new CustomEvent('document-create-requested', {
            bubbles: true,
            composed: true
        }));

        this.#closeMenu();
    }

    #handleQuit(){
        this.dispatchEvent(new CustomEvent('app-close-requested', {
            bubbles: true,
            composed: true
        }));

        this.#closeMenu();
    }

    //! RENDERs
    #render(){
        this.innerHTML = `
            <link rel="stylesheet" href="${AppMenuHelper.CSS_CLASS}">
            <div class="menu">
                <input id="menu-toggle" type="checkbox" class="menu__checkbox" hidden>
                <label for="menu-toggle" class="menu_hamburger">
                    <span class="menu__hamburger__bar"></span>
                    <span class="menu__hamburger__bar"></span>
                    <span class="menu__hamburger__bar"></span>
                </label>
                <dialog class="menu__dialog">
                    <app-menu-option data-action="new" data-icon="" data-text="New Document" data-shortcut="Ctrl+N" ></app-menu-option>
                    <app-menu-option data-action="open" data-icon="" data-text="Open..." data-shortcut="Ctrl+O"></app-menu-option>
                    <app-menu-option data-action="save" data-icon="" data-text="Save" data-shortcut="Ctrl+S"></app-menu-option>
                    <app-menu-option data-action="save-as" data-icon="" data-text="Save as..." data-shortcut="Ctrl+Shift+S"></app-menu-option>
                    <app-menu-option data-action="export" data-icon="" data-text="Export..." data-shortcut="Ctrl+Shift+E"></app-menu-option>
                    <app-menu-option data-action="print" data-icon="" data-text="Print..." data-shortcut=""></app-menu-option>
                    <app-menu-option data-action="close" data-icon="" data-text="Close..." data-shortcut=""></app-menu-option>
                    <app-menu-option data-action="recent-files" data-icon="" data-text="Recent files" data-shortcut=""></app-menu-option>
                    <app-menu-option data-action="settings" data-icon="" data-text="Settings..." data-shortcut=""></app-menu-option>
                    <app-menu-option data-action="tools" data-icon="" data-text="Tools" data-shortcut=""></app-menu-option>
                    <app-menu-option data-action="about" data-icon="" data-text="About..." data-shortcut=""></app-menu-option>
                    <app-menu-option data-action="quit" data-icon="" data-text="Exit" data-shortcut="Ctrl+Q"></app-menu-option>
                </dialog>
            </div>`;

        this.#refs.menuDialog = this.querySelector('dialog');
        this.#refs.btnToogle = this.querySelector('#menu-toggle');
    }

    #closeMenu(){
        this.#refs.btnToogle.checked = false;
    }
}

export class AppMenuHelper {
    static CSS_CLASS = './css/components/navigation/appMenu.css';
    static TAG = 'app-menu';

    static define(){
        AppMenuOptionHelper.define();

        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppMenu);
        }
    }

    static props({}){

    }
}

// ! MENU OPTION
export class AppMenuOption extends HTMLElement {
    // ! EXTERNAL PROPs
    #props = {
        action: null,
        icon: null,
        text: null,
        shortcut: null,
    }

    // ! INNER STATUS
    #mounted = false;
    
    constructor(){
        super();

        this.#props.action = this.dataset.action || null;
        this.#props.icon = this.dataset.icon || null;
        this.#props.text = this.dataset.text || null;
        this.#props.shortcut = this.dataset.shortcut || null;
    }

    connectedCallback(){
        if(!this.#mounted){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){}

    #render(){
        const {action, icon, text, shortcut } = this.#props;

        const dataAction = action ? `data-action="${action}"` : '';
        const renderIcon = icon ? `<span>${icon}</span>`: '';
        const renderText = text ? `<span>${text}</span>`: '';
        const renderShortcut = shortcut ? `<span>${shortcut}</span>`: '';

        this.innerHTML = `
            <link rel="stylesheet" href="${AppMenuOptionHelper.CSS_CLASS}">              
            <div class="menu__option" ${dataAction} >
                ${renderIcon}
                ${renderText}
                ${renderShortcut}
            </div>`;
    }
}

export class AppMenuOptionHelper {
    static CSS_CLASS = './css/components/navigation/appMenuOption.css';
    static TAG = 'app-menu-option';

    static define(){
        if (!customElements.get(this.TAG)) {
            customElements.define(this.TAG, AppMenuOption);
        }
    }

    static props({}){

    }
}