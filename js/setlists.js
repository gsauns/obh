'use strict';


$(document).ready(function() {
    var show_id = getParameterByName('show');
    loadSetlistinfo(show_id, false, false);

    initSelect2Setlist();

    $('#btnAdd').click(function () {
        var $row = $('tfoot > tr');
        submitSetlistRecord($row, true);
    });
});

function loadSetlistinfo (show_id, clearBody, clearNewRow) {
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
                $tbody      = $('#tblShows > tbody');

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
                                    editColumn(result[i].id, 'mmj_setlists', 'xyz') +
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
                alert('There was an error: ' + errstring);
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            alert('There was an error: ' + errorThrown);
        }

    });
}

function initSelect2Setlist() {
    $('select[name="song_id"]').select2({
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
        allowClear: true
    });
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
        obj['id'] = $row.find('input[name="notes"]').val();

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
        console.log('songlength',songlength);
        if (songlength.isValid())
            obj['length'] = songlength.diff(moment().startOf('day'), 'seconds');
        else {
            valid = false;
            reason = 'song length';
        }
    }

    if (!valid)
        alert('invalid: ' + reason);

    else {
        $.ajax({
            url: 'setlists.php',
            data: JSON.stringify(obj),
            type: 'post',
            contentType: "application/json",
            success: function (data, status) {
                // if (!isNaN(data)) {
                //     // insert
                //     $messagep.addClass('bg-success').html("New " + entity + " successfully created.");
                //     $("input#form_id").val(data);
                // }
                // else if (data == 'update')
                //     // update
                //     $messagep.addClass('bg-success').html(entity + " saved.");
                if (isNaN(data) && data != 'update') 
                    // error
                    $messagep.addClass('bg-danger').html("Error saving song.<br>" + data);
                    
                var show_id = getParameterByName('show');
                // clear edit row on insert only
                loadSetlistinfo(show_id, true, !isNaN(data));
            },
            error: function (data, status, errorThrown) {
                console.log('Error', data, status, errorThrown);
            }
        });
    }
}