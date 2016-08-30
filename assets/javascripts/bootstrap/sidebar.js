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

// --------------------------------------------------------
// >> Manage search
//
// Hide the search bar clicking on the left chevron.
$('.search .left').click(function() {
  Ui.toggleSearchBar();
});

// Display/hide search options click on the plus.
$('.search .right').click(function() {
  $('.search .search-options').slideToggle();
});

// Manage key-up events for the search bar:
//   - Hide search bar pressing esc.
//   - Trigger the search pressing return;
$('.search').on('keyup', 'input', function(e) {
  // 27: 'esc' key
  // 13: 'Enter' key

  if (e.keyCode == 27) {
    Ui.toggleSearchBar();
  } else if (e.keyCode == 13) {
    var modules = [];

    if ($('input[name="soundcloud"]').is(':checked'))
      modules.push('soundcloud');
    if ($('input[name="youtube"]').is(':checked'))
      modules.push('youtube');
    if ($('input[name="local"]').is(':checked'))
      modules.push('local');

    if (modules.empty())
      modules.push(Cache.current.module);

    MetaController.render('meta', 'search', [$(this).val(), modules]);
  }
});
