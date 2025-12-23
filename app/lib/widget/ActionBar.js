widget.ActionBar = function () {
    function actionBarClickHandler(event) {
        var target = NDom.getTarget(event);
        var button = NDom.findUpward(target, {
            eval: function (n) {
                return n._action;
            }
        });
        
        if (!button) return;
        if (button.disabled) return;
        
        NDom.cancelEvent(event);
        
        var action = button._action;
        
        action.run();
        
    }
    
    function ActionBar(container) {
        this.container = widget.get(container);
        this.actions = [];
        
        this.buttonGroupDiv = document.createElement("div");
        NDom.addClass(this.buttonGroupDiv, "btn-group nav-pills");
        this.container.appendChild(this.buttonGroupDiv);
        
        NDom.registerEvent(this.buttonGroupDiv, "click", actionBarClickHandler, false);
    }
    ActionBar.prototype.register = function (action) {
        this.actions.push(action);
        this.invalidate();
    };
    ActionBar.prototype.invalidate = function () {
        this.buttonGroupDiv.innerHTML = "";
        for (var i = 0; i < this.actions.length; i ++) {
            var action = this.actions[i];
            if (action.isVisible && !action.isVisible()) continue;
            
            var disabled = action.isApplicable && !action.isApplicable();
            var button = document.createElement("button");
            button.setAttribute("type", "button");
            NDom.addClass(button, "btn btn-default");
            button.innerHTML = "<span><i class=\"fa " + action.getIcon() + "\"></i> " + NDom.htmlEncode(action.getTitle()) + "</span>";
            this.buttonGroupDiv.appendChild(button);
            if (disabled) {
                NDom.addClass(button, "disabled");
                button.setAttribute("disabled", "true");
            }
            button._action = action;
        }
    };
    
    return ActionBar;
}();

