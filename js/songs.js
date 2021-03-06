'use strict';

$(document).ready(function() {
    loadSongInfo(false);
    newButtonType('Song');
});

function loadSongInfo(clearBody) {
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
                                editColumn(result[i].id, 'songs', result[i].name) +
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
                alert('There was an error: ' + errstring);
        },
        error: function (data, status, errorThrown) {
            console.log('Error', data, status, errorThrown);
            alert('There was an error: ' + errorThrown);
        }

    });
}