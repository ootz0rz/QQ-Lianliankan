function GameBoard(parentid, bokeh, rows, cols) {
	this.parentid = parentid;
	this.parentnode = $(parentid);
	this.bokeh = bokeh;

	// set global
	game = this;

	// note that this should always be even numbers
	this.rows = rows;
	this.cols = cols;

	// default sphere/box size
	this.radius = '40px';

	// init the board
	// --------------------------------------

	var blockcontainer = $("<div />");
	blockcontainer.attr('id', 'blockcontainer');

	this.blockcontainer = blockcontainer;
	this.parentnode.append(blockcontainer);

	// bottom score/control box
	this.scorebox = new Scorebox(this.parentnode);

	// create help dialog
	// --------------------------------------
	var h = new Modal(
		'OMG HELP MEEEE',
		"It's matching tiles but with a twist! Complete the board before the "
		+ "time runs out! Also, there must be a clear, unbroken path between each of "
		+ "the tiles. This means they can be beside each other, or a bit "
		+ "further away too. But the path can only take 2 turns at most. The "
		+ "following are some examples of valid moves. Note that there is "
		+ "no path length limit. Click the [+] next to the time to add more time, but becareful you might run out of help."
	);
	h.container.addClass('help');
	h.addbutton('Close');
	this.helpbox = h;

	// each move type
	var contents = h.eContents;
	var moves = $("<div />");
	moves.addClass("moves");
	contents.append(moves);

	moves.append(
		$("<div />")
			.append($("<img />").attr('src', 'img/straight.png'))
			.append($("<span />").html("No turns, a straight path."))
	);

	moves.append(
		$("<div />")
			.append($("<img />").attr('src', 'img/1turn.png'))
			.append($("<span />").html("A single turn, creating an L shape."))
	);

	moves.append(
		$("<div />")
			.append($("<img />").attr('src', 'img/2turna.png'))
			.append($("<span />").html("2 turns, creating a sort of S shape."))
	);

	moves.append(
		$("<div />")
			.append($("<img />").attr('src', 'img/2turnb.png'))
			.append($("<span />").html("2 turns, creating a sort of U shape."))
	);

	// show welcome message
	// --------------------------------------
	var m = new Modal(
		'Welcome!', 
		'To begin playing, close this window and click '
		+ '<strong>NEW GAME</strong> or the <strong>START</strong> button '
		+ 'below. Instructions are available under '
		+ '<strong>HELP</strong>. Enjoy!'
	);
	var mstart = m.addbutton("Start");
	var mclose = m.addbutton("Close");

	mstart.on('click', function() {
		game.start();
	});

	m.show();
}

/**
 * Display help dialog
 */ 
GameBoard.method('help', function() {
	this.helpbox.show();
});

/**
 * Start the game
 */ 
GameBoard.method('start', function() {
	this.reset();
	$(".block").remove();

	// should always be an even number
	this.start_rows = 4;
	this.start_cols = 4;

	// populate
	this.populate(this.start_cols, this.start_rows, num_block_types, true);
	this.find_paths();
	this.scorebox.begintimer();
});

/**
 * Refresh board and move on to next round
 */ 
GameBoard.method('next_round', function() {
	this.reset(false);
	$(".block").remove();

	if ( this.start_rows > this.start_cols ) {
		this.start_cols = Math.min(this.start_cols + 2, this.cols);
	} else {
		this.start_rows = Math.min(this.start_rows + 2, this.rows);
	}

	// populate
	this.populate(this.start_cols, this.start_rows, num_block_types, true);
	this.find_paths();
	this.scorebox.begintimer();
	this.scorebox._timeHelpsLeft = this.scorebox._timeHelpsLeft + 1;
});

/**
 * Display round win dialog
 */ 
GameBoard.method('do_win', function() {
	if ( this.winbox != null ) {
		// remove old box first
		this.winbox.div.remove();
	}

	var m = new Modal(
		'You Finished!', 
		'Congrats, you finished this round with <strong>' + this.scorebox.getscore() + 'pts!</strong>'
		+ '<br /><br />'
		+ 'To continue to the next round click <strong>NEXT</strong> or <strong>NEW GAME</strong> to start over.'
	);

	var btnNext = m.addbutton("Next");
	var btnNew = m.addbutton("New Game");

	// set binds
	btnNew.on('click', function() {
		m.hide();
		game.start();
	});

	btnNext.on('click', function() {
		m.hide();
		game.next_round();
	});

	this.scorebox.stoptimer();
	this.scorebox.stoptimer();

	m.show();

	this.winbox = m;
});

/**
 * Display time ran out dialog
 */ 
GameBoard.method('lose', function() {
	if ( this.losebox != null ) {
		// remove old box first
		this.losebox.div.remove();
	}

	var m = new Modal(
		'Time ran out :(', 
		'The time ran out! :( Click <strong>NEW GAME</strong> to start over.'
	);

	var btnNew = m.addbutton("New Game");

	// set binds
	btnNew.on('click', function() {
		m.hide();
		game.start();
	});

	this.scorebox.stoptimer();

	m.show();

	this.losebox = m;

	// TODO fix the bug where if you force close the modal window (remove hash
	// from the URL) you can continue playing the game as normal :/
});

/**
 * Find all valid paths between any two blocks of the same type across entire 
 * board
 */
GameBoard.method('find_paths', function() {
	this.paths = {};

	// check the paths for every block still on the board
	for (var typeid in this.blocks_by_type) {
		var blocks = this.blocks_by_type[typeid];

		if (blocks.length > 1) {
			for (var index in blocks) {
				var pos = blocks[index];
				var curblock = this.blocks[pos[0]][pos[1]];

				if (curblock.type != BLOCK_BLANK_TYPE_ID) {
					var paths = Gameboard__find_path(this, curblock);
					$.extend(this.paths, paths);
				}
			}
		}
	}

	// see how many paths we have, if we don't have any, we need to repopulate
	// the board or we've won
	if ( Object.keys(game.paths).length == 0 ) {
		if ( this.num_blocks_left == 0 ) {
			this.do_win();
		} else {
			// no moves left
			this.repopulate();
		}
	}
});

/**
 * Remove the specified block from the gameboard and replace with a blank tile
 */
GameBoard.method('remove_block', function(block) {
	// update board vars
	var pos = this.blocks_by_type[block.type];
	for (var index in pos) {
		var curpos = pos[index];

		if (curpos[0] == block.x && curpos[1] == block.y) {
			delete this.blocks_by_type[block.type][index];
			break;
		}
	}

	this.num_blocks_left = this.num_blocks_left - 1;

	// remove from board
	block.deselect();
	block.clear();
});

/**
 * Find all valid paths originating from the given block
 * 
 * Basically just a brute force search...it's slow but shouldn't be too bad 
 * since we've got a pretty small board
 */
var Gameboard__find_path = function(board, block) {
	// movement directions [x, y]
	// assumes grid starts top left, x expands to right and y expands to bottom
	var _up = [0, -1];
	var _down = [0, 1];
	var _left = [-1, 0];
	var _right = [1, 0];
	var _none = [0, 0];

	var M_UP = 0;
	var M_DOWN = 1;
	var M_LEFT = 2;
	var M_RIGHT = 3;
	var M_NONE = 4;

	// arr[Block()][Block()] -> Shortest path between the two blocks as an
	// array of Block()'s in between, including the starting and ending blocks
	var valid_path = {};

	var all_nodes = []; // [Block(), ...]
	for (var idx in board.blocks) {
		for (var idy in board.blocks[idx]) {
			all_nodes.push(board.blocks[idx][idy]);
		}
	}

	// check the give pos[x,y] is within game board bounds
	var is_in_bounds = function(pos) {
		return (
				pos[0] >= 0 && pos[0] < board.cols && 
				pos[1] >= 0 && pos[1] < board.rows
			);
	};

	// the actual brute force path finding
	var do_pathfinding = function(
			node, 
			last_move,
			turns_left, 
			nodes_left,
			cur_path) 
	{
		// no movement left
		if ( turns_left < 0 ) return [];

		// encountered same block
		if ( block.type == node.type && block !== node ) {
			if ( !(block.bID in valid_path) ) {
				valid_path[block.bID] = {};
			}

			if ( !(node.bID in valid_path[block.bID]) ) {
				valid_path[block.bID][node.bID] = cur_path;
			} else {
				// only replace if shorter
				var len = valid_path[block.bID][node.bID].length;
				if ( len > cur_path.length ) {
					valid_path[block.bID][node.bID] = cur_path;
				}
			}

			return cur_path;
		}

		// encounter non empty block of different type
		if ( node.type != BLOCK_BLANK_TYPE_ID && block !== node ) return [];

		var cur_pos = [node.x, node.y];

		// get new positions
		var top_pos = [cur_pos[0] + _up[0], cur_pos[1] + _up[1]];
		var bot_pos = [cur_pos[0] + _down[0], cur_pos[1] + _down[1]];
		var lef_pos = [cur_pos[0] + _left[0], cur_pos[1] + _left[1]];
		var rig_pos = [cur_pos[0] + _right[0], cur_pos[1] + _right[1]];

		var res_top = [];
		var res_bot = [];
		var res_lef = [];
		var res_rig = [];

		// check each top/bot/left/right
		if ( is_in_bounds(top_pos) && last_move != M_DOWN ) 	res_top = do_move(top_pos, M_UP, nodes_left, last_move, turns_left, cur_path);
		if ( is_in_bounds(bot_pos) && last_move != M_UP ) 		res_bot = do_move(bot_pos, M_DOWN, nodes_left, last_move, turns_left, cur_path);
		if ( is_in_bounds(lef_pos) && last_move != M_RIGHT ) 	res_lef = do_move(lef_pos, M_LEFT, nodes_left, last_move, turns_left, cur_path);
		if ( is_in_bounds(rig_pos) && last_move != M_LEFT ) 	res_rig = do_move(rig_pos, M_RIGHT, nodes_left, last_move, turns_left, cur_path);

		var res = [];
		if (res_top.length > 0) res.push(res_top);
		if (res_bot.length > 0) res.push(res_bot);
		if (res_lef.length > 0) res.push(res_lef);
		if (res_rig.length > 0) res.push(res_rig);

		return res;
	};

	// recurse do_pathfinding at the new_pos
	var do_move = function(new_pos, _move, nodes_left, last_move, turns_left, cur_path) {
		var top_block = board.blocks[new_pos[0]][new_pos[1]];
		var top_nodes_left = nodes_left.slice(0);
		var top_node_del_idx = top_nodes_left.indexOf(top_block);
		delete top_nodes_left[top_node_del_idx];
		var top = do_pathfinding(
			top_block,
			_move,
			(last_move == _move || last_move == M_NONE) ? turns_left : turns_left - 1,
			top_nodes_left,
			cur_path.concat(top_block)
		);

		return top;
	}

	var paths = do_pathfinding(block, M_NONE, 2, all_nodes, [block]);

	return valid_path;
};

/**
 * Select the block at the given x/y if possible
 */ 
GameBoard.method('select_block', function(x, y) {
	var curblock = this.blocks[x][y];

	// ignore empty blocks
	if (curblock.type == BLOCK_BLANK_TYPE_ID) return;

	// check if a block is already selected
	if ( this.selected == null ) { // nothing selected
		curblock.select();
		this.selected = curblock;
	} else { // something selected
		// if it's the same one, then deselect and return
		if ( this.selected == curblock ) {
			curblock.deselect();
			this.selected = null;
			return;
		}

		// otherwise, check to see if type's match before we do anything
		// if they do, then we'll see if there is a valid path between the
		// two and remove them from the board
		if ( this.selected.type == curblock.type ) {
			if (this.selected.bID in this.paths) {
				console.log("Paths exist for pre-selected item...");

				var paths = this.paths[this.selected.bID];

				if ( curblock.bID in paths ) {
					console.log("and a path between the two clicked!", paths[curblock.bID]);

					for (var index in paths[curblock.bID]) {
						var b = paths[curblock.bID][index];
						b.highlight();
					}

					this.remove_block(this.selected);
					this.remove_block(curblock);
					this.selected = null;

					this.scorebox.addScore();

					this.find_paths();
					return;
				}
			}
		} 

		// otherwise, we just simply select the new block
		this.selected.deselect();
		curblock.select();
		this.selected = curblock;
	}
});

/**
 * Similar to populate(), but replaces only existing non empty tiles. Will also
 * re-evaluate paths.
 */
GameBoard.method('repopulate', function() {
	this.populate(this.start_cols, this.start_rows, num_block_types, false);
	this.find_paths();
});

/**
 * Pseudo-randomly populate the game board with specified # cols/rows.
 *
 * Tries to make sure all the blocks are pairs. Should be fine as long as:
 * 		(start_cols * start_rows) % 2 == 0
 */
GameBoard.method('populate', function (start_cols, start_rows, num_types, fresh) {
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
		if (fresh) this.blocks[x] = {};

		for (y = 0; y < this.rows; y++) {
			if (fresh) {
				this.blocks[x][y] = null;
			}
			else if (this.blocks[x][y].type == BLOCK_BLANK_TYPE_ID) {
				// if this is an empty block type, we skip it
				continue;
			}

			var xdelta = x - padding_x;
			var ydelta = y - padding_y;

			var curblocktype = BLOCK_BLANK_TYPE_ID;
			if (
				xdelta >= 0 && xdelta < start_cols && 
				ydelta >= 0 && ydelta < start_rows
			) {
				curblocktype = Math.floor((Math.random() * num_types)) % num_types;
			}

			if (!(curblocktype in types_used)) types_used[curblocktype] = [];
			types_used[curblocktype].push([x, y]);
		}
	}

	this.blocks_by_type = GameBoard__fix_block_pairings(this, types_used, fresh);
});

var GameBoard__fix_block_pairings = function(board, types_used, fresh) {
	// pass 1:
	// compile list of odd numbered length keys
	var odds = [];
	for (var key in types_used) {
		if (types_used[key].length % 2 != 0) {
			odds.push(key);
		}
	}

	// add one from the odds to another odd, remove both from list
	while (odds.length > 0) {
		var oddid_1 = odds.pop();
		var oddid_2 = odds.pop();

		var loc1 = types_used[oddid_1].pop();
		types_used[oddid_2].push(loc1);
	}

	// pass 2:
	// finally create/display blocks
	for (var key in types_used) {
		for (var index in types_used[key]) {
			var val = types_used[key][index];
			var x = val[0];
			var y = val[1];

			if (fresh) {
				board.blocks[x][y] = new Block(board.blockcontainer, board.radius, x, y, key);
				if ( key != BLOCK_BLANK_TYPE_ID ) board.num_blocks_left = board.num_blocks_left + 1;
			}
			else {
				board.blocks[x][y].changetype(key);
			}
		}
	}

	return types_used;
};

GameBoard.method('reset', function (scorereset) {
	if ( scorereset == null ) scorereset = true;

	// currently selected block as Block() if any
	this.selected = null;

	// array in format
	// arr[xpos][ypos] -> Block()
	this.blocks = {};

	// Block().type -> [[x,y], [x,y], ...]
	this.blocks_by_type = {};

	// All the paths between any valid pair
	// arr[Block().bID][Block().bID] -> [Block(), Block(), ..., Block()]
	// Note that the starting element is of the first block and ending element 
	// is the second, inclusive
	this.paths = {};

	// counter for how many non blank blocks are left on the board
	this.num_blocks_left = 0;

	// modal box to display when you win a round
	this.winbox = null;

	if ( scorereset ) this.scorebox.reset();
});