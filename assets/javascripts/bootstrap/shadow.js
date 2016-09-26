// --------------------------------------------------------
// >> Functions to hide the shadow
$('.shadow.main').on('click', function(e) {
  if (!$(e.target).hasClass('shadow'))
    return;

  Ui.hideShadow();
});

$('body').on('keyup', function(e) {
  if (e.keyCode == 27)
    Ui.hideShadow();
});
