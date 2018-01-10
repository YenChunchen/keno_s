(function() {

	var globalName = 'ImageLoader';
	var Str_PathToFolder;
	var Col_LoadedImage = {};
	var Num_OnLoadImage = 0;
	var Num_LoadedImage = 0;
	var Fn_AllReadyCallback;
	var Bol_IsAllReady = false;
	var Fn_CheckAllReady = function() {

		if ((Bol_IsAllReady = Num_LoadedImage === Num_OnLoadImage)) {
			Fn_AllReadyCallback(Col_LoadedImage);
		}
	};

	// install size checker
	var Fn_GetSize = (function() {

		var Dom_container = document.createElement('div');

		Dom_container.style.cssText =
			'position: absolute;' +
			'top: -100%;' +
			'left: -100%;' +
			'opacity: 0;';

		window.addEventListener('load', function() {

			document.body.appendChild(Dom_container);
		});

		return function Fn_GetSize(IMAGE) {

			Dom_container.appendChild(IMAGE);

			IMAGE.width = Dom_container.offsetWidth;
			IMAGE.height = Dom_container.offsetHeight;

			Dom_container.removeChild(IMAGE);
		};
	}());

	var Method = {

		loadedImages: Col_LoadedImage,

		isReady: function(NAME) {

			if (NAME) {
				return !!Col_LoadedImage[NAME];
			} else {
				return Bol_IsAllReady;
			}
		},

		addAllReadyToDo: function(CALLBACK) {

			if (!Num_OnLoadImage || Bol_IsAllReady) {
				CALLBACK();
			} else {
				Fn_AllReadyCallback = CALLBACK;
			}

			return this;
		},

		setFolderPath: function(PATH_TO_FOLDER) {

			Str_PathToFolder = PATH_TO_FOLDER;

			return this;
		},

		load: function(PATH_TO_FILE, CALLBACK, NAME) {

			var path;

			if (PATH_TO_FILE.indexOf('/') === -1) {
				path = Str_PathToFolder + PATH_TO_FILE;
			} else {
				path = PATH_TO_FILE;
			}

			//if (BrowserDetect.IE.is9) {
			//	path += '?' + Date.now();
			//}
			console.log('Loading image[ ' + NAME + ' ], path: ' + path);
			Num_OnLoadImage++;

			var img = new Image(); img.src = path;

			img.addEventListener('load', function() {

				if (NAME) {
					Col_LoadedImage[NAME] = this;
				}

				Num_LoadedImage++;

				if (!this.width) { // get the size of image
					Fn_GetSize(this);
				}

				if (CALLBACK) {
					CALLBACK(this);
				}
				
				if (Fn_AllReadyCallback) {
					Fn_CheckAllReady();
				}
			});

			return this;
		}
	};

	if (module) {
		module.exports = Method;
	} else {
		window[globalName] = Method;;
	}
}());

/*ImageLoader
.setFolderPath('./image/')
.load('pan.svg', function(IMG) {

	document.body.appendChild(IMG);
}, 'pan')
.load('wheel.svg', function(IMG) {

	document.body.appendChild(IMG);
}, 'wheel')
.addAllReadyToDo(function() {

	var images = ImageLoader.loadedImages;
	var pan = document.createElement('div');
	var wheel = document.createElement('div');

	pan.style.cssText =
		'position: relative;' +
		'width: 40vh;' +
		'height: 40vh;' +
		'background: url(' + images.pan.src + ') center center / cover no-repeat;';
	wheel.style.cssText =
		'position: relative;' +
		'left: 50%;' +
		'top: 50%;' +
		'width: 62.5%;' +
		'height: 62.5%;' +
		'background: url(' + images.wheel.src + ') center center / cover no-repeat;' +
		'transform: translate3d(-50%, -50%, 0);';

	pan.appendChild(wheel);
	document.body.appendChild(pan);
});*/