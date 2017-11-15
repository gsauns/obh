'use strict';

$(document).ready(function() {
	$('input.datepicker').datepicker({
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
		dateFormat: 'mm/dd/yy'
	});
	
	$('button.btn-new').on('click', function () {
		var $form 	= $('form.entry-form'),
			$modal 	= $('#myModal'),
			type	= $(this).attr('item-type');

		//$form.trigger('reset');
		//resetForm($form);
		clearEntryForms(true);
		setModalHeader($modal, 'New ' + type);
		$modal.modal();
	});

	$('button.btn-delete-record').on('click', function () {
		var id = $('#form_id').val();

		if (id.length > 0) {
			if (confirm('Are you sure you want to delete this record?')) {
				$.ajax({
					url: 'shows.php',
					type: 'delete',
					success: function (data, status) {
						if (data == 'success') 
							$messagep.addClass('bg-success').html("New show successfully saved.");
						else 
							$messagep.addClass('bg-danger').html("Error saving show.<br>" + data);
	
						loadShowInfo(true);
						
					},
					error: function (data, status, errorThrown) {
						console.log('Error', data, status, errorThrown);
					}
	
				});
			}
		}
	});

    $('form#showsform').on('submit', function (e) {
		e.preventDefault();

		clearEntryForms(false);

		var $messagep = $('p#form-message'),
			$current_control,
			valid = true,
			error_message = '',
			footer_message = '',
			attending = $('select#attending').val();

        // Validate form
		$current_control = $('input#headline');
		if ($current_control.val().trim().length == 0) {
			error_message = "Headline is required.";
			footer_message += error_message + '<br>';
			$current_control.parent().addClass('bg-danger');
			$current_control.next('p.help-block').html(error_message);

			valid = false;
		}

		$current_control = $('input#date');
		if ($current_control.val().trim().length == 0) {
			error_message = "Date is required.";
			footer_message += error_message + '<br>';
			$current_control.parent().addClass('bg-danger');
			$current_control.next('p.help-block').html(error_message);

			valid = false;
		}
		
		// If valid, submit
		sendForm('show', 'shows', $(this), $messagep, valid, 'post', loadShowInfo);
	});

	$('form#songsform').on('submit', function (e) {
		e.preventDefault();

		clearEntryForms(false);

		var $messagep = $('p#form-message'),
			$current_control,
			valid = true,
			error_message = '',
			footer_message = '';

        // Validate form
        $current_control = $('input#name');
		if ($current_control.val().trim().length == 0) {
			error_message = "Name is required.";
			footer_message += error_message + '<br>';
			$current_control.parent().addClass('bg-danger');
			$current_control.next('p.help-block').html(error_message);

			valid = false;
		}
        
        sendForm('song', 'songs', $(this), $messagep, valid, 'post', loadSongInfo);
		
	});
});

// Form submission via API.
function sendForm(entity, plural, $form, $messagep, valid, verb, callback) {
	if (valid) {
		var formdata = $form.serialize();
		
		$.ajax({
			url: plural + '.php',
			type: verb,
			data: formdata,
			success: function (data, status) {
				if (!isNaN(data)) {
					// insert
					$messagep.addClass('bg-success').html("New " + entity + " successfully created.");
					$("input#form_id").val(data);
				}
				else if (data == 'update')
					// update
					$messagep.addClass('bg-success').html(entity + " saved.");
				else 
					// error
					$messagep.addClass('bg-danger').html("Error saving song.<br>" + data);
					
				callback(true);
			},
			error: function (data, status, errorThrown) {
				console.log('Error', data, status, errorThrown);
			}

		});
	}
	else
		$messagep.addClass('bg-danger').html(footer_message);
}

function resetForm($form) {
	$form.find('input:text, input:password, input:hidden, input:file, select, textarea').val('');
    $form.find('input:radio, input:checkbox')
         .removeAttr('checked').removeAttr('selected');
}