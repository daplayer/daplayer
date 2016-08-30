// --------------------------------------------------------
// > Sidebar interface
//
// When clicking on a title, the sub-menu (i.e. the underlying
// `ul`), should be showed/hidden and the arrow's direction
// should change as well.
$('.sidebar').on('click', 'h3', function() {
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
$('.sidebar').on('click', '.search .left', function() {
  Ui.toggleSearchBar();
});

// Display/hide search options click on the plus.
$('.sidebar').on('click', '.search .right', function() {
  $('.search .search-options').slideToggle();
});

// Manage key-up events for the search bar:
//   - Hide search bar pressing esc.
//   - Trigger the search pressing return;
$('.sidebar').on('keyup', '.search input', function(e) {
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
