// --------------------------------------------------------
// > Sidebar interface
//
// When clicking on a title, the sub-menu (i.e. the underlying
// `ul`), should be showed/hidden and the arrow's direction
// should change as well.
$('.sidebar h3').click(function() {
  $(this).next().animate({
    height: 'toggle'
  }, 150);

  $(this).find('.right span').toggleClass('glyphicon-chevron-down')
                             .toggleClass('glyphicon-chevron-right');
});
