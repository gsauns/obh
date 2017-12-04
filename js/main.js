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

function editDeleteColumn(id, api_path, showDeleteButton, nameval, classes) {
    // returns a <td> with an edit button for that specific entity
    var url         = [location.protocol, '//', location.host, location.pathname].join(''),
        result      = '',
        itemname    = nameval.replace(/"/g,'&quot;');
    if (url.indexOf('admin/') > -1) {
        result = '<td class="'+ (classes == null ? '' : classes) + '">' + 
            '<button item-id="' + id + 
            '" item-type="' + api_path + 
            '" item-name="' + itemname + 
            '" class="btn btn-primary btn-sm edit-btn" ' +  
            'onclick="editRecord(this)">Edit</button>';
        
        if (showDeleteButton)
            result += '<button item-id="' + id + 
                        '" item-type="' + api_path + 
                        '" class="btn btn-sm btn-danger" ' +  
                        'onclick="deleteRecord(this)">' + 
                        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' + 
                        '</button>';

        result += '</td>';
    }

    return result;
}

function saveDeleteCancelButtons(id, type) {
    var result =    '<button item-id="' + id + '" item-type="' + type + 
                        '" class="btn btn-sm btn-success save-btn" title="Save changes">' + 
                        '<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>' +
                    '</button>' +
                    '<button item-id="' + id + '" item-type="' + type + 
                        '" class="btn btn-sm btn-danger delete-btn" title="Delete record">' + 
                        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
                    '</button>' +
                    '<button item-id="' + id + '" item-type="' + type + 
                        '" class="btn btn-sm btn-warning cancel-btn" title="Cancel changes">' + 
                        '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
                    '</button>';
    
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

                        // find each form control by name and assign the value
                        for (var field in record) {
                            if (record.hasOwnProperty(field)) {
                                // any field not in a tfoot, that is
                                $(':not(tfoot *)[name="' + field + '"]').val(record[field]);
                            }
                        }
                    }
                    // do extra work for specific entity types
                    editSpecificWork(sender, id, type, data);
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
                swal('Error', 'There was an error: ' + errstring, 'danger');
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            swal('Error', 'There was an error: ' + errorThrown, 'danger');
        }
    });
}

function deleteRecord(sender) {
    // handles when delete button clicked in a row
    var id 		    = $(sender).attr('item-id'),
    type 	        = $(sender).attr('item-type');

    swal({
        title: 'Delete Record', 
        text: 'Are you sure you want to delete this record?',
        icon: 'warning',
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            // delete
            var idx = type.indexOf('mmj_'),
            apitype = (idx >= 0 ? type.substring(idx + 4) : type) + '.php/',
            callback;

            switch (type) {
                case 'mmj_shows':
                    callback = loadShowInfo;
                    break;
                case 'mmj_songs':
                case 'songs':
                    callback = loadSongInfo;
                    break;
                default:
                    callback = null;
                    break;
            };

            $.ajax({
                url: apitype + id,
                type: 'delete',
                success: function (data) {
                    if (data == 'delete') {
                        if (callback != null)
                            callback(true);
                    }
                    else
                        swal('SQL Error', 'Error deleting record: ' + data, 'danger');
                },
                error: function (data, status, errorThrown) {
                    console.log('Error', data, status, errorThrown);
                    swal('Error', 'Error deleting record: ' + errorThrown, 'danger');
                },
            });
        }
    });
}

function editSpecificWork(sender, id, type, data) {
    // does extra work based on type of entity.
    console.log(sender, id, type, data);
    switch (type) {
        // SHOWS: just set setlist link URL
        case 'mmj_shows':
            $('#setlist_link').attr('href', '../admin/setlists.html?show=' + id);
            break;

        // SETLISTS: all work done here. Edit in-line.
        case 'mmj_setlists':
            var record = JSON.parse(data);
            if (record.length == 1)
                editSetlistInline(sender, id, record[0]);

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