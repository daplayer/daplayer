// --------------------------------------------------------
// > Sidebar interface
//
// Display the search bar clicking on the magnify icon
$('.sidebar').on('click', '.search_icon', function() {
  Ui.toggleSearchBar();
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
    var source = $('input[name="source"]:checked').val();
    var module = Cache.current.module;

    if (module == 'meta')
      return;

    Cache.search = {
      query:  $(this).val(),
      source: source
    };

    Controller.for(module).searchResults();
  }
});
