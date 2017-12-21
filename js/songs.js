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

    $('#submitSearchSong').on('click', function () {
        var obj = {};

        var sids = $('#searchSongBySetlist').val(),
            start   = moment($('#startDate').val(), ['M/D/YYYY','M/D/YY']),
            end     = moment($('#endDate').val(), ['M/D/YYYY','M/D/YY']);

        if (Array.isArray(sids) && sids.length > 0) {
            obj['show_ids'] = sids;
            obj['showtype'] = $('input[name="showtype"]:checked').val();
        }

        if (start.isValid())
            obj['start'] = start.format('MM/DD/YYYY');

        if (end.isValid())
            obj['end'] = end.format('MM/DD/YYYY');
        
        if (!$.isEmptyObject(obj)) {
            $('div.container').append('<div class="spinner"></div>');
            $.ajax({
                url: '../../api-custom.php/searchsongs',
                data: JSON.stringify(obj),
                type: 'post',
                contentType: "application/json",
                success: function (data, status) {
                    songSuccess(data, status, true);
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
            songSuccess(data, status, clearBody);
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

function songSuccess (data, status, clearBody) {
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
}