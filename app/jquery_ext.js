// These methods are just jQuery extensions to ease the
// DOM manipulation and make the code a bit more DRY.

/**
 * Function that iterates over each field of a form element
 * and that returns a hash based on the fields' value.
 * For instance:
 *
 *    form.extractFields(); # => {title: 'Oshan - French Vanilla'}
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
