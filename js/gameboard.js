function GameBoard(parentid, bokeh, rows, cols) {
	this.parentid = parentid;
	this.parentnode = $(parentid);
	this.bokeh = bokeh;

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
	var x = 0;
	var y = 0;
	var id = 0;
	var padding_x = (this.cols - this.start_cols) / 2;
	var padding_y = (this.rows - this.start_rows) / 2;
	for (x = 0; x < this.cols; x++) {
		this.blocks[x] = {};

		for (y = 0; y < this.rows; y++) {
			var xdelta = x - padding_x;
			var ydelta = y - padding_y;

			this.blocks[x][y] = null;
			console.log(x, y, xdelta, ydelta, padding_x, padding_y);
			var curblocktype = -1;
			if (
				xdelta >= 0 && xdelta < this.start_cols
				&& 
				ydelta >= 0 && ydelta < this.start_rows
			) {
				curblocktype = Math.floor((Math.random() * num_block_types)) % num_block_types;
			}

			this.blocks[x][y] = new Block(this.blockcontainer, this.radius, x, y, curblocktype);
		}
	}
}

GameBoard.method('reset', function () {

});