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

	var div = $("<div />");
	this.parentnode.append(div);

	div.block = this;
	div.addClass('block');
	div.addClass('col' + this.x);
	div.addClass('row' + this.y);

	// block itself
	var o = $("<div />");
	o.addClass(block_types[this.type]); // set in index.js
	div.append(o);
});