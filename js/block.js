BLOCK_BLANK_TYPE_ID = -1;

function Block(parentnode, radius, x, y, type) {
	this.parentnode = parentnode;
	this.radius = radius;
	this.x = x;
	this.y = y;
	this.type = type;

	this.bID = Block__getID(x, y, type);

	this.div = null;
	this.o = null;

	this.create();
}

var Block__getID = function(x, y, type) {
	return [x,y,type].join("|");
}

var Block__onDivClick = function(e) {
	var $this = $(e.currentTarget).data('block');
	console.log('click', e, 'pos', $this.x, $this.y);
	if ($this.type != -1) {
		console.log('not a blank tile');

		game.select_block($this.x, $this.y);
	}
};

Block.method('clear', function () {
	this.o.fadeOut();

	this.o.removeClass(block_types[this.type]);

	this.type = BLOCK_BLANK_TYPE_ID;
	this.bID = Block__getID(this.x, this.y, this.type);

	this.o.addClass(block_types[this.type]);
});

Block.method('changetype', function (newtype) {
	this.o.removeClass(block_types[this.type]);

	this.type = newtype;
	this.bID = Block__getID(this.x, this.y, this.type);

	this.o.addClass(block_types[this.type]);
});

Block.method('select', function () {
	this.div.addClass('selected');
});

Block.method('deselect', function () {
	this.div.removeClass('selected');
});

Block.method('highlight', function () {
	this.div.addClass('pathway');

	var Block__highlight__removeClass = function(block) {
		block.div.removeClass('pathway');
	}

	var $this = this;
	this.timer = window.setTimeout(function() {
		Block__highlight__removeClass($this);
	}, 200);
});

/**
* Create the block at its current x/y/type and return the created div
*/
Block.method('create', function () {
	// positioning div
	var div = $("<div />");
	this.parentnode.append(div);

	div.addClass('block');
	div.addClass('col' + this.x);
	div.addClass('row' + this.y);

	// image block itself
	var o = $("<div />");
	o.addClass(block_types[this.type]); // set in index.js
	div.append(o);

	this.div = div;
	this.o = o;

	div.data('block', this);
	o.data('block', this);

	// bind events
	div.on('click', Block__onDivClick);
});