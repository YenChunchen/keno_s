function STAGE(width, height, props) {

    var view = document.createElement('canvas');
		view.width = width;
        view.height = height;
    
    this.view = view;
    this.ctx = view.getContext('2d');
    this.width = width;
    this.height = height;
    this.color = void 0;
    this.speed = 1; // 1 = 100% = 1000ms / 60frames = 16.667ms per frame
    
    for (let propName in props) {
        this[propName] = props[propName];
    }

    this.updaters = [];
    this.renders = {};
    this.sprites = [];
    this.timeouts = [];
    this.intervals = [];
    this.eventRegisterSprites = {
        click: []
    };
    // init
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.touch = this.touch.bind(this);

    for (var event in this.eventRegisterSprites) {
        view.addEventListener(event, this.touch);
    }
};
STAGE.prototype = {
    constructor: STAGE,

    start: function() {

        if (this.onUpdate) {
            return;
        }
        
        var now = Date.now();
        // update
        this.startTime = now;
        this.lastUpdateTime = now;
        this.onUpdate = setInterval(this.update, 0);
        this.update();
        // render
        this.totalFrames = 0;
        this.onRender = true;
        this.render();
    },

    stop: function() {
        
        // clear update
        clearInterval(this.onUpdate);
        this.onUpdate = false;
        // clear render
        this.onRender = false;
    },

    enableEyelessStop: function() {

        window.addEventListener('blur', this.stop.bind(this));
        window.addEventListener('focus', this.start.bind(this));

        return this;
    },

    update: function() {
        
        if (!this.onUpdate) {
            return;
        }
        // generate and recording progress
        var now = Date.now();
        var elapsed = (now - this.lastUpdateTime) * this.speed;
        var progress = elapsed / (1000 / 60);

        this.lastUpdateTime = now;

        // start update
        var i, l, toRemove;

        // timer
        var timeouts = this.timeouts;
        var intervals = this.intervals;
        var timer, current;
        // timeout
        for (i = timeouts.length - 1; i >= 0; i--) {
            timer = timeouts[i];

            if (timer.toRemove) { // forced to remove
                timeouts.splice(i, 1);
                continue;
            }

            current = timer.current += elapsed;

            if (current > timer.target) { // time is out
                timer.callback();
                timeouts.splice(i, 1);
            }
        }
        // interval
        for (i = intervals.length - 1; i >= 0; i--) {
            timer = intervals[i];

            if (timer.toRemove) { // forced to remove
                intervals.splice(i, 1);
                continue;
            }

            current = timer.current += elapsed;

            if (current > timer.target) { // time is out
                timer.current = 0;
                toRemove = timer.callback(++timer.times);

                if (toRemove) {
                    intervals.splice(i, 1);
                }
            }
        }

        // updater
        var updaters = this.updaters;

        for (i = updaters.length - 1; i >= 0; i--) {
            var toRemove = updaters[i](progress);

            if (toRemove) {
                updaters.splice(i, 1);
            }
        }

        // sprite
        var sprites = this.sprites;
        var spriteNum = sprites.length;
        var sprite;

        for (i = 0; i < spriteNum; i++) {
            sprite = sprites[i];
            sprite.updateProps(progress, this);
        }

        for (i = 0; i < spriteNum; i++) {
            sprite = sprites[i];
            sprite.update(progress, this);
        }

        /*for (i = 0; i < spriteNum; i++) {
            sprites[i].updateFix(progress, this);
        }*/
    },

    render: function() {

        if (!this.onRender) {
            return;
        }
        // register next rendering
        requestAnimationFrame(this.render);
        // update FPS
        var FPS = this.FPS = this.totalFrames++ / (Date.now() - this.startTime) * 1000;
        // render
        var ctx = this.ctx;
        var i, l;
        // restore canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, this.width, this.height);

        if (this.color) {
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // render
        var renders = this.renders;

        for (i in renders) {
            renders[i](this);
        }
        // sprite
        var renderNum = 0;
        var sprites = this.sprites;
        var sprite;

        // sort by zIndex
        sprites.sort(function(a, b) {

            return (a.zIndex || 0) - (b.zIndex || 0);
        });

        for (i = 0, l = sprites.length; i < l; i++) {
            sprite = sprites[i];
            
            if (sprite.toDisplay) {
                renderNum++;
                sprite.render(ctx);
            }
        }
    
        // show info
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        //ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        //ctx.fillRect(0, 0, 20, 20);
        ctx.fillStyle = 'yellow';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'hanging';
        ctx.fillText('FPS: ' + (FPS * 100 >> 0) / 100 + ', rendered_sprite_num: ' + renderNum, 1, 1);
    },

    addUpdater: function(updater) {

        this.updaters.push(updater);

        return this;
    },

    addRender: function(name, render) {

        this.renders[name] = render;

        return this;
    },

    addSprite: function(sprite) {
        // sprite: SPRITE
        var spriteEvents = sprite.events;
        var eventRegisterSprites = this.eventRegisterSprites;

        for (var eventName in spriteEvents) {
            var spriteEvent = spriteEvents[eventName];

            for (var fnName in spriteEvent) {
                var fnContainer = spriteEvent[fnName];

                if (!fnContainer.isRegister) {
                    eventRegisterSprites[eventName].push(sprite);
                    fnContainer.isRegister = true;
                    break;
                }
            }
        }

        this.sprites.push(sprite);
        sprite.stage = this;

        return this;
    },

    touch: function(e) {

        //e.offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft; // for mobile
        var view = this.view;
        var compressRationWidth = view.offsetWidth / this.width;
        var compressRationHeight = view.offsetHeight / this.height;
        var pointX = e.offsetX / compressRationWidth;
        var pointY = e.offsetY / compressRationHeight;
        var sprites = this.eventRegisterSprites[e.type];
        
        for (var i = 0, l = sprites.length; i < l; i++) {
            var sprite = sprites[i];
            var sprLeft = sprite.x;
            var sprTop = sprite.y;
            var sprRight = sprLeft + sprite.width;
            var sprBottom = sprTop + sprite.height;

            if (pointX > sprLeft && pointX < sprRight && pointY > sprTop && pointY < sprBottom) {
                sprite.touch(e);
            }
        }
    },

    setTimeout: function(callback, time) {

        var timeouts = this.timeouts;
        var timeout = {
            callback: callback,
            current: 0,
            target: time,
            toRemove: false
        };

        timeouts.push(timeout);

        return timeout;
    },

    setInterval: function(callback, time) {

        var intervals = this.intervals;
        var interval = {
            callback: callback,
            times: 0,
            current: 0,
            target: time,
            toRemove: false
        };

        intervals.push(interval);

        return interval;
    }
};

if (module) {
    module.exports = STAGE;
}