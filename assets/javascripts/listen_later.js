$(document).ready(function() {
  // --------------------------------------------------------
  // Handle clicks on add button
  //
  // When the user wants to add an entry to their list of "Listen
  // later" medias, they paste an address and click on the "Add"
  // button ; it's added to the configuration file and displayed
  // on the page as well.
  $('.content').on('click', '.add', function() {
    var input   = $('input[name="address"]');
    var address = input.val();
    var html    = `<div class="basic-box"><ul><li>${address}</li></ul></div>`;

    // Store the value to the file system
    LocalModel.listenLaterTo(address);

    // Clear the input
    input.val('');

    // Display the new item
    $(html).hide().prependTo('.records').slideDown(150);
  });
});
