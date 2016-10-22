// These methods are just jQuery extensions to ease the
// DOM manipulation and make the code a bit more DRY.

/**
 * Function that iterates over each field of a form element
 * and that returns a hash based on the fields' value.
 * For instance:
 *
 *    form.extractFields();
 *    // => {title: 'Oshan - French Vanilla'}
 *
 * @return {Object}
 */
$.fn.extractFields = function() {
  var hash = {};

  this.find('input').each(function() {
    var self = $(this);

    if (self.attr('type') == 'submit' ||
       (self.attr('type') == 'radio'  && !self.is(':checked')))
      return;

    hash[self.attr('name')] = self.val();
  });

  return hash;
};

/**
 * Function that changes the different DOM attributes to
 * reflect a modification of an element's artist.
 *
 * @param  {String} value - The artist's name.
 * @return {jQuery}
 */
$.fn.artist = function(value) {
  var artist = this.find('.artist');

  artist.html(value);
  artist.attr('title', value);
  artist.data('id', value);

  return this;
}

/**
 * Function that changes the different DOM attributes to
 * reflect a modification of an element's title.
 *
 * @param  {String} value - The new title.
 * @return {jQuery}
 */
$.fn.title = function(value) {
  var title = this.find('.title');

  title.html(value);
  title.attr('title', value);

  return this;
}

/**
 * Function that slides out a notification and remove it from
 * the DOM.
 *
 * @return {null}
 */
$.fn.slideOut = function() {
  var self = this;

  self.find('.box').animate({
    right: '-300px',
    opacity: 0
  }, 500, function() {
    self.remove();
  });
}
