if (!Date.now) {
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now#Compatibility
	Date.now = function now() {
		return +(new Date);
	};
}

/* scorebox object */
function Scorebox(parentnode) {
	this.parentnode = parentnode;

	this._actualScore = 0;

	// create scorebox and its components
	var node = $("<div />");
	node.attr('id', 'scorebox');

	this.parentnode.append(node);
	this.node = node;

	// controls
	var controls = $("<div />");
	controls.attr('id', 'controls');

	this.node.append(controls);
	this.controls = controls;

	// control - buttons
	var newGame = $("<a />");
	newGame.attr('href', '#');
	newGame.attr('id', 'btnNewGame');
	newGame.html("New Game");
	newGame.on('click', function() {game.start();});

	controls.append(newGame);
	this.btnNewGame = newGame;

	var help = $("<a />");
	help.attr('href', '#');
	help.attr('id', 'btnHelp');
	help.html("Help!");

	controls.append(help);
	this.btnHelp = help;

	// timer
	var timer = $("<div />");
	timer.attr('id', 'timercontainer');
	timer.append('<h1>Time Left</h1>');

	this.node.append(timer);
	this.timer = timer;

	var curTime = $("<div id='timer' />");
	curTime.html('0:00');

	this.timer.append(curTime);
	this.curTime = curTime;

	// score
	var score = $("<div />");
	score.attr('id', 'scorecontainer');
	score.append('<h1>Current Score</h1>');

	this.node.append(score);
	this.score = score;

	var curScore = $("<div id='score' />");
	curScore.html(this._actualScore);

	this.score.append(curScore);
	this.curScore = curScore;
}

/**
 * Add appropriate # of points for completing 1 pairing, and update display
 */
Scorebox.method('add', function() {
	this._actualScore = this._actualScore + 20;
	this.update();
});

Scorebox.method('getscore', function() {
	return this._actualScore;
});

Scorebox.method('reset', function() {
	this._actualScore = 0;
	this.update();
});

Scorebox.method('update', function() {
	this.curScore.html(this._actualScore);
});