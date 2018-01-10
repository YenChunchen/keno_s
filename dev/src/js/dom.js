(function() {
    
    function DOM(tagName, props, callback) {

        this.tagName = tagName;
        this.class = [];
        this.style = '';
        this.text = '';

        for (var i in props) {
            this[i] = props[i];
        }

        var entity = document.createElement(tagName);
            entity.setAttribute('class', this.class.join(' '));
        
        var style = this.style;

        for (var i in style) {
            entity.style[i] = style[i];
        }

        var text = this.text;

        if (text) {
            var lines = text.split('\n');
            var lineNum = lines.length;
            var lineHeight = 100 / lineNum;
            var lineHolder = document.createElement('div');

            lineHolder.style.cssText =
                'display: table;' +
                'position: relative;' +
                'width: 100%;' +
                'height: ' + lineHeight + '%;'
            ;

            var firstLine = document.createElement('div');

            firstLine.style.cssText =
                'display: table-cell;' +
                'vertical-align: middle;'
            ;
            firstLine.textContent = lines[0];
            lineHolder.appendChild(firstLine);
            entity.appendChild(lineHolder);

            for (var ii = 1; ii < lineNum; ii++) {
                var line = lineHolder.cloneNode();
                var lineContent = firstLine.cloneNode();
                
                lineContent.textContent = lines[ii];
                line.appendChild(lineContent);
                entity.appendChild(line);
            }
        }

        var value = this.value;

        if (value !== void 0) {
            entity.value = value;
        }

        this.entity = entity;

        if (callback) {
            callback.call(this);
        }
    }
    DOM.prototype = {
        constructor: DOM,

        addChild: function(child) {

            var childEntity = child.entity || child;

            this.entity.appendChild(childEntity);

            return this;
        },

        on: function(event, fn) {

            this.entity.addEventListener(event, fn.bind(this));

            return this;
        },

        once: function(event, fn) {

            var entity = this.entity;
            var bindedFn = fn.bind(this);
            var onceFn = function(e) {

                entity.removeEventListener(event, onceFn);
                bindedFn(e);
            };

            entity.addEventListener(event, onceFn);

            return this;
        },

        containsClass: function(className) {

            return this.entity.classList.contains(className);
        },

        addClass: function(className) {

            this.entity.classList.add(className);

            return this;
        },

        removeClass: function(className) {

            this.entity.classList.remove(className);

            return this;
        },

        setValue: function(value) {

            this.value = value;
            this.entity.value = value;

            return this;
        }
    };

    if (module) {
        module.exports = DOM;
    } else {
        window.DOM = DOM;
    }
}());