jQuery(document).ready(function ($) {
    'use strict';
	$('#results').on('hover', '.btn-group', function() {
		alert(1);
		$(this).tooltip();
	});
});