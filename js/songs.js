'use strict';

$(document).ready(function() {
    loadSongInfo(false);
    newButtonType('Song');

    var $search = $('#searchSongs');
    if ($search.length)
        songSelect2($search);

    // song search select2
    $('div.search-group').on('change','#searchSongs', function (e) {
        var song_ids = $(e.currentTarget).val();

        if (Array.isArray(song_ids)) {
            if (song_ids.length == 0)
                loadSongInfo(true);
            else {
                // call API and get selected songs only
                var songlist = song_ids.join(',');
                $.ajax({
                    url: '../../api.php/songs/' + songlist,
                    type: 'post',
                    success: function (data, status) {
                        var errstring   = '',
                            clearBody   = true,
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
                                    $tbody.append(emptyRow(6));
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
                    },
                    complete: function () {
                        $('div.spinner').remove();
                    }
                });
            }
        }
    });
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
                        $tbody.append(emptyRow(6));
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
        },
        complete: function () {
            $('div.spinner').remove();
        }
    });
}