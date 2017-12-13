'use strict';


$(document).ready(function() {
    loadShowInfo(null, false);
    newButtonType('Show');

    var $search = $('#searchShows');
    if ($search.length)
        singleSearchSelect2($search, 'shows');

    // show search select2
    $('div.search-group').on('change','#searchShows', function (e) {
        var ids = $(e.currentTarget).val();

        if (Array.isArray(ids)) {
            if (ids.length == 0)
                loadShowInfo(null, true);
            else {
                // call API and get selected songs only
                var showlist = ids.join(',');
                loadShowInfo('../../api.php/mmj_shows/' + showlist, true);
            }
        }
    });
});

function loadShowInfo (url, clearBody) {
    $('div.container').append('<div class="spinner"></div>');
    if (url == null)
        url = '../../api.php/mmj_shows';

    $.ajax({
        url: url,
        type: 'post',
        success: function (data, status) {
            var errstring   = '',
                $tbody      = $('#tblShows > tbody');

            if (status == 'success') {
                var result;
                try {
                    result = JSON.parse(data);

                    if (clearBody)
                        $tbody.empty();

                    if (Array.isArray(result) && result.length > 0) {
                        var row, dt;

                        for (var i = 0; i < result.length; i++) {
                            dt = new Date(result[i].date);

                            row = '<tr>' + 
                                editDeleteColumn(result[i].id, 'mmj_shows', true, result[i].headline) +
                                td(moment(result[i].date).format('MM/DD/YYYY')) +
                                td(result[i].headline) +
                                td(result[i].location) +
                                (result[i] && result[i].address.length > 0 ? 
                                    td('<a href="https://maps.google.com/maps?q=' + 
                                    result[i].address + 
                                    '" target="_blank">' + 
                                    result[i].address + 
                                    '</a>') : td(result[i].address)) +
                                td(result[i].notes) +
                                '</tr>';

                            $tbody.append(row);
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