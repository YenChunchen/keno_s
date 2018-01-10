function loadImage(callback) {

    require('./image_loader.js')
    .setFolderPath('./image/')
    .load('ball.png', null, 'ball')
    .load('btn_card.png', null, 'card')
    .load('btn_card_mask.png', null, 'card_mask')
    .load('btn_card_blur.png', null, 'card_blur')
    .load('card_blur0.png', null, 'card_blur0')
    .load('card_blur1.png', null, 'card_blur1')
    .load('card_blur2.png', null, 'card_blur2')
    .load('card_blur3.png', null, 'card_blur3')
    .load('gate_left.png', null, 'gate_left')
    .load('gate_right.png', null, 'gate_right')
    .addAllReadyToDo(function(images) {
        
        method.images = images;
        callback(images);
    });
}

const method = {
    
    load: loadImage,
    images: void 0
};

module.exports = method;