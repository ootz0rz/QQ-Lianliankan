function Block(parentnode, radius, x, y, type) {
	this.parentnode = parentnode;
	this.radius = radius;
	this.x = x;
	this.y = y;
	this.type = type;

	this.div = null;
	this.o = null;

	this.create();
}

var Block__onDivClick = function(e) {
	console.log('click', e);

	var $this = $(e.currentTarget).data('block');
	if ($this.type != -1) {
		console.log('not a blank tile');

		game.select_block($this.x, $this.y);
	}
};

Block.method('select', function () {
	console.log("SELECT!");
	
	this.div.addClass('selected');
});

Block.method('deselect', function () {
	console.log("DESELECT!");
	
	this.div.removeClass('selected');
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