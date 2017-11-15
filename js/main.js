'use strict';

function emptyRow(colspan) {
    return '<tr class="danger"><td' + 
        (!isNaN(colspan) && colspan > 0 ? ' colspan="' + colspan + '"' : '') +
        '>No records found.</td></tr>';
}

function td(content) {
    return '<td>' + 
        ((content || content === false) && content.trim().length > 0 ? content : '&nbsp;' ) +
        '</td>';
}

function setModalHeader($modal, hdr) {
    $modal.find('.modal-title').html(hdr);
}

function editColumn(id, api_path, nameval) {
    var url     = [location.protocol, '//', location.host, location.pathname].join(''),
        result  = '';
    if (url.indexOf('admin/') > -1)
        result = '<td><button item-id="' + id + '" item-type="' + api_path + '" item-name="' + nameval.replace(/"/g,'&quot;') + '" class="btn btn-primary btn-sm edit-btn" onclick="editRecord(this)">Edit</button></td>';

    return result;
}

function newButtonType(type) {
    $('.btn-new').attr('item-type',type);
}

function editRecord(sender) {
    var id 		    = $(sender).attr('item-id'),
        type 	    = $(sender).attr('item-type'),
        itemname    = $(sender).attr('item-name');

    clearEntryForms(false);

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

function clearEntryForms(clearFields) {
	$('div.form-group').removeClass('bg-danger');
	$('p.help-block').empty();
    $('p#form-message').removeClass('bg-danger bg-success text-danger text-success').empty();

    if (clearFields) {
        $('form').find('input:text, input:password, input:hidden, input:file, select, textarea').val('');
        $('form').find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
    }
}