// --------------------------------------------------------
// > Container event handlers
//
// Handle the loading of new resources: load new resources
// when we are at the bottom of the page.
$('.container').scroll(function() {
  if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight())
    Ui.loadNextRecords();
});
