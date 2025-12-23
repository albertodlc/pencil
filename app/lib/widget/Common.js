var __widgetClasses = [];
function __extend() {
    var __base = arguments[0];
    var sub = arguments[1];

    sub.prototype = Object.create(__base.prototype);
    sub.prototype.constructor = sub;
    sub.__base = __base;

    for (var i = 2; i < arguments.length; i ++) {
        var f = arguments[i];
        sub.prototype[f.name] = f;
    }

    __widgetClasses.push(sub);

    var templatePath = path.dirname(document.currentScript.src);
    if (templatePath && /views\/(.*)$/ig.exec(templatePath)) {
        sub.__templatePath = RegExp.$1;
    }

    return sub;
}

function __isSubClassOf(sub, base) {
    if (!sub.__base) return false;
    return sub.__base === base || __isSubClassOf(sub.__base, base);
}
function __isAssignableFrom(sub, base) {
    return sub === base || __isSubClassOf(sub, base);
}


var less = require("less");

var widget = {};
widget.random = function() {
    return "" + new Date().getTime() + "_" + Math.round(10000 * Math.random());
};
widget.STATIC_BASE = "";
widget.LOADING = "Loading...";
widget.CACHE_RANDOM = widget.random();

widget.get = function(foo) {
    if (typeof (foo) == "string") return document.getElementById(foo);
    if (foo && foo.nodeType) return foo;
    return null;
};
widget.getId = function (node) {
    var id = node.getAttribute("id");
    if (!id) {
        id = "node_" + widget.random();
        node.setAttribute("id", id);
        try {
            node.id = id;
        } catch (e) {}
    }

    return id;
};

widget.evaluate = function(object, context) {
    if (typeof (object) == "function") {
        return object.apply(context);
    }
    return object;
};
widget.registerEvent = function (target, event, handlerName, capture) {
    NDom.registerEvent(target, event, function (e) {
        var t = NDom.getTarget(e);
        var node = NDom.findUpward(t, function (n) {
            return n._widget;
        });
        if (!node) return;
        var f = node._widget[handlerName];
        if (!f) return;
        f.apply(node._widget, [e]);
    }, capture);
};

function ie() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('msie') != -1) {
        return parseInt(ua.split('msie')[1], 10);
    }
    if (ua.indexOf('trident') != -1) {
        return 11;
    }
    return false;
}

widget.Util = function() {
    var TEMPLATE_CACHE = {};
    var processedCSS = {};
    return {
        getTemplateCache: function () {
            return TEMPLATE_CACHE;
        },
        getProcessedCSSMap: function () {
            return processedCSS;
        },
        _processTemplateStyleSheet: function (html, prefix, templateName) {
            return html.replace(/(<style[^>]*>)([^<]+)(<\/style>)/g, function (zero, start, content, end) {

                if (processedCSS[templateName]) return "";

                var css = content.replace(/([^\{\}\$;]+)\{((?:[^\}\{]+\{[^\}]*\})*)([^\}]*\})/g, function (zero, start, blocks, end) {
                    if (start.match(/^[\s]*@(keyframes|-webkit-keyframes)/)) return zero;

                    return zero.replace(/([\r\n ]+)([^\{\}\$;]+)\{/g, function (zero, leading, selectors) {
                        selectors = selectors.replace(/^@this/gi, prefix);
                        selectors = selectors.replace(/(\.widget_[^\r\n\,]+ )@([a-z])/gi, "$1 .AnonId_$2");
                        if (!selectors.match(/^[ \t]*@(media) /)) {
                            selectors = selectors.replace(/@([a-z])/gi, ".AnonId_" + (templateName + "_") + "$1");
                        }
                        selectors = selectors.replace(/[ \r\n\t]\,[ \r\n\t]+/g, ",");
                        if (!selectors.match(/^[ \t]*body[ \.\[:]/)
                                && !selectors.match(/^[ \t]*@(media) /)
                                && !selectors.match(/^[ \t]*&/)) {
                            selectors = prefix + " " + selectors.replace(/\,/g, ",\n" + prefix + " ");
                        }

                        var modified = leading + selectors + "{";

                        return modified;
                    });
                });
                css = css.replace(/\$([a-z0-9_]+)/g, "@$1");

                //appending less config
                css = "@import \"variables.less\";\n" + css;
                var baseDirectory = path.join(__dirname, "css");

                less.render(css, {
                    paths: ['.', './css', baseDirectory]
                }).then(function (output) {
                    var head = document.head || document.getElementsByTagName("head")[0];
                    var style = document.createElement("style");
                    style.type = "text/css";
                    style.setAttribute("widget", templateName);

                    if (style.styleSheet) {
                        style.styleSheet.cssText = "";
                    }

                    head.appendChild(style);
                    style.appendChild(document.createTextNode(output.css));
                });

                processedCSS[templateName] = true;
                return "";

            }, function (error) {
                console.log("Render error for " + templateName, error);
            });
        },
        processLocalizationMacros: function (html) {
            if (!window.Messages) return html;
        	return html.replace(/#\{([^\r\n\}]+)\}/g, function (all, one) {
        		var s = Messages[one] || one;
        		return NDom.htmlEncode(s);
        	});
        },
        performAutoBinding: function (container, namingContext, ownerTemplateName) {
            NDom.doOnChildRecursively(container, {
                eval: function(n) {
                    return n.localName == "ui" || (n.namespaceURI == "http://evolus.vn/Namespaces/WebUI/1.0");
                }
            }, function(n) {
                if (!namingContext.__childWidgets) namingContext.__childWidgets = [];

                var clazz = n.getAttribute("type");
                if (!clazz) clazz = n.localName;
                if (!clazz) return;

                var f = window[clazz];
                if (!f) {
                    console.log("No implementation found for: " + clazz);
                }
                var wg = new f(n);

                for (var i = 0; i < n.attributes.length; i ++) {
                    var name = n.attributes[i].name;
                    var value = n.attributes[i].value;

                    if (name == "anon-id") {
                        if (namingContext) {
                            namingContext[value] = wg;
                            NDom.addClass(wg.node(), "AnonId_" + value);
                            NDom.addClass(wg.node(), "AnonId_" + (ownerTemplateName ? (ownerTemplateName + "_") : "") + value);

                        }
                        wg._anonId = value;
                    } else if (name == "style") {
                        var currentStyle = wg.node().getAttribute("style");
                        if (currentStyle) {
                            currentStyle += value;
                        } else {
                            currentStyle = value;
                        }
                        wg.node().setAttribute("style", currentStyle);
                    } else if (name == "flex") {
                        wg.node().setAttribute("flex", value);
                    } else if (name == "class") {
                        NDom.addClass(wg.node(), value);
                    } else {
                        wg[name] = value;
                        if (name != "type") {
	                    wg.node().setAttribute(name, value);
	                }
	            }
                }

                var parentNode = n.parentNode;

                if (wg.setContentFragment && n.childNodes) {
                    var f = wg.node().ownerDocument.createDocumentFragment();

                    while (n.firstChild) {
                        var child = n.firstChild;
                        n.removeChild(child);
                        f.appendChild(child);
                    }

                    widget.Util.performAutoBinding(f, namingContext);
                    wg.setContentFragment(f);
                }

                parentNode.replaceChild(wg.node(), n);
                namingContext.__childWidgets.push(wg);
                // if (parentNode.ownerDocument.body.contains(parentNode)) wg.signalOnAttached();
            });
        },
        _processTemplate: function(dolly, namingContext, templateName) {
            dolly.removeAttribute("id");
            //dolly.style.display = "block";

            var anonIdToIdMap = {};

            widget.Util.performAutoBinding(dolly, namingContext, templateName);

            NDom.doOnChildRecursively(dolly, {
                eval: function(n) {
                    return n.getAttribute && n.getAttribute("anon-id");
                }
            }, function(n) {
                var id = n.getAttribute("anon-id");
                if (namingContext) {
                    namingContext[id] = n;
                }
                n.removeAttribute("anon-id");

                var newId = id + widget.random();
                n.setAttribute("id", newId);
                n.id = newId;
                anonIdToIdMap[id] = newId;
                NDom.addClass(n, "AnonId_" + (templateName ? (templateName + "_") : "") + id);
                NDom.addClass(n, "AnonId_" + id);
            });
            NDom.doOnChildRecursively(dolly, {
                eval: function(n) {
                    return n.getAttribute;
                }
            }, function(n) {
                if (n.getAttribute) {
                    var href = n.getAttribute("href");
                    if (href && href.match(/^#(.+)$/)) {
                        var id = RegExp.$1;
                        if (anonIdToIdMap[id]) {
                            n.setAttribute("href", "#" + anonIdToIdMap[id]);
                        }
                    }

                    var ffor = n.getAttribute("for");
                    if (ffor && anonIdToIdMap[ffor]) {
                        n.setAttribute("for", anonIdToIdMap[ffor]);
                    }
                }
            });
        },
        buildDOMFromTemplate: function(template, namingContext) {
            template = widget.get(template);
            var dolly = template.cloneNode(true);

            widget.Util._processTemplate(dolly, namingContext);

            return dolly;
        },

        loadTemplate: function(path, callback) {
            if (!callback) return widget.Util.loadTemplateSync(path);

            if (typeof (TEMPLATE_CACHE[path]) != "undefined") {
                if (callback) {
                    callback(TEMPLATE_CACHE[path]);
                    return;
                } else {
                    return TEMPLATE_CACHE[path];
                }
            }

            var task = function(done) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4) {
                        done();
                        var html = request.responseText;
                        html = widget.Util.processLocalizationMacros(html);
                        TEMPLATE_CACHE[path] = html;
                        callback(html);
                    }
                };
                request.open("GET", widget.STATIC_BASE + path + "?t=" + widget.CACHE_RANDOM, true);
                request.send(null);
            };

            run(task);
        },
        loadTemplateSync: function(path) {
            if (typeof (TEMPLATE_CACHE[path]) != "undefined") {
                return TEMPLATE_CACHE[path];
            }

            var request = new XMLHttpRequest();
            request.open("GET", widget.STATIC_BASE + path + "?t=" + widget.CACHE_RANDOM, false);
            request.send(null);
            var html = request.responseText;
            html = widget.Util.processLocalizationMacros(html);
            TEMPLATE_CACHE[path] = html;

            return html;
        },
        _toTemplateNode: function (path, html, namingContext) {
            if (html) {
                html = html.replace(/<ui:([a-zA-Z0-9]+)/gi, function (all, name) {
                    return "<ui type=\"" + name + "\"";
                }).replace(/<\/ui:([a-zA-Z0-9]+)/gi, function (all, name) {
                    return "</ui";
                });
            }
            var div = document.createElement("div");
            var templateName = path.replace(/[^a-z0-9]+/gi, "_");
            var className = "DynamicTemplate" + templateName;
            var processedHtml = widget.Util._processTemplateStyleSheet(html, "." + className, templateName);
            try {
                div.innerHTML = processedHtml;
            } catch (e) {
                console.log("Bad HTML: " + html);
                throw e;
            }
            var firstElement = null;
            for (var i = 0; i < div.childNodes.length; i ++) {
                var e = div.childNodes[i];
                if (e && e.nodeType == Node.ELEMENT_NODE) {
                    firstElement = e;
                    break;
                }
            }

            if (firstElement) {
                div = firstElement;
            }

            NDom.addClass(div, className);
            NDom.addClass(div, templateName);

            widget.Util._processTemplate(div, namingContext, templateName);

            return div;
        },
        loadTemplateAsNode: function(path, callback, namingContext) {
            widget.Util.loadTemplate(path, function (html) {
                callback(widget.Util._toTemplateNode(path, html, namingContext));
            });
        },
        loadTemplateAsNodeSync: function(path, namingContext) {
            var html = widget.Util.loadTemplateSync(path);
            return widget.Util._toTemplateNode(path, html, namingContext);

        },
        registerGlobalListener: function(listener) {
            if (!widget.globalListeners) widget.globalListeners = [];
            widget.globalListeners.push(listener);
        },
        fireGlobalEvent: function() {
            if (!widget.globalListeners) return;
            var name = arguments[0];
            var args = [];
            for ( var i = 1; i < arguments.length; i++) {
                args.push(arguments[i]);
            }

            for ( var i = 0; i < widget.globalListeners.length; i++) {
                var listener = widget.globalListeners[i];
                if (!listener[name]) continue;
                var f = listener[name];
                f.apply(listener, args);
            }
        },
        createOverlayCover: function (zIndex, opacity, color, onClose) {
            var cover = document.createElement("div");
            document.body.appendChild(cover);
            cover.style.position = "fixed";
            cover.style.top = "0px";
            cover.style.left = "0px";
            cover.style.bottom = "0px";
            cover.style.right = "0px";

            if (opacity) cover.style.opacity = "" + opacity;
            if (zIndex) cover.style.zIndex = "" + zIndex;
            if (color) cover.style.background = color;

            if (onClose) {
                NDom.registerEvent(cover, "click", function () {
                    cover.parentNode.removeChild(cover);
                    onClose();
                });
            }

            return cover;
        },
        createBlankCover: function (onClose) {
            return this.createOverlayCover(widget.Dialog.getTopZIndex(), 0, null, onClose);
        },
        createDarkCover: function (onClose) {
            return this.createOverlayCover(widget.Dialog.getTopZIndex(), 0.3, "#000", onClose);
        },
        popupStack: [],
        positionAsPopup: function (node, anchor, hAlign, vAlign, hPadding, vPadding) {
            if (!node.parentNode || node.parentNode != document.body) {
                if (node.parentNode) node.parentNode.removeChild(node);
                document.body.appendChild(node);

                node.style.visibility = "hidden";

                node.style.left = "0px";
                node.style.top = "0px";

                window.setTimeout(function () {
                    widget.Util.positionAsPopup(node, anchor, hAlign, vAlign, hPadding, vPadding);
                }, 10);

                return;
            }
            node.style.left = "0px";
            node.style.top = "0px";

            var display = node.style.display;

            node.style.display = "block";

            var w = node.offsetWidth;
            var h = node.offsetHeight;

            node.style.display = display;

            var rect = anchor.getBoundingClientRect();
            var aw = rect.width;
            var ah = rect.height;
            var ax = rect.left;
            var ay = rect.top;

            var p = hPadding || 0;

            var x = 0;
            if (hAlign == "left") x = ax - w - p;
            if (hAlign == "left-inside") x = ax + p;
            if (hAlign == "middle" || hAlign == "center") x = ax + aw / 2 - w / 2;
            if (hAlign == "right") x = ax + aw + p;
            if (hAlign == "right-inside") x = ax + aw - w - p;

            p = vPadding || p;

            var y = 0;
            if (vAlign == "top") y = ay - h - p;
            if (vAlign == "top-inside") y = ay + p;
            if (vAlign == "middle" || vAlign == "center") y = ay + ah / 2 - h / 2;
            if (vAlign == "bottom") y = ay + ah + p;
            if (vAlign == "bottom-inside") y = ay + ah - h - p;

            //invalidate into view
            var screenW = document.body.offsetWidth - 10;
            console.log("Location", x, w, screenW);
            if (x + w > screenW) x = screenW - w;

            var screenH = document.body.offsetHeight - 10;
            if (y + h > screenH) y = ay - h - p;

            node.style.position = "absolute";
            node.style.left = x + "px";
            node.style.top = y + "px";
            node.style.zIndex = "9999";
            node.style.visibility = "visible";

            widget.Util.popupStack.push(node);
        },
        registerPopopCloseHandler: function () {
            document.body.addEventListener("mousedown", function (event) {
                if (widget.Util.popupStack.length == 0) return;
                var popup = widget.Util.popupStack[widget.Util.popupStack.length - 1];
                var node = NDom.findUpward(event.target, function (n) {
                    return n == popup;
                });
                if (node) return;
                popup.style.visibility = "hidden";
                widget.Util.popupStack.pop();
                event.preventDefault();
            }, false);
        }
    };
}();

var busyIndicator = null;
function initBusyIndicator() {
    if (busyIndicator) return;
    busyIndicator = {};

    busyIndicator.overlay = document.createElement("div");
    document.body.appendChild(busyIndicator.overlay);
    NDom.addClass(busyIndicator.overlay, "Overlay");
    NDom.addClass(busyIndicator.overlay, "BusyOverlay");

    document.body.appendChild(busyIndicator.overlay);
    busyIndicator.overlay.style.display = "none";

    busyIndicator.messageContainer = document.createElement("div");
    document.body.appendChild(busyIndicator.messageContainer);
    busyIndicator.messageContainer.style.visibility = "hidden";

    NDom.addClass(busyIndicator.messageContainer, "BusyMessage");
    var spinner = document.createElement("i");
    busyIndicator.messageContainer.appendChild(spinner);
    NDom.addClass(spinner, "fa fa-spinner fa-spin");

    busyIndicator.message = document.createElement("span");
    NDom.addClass(busyIndicator.message, "Text");
    busyIndicator.messageContainer.appendChild(busyIndicator.message);
    NDom.setInnerText(busyIndicator.message, widget.LOADING);

    var w = NDom.getOffsetWidth(busyIndicator.messageContainer);
    busyIndicator.messageContainer.style.marginLeft = "-" + (w / 2) + "px";
}

var defaultIndicator = {
    count: 0,
    busy: function(message) {
        initBusyIndicator();

        NDom.setInnerText(busyIndicator.message, message || widget.LOADING);
        var w = NDom.getOffsetWidth(busyIndicator.messageContainer);
        busyIndicator.messageContainer.style.marginLeft = "-" + (w / 2) + "px";

        busyIndicator.messageContainer.style.visibility = "visible";
        busyIndicator.overlay.style.display = "block";
        this.count++;
    },
    done: function() {
        this.count--;
        if (this.count <= 0) {
            busyIndicator.messageContainer.style.visibility = "hidden";
            busyIndicator.overlay.style.display = "none";
        }
    }
}
function NodeBusyIndicator(node) {
    this.node = node;
}
NodeBusyIndicator.prototype.busy = function (m) {
    NDom.addClass(this.node, "Busy");
};
NodeBusyIndicator.prototype.done = function (m) {
    NDom.removeClass(this.node, "Busy");
};

function run(task, message, indicator) {
    var i = indicator || defaultIndicator;
    var m = message || null;

    i.busy(m);
    task(function() {
        i.done();
    });
}

widget.reloadDesktopFont = function() {
        return new Promise(function(resolve) {
            require("./desktop").getDesktopFontConfig(function (config) {
                    if (config.font) document.body.style.font = config.font;
                    if (config.family) document.body.style.fontFamily = config.family;
                    if (config.style) document.body.style.fontStyle = config.style;
                    if (config.weight) document.body.style.fontWeight = config.weight;
                    if (config.size) {
                        var scale = Config.get("view.uiTextScale", 100) / 100;
                        var size = config.size;
                        if (config.size.match(/^([0-9\.]+)([pxt]+)$/)) {
                            size = (parseFloat(RegExp.$1) * scale) + RegExp.$2;
                        }
                        document.body.style.fontSize = size;
                    }

                    var family = Config.get(Config.UI_CUSTOM_FONT_FAMILY);
                    if (family) document.body.style.fontFamily = family;

                    var size = Config.get(Config.UI_CUSTOM_FONT_SIZE);
                    if (size) document.body.style.fontSize = size;

                    resolve(config);
            });
        });
};

document.addEventListener("DOMContentLoaded", function () {
    //load all registered widget class templates
    var index = -1;

    function onLoadDone() {
        debug("BOOT: Configuring DOM event.");
        BaseWidget.registerDOMMutationHandler();
        window.globalViews = {};
        debug("BOOT: Initiating UI auto-binding.");
        widget.Util.performAutoBinding(document.body, window.globalViews);
        debug("BOOT: Setting up popup handlers.");
        widget.Util.registerPopopCloseHandler();

        window.setTimeout(function () {
            document.body.setAttribute("loaded", "true");
            debug("BOOT: Revealing user-interface.");
        }, 300);
    }
    function loadNext() {
        index ++;

        if (index >= __widgetClasses.length) {
            onLoadDone();
            return;
        }

        var clazz = __widgetClasses[index];

        if (!__isSubClassOf(clazz, BaseTemplatedWidget)) {
            loadNext();
            return;
        }

        var path = BaseTemplatedWidget.getTemplatePathForViewClass(clazz);

        var viewFilePath = getStaticFilePath(path);
        const fs = require("fs");
        fs.readFile(viewFilePath, "utf8", function (error, html) {
            html = widget.Util.processLocalizationMacros(html || "");
            widget.Util.getTemplateCache()[path] = html;

            var templateName = path.replace(/[^a-z0-9]+/gi, "_");
            var className = "DynamicTemplate" + templateName;
            var processedHtml = widget.Util._processTemplateStyleSheet(html, "." + className, templateName);

            loadNext();
        });
    }

    debug("BOOT: Loading desktop font configuration.");
    widget.reloadDesktopFont().then(function () {
        debug("BOOT: Loading view definition files");
        loadNext();
    });

}, false);