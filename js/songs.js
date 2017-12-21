'use strict';

var blockLoad = false;
search_callback = loadSongInfo;

$(document).ready(function() {
    loadSongInfo(null, false);
    newButtonType('Song');

    var $search = $('#searchSongs');
    if ($search.length)
        singleSearchSelect2($search, 'songs');

    var $songBySetlist = $('#searchSongBySetlist');
    if ($songBySetlist.length)
        singleSearchSelect2($songBySetlist, 'shows');

    // show search select2
    $('div.search-group').on('change','#searchSongBySetlist', function (e) {
        var ids     = $(e.currentTarget).val(),
            $others = $('select.s2-primary').not(this);

        if (blockLoad)
            // block a full call; cleared by other control.
            blockLoad = false;
        else if (Array.isArray(ids)) {
            if (ids.length == 0)
                loadSongInfo(null, true);
            else {
                // call API and get selected songs only
                var showlist = ids.join(',');
                loadSongInfo('../../api-custom.php/songsbyshows/' + showlist, true);
            }
        }

        // if there's a value and there are other select2's, clear em.
        if ($others && ids && ids.length > 0) {
            blockLoad = true;
            $others.val(null).trigger('change');
        }
    });
});

function loadSongInfo(url, clearBody) {
    $('div.container').append('<div class="spinner"></div>');
    if (url == null)
        url = '../../api.php/songs';

    $.ajax({
        url: url,
        type: 'post',
        success: function (data, status) {
            if (status == 'success') {
                var errstring   = '',
                    $tbody      = $('#tblSongs > tbody'),
                    result;

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