const Stylesheet = require('./css/style.scss');
const FontFaceObserver = require('fontfaceobserver');
const DOM = require('./js/dom.js');
const Doms = require('./js/doms.js');
const Sprite = require('./js/sprite.js');
const Card = require('./js/card.js');
const Ball = require('./js/ball.js');
const Gate = require('./js/gate.js');

// loading fonts
var ts = performance.now();
Promise.all([
    'novem',
    'Levi_Adobe_Dia'
].map(function(el, index, arr) {
    
    console.log(`Loading font ${el}`);
    return new FontFaceObserver(el).load();
})).then(function fonts_are_ready() {

    console.log('Fonts are ready time elapsed:', performance.now() - ts);

    // loading images
    require('./js/load_images.js').load(function images_are_ready(images) {

        console.log('Images are ready');

        var stage = new (require('./js/stage.js'))(1020, 1080, {
            speed: 1
        });
        //stage.color = 'rgba(0, 0, 0, 0.25)';
        var view = stage.view;
            view.classList.add('canvasHolder');
        // fullscreen requestor
        var fScreenRequestor = new DOM('div', { class: [],
            style: {
                'zIndex': 10000,
                position: 'absolute',
                top: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                fontSize: '5vh',
                textAlign: 'center',
                color: '#EEEEEE'
            },
            text: 'TAP TO CONTINUE'
        }).on('click', function request_fullscreen() {

            //holder.entity.webkitRequestFullscreen();
            Doms.enterFullscreen();
            stage.start();
        });
        document.body.appendChild(fScreenRequestor.entity);
        
        // socket.io
        var socket = require('socket.io-client')();

        socket.on('connect', function() {

            console.log('Socket connection is ready');

            let cashAmount = 0;
            
            socket.emit('username', document.body.getAttribute('username'));
            socket.on('message', function(msg) {
        
                console.log('%c [ SERVER ] %c %s', 'background-color: black; color: lime;', '',  msg);
            });
            socket.on('cash', function(amount) { // 開分 洗分

                cashAmount += amount;
                //Doms.addValue('cash', cashAmount);
                Doms.setValue('cash', cashAmount);
                console.log('Cash amount is changed to ' + cashAmount);
            });
            socket.on('firstDraw', function(codes) {
        
                console.log('First draw, codes:', codes)
                // trash old balls
                Ball.trash(function trash_end() {

                    //Card.generateMarkedCodes();
                    Doms.switchMsg('msgGoodLuck');
                    // draw
                    Ball.draw(codes, function first_draw_end() {
                        
                        // show bet option
                        Doms.switchMsg('msgOption');
                        Doms.unlockButton(['keepBet', 'raiseBet']);
                    });
                });
            });
            socket.on('secondDraw', function(codes) {
        
                console.log('Second draw, codes:', codes)
                Doms.switchMsg('msgGoodLuck');
                Ball.draw(codes, function second_draw_end() {

                    //Ball.stopMove();
                    socket.emit('getResult');
                });
            });
            socket.on('result', (function() {

                var reset = function rest_game_environment() {

                    isRaiseEnd = true;
                    Card.clear();
                    Doms.setValue('raise', '');
                    Doms.setValue('wins', 0);
                    Doms.unlockButton(['exit', 'wipeCard', 'quickPick', 'betUp', 'betDown', 'playGame']);
                    Doms.switchMsg('msgPlayGame');
                };
                var isRaiseEnd = false;
                
                return function when_socket_catch_result_event(amount) {
        
                    console.log('The game result is', amount);
                    var showTime = 5000; // the time of showing result to user
                    var delayTimeWhen = 2000;
                    var showTime_win = showTime + delayTimeWhen;
                    var launchTime = Date.now();

                    cashAmount += amount
                    
                    if (amount) { // win
                        isRaiseEnd = false;
                        Doms.switchMsg('msgWinner');
                        Doms.setValue('winnerAmount', amount);
                        Doms.addValue('cash', amount, true); // raise value point by point
                        Doms.addValue('wins', amount, true, function when_raise_end() {

                            var elapsed = Date.now() - launchTime;
                            var delay = delayTimeWhen;

                            if (elapsed > showTime_win) {
                                
                            } else {
                                delay = Math.max(delay, showTime_win - elapsed);
                            }

                            stage.setTimeout(reset, delay);
                        });

                        var isBig = true;

                        winBlinker.toDisplay = true;
                        stage.setInterval(function() {

                            var opacityValue = isBig ? 0.75 : 0.25;

                            winBlinker
                            .setTransformTo('opacity', opacityValue, 250);

                            if (isRaiseEnd) {
                                winBlinker.opacity = 0;
                                winBlinker.toDisplay = false;
                                return true; // tell stage this interval is end
                            }

                            isBig = !isBig;
                        }, 250);
                    } else { // lose
                        stage.setTimeout(reset, showTime);
                    }
                };
            }()));

            // launch stage
            //stage
            //.start();

            // enable eyeless-stop to avoid frame skipping
            stage.enableEyelessStop();
            
            // init
            Doms.openCloth();
            Doms.switchMsg('msgPlayGame');
            Card.initAnime();
            Ball.draw('init', function drawEnd() {

                console.log('You can play now!');
                Doms.unlockButton(['exit', 'wipeCard', 'quickPick', 'betUp', 'betDown', 'playGame']);
                Doms.removeCloth();
            });
        });
        socket.on('disconnect', function() {

            console.log('disconnected');
            location.reload();
        });

        Doms.init(stage, socket, view);

        // generate sprites, the ordering is important, Gate -> Ball -> Card
        Gate.init(
            stage,
            790, 970, // origin position
            10, // margin between gates
            110, 30, // size
            15, // anchor position
            images.gate_left, // image
            images.gate_right
        );

        Ball.init(
            stage,
            80, // total number
            810, 0, // origin position
            10, // margin between containers
            90, 90, // size
            images.ball // image
        );
        for (var i = 0; i < 80; i++) {
            stage.addSprite(Ball.new(i + 1, stage).sprite);
        }

        Card.init(
            stage,
            80, // total number
            35, 155, // origin position
            75, 80, // size
            images.card, // image
            images.card_mask,
            images.card_blur,
            images.card_blur0,
            images.card_blur1,
            images.card_blur2,
            images.card_blur3
        );
        for (var i = 0; i < 80; i++) {
            var card = Card.new(i + 1);

            //stage.addSprite(card.sprite);
            //stage.addSprite(card.bg);
            stage.addSprite(card.blur);
            stage.addSprite(card.mask);
        }

        // stage winBlinker
        var winBlinker = new Sprite({
            zIndex: -1,
            y: 120,
            width: 820,
            height: 880,
            color: 'red',
            toDisplay: false
        });
        stage.addSprite(winBlinker);

        //Doms.init(stage, socket, view);
    });
});

var autoPlay = {

    timer: void 0,
    
    start: function(speed) {

        stage.speed = speed;

        var btn_playGame = document.querySelector('.btnPlayGame');
        var btn_keepBet = document.querySelector('.msgOption > *:first-child');
        var playTimes = 0;
        var play = function() {

            if (!btn_playGame.classList.contains('locked')) {
                console.log(++playTimes);
                btn_playGame.click();
            } else {
                btn_keepBet.click();
            }
        };
        console.log('auto-playing start, speed: ', speed);
        this.timer = stage.setInterval(play, 1000);
    },

    stop: function() {

        console.log('auto-playing stop');
        this.timer.toRemove = true;
    }
};