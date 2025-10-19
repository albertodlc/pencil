function BaseTemplatedWidget(definitionNode) {
    BaseWidget.call(this, definitionNode);
}
__extend(BaseWidget, BaseTemplatedWidget);

BaseTemplatedWidget.prototype.buildDOMNode = function () {
    var path = this.getTemplatePath();
    var node = widget.Util.loadTemplateAsNodeSync(path, this);

    return node;
};
BaseTemplatedWidget.prototype.getTemplatePrefix = function () {
    return "views/";
};
BaseTemplatedWidget.getTemplatePathForViewClass = function (clazz) {
    return "views/" + (clazz.__templatePath ? clazz.__templatePath + '/' : '') + clazz.name + ".xhtml";
};
BaseTemplatedWidget.prototype.getTemplatePath = function () {
    return this.getTemplatePrefix() + (this.constructor.__templatePath ? this.constructor.__templatePath + '/' : '') + this.constructor.name + ".xhtml";
};
