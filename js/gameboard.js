function GameBoard(parentid, bokeh, rows, cols) {
	this.parentid = parentid;
	this.parentnode = $(parentid);
	this.bokeh = bokeh;

	// set global
	game = this;

	// note that this should always be even numbers
	this.rows = rows;
	this.cols = cols;

	// this too, should always be an even number
	this.start_rows = 6;
	this.start_cols = 6;

	// default sphere/box size
	this.radius = '40px';

	// init the board
	// --------------------------------------

	// array in format
	// arr[xpos][ypos] -> Block()
	this.blocks = {};

	var blockcontainer = $("<div />");
	blockcontainer.attr('id', 'blockcontainer');

	this.blockcontainer = blockcontainer;
	this.parentnode.append(blockcontainer);

	// bottom score/control box
	this.scorebox = new Scorebox(this.parentnode);

	// populate
	this.populate(this.start_cols, this.start_rows, num_block_types);
}

/**
 * Pseudo-randomly populate the game board with specified # cols/rows.
 *
 * Tries to make all the blocks are pairs, but makes no real gaurantee.
 */
GameBoard.method('populate', function (start_cols, start_rows, num_types) {
	var x = 0;
	var y = 0;
	var id = 0;
	var padding_x = (this.cols - start_cols) / 2;
	var padding_y = (this.rows - start_rows) / 2;

	var types_used = {
		// type_id -> [[x,y], [x,y], ...]
	};

	// pass 0:
	// create random distribution of blocks
	for (x = 0; x < this.cols; x++) {
		this.blocks[x] = {};

		for (y = 0; y < this.rows; y++) {
			this.blocks[x][y] = null;

			var xdelta = x - padding_x;
			var ydelta = y - padding_y;

			var curblocktype = -1;
			if (
				xdelta >= 0 && xdelta < start_cols
				&& 
				ydelta >= 0 && ydelta < start_rows
			) {
				curblocktype = Math.floor((Math.random() * num_types)) % num_types;
			}

			if (!(curblocktype in types_used)) types_used[curblocktype] = [];
			types_used[curblocktype].push([x, y]);
		}
	}

	console.log('types used v1', types_used);

	// pass 1:
	// compile list of odd numbered length keys, and those with just 1 key
	var singles = [];
	var odds = [];
	for (var key in types_used) {
		if (types_used[key].length == 1) {
			singles.push(key);
		} else if (types_used[key].length % 2 != 0) {
			odds.push(key);
		}
	}

	console.log('singles', singles, 'odds', odds);

	// remove the singles, add to odds
	for (var index in singles) {
		var val = singles[index];
		if (odds.length > 0) {
			var loc = types_used[val][0];
			var oddid = odds.pop();

			console.log('move', val, loc, 'to', oddid);
			
			types_used[oddid].push(loc);
			delete types_used[val];
		}
	}

	// TODO check for any odds left, and redistribute?

	// pass 2:
	// finally create/display blocks
	for (var key in types_used) {
		for (var index in types_used[key]) {
			var val = types_used[key][index];
			var x = val[0];
			var y = val[1];

			this.blocks[x][y] = new Block(this.blockcontainer, this.radius, x, y, key);
		}
	}
});

GameBoard.method('reset', function () {

});