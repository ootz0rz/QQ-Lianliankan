if (!Date.now) {
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now#Compatibility
	Date.now = function now() {
		return +(new Date);
	};
}

/* scorebox object */
function Scorebox(parentnode, max_time, helps, extend_by) {
	this.parentnode = parentnode;

	this._defaultMaxTime = max_time == null ? 360 : max_time;
	this._defaultHelpsLeft = helps == null ? 2 : helps;
	this._defaultExtendTimeBy = extend_by == null ? 60 : extend_by;

	this._actualScore = 0;
	this._maxTime = this._defaultMaxTime; // in seconds
	this._timeHelpsLeft = this._defaultHelpsLeft; // how many times you can extend the time
	this._extendTimeBy = this._defaultExtendTimeBy; // in seconds
	this._currentTime = this._maxTime;

	this.txtTimer = {};

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
	newGame.on('click', function() {
		game.start();
	});

	controls.append(newGame);
	this.btnNewGame = newGame;

	var help = $("<a />");
	help.attr('href', '#');
	help.attr('id', 'btnHelp');
	help.html("Help!");
	help.on('click', function(e) {
		e.preventDefault();
		game.help();
	});

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
Scorebox.method('addScore', function() {
	this._actualScore = this._actualScore + 20;
	this.updateScore();
});

Scorebox.method('getscore', function() {
	return this._actualScore;
});

Scorebox.method('reset', function() {
	this._actualScore = 0;
	this._maxTime = this._defaultMaxTime; // in seconds
	this._timeHelpsLeft = this._defaultHelpsLeft; // how many times you can extend the time
	this._extendTimeBy = this._defaultExtendTimeBy; // in seconds

    this.txtTimer = {};
    this.txtTimer['start'] = Date.now();
    this.txtTimer['dotimer'] = true;

	this.updateScore();
});

Scorebox.method('updateScore', function() {
	this.curScore.html(this._actualScore);
});

/**
 * Stop the timer.
 **/
Scorebox.method('stoptimer', function() {
    this.txtTimer['dotimer'] = false;
    clearTimeout(this.txtTimer['timeout']);
});

var padZeroes = function(n) {
    return n < 10 ? '0' + n : n
} 

var scorebox_getTimerString = function(start, now, curtime) {
    if ( now == null ) {
        now = Date.now();
    }
    
    var elapsed = (curtime * 1000) - (now - start);
    //console.log('elapsed', elapsed, 'curtime', curtime, 'now', now, 'start', start);
    if ( start < now ) {
        var eDate = new Date(elapsed);
        var hrs = eDate.getUTCHours();
        return (hrs > 0 ? padZeroes(hrs) + ":" : "") + 
            padZeroes(eDate.getUTCMinutes()) + ":" + 
            padZeroes(eDate.getUTCSeconds());
    }
    
    return "0:00";
};

/**
 * Update the timer.
 **/
var scorebox_updateTimer = function(scorebox) {
    //console.log('scorebox', scorebox);
    
    var start = scorebox.txtTimer['start'];
    var now = Date.now();
    
    scorebox.curTime.html(scorebox_getTimerString(start, now, scorebox._currentTime));
}

/**
 * Start the timer.
 **/
Scorebox.method('begintimer', function() {
    var $this = this;

    this.txtTimer = {};
    this.txtTimer['start'] = Date.now();
    this.txtTimer['dotimer'] = true;
    
    // update timer
    this.txtTimer['timeout'] = window.setInterval(function() {scorebox_updateTimer($this);}, 200);
});