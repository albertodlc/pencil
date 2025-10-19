function BaseWidget(definitionNode) {
    var node = this.buildDOMNode(definitionNode);

    Dom.addClass(node, "UIWidget");
    Dom.addClass(node, "widget_" + this.constructor.name);
    this.__node = node;
    node.__widget = this;
    node["__is_" + this.constructor.name] = true;

    var thiz = this;
    node.addEventListener("DOMNodeInsertedIntoDocument", function () {
        if (thiz.onFirstInsertedIntoDocument && !thiz._signalInserted) {
            thiz.onFirstInsertedIntoDocument();
            thiz._signalInserted = true;
        }

        if (thiz.onInsertedIntoDocument) thiz.onInsertedIntoDocument();
    }, false);

    this.__delegate("addEventListener", "hasAttribute", "getAttribute", "setAttribute", "setAttributeNS", "removeAttribute", "removeAttributeNS", "dispatchEvent");
}
//@abstract BaseWidget.prototype.buildDOMNode = function () {};
BaseWidget.prototype.node = function () {
    return this.__node;
};
BaseWidget.prototype.__base = function (name) {
    return this.constructor.prototype[name].bind(this);
};
BaseWidget.prototype.e = function (member, target) {
    if (member instanceof Function) return member.apply(target || this);
    return member;
};
BaseWidget.signalOnAttachedRecursively = function (container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var child = container.childNodes[i];
        BaseWidget.signalOnAttachedRecursively(child);
    }
    if (container.__widget && container.__widget.onAttached) container.__widget.onAttached();
};
BaseWidget.signalOnSizeChangedRecursively = function (container) {
    if (container.__widget && container.__widget.onSizeChanged) {
        container.__widget.onSizeChanged();
    }
    for (var i = 0; i < container.childNodes.length; i++) {
        var child = container.childNodes[i];
        BaseWidget.signalOnSizeChangedRecursively(child);
    }
};
BaseWidget.prototype.bind = function (eventName, f, node) {
    var n = node || this.__node;
    var thiz = this;
    n.addEventListener(eventName, function (event) {
        f.apply(thiz, [event]);
    });
};

BaseWidget.prototype.onAttached = function () { };
Object.defineProperty(BaseWidget.prototype, "ownerDocument", {
    get: function () {
        return this.node().ownerDocument;
    }
});

BaseWidget.prototype.into = function (container) {
    container.appendChild(this.node());
    this.onAttached();
    return this;
};
BaseWidget.prototype.__delegate = function () {
    for (var i = 0; i < arguments.length; i ++) {
        this.__delegateOne(arguments[i]);
    }
};
BaseWidget.prototype.__delegateOne = function (name) {
    var thiz = this;
    this[name] = function () {
        var f = thiz.__node[name];
        var args = [];
        for (var i = 0; i < arguments.length; i ++) {
            args.push(arguments[i]);
        }
        return f.apply(thiz.__node, args);
    };
};
BaseWidget.prototype.buildDOMNode = function () {
    var node = document.createElement("div");
    return node;
};

BaseWidget.handleOnAttached = function (node) {
    BaseWidget.signalOnAttachedRecursively(node);
};
BaseWidget.registerDOMMutationHandler = function () {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == "childList" && mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (var i = 0; i < mutation.addedNodes.length; i ++) {
                    var node = mutation.addedNodes[i];
                    try {
                        BaseWidget.handleOnAttached(node);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
};

BaseWidget.closables = [];
BaseWidget.registerClosable = function (closable) {
    BaseWidget.tryRegisterCloseHandlers();

    BaseWidget.unregisterClosable(closable);
    BaseWidget.closables.push(closable);
};
BaseWidget.unregisterClosable = function (closable) {
    var index = BaseWidget.closables.indexOf(closable);
    if (index >= 0) BaseWidget.closables.splice(index, 1);
};
BaseWidget.handleClosableEscapeKey = function (event) {
    if (BaseWidget.closables.length == 0) return;
    var closable = BaseWidget.closables[BaseWidget.closables.length - 1];
    var shouldClose = closable.canCloseNow ? closable.canCloseNow() : true;
    if (typeof(shouldClose) == "undefined") shouldClose = true;

    if (shouldClose) {
        closable.close();
        BaseWidget.unregisterClosable(closable);
        event.preventDefault();
        Dom.cancelEvent(event);
    }
};
BaseWidget.getTopClosable = function (event) {
    if (BaseWidget.closables.length == 0) return null;
    return BaseWidget.closables[BaseWidget.closables.length - 1];
};
BaseWidget.handleGlobalMouseDown = function (event) {
    if (BaseWidget.closables.length == 0 || BaseWidget.closableProcessingDisabled) return;
    var closable = BaseWidget.closables[BaseWidget.closables.length - 1];

    BaseWidget.tryCloseClosableOnBlur(closable, event);
};

BaseWidget.tryCloseClosableOnBlur = function (closable, event) {
    if (event) {
        var container = closable.getClosableContainer ? closable.getClosableContainer() : closable;
        var found = Dom.findUpward(event.target, function (node) {
            return node == container;
        });
        if (found) return;
    }

    var shouldClose = closable.shouldCloseOnBlur ? (!event || closable.shouldCloseOnBlur(event)) : false;
    if (!shouldClose) return;

    BaseWidget.unregisterClosable(closable);
    closable.close("onBlur", event);
    if (event) {
        event.preventDefault();
        Dom.cancelEvent(event);
    }

};

BaseWidget.tryRegisterCloseHandlers = function () {
    if (BaseWidget.closeHandlersRegistered) return;

    window.addEventListener("keyup", function (event) {
        if (event.keyCode == DOM_VK_ESCAPE) {
            BaseWidget.handleClosableEscapeKey(event);
        }
    }, false);


    document.body.addEventListener("mousedown", function (event) {
        BaseWidget.handleGlobalMouseDown(event);
    }, true);

    BaseWidget.closeHandlersRegistered = true;
};