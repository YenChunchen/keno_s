const DOM = require('./dom.js');
const Card = require('./card.js');

var Stage;
var cloth;
var btns = {};
var msgs = {};
var nums = {};
var Socket;
var holder;

var build = function(view) {

    holder = new DOM('div', { class: ['holder'],
        style: {
            //width: 1280 + 'px',
            //height: 720 + 'px',
        }
    }).addChild(
        view
    ).addChild(new DOM('div', { class: ['msgHolder'],
            style: {
                
            }
        }).addChild(msgs.msgPlayGame = new DOM('div', { class: ['msg', 'msgPlayGame'],
            style: {
                
            },
            text: 'TOUCH ON 2 TO 10 SPOTS\nAND TOUCH \'PLAY GAME\'!'
        })).addChild(msgs.msgGoodLuck = new DOM('div', { class: ['msg', 'msgGoodLuck'],
            style: {
                
            },
            text: 'GOOD LUCK!'
        })).addChild(msgs.msgOption = new DOM('div', { class: ['msg', 'msgOption']

            }).addChild(btns.keepBet = new DOM('div', { class: ['btn_short'],
                    style: {
                        //display: 'none'
                    },
                    text: 'KEEP BET'
                }, function() {

                    this.on('click', function keep_bet() {

                        if (this.containsClass('locked')) {
                            return;
                        }

                        Doms.lockButton(['keepBet', 'raiseBet']);
                        Socket.emit('secondDraw', 0);
                    })
                })
            ).addChild(new DOM('div', { class: ['msgOptionText'],
                    style: {
                        //display: 'none'
                    },
                    text: 'CHOOSE TO DOUBLE THE BET OR KEEP SAME BET'
                }, function() {
                    

                })
            ).addChild(btns.raiseBet = new DOM('div', { class: ['btn_short'],
                    style: {
                        //display: 'none'
                    },
                    text: 'RAISE BET'
                }, function() {

                    this.on('click', function raise_bet() {

                        if (this.containsClass('locked')) {
                            return;
                        }

                        var cash = nums.cash.value;
                        var bet = nums.bet.value;
                        var raise;

                        if (cash > bet) { // double
                            raise = bet;
                        } else { // all in
                            raise = cash;
                        }

                        nums.cash.setValue(cash - raise);
                        nums.raise.setValue(raise);
                        This.lockButton(['keepBet', 'raiseBet']);
                        Socket.emit('secondDraw', raise);
                    })
                })
            )
        ).addChild(msgs.msgWinner = new DOM('div', { class: ['msg', 'msgWinner'],
                style: {

                }
            }, function() {

                this
                .addChild(new DOM('div', { class: ['msgWinnerTitle'],
                    style: {

                    },
                    text: 'WINNER $'
                }))
                .addChild(nums.winnerAmount = new DOM('input', { class: ['msgWinnerAmount'] }));
            }
        ))
    ).addChild(new DOM('div', { class: ['stateHolder'],
            style: {
                
            }
        }).addChild(new DOM('div', { class: ['stateTitle', 'textCash'],
                style: {
                    
                },
                text: 'CASH'
            }, function() {

                this.addChild(nums.cash = new DOM('input', { class: ['state'], value: 0 }))
            })
        ).addChild(new DOM('div', { class: ['stateTitle', 'textBet'],
                style: {
                    
                },
                text: 'BET'
            }, function() {

                this.addChild(nums.bet = new DOM('input', { class: ['state'], value: 5 }))
            })
        ).addChild(new DOM('div', { class: ['stateTitle', 'textRaise'],
                style: {
                    
                },
                text: 'RAISE'
            }, function() {

                this.addChild(nums.raise = new DOM('input', { class: ['state']}))
            })
        ).addChild(new DOM('div', { class: ['stateTitle', 'textWins'],
                style: {
                    
                },
                text: 'WINS'
            }, function() {

                this.addChild(nums.wins = new DOM('input', { class: ['state'], value: 0 }))
            })
        ).addChild(new DOM('div', { class: ['stateTitle', 'textPicks'],
                style: {
                    
                },
                text: 'PICKS'
            }, function() {

                this.addChild(nums.picks = new DOM('input', { class: ['state'], value: 0 }));
            })
        ).addChild(new DOM('div', { class: ['stateTitle', 'payTableTitle'],
                style: {
                    
                }
            }, function() {

                this
                .addChild(new DOM('div', {
                    text: 'HIT'
                }))
                .addChild(new DOM('div', {
                    text: 'RAISE'
                }))
                .addChild(new DOM('div', {
                    text: 'PAY'
                }));
            })
        ).addChild(btns.help = new DOM('div', { class: ['btn_short', 'btnHelp'],
                style: {
                    
                },
                text: 'HELP'
            }, function() {

                this.on('click', function() {


                });
            })
        ).addChild(btns.exit = new DOM('div', { class: ['btn_short', 'btnExit'],
                style: {
                    
                },
                text: 'EXIT GAME'
            }, function() {

                this.on('click', function() {

                    if (this.containsClass('locked')) {
                        return;
                    }

                    console.log('EXIT GAME');
                });
            })
        ).addChild(btns.wipeCard = new DOM('div', { class: ['btn_short', 'btnWipeCard'],
                style: {
                    
                },
                text: 'WIPE CARD'
            }, function() {

                this.on('click', function() {

                    if (this.containsClass('locked')) {
                        return;
                    }

                    Card.clear();
                });
            })
        ).addChild(btns.quickPick = new DOM('div', { class: ['btn_short', 'btnQuickPick'],
                style: {
                    
                },
                text: 'QUIK PICK'
            }, function() {

                this.on('click', function() {

                    if (this.containsClass('locked')) {
                        return;
                    }

                    Card.quickPick();
                });
            })
        ).addChild(btns.betUp = new DOM('div', { class: ['btn_short', 'btnBetUp'],
                style: {
                    
                },
                text: '\nBET'
            }, function() {

                this.on('click', function raise_bet() {
                    
                    if (this.containsClass('locked')) {
                        return;
                    }

                    var curCash = nums.cash.value;
                    var curBet = nums.bet.value;

                    if (curCash === curBet) { // no more room for bet
                        return;
                    }

                    nums.bet.setValue(nums.bet.value + 5);
                });
            })
        ).addChild(btns.betDown = new DOM('div', { class: ['btn_short', 'btnBetDown'],
                style: {
                    
                },
                text: 'BET\n'
            }, function() {

                this.on('click', function reduce_bet() {
                    
                    if (this.containsClass('locked')) {
                        return;
                    }

                    var curValue = nums.bet.value;

                    if (curValue === 5) {
                        return;
                    }

                    nums.bet.setValue(curValue - 5);
                });
            })
        ).addChild(btns.playGame = new DOM('div', { class: ['btnPlayGame'],
                style: {
                    
                },
                text: 'PLAY GAME'
            }, function() {

                var sendCodes = function(codes) {

                    Socket.emit('firstDraw', codes || Card.getMarkedCodes(), nums.bet.value);
                };

                this.on('click', function play_game() {

                    if (this.containsClass('locked')) {
                        return;
                    }

                    var codes = Card.getMarkedCodes();

                    if (!codes) {
                        Card.quickPick(sendCodes);
                    } else {
                        sendCodes(codes);
                    }
                    
                    // lock buttons
                    This.lockButton(['exit', 'wipeCard', 'quickPick', 'betUp', 'betDown', 'playGame']);

                    // lock cards
                    Card.lock();
                });
            })
        )
    ).addChild(cloth = new DOM('div', { class: ['cloth'] }));
    document.body.appendChild(holder.entity);
};
var switchMsg = function(msgName) {
        
    for (var ii in msgs) {
        msgs[ii].removeClass('show');
    }

    if (msgName) {
        msgs[msgName].addClass('show');
    }
};

var This = {

    init: function(stage, socket, view) {

        Stage = stage;
        Socket = socket;
        build(view);
        this.lockButton(['exit', 'wipeCard', 'quickPick', 'betUp', 'betDown', 'playGame']);
    },

    switchMsg: switchMsg,

    setValue: function(name, value) {
        
        nums[name].setValue(value);
    },

    addValue: function(name, value, step, callback) {
        // name: Str, value: Num, step: Bol(to change value point by point), callback: Fn(callback when step end)
        if (step) {
            var num = nums[name];
            var stepNum = Math.abs(value);
            var curValue = num.value;

            Stage.setInterval(function(times) {

                if (times <= stepNum) {
                    curValue++;
                    num.setValue(curValue);
                } else { // end of value change
                    if (callback) {
                        callback();
                    }

                    return true;
                }
            }, 50);
        } else {
            nums[name].setValue(nums[name].value + value);
        }
    },

    lockButton: function(btnNames) {
        // tbnNames: Arr[Str];
        if (btnNames === 'all') {
            for (var ii in btns) {
                if (ii !== 'help') {
                    btns[ii].addClass('locked');
                }
            }
        } else {
            for (var ii = 0, il = btnNames.length; ii < il; ii++) {
                btns[btnNames[ii]].addClass('locked');
            }
        }
    },

    unlockButton: function(btnNames) {
        // tbnNames: Arr[Str];
        if (btnNames === 'all') {
            for (var ii in btns) {
                if (ii !== 'help') {
                    btns[ii].removeClass('locked');
                }
            }
        } else {
            for (var ii = 0, il = btnNames.length; ii < il; ii++) {
                btns[btnNames[ii]].removeClass('locked');
            }
        }
    },

    openCloth: function() {

        cloth.addClass('hide');
    },

    removeCloth: function() {

        cloth.addClass('remove');
    },

    enterFullscreen: function() {

        holder.entity.webkitRequestFullscreen();
    }
};

module.exports = This;