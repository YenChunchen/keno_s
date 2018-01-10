var Gate = (function() {
    
    const Sprite = require('./sprite.js');
    var Stage;
    var NumOriginX = 0;
    var NumOriginY = 0;
    var NumWidth = 0;
    var NumHeight = 0;
    var NumAniDuration = 250; // ms
    var Gate0, Gate1; // instance of GATE, 0: left gate, 1: right gate
    var Gates = [];
    var BolIsOpen = false;

    function GATE(props) {

        props.width = NumWidth;
        props.height = NumHeight;

        this.sprite = new Sprite(props)
        .on('click', 'toggle', function() {

            if (!BolIsOpen) {
                This.open();
            } else {
                This.close();
            }
        });
        // init
        this.build();
    }
    GATE.prototype = {
        constructor: GATE,

        build: function() {
            

        },

        setPosition: function(position) {
            // position: Num;
            var tarY = NumOriginY + NumPositionTop;
            var remainder = position % 2;

            if (remainder) { // 1, 3, 5
                tarY += (9 - (position / 2 >> 0)) * NumHeight;
            } else { // 2, 4, 6
                tarY += (10 - position / 2) * NumHeight;
            }

            var sprite = this.sprite;

            sprite.x = NumOriginX + position % 2 * NumGateWidth;
            sprite.y = NumOriginY - NumHeight;
            sprite.toDisplay = true;
            sprite.radian = Math.PI / 2;
            //sprite.speed = 5;
        },

        restore: function() {

            var sprite = this.sprite;

            sprite
            .setTransformTo('scaleX', 2, 100)
            .setTransformTo('scaleY', 2, 100)
            .setTransformTo('opacity', 0, 100);

            setTimeout(function restore_sprite() {

                sprite.toDisplay = false;
                sprite.x = 0;
                sprite.y = NumHeight;
                sprite.scaleX = sprite.scaleY = sprite.opacity = 1;
                sprite.speed = 0;
            }, 100);
        }
    };

    // the method to return
    var This = {

        init: function(stage, originX, originY, gateMargin, width, height, anchorPosition, leftGateImage, rightGateImage) {

            Stage = stage;
            NumOriginX = originX;
            NumOriginY = originY;
            NumWidth = width;
            NumHeight = height;
            // create gates
            Gate0 = new GATE({ // left
                x: NumOriginX,
                y: NumOriginY,
                toX: anchorPosition / width,
                toY: anchorPosition / height
            });
            Gate1 = new GATE({ // right
                x: NumOriginX + NumWidth + gateMargin,
                y: NumOriginY,
                toX: (width - anchorPosition) / width,
                toY: anchorPosition / height
            });

            let images = require('./load_images.js').images;

            Gate0.sprite.setImage({
                //value: leftGateImage
                value: images.gate_left
            })
            Gate1.sprite.setImage({
                //value: rightGateImage
                value: images.gate_right
            })
            Stage
            .addSprite(Gate0.sprite)
            .addSprite(Gate1.sprite);
            Gates.push(Gate0, Gate1);
        },

        get: function(id) {

            return Gates[id];
        },
        
        open: function(time) {

            BolIsOpen = true;
            Gate0.sprite.setTransformTo('rotateZ', 90, NumAniDuration);
            Gate1.sprite.setTransformTo('rotateZ', -90, NumAniDuration);

            if (time) {
                Stage.setTimeout(function() {

                    BolIsOpen = false;
                    Gate.close();
                }, time);
            }
        },

        close: function() {

            BolIsOpen = false;
            Gate0.sprite.setTransformTo('rotateZ', 0, NumAniDuration);
            Gate1.sprite.setTransformTo('rotateZ', 0, NumAniDuration);
        },

        isOpen: function() {

            return BolIsOpen;
        }
    };

    module.exports = This;
}());