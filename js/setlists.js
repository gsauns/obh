'use strict';

var rowcontrols = [
    '<input tabindex="~01" type="number" name="order" class="form-control grid-setlist-order" min="0">',
    '<select tabindex="~02" name="song_id" style="min-width:200px;"></select>',
    '<input tabindex="~03" type="text" name="length" class="form-control grid-setlist-length">',
    '<input tabindex="~04" type="checkbox" name="encore" class="form-control text-center">',
    '<input tabindex="~05" type="text" name="notes" class="form-control">'
];

$(document).ready(function() {
    var show_id = getParameterByName('show');
    loadSetlistinfo(show_id, false, false);

    initSelect2Setlist($('tfoot > tr'));

    $('#btnAdd').click(function () {
        var $row = $('tfoot > tr');
        submitSetlistRecord($row, true);
    });

    // edit row events
    $('#tblSetlist').on('click', 'td.edit-row-buttons > .save-btn', function (e) {
        var row = $(e.currentTarget).parents('tr');
        // TODO: get row values and post
        submitSetlistRecord($(row), false);


    });

    $('#tblSetlist').on('click', 'td.edit-row-buttons > .delete-btn', function (e) {
        var id = $(e.currentTarget).attr('item-id');

        swal({
            title: 'Delete Setlist Entry', 
            text: 'Are you sure you want to delete this song from the setlist?',
            icon: 'warning',
            buttons: true,
            dangerMode: true
        }).then((willDelete) => {
            if (willDelete) {
                // delete
                $.ajax({
                    url: 'setlists.php/' + id,
                    type: 'delete',
                    success: function (data) {
                        if (data == 'delete')
                            loadSetlistinfo(getParameterByName('show'), true, false);
                        else
                            swal('SQL Error', 'Error deleting entry: ' + data, 'danger');
                    },
                    error: function (data, status, errorThrown) {
                        console.log('Error', data, status, errorThrown);
                        swal('Error', 'Error deleting entry: ' + errorThrown, 'danger');
                    },
                })
            }
        });
    });

    $('#tblSetlist').on('click', 'td.edit-row-buttons > .cancel-btn', function () {
        loadSetlistinfo(getParameterByName('show'), true, false);
    });
});

function loadSetlistinfo (show_id, clearBody, clearNewRow) {
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
                        var row, dt;

                        $('#setlistTitle').text(result[0].headline);

                        for (var i = 0; i < result.length; i++) {
                            // don't show if it's just the Show info coming back and no setlist
                            if (result[i].id != null) {
                                var songlength = result[i]['length'] && result[i]['length'].length > 0 ? moment().startOf('day').seconds(result[i]['length']).format('m:ss') : null;
                                row = '<tr>' + 
                                    editColumn(result[i].id, 'mmj_setlists', false, '_', 'edit-row-buttons') +
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

            if (errstring.length > 0)
                swal('Error', 'There was an error: ' + errstring, 'danger');
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            alert('There was an error: ' + errorThrown);
        },
        complete: function () {
            $('div.spinner').remove();
        }
    });
}

function initSelect2Setlist($parent) {
    $parent.find('select[name="song_id"]').select2({
        ajax: {
            url: '../../api-search.php/songs/',
            dataType: 'json'
        },
        minimumInputLength: 1,
        placeholder: {
            // placeholder required for Select2 allowClear bug
            id: "",
            placeholder: "Song..."
        },
        allowClear: true,
        selectOnClose: true
    });
}

function editSetlistInline(sender, id, data) {
    // called from main.js when edit row is clicked
    var $tr         = $(sender).parents('tr:first'),
        $tds        = $tr.find('td'),
        $datatds    = $tr.find('td:not(:first)'),
        songname    = $datatds.length > 1 ? $datatds[1].innerText : null;
    
    $tds.empty();
    $('#tblSetlist button.edit-btn').prop('disabled', true);

    $($tds[0]).html(
        saveDeleteCancelButtons(data['id'], 'mmj_setlists') + 
        '<input type="hidden" name="id" value="' + data['id'] + '"/>'
    );

    for (var i = 0; i < $datatds.length; i++) {
        $($datatds[i]).html(rowcontrols[i].replace('~','1'));
    }

    initSelect2Setlist($tr);

    console.log(data);

    $tr.find('input[name="order"]').val(data['order']);
    //$tr.find('select[name="song_id"]').val(data['song_id']);
    var song    = new Option(songname, data['song_id'], true, true),
        obj     = { id: data['song_id'], text: songname },
        $sel    = $tr.find('select[name="song_id"]');

    $sel.append(song).trigger('change');
    $sel.trigger({
        type: 'select2:select',
        params: {
            data: obj
        }
    });

    var songlength = moment(data['length'], 'ss');
    if (songlength.isValid()) {
        $tr.find('input[name="length"]').val(songlength.format('m:ss'));
    }

    if (data['encore'] == "1") {
        $tr.find('input[name="encore"]').prop('checked', true);
    }
    
    $tr.find('input[name="notes"]').val(data['notes']);
}

function submitSetlistRecord($row, newrecord) {
    // send row
    var obj = {};

    obj['show_id'] = getParameterByName('show');
    obj['order'] = $row.find('input[name="order"]').val();
    obj['song_id'] = $row.find('select[name="song_id"]').val();
    obj['length'] = $row.find('input[name="length"]').val();
    obj['encore'] = $row.find('input[name="encore"]').is(':checked') ? 1 : 0;
    obj['notes'] = $row.find('input[name="notes"]').val();

    var id = $row.find('input[name="id"]').val();
    if (id != null)
        obj['id'] = id;

    // Validation & transform
    var valid   = true,
        reason  = '';

    // song - required
    if (isNaN(obj['song_id'])) {
        valid = false;
        reason = 'song id';
    }

    // order - required & numeric
    if (isNaN(obj['order'])) {
        valid = false;
        reason = 'order';
    }

    // length - must be valid m:ss moment. Transformed.
    if (obj['length'] && obj['length'].length > 0) {
        var songlength = moment(obj['length'], 'm:ss');
        if (songlength.isValid())
            obj['length'] = songlength.diff(moment().startOf('day'), 'seconds');
        else {
            valid = false;
            reason = 'song length';
        }
    }

    if (!valid)
        $.growl.error({ title: "Can't Save", message: 'Check on: ' + reason});

    else {
        $.ajax({
            url: 'setlists.php',
            data: JSON.stringify(obj),
            type: 'post',
            contentType: "application/json",
            success: function (data, status) {
                if (!isNaN(data)) {
                    // insert
                    $.growl.notice({ title: 'Saved', message: 'Added new song to show.'});
                    loadSetlistinfo(obj['show_id'], true, true);
                }
                else if (data == 'update') {
                    // update
                    $.growl.notice({ title: 'Saved', message: 'Setlist entry saved successfully.'});
                    loadSetlistinfo(obj['show_id'], true, false);
                }
                if (isNaN(data) && data != 'update') 
                    // error
                    $.growl.error({ title: 'Error', message: data});
            },
            error: function (data, status, errorThrown) {
                console.log('Error', data, status, errorThrown);
            }
        });
    }
}