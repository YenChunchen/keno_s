(function() {

    //var gravity = document.documentElement.clientHeight / 100 * 0.1;
    var gravity = 1080 / 100 * 0.05;
    // the update function
    function update(progress, stage) {

        if (this.toMove) {
            this.x += this.moveSpeedX * progress;
            this.y += this.moveSpeedY * progress;

            if (this.enableGravity) {
                this.moveSpeedY += gravity * progress;
            }
        }
    }

    // methods
    var methods = {

        setMove: function(force, radian) { // set force to 0 to be still

            this.toMove = !!force;

            if (force) {
                this.moveSpeedX = Math.cos(radian) * force;
                this.moveSpeedY = Math.sin(radian) * force;
            }

            return this;
        },

        toggleGravity: function(toEnable) {

            this.enableGravity = toEnable;

            return this;
        },

        getForce: function() {

            return Math.sqrt(Math.pow(this.moveSpeedX, 2) + Math.pow(this.moveSpeedY, 2));
        },

        getRadain: function() {

            return Math.atan2(this.moveSpeedY, this.moveSpeedX);
        }
    };

    var This = {

        install: function(sprite, props) {

            props = props || {};

            sprite.moveSpeedX = 0;
            sprite.moveSpeedY = 0;
            sprite.toMove = false;
            sprite.enableGravity = true;
            sprite.addUpdate({
                fn: update,
                order: props.order || 0
            });

            for (var propName in props) {
                sprite[propName] = props[propName];
            }

            for (var methodName in methods) {
                sprite[methodName] = methods[methodName].bind(sprite);
            }
        }
    };

    if (module) {
        module.exports = This;
    } else {
        window.Spritepack_move_elevation = This;
    }
}());