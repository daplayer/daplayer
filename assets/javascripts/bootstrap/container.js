// --------------------------------------------------------
// > Container event handlers
// Handle clicks on option items
$('.container').on('click', '.options li', function() {
  var options = $(this).parents('.options');
      options.slideToggle();

  Ui[$(this).data('function')](options.parents('.music, .video'));
});

// Handle the loading of new resources: load new resources
// when we are at the bottom of the page.
$('.container').scroll(function() {
  if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight())
    Ui.loadNextRecords();
});
