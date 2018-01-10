var Card = (function() {
    
    const Sprite = require('./sprite.js');
    //const Doms = require('./doms.js');
    var Doms;

    var Stage;
    var NumCardNum = 0;
    var ColCodes = [];
    var NumOriginX = 0;
    var NumOriginY = 0;
    var NumMaxMark = 10;
    var ColCard;
    var ColTextColor = ['black', 'red', 'black', 'yellow']; // according to state code
    var NumCardWidth = 0;
    var NumCardHeight = 0;
    var NumFontRationToHeight = 40 / 80;
    var NumTextSize = 0;
    var ImgCard;
    var ImgCard2;
    var ImgCard3;
    var ImgBlur0;
    var ImgBlur1;
    var ImgBlur2;
    var ImgBlur3;
    var ColMarkedCode;
    var BolIsLocked = false;
    var MarkedCards = {

        cards: [],

        toggleMark: function(card) {

            var markedCards = this.cards;
            var index = markedCards.indexOf(card);

            if (index === -1) { // to mark
                if (markedCards.length === NumMaxMark) {
                    console.log('You can mark 10 cards only!');
                    return;
                }
    
                markedCards.push(card);
                card.setView(1);
            } else { // to clear
                markedCards.splice(index, 1);
                card.setView(0);
            }

            //require('./doms.js').setValue('picks', markedCards.length);
            Doms.setValue('picks', markedCards.length);
        },

        clear: function() {

            this.cards = [];
            //require('./doms.js').setValue('picks', 0);
            Doms.setValue('picks', 0);
        }
    };

    function CARD(code) {

        var orderX = code % 10 - 1;

        if (orderX < 0) { // 10x
            orderX = 9;
        }

        var orderY = code / 10 >> 0;

        if (orderX === 9) { // 10x
            orderY -= 1;
        }

        var x = NumOriginX + orderX * NumCardWidth;
        var y = NumOriginY + orderY * NumCardHeight;

        var sprite = new Sprite({
            zIndex: 0,
            x: x,
            y: y,
            width: NumCardWidth,
            height: NumCardHeight,
            color: 'lime'
        })
        //.setImage({
        //    value: ImgCard,
        //    toFit: false,
        //    width: NumCardWidth,
        //    height: NumCardHeight * 4,
        //    corpY: 0,
        //    corpHeight: NumCardHeight
        //})
        //.setText({
        //    value: code,
        //    color: 'black',
        //    size: NumTextSize,
        //    //font: 'Levi_Adobe_Dia',
        //    font: 'novem',
        //    left: 'center',
        //    top: 'center'
        //});
        var bg = new Sprite({
            zIndex: 1,
            x: x,
            y: y,
            width: NumCardWidth,
            height: NumCardHeight
        })
        .setColor(0, 255, 0);
        this.bg = bg;

        var blur = new Sprite({
            zIndex: 3,
            x: x - (168 - NumCardWidth) / 2,
            y: y - (173 - NumCardHeight) / 2,
            width: 168,
            height: 173,
            opacity: 0.15
        })
        .setImage({
            value: ImgBlur0,
            //toFit: true,
            width: 168,
            height: 173,
            //corpY: 0,
            //corpHeight: NumCardHeight
        });
        this.blur = blur;

        var mask = new Sprite({
            zIndex: 2,
            x: x,
            y: y,
            width: NumCardWidth,
            height: NumCardHeight
        })
        .setColor(0, 255, 0)
        .setImage({
            value: ImgCard2,
            toFit: true,
            width: NumCardWidth,
            height: NumCardHeight
        })
        .setText({
            value: code,
            color: 'black',
            size: NumTextSize,
            //font: 'Levi_Adobe_Dia',
            font: 'novem',
            left: 'center',
            top: 'center'
        })
        .on('click', 'toggleMark', function() {

            if (BolIsLocked) {
                return;
            }
            console.log('click on card', this.code);
            MarkedCards.toggleMark(this);
        }.bind(this));
        this.mask = mask;
        
        this.code = code;
        this.sprite = sprite;
        this.state = 0; // 0: none(green), 1: marked(yellow), 2: drawn(fuchsia), 3: hit, marked && drawn(red)

        ColCard[code] = this;
    }
    CARD.prototype = {
        constructor: CARD,

        textColors: ['black', 'red', 'black', 'yellow'],

        setView: function(state) {
            // state: Num;
            var sprite = this.sprite;

            this.state = state;
            //sprite.image.corpY = state * NumCardHeight;
            this.mask.setText({
                color: this.textColors[state]
            });

            if (state === 3) { // hit
                this.startBlink();
            } else {
                if (this.onBlink) {
                    this.stopBlink();
                }
            }

            var r, g, b;
            var image;

            if (state === 0) {
                r = 0;
                g = 255;
                b = 0;
                image = ImgBlur0;
            } else if (state === 1) {
                r = 255;
                g = 255;
                b = 0;
                image = ImgBlur1;
            } else if (state === 2) {
                r = 255;
                g = 0;
                b = 255;
                image = ImgBlur2;
            } else if (state === 3) {
                image = ImgBlur3;
                r = 255;
                g = 0;
                b = 0;
            }

            //this.bg
            this.mask
            .setTransformTo('r', r, 500)
            .setTransformTo('g', g, 500)
            .setTransformTo('b', b, 500);

            this.blur.setImage({
                value: image
            });

            if (this.blurKeyframes) {
                this.blurKeyframes.clear();
                this.blur
                .setTransformTo('scaleX', 1, 250)
                .setTransformTo('scaleY', 1, 250)
                .setTransformTo('opacity', 0.15, 250);
            }

            if (state) {
                var hitAdding = state === 3 ? 4 : 0;

                this.sprite.zIndex = 4 + hitAdding;
                this.bg.zIndex = 5 + hitAdding;
                this.mask.zIndex = 6 + hitAdding;
                this.blur.zIndex = 7 + hitAdding;

                var blur = this.blur;

                //Stage.setInterval(function(times) {

                    this.blurKeyframes = blur.setKeyframes([
                        {
                            scaleX: 1.2,
                            scaleY: 1.2,
                            opacity: 0.5,
                            duration: 500
                        },
                        {
                            scaleX: 1,
                            scaleY: 1,
                            opacity: 0.15,
                            duration: 500
                        }
                    ], true);

                    //if (times === 5) {
                    //    return true;
                    //}
                //}, 1000);
            } else {
                this.sprite.zIndex = 0;
                this.bg.zIndex = 1;
                this.mask.zIndex = 2;
                this.blur.zIndex = 3;
            }
        },

        startBlink2: function() {

            var sprite = this.sprite;
            var isBig = true;

            sprite.zIndex = 1;
            this.onBlink = Stage.setInterval(function() {

                var scaleValue = isBig ? 1.25 : 1;
                var opacityValue = isBig ? 1 : 0.5;

                sprite
                .setTransformTo('scaleX', scaleValue, 250)
                .setTransformTo('scaleY', scaleValue, 250)
                .setTransformTo('opacity', opacityValue, 250);
                isBig = !isBig;
            }, 250);
        },

        stopBlink2: function() {

            var onBlink = this.onBlink;

            if (onBlink) {
                var sprite = this.sprite;
                
                onBlink.toRemove = true;

                sprite
                .clearDelta('scaleX')
                .clearDelta('scaleY')
                .clearDelta('opacity');

                sprite.zIndex = 0;
                sprite.scaleX = 1;
                sprite.scaleY = 1;
                sprite.opacity = 1;
            }
        },

        startBlink: function() {

            var keyframes = [
                {
                    scaleX: 1.25,
                    scaleY: 1.25,
                    //opacity: 1,
                    duration: 250
                },
                
                {
                    scaleX: 1,
                    scaleY: 1,
                    //opacity: 0.5,
                    duration: 250
                }
            ];

            this.onBlink = true;
            this.onBlink_bg = this.bg.setKeyframes(keyframes, true);
            this.onBlink_blur = this.blur.setKeyframes(keyframes, true);
            this.onBlink_mask = this.mask.setKeyframes(keyframes, true);
        },

        stopBlink: function() {

            this.onBlink = false;
            this.onBlink_bg.clear();
            this.onBlink_blur.clear();
            this.onBlink_mask.clear();

            this.bg
            .setTransformTo('scaleX', 1, 500)
            .setTransformTo('scaleY', 1, 500)
            //.setTransformTo('opacity', 1, 500);
            this.blur
            .setTransformTo('scaleX', 1, 500)
            .setTransformTo('scaleY', 1, 500)
            //.setTransformTo('opacity', 1, 500);
            this.mask
            .setTransformTo('scaleX', 1, 500)
            .setTransformTo('scaleY', 1, 500)
            //.setTransformTo('opacity', 1, 500);
        }
    };

    // the method to return
    var This = {

        init: function(stage, number, originX, originY, width, height, image, image2, image3, imageBlur0, imageBlur1, imageBlur2, imageBlur3) {

            let images = require('./load_images.js').images;
            console.log(images);
            Doms = require('./doms.js');

            Stage = stage;
            NumCardNum = number;
            NumOriginX = originX;
            NumOriginY = originY;
            ColCard = new Array(NumCardNum + 1);
            NumCardWidth = width;
            NumCardHeight = height;
            NumTextSize = NumCardHeight * NumFontRationToHeight;
            ImgCard = images.card;
            ImgCard2 = images.card_mask;
            ImgCard3 = images.card_blur;
            ImgBlur0 = images.card_blur0;
            ImgBlur1 = images.card_blur1;
            ImgBlur2 = images.card_blur2;
            ImgBlur3 = images.card_blur3;

            for (var ii = 1; ii <= NumCardNum; ii++) {
                ColCodes.push(ii);
            }
        },

        new: function(number) {

            return new CARD(number);
        },

        get: function(number) {

            return ColCard[number];
        },

        setState: function(code) {
            // code: Num(0: none, 1: marked, 2: drawn, 3: hit, marked && drawn);
            for (var i = 0; i < NumCard; i++) {
                ColCard[i + 1].setState(code);
            }
        },

        getMarkedCodes: function() {

            var cards = MarkedCards.cards;
            var cardNum = cards.length;

            if (!cardNum) {
                return false;
            }

            var set = [];

            for (var ii = 0; ii < cardNum; ii++) {
               set.push(cards[ii].code); 
            }

            set.sort(function(a, b) { return a - b; });

            return set;
        },

        lock: function() {

            ColMarkedCode = this.getMarkedCodes();
            BolIsLocked = true;
        },

        draw: function(code) {

            var state = 2; // drawn
            var card = ColCard[code];

            //if (ColMarkedCode.indexOf(code) !== -1) {
            if (MarkedCards.cards.indexOf(card) !== -1) {
                state = 3; // hit
            }

            card.setView(state);
        },

        clear: function() {

            MarkedCards.clear();

            for (var ii = 1, il = NumCardNum + 1; ii < il; ii++) {
                var card = ColCard[ii];

                if (card.state !== 0) {
                    card.setView(0);
                }
            }
            BolIsLocked = false;
        },

        quickPick: function(callback) {

            var codes = ColCodes.slice();
            var delay = 0;

            this.clear();

            for (var ii = 0; ii < NumMaxMark; ii++) {
                (function() {

                    var index = Math.floor(Math.random() * codes.length);
                    var code = codes.splice(index, 1)[0];
                    var isLast = ii === NumMaxMark - 1;
                    
                    Stage.setTimeout(function() {
                        
                        MarkedCards.toggleMark(ColCard[code]);
                        
                        if (callback && isLast) {
                            callback();
                        }
                    }, delay += 100);
                }());
            }
        },

        initAnime: function() {

            var delay = 0;
            var state = 1;

            for (var ii = 1; ii < NumCardNum + 1; ii++) {
                (function() {
                    var index = ii;
                    var ownState = state++;

                    if (state === 3) {
                        state = 1;
                    }

                    Stage.setTimeout(function() {

                        ColCard[index].setView(ownState);
                        
                        Stage.setTimeout(function() {

                            ColCard[index].setView(0);
                        }, 2000);
                    }, delay += 50);
                }());
            }
        }
    };

    module.exports = This;
}());