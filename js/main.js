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
    var result      = '',
        itemname    = nameval === undefined ? '' : nameval.replace(/"/g,'&quot;');

    if (location.pathname.indexOf('admin/') > -1) {
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
    else {
        // custom view options
        if (api_path == "mmj_shows") {
            result = '<td class="'+ (classes == null ? '' : classes) + '">' + 
                        '<button item-id="' + id + 
                        '" item-type="setlists" ' +
                        '" item-name="' + itemname + 
                        '" class="btn btn-sm btn-warning" ' +
                        'onclick="retrieveSetlist(this)">' + 
                        'View Setlist</button></td>';
        }
        else if (api_path == "songs") {
            result = '<td class="'+ (classes == null ? '' : classes) + '">' + 
                '<button item-id="' + id + 
                '" item-type="songplays" ' +
                '" item-name="' + itemname + 
                '" class="btn btn-sm btn-warning" ' +
                'onclick="retrieveSongplays(this)">' + 
                'View Plays</button></td>';
        }
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

                        if (record.hasOwnProperty('google_place_id')) {
                            // has maps ID, get place info
                            var place_id = record['google_place_id'];
                            if (place_id && place_id.length > 0) {
                                $('#gmaps').val(record['location']);
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
                swal('Error', 'There was an error: ' + errstring, 'error');
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            swal('Error', 'There was an error: ' + errorThrown, 'error');
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
                    callback = function() { loadShowInfo(null, true); };
                    break;
                case 'mmj_songs':
                case 'songs':
                    callback = function() { loadSongInfo(null, true); };
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
                        if (callback)
                            callback();
                    }
                    else
                        swal('SQL Error', 'Error deleting record: ' + data, 'error');
                },
                error: function (data, status, errorThrown) {
                    console.log('Error', data, status, errorThrown);
                    swal('Error', 'Error deleting record: ' + errorThrown, 'error');
                },
            });
        }
    });
}

function editSpecificWork(sender, id, type, data) {
    // does extra work based on type of entity.
    // console.log(sender, id, type, data);
    switch (type) {
        // SHOWS: just set setlist link URL
        // - init Maps API
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
	$('p.help-block').not('.dont-clear-help').empty();
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

function retrieveSetlist(sender) {
    var id      = $(sender).attr('item-id'),
        name    = $(sender).attr('item-name'),
        promise = new Promise((resolve, reject) => {
            loadSetlistinfo(id, true, false, resolve, reject);
        });

    promise.then(function(setlistId) {
        if (setlistId) {
            $('#showModalLabel').text(name);
            $('#modalSetlist').modal('show');
        }
        else
            swal('Empty Setlist', 'No setlist entered for this show.', 'info');
    })
    .catch((reason) => {
        console.log('reject:', reason);
    });
}

function retrieveSongplays(sender) {
    var id      = $(sender).attr('item-id'),
        name    = $(sender).attr('item-name'),
        promise = new Promise((resolve, reject) => {
            loadSongplayInfo(id, true, false, resolve, reject);
        });

    promise.then(function(plays) {
        if (plays > 0) {
            $('#showModalLabel').text(name);
            $('#modalSongplays').modal('show');
        }
        else
            swal('Not Played', 'Song hasn\'t been played at a show.', 'info');
    })
    .catch((reason) => {
        console.log('reject:', reason);
    });
}

function singleSearchSelect2($sel, type,) {
    $sel.select2({
        ajax: {
            url: '../../api-search.php/' + type + '/',
            dataType: 'json'
        },
        minimumInputLength: 1,
        placeholder: {
            // placeholder required for Select2 allowClear bug
            id: "",
            placeholder: "Type to search"
        },
        allowClear: true,
        selectOnClose: true,
        language: {
            noResults: function () {
                return 'No matching ' + type + ' found.';
            }
        }
    });
}

// calls setlist API (custom) and builds out table
function loadSetlistinfo (show_id, clearBody, clearNewRow, resolve, reject) {
    $('div.container').append('<div class="spinner"></div>');

    if (clearNewRow) {
        var $footerCells = $('tfoot > tr > td');
        // TODO: increment order by 1
        $footerCells.find('input').val('')
        $footerCells.find('select[name="song_id"]').val('').trigger('change');
        $footerCells.find('input[name="encore"]').prop('checked', false);
    }

    $.ajax({
        url: '../../api-custom.php/setlists/' + show_id,
        type: 'post',
        success: function (data, status) {
            var errstring   = '',
                $tbody      = $('#tblSetlist > tbody');

            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);
                    console.log(result);

                    if (clearBody)
                        $tbody.empty();

                    if (Array.isArray(result) && result.length > 0) {
                        var row, dt, songlength;

                        $('#setlistTitle').text(result[0].headline);

                        for (var i = 0; i < result.length; i++) {
                            // don't show if it's just the Show info coming back and no setlist
                            if (result[i].id != null) {
                                songlength = result[i]['length'] && result[i]['length'].length > 0 ? moment().startOf('day').seconds(result[i]['length']).format('m:ss') : null;
                                row = '<tr>' + 
                                    editDeleteColumn(result[i].id, 'mmj_setlists', false, '_', 'edit-row-buttons') +
                                    td(result[i].order) +
                                    td(result[i].name) +
                                    td(songlength) +
                                    td(result[i].encore == '1' ? 'Y' : null) +
                                    td(result[i].notes) +
                                    '</tr>';

                                $tbody.append(row);
                            }
                        }
                    }
                }
                catch (ex) {
                    errstring = ex.message;
                }
            }
            else 
                errstring = status;

            if (errstring.length > 0) {
                if (reject)
                    reject(errstring);

                swal('Error', 'There was an error: ' + errstring, 'error');
            }
            else if (resolve)
                resolve((result.length > 0 ? result[0].id : null));
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);

            if (reject)
                reject(errorThrown);
            
            swal('Error', 'There was an error: ' + errorThrown, 'error');
        },
        complete: function () {
            $('div.spinner').remove();
        }
    });
}

function loadSongplayInfo (song_id, clearBody, clearNewRow, resolve, reject) {
    $('div.container').append('<div class="spinner"></div>');

    if (clearNewRow) {
        var $footerCells = $('tfoot > tr > td');
        // TODO: increment order by 1
        $footerCells.find('input').val('')
        $footerCells.find('select[name="song_id"]').val('').trigger('change');
        $footerCells.find('input[name="encore"]').prop('checked', false);
    }

    $.ajax({
        url: '../../api-custom.php/songplays/' + song_id,
        type: 'post',
        success: function (data, status) {
            var errstring   = '',
                $tbody      = $('#tblSongplays > tbody');

            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);
                    console.log(result);

                    if (clearBody)
                        $tbody.empty();

                    if (Array.isArray(result) && result.length > 0) {
                        var row, songlength;

                        for (var i = 0; i < result.length; i++) {
                            // don't show if it's just the Show info coming back and no setlist
                            if (result[i].id != null) {
                                songlength = result[i]['length'] && result[i]['length'].length > 0 ? moment().startOf('day').seconds(result[i]['length']).format('m:ss') : null;

                                row = '<tr>' + 
                                    editDeleteColumn(result[i].id, 'songplays', false) +
                                    td(moment(result[i].date).format('MM/DD/YYYY')) +
                                    td(result[i].headline) +
                                    td(result[i].order) +
                                    td(songlength) +
                                    td(result[i].encore == '1' ? 'Y' : null) +
                                    td(result[i].notes) +
                                    '</tr>';

                                $tbody.append(row);
                            }
                        }
                    }
                }
                catch (ex) {
                    errstring = ex.message;
                }
            }
            else 
                errstring = status;

            if (errstring.length > 0) {
                if (reject)
                    reject(errstring);

                swal('Error', 'There was an error: ' + errstring, 'error');
            }
            else if (resolve)
                resolve(result.length);
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);

            if (reject)
                reject(errorThrown);
            
            swal('Error', 'There was an error: ' + errorThrown, 'error');
        },
        complete: function () {
            $('div.spinner').remove();
        }
    });
}