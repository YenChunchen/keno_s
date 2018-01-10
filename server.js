//let NODE_ENV = process.env.NODE_ENV; console.log(`dev: ${NODE_ENV.develop}`);
let NODE_ENV = { develop: true }; console.log(`develop mode: ${NODE_ENV.develop}`);
let port = 3000;
let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.use(express.static(path.resolve(__dirname, NODE_ENV.develop ? './dev/src' : './dist/client/src')));
console.log(`static asset path: ${path.resolve(__dirname, NODE_ENV.develop ? './dev/src' : './dist/client/src')}`);
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, NODE_ENV.develop ? './dev/views' : './dist/views'));

// route
app.get('/', function (req, res) {

	res.render('index');
});
app.get('/view', function (req, res) {

	res.render('view');
});
app.get('/mobile', function (req, res) {

	res.render('mobile');
});

// io part
(function () {

	const removeRdEl = function remove_random_element_from_array(arr) { // this function will modify the origin Array
		// arr: Arr; el: random element removed from arr
		let r = Math.random() * arr.length >> 0;

		return arr.splice(r, 1)[0];
	};
	const getUserData = function get_user_data_from_server(socket) {

		// 驗證

		return {
			id: 'user123',
			cash: 100
		};
	}
	const drawRdCodes = function draw_number_random_element_from_codes (codes, number) {

		let set = [];

		for (let ii = 0; ii < number; ii++) {
			set.push(removeRdEl(codes));
		}

		return set;
	};
	const evalCashWin = function compute_the_cashWin_amount(hitNum, markNum, betAmount) {

		return hitNum * betAmount;
	};
	const emitMsg = function emit_message_to_target_socket(socket, msg) {
		
		socket.emit('message', msg);
	};
	const maxMarkNum = 10;
	const allCodes = (function() {
		
		let codes = [];

		for (let ii = 1; ii <= 80; ii++) {
			codes.push(ii);
		}

		return codes;
	}());

	// when connected
	io.on('connection', function(socket) {

		let clientIp = socket.request.connection.remoteAddress;

		console.log(`使用者 IP: ${clientIp}`);

		let user = getUserData(socket);
		let userId = user.id;
		let cashAmount = user.cash;
		let cashAmount_temp = cashAmount;
		let step = 0; // 0: undraw, 1: 1st draw is done, 2: 2nd draw is done
		let cashWin = 0;
		let cashWin_temp = 0;
		let leftCodes, markedCodes, betAmount, drawCodes, firstDraw, secondDraw, hits;

		socket.emit('cash', cashAmount);
		// register events
		socket.on('firstDraw', (codes, firstBet) => {
			// codes: Arr, firstBet: Num;
			// check step
			if (step !== 0) {
				emitMsg(socket, `first draw is over`);
				return;
			}

			// check number of codes
			let codeNum = codes.length

			if (codeNum > maxMarkNum) {
				emitMsg(socket, `Marked number is exceed ${maxMarkNum}`);
				return;
			}

			// check duplication and recoding markedCodes
			markedCodes = [];

			for (let ii = 0; ii < codeNum; ii++) {
				let code = codes[ii];

				if (markedCodes.indexOf(code) === -1) {
					markedCodes.push(code);
				} else {
					emitMsg(socket, `Duplicate code detected, code ${code}`);
					return;
				}
			}

			// check betAmount
			if (firstBet <= 0) {
				emitMsg(socket, `Bet amount is not legal`);
				return;
			}

			//check cashAmount
			if (firstBet > cashAmount) {
				emitMsg(socket, `Cash is not enough`);
				return;
			}

			// bet is accepted
			step = 1;
			betAmount = firstBet;
			cashAmount_temp = cashAmount - betAmount;
			leftCodes = allCodes.slice(); // duplicate a new full-codes set
			drawCodes = [];

			// draw first 10 balls from leftCodes
			firstDraw = drawRdCodes(leftCodes, 10);

			for (let ii = 0; ii < 10; ii++) {
				drawCodes.push(firstDraw[ii]);
			}

			// draw last 10 balls from leftCodes
			secondDraw = drawRdCodes(leftCodes, 10);

			for (let ii = 0; ii < 10; ii++) {
				drawCodes.push(secondDraw[ii]);
			}

			// check hits
			hits = 0;

			for (let ii = 0, il = markedCodes.length; ii < il; ii++) {
				let markedCode = markedCodes[ii];

				if (drawCodes.indexOf(markedCode) !== -1) {
					hits++;
				}
			}

			// generate cashWin_temp
			cashWin_temp = evalCashWin(hits, markedCodes.length, betAmount);

			// emit cash reduction to socket
			socket.emit('cash', -firstBet);

			// emit first draw to socket
			emitMsg(socket, `First bet: ${betAmount}, marked cards: [${markedCodes.join()}]`);
			socket.emit('firstDraw', firstDraw);
			console.log(`第一次壓注成功，押注: ${firstBet}, 總壓注: ${betAmount}`);
			console.log(`壓注號碼: ${markedCodes}`);
			console.log(`抽出號碼 - 1: ${firstDraw}`);
			console.log(`抽出號碼 - 2: ${secondDraw}`);
			console.log(`中獎數量: ${hits}`);
		});
		socket.on('secondDraw', (secondBet) => {

			// check step
			if (step !== 1) {
				emitMsg(socket, `Wrong step`);
				return;
			}

			// secondBet should:
			{
				// positive or 0
				if (secondBet < 0) {
					emitMsg(socket, `Bet amount is illegal`);
					return;
				}

				// enough cash
				if (cashAmount_temp < secondBet) {
					emitMsg(socket, `Cash is not enough`);
					return;
				}

				// double or all-in
				if (secondBet === betAmount * 2 || secondBet === cashAmount_temp) {
					emitMsg(socket, `Bet amount is illegal`);
					return;
				}
			}

			// second draw is accepted
			step = 2;
			betAmount += secondBet;
			cashAmount_temp = cashAmount - betAmount;

			// update cashWin_temp
			cashWin_temp = evalCashWin(hits, markedCodes.length, betAmount);

			// emit cash reduction to socket
			socket.emit('cash', -secondBet);

			// emit second draw to socket
			emitMsg(socket, `Second bet: ${secondBet}, total bet: ${betAmount}`);
			socket.emit('secondDraw', secondDraw);
			console.log(`第二次壓注成功，押注: ${secondBet}, 總壓注: ${betAmount}`);
		});
		socket.on('getResult', () => {

			// check step
			if (step !== 2) {
				emitMsg(socket, `Wrong step`);
				return;
			}

			// generate the result
			cashWin_temp = 0;
			cashWin = evalCashWin(hits, markedCodes.length, betAmount);

			// update state
			cashAmount = cashAmount_temp;
			cashAmount += cashWin;

			// emit result to socket
			emitMsg(socket, `cash: ${cashAmount}`);
			socket.emit('result', cashWin);

			// restore state
			step = 0;
			cashAmount_temp = 0;
			cashWin = 0;
			cashWin_temp = 0;
		});
		socket.on('disconnect', (reason) => {

			if (step !== 0) { // accidentally disconnected

			} else { // leave

			}
		});
	});
}());

http.listen(port, function () {

	console.log(`app now listening on port ${port}`);
});