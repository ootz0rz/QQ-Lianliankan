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

	// currently selected block as Block() if any
	this.selected = null;

	// init the board
	// --------------------------------------

	// array in format
	// arr[xpos][ypos] -> Block()
	this.blocks = {};

	// Block().type -> [[x,y], [x,y], ...]
	this.blocks_by_type = {};

	// given a block() as key, return all other valid blocks that can be 
	// reached
	// Block() -> [Block(), Block(), ...]
	this.valid_pairs = {};

	// All the paths between any valid pair
	// arr[Block()][Block()] -> [[x,y], [x,y], [x,y], ...]
	// Note that the starting [x,y] is of the first block and ending [x,y] is 
	// of the second, inclusive
	this.paths = {};

	var blockcontainer = $("<div />");
	blockcontainer.attr('id', 'blockcontainer');

	this.blockcontainer = blockcontainer;
	this.parentnode.append(blockcontainer);

	// bottom score/control box
	this.scorebox = new Scorebox(this.parentnode);

	// populate
	this.populate(this.start_cols, this.start_rows, 1);//num_block_types);
	this.find_paths();
}

/**
 * Find all valid paths between any two blocks of the same type across entire 
 * board
 */
GameBoard.method('find_paths', function() {
	for (var typeid in this.blocks_by_type) {
		var blocks = this.blocks_by_type[typeid];

		if (blocks.length > 1) {
			for (var index in blocks) {
				var pos = blocks[index];
				var curblock = this.blocks[pos[0]][pos[1]];

				var paths = Gameboard__find_path(this, curblock);
				return;
			}
		}
	}
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

	var is_in_bounds = function(pos) {
		return (
				pos[0] >= 0 && pos[0] < board.cols && 
				pos[1] >= 0 && pos[1] < board.rows
			);
	};

	var get_move = function(M) {
		if (M == M_UP) return _up;
		if (M == M_DOWN) return _down;
		if (M == M_LEFT) return _left;
		if (M == M_RIGHT) return _right;
		if (M == M_NONE) return _none;
	}

	var do_pathfinding = function(
			node, 
			last_move,
			turns_left, 
			nodes_left,
			cur_path) 
	{
		if ( turns_left < 0 ) return [];
		if ( block.type == node.type && block !== node ) {
			if ( !(block in valid_path) ) {
				valid_path[block] = {};
			}

			if ( !(node in valid_path[block]) ) {
				valid_path[block][node] = cur_path;
				console.log('added new path', cur_path);
			} else {
				// only replace if shorter
				var len = valid_path[block][node].length;
				if ( len > cur_path.length ) {
					valid_path[block][node] = cur_path;
				}

				console.log('replaced old path', cur_path);
			}

			return cur_path;
		}

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
	console.log('do_pathfinding', paths);

	console.log("FINAL PATHS", valid_path);
	return valid_path;
};

/**
 * Select the block at the given x/y if possible
 */ 
GameBoard.method('select_block', function(x, y) {
	var curblock = this.blocks[x][y];

	// ignore empty blocks
	if (curblock.type == -1) return;

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

		} else {
			// otherwise, we just simply select the new block
			this.selected.deselect();
			curblock.select();
			this.selected = curblock;
		}
	}
});

/**
 * Pseudo-randomly populate the game board with specified # cols/rows.
 *
 * Tries to make sure all the blocks are pairs. Should be fine as long as:
 * 		(start_cols * start_rows) % 2 == 0
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
	// compile list of odd numbered length keys
	var odds = [];
	for (var key in types_used) {
		if (types_used[key].length % 2 != 0) {
			odds.push(key);
		}
	}

	console.log('odds', odds);

	// add one from the odds to another odd, remove both from list
	while (odds.length > 0) {
		var oddid_1 = odds.pop();
		var oddid_2 = odds.pop();

		var loc1 = types_used[oddid_1].pop();
		types_used[oddid_2].push(loc1);
	}

	console.log('odds', odds);

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

	console.log('types used v2', types_used);
	this.blocks_by_type = types_used;
});

GameBoard.method('reset', function () {

});