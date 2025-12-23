function PropertyEditor() {
    BaseTemplatedWidget.call(this);
    if (this.setup) this.setup();
}
__extend(BaseTemplatedWidget, PropertyEditor);

PropertyEditor.prototype.fireChangeEvent = function (mask) {
    this.modified = true;
    NDom.emitEvent("p:ValueChanged", this.node(), {mask: mask});
};
