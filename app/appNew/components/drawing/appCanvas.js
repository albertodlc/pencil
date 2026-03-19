export class AppCanvas extends HTMLElement {

    // ! INNER REFERENCES
    #refs = {
        canvas: null,
        canvasCtx: null,
    }

    // ! LIFECYCLE STATUS
    #mounted = false;

    // ! INNER STATUS
    #isDrawing = false;
    #lastX = 0;
    #lastY = 0;

    constructor(){
        super();
    }

    connectedCallback(){
        this.addEventListener('mousedown', this);
        this.addEventListener('mousemove', this);
        this.addEventListener('mouseup', this);
        this.addEventListener('mouseout', this);

        if(!this.#mounted){
            this.#render();
            this.#mounted = true;
        }
    }

    disconnectedCallback(){
        this.removeEventListener('mousedown', this);
        this.removeEventListener('mousemove', this);
        this.removeEventListener('mouseup', this);
        this.removeEventListener('mouseout', this);
    }

    handleEvent(event){
        const { type } = event;

        if( type === 'mousedown' ){
            this.#startDrawing(event);
        }

        if( type === 'mousemove' ){
            this.#draw(event);
        }

        if( type === 'mouseup' ){
            this.#stopDrawing(event);
        }

        if( type === 'mouseout' ){
            this.#stopDrawing(event);
        }
    }

    #render(){
        this.innerHTML = `<link rel="stylesheet" href="${AppCanvasHelper.CSS_CLASS}" />`;

        this.#refs.canvas = document.createElement('canvas');
        this.#refs.canvasCtx = this.#refs.canvas.getContext('2d');

        this.#refs.canvas.classList.add('canvas');

        this.appendChild(this.#refs.canvas);

        // FIXME
        setTimeout(() => {
            const width = this.#refs.canvas.clientWidth;
            const height = this.#refs.canvas.clientHeight;

            this.#refs.canvas.width = width;
            this.#refs.canvas.height = height;

            // Re-apply drawing settings (Resizing resets the context!)
            this.#refs.canvasCtx.lineCap = 'round';
            this.#refs.canvasCtx.lineWidth = 2;
            this.#refs.canvasCtx.strokeStyle = '#000000';
        }, 500);
    }

    #startDrawing(e) {
        this.#isDrawing = true;
        // Update the starting point so we don't draw a line from 0,0
        [this.#lastX, this.#lastY] = [e.offsetX, e.offsetY];
    }

    #draw(e) {
        if (!this.#isDrawing) return;

        this.#refs.canvasCtx.beginPath();
        this.#refs.canvasCtx.moveTo(this.#lastX, this.#lastY); // Start from previous position
        this.#refs.canvasCtx.lineTo(e.offsetX, e.offsetY);   // Go to current mouse position
        this.#refs.canvasCtx.strokeStyle = '#000';           // Line color
        this.#refs.canvasCtx.lineWidth = 2;                  // Line thickness
        this.#refs.canvasCtx.lineCap = 'round';              // Makes the line look smooth
        this.#refs.canvasCtx.stroke();

        // Update coordinates for the next frame
        [this.#lastX, this.#lastY] = [e.offsetX, e.offsetY];
    }

    #stopDrawing() {
        this.#isDrawing = false;
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

    static props({}){}
}