(function() {
    
    const Sprite = require('./sprite.js');
    const Spritepack_move_elevation = require('./spritepack/spritepack_move_elevation.js');
    const Card = require('./card.js');
    const Gate = require('./gate.js');
    var Stage;
    var NumBall = 0;
    var NumOriginX = 0;
    var NumOriginY = 0;
    var NumContainerMargin = 0;
    var ColBall;
    var NumBallWidth = 0;
    var NumBallHeight = 0;
    var NumFontRationToHeight = 58 / 90;
    var NumTextSize = 0;
    var ImgBall;

    var DrawnBalls = {

        number: 0,

        balls: [],

        add: function(ball) {

            this.balls.push(ball);
            this.number++;
        },

        remove: function(ball) {

            var balls = this.balls;
            var index = balls.indexOf(ball);

            if (index !== -1) {
                balls.splice(index, 1);
                this.number--;
            }
        },

        get: function() {

            return this.balls;
        }
    };

    function BALL(number) {

        var sprite = new Sprite({
            //x: NumOriginX,
            //y: NumOriginY - NumBallHeight,
            zIndex: 2,
            width: NumBallWidth,
            height: NumBallHeight,
            toDisplay: false
        })
        .setImage({
            value: ImgBall
        })
        .setText({
            value: number,
            color: 'black',
            size: NumTextSize,
            font: 'novem',
            left: 'center',
            top: 'center'
        })
        .on('click', 'destroy', this.destroy.bind(this));

        this.sprite = sprite;
        this.number = number;
        this.rotateRate = (Math.random() < 0.5 ? 1 : -1) * Math.random() * 0.25;
        this.isDraw = false;

        ColBall[number] = this;

        // init
        this.build();
    }
    BALL.prototype = {
        constructor: BALL,

        build2: function() {

            var gravity = 1;
            var ratio = 0.5; // speed reduction multiplier when collided
            var sprite = this.sprite;
            var hellY = Stage.height;

            Stage.addUpdater(function(progress) {

                if (!sprite.toDisplay) {
                    return;
                }
                
                var y = sprite.y;
                var rad = sprite.radian; // 2 possible values, Math.PI / 2(down) or -Math.PI / 2(up)
                var spd = sprite.speed; // always positive
                // add gravity
                spd += (rad > 0 ? 1 : -1) * gravity * progress;

                // check if speed is enough for flying
                if (rad < 0 && spd < 0) { // no more speed to fly, starting to drop
                    spd = 0;
                    rad *= -1;
                }

                // check if drop to the hell(ball is invisible)
                if (y > hellY) {
                    this.restore();
                    return;
                }

                // collision tests
                var bot = y + sprite.height; // bottom
                
                // collision test with Gates
                if (!Gate.isOpen()) {
                    var gate = Gate.get(this.number % 2 ? 1 : 0);
                    var gateSprite = gate.sprite;
                    var gateY = gateSprite.y;
                        
                    if (bot > gateY) { // gate collided
                        y = gateY - NumBallHeight;
                        spd *= ratio;
                        rad *= -1;

                        if (spd < 1) {
                            spd = 0;
                        }
                    }
                }
                
                // collision test with other balls
                var x = sprite.x;

                for (var ii = 1, il = ColBall.length; ii < il; ii++) {
                    var tarBall = ColBall[ii];

                    if (tarBall !== this) {
                        var tarSprite = tarBall.sprite;
                        
                        if (tarSprite.toDisplay && tarSprite.x === x) {
                            var tarY = tarSprite.y;
                            var tarBottom = tarY + tarSprite.height;

                            if (y < tarBottom && bot > tarY) { // collided
                                var colDir = tarY > y ? 1 : -1;
                                // fix position
                                if (colDir > 0) {
                                    y = tarY - NumBallHeight;
                                } else if (spd > 1) {
                                    y = tarBottom;
                                }
                                
                                spd *= ratio;
                                rad *= -1;
                
                                if (spd < 1) {
                                    //spd = 0;
                                }
                            }
                        }
                    } else {
                        //console.log('skip self');
                    }
                }
                
                // update sprite
                sprite.y = y;
                sprite.speed = spd;
                sprite.radian = rad;
            }.bind(this));
        },

        build3: function() {

            var gravity = 0.5;
            var ratio = 0.25; // speed reduction multiplier when collided
            var sprite = this.sprite;
            var hellY = Stage.height;

            Stage.addUpdater(function(progress) {

                if (!sprite.toDisplay) {
                    return;
                }
                
                var y = sprite.y;
                var rad = sprite.moveDirection; // 2 possible values, Math.PI / 2(down) or -Math.PI / 2(up)
                var spd = sprite.moveSpeed; // always positive
                // add gravity
                spd += (rad > 0 ? 1 : -1) * gravity * progress;

                // check if speed is enough for flying
                if (rad < 0 && spd < 0) { // no more speed to fly, starting to drop
                    spd = 0;
                    rad *= -1;
                }

                // check if drop to the hell(ball is invisible)
                if (y > hellY) {
                    this.restore();
                    return;
                }

                // collision tests
                var bot = y + sprite.height; // bottom
                
                // collision test with Gates
                if (!Gate.isOpen()) {
                    var gate = Gate.get(this.number % 2 ? 1 : 0);
                    var gateSprite = gate.sprite;
                    var gateY = gateSprite.y;
                        
                    if (bot > gateY) { // gate collided
                        y = gateY - NumBallHeight;
                        spd *= ratio;
                        rad *= -1;

                        if (spd < 1) {
                            spd = 0;
                        }
                    }
                }
                
                // collision test with other balls
                var x = sprite.x;
                var isColide = false;

                for (var ii = 1, il = ColBall.length; ii < il; ii++) {
                    var tarBall = ColBall[ii];

                    if (tarBall !== this) {
                        var tarSprite = tarBall.sprite;
                        var tarY = tarSprite.y
                        
                        if (tarY > y && tarSprite.toDisplay && tarSprite.x === x) { // check lower balls only
                            var tarBottom = tarY + tarSprite.height;

                            if (bot > tarY) { // collided
                                var tarRad = tarSprite.moveDirection;

                                isColide = true;
                                // fix position
                                y = tarY - NumBallHeight;
                                // modify moveDirection, moveSpeed
                                var tarSpd = tarSprite.moveSpeed;

                                if (tarRad > 0) { // same direction
                                    if (spd > 1) {
                                        rad *= -1;
                                        spd *= ratio;
                                    } else {
                                        tarSprite.moveSpeed = spd * ratio;
                                        spd = tarSpd * ratio;
                                    }
                                } else {
                                    rad *= -1;
                                    tarSprite.moveDirection *= -1
                                    spd = tarSpd * ratio;
                                    tarSprite.moveSpeed = spd * ratio;
                                }
                            }
                        }
                    }
                }
                
                // update sprite
                sprite.y = y;
                //sprite.moveSpeed = spd;
                //sprite.moveDirection = rad;
                sprite.setMove(spd, rad);

                if (spd > 1) {
                    sprite.rotateZ += spd * this.ratateRate;
                } else if (isColide && spd < 1) {
                    var callback = this.callback;

                    if (callback) { // this ball is the last one
                        this.callback = void 0;
                        callback();
                    }
                }
            }.bind(this));
        },

        build: function() {

            var ratio = 0.35; // speed reduction multiplier when collided
            var sprite = this.sprite;
            var hellY = Stage.height;
            var me = this;
            
            // install packs
            Spritepack_move_elevation.install(sprite);

            sprite.addUpdate({

                fn: function(progress, stage) {

                    if (!sprite.toDisplay || !sprite.toMove) {
                        return;
                    }
                    
                    var y = sprite.y;
                    var spdY = sprite.moveSpeedY;
                    var isDrop = spdY > 0;

                    spdY = Math.abs(spdY);
    
                    // check if drop to the hell(ball is invisible)
                    if (y > hellY) {
                        me.restore();
                        return;
                    }
    
                    // collision tests
                    var bottom = y + sprite.height;
                    
                    // collision test with Gates
                    var isCollideGate = false;

                    if (!Gate.isOpen()) {
                        var gate = Gate.get(me.number % 2 ? 1 : 0);
                        var gateY = gate.sprite.y;
                            
                        if (bottom > gateY) { // gate collided
                            isDrop = false;
                            isCollideGate = true;
                            y = gateY - sprite.height - (bottom - gateY);
                            spdY *= ratio;
                        }
                    }

                    // collision test with other balls
                    var x = sprite.x;
                    var isColide = false;

                    if (!isCollideGate && isDrop) {
                        for (var ii = 1, il = ColBall.length; ii < il; ii++) {
                            var tarBall = ColBall[ii];
        
                            if (tarBall !== me && tarBall.isDraw) {
                                var tarSprite = tarBall.sprite;
                                var tarY = tarSprite.y
                                
                                if (tarY > y && tarSprite.x === x) { // check lower and same column balls only
                                    var tarBottom = tarY + tarSprite.height;
        
                                    if (bottom > tarY) { // collided
                                        isColide = true;

                                        var tarSpdY = tarSprite.moveSpeedY;
                                        var isTarDrop = tarSpdY > 0;
                                            tarSpdY = Math.abs(tarSpdY);

                                        isDrop = false;
                                        y = tarY - sprite.height;
                                        spdY *= ratio;
                                        tarSpdY *= ratio;

                                        if (spdY > 1 && tarSpdY > 1) {
                                            tarSprite.setMove(spdY, Math.PI / 2);
                                            spdY = tarSpdY;
                                        } else {
                                            tarSprite.setMove(tarSpdY, Math.PI / 2);
                                        }

                                        break; // one ball only
                                    }
                                }
                            }
                        }
                    }

                    // update props
                    sprite.y = y;
                    sprite.setMove(spdY, (isDrop ? 1 : -1) * Math.PI / 2);

                    if (spdY > 1) {
                        sprite.rotateZ += spdY * me.rotateRate;
                    } else if (isColide && me.isLastDraw) { // last ball is stopped
                        var drawEndCallback = me.drawEndCallback;
    
                        me.isLastDraw = false;
                        This.rotateToFace();
                        This.stopMove();

                        if (drawEndCallback) { // me ball is the last one
                            me.drawEndCallback = void 0;
                            drawEndCallback();
                        }
                    }
                }, order: 1
            }, true); // to sort
        },

        draw: function(position) {
            // position: Bol(true: odd, false: even);
            var sprite = this.sprite;

            this.isDraw = true;
            sprite.x = NumOriginX + (position ? 0 : NumBallWidth + NumContainerMargin);
            sprite.y = NumOriginY - NumBallHeight;
            sprite.setMove(1, Math.PI / 2); // 90deg
            sprite.toDisplay = true;
            DrawnBalls.add(this);
        },

        restore: function() {

            var sprite = this.sprite;

            this.isDraw = false;
            sprite.toDisplay = false;
            sprite.scaleX = sprite.scaleY = sprite.opacity = 1;
            sprite.setMove(0);
            DrawnBalls.remove(this);
        },

        destroy: function() {

            var sprite = this.sprite;
            var v1 = 1.8;
            var v2 = 0.2;
            var step = 0.1;
            var duration = 300;
            var totalDuration = 0;
            var keyframes = [{
                scaleX: v1,
                scaleY: v2,
                duration: 0
            }];

            for (var i = 0; i < i + 1; i++) {
                v1 -= step;
                v2 += step;

                if (i % 2) {
                    keyframes.push({
                        scaleX: v1,
                        scaleY: v2,
                        duration: duration
                    });
                } else {
                    keyframes.push({
                        scaleX: v2,
                        scaleY: v1,
                        duration: duration
                    });
                }

                totalDuration += duration;
                duration *= 0.75;
                
                if (v1 < 1) {
                    keyframes.push({
                        scaleX: 1,
                        scaleY: 1,
                        duration: duration
                    });
                    totalDuration += duration;
                    break;
                }
            }

            sprite.rotateZ = 0;
            sprite.setTransformTo('rotateZ', 360, totalDuration);
            sprite.setKeyframes(keyframes)
            //Stage.setTimeout(this.restore.bind(this), totalDuration);

            //sprite
            //.setTransformTo('scaleX', 2, 250)
            //.setTransformTo('scaleY', 2, 250)
            //.setTransformTo('opacity', 0, 250);
            //Stage.setTimeout(this.restore.bind(this), 250);
        }
    };

    // the method to return
    var This = {

        init: function(stage, number, originX, originY, containerMargin, width, height, image) {

            Stage = stage;
            NumBall = number + 1;
            NumOriginX = originX;
            NumOriginY = originY;
            NumContainerMargin = containerMargin;
            ColBall = new Array(NumBall);
            NumBallWidth = width;
            NumBallHeight = height;
            NumTextSize = NumBallHeight * NumFontRationToHeight;
            ImgBall = image;
        },

        new: function(code) {

            return new BALL(code);
        },

        get: function(code) {

            return ColBall[code];
        },

        draw: function draw_balls_by_code_set(codeSet, drawEndCallback) {

            var isStart = codeSet === 'init';
            
            if (isStart) { // generate a code set includes 1 to 20
                codeSet = [];
                
                for (var ii = 1; ii <= 20; ii++) {
                    codeSet.push(ii);
                }
            }
            
            var codeNum = codeSet.length;
            var isEven = true; // first number is 0
            
            Stage.setInterval(function(times) {

                var index = times - 1;
                var code = codeSet[index];
                var isOdd = !isEven;
                var ball = ColBall[code];

                ball.draw(isOdd);

                if (!isStart) { // to mark card by drawn code
                    Card.draw(code);
                }

                if (index - codeNum === -1) { // last code, end of drawing
                    ball.isLastDraw = true;
                    ball.drawEndCallback = drawEndCallback;

                    return true; // tell stage to remove this interval
                }

                isEven = !isEven;
            }, 250);
        },

        trash: function trash_all_drawn_balls(trashEndCallback) {

            // open the gate
            Gate.open();

            // make drawn balls moving
            for (var ii = 1; ii < NumBall; ii++) {
                var ball = ColBall[ii];

                if (ball.isDraw) {
                    ball.sprite.setMove(0.1, Math.PI / 2);
                }
            }

            // check if all balls are trashed every 500ms
            Stage.setInterval(function check_if_trash_end() {

                if (DrawnBalls.number) { // continue
                    return false;
                }

                // all balls are trashed
                Gate.close();
                trashEndCallback();

                return true; // tell stage this interval is end
            }, 500);
        },

        rotateToFace: function() {

            for (var ii = 1; ii < NumBall; ii++) {
                var ball = ColBall[ii];
                
                if (ball.isDraw) {
                    var sprite = ball.sprite;
                    var curRotateZ = sprite.rotateZ;
                    var tarRotateZ = 0;
                    var remainder = curRotateZ % 360;

                    if (remainder > 0) {
                        if (remainder < 180) {
                            tarRotateZ = curRotateZ - remainder;
                        } else {
                            tarRotateZ = curRotateZ + 360 - remainder;
                        }
                    } else {
                        if (remainder > -180) {
                            tarRotateZ = curRotateZ - remainder;
                        } else {
                            tarRotateZ = curRotateZ + -360 - remainder;
                        }
                    }
                    
                    sprite.setTransformTo('rotateZ', tarRotateZ, 150);
                }
            }
        },

        stopMove: function() {

            for (var ii = 1; ii < NumBall; ii++) {
                var ball = ColBall[ii];

                if (ball.isDraw) {
                    ball.sprite.setMove(0, Math.PI / 2);
                }
            }
        }
    };

    module.exports = This;
}());