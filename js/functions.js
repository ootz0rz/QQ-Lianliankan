/* tools and other randomness */

/**
 * Define a function func as the given name for a class.
 **/
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};