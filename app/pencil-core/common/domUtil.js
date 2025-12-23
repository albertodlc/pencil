// TODO: Pending delete
var Dom = {};

/**
 * ! Replace Dom = {}
 * 
 * Helper class to manager DOM elements.
 * 
 */
class NDom {
    static parser = new DOMParser();
    static serializer = new XMLSerializer();

    /**
     * 
     * @param {*} xpath 
     * @param {*} node 
     * @param {*} worker 
     * @returns 
     */
    static workOn(xpath, node, worker){
        let nodes = NDom.getList(xpath, node);

        for (let i = 0; i < nodes.length; i ++) {
            worker(nodes[i]);
        }

        return nodes.length;
    }

    /**
     * 
     * @param {*} node 
     * @returns 
     */
    static getText(node) {
        return node.textContent;
    }

    /**
     * 
     * @param {*} xpath 
     * @param {*} node 
     * @returns 
     */
    static getSingle(xpath, node) {
        var doc = node.ownerDocument ? node.ownerDocument : node;
        var xpathResult = doc.evaluate(xpath, node, PencilNamespaces.resolve, XPathResult.ANY_TYPE, null);

        return xpathResult.iterateNext();
    }

    /**
     * ! UNUSED
     * 
     * @param {*} xpath 
     * @param {*} node 
     * @returns 
     */
    static getSingleValue(xpath, node) {
        var doc = node.ownerDocument ? node.ownerDocument : node;
        var xpathResult = doc.evaluate(xpath, node, PencilNamespaces.resolve, XPathResult.ANY_TYPE, null);

        // FIXME: when changed to 'let' it says that the var is prev. declared
        var node = xpathResult.iterateNext();

        return node ? node.nodeValue : null;
    }

    /**
     * 
     * @param {*} xpath 
     * @param {*} node 
     * @returns 
     */
    static getList(xpath, node) {
        var doc = node.ownerDocument ? node.ownerDocument : node;
        var xpathResult = doc.evaluate(xpath, node, PencilNamespaces.resolve, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        var nodes = [];

        var next = xpathResult.iterateNext();

        while (next) {
            nodes.push(next);
            next = xpathResult.iterateNext();
        }

        return nodes;
    }

    /**
     * ! UNUSED
     * 
     * @returns 
     */
    static getImplementation() {
        return document.implementation;
    }

    /**
     * 
     * @param {*} relPath 
     * @param {*} preProcessFileContent 
     * @returns 
     */
    static loadSystemXml(relPath, preProcessFileContent) {
        var absPath = getStaticFilePath(relPath);
        return NDom.parseFile(absPath, preProcessFileContent);
    }

    /**
     * 
     * @param {*} element 
     * @returns 
     */
    static isElementExistedInDocument(element) {
        while (element) {
            if (element == document) {
                return true;
            }
            element = element.parentNode;
        }
        return false;
    }

    /**
     * 
     * @param {*} target 
     * @param {*} event 
     * @param {*} handler 
     * @param {*} capture 
     */
    static registerEvent(target, event, handler, capture) {
        var useCapture = false;
        if (capture) {
            useCapture = true;
        }

        target.addEventListener(event, handler, useCapture);
    }

    /**
     * 
     * @param {*} e 
     * @returns 
     */
    static getEvent(e) {
        return e;
    }

    /**
     * ! UNUSED
     * 
     * @param {*} node 
     * @param {*} event 
     */
    static disableEvent(node, event) {
        NDom.registerEvent(node, event, function(ev) {NDom.cancelEvent(ev);}, true );
    }

    /**
     * 
     * @param {*} e 
     */
    static cancelEvent(e) {
        var event = NDom.getEvent(e);
        if (event.preventDefault) event.preventDefault();
        else event.returnValue = false;
    }

    /**
     * 
     * @param {*} e 
     * @returns 
     */
    static getTarget(e) {
        if (!e) return {};
        var event = NDom.getEvent(e);
        return event.srcElement ? event.srcElement : (event.originalTarget ? event.originalTarget : event.target);
    }

    /**
     * 
     * @param {*} node 
     * @param {*} className 
     * @returns 
     */
    static addClass(node, className) {
        if (NDom.hasClass(node, className)) return;
        node.className += " " + className;
    }

    /**
     * 
     * @param {*} node 
     * @param {*} className 
     * @returns 
     */
    static hasClass(node, className) {
        return ((" " + node.className + " ").indexOf(" " + className + " ") >= 0);
    }

    /**
     * 
     * @param {*} node 
     * @param {*} className 
     * @returns 
     */
    static removeClass(node, className) {
        if (node.className == className) {
            node.className = "";
            return;
        }
        var re = new RegExp("(^" + className + " )|( " + className + " )|( " + className + "$)", "g");
        var reBlank = /(^[ ]+)|([ ]+$)/g;
        node.className = (node.className + "").replace(re, " ").replace(reBlank, "");
    }

    /**
     * 
     * @param {*} node 
     * @param {*} className 
     * @param {*} add 
     */
    static toggleClass(node, className, add) {
        if (add) {
            NDom.addClass(node, className);
        } else {
            NDom.removeClass(node, className);
        }
    }

    /**
     * 
     * @param {*} control 
     * @returns 
     */
    static getOffsetLeft(control) {
        var offset = control.offsetLeft;
        var parent = control.offsetParent;
        if (parent) if (parent != control) return offset + NDom.getOffsetLeft(parent);
        return offset;
    }

    /**
     * 
     * @param {*} control 
     * @returns 
     */
    static getOffsetTop(control) {
        var offset = control.offsetTop;
        var parent = control.offsetParent;
        if (parent) if (parent != control) {
            var d = parent.scrollTop || 0;
            return offset + NDom.getOffsetTop(parent) - d;
        }
        return offset;
    }

    /**
     * 
     * @param {*} control 
     * @returns 
     */
    static getOffsetHeight(control) {
        return control ? control.offsetHeight : 0;
    }

    /**
     * 
     * @param {*} control 
     * @returns 
     */
    static getOffsetWidth(control) {
        return control ? control.offsetWidth : 0;
    }

    /**
     * 
     * @param {*} parent 
     * @param {*} child 
     * @returns 
     */
    static isChildOf(parent, child) {
        if (!parent || !child) {
            return false;
        }
        if (parent == child) {
            return true;
        }
        return NDom.isChildOf(parent, child.parentNode);
    }

    /**
     * 
     * @param {*} node 
     * @param {*} evaluator 
     * @param {*} limit 
     * @returns 
     */
    static findUpwardWithEval(node, evaluator, limit) {
        if (node == null || (limit && limit(node))) {
            return null;
        }
        if (evaluator.eval(node)) {
            return node;
        }
        return NDom.findUpward(node.parentNode, evaluator);
    }

    /**
     * 
     * @param {*} node 
     * @param {*} evaluator 
     * @returns 
     */
    static findUpward(node, evaluator) {
        try {
            if (node == null) {
                return null;
            }
            if (evaluator.eval) {
                return NDom.findUpwardWithEval(node, evaluator);
            }
            if (evaluator(node)) {
                return node;
            }
            return NDom.findUpward(node.parentNode, evaluator);
        } catch (e) { return null; }
    }
    
    /**
     * 
     * @param {*} node 
     * @param {*} dataName 
     * @returns 
     */
    static findUpwardForData(node, dataName) {
        var n = NDom.findUpwardForNodeWithData(node, dataName);
        if (!n) return undefined;
        return n[dataName];
    }

    /**
     * 
     * @param {*} node 
     * @param {*} dataName 
     * @returns 
     */
    static findUpwardForNodeWithData(node, dataName) {
        var n = NDom.findUpward(node, function (x) {
            return typeof(x[dataName]) != "undefined";
        });

        return n;
    }

    /**
     * 
     * @param {*} node 
     * @param {*} evaluator 
     * @param {*} worker 
     * @returns 
     */
    static doUpward(node, evaluator, worker) {
        if (node == null) {
            return;
        }
        if (evaluator(node)) {
            worker(node);
        }
        return NDom.doUpward(node.parentNode, evaluator, worker);
    }

    /**
     * 
     * @param {*} node 
     * @param {*} className 
     * @returns 
     */
    static findParentWithClass(node, className) {
        return NDom.findUpward(node, function (node) {
            var index = (" " + node.className + " ").indexOf(" " + className + " ") >= 0
            
            return (index > 0);
        });
    }

    /**
     * 
     * @param {*} node 
     * @param {*} tagName 
     * @returns 
     */
    static findParentByTagName(node, tagName) {
        tagName = tagName.toUpperCase();
        return NDom.findUpward(node, function (n) {
            return n.tagName && n.tagName.toUpperCase && (n.tagName.toUpperCase() == tagName);
        });
    }

    /**
     * 
     * @param {*} node 
     * @param {*} evaluator 
     * @param {*} worker 
     * @returns 
     */
    static doOnChildRecursively(node, evaluator, worker) {
        if (!node || !node.childNodes) return null;

        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (evaluator.eval(child)) worker(child);
            NDom.doOnChildRecursively(child, evaluator, worker);
        }

    }

    /**
     * 
     * @param {*} node 
     * @param {*} evaluator 
     * @param {*} worker 
     * @returns 
     */
    static doOnChild(node, evaluator, worker) {
        if (!node || !node.childNodes) return null;

        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (evaluator.eval(child)) worker(child);
        }
    }

    /**
     * 
     * @param {*} node 
     * @param {*} worker 
     */
    static doOnAllChildren(node, worker) {
        NDom.doOnChild(node, DomAcceptAllEvaluator, worker);
    }

    /**
     * 
     * @param {*} node 
     * @param {*} worker 
     * @returns 
     */
    static doOnAllChildRecursively(node, worker) {
        if (!node || !node.childNodes) return null;

        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (DomAcceptAllEvaluator.eval(child)) worker(child);
            NDom.doOnChildRecursively(child, DomAcceptAllEvaluator, worker);
        }
    }

    /**
     * 
     * @param {*} node 
     * @param {*} evaluator 
     * @returns 
     */
    static findTop(node, evaluator) {
        var top = null;

        try {
            NDom.doUpward(node, evaluator, function (node) {
                top = node;
            });
        } catch (e) {}

        return top;
    }

    /**
     * 
     * @param {*} name 
     * @param {*} target 
     * @param {*} data 
     */
    static emitEvent(name, target, data) {
        var event = target.ownerDocument.createEvent("Events");
        event.initEvent(name, true, false);
        if (Util.isXul6OrLater()) {
            event = target.ownerDocument.createEvent("CustomEvent");
            event.initCustomEvent(name, true, false, data);
        }
        if (data) {
            for (name in data) event[name] = data[name];
        }
        target.dispatchEvent(event);
    }

    /**
     * 
     * @param {*} node 
     * @returns 
     */
    static empty(node) {
        if (!node || !node.hasChildNodes) return;
        while (node.hasChildNodes()) node.removeChild(node.firstChild);
    }

    /**
     * 
     * @param {*} xml 
     * @param {*} dom 
     * @returns 
     */
    static parseToNode(xml, dom) {
        var doc = NDom.parser.parseFromString(xml, "text/xml");
        if (!doc || !doc.documentElement || doc.documentElement.namespaceURI == "http://www.mozilla.org/newlayout/xml/parsererror.xml") {
            return null;
        }

        var node = doc.documentElement;
        if (dom) return dom.importNode(node, true);

        return node;
    }

    /**
     * 
     * @param {*} xml 
     * @returns 
     */
    static parseDocument(xml) {
        if (xml && xml.charCodeAt(0) === 0xFEFF) {
            xml = xml.substr(1);
        }

        var dom = NDom.parser.parseFromString(xml, "text/xml");
        return dom;
    }

    /**
     * 
     * @param {*} node 
     * @returns 
     */
    static serializeNode(node) {
        return NDom.serializer.serializeToString(node);
    }

    /**
     * 
     * @param {*} node 
     * @param {*} file 
     * @param {*} additionalContentPrefixes 
     */
    static serializeNodeToFile(node, file, additionalContentPrefixes) {
        var xml = Controller.serializer.serializeToString(node);
        var root = node.documentElement ? node.documentElement : node;

        if (root.namespaceURI == PencilNamespaces.html) {
            //this is actually an HTML document, performing a trick for supporting ">" chars inside <style> tags
            xml = xml.replace(/(<style[^>]*>)([^<]+)(<\/style>)/g, function (whole, leading, content, trailing) {
                return leading + content.replace(/&gt;/g, ">") + trailing;
            });
        }

        fs.writeFileSync(file, xml, "utf8");
    }

    /**
     * ! UNUSED
     * 
     * @returns 
     */
    static _buildHiddenFrame() {
        if (Dom._hiddenFrame) return;

        var iframe = document.createElementNS(PencilNamespaces.html, "html:iframe");

        var container = document.body;
        if (!container) container = document.documentElement;
        var box = document.createElement("box");
        box.setAttribute("style", "xvisibility: hidden");

        iframe.setAttribute("style", "border: none; width: 1px; height: 1px; xvisibility: hidden");
        iframe.setAttribute("src", "chrome://pencil/content/blank.html");

        box.appendChild(iframe);
        container.appendChild(box);

        box.style.MozBoxPack = "start";
        box.style.MozBoxAlign = "start";

        Dom._hiddenFrame = iframe.contentWindow;
        Dom._hiddenFrame.document.body.setAttribute("style", "padding: 0px; margin: 0px;")
    }

    /**
     * 
     * @param {*} html 
     * @returns 
     */
    static toXhtml(html) {
        if (!Dom._dummyDiv) {
            Dom._dummyDiv = document.createElement("div");
            document.body.appendChild(Dom._dummyDiv);
        }
        Dom._dummyDiv.innerHTML = html;
        Dom._dummyDiv.style.display = "block";
        var xhtml = NDom.serializeNode(Dom._dummyDiv);
        Dom._dummyDiv.style.display = "none";
        return xhtml;
    }

    /**
     * 
     * @param {*} text 
     * @returns 
     */
    static htmlEncode(text) {
        if (!Dom.htmlEncodeDiv) Dom.htmlEncodeDiv = document.createElement("div");
        Dom.htmlEncodeDiv.innerHTML = "";
        Dom.htmlEncodeDiv.appendChild(document.createTextNode(text));
        return Dom.htmlEncodeDiv.innerHTML;
    }

    /**
     * 
     * @param {*} s 
     * @param {*} preserveCR 
     * @returns 
     */
    static attrEncode(s, preserveCR) {
        preserveCR = preserveCR ? '&#13;' : '\n';
        return ('' + s) /* Forces the conversion to string. */
            .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
            .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            /*
            You may add other replacements here for HTML only
            (but it's not necessary).
            Or for XML, only if the named entities are defined in its DTD.
            */
            .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
            .replace(/[\r\n]/g, preserveCR);
            ;
    }

    /**
     * 
     * @param {*} s 
     * @returns 
     */
    static htmlStrip(s) {
        if (!Dom.htmlEncodePlaceHolder) {
            Dom.htmlEncodePlaceHolder = document.createElement("div");
        }

        Dom.htmlEncodePlaceHolder.innerHTML = s;
        var t = NDom.getInnerText(Dom.htmlEncodePlaceHolder);
        Dom.htmlEncodePlaceHolder.innerHTML = "";

        return t;
    }

    /**
     * 
     * @param {*} node 
     * @returns 
     */
    static getInnerText(node) {
        return node.innerText || node.textContent
                || ((node.firstChild && node.firstChild.value) ? node.firstChild.value : "");
    }

    /**
     * 
     * @param {*} element 
     * @param {*} text 
     */
    static setInnerText(element, text) {
        element.innerHTML = "";
        element.appendChild(element.ownerDocument.createTextNode(text));
    }

    /**
     * 
     * @param {*} shape 
     */
    static renewId(shape) {
        var seed = Math.round(Math.random() * 1000);

        NDom.workOn(".//*/@id|/@id", shape, function (node) {
            var uuid = Util.newUUID();
            NDom.updateIdRef(shape, node.value, uuid);
            node.value = uuid;
        });
    }

    /**
     * 
     * @param {*} shape 
     * @param {*} oldId 
     * @param {*} newId 
     */
    static updateIdRef(shape, oldId, newId) {
        NDom.workOn(".//*/@p:filter | .//*/@filter | .//*/@style | .//*/@xlink:href | .//*/@clip-path | .//*/@marker-end | .//*/@marker-start | .//*/@mask | .//*/@childRef | .//@p:parentRef", shape, function (node) {
            var value = node.value;
            if (value == "#" + oldId) {
                value = "#" + newId;
            } else {
                value = value.replace(/url\(#([^\)]+)\)/g, function (zero, one) {
                    if (one == oldId) {
                        return "url(#" + newId + ")";
                    } else {
                        return zero;
                    }
                });
                value = value.replace(/url\("\#([^"]+)"\)/g, function (zero, one) {
                    if (one == oldId) {
                        return "url(#" + newId + ")";
                    } else {
                        return zero;
                    }
                });
            }
            node.value = value;
        });
    }

    /**
     * ! UNUSED
     * 
     * @param {*} shape 
     * @param {*} seed 
     */
    static resolveIdRef(shape, seed) {
        NDom.workOn(".//*/@p:filter | .//*/@filter | .//*/@style | .//*/@xlink:href | .//*/@clip-path | .//*/@marker-end | .//*/@marker-start | .//*/@mask | .//*/@childRef | .//@p:parentRef", shape, function (node) {
            var value = node.value;
            if (value.substring(0, 1) == "#") {
                value += seed;
            } else {
                value = value.replace(/url\(#([^\)]+)\)/g, function (zero, one) {
                    return "url(#" + one + seed + ")";
                });
                value = value.replace(/url\("\#([^"]+)"\)/g, function (zero, one) {
                    return "url(#" + one + seed + ")";
                });
            }
            node.value = value;
        });
    }

    /**
     * ! UNUSED
     * 
     * @param {*} node 
     * @param {*} attributeName 
     * @param {*} handler 
     */
    static handleAttributeChange(node, attributeName, handler) {
        node.addEventListener("DOMAttrModified", function(event) {
            if (event.attrName == attributeName) {
                handler(event.prevValue, event.newValue);
            }
        }, false);
    }

    /**
     * ! UNUSED
     * 
     * @param {*} fragment 
     * @param {*} node 
     * @returns 
     */
    static appendAfter(fragment, node) {
        if (!node.parentNode) {
            return;
        }
        if (node.nextSibling) {
            node.parentNode.insertBefore(fragment, node.nextSibling);
        } else {
            node.parentNode.appendChild(fragment);
        }
    }

    /**
     * ! UNUSED
     * 
     * @param {*} node1 
     * @param {*} node2 
     * @returns 
     */
    static swapNode(node1, node2) {
        var parentNode = node1.parentNode;

        var ref = node2.nextSibling;
        if (ref == node1) {
            debug("****, simple swap: " + [node1.label, node2.label]);
            parentNode.removeChild(node1);
            parentNode.insertBefore(node1, node2);

            return;
        }
        parentNode.removeChild(node2);
        parentNode.insertBefore(node2, node1);

        parentNode.removeChild(node1);
        parentNode.insertBefore(node1, ref);
    }

    /**
     * 
     * @param {*} file 
     * @param {*} preProcessFileContent 
     * @returns 
     */
    static parseFile(file, preProcessFileContent) {
        var fileContents = fs.readFileSync(file, "utf8");
        if (preProcessFileContent) fileContents = preProcessFileContent(fileContents);
        var dom = NDom.parser.parseFromString(fileContents, "text/xml");
        return dom;
    }

    /**
     * ! UNUSED
     * 
     * @param {*} node 
     */
    static hide(node) {
        node._old_display = node.style.display;
        node.style.display = "none";
    }

    /**
     * 
     * @param {*} node 
     * @returns 
     */
    static show(node) {
        if (node.style.display != "none") return;
        node.style.display = node._old_display || "block";
    }

    /**
     * 
     * @param {*} spec 
     * @param {*} doc 
     * @param {*} holder 
     * @returns 
     */
    static newDOMElement(spec, doc, holder) {
        var ownerDocument = doc ? doc : document;
        var e = spec._uri ? ownerDocument.createElementNS(spec._uri, spec._name) : ownerDocument.createElement(spec._name);

        for (name in spec) {
            if (name.match(/^_/)) continue;

            if (name.match(/^([^:]+):(.*)$/)) {
                var prefix = RegExp.$1;
                var localName = RegExp.$2;
                var uri = PencilNamespaces[prefix];
                e.setAttributeNS(uri, name, spec[name]);
            } else {
                e.setAttribute(name, spec[name]);
                if (name == "class") {
                    NDom.addClass(e, spec[name]);
                }
            }
        }

        if (spec._text) {
            e.appendChild(e.ownerDocument.createTextNode(spec._text));
        }
        if (spec._cdata) {
            e.appendChild(e.ownerDocument.createCDATASection(spec._cdata));
        }
        if (spec._html) {
            e.innerHTML = spec._html;
        }
        if (spec._children && spec._children.length > 0) {
            e.appendChild(NDom.newDOMFragment(spec._children, e.ownerDocument, holder || null));
        }

        if (holder && spec._id) {
            holder[spec._id] = e;
        }

        return e;
    }

    /**
     * 
     * @param {*} specs 
     * @param {*} doc 
     * @param {*} holder 
     * @returns 
     */
    static newDOMFragment(specs, doc, holder) {
        var ownerDocument = doc ? doc : document;
        var f = ownerDocument.createDocumentFragment();

        for (var i in specs) {
            f.appendChild(NDom.newDOMElement(specs[i], ownerDocument, holder || null));
        }
        return f;
    }

    /**
     * 
     * @param {*} container 
     * @param {*} ids 
     * @param {*} doc 
     */
    static populate(container, ids, doc) {
        var dom = doc ? doc : document;
        for (var i = 0; i < ids.length; i ++) {
            var id = ids[i];
            container[id] = dom.getElementById(id);
        }
    }
}