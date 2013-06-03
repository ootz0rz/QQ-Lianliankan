if (!Date.now) {
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now#Compatibility
	Date.now = function now() {
		return +(new Date);
	};
}

/* scorebox object */
function Scorebox(parentnode, max_time, helps, extend_by) {
	var $this = this;

	this.parentnode = parentnode;

	this._defaultMaxTime = max_time == null ? 90 : max_time;
	this._defaultHelpsLeft = helps == null ? 3 : helps;
	this._defaultExtendTimeBy = extend_by == null ? 15 : extend_by;

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
		$this.reset();
		game.reset();
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
	this.sb_extend = $('<a href="#" id="sb_extend"> [+]</a>');

	$("h1", this.timer).append(this.sb_extend);
	this.sb_extend.on('click', function() {
		$this.addtotimer();
	})

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

	this.sb_hint = $('<a href="#" id="sb_help"> [?]</a>');

	$("h1", this.score).append(this.sb_hint);
	this.sb_hint.on('click', function() {
		game.give_hint();
	})

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

/**
 * Add given number to the score
 */
Scorebox.method('add_to_score', function(val) {
	this._actualScore = this._actualScore + val;
	this.updateScore();
});

Scorebox.method('getscore', function() {
	return this._actualScore;
});

Scorebox.method('reset', function(maxtime) {
	this._actualScore = 0;
	this._maxTime = maxtime == null ? this._defaultMaxTime : maxtime; // in seconds
	this._timeHelpsLeft = this._defaultHelpsLeft; // how many times you can extend the time
	this._extendTimeBy = this._defaultExtendTimeBy; // in seconds
	this._currentTime = this._maxTime;

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
    clearInterval(this.txtTimer['timeout']);
});

var padZeroes = function(n) {
    return n < 10 ? '0' + n : n
} 

var scorebox_getTimerString = function(start, now, curtime, max, scorebox) {
	if ( !scorebox.txtTimer['dotimer'] ) {
		return;
	}

    if ( now == null ) {
        now = Date.now();
    }

    scorebox.sb_extend.html("&nbsp;[" + (scorebox._timeHelpsLeft > 0 ? "+" + scorebox._timeHelpsLeft : "---") + "]");
    
    var elapsed = (curtime * 1000) - (now - start);
    
    if ( elapsed > 0 ) {
        var eDate = new Date(elapsed);
        var hrs = eDate.getUTCHours();
        return (hrs > 0 ? padZeroes(hrs) + ":" : "") + 
            padZeroes(eDate.getUTCMinutes()) + ":" + 
            padZeroes(eDate.getUTCSeconds());
    } else {
    	console.log("TIME RAN OUT!");
    	scorebox.stoptimer();
    	game.lose();
    }
    
    return "0:00";
};

/**
 * Update the timer.
 **/
var scorebox_updateTimer = function(scorebox) {
    var start = scorebox.txtTimer['start'];
    var now = Date.now();
    
    scorebox.curTime.html(scorebox_getTimerString(start, now, scorebox._currentTime, scorebox._maxTime, scorebox));
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

/**
 * Add extra time on the timer if possible
 */
Scorebox.method('addtotimer', function() {
	if ( this._timeHelpsLeft > 0 ) {
		this.extendtime(this._extendTimeBy);
		this._timeHelpsLeft = this._timeHelpsLeft - 1;
	}
});

/**
 * Extend time by given amount
 */
Scorebox.method('extendtime', function(amt) {
	this._currentTime = this._currentTime + amt;
});