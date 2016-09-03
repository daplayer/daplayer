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
    var source  = $('input[name="source"]:checked').val();

    if ($('input[name="soundcloud"]').val() == 1)
      modules.push('soundcloud');
    if ($('input[name="youtube"]').val() == 1)
      modules.push('youtube');
    if ($('input[name="local"]').val() == 1)
      modules.push('local');

    if (modules.empty())
      modules.push(Cache.current.module);

    if (!(modules.empty() && Cache.current.module != 'meta'))
      MetaController.render('meta', 'search', [$(this).val(), source, modules]);
  }
});

$('.sidebar').on('click', '.switch-border, .switch', function() {
  var container = $(this).parent();
  var on        = container.find('.on');
  var off       = container.find('.off');
  var border    = container.find('.switch-border');
  var field     = container.find('input[type="hidden"]');

  if (field.val() == 1) {
    field.val(0);

    on.animate({ left: '45px' }, 200);
    border.animate({ left: '40px' }, 200);
    off.animate({ left: 0 }, 200);

    border.css({
      'background': '#949BC0',
      'border-top-left-radius': '0px',
      'border-bottom-left-radius': '0px',
      'border-top-right-radius': '2px',
      'border-bottom-right-radius': '2px'
    });
  } else {
    field.val(1);

    off.animate({ left: '-45px' }, 200);
    border.animate({ left: 0 }, 200);
    on.animate({ left: '5px' }, 200);

    border.css({
      'background': '#0277DB',
      'border-top-left-radius': '2px',
      'border-bottom-left-radius': '2px',
      'border-top-right-radius': '0px',
      'border-bottom-right-radius': '0px'
    });
  }
});
