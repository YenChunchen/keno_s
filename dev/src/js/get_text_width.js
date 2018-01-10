(function() {

    var SizeMeter = document.createElement('canvas');
        SizeMeter.setAttribute('id', 'SizeMeter');
        SizeMeter.style.cssText =
            'position: absolute;' +
            'width: 0; height: 0;';
    var Ctx = SizeMeter.getContext('2d');
    var Mount = function() {

        document.body.appendChild(SizeMeter);
        window.removeEventListener('load', Mount);
        console.log('SizeMeter is ready');
    };

    if (document.body) {
        Mount();
    } else {
        window.addEventListener('load', Mount);
    }

    var GetTextWidth = function(value, size, font) {

        Ctx.font = (size || 12) + 'px ' + (font || 'arial');

        return Ctx.measureText(value).width;
    };

    if (module) {
        module.exports = GetTextWidth;
    } else {
        window.GetTextWidth = GetTextWidth;
    }
}());