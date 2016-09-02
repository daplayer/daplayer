// --------------------------------------------------------
// >> Functions to hide the shadow
$('.shadow.main').on('click', function(e) {
  if (!$(e.target).hasClass('shadow'))
    return;

  Ui.hideShadow();
});
