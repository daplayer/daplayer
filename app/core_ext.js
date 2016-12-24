/**
 * Returns the first element of the array.
 *
 * @return {Object}
 */
Array.prototype.first = function() {
  return this[0];
}

/**
 * Returns the last element of the array.
 *
 * @return {Object}
 */
Array.prototype.last = function() {
  return this[this.length - 1];
};

/**
 * Checks whether the array is empty or not.
 *
 * @return {Boolean}
 */
Array.prototype.empty = function() {
  return this.length == 0;
};

/**
 * Checks whether an element is present in the array or not.
 *
 * @param  {Object} element - The element to check.
 * @return {Boolean}
 */
Array.prototype.includes = function(element) {
  return this.indexOf(element) != -1;
};

/**
 * Removes duplicates from the array.
 *
 * @return {Array}
 */
Array.prototype.unique = function() {
  return this.filter((e, i) => this.indexOf(e) == i);
};

/**
 * Sorts array's elements by the given field name.
 *
 * @param  {String} field - The field to sort by.
 * @return {Array}
 */
Array.prototype.sortBy = function(field) {
  return this.sort((a, b) => {
    if (a[field] > b[field])
      return 1;
    else if (a[field] < b[field])
      return -1;

    return 0;
  })
}

/**
 * Shuffles an array, randomly moving its values.
 * It modifies the array in place and doesn't create
 * any copy of it.
 *
 * @return {null}
 */
Array.prototype.shuffle = function() {
  this.forEach(function(value, index, array) {
    let new_index = Math.floor(Math.random() * index);

    array[index]     = array[new_index];
    array[new_index] = value;
  });
};

/**
 * Only for SoundCloud `artwork_url` fields:
 *
 * Substitute the actual size of the image with the specified
 * one.
 *
 * @param  {String} size - The requested size.
 * @return {String}
 */
String.prototype.size = function(size) {
  return this.replace(/badge|large|t(2|3)00x(2|3)00/, size);
};

/**
 * Returns the last character of the string.
 *
 * @return {String}
 */
String.prototype.last = function() {
  return this[this.length - 1];
};

/**
 * Checks whether an sub-string is present in the string.
 *
 * @param  {String}  str - The sub-string to check.
 * @return {Boolean}
 */
String.prototype.includes = function(str) {
  return this.indexOf(str) != -1;
};

/**
 * Returns a camel-cased version of the string.
 *
 * @return {String}
 */
String.prototype.camel = function() {
  return this.split("_").map((part, i) => {
    if (i == 0)
      return part;
    else
      return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
};

/**
 * Returns a dasherized version of the string replacing spaces
 * by dashes and stripping out some unwanted characters.
 *
 * @return {String}
 */
String.prototype.dasherize = function() {
  return this.replace(/((\'|\)|\(|\!|\,|_|;\/|\\)+)/g, ' ').trim()
             .replace(/\s+/g, '-').toLowerCase();
}

/**
 * Mixes-in a class inside another one.
 *
 * This one is not defined through `Object.prototype` since
 * we cannot pollute this scope otherwise jQuery is bugged.
 *
 * @param  {Object} object   - The object to mix functions in.
 * @param  {String} location - The path to load the file containing
 *                             the functions that will be mixed in.
 * @return {null}
 */
global.include = function(object, location) {
  var klass = require(location);

  Object.getOwnPropertyNames(klass)
    .filter(func => typeof klass[func] === "function")
    .forEach((func) => {
      object[func] = klass[func];
    });
}
