'use strict';

function emptyRow(colspan) {
    // row returned when no records are found.
    return '<tr class="danger"><td' + 
        (!isNaN(colspan) && colspan > 0 ? ' colspan="' + colspan + '"' : '') +
        '>No records found.</td></tr>';
}

function td(content) {
    // table td's
    return '<td>' + 
        ((content || content === false) && content.trim().length > 0 ? content : '&nbsp;' ) +
        '</td>';
}

function setModalHeader($modal, hdr) {
    // sets header of modal popups
    $modal.find('.modal-title').html(hdr);
}

function editColumn(id, api_path, nameval) {
    // returns a <td> with an edit button for that specific entity
    var url     = [location.protocol, '//', location.host, location.pathname].join(''),
        result  = '';
    if (url.indexOf('admin/') > -1)
        result = '<td><button item-id="' + id + '" item-type="' + api_path + '" item-name="' + nameval.replace(/"/g,'&quot;') + '" class="btn btn-primary btn-sm edit-btn" onclick="editRecord(this)">Edit</button></td>';

    return result;
}

function newButtonType(type) {
    // sets "New" button type
    $('.btn-new').attr('item-type',type);
}

function editRecord(sender) {
    // handles when edit button is clicked on a row
    var id 		    = $(sender).attr('item-id'),
        type 	    = $(sender).attr('item-type'),
        itemname    = $(sender).attr('item-name');

    clearEntryForms(false);
    $('.show-on-edit').show();
    $('.hide-on-edit').hide();

    $.ajax({
        url: '../../api.php/' + type + '/' + id,
        type: 'post',
        success: function (data, status) {
            var errstring = '';
            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);

                    if (Array.isArray(result) && result.length == 1) {
                        var record = result[0];

                        for (var field in record) {
                            if (record.hasOwnProperty(field)) {
                                $('[name="' + field + '"]').val(record[field]);
                            }
                        }
                    }
                    // do extra work for specific entity types
                    editSpecificWork(id, type);
                    // show the modal
                    var $modal = $('.modal');
                    setModalHeader($modal, 'Edit ' + itemname);
                    $modal.modal('show');
                }
                catch (ex) {
                    errstring = ex.message;
                }
            }
            else 
                errstring = status;

            if (errstring.length > 0)
                alert('There was an error: ' + errstring);
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
        }
    });
}

function editSpecificWork(id, type) {
    // does extra work based on type of entity.
    console.log(id, type);
    switch (type) {
        case 'mmj_shows':
            $('#setlist_link').attr('href', '../admin/setlists.html?show=' + id);
            break;
    }
}

function clearEntryForms(clearFields) {
    // clears out all form fields.
	$('div.form-group').removeClass('bg-danger');
	$('p.help-block').empty();
    $('p#form-message').removeClass('bg-danger bg-success text-danger text-success').empty();

    if (clearFields) {
        $('form').find('input:text, input:password, input:hidden, input:file, select, textarea').val('');
        $('form').find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
    }
}

function getParameterByName(name) {
    // gets query string parameter
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}