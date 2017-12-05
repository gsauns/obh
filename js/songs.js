'use strict';

$(document).ready(function() {
    loadSongInfo(false);
    newButtonType('Song');
});

function loadSongInfo(clearBody) {
    $('div.container').append('<div class="spinner"></div>');

    $.ajax({
        url: '../../api.php/songs',
        type: 'post',
        success: function (data, status) {
            var errstring   = '',
                $tbody      = $('#tblSongs > tbody');

            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);

                    if (clearBody)
                        $tbody.empty();
                    
                    if (Array.isArray(result) && result.length > 0) {
                        var row, dt;

                        for (var i = 0; i < result.length; i++) {
                            row = '<tr item-id="' + result[i].id + '">' + 
                                editDeleteColumn(result[i].id, 'songs', true, result[i].name + (result[i].original_artist != null && result[i].original_artist.length > 0 ? ' (' + result[i].original_artist + ')' : ''))  +
                                td(result[i].name) +
                                td(result[i].original_artist) +
                                td(result[i].original_album) +
                                td(result[i].year_released) +
                                td(result[i].times_played) +
                                '</tr>';

                            $tbody.append(row);
                        }
                    }
                    else
                        $tbody.append(emptyRow(5));
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
        },
        complete: function () {
            $('div.spinner').remove();
        }
    });
}