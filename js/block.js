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

Block.method('create', function () {
	/**
	* Create the block at its current x/y/type and return the created div
	*/

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
});