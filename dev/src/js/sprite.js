const GetTextWidth = require('./get_text_width.js');
const Keyframes = function(sprite, keyframes, toLoop) {

    this.sprite = sprite;
    this.toLoop = toLoop;
    this.index = 0;
    this.frames = keyframes;
    this.current = 0;
    this.target = -1;
};
Keyframes.prototype = {
    constructor: Keyframes,

    update: function(progress) {

        let gap = (this.current += progress) - this.target;
        
        if (gap > 0) {
            let index = this.index++;
            let frame = this.frames[index];
            
            if (!frame) { // end of keyframes
                if (this.toLoop) {
                    this.index = 0;
                    frame = this.frames[this.index++];
                } else {
                    return true; // tell sprite this keyframes is over
                }
            }
            
            let sprite = this.sprite;
            let duration = frame.duration - gap * (1000 / 60);

            this.current = 0;
            this.target = duration / (1000 / 60);
            
            for (let propName in frame) {
                if (propName !== 'duration') {
                    sprite.setTransformTo(propName, frame[propName], duration);
                }
            }
        }
    },

    clear: function() {

        this.target = 0;
        this.index = this.frames.length;
        this.toLoop = false;
    }
};

function SPRITE(props) {

    this.x = 0;
    this.y = 0;
    this.toX = 0.5;
    this.toY = 0.5;
    this.width = 20;
    this.height = 20;
    this.scaleX = 1;
    this.scaleY = 1;
    this.opacity = 1;
    this.rotateZ = 0; // 360 degree
    this.radian = (Math.random() < 0.5 ? 1 : -1) * Math.PI * Math.random(); // move direction
    this.speed = 0; // move speed
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.color = void 0;
    this.toDisplay = true;
    
    for (var i in props) {
        this[i] = props[i];
    }

    this.updates = [];
    this.updateFixs = [];
    this.events = {
        click: {}
    };
    this.deltas = {};
    this.onKeyframe = false;
    this.keyframes = [];
    this.children = [];
}
SPRITE.prototype = {
    constructor: SPRITE,
    
    // build: initial draw

    updateProps: function(progress) {

        if (this.onKeyframe) {
            let keyframes = this.keyframes;
            let keyframesNum = keyframes.length;
            
            if (keyframesNum) {
                for (let ii = keyframesNum - 1; ii >= 0; ii--) {
                    if (keyframes[ii].update(progress)) { // true: end of keyframes
                        keyframes.splice(ii, 1);
                    }
                }
            } else {
                this.onKeyframe = false;
            }
        }

        var deltas = this.deltas;

		for (var i in deltas) {
			var delta = deltas[i];
			var deltaValue = delta.value;

			if (deltaValue) {
				var curValue = this[i] += deltaValue * progress;
				var tarValue = delta.target;

				if (tarValue !== void 0 && (deltaValue > 0 ? curValue > tarValue : curValue < tarValue)) { // end of transform
					this[i] = tarValue;
					delta.value = void 0;
				} else {
					var fade = delta.fade;

					if (fade) {
						var curDeltaValue = delta.value += fade * progress;

						if (fade > 0 ? curDeltaValue > 0 : curDeltaValue < 0) { // end of delta
							delta.value = void 0;
						}
					}
				}
			}
        }

        // update children
        var children = this.children;
        var childNum = children.lenght;

        if (childNum) {
            for (var i = 0; i < childNum; i++) {
                children[i].updateProps(progress);
            }
        }
    },

    update: function(progress, stage) {
        
        /*var speed = this.speed * progress;

        //this.setText({value: (speed * 100 >> 0) / 100});

        var rad = this.radian;
        var sin = Math.sin(rad);
        var cos = Math.cos(rad);
        var x = this.x + speed * cos;
        var y = this.y + speed * sin;

        this.x = x;
        this.y = y;
        this.radian = rad;*/

        var updates = this.updates;

        for (var ii = 0, il = updates.length; ii < il; ii++) {
            updates[ii].fn(progress, stage);
        }
    },

    addUpdate: function add_a_update_fn_will_execute_at_update_step(update, toSort) {
        // update: {fn: Fn, order: Num}, toSort: Bol(to indicate if to sort updates by update.order(Num) from small to large); this
        var updates = this.updates;

        update.fn = update.fn.bind(this);
        updates.push(update);

        if (toSort) {
            updates.sort(function(a, b) {

                return a.order - b.order;
            });
        }

        return this;
    },

    updateFix: function(progress, stage) {

        var updateFixs = this.updateFixs;

        for (var ii = 0, il = updateFixs.length; ii < il; ii++) {
            updateFixs[ii].fn(progress, stage);
        }
    },

    addUpdateFix: function(updateFix) {

        this.updateFixs.push(updateFix);

        return this;
    },

    render: function(ctx, pX, pY, pScaleX, pScaleY, pRotateZ, pOpacity, parent) {
        
        var x = this.x;
        var y = this.y;
        var width = this.width;
        var height = this.height;
		var toX = this.toX * width;
        var toY = this.toY * height;
        var scaleX = this.scaleX;
        var scaleY = this.scaleY;
		var rotateZ = this.rotateZ;
        var rad, sin, cos;

        if (parent) {
            
        }

		if (rotateZ) {
			rad = rotateZ * Math.PI / 180;
			sin = Math.sin(rad);
			cos = Math.cos(rad);
		} else {
			sin = 0;
			cos = 1;
		}

        ctx.setTransform(
            cos * scaleX,
            sin * scaleX,
            -sin * scaleY,
            cos * scaleY,
            x + toX,
            y + toY
        );
        ctx.globalAlpha = this.opacity;

        var color = this.color;

        if (color) {
            if (color === -1) {
                color = 'rgb(' + (this.r >> 0) + ',' + (this.g >> 0) + ',' + (this.b >> 0) + ')';
            }

            ctx.fillStyle = color;
            ctx.fillRect(-toX, -toY, width, height);
        }

        var left, top;

        // draw image
        if (this.image) {
            var image = this.image;
            var imageCache = image.cache;
            var imageWidth = imageCache.width;
            var imageHeight = imageCache.height;
                left = image.left;
                top = image.top;

            if (typeof left === 'string') {
                if (left === 'left') {
                    left = 0;
                } else if (left === 'center') {
                    left = (width - imageWidth) / 2;
                } else if (left === 'right') {
                    left = width - imageWidth;
                }
            }

            if (typeof top === 'string') {
                if (top === 'top') {
                    top = 0;
                } else if (top === 'center') {
                    top = (height - imageHeight) / 2;
                } else if (top === 'bottom') {
                    top = height - imageHeight;
                }
            }
            
            ctx.drawImage(imageCache,
                image.corpX, image.corpY, image.corpWidth, image.corpHeight,
                left - toX, top - toY, width, height
            );
        }

        // draw text
        if (this.text) {
            var text = this.text;
            var textCache = text.cache;
            var textWidth = textCache.width;
            var textHeight = textCache.height;
                left = text.left;
                top = text.top;

            if (typeof left === 'string') {
                if (left === 'left') {
                    left = 0;
                } else if (left === 'center') {
                    left = (width - textWidth) / 2;
                } else if (left === 'right') {
                    left = width - textWidth;
                }
            }

            if (typeof top === 'string') {
                if (top === 'top') {
                    top = 0;
                } else if (top === 'center') {
                    top = (height - textHeight) / 2;
                } else if (top === 'bottom') {
                    top = height - textHeight;
                }
            }
            
            ctx.drawImage(textCache, left - toX, top - toY);
        }

        // render children
        var children = this.children;
        var childNum = children.length;

        if (childNum) {
            for (var i = 0; i < childNum; i++) {
                children[i].render(ctx, this);
            }
        }
    },

    setColor: function(r, g, b) {

        if (g === void 0) {
            this.color = r;
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
            this.color = -1; // real-time generating from r, g, b
        }

        return this;
    },
    
    setText: function(props) {

        var text = this.text;
        var cache, ctx;

        if (!text) {
            cache = document.createElement('canvas');
            ctx = cache.getContext('2d');
            text = this.text = {
                cache: cache,
                ctx: ctx,
                value: '',
                color: 'black',
                size: 12, // px
                font: 'arial',
                left: 0, // 0 to 1
                top: 0
            };
        } else {
            cache = text.cache;
            ctx = text.ctx;
        }

        for (var i in props) {
            text[i] = props[i];
        }

        var width = this.width;
        var height = this.height;
        var value = text.value;
        var color = text.color;
        var size = text.size;
        var font = text.font;
        var textWidth = GetTextWidth(value, size, font);
        // reset the size of cache, this step will make cache blank
        cache.width = textWidth;
        cache.height = size;
        // should reset textAlign and textBaseline if canvas size change
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = size + 'px ' + font;
        ctx.fillStyle = color;
        ctx.fillText(value, 0, 0);

        return this;
    },

    setImage: function(props) {

        var image = this.image;
        var cache, ctx;

        if (!image) {
            cache = document.createElement('canvas');
            ctx = cache.getContext('2d');
            image = this.image = {
                cache: cache,
                ctx: ctx,
                value: void 0, // <img> object
                left: 0, // Number(in px) or 'left', 'center', 'right'
                top: 0, // Number(in px) or 'top', 'center', 'bottom',
                // corp when rendering
                corpX: 0,
                corpY: 0,
                corpWidth: 0,
                corpHeight: 0,
                // fit sprite size
                toFit: true,
                width: 0,
                height: 0
            };
        } else {
            cache = image.cache;
            ctx = image.ctx;
        }

        for (var i in props) {
            image[i] = props[i];
        }

        var value = image.value;
        var toFit = image.toFit;
        var width = image.width || this.width;
        var height = image.height || this.height;

        if (toFit) {
            width = this.width;
            height = this.height;

            if (!image.corpWidth) {
                image.corpWidth = width;
            }
    
            if (!image.corpHeight) {
                image.corpHeight = height;
            }
        } else {
            if (!image.corpWidth) {
                image.corpWidth = value.width;
            }

            if (!image.corpHeight) {
                image.corpHeight = value.height;
            }
        }
        // reset the size of cache, this step will make cache blank
        cache.width = width;
        cache.height = height;
        ctx.drawImage(value,
            0, 0, value.width, value.height,
            0, 0, width, height
        );
        //console.log(image);
        //document.body.appendChild(cache)

        return this;
    },

    /**
     * transition related methods
     */

	setTransformTo: function(name, targetValue, duration) {

		var delta = this.deltas[name];

		if (!delta) {
			delta = this.deltas[name] = {
				value: void 0,
				target: void 0,
				fade: 0
			};
		}

		var curValue = this[name];
		var frames = duration / (1000 / 60) >> 0;

		delta.value = (targetValue - curValue) / frames;
		delta.target = targetValue;
		delta.fade = 0;

		return this;
	},

	setTransform: function(name, value, duration) {

		var delta = this.deltas[name];

		if (!delta) {
			delta = this.deltas[name] = {
				value: void 0,
				target: void 0,
				fade: 0
			};
		}

		var curValue = this[name];
		var frames = duration / (1000 / 60) >> 0;

		delta.value = value / frames;
		delta.target = curValue + value;
		delta.fade = 0;

		return this;
    },

	setDelta: function(name, value, fade_value) {

		var delta = this.deltas[name];

		if (!delta) {
			delta = this.deltas[name] = {
				value: void 0,
				target: void 0,
				fade: 0
			};
		}

		delta.value = value;
		delta.target = void 0;
		delta.fade = fade_value || 0;

		return this;
    },
    
    clearDelta: function(name) { // this function also clear transform

        var delta = this.deltas[name];
        
        delta.value = void 0;
		delta.target = void 0;
		delta.fade = 0;
    },

    setKeyframes: function(keyframes, toLoop) {
        /**
         * keyframes format
         * [
         *      { // frame_1
         *          name1: value,
         *          name2: value,
         *          duration: duration
         *      },
         *      { // frame_2
         *          name1: value,
         *          name2: value,
         *          duration: duration
         *      }
         * ]
         */
        var kfs = new Keyframes(this, keyframes, toLoop);

        this.onKeyframe = true;
        this.keyframes.push(kfs);

        return kfs;
    },

    clearDelta: function(name) {

        var delta = this.deltas[name];

        delta.value = void 0;
		delta.target = void 0;
        delta.fade = 0;
        
        return this;
    },
    
    addChild: function(child) {
        
        this.children.push(child);

        return this;
    },

    on: function(event, name, fn) {

        var boundFn = fn.hasOwnProperty('prototype') ? fn : fn.bind(this);
        var eventContainer = this.events[event];
        var fnContainer = eventContainer[name] = {
            fn: boundFn,
            isRegister: false
        };
        var stage = this.stage;

        if (stage) {
            stage.eventRegisterSprites[event].push(this);
            fnContainer[isRegister] = true;
        }

        return this;
    },

    touch: function(e) {

        var events = this.events[e.type];

        for (var fnName in events) {
            events[fnName].fn(e);
        }
    }
};

module.exports = SPRITE;