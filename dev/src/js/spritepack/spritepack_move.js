var Spritepack_move = (function() {

    var gravity = innerHeight / 100 * 0.25;
    // the update function
    function update(progress, stage) {

        var spd = this.moveSpeed * progress;
        var rad = this.moveDirection;
        //this.setText({value: (spd * 100 >> 0) / 100});
        this.moveSpeed += (rad > 0 ? 1 : -1) * gravity * progress;
        this.x += spd * Math.cos(rad);
        this.y += spd * Math.sin(rad);
    }

    // methods
    var methods = {

        setMove: function(speed, direction) {

            this.moveSpeed = speed;
            this.moveDirection = direction;

            return this;
        }
    };

    return {

        install: function(sprite, order) {

            sprite.moveSpeed = 0;
            sprite.moveDirection = 0; // radian, +/-PI

            sprite.addUpdate({
                fn: update,
                order: order || 0
            });

            for (var methodName in methods) {
                sprite[methodName] = methods[methodName].bind(sprite);
            }
        }
    };
}());